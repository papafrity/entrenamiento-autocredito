import React, { useState } from 'react';
import { OBJECTIONS_GUIDE } from '../data/objectionsGuide';
import { Search, ShieldAlert, Lightbulb } from 'lucide-react';

export default function ObjectionsGuide() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [expandedId, setExpandedId] = useState(null);

  const categories = ['Todas', ...new Set(OBJECTIONS_GUIDE.map(item => item.category))];

  const filteredItems = OBJECTIONS_GUIDE.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.problem.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.recommendedResponse.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todas' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleToggle = (id) => setExpandedId(prev => prev === id ? null : id);

  return (
    <div style={{ padding: '0 20px 40px 20px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '6px' }}>
          Guía de Objeciones y Argumentario <span style={{ color: 'var(--primary)' }}>AutoCrédito</span>
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          Tocá cada objeción para ver conceptos clave y respuesta recomendada. Sólo una abierta a la vez.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '260px' }}>
          <Search size={18} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text"
            placeholder="Buscar objeción o palabra clave..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 14px 12px 42px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-main)',
              fontSize: '0.9rem',
              outline: 'none'
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize: '0.82rem', padding: '8px 16px' }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredItems.map(item => {
          const isExpanded = expandedId === item.id;
          return (
            <div
              key={item.id}
              className="glass-card"
              style={{
                padding: 0,
                overflow: 'hidden',
                border: isExpanded ? '1px solid rgba(255,159,28,0.35)' : '1px solid var(--border-color)',
                transition: 'all 0.2s ease'
              }}
            >
              <div
                onClick={() => handleToggle(item.id)}
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  cursor: 'pointer',
                  background: isExpanded ? 'rgba(255,159,28,0.06)' : 'transparent'
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: isExpanded ? 'rgba(255,159,28,0.15)' : 'rgba(255,255,255,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <ShieldAlert size={18} color={isExpanded ? 'var(--primary)' : 'var(--text-muted)'} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px',
                    color: 'var(--primary)',
                    padding: '2px 6px',
                    background: 'rgba(255,159,28,0.1)',
                    border: '1px solid rgba(255,159,28,0.2)',
                    borderRadius: '20px'
                  }}>{item.category}</span>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: isExpanded ? 'var(--primary)' : 'var(--text-main)', marginTop: '4px', lineHeight: 1.3 }}>
                    "{item.title}"
                  </h3>
                  {!isExpanded && (
                    <p style={{ fontSize: '0.76rem', color: 'var(--text-dim)', marginTop: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.problem}
                    </p>
                  )}
                </div>
                <div style={{ color: isExpanded ? 'var(--primary)' : 'var(--text-dim)', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                </div>
              </div>

              {isExpanded && (
                <div style={{ padding: '0 20px 20px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ background: 'rgba(230,57,70,0.06)', border: '1px solid rgba(230,57,70,0.15)', borderRadius: 'var(--radius-sm)', padding: '12px 14px' }}>
                    <strong style={{ fontSize: '0.72rem', color: 'var(--accent-red)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Problema del cliente:</strong>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.problem}</p>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px 14px', borderRadius: 'var(--radius-sm)' }}>
                    <strong style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Conceptos clave:</strong>
                    <ul style={{ paddingLeft: '16px', fontSize: '0.83rem', color: 'var(--text-muted)', lineHeight: '1.5', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {item.keyPoints.map((pt, idx) => <li key={idx}>{pt}</li>)}
                    </ul>
                  </div>
                  <div style={{ background: 'rgba(46, 196, 182, 0.08)', border: '1px solid rgba(46, 196, 182, 0.25)', padding: '14px', borderRadius: 'var(--radius-sm)' }}>
                    <strong style={{ fontSize: '0.78rem', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <Lightbulb size={16} /> Respuesta recomendada:
                    </strong>
                    <p style={{ fontSize: '0.86rem', color: 'var(--text-main)', fontStyle: 'italic', lineHeight: '1.5' }}>
                      {item.recommendedResponse}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filteredItems.length === 0 && (
          <div className="glass-panel" style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p style={{ fontWeight: 700 }}>No encontramos objeciones con esa búsqueda</p>
            <p style={{ fontSize: '0.82rem', marginTop: '4px' }}>Probá con otra palabra clave.</p>
          </div>
        )}
      </div>

    </div>
  );
}
