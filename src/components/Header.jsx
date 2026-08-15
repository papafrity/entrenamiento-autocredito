import React from 'react';
import { Bot, Key, BookOpen, MessageSquare, Award } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, hasApiKey, onOpenSettings }) {
  return (
    <header className="glass-panel" style={{ margin: '16px 20px', padding: '14px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, #f77f00 100%)',
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            boxShadow: '0 4px 12px rgba(255, 159, 28, 0.3)'
          }}>
            🚗
          </div>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: '800', lineHeight: 1.1 }}>
              AutoCrédito <span style={{ color: 'var(--primary)' }}>Trainer IA</span>
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Simulador de Ventas y Entrenamiento de Objeciones
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.25)', padding: '4px', borderRadius: 'var(--radius-sm)' }}>
          <button
            className={activeTab === 'chat' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setActiveTab('chat')}
            style={{ fontSize: '0.88rem', padding: '8px 14px' }}
          >
            <MessageSquare size={16} />
            Simulador de Chat
          </button>

          <button
            className={activeTab === 'guide' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setActiveTab('guide')}
            style={{ fontSize: '0.88rem', padding: '8px 14px' }}
          >
            <BookOpen size={16} />
            Guía de Objeciones
          </button>
        </nav>

        {/* API Key Status & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={onOpenSettings}
            className="btn-secondary"
            style={{ 
              fontSize: '0.85rem',
              borderColor: hasApiKey ? 'rgba(46, 196, 182, 0.4)' : 'rgba(230, 57, 70, 0.5)',
              background: hasApiKey ? 'rgba(46, 196, 182, 0.1)' : 'rgba(230, 57, 70, 0.1)'
            }}
          >
            <Key size={15} color={hasApiKey ? 'var(--accent-green)' : 'var(--accent-red)'} />
            {hasApiKey ? (
              <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>API Key Lista</span>
            ) : (
              <span style={{ color: 'var(--accent-red)', fontWeight: 600 }}>Configurar API Key</span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
}
