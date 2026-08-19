import React from 'react';
import { MessageSquare, Car, Trophy, MessageCircle, Calculator, Zap, BookOpen, TrendingUp, Flame, ShieldCheck } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, currentUser, onOpenAuthModal }) {
  const tabs = [
    { id: 'chat', label: 'Chat IA', icon: MessageSquare },
    { id: 'pitch', label: 'Pitch 60s', icon: Flame },
    { id: 'calculator', label: 'Calculadora & Placas', icon: Calculator },
    { id: 'whatsapp', label: 'WhatsApp IA', icon: MessageCircle },
    { id: 'car', label: 'Auto & Visitas', icon: Car },
    { id: 'team', label: 'Equipo & Medallas', icon: Trophy },
    { id: 'flash', label: 'Desafío Flash', icon: Zap },
    { id: 'guide', label: 'Guía', icon: BookOpen },
    { id: 'tips', label: 'Consejos de Venta', icon: TrendingUp },
    { id: 'supervisor', label: 'Supervisor', icon: ShieldCheck }
  ];

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
              AutoCrédito <span style={{ color: 'var(--primary)' }}>Hub IA</span>
            </h1>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }} className="mobile-hide">
              Plataforma Comercial y Operativa
            </p>
          </div>
        </div>

        {/* Right Actions: User Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          
          {/* Active Advisor Profile Button */}
          <button
            onClick={onOpenAuthModal}
            className="btn-secondary"
            style={{ fontSize: '0.78rem', padding: '6px 12px', gap: '6px' }}
            title="Cambiar o registrar asesor"
          >
            <span>{currentUser?.avatar || '👨‍💼'}</span>
            <span style={{ maxWidth: '140px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 600 }}>
              {currentUser ? `${currentUser.name} (${currentUser.branch})` : 'Registrar Asesor'}
            </span>
          </button>

        </div>

      </div>

      {/* Navigation Tabs Bar with horizontal scroll for mobile */}
      <nav style={{
        display: 'flex',
        gap: '6px',
        background: 'rgba(0,0,0,0.3)',
        padding: '4px',
        borderRadius: 'var(--radius-sm)',
        marginTop: '10px',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none'
      }}>
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={isActive ? 'btn-primary' : 'btn-secondary'}
              onClick={() => setActiveTab(tab.id)}
              style={{
                fontSize: '0.78rem',
                padding: '7px 12px',
                whiteSpace: 'nowrap',
                gap: '6px',
                border: isActive ? 'none' : '1px solid transparent'
              }}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}
