import React, { useState } from 'react';
import ObjectionsGuide from './ObjectionsGuide';
import SalesTips from './SalesTips';
import { BookOpen, Lightbulb } from 'lucide-react';

export default function KnowledgeHub() {
  const [subTab, setSubTab] = useState(() => localStorage.getItem('autocredito_knowledge_subtab') || 'guide');

  const handleChange = (t) => {
    setSubTab(t);
    localStorage.setItem('autocredito_knowledge_subtab', t);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '0 12px' }}>
      <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: 'var(--radius-sm)', maxWidth: '400px', margin: '0 auto', width: '100%' }}>
        <button onClick={() => handleChange('guide')} className={subTab === 'guide' ? 'btn-primary' : 'btn-secondary'} style={{ flex: 1, fontSize: '0.82rem', padding: '8px', gap: '6px' }}>
          <BookOpen size={14} /> Guía de Objeciones
        </button>
        <button onClick={() => handleChange('tips')} className={subTab === 'tips' ? 'btn-primary' : 'btn-secondary'} style={{ flex: 1, fontSize: '0.82rem', padding: '8px', gap: '6px' }}>
          <Lightbulb size={14} /> Consejos de Venta
        </button>
      </div>
      {subTab === 'guide' ? <ObjectionsGuide /> : <SalesTips />}
    </div>
  );
}
