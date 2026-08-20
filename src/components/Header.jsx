import React from 'react';
import { MessageSquare, Car, MessageCircle, Calculator, BookOpen, ShieldCheck, DollarSign, Trophy, Settings } from 'lucide-react';
import ThemeSelector from './ThemeSelector';

export default function Header({ activeTab, setActiveTab, currentUser, onOpenAuthModal }) {
  const tabs = [
    { id: 'calculator', label: 'Calculadora y Placas', icon: Calculator },
    { id: 'knowledge', label: 'Guia y Consejos', icon: BookOpen },
    { id: 'car', label: 'Auto & Visitas', icon: Car },
    { id: 'whatsapp', label: 'WhatsApp IA', icon: MessageCircle },
    { id: 'chat', label: 'Chat IA', icon: MessageSquare },
    { id: 'activities', label: 'Entrenamiento y Equipo', icon: Trophy },
    { id: 'commissions', label: 'Mis Ganancias', icon: DollarSign },
    { id: 'supervisor', label: 'Supervisor', icon: ShieldCheck },
    { id: 'settings', label: 'Ajustes', icon: Settings },
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

        {/* Right Actions: User Switcher + Theme */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          
          <div className="mobile-hide">
            <ThemeSelector compact />
          </div>

          <button
            onClick={onOpenAuthModal}
            className="btn-secondary"
            style={{ fontSize: '0.78rem', padding: '6px 12px', gap: '6px' }}
            title="Cambiar o registrar asesor"
          >
            <span>{currentUser?.avatar || '👨‍💼'}</span>
            <span style={{ maxWidth: '170px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 600 }}>
              {currentUser ? `${currentUser.name} (${currentUser.role || 'PAI'})` : 'Registrar Asesor'}
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
