import React, { useState } from 'react';
import ElevatorPitch from './ElevatorPitch';
import QuickObjectionsGame from './QuickObjectionsGame';
import TeamLeaderboard from './TeamLeaderboard';
import { Flame, Zap, Trophy } from 'lucide-react';

export default function ActivitiesHub({ onPointsAwarded, onOpenAuthModal }) {
  const [subTab, setSubTab] = useState(() => localStorage.getItem('autocredito_activities_subtab') || 'pitch');

  const handleChange = (t) => {
    setSubTab(t);
    localStorage.setItem('autocredito_activities_subtab', t);
  };

  const tabs = [
    { id: 'pitch', label: 'Pitch 60s', icon: Flame },
    { id: 'flash', label: 'Desafío Flash', icon: Zap },
    { id: 'team', label: 'Equipo y Medallas', icon: Trophy },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: 'var(--radius-sm)', margin: '0 12px', overflowX: 'auto' }}>
        {tabs.map(t => {
          const Icon = t.icon;
          const active = subTab === t.id;
          return (
            <button key={t.id} onClick={() => handleChange(t.id)} className={active ? 'btn-primary' : 'btn-secondary'} style={{ flex: 1, fontSize: '0.8rem', padding: '8px 10px', whiteSpace: 'nowrap', gap: '6px' }}>
              <Icon size={14} /> {t.label}
            </button>
          );
        })}
      </div>
      {subTab === 'pitch' && <ElevatorPitch onPointsAwarded={onPointsAwarded} />}
      {subTab === 'flash' && <QuickObjectionsGame />}
      {subTab === 'team' && <TeamLeaderboard onOpenAuthModal={onOpenAuthModal} />}
    </div>
  );
}
