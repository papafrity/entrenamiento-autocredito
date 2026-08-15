import { INITIAL_TEAM_MEMBERS, INITIAL_CAR_RESERVATIONS, BADGES_CATALOG } from '../data/teamData';

const TEAM_STORAGE_KEY = 'autocredito_team_members';
const RESERVATIONS_STORAGE_KEY = 'autocredito_car_reservations';
const CURRENT_USER_KEY = 'autocredito_current_user_profile';

// Canal de sincronización en tiempo real para pestañas abiertas y dispositivos en la misma red
const broadcastChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('autocredito_sync_channel') : null;

/**
 * Obtiene la lista de miembros del equipo y su ranking
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
export function saveTeamMembers(members) {
  localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(members));
  broadcastChannel?.postMessage({ type: 'TEAM_UPDATED', payload: members });
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
 * Agrega una nueva reserva verificando que no haya choque de horarios
 */
export function addCarReservation(newReservation) {
  const reservations = getCarReservations();

  // Validar choque de horarios en la misma fecha
  const conflict = reservations.find(r => {
    if (r.date !== newReservation.date) return false;
    
    // Comparar rangos de horas (ej: "15:00" <= "16:00")
    const newStart = newReservation.startTime;
    const newEnd = newReservation.endTime;
    const existingStart = r.startTime;
    const existingEnd = r.endTime;

    // Hay solapamiento si: nuevoInicio < existenteFin Y nuevoFin > existenteInicio
    return (newStart < existingEnd && newEnd > existingStart);
  });

  if (conflict) {
    throw new Error(`¡Choque de horario! El auto ya está reservado por ${conflict.advisorName} el ${conflict.date} de ${conflict.startTime} a ${conflict.endTime} hs.`);
  }

  const reservationWithId = {
    ...newReservation,
    id: 'res_' + Date.now()
  };

  const updated = [reservationWithId, ...reservations];
  localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(updated));
  broadcastChannel?.postMessage({ type: 'RESERVATIONS_UPDATED', payload: updated });

  // Sumar puntos y verificar insignia de piloto
  awardPointsToCurrentUser(50, 'car_pilot');

  return reservationWithId;
}

/**
 * Elimina una reserva del vehículo
 */
export function deleteCarReservation(id) {
  const reservations = getCarReservations();
  const updated = reservations.filter(r => r.id !== id);
  localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(updated));
  broadcastChannel?.postMessage({ type: 'RESERVATIONS_UPDATED', payload: updated });
  return updated;
}

/**
 * Obtiene el perfil del usuario actual
 */
export function getCurrentUserProfile() {
  const data = localStorage.getItem(CURRENT_USER_KEY);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
  }
  const defaultUser = {
    id: 'user_current',
    name: 'Mi Asesor (Tú)',
    avatar: '👨‍💼',
    branch: 'Sucursal Central',
    phone: '11-3344-5566'
  };
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(defaultUser));
  return defaultUser;
}

/**
 * Actualiza el perfil del usuario actual
 */
export function updateCurrentUserProfile(profile) {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
  
  // Actualizar también en el listado del equipo
  const team = getTeamMembers();
  const index = team.findIndex(t => t.id === 'user_current');
  if (index !== -1) {
    team[index].name = profile.name;
    team[index].avatar = profile.avatar;
    team[index].branch = profile.branch;
    saveTeamMembers(team);
  }
}

/**
 * Otorga puntos e insignias al usuario actual
 */
export function awardPointsToCurrentUser(pointsToAdd, badgeToUnlock = null) {
  const team = getTeamMembers();
  const index = team.findIndex(t => t.id === 'user_current');
  
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

    saveTeamMembers(team);
    return user;
  }
}

/**
 * Suscriptor en tiempo real a eventos de sincronización
 */
export function subscribeToRealtimeUpdates(callback) {
  if (!broadcastChannel) return () => {};

  const handler = (event) => {
    callback(event.data);
  };

  broadcastChannel.addEventListener('message', handler);
  return () => broadcastChannel.removeEventListener('message', handler);
}
