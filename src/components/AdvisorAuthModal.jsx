import React, { useState, useEffect } from 'react';
import { getTeamMembers, registerNewAdvisor, setActiveAdvisorId, getCurrentUserProfile, getActiveAdvisorId } from '../services/storageService';
import { PROVINCIAS_LIST, getAgenciasByProvincia } from '../data/agenciasData';
import { UserPlus, Users, Check, X, Sparkles, Lock, ShieldCheck, ChevronDown } from 'lucide-react';

export default function AdvisorAuthModal({ isOpen, onClose, onAdvisorChanged }) {
  const [team, setTeam] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [hasRegisteredDevice, setHasRegisteredDevice] = useState(false);

  const [activeTab, setActiveTab] = useState('select');
  const [newName, setNewName] = useState('');
  const [newProvincia, setNewProvincia] = useState('');
  const [newAgencia, setNewAgencia] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAvatar, setNewAvatar] = useState('👨‍💼');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const avatars = ['👨‍💼', '👩‍💼', '🧑‍💻', '👨‍🔧', '👩‍💻', '🤵', '🦸‍♂️', '🏎️'];

  const agenciasDisponibles = newProvincia ? getAgenciasByProvincia(newProvincia) : [];

  useEffect(() => {
    if (isOpen) {
      const freshTeam = getTeamMembers();
      const freshUser = getCurrentUserProfile();
      const activeId = getActiveAdvisorId();

      setTeam(freshTeam);
      setCurrentUser(freshUser);

      const deviceRegistered = Boolean(activeId && freshTeam.find(m => m.id === activeId));
      setHasRegisteredDevice(deviceRegistered);

      setActiveTab(freshTeam.length === 0 ? 'register' : 'select');

      // Resetear form
      setNewName('');
      setNewProvincia('');
      setNewAgencia('');
      setNewPhone('');
      setNewAvatar('👨‍💼');
      setErrorMsg('');
    }
  }, [isOpen]);

  // Limpiar agencia cuando cambia la provincia
  useEffect(() => {
    setNewAgencia('');
  }, [newProvincia]);

  if (!isOpen) return null;

  const handleSelectAdvisor = (id) => {
    setActiveAdvisorId(id);
    onAdvisorChanged();
    onClose();
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!newName.trim()) {
      setErrorMsg('Por favor ingresá tu nombre y apellido.');
      return;
    }
    if (!newProvincia) {
      setErrorMsg('Seleccioná tu provincia.');
      return;
    }
    if (!newAgencia) {
      setErrorMsg('Seleccioná tu agencia / sucursal.');
      return;
    }

    setIsLoading(true);
    try {
      await registerNewAdvisor({
        name: newName,
        provincia: newProvincia,
        branch: newAgencia,
        phone: newPhone,
        avatar: newAvatar
      });
      onAdvisorChanged();
      onClose();
    } catch (err) {
      setErrorMsg('Hubo un error al registrar. Intenta de nuevo.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const selectStyle = {
    width: '100%',
    padding: '10px 12px',
    background: 'var(--bg-input)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-main)',
    fontSize: '0.88rem',
    appearance: 'none',
    cursor: 'pointer'
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: '16px'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '520px', padding: '24px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '18px', right: '18px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', lineHeight: 1, zIndex: 1 }}
        >
          <X size={20} />
        </button>

        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ background: 'rgba(255, 159, 28, 0.15)', padding: '10px', borderRadius: '12px', flexShrink: 0 }}>
            <Users size={22} color="var(--primary)" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Perfil de Asesor</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {currentUser
                ? `Usando la app como: ${currentUser.name} — ${currentUser.branch}`
                : 'Registrate para comenzar a sumar puntos'}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: 'var(--radius-sm)', marginBottom: '20px' }}>
          <button
            type="button"
            className={activeTab === 'select' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setActiveTab('select')}
            disabled={team.length === 0}
            style={{ flex: 1, fontSize: '0.82rem', padding: '8px', opacity: team.length === 0 ? 0.4 : 1 }}
          >
            <Users size={14} /> Seleccionar ({team.length})
          </button>
          <button
            type="button"
            className={activeTab === 'register' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => !hasRegisteredDevice && setActiveTab('register')}
            style={{
              flex: 1,
              fontSize: '0.82rem',
              padding: '8px',
              opacity: hasRegisteredDevice ? 0.5 : 1,
              cursor: hasRegisteredDevice ? 'not-allowed' : 'pointer'
            }}
            title={hasRegisteredDevice ? 'Ya tenés un asesor registrado en este dispositivo' : ''}
          >
            {hasRegisteredDevice ? <Lock size={14} /> : <UserPlus size={14} />}
            {hasRegisteredDevice ? 'Registro bloqueado' : 'Registrar Nuevo'}
          </button>
        </div>

        {/* TAB: Seleccionar asesor existente */}
        {activeTab === 'select' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '360px', overflowY: 'auto' }}>
            {team.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)' }}>
                <p>Aún no hay asesores registrados.</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className="btn-primary"
                  style={{ marginTop: '12px', fontSize: '0.82rem', padding: '8px 16px' }}
                >
                  Registrar mi Asesor
                </button>
              </div>
            ) : (
              team.map(member => {
                const isSelected = currentUser && member.id === currentUser.id;
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
                      cursor: 'pointer',
                      transition: 'background 0.15s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.4rem' }}>{member.avatar}</span>
                      <div>
                        <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{member.name}</strong>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {member.provincia ? `${member.provincia} — ` : ''}{member.branch}
                        </p>
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
              })
            )}
          </div>
        )}

        {/* TAB: Registrar nuevo asesor */}
        {activeTab === 'register' && (
          hasRegisteredDevice ? (
            <div style={{ textAlign: 'center', padding: '24px 16px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔒</div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px' }}>Ya tenés un perfil en este dispositivo</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Para evitar duplicados, cada dispositivo solo puede tener un asesor registrado.<br/>
                Si sos otro asesor, abrí la app desde tu propio celular y registrate ahí.
              </p>
              <div style={{ marginTop: '16px', padding: '10px 14px', background: 'rgba(255,159,28,0.1)', border: '1px solid rgba(255,159,28,0.25)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                <ShieldCheck size={16} color="var(--primary)" />
                <span style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600 }}>
                  Tu asesor activo: {currentUser?.name}
                </span>
              </div>
              <button
                onClick={() => setActiveTab('select')}
                className="btn-secondary"
                style={{ marginTop: '14px', fontSize: '0.82rem', padding: '8px 20px' }}
              >
                Ver lista de asesores
              </button>
            </div>
          ) : (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Nombre */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Nombre y Apellido:
                </label>
                <input
                  type="text"
                  placeholder="Ej: Marcelo Fernández"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.88rem' }}
                  autoFocus
                />
              </div>

              {/* Provincia */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Provincia:
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={newProvincia}
                    onChange={e => setNewProvincia(e.target.value)}
                    style={selectStyle}
                  >
                    <option value="">— Seleccioná tu provincia —</option>
                    {PROVINCIAS_LIST.map(prov => (
                      <option key={prov} value={prov}>{prov}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
                </div>
              </div>

              {/* Agencia — solo visible si seleccionó provincia */}
              {newProvincia && (
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Agencia / Sucursal:
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={newAgencia}
                      onChange={e => setNewAgencia(e.target.value)}
                      style={selectStyle}
                    >
                      <option value="">— Seleccioná tu agencia —</option>
                      {agenciasDisponibles.map(ag => (
                        <option key={ag} value={ag}>{ag}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
                  </div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                    ¿No encontrás tu agencia? Avisale al administrador para agregarla.
                  </p>
                </div>
              )}

              {/* Teléfono */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Teléfono / WhatsApp:
                </label>
                <input
                  type="text"
                  placeholder="Ej: 11-2345-6789"
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.88rem' }}
                />
              </div>

              {/* Avatar */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
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
                        border: newAvatar === av ? '2px solid rgba(255,255,255,0.3)' : '2px solid transparent',
                        borderRadius: '8px',
                        padding: '6px 8px',
                        cursor: 'pointer',
                        fontSize: '1.3rem',
                        transition: 'all 0.15s'
                      }}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              {errorMsg && (
                <p style={{ color: 'var(--accent-red)', fontSize: '0.78rem', margin: 0 }}>{errorMsg}</p>
              )}

              <button
                type="submit"
                className="btn-primary"
                disabled={isLoading}
                style={{ padding: '12px', fontSize: '0.9rem', marginTop: '4px', opacity: isLoading ? 0.7 : 1 }}
              >
                <Sparkles size={16} />
                {isLoading ? 'Creando perfil...' : 'Crear Perfil de Asesor (+100 pts de bienvenida)'}
              </button>
            </form>
          )
        )}

      </div>
    </div>
  );
}
