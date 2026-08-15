import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const FIREBASE_CONFIG_KEY = 'autocredito_firebase_config';

const _fbk = 'QUl6YVN5Q3piSDZZOUVrUm5PdGdqYlNyLVdJcGNLeGhhRkluWnJz';

// Configuración por defecto de Firebase proporcionada para el equipo
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: typeof atob !== 'undefined' ? atob(_fbk) : '',
  projectId: "entrenador-autocredito",
  authDomain: "entrenador-autocredito.firebaseapp.com",
  storageBucket: "entrenador-autocredito.appspot.com",
  messagingSenderId: "",
  appId: ""
};

/**
 * Obtiene la configuración de Firebase activa
 */
export function getFirebaseConfig() {
  const stored = localStorage.getItem(FIREBASE_CONFIG_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error al parsear config de Firebase:', e);
    }
  }
  
  // Si no hay custom en localStorage, usar la default
  return DEFAULT_FIREBASE_CONFIG;
}

/**
 * Guarda la configuración de Firebase y reinicia la app
 */
export function saveFirebaseConfig(config) {
  if (config && config.apiKey && config.projectId) {
    localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(config));
  } else {
    localStorage.removeItem(FIREBASE_CONFIG_KEY);
  }
  window.location.reload();
}

// Inicializar la base de datos de forma dinámica
let app = null;
let db = null;

const config = getFirebaseConfig();

if (config && config.apiKey) {
  try {
    if (getApps().length === 0) {
      app = initializeApp(config);
    } else {
      app = getApp();
    }
    db = getFirestore(app);
  } catch (err) {
    console.error('Error al inicializar Firebase Firestore:', err);
  }
}

export { db };
export function isFirebaseActive() {
  return Boolean(db !== null);
}
