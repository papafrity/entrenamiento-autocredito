import React, { useState, useEffect } from 'react';
import { getTeamMembers, registerNewAdvisor, setActiveAdvisorId, getCurrentUserProfile, getActiveAdvisorId, syncFromCloud } from '../services/storageService';
import { PROVINCIAS_LIST, getAgenciasByProvincia } from '../data/agenciasData';
import { UserPlus, Users, Check, X, Sparkles, Lock, ShieldCheck, ChevronDown, RefreshCw, Cloud } from 'lucide-react';

export default function AdvisorAuthModal({ isOpen, onClose, onAdvisorChanged }) {
  const [team, setTeam] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [hasRegisteredDevice, setHasRegisteredDevice] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const [activeTab, setActiveTab] = useState('select');
  const [newName, setNewName] = useState('');
  const [newProvincia, setNewProvincia] = useState('');
  const [newAgencia, setNewAgencia] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAvatar, setNewAvatar] = useState('👨‍💼');
  const [errorMsg, setErrorMsg] = useState('');

  const avatars = ['👨‍💼', '👩‍💼', '🧑‍💻', '👨‍🔧', '👩‍💻', '🤵', '🦸‍♂️', '🏎️'];

  const agenciasDisponibles = newProvincia ? getAgenciasByProvincia(newProvincia) : [];

  const refreshData = async (forceCloud = false) => {
    if (forceCloud) {
      setIsSyncing(true);
      try {
        await syncFromCloud();
      } catch (err) {
        console.error('Error syncing:', err);
      } finally {
        setIsSyncing(false);
      }
    }
    const freshTeam = getTeamMembers();
    const freshUser = getCurrentUserProfile();
    const activeId = getActiveAdvisorId();

    setTeam(freshTeam);
    setCurrentUser(freshUser);

    const deviceRegistered = Boolean(activeId && freshTeam.find(m => m.id === activeId));
    setHasRegisteredDevice(deviceRegistered);
    setActiveTab(freshTeam.length === 0 ? 'register' : 'select');
  };

  useEffect(() => {
    if (isOpen) {
      refreshData(true); // Sincroniza con la nube al abrir
      setNewName('');
      setNewProvincia('');
      setNewAgencia('');
      setNewPhone('');
      setNewAvatar('👨‍💼');
      setErrorMsg('');
    }
  }, [isOpen]);

  useEffect(() => {
    setNewAgencia('');
  }, [newProvincia]);

  if (!isOpen) return null;

  const handleSelectAdvisor = (id) => {
    setActiveAdvisorId(id);
    onAdvisorChanged?.();
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

    try {
      await registerNewAdvisor({
        name: newName,
        provincia: newProvincia,
        branch: newAgencia,
        phone: newPhone,
        avatar: newAvatar
      });
      onAdvisorChanged?.();
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg('Hubo un error al registrar. Intenta de nuevo.');
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingRight: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(255, 159, 28, 0.15)', padding: '10px', borderRadius: '12px', flexShrink: 0 }}>
              <Users size={22} color="var(--primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Perfil de Asesor</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {currentUser
                  ? `Asesor activo: ${currentUser.name} (${currentUser.branch})`
                  : 'Sincronizado en tiempo real con todo el equipo'}
              </p>
            </div>
          </div>

          {/* Sync Button */}
          <button
            type="button"
            onClick={() => refreshData(true)}
            disabled={isSyncing}
            className="btn-secondary"
            style={{ fontSize: '0.72rem', padding: '6px 10px', gap: '4px' }}
            title="Sincronizar asesores desde la nube"
          >
            <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
            <span className="mobile-hide">{isSyncing ? 'Sincronizando...' : 'Nube'}</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: 'var(--radius-sm)', marginBottom: '20px' }}>
          <button
            type="button"
            className={activeTab === 'select' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setActiveTab('select')}
            style={{ flex: 1, fontSize: '0.82rem', padding: '8px' }}
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
                <Cloud size={32} style={{ margin: '0 auto 10px auto', opacity: 0.5, display: 'block' }} />
                <p style={{ fontSize: '0.88rem', fontWeight: 600 }}>No hay asesores cargados en este momento.</p>
                <p style={{ fontSize: '0.78rem', marginTop: '4px' }}>Si creaste tu asesor en otro dispositivo, tocá "Actualizar Nube".</p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '14px' }}>
                  <button
                    type="button"
                    onClick={() => refreshData(true)}
                    className="btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '8px 14px' }}
                  >
                    <RefreshCw size={14} /> Actualizar Nube
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('register')}
                    className="btn-primary"
                    style={{ fontSize: '0.8rem', padding: '8px 14px' }}
                  >
                    Registrar Asesor
                  </button>
                </div>
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
                        {member.points || 0} pts
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
                Para evitar duplicados, cada celular o PC tiene su asesor asignado.<br/>
                Si querés usar el perfil que creaste en la PC, seleccionalo en la pestaña <strong>"Seleccionar"</strong>.
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
                Ver lista de asesores ({team.length})
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
                style={{ padding: '12px', fontSize: '0.9rem', marginTop: '4px' }}
              >
                <Sparkles size={16} /> Crear Perfil de Asesor (+100 pts de bienvenida)
              </button>
            </form>
          )
        )}

      </div>
    </div>
  );
}
