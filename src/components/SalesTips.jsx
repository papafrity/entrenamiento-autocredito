import React, { useState } from 'react';
import { SALES_TIPS } from '../data/salesTips';
import { Search, Lightbulb, MessageSquare, Star, TrendingUp, BookOpen } from 'lucide-react';

const CATEGORY_ICONS = {
  'Primer Contacto': '🤝',
  'Técnica de Venta': '🎯',
  'Manejo de Objeciones': '🛡️',
  'Cierre de Venta': '✅',
  'Psicología del Cliente': '🧠',
  'Productividad del Asesor': '📋'
};

export default function SalesTips() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [expandedId, setExpandedId] = useState(null);

  const categories = ['Todas', ...new Set(SALES_TIPS.map(item => item.category))];

  const filteredItems = SALES_TIPS.filter(item => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tip.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.situation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todas' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleToggle = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div style={{ padding: '0 16px 40px 16px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>

      {/* Title Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--accent-green) 0%, #00b4d8 100%)',
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            boxShadow: '0 4px 14px rgba(46, 196, 182, 0.3)',
            flexShrink: 0
          }}>
            💡
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.1 }}>
              Consejos para <span style={{ color: 'var(--accent-green)' }}>Vender Mejor</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '2px' }}>
              {SALES_TIPS.length} técnicas y estrategias comerciales reales para asesores AutoCrédito en Argentina.
            </p>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {Object.entries(CATEGORY_ICONS).map(([cat, emoji]) => {
          const count = SALES_TIPS.filter(t => t.category === cat).length;
          return (
            <div
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? 'Todas' : cat)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                background: selectedCategory === cat ? 'rgba(46, 196, 182, 0.2)' : 'rgba(255,255,255,0.04)',
                border: selectedCategory === cat ? '1px solid var(--accent-green)' : '1px solid var(--border-color)',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: selectedCategory === cat ? 'var(--accent-green)' : 'var(--text-muted)',
                transition: 'all 0.2s ease'
              }}
            >
              <span>{emoji}</span>
              <span>{cat}</span>
              <span style={{
                background: 'rgba(255,255,255,0.1)',
                padding: '1px 5px',
                borderRadius: '6px',
                fontSize: '0.7rem'
              }}>{count}</span>
            </div>
          );
        })}
      </div>

      {/* Search + Filter controls */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px', alignItems: 'center' }}>
        
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
          <Search size={17} color="var(--text-dim)" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Buscar consejo, técnica o situación..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '11px 14px 11px 40px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-main)',
              fontSize: '0.88rem',
              outline: 'none'
            }}
          />
        </div>

        {/* "Todas" reset button */}
        {selectedCategory !== 'Todas' && (
          <button
            className="btn-secondary"
            onClick={() => setSelectedCategory('Todas')}
            style={{ fontSize: '0.78rem', padding: '8px 14px' }}
          >
            Mostrar todas ({SALES_TIPS.length})
          </button>
        )}

        <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
          {filteredItems.length} consejos
        </span>
      </div>

      {/* Cards Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredItems.map(item => {
          const isExpanded = expandedId === item.id;
          return (
            <div
              key={item.id}
              className="glass-card"
              style={{
                padding: '0',
                overflow: 'hidden',
                border: isExpanded ? '1px solid rgba(46, 196, 182, 0.3)' : '1px solid var(--border-color)',
                transition: 'all 0.2s ease'
              }}
            >
              {/* Card Header — always visible, click to expand */}
              <div
                onClick={() => handleToggle(item.id)}
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  cursor: 'pointer',
                  background: isExpanded ? 'rgba(46, 196, 182, 0.05)' : 'transparent'
                }}
              >
                {/* Emoji icon */}
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: isExpanded ? 'rgba(46, 196, 182, 0.15)' : 'rgba(255,255,255,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                  flexShrink: 0,
                  transition: 'all 0.2s ease'
                }}>
                  {item.emoji}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.6px',
                      color: 'var(--accent-green)',
                      padding: '2px 7px',
                      background: 'rgba(46, 196, 182, 0.1)',
                      border: '1px solid rgba(46, 196, 182, 0.2)',
                      borderRadius: 'var(--radius-full)'
                    }}>
                      {item.category}
                    </span>
                  </div>
                  <h3 style={{
                    fontSize: '0.97rem',
                    fontWeight: 700,
                    color: isExpanded ? 'var(--accent-green)' : 'var(--text-main)',
                    lineHeight: 1.3,
                    transition: 'color 0.2s'
                  }}>
                    {item.title}
                  </h3>
                  {!isExpanded && (
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.situation}
                    </p>
                  )}
                </div>

                {/* Expand arrow */}
                <div style={{
                  color: isExpanded ? 'var(--accent-green)' : 'var(--text-dim)',
                  transition: 'transform 0.2s',
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  flexShrink: 0
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div style={{ padding: '0 20px 20px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  
                  {/* Situation */}
                  <div style={{
                    background: 'rgba(230, 57, 70, 0.06)',
                    border: '1px solid rgba(230, 57, 70, 0.15)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px 14px'
                  }}>
                    <strong style={{ fontSize: '0.75rem', color: 'var(--accent-red)', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: '4px' }}>
                      🔍 Situación típica:
                    </strong>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      {item.situation}
                    </p>
                  </div>

                  {/* Tip */}
                  <div style={{
                    background: 'rgba(46, 196, 182, 0.07)',
                    border: '1px solid rgba(46, 196, 182, 0.2)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px 14px'
                  }}>
                    <strong style={{ fontSize: '0.75rem', color: 'var(--accent-green)', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>
                      <Lightbulb size={14} /> Consejo clave:
                    </strong>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: 1.55 }}>
                      {item.tip}
                    </p>
                  </div>

                  {/* Example */}
                  <div style={{
                    background: 'rgba(0, 180, 216, 0.07)',
                    border: '1px solid rgba(0, 180, 216, 0.2)',
                    borderLeft: '3px solid var(--secondary)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px 14px'
                  }}>
                    <strong style={{ fontSize: '0.75rem', color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>
                      <MessageSquare size={14} /> Ejemplo real:
                    </strong>
                    <p style={{ fontSize: '0.86rem', color: 'var(--text-main)', fontStyle: 'italic', lineHeight: 1.55 }}>
                      {item.example}
                    </p>
                  </div>

                  {/* Key Points */}
                  <div style={{
                    background: 'rgba(255, 159, 28, 0.06)',
                    border: '1px solid rgba(255, 159, 28, 0.15)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px 14px'
                  }}>
                    <strong style={{ fontSize: '0.75rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: '8px' }}>
                      📌 Puntos para recordar:
                    </strong>
                    <ul style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {item.keyPoints.map((pt, idx) => (
                        <li key={idx} style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              )}
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="glass-panel" style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '10px' }}>🔍</span>
            <p style={{ fontWeight: 700, fontSize: '1rem' }}>No encontramos consejos con esa búsqueda</p>
            <p style={{ fontSize: '0.82rem', marginTop: '4px' }}>Intentá con otra palabra clave o cambiá la categoría.</p>
          </div>
        )}
      </div>

    </div>
  );
}
