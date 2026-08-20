import React, { useState, useEffect } from 'react';
import { Download, X, Share, Smartphone } from 'lucide-react';

export default function InstallPwaButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem('pwa_dismissed') === '1');

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    setIsStandalone(standalone);

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);

  if (isStandalone || dismissed) return null;

  // Si es iOS y no está instalado, mostrar ayuda
  if (isIos) {
    return (
      <>
        <div style={{ margin: '0 12px 10px 12px', background: 'linear-gradient(135deg, var(--primary) 0%, #f77f00 100%)', borderRadius: '12px', padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', color: '#000' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Smartphone size={20} />
            <div>
              <strong style={{ fontSize: '0.85rem' }}>Instalá la app en tu iPhone</strong>
              <p style={{ fontSize: '0.72rem', opacity: 0.8 }}>Acceso directo sin buscar en el navegador</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button onClick={() => setShowIosHelp(true)} className="btn-secondary" style={{ fontSize: '0.78rem', padding: '6px 12px', background: '#000', color: '#fff', border: 'none' }}>
              <Share size={14} /> Ver cómo
            </button>
            <button onClick={() => { localStorage.setItem('pwa_dismissed', '1'); setDismissed(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#000', opacity: 0.6 }}><X size={16} /></button>
          </div>
        </div>
        {showIosHelp && (
          <div onClick={() => setShowIosHelp(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1300, padding: '16px' }}>
            <div onClick={e=>e.stopPropagation()} className="glass-panel" style={{ maxWidth: '420px', width: '100%', padding: '24px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '12px' }}>📲 Cómo instalar en iPhone</h3>
              <ol style={{ textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>Tocá el botón <strong style={{ color:'var(--text-main)' }}>Compartir</strong> <Share size={12} style={{ display:'inline' }}/> abajo en Safari</li>
                <li>Elegí <strong style={{ color:'var(--text-main)' }}>“Agregar a pantalla de inicio”</strong> ➕</li>
                <li>Tocá <strong style={{ color:'var(--text-main)' }}>Agregar</strong> arriba a la derecha</li>
                <li>¡Listo! El icono quedará en tu inicio como una app</li>
              </ol>
              <button onClick={() => setShowIosHelp(false)} className="btn-primary" style={{ marginTop: '16px', width: '100%' }}>Entendido</button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Android / Desktop con beforeinstallprompt
  if (deferredPrompt) {
    return (
      <div style={{ margin: '0 12px 10px 12px', background: 'linear-gradient(135deg, var(--primary) 0%, #f77f00 100%)', borderRadius: '12px', padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', color: '#000' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Download size={20} />
          <div>
            <strong style={{ fontSize: '0.85rem' }}>Instalá AutoCrédito Hub</strong>
            <p style={{ fontSize: '0.72rem', opacity: 0.8 }}>Acceso rápido desde tu pantalla de inicio</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <button
            onClick={async () => {
              deferredPrompt.prompt();
              const { outcome } = await deferredPrompt.userChoice;
              if (outcome === 'accepted') setDeferredPrompt(null);
            }}
            style={{ background: '#000', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 14px', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}
          >
            Instalar
          </button>
          <button onClick={() => { localStorage.setItem('pwa_dismissed', '1'); setDismissed(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#000', opacity: 0.6 }}><X size={16} /></button>
        </div>
      </div>
    );
  }

  return null;
}
