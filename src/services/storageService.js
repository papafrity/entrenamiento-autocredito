import { INITIAL_TEAM_MEMBERS, INITIAL_CAR_RESERVATIONS } from '../data/teamData';
import { db, isFirebaseActive } from './firebase';
import { collection, doc, setDoc, getDocs, onSnapshot, updateDoc, deleteDoc } from 'firebase/firestore';

const TEAM_STORAGE_KEY = 'autocredito_team_members_v2';
const RESERVATIONS_STORAGE_KEY = 'autocredito_car_reservations_v2';
const ACTIVE_ADVISOR_ID_KEY = 'autocredito_active_advisor_id';
const PITCH_HISTORY_KEY = 'autocredito_pitch_history_v1';

const broadcastChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('autocredito_sync_channel') : null;

// Lista de suscriptores para notificaciones en tiempo real
const syncListeners = new Set();

function notifyAllListeners(event) {
  syncListeners.forEach(cb => {
    try {
      cb(event);
    } catch (e) {
      console.error('Error in sync listener callback:', e);
    }
  });
}

// Inicializar listeners en tiempo real de Firestore
if (isFirebaseActive()) {
  try {
    // Escuchar reservas en tiempo real
    onSnapshot(collection(db, 'reservations'), (snapshot) => {
      const list = [];
      snapshot.forEach(d => list.push({ ...d.data(), id: d.id }));
      localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(list));
      notifyAllListeners({ type: 'RESERVATIONS_UPDATED', payload: list });
    }, (err) => {
      console.warn('Firestore reservations snapshot warning:', err);
    });

    // Escuchar asesores en tiempo real
    onSnapshot(collection(db, 'advisors'), (snapshot) => {
      const list = [];
      snapshot.forEach(d => {
        const data = d.data();
        if (data && data.id) {
          list.push(data);
        }
      });
      if (list.length > 0) {
        localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(list));
        notifyAllListeners({ type: 'TEAM_UPDATED', payload: list });
      }
    }, (err) => {
      console.warn('Firestore advisors snapshot warning:', err);
    });
  } catch (err) {
    console.error('Error al inicializar Firestore realtime listeners:', err);
  }
}

/**
 * Fuerza una sincronización explícita y completa con Firestore
 */
export async function syncFromCloud() {
  if (!isFirebaseActive()) return { advisors: getTeamMembers(), reservations: getCarReservations() };

  try {
    // 1. Obtener asesores de Firestore
    const advisorsSnap = await getDocs(collection(db, 'advisors'));
    const cloudAdvisors = [];
    advisorsSnap.forEach(d => {
      const data = d.data();
      if (data && data.id) cloudAdvisors.push(data);
    });

    if (cloudAdvisors.length > 0) {
      // Fusionar con asesores locales si alguno no se subió aún
      const localAdvisors = getTeamMembers();
      const mergedMap = new Map();
      cloudAdvisors.forEach(a => mergedMap.set(a.id, a));
      localAdvisors.forEach(a => {
        if (!mergedMap.has(a.id)) {
          mergedMap.set(a.id, a);
          // Subir a la nube
          setDoc(doc(db, 'advisors', a.id), a).catch(console.error);
        }
      });
      const finalList = Array.from(mergedMap.values());
      localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(finalList));
      notifyAllListeners({ type: 'TEAM_UPDATED', payload: finalList });
    }

    // 2. Obtener reservas de Firestore
    const reservationsSnap = await getDocs(collection(db, 'reservations'));
    const cloudReservations = [];
    reservationsSnap.forEach(d => {
      cloudReservations.push({ ...d.data(), id: d.id });
    });

    if (cloudReservations.length > 0) {
      localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(cloudReservations));
      notifyAllListeners({ type: 'RESERVATIONS_UPDATED', payload: cloudReservations });
    }

    return {
      advisors: getTeamMembers(),
      reservations: getCarReservations()
    };
  } catch (err) {
    console.error('Error al sincronizar con Firestore:', err);
    return {
      advisors: getTeamMembers(),
      reservations: getCarReservations()
    };
  }
}

/**
 * Obtiene la lista de miembros del equipo
 */
export function getTeamMembers() {
  const data = localStorage.getItem(TEAM_STORAGE_KEY);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      return parsed.filter(m => m.id && !m.id.startsWith('dummy_'));
    } catch (e) {
      console.error(e);
    }
  }
  return [];
}

/**
 * Guarda miembros del equipo y asegura sincronización con la nube
 */
export async function saveTeamMembers(members) {
  localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(members));
  broadcastChannel?.postMessage({ type: 'TEAM_UPDATED', payload: members });
  notifyAllListeners({ type: 'TEAM_UPDATED', payload: members });

  if (isFirebaseActive()) {
    try {
      await Promise.all(members.map(m => setDoc(doc(db, 'advisors', m.id), m)));
    } catch (err) {
      console.error('Error al guardar asesores en Firestore:', err);
    }
  }
}

/**
 * Obtiene el ID del asesor activo
 */
export function getActiveAdvisorId() {
  return localStorage.getItem(ACTIVE_ADVISOR_ID_KEY) || null;
}

/**
 * Establece el asesor activo
 */
export function setActiveAdvisorId(id) {
  if (id) {
    localStorage.setItem(ACTIVE_ADVISOR_ID_KEY, id);
  } else {
    localStorage.removeItem(ACTIVE_ADVISOR_ID_KEY);
  }
  broadcastChannel?.postMessage({ type: 'USER_SWITCHED', payload: id });
  notifyAllListeners({ type: 'USER_SWITCHED', payload: id });
}

/**
 * Obtiene el perfil del usuario actual
 */
export function getCurrentUserProfile() {
  const activeId = getActiveAdvisorId();
  const team = getTeamMembers();
  if (activeId) {
    const found = team.find(t => t.id === activeId);
    if (found) return found;
  }
  if (team.length > 0) {
    return team[0];
  }
  return null;
}

/**
 * Registra un nuevo asesor y lo sube inmediatamente a Firestore
 */
export async function registerNewAdvisor({ name, provincia, branch, phone, avatar, role }) {
  const team = getTeamMembers();
  const newId = 'adv_' + Date.now();
  
  const newAdvisor = {
    id: newId,
    name: name.trim(),
    role: role || 'PAI', // 'PAI' (Asesor) o 'PAOI' (Supervisor / Organizador)
    provincia: provincia?.trim() || '',
    branch: branch?.trim() || 'Sucursal Central',
    phone: phone?.trim() || 'Sin teléfono',
    avatar: avatar || '👨‍💼',
    points: 100,
    simulationsCompleted: 0,
    salesClosed: 0,
    unlockedBadges: ['welcome_badge'],
    createdAt: new Date().toISOString()
  };

  const updatedTeam = [...team, newAdvisor];
  localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(updatedTeam));
  setActiveAdvisorId(newId);
  notifyAllListeners({ type: 'TEAM_UPDATED', payload: updatedTeam });

  if (isFirebaseActive()) {
    try {
      await setDoc(doc(db, 'advisors', newId), newAdvisor);
    } catch (err) {
      console.error('Error al registrar asesor en Firestore:', err);
    }
  }

  return newAdvisor;
}

/**
 * Actualiza el perfil del usuario actual
 */
export async function updateCurrentUserProfile(profile) {
  const team = getTeamMembers();
  const activeId = getActiveAdvisorId();
  const index = team.findIndex(t => t.id === activeId);
  
  if (index !== -1) {
    team[index] = { ...team[index], ...profile };
    await saveTeamMembers(team);
  }
}

/**
 * Otorga puntos e insignias
 */
export async function awardPointsToCurrentUser(pointsToAdd, badgeToUnlock = null) {
  const team = getTeamMembers();
  const activeUser = getCurrentUserProfile();
  if (!activeUser) return null;

  const index = team.findIndex(t => t.id === activeUser.id);
  
  if (index !== -1) {
    const user = team[index];
    user.points = (user.points || 0) + pointsToAdd;
    user.simulationsCompleted = (user.simulationsCompleted || 0) + (pointsToAdd >= 50 && !badgeToUnlock?.includes('car') ? 1 : 0);

    if (badgeToUnlock && !user.unlockedBadges.includes(badgeToUnlock)) {
      user.unlockedBadges.push(badgeToUnlock);
    }

    if (user.points >= 500 && !user.unlockedBadges.includes('closer_star')) {
      user.unlockedBadges.push('closer_star');
    }

    await saveTeamMembers(team);
    return user;
  }
  return null;
}

/**
 * Obtiene las reservas del vehículo
 */
export function getCarReservations() {
  const data = localStorage.getItem(RESERVATIONS_STORAGE_KEY);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      return parsed.filter(r => r.id && !r.id.startsWith('dummy_'));
    } catch (e) {
      console.error(e);
    }
  }
  return [];
}

/**
 * Agrega una nueva reserva
 */
export async function addCarReservation(newReservation) {
  const reservations = getCarReservations();

  const conflict = reservations.find(r => {
    if (r.date !== newReservation.date) return false;
    
    const newStart = newReservation.startTime;
    const newEnd = newReservation.endTime;
    const existingStart = r.startTime;
    const existingEnd = r.endTime;

    return (newStart < existingEnd && newEnd > existingStart);
  });

  if (conflict) {
    throw new Error(`¡Choque de horario! El auto ya está reservado por ${conflict.advisorName} el ${conflict.date} de ${conflict.startTime} a ${conflict.endTime} hs.`);
  }

  const newId = 'res_' + Date.now();
  const reservationWithId = {
    ...newReservation,
    id: newId,
    createdAt: new Date().toISOString()
  };

  const updated = [reservationWithId, ...reservations];
  localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(updated));
  broadcastChannel?.postMessage({ type: 'RESERVATIONS_UPDATED', payload: updated });
  notifyAllListeners({ type: 'RESERVATIONS_UPDATED', payload: updated });

  if (isFirebaseActive()) {
    try {
      await setDoc(doc(db, 'reservations', newId), reservationWithId);
    } catch (err) {
      console.error('Error al guardar reserva en Firestore:', err);
    }
  }

  await awardPointsToCurrentUser(50, 'car_pilot');
  return reservationWithId;
}

/**
 * Elimina una reserva
 */
export async function deleteCarReservation(id) {
  const reservations = getCarReservations();
  const updated = reservations.filter(r => r.id !== id);
  localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(updated));
  broadcastChannel?.postMessage({ type: 'RESERVATIONS_UPDATED', payload: updated });
  notifyAllListeners({ type: 'RESERVATIONS_UPDATED', payload: updated });

  if (isFirebaseActive()) {
    try {
      await deleteDoc(doc(db, 'reservations', id));
    } catch (err) {
      console.error('Error al eliminar reserva en Firestore:', err);
    }
  }

  return updated;
}

/**
 * Historial de evaluaciones de Pitch de 60 Segundos
 */
export function getPitchHistory() {
  const data = localStorage.getItem(PITCH_HISTORY_KEY);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
  }
  return [];
}

export function savePitchResult(result) {
  const history = getPitchHistory();
  const updated = [result, ...history.slice(0, 49)];
  localStorage.setItem(PITCH_HISTORY_KEY, JSON.stringify(updated));
  return updated;
}

/**
 * Suscriptor en tiempo real con soporte múltiple
 */
export function subscribeToRealtimeUpdates(callback) {
  syncListeners.add(callback);
  
  if (broadcastChannel) {
    const handler = (event) => {
      callback(event.data);
    };
    broadcastChannel.addEventListener('message', handler);
    return () => {
      syncListeners.delete(callback);
      broadcastChannel.removeEventListener('message', handler);
    };
  }
  
  return () => {
    syncListeners.delete(callback);
  };
}
