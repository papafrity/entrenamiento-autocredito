import React, { useState, useEffect } from 'react';
import { X, Key, CheckCircle, ExternalLink, ShieldCheck, Database, Info } from 'lucide-react';
import { getApiKey, saveApiKey } from '../services/geminiService';
import { getFirebaseConfig, saveFirebaseConfig, isFirebaseActive } from '../services/firebase';

export default function SettingsModal({ isOpen, onClose, onKeySaved }) {
  // Gemini State
  const [inputKey, setInputKey] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Firebase Config State
  const [fbApiKey, setFbApiKey] = useState('');
  const [fbProjectId, setFbProjectId] = useState('');
  const [fbAuthDomain, setFbAuthDomain] = useState('');
  const [fbStorageBucket, setFbStorageBucket] = useState('');
  const [fbMessagingSenderId, setFbMessagingSenderId] = useState('');
  const [fbAppId, setFbAppId] = useState('');
  const [firebaseActive, setFirebaseActive] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setInputKey(getApiKey());
      setFirebaseActive(isFirebaseActive());
      
      const fbConfig = getFirebaseConfig();
      if (fbConfig) {
        setFbApiKey(fbConfig.apiKey || '');
        setFbProjectId(fbConfig.projectId || '');
        setFbAuthDomain(fbConfig.authDomain || '');
        setFbStorageBucket(fbConfig.storageBucket || '');
        setFbMessagingSenderId(fbConfig.messagingSenderId || '');
        setFbAppId(fbConfig.appId || '');
      }
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    saveApiKey(inputKey);

    if (fbApiKey.trim() && fbProjectId.trim()) {
      const config = {
        apiKey: fbApiKey.trim(),
        projectId: fbProjectId.trim(),
        authDomain: fbAuthDomain.trim(),
        storageBucket: fbStorageBucket.trim(),
        messagingSenderId: fbMessagingSenderId.trim(),
        appId: fbAppId.trim()
      };
      saveFirebaseConfig(config);
    } else if (!fbApiKey.trim() && !fbProjectId.trim()) {
      saveFirebaseConfig(null);
    }

    setSavedSuccess(true);
    setTimeout(() => {
      onKeySaved();
      onClose();
    }, 800);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1200,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '560px', padding: '24px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ background: 'rgba(255, 159, 28, 0.15)', padding: '10px', borderRadius: '12px' }}>
            <Key size={24} color="var(--primary)" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Configuración de Llaves e IA</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Configurá tu Gemini API y sincronización de base de datos</p>
          </div>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* SECCIÓN 1: GEMINI API KEY */}
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              🤖 Google Gemini API (Chatbot)
            </h3>
            
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
              Gemini API Key:
            </label>
            <input 
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="AIzaSy..."
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                outline: 'none',
                marginBottom: '8px'
              }}
            />
            <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" style={{ fontSize: '0.78rem', color: 'var(--secondary)', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'underline' }}>
              Obtener clave API gratuita de Google AI Studio <ExternalLink size={12} />
            </a>
          </div>

          {/* SECCIÓN 2: FIREBASE CONFIG */}
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Database size={16} /> Firebase Firestore (Sincronización de Equipo)
            </h3>

            <div style={{ 
              background: firebaseActive ? 'rgba(46, 196, 182, 0.08)' : 'rgba(0, 0, 0, 0.2)',
              border: firebaseActive ? '1px solid rgba(46, 196, 182, 0.25)' : '1px solid var(--border-color)',
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.78rem',
              color: firebaseActive ? 'var(--accent-green)' : 'var(--text-muted)',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Info size={14} />
              <span>
                {firebaseActive 
                  ? '🟢 Sincronización en la nube ACTIVA (Proyecto: entrenador-autocredito). Las reservas y medallas se comparten con todos los celulares.' 
                  : '⚪ Modo local activo.'
                }
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '8px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Firebase API Key:</label>
                <input 
                  type="text"
                  value={fbApiKey}
                  onChange={(e) => setFbApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.82rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Project ID:</label>
                <input 
                  type="text"
                  value={fbProjectId}
                  onChange={(e) => setFbProjectId(e.target.value)}
                  placeholder="entrenador-autocredito"
                  style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.82rem' }}
                />
              </div>
            </div>
          </div>

          {savedSuccess && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-green)', fontSize: '0.88rem' }}>
              <CheckCircle size={18} /> ¡Configuración guardada correctamente! Reiniciando...
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Guardar Cambios
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
