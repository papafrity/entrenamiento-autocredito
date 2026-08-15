import React from 'react';
import { Bot, Key, BookOpen, MessageSquare, Award } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, hasApiKey, onOpenSettings }) {
  return (
    <header className="glass-panel" style={{ margin: '10px 12px', padding: '10px 14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, #f77f00 100%)',
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            boxShadow: '0 4px 12px rgba(255, 159, 28, 0.3)'
          }}>
            🚗
          </div>
          <div>
            <h1 style={{ fontSize: '1.1rem', fontWeight: '800', lineHeight: 1.1 }}>
              AutoCrédito <span style={{ color: 'var(--primary)' }}>Trainer IA</span>
            </h1>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }} className="mobile-hide">
              Simulador de Ventas y Objeciones
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', gap: '6px', background: 'rgba(0,0,0,0.3)', padding: '3px', borderRadius: 'var(--radius-sm)' }}>
          <button
            className={activeTab === 'chat' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setActiveTab('chat')}
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
          >
            <MessageSquare size={15} />
            <span>Chat</span>
          </button>

          <button
            className={activeTab === 'guide' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setActiveTab('guide')}
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
          >
            <BookOpen size={15} />
            <span>Guía</span>
          </button>
        </nav>

        {/* API Key Status & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            onClick={onOpenSettings}
            className="btn-secondary"
            style={{ 
              fontSize: '0.78rem',
              padding: '6px 10px',
              borderColor: hasApiKey ? 'rgba(46, 196, 182, 0.4)' : 'rgba(230, 57, 70, 0.5)',
              background: hasApiKey ? 'rgba(46, 196, 182, 0.1)' : 'rgba(230, 57, 70, 0.1)'
            }}
          >
            <Key size={14} color={hasApiKey ? 'var(--accent-green)' : 'var(--accent-red)'} />
            <span style={{ color: hasApiKey ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 600 }}>
              {hasApiKey ? 'API OK' : 'Clave'}
            </span>
          </button>
        </div>

      </div>
    </header>
  );
}
