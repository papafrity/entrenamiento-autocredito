import React, { useState } from 'react';
import { RefreshCw, Settings, Palette, HardDrive, Info } from 'lucide-react';
import { syncFromCloud } from '../services/storageService';
import ThemeSelector from './ThemeSelector';

export default function SettingsPanel() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSync = async () => {
    setIsSyncing(true);
    setMsg('');
    try {
      await syncFromCloud();
      setMsg('✅ Datos actualizados desde la nube');
      setTimeout(() => setMsg(''), 3000);
    } catch (e) {
      setMsg('❌ Error al actualizar: ' + (e.message || 'intenta de nuevo'));
    } finally {
      setIsSyncing(false);
    }
  };

  const handleHardRefresh = () => {
    if (confirm('¿Recargar la aplicación? Se actualizará a la última versión.')) {
      window.location.reload();
    }
  };

  return (
    <div style={{ padding: '0 12px 30px 12px', maxWidth: '800px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ background: 'rgba(255,255,255,0.06)', padding: '10px', borderRadius: '12px' }}><Settings size={22} color="var(--primary)" /></div>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Ajustes</h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Tema, actualización y configuración de la app</p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}><Palette size={14}/> Apariencia</span>
        <ThemeSelector />
      </div>

      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}><HardDrive size={14}/> Actualización</span>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          El gesto de deslizar hacia arriba ya no recarga la página. Usá estos botones para actualizar manualmente.
        </p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={handleSync} disabled={isSyncing} className="btn-primary" style={{ fontSize: '0.85rem', padding: '10px 16px', gap: '6px' }}>
            <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} /> {isSyncing ? 'Sincronizando...' : 'Actualizar datos (Nube)'}
          </button>
          <button onClick={handleHardRefresh} className="btn-secondary" style={{ fontSize: '0.85rem', padding: '10px 16px' }}>
            <RefreshCw size={16} /> Recargar app
          </button>
        </div>
        {msg && <p style={{ fontSize: '0.8rem', color: msg.startsWith('✅') ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 600 }}>{msg}</p>}
        <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
          <Info size={12} style={{ display: 'inline', marginRight: '4px' }} />
          Tip: si instalaste la app en el teléfono, la actualización puede tardar unos segundos después de recargar.
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '16px', textAlign: 'center' }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>AutoCrédito Hub IA — v1.0 • PWA instalable • Tema guardado automáticamente</p>
      </div>
    </div>
  );
}
