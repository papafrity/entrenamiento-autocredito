import React, { useState, useEffect } from 'react';
import { getTeamMembers, getCurrentUserProfile, updateCurrentUserProfile, updateAdvisorById, deleteAdvisor, subscribeToRealtimeUpdates, syncFromCloud } from '../services/storageService';
import { BADGES_CATALOG } from '../data/teamData';
import { Trophy, Award, Medal, Users, Edit3, Check, Star, ShieldCheck, UserPlus, RefreshCw, Trash2, Pencil } from 'lucide-react';

export default function TeamLeaderboard({ onOpenAuthModal }) {
  const [team, setTeam] = useState(getTeamMembers());
  const [userProfile, setUserProfile] = useState(getCurrentUserProfile());
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBranch, setEditBranch] = useState('');
  const [editRole, setEditRole] = useState('PAI');
  const [editAvatar, setEditAvatar] = useState('👨‍💼');

  const [isSyncing, setIsSyncing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editRow, setEditRow] = useState({ name: '', branch: '', role: 'PAI', avatar: '👨‍💼' });

  const avatarsList = ['👨‍💼', '👩‍💼', '🧑‍💻', '👨‍🔧', '👩‍💻', '🤵', '🦸‍♂️', '🏎️'];

  useEffect(() => {
    loadData();
    syncFromCloud(); // Sincroniza al entrar
    const unsubscribe = subscribeToRealtimeUpdates((event) => {
      if (event.type === 'TEAM_UPDATED') {
        setTeam(event.payload);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSyncCloud = async () => {
    setIsSyncing(true);
    try {
      await syncFromCloud();
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  const loadData = () => {
    const currentTeam = getTeamMembers();
    const currentProf = getCurrentUserProfile();
    setTeam(currentTeam);
    setUserProfile(currentProf);
    if (currentProf) {
      setEditName(currentProf.name);
      setEditBranch(currentProf.branch);
      setEditRole(currentProf.role || 'PAI');
      setEditAvatar(currentProf.avatar);
    }
  };

  const handleSaveProfile = async (e) => {
    e?.preventDefault();
    if (!userProfile) return;
    const updated = {
      ...userProfile,
      name: editName.trim() || 'Mi Asesor',
      branch: editBranch.trim() || 'Sucursal Central',
      role: editRole,
      avatar: editAvatar
    };
    await updateCurrentUserProfile(updated);
    setUserProfile(updated);
    setIsEditingProfile(false);
    loadData();
  };

  const handleDeleteRow = async (id, name) => {
    if (!confirm(`¿Borrar a "${name}"?`)) return;
    await deleteAdvisor(id);
    loadData();
  };
  const handleEditRow = (m) => {
    setEditingId(m.id);
    setEditRow({ name: m.name, branch: m.branch, role: m.role || 'PAI', avatar: m.avatar });
  };
  const handleSaveRow = async (id) => {
    if (!editRow.name.trim()) return;
    await updateAdvisorById(id, { name: editRow.name.trim(), branch: editRow.branch.trim() || 'Sucursal Central', role: editRow.role, avatar: editRow.avatar });
    setEditingId(null);
    loadData();
  };

  // Ordenar miembros por puntos descendentes
  const sortedTeam = [...team].sort((a, b) => b.points - a.points);
  const activeUser = userProfile || (team.length > 0 ? team[0] : null);

  return (
    <div style={{ padding: '0 12px 30px 12px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      
      {/* User Status Card */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px', background: 'linear-gradient(135deg, rgba(255, 159, 28, 0.12) 0%, rgba(18, 25, 41, 0.85) 100%)', border: '1px solid rgba(255, 159, 28, 0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '2.5rem', background: 'rgba(0,0,0,0.3)', padding: '6px', borderRadius: '50%' }}>
              {activeUser ? activeUser.avatar : '👤'}
            </span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                  {activeUser ? activeUser.name : 'Asesor No Registrado'}
                </h2>
                {activeUser && (
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    background: activeUser.role === 'PAOI' ? 'rgba(255, 159, 28, 0.25)' : 'rgba(46, 196, 182, 0.2)',
                    color: activeUser.role === 'PAOI' ? 'var(--primary)' : 'var(--accent-green)',
                    border: activeUser.role === 'PAOI' ? '1px solid var(--primary)' : '1px solid var(--accent-green)'
                  }}>
                    {activeUser.role === 'PAOI' ? '🛡️ PAOI (Supervisor)' : '👔 PAI (Asesor)'}
                  </span>
                )}
                {activeUser && (
                  <span className="badge badge-medium" style={{ fontSize: '0.68rem' }}>{activeUser.branch}</span>
                )}
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {activeUser 
                  ? `⭐ ${activeUser.points || 0} Puntos Totales • 🎯 ${activeUser.simulationsCompleted || 0} Simulaciones Aprobadas`
                  : 'Registrate para empezar a sumar puntos en el ranking y desbloquear medallas.'
                }
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={handleSyncCloud}
              disabled={isSyncing}
              className="btn-secondary"
              style={{ fontSize: '0.8rem', padding: '8px 12px', gap: '6px' }}
              title="Sincronizar asesores y puntos desde la nube"
            >
              <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
              <span>{isSyncing ? 'Sincronizando...' : 'Nube'}</span>
            </button>

            {activeUser ? (
              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="btn-secondary"
                style={{ fontSize: '0.8rem', padding: '8px 14px' }}
              >
                <Edit3 size={15} /> {isEditingProfile ? 'Cerrar Edición' : 'Editar Perfil'}
              </button>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="btn-primary"
                style={{ fontSize: '0.82rem', padding: '8px 16px', gap: '6px' }}
              >
                <UserPlus size={15} /> Registrar Mi Perfil
              </button>
            )}
          </div>
        </div>

        {/* Profile Edit Form */}
        {isEditingProfile && activeUser && (
          <form onSubmit={handleSaveProfile} style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', alignItems: 'flex-end' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Nombre del Asesor:</label>
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.85rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Cargo / Rol:</label>
              <select
                value={editRole}
                onChange={e => setEditRole(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.85rem' }}
              >
                <option value="PAI">👔 PAI (Asesor Comercial)</option>
                <option value="PAOI">🛡️ PAOI (Supervisor / Organizador)</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Sucursal / Zona:</label>
              <input
                type="text"
                value={editBranch}
                onChange={e => setEditBranch(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.85rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Avatar:</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {avatarsList.map(av => (
                  <button
                    type="button"
                    key={av}
                    onClick={() => setEditAvatar(av)}
                    style={{
                      background: editAvatar === av ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '4px 6px',
                      cursor: 'pointer',
                      fontSize: '1.1rem'
                    }}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              <Check size={16} /> Guardar
            </button>
          </form>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Left Column: Leaderboard Ranking */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Trophy size={22} color="var(--primary)" />
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Ranking del Equipo ({team.length} asesores)</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Puntos por ventas simuladas, objeciones y visitas</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {sortedTeam.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 16px', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '0.9rem', marginBottom: '10px' }}>Aún no hay asesores registrados en el equipo.</p>
                <button
                  onClick={onOpenAuthModal}
                  className="btn-primary"
                  style={{ fontSize: '0.82rem', padding: '8px 16px' }}
                >
                  ¡Sé el primero en registrarte!
                </button>
              </div>
            ) : (
              sortedTeam.map((member, index) => {
                const isFirst = index === 0;
                const isSecond = index === 1;
                const isThird = index === 2;
                const isCurrent = activeUser && member.id === activeUser.id;
                const canManage = activeUser && (activeUser.role === 'PAOI' || member.id === activeUser.id);
                const isRowEditing = editingId === member.id;
                if (isRowEditing) {
                  return (
                    <div key={member.id} style={{ padding: '12px', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--primary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <input value={editRow.name} onChange={e=>setEditRow({...editRow,name:e.target.value})} placeholder="Nombre" style={{ padding:'8px', background:'var(--bg-input)', border:'1px solid var(--border-color)', borderRadius:'6px', color:'var(--text-main)', fontSize:'0.85rem' }} />
                      <div style={{ display:'flex', gap:'6px' }}>
                        <input value={editRow.branch} onChange={e=>setEditRow({...editRow,branch:e.target.value})} placeholder="Sucursal" style={{ flex:1, padding:'8px', background:'var(--bg-input)', border:'1px solid var(--border-color)', borderRadius:'6px', color:'var(--text-main)', fontSize:'0.8rem' }} />
                        <select value={editRow.role} onChange={e=>setEditRow({...editRow,role:e.target.value})} style={{ padding:'8px', background:'var(--bg-input)', border:'1px solid var(--border-color)', borderRadius:'6px', color:'var(--text-main)', fontSize:'0.8rem' }}>
                          <option value="PAI">PAI</option>
                          <option value="PAOI">PAOI</option>
                        </select>
                      </div>
                      <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
                        {avatarsList.map(av=>(
                          <button key={av} type="button" onClick={()=>setEditRow({...editRow,avatar:av})} style={{ background: editRow.avatar===av?'var(--primary)':'rgba(255,255,255,0.08)', border:'none', borderRadius:'6px', padding:'4px 6px', cursor:'pointer' }}>{av}</button>
                        ))}
                      </div>
                      <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
                        <button type="button" onClick={()=>setEditingId(null)} className="btn-secondary" style={{ fontSize:'0.78rem', padding:'6px 12px' }}>Cancelar</button>
                        <button type="button" onClick={()=>handleSaveRow(member.id)} className="btn-primary" style={{ fontSize:'0.78rem', padding:'6px 12px' }}><Check size={14}/> Guardar</button>
                      </div>
                    </div>
                  );
                }
                return (
                  <div
                    key={member.id}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-sm)',
                      background: isCurrent ? 'rgba(255, 159, 28, 0.15)' : 'rgba(255,255,255,0.03)',
                      border: isCurrent ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap:'8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex:1, minWidth:0 }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: isFirst ? 'var(--primary)' : isSecond ? '#94a3b8' : isThird ? '#cd7f32' : 'rgba(255,255,255,0.1)',
                        color: isFirst || isSecond || isThird ? '#000' : 'var(--text-muted)',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.85rem',
                        flexShrink:0
                      }}>
                        {index + 1}
                      </div>

                      <span style={{ fontSize: '1.4rem' }}>{member.avatar}</span>

                      <div style={{ minWidth:0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap:'wrap' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>
                            {member.name}
                          </span>
                          <span style={{
                            fontSize: '0.62rem',
                            fontWeight: 800,
                            padding: '1px 5px',
                            borderRadius: '4px',
                            background: member.role === 'PAOI' ? 'rgba(255, 159, 28, 0.25)' : 'rgba(46, 196, 182, 0.2)',
                            color: member.role === 'PAOI' ? 'var(--primary)' : 'var(--accent-green)'
                          }}>
                            {member.role || 'PAI'}
                          </span>
                          {isCurrent && <span style={{ color: 'var(--primary)', fontSize: '0.72rem', fontWeight: 600 }}>(Tú)</span>}
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {member.branch} • {member.simulationsCompleted || 0} simulaciones
                        </span>
                      </div>
                    </div>

                    <div style={{ display:'flex', alignItems:'center', gap:'6px', flexShrink:0 }}>
                      <div style={{ textAlign: 'right' }}>
                        <strong style={{ fontSize: '1.05rem', color: 'var(--primary)' }}>{member.points}</strong>
                        <p style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>pts</p>
                      </div>
                      {canManage && (
                        <button type="button" onClick={()=>handleEditRow(member)} title="Editar" style={{ background:'rgba(255,255,255,0.06)', border:'1px solid var(--border-color)', borderRadius:'6px', padding:'5px', cursor:'pointer', color:'var(--text-muted)' }}><Pencil size={12}/></button>
                      )}
                      {canManage && team.length>1 && (
                        <button type="button" onClick={()=>handleDeleteRow(member.id, member.name)} title="Borrar" style={{ background:'rgba(230,57,70,0.12)', border:'1px solid rgba(230,57,70,0.3)', borderRadius:'6px', padding:'5px', cursor:'pointer', color:'var(--accent-red)' }}><Trash2 size={12}/></button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Badges Wall */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Award size={22} color="var(--secondary)" />
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Muro de Insignias y Logros</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Desbloqueá medallas practicando y agendando salidas</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: '10px' }}>
            {BADGES_CATALOG.map(badge => {
              const isUnlocked = activeUser?.unlockedBadges?.includes(badge.id);
              return (
                <div
                  key={badge.id}
                  style={{
                    padding: '12px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: isUnlocked ? 'rgba(46, 196, 182, 0.1)' : 'rgba(0, 0, 0, 0.3)',
                    border: isUnlocked ? '1px solid rgba(46, 196, 182, 0.4)' : '1px solid rgba(255,255,255,0.05)',
                    textAlign: 'center',
                    opacity: isUnlocked ? 1 : 0.45,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span style={{ fontSize: '1.8rem', filter: isUnlocked ? 'none' : 'grayscale(100%)' }}>
                    {badge.icon}
                  </span>
                  <strong style={{ fontSize: '0.8rem', color: isUnlocked ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                    {badge.title}
                  </strong>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', lineHeight: 1.2 }}>
                    {badge.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
