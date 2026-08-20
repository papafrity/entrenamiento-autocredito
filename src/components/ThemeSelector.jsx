import React, { useState, useEffect } from 'react';
import { Palette, Check } from 'lucide-react';

export const THEMES = [
  { id: 'naranja', label: 'Naranja', color: '#ff9f1c', bg: '#090d16' },
  { id: 'azul', label: 'Azul', color: '#0ea5e9', bg: '#0a1628' },
  { id: 'verde', label: 'Verde', color: '#10b981', bg: '#0a1a14' },
  { id: 'violeta', label: 'Violeta', color: '#8b5cf6', bg: '#140f1f' },
  { id: 'rojo', label: 'Rojo', color: '#ef4444', bg: '#1a0a0a' },
];

const STORAGE_KEY = 'autocredito_theme';

export function getStoredTheme() {
  return localStorage.getItem(STORAGE_KEY) || 'naranja';
}

export function applyTheme(themeId) {
  document.documentElement.setAttribute('data-theme', themeId);
  localStorage.setItem(STORAGE_KEY, themeId);
  const t = THEMES.find(x => x.id === themeId);
  if (t) {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t.color);
  }
}

export default function ThemeSelector({ compact = false }) {
  const [active, setActive] = useState(getStoredTheme());

  useEffect(() => {
    applyTheme(active);
  }, [active]);

  const handleSelect = (id) => {
    setActive(id);
    applyTheme(id);
  };

  if (compact) {
    return (
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        {THEMES.map(t => (
          <button
            key={t.id}
            onClick={() => handleSelect(t.id)}
            title={t.label}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: t.color,
              border: active === t.id ? '2px solid #fff' : '2px solid transparent',
              boxShadow: active === t.id ? `0 0 10px ${t.color}88` : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
          >
            {active === t.id && <Check size={12} color="#fff" strokeWidth={3} />}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Palette size={14} /> Tema de colores
      </span>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {THEMES.map(t => (
          <button
            key={t.id}
            onClick={() => handleSelect(t.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: t.color,
              border: active === t.id ? '3px solid #fff' : '2px solid rgba(255,255,255,0.15)',
              boxShadow: active === t.id ? `0 0 14px ${t.color}99` : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}>
              {active === t.id && <Check size={16} color="#fff" strokeWidth={3} />}
            </div>
            <span style={{ fontSize: '0.7rem', fontWeight: active === t.id ? 700 : 500, color: active === t.id ? 'var(--primary)' : 'var(--text-muted)' }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
