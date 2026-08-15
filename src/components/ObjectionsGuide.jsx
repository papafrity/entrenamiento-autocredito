import React, { useState } from 'react';
import { OBJECTIONS_GUIDE } from '../data/objectionsGuide';
import { Search, ShieldAlert, CheckCircle, Lightbulb } from 'lucide-react';

export default function ObjectionsGuide() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  const categories = ['Todas', ...new Set(OBJECTIONS_GUIDE.map(item => item.category))];

  const filteredItems = OBJECTIONS_GUIDE.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.problem.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.recommendedResponse.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todas' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ padding: '0 20px 40px 20px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      
      {/* Title Header */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '6px' }}>
          Guía de Objeciones y Argumentario <span style={{ color: 'var(--primary)' }}>AutoCrédito</span>
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
          Consultá las respuestas clave recomendadas para responder las objeciones más difíciles de los clientes en Argentina.
        </p>
      </div>

      {/* Filter controls */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '28px' }}>
        
        {/* Search Input */}
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

        {/* Category Pills */}
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

      {/* Cards List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {filteredItems.map(item => (
          <div key={item.id} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <span className="badge badge-medium" style={{ fontSize: '0.7rem' }}>
                {item.category}
              </span>
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '10px', color: 'var(--text-main)' }}>
              "{item.title}"
            </h3>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldAlert size={15} color="var(--accent-red)" />
              {item.problem}
            </p>

            {/* Key Points */}
            <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>
              <strong style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                Conceptos Clave del Contrato:
              </strong>
              <ul style={{ paddingLeft: '16px', fontSize: '0.83rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                {item.keyPoints.map((pt, idx) => (
                  <li key={idx}>{pt}</li>
                ))}
              </ul>
            </div>

            {/* Recommended Answer */}
            <div style={{
              marginTop: 'auto',
              background: 'rgba(46, 196, 182, 0.08)',
              border: '1px solid rgba(46, 196, 182, 0.25)',
              padding: '14px',
              borderRadius: 'var(--radius-sm)'
            }}>
              <strong style={{ fontSize: '0.8rem', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <Lightbulb size={16} /> Respuesta Recomendada:
              </strong>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-main)', fontStyle: 'italic', lineHeight: '1.5' }}>
                {item.recommendedResponse}
              </p>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
