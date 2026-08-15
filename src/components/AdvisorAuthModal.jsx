import React, { useState } from 'react';
import { getTeamMembers, registerNewAdvisor, setActiveAdvisorId, getCurrentUserProfile } from '../services/storageService';
import { UserPlus, Users, Check, X, ShieldCheck, Sparkles } from 'lucide-react';

export default function AdvisorAuthModal({ isOpen, onClose, onAdvisorChanged }) {
  const [activeTab, setActiveTab] = useState('select'); // 'select' o 'register'
  const [team, setTeam] = useState(getTeamMembers());
  const [currentUser, setCurrentUser] = useState(getCurrentUserProfile());

  // Form state para nuevo asesor
  const [newName, setNewName] = useState('');
  const [newBranch, setNewBranch] = useState('Sucursal Central');
  const [newPhone, setNewPhone] = useState('');
  const [newAvatar, setNewAvatar] = useState('👨‍💼');
  const [errorMsg, setErrorMsg] = useState('');

  const avatars = ['👨‍💼', '👩‍💼', '🧑‍💻', '👨‍🔧', '👩‍💻', '🤵', '🦸‍♂️', '🏎️'];

  if (!isOpen) return null;

  const handleSelectAdvisor = (id) => {
    setActiveAdvisorId(id);
    onAdvisorChanged();
    onClose();
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!newName.trim()) {
      setErrorMsg('Por favor ingresa tu nombre y apellido.');
      return;
    }

    const created = registerNewAdvisor({
      name: newName,
      branch: newBranch,
      phone: newPhone,
      avatar: newAvatar
    });

    onAdvisorChanged();
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: '16px'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '520px', padding: '24px', position: 'relative' }}>
        
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        {/* Modal Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ background: 'rgba(255, 159, 28, 0.15)', padding: '10px', borderRadius: '12px' }}>
            <Users size={22} color="var(--primary)" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Perfil de Asesor Comercial</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Actualmente usando la app como: <strong>{currentUser.name}</strong>
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: 'var(--radius-sm)', marginBottom: '20px' }}>
          <button
            type="button"
            className={activeTab === 'select' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setActiveTab('select')}
            style={{ flex: 1, fontSize: '0.82rem', padding: '8px' }}
          >
            <Users size={14} /> Seleccionar Mi Usuario
          </button>
          <button
            type="button"
            className={activeTab === 'register' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setActiveTab('register')}
            style={{ flex: 1, fontSize: '0.82rem', padding: '8px' }}
          >
            <UserPlus size={14} /> Registrar Nuevo Asesor
          </button>
        </div>

        {/* Tab 1: Seleccionar Asesor Existente */}
        {activeTab === 'select' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '320px', overflowY: 'auto' }}>
            {team.map(member => {
              const isSelected = member.id === currentUser.id;
              return (
                <div
                  key={member.id}
                  onClick={() => handleSelectAdvisor(member.id)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: isSelected ? 'rgba(255, 159, 28, 0.15)' : 'rgba(255,255,255,0.03)',
                    border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.4rem' }}>{member.avatar}</span>
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{member.name}</strong>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{member.branch}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 700 }}>
                      {member.points} pts
                    </span>
                    {isSelected && <Check size={18} color="var(--accent-green)" />}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Registrar Nuevo Asesor */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Nombre y Apellido:
              </label>
              <input
                type="text"
                placeholder="Ej: Laura Gómez"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.88rem' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Sucursal / Zona:
                </label>
                <input
                  type="text"
                  placeholder="Ej: Sucursal Oeste"
                  value={newBranch}
                  onChange={e => setNewBranch(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.82rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Teléfono / WhatsApp:
                </label>
                <input
                  type="text"
                  placeholder="Ej: 11-2345-6789"
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.82rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Elegí tu Avatar:
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {avatars.map(av => (
                  <button
                    type="button"
                    key={av}
                    onClick={() => setNewAvatar(av)}
                    style={{
                      background: newAvatar === av ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '6px 8px',
                      cursor: 'pointer',
                      fontSize: '1.2rem'
                    }}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            {errorMsg && (
              <p style={{ color: 'var(--accent-red)', fontSize: '0.78rem' }}>{errorMsg}</p>
            )}

            <button type="submit" className="btn-primary" style={{ padding: '12px', fontSize: '0.9rem', marginTop: '8px' }}>
              <Sparkles size={16} /> Crear Usuario y Entrar (+100 pts de bienvenida)
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
