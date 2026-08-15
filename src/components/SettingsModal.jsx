import React, { useState, useEffect } from 'react';
import { X, Key, CheckCircle, ExternalLink, ShieldCheck } from 'lucide-react';
import { getApiKey, saveApiKey } from '../services/geminiService';

export default function SettingsModal({ isOpen, onClose, onKeySaved }) {
  const [inputKey, setInputKey] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setInputKey(getApiKey());
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    saveApiKey(inputKey);
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
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '520px', padding: '28px', position: 'relative' }}>
        
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
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Configuración de API Key (Gratis)</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Para activar las simulaciones con la IA de Gemini</p>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '8px' }}>
              Google Gemini API Key:
            </label>
            <input 
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="AIzaSy..."
              style={{
                width: '100%',
                padding: '12px 14px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-main)',
                fontSize: '0.95rem',
                outline: 'none'
              }}
            />
          </div>

          {savedSuccess && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-green)', marginBottom: '16px', fontSize: '0.9rem' }}>
              <CheckCircle size={18} /> ¡API Key guardada correctamente!
            </div>
          )}

          <div style={{ 
            background: 'rgba(0, 180, 216, 0.08)', 
            border: '1px solid rgba(0, 180, 216, 0.2)',
            borderRadius: 'var(--radius-sm)',
            padding: '14px',
            marginBottom: '20px',
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            lineHeight: 1.5
          }}>
            <div style={{ fontWeight: 700, color: 'var(--secondary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} /> ¿Cómo obtener tu clave gratis en 1 minuto?
            </div>
            <ol style={{ paddingLeft: '18px' }}>
              <li>Ingresa a <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" style={{ color: 'var(--secondary)', textDecoration: 'underline' }}>Google AI Studio <ExternalLink size={12} inline /></a> con tu cuenta de Google.</li>
              <li>Haz clic en <strong>"Create API Key"</strong>.</li>
              <li>Copia la clave y pégala aquí arriba. ¡No cuesta nada!</li>
            </ol>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Guardar Clave
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
