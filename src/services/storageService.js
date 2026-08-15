import { INITIAL_TEAM_MEMBERS, INITIAL_CAR_RESERVATIONS } from '../data/teamData';
import { db, isFirebaseActive } from './firebase';
import { collection, doc, setDoc, getDocs, onSnapshot, updateDoc, deleteDoc } from 'firebase/firestore';

const TEAM_STORAGE_KEY = 'autocredito_team_members';
const RESERVATIONS_STORAGE_KEY = 'autocredito_car_reservations';
const ACTIVE_ADVISOR_ID_KEY = 'autocredito_active_advisor_id';

const broadcastChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('autocredito_sync_channel') : null;

// Callbacks para eventos en tiempo real
let onSyncCallback = null;

// Si Firebase está activo, sincronizar en tiempo real desde la nube
if (isFirebaseActive()) {
  try {
    // Escuchar cambios de reservas en Firestore
    onSnapshot(collection(db, 'reservations'), (snapshot) => {
      const list = [];
      snapshot.forEach(doc => list.push({ ...doc.data(), id: doc.id }));
      localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(list));
      onSyncCallback?.({ type: 'RESERVATIONS_UPDATED', payload: list });
    });

    // Escuchar cambios de equipo en Firestore
    onSnapshot(collection(db, 'advisors'), (snapshot) => {
      const list = [];
      snapshot.forEach(doc => list.push(doc.data()));
      if (list.length > 0) {
        localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(list));
        onSyncCallback?.({ type: 'TEAM_UPDATED', payload: list });
      }
    });
  } catch (err) {
    console.error('Error al suscribir listeners en Firestore:', err);
  }
}

/**
 * Obtiene la lista de miembros del equipo
 */
export function getTeamMembers() {
  const data = localStorage.getItem(TEAM_STORAGE_KEY);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
  }
  localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(INITIAL_TEAM_MEMBERS));
  return INITIAL_TEAM_MEMBERS;
}

/**
 * Guarda y emite cambios en el equipo
 */
export async function saveTeamMembers(members) {
  localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(members));
  broadcastChannel?.postMessage({ type: 'TEAM_UPDATED', payload: members });

  if (isFirebaseActive()) {
    try {
      // Subir cada miembro a Firestore
      for (const m of members) {
        await setDoc(doc(db, 'advisors', m.id), m);
      }
    } catch (err) {
      console.error('Error al guardar equipo en Firestore:', err);
    }
  }
}

/**
 * Obtiene el ID del asesor activo
 */
export function getActiveAdvisorId() {
  const activeId = localStorage.getItem(ACTIVE_ADVISOR_ID_KEY);
  if (activeId) return activeId;
  return 'user_current';
}

/**
 * Establece el asesor activo
 */
export function setActiveAdvisorId(id) {
  localStorage.setItem(ACTIVE_ADVISOR_ID_KEY, id);
  broadcastChannel?.postMessage({ type: 'USER_SWITCHED', payload: id });
}

/**
 * Obtiene el perfil del usuario actual
 */
export function getCurrentUserProfile() {
  const activeId = getActiveAdvisorId();
  const team = getTeamMembers();
  const found = team.find(t => t.id === activeId);
  if (found) return found;

  const defaultUser = {
    id: 'user_current',
    name: 'Mi Asesor (Tú)',
    avatar: '👨‍💼',
    branch: 'Sucursal Central',
    phone: '11-3344-5566',
    points: 320,
    simulationsCompleted: 4,
    unlockedBadges: ['esceptico_master', 'apurado_master']
  };
  return defaultUser;
}

/**
 * Registra un nuevo asesor
 */
export async function registerNewAdvisor({ name, branch, phone, avatar }) {
  const team = getTeamMembers();
  const newId = 'adv_' + Date.now();
  
  const newAdvisor = {
    id: newId,
    name: name.trim(),
    branch: branch.trim() || 'Sucursal Central',
    phone: phone.trim() || 'Sin teléfono',
    avatar: avatar || '👨‍💼',
    points: 100,
    simulationsCompleted: 0,
    unlockedBadges: []
  };

  const updatedTeam = [...team, newAdvisor];
  await saveTeamMembers(updatedTeam);
  setActiveAdvisorId(newId);
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
  const activeId = getActiveAdvisorId();
  const index = team.findIndex(t => t.id === activeId);
  
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
}

/**
 * Obtiene las reservas del vehículo
 */
export function getCarReservations() {
  const data = localStorage.getItem(RESERVATIONS_STORAGE_KEY);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
  }
  localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(INITIAL_CAR_RESERVATIONS));
  return INITIAL_CAR_RESERVATIONS;
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
    id: newId
  };

  const updated = [reservationWithId, ...reservations];
  localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(updated));
  broadcastChannel?.postMessage({ type: 'RESERVATIONS_UPDATED', payload: updated });

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
 * Suscriptor en tiempo real
 */
export function subscribeToRealtimeUpdates(callback) {
  onSyncCallback = callback;
  
  if (broadcastChannel) {
    const handler = (event) => {
      callback(event.data);
    };
    broadcastChannel.addEventListener('message', handler);
    return () => {
      broadcastChannel.removeEventListener('message', handler);
      onSyncCallback = null;
    };
  }
  
  return () => {
    onSyncCallback = null;
  };
}
