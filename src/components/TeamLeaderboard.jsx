import React, { useState, useEffect } from 'react';
import { getTeamMembers, getCurrentUserProfile, updateCurrentUserProfile, updateAdvisorById, deleteAdvisor, subscribeToRealtimeUpdates, syncFromCloud } from '../services/storageService';
import { BADGES_CATALOG } from '../data/teamData';
import { Trophy, Award, Medal, Users, Edit3, Check, Star, ShieldCheck, UserPlus, RefreshCw, Trash2, Pencil, MapPin } from 'lucide-react';
import { PROVINCIAS_LIST, getAgenciasByProvincia } from '../data/agenciasData';

export default function TeamLeaderboard({ onOpenAuthModal }) {
  const [team, setTeam] = useState(getTeamMembers());
  const [userProfile, setUserProfile] = useState(getCurrentUserProfile());
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editProvincia, setEditProvincia] = useState('');
  const [editBranch, setEditBranch] = useState('');
  const [editRole, setEditRole] = useState('PAI');
  const [editAvatar, setEditAvatar] = useState('👨‍💼');

  const [isSyncing, setIsSyncing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editRow, setEditRow] = useState({ name: '', provincia: '', branch: '', role: 'PAI', avatar: '👨‍💼' });
  const [saveMsg, setSaveMsg] = useState('');
  const [expandedMember, setExpandedMember] = useState(null);
  const [branchFilter, setBranchFilter] = useState('mine'); // mine | all

  const avatarsList = ['👨‍💼', '👩‍💼', '🧑‍💻', '👨‍🔧', '👩‍💻', '🤵', '🦸‍♂️', '🏎️'];

  useEffect(() => {
    loadData();
    syncFromCloud();
    const unsubscribe = subscribeToRealtimeUpdates((event) => {
      if (event.type === 'TEAM_UPDATED') {
        setTeam(event.payload);
        // refrescar activeUser también
        const prof = event.payload.find(m => m.id === getCurrentUserProfile()?.id) || event.payload[0];
        if (prof) setUserProfile(prof);
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
      setEditProvincia(currentProf.provincia || '');
      setEditBranch(currentProf.branch);
      setEditRole(currentProf.role || 'PAI');
      setEditAvatar(currentProf.avatar);
    }
  };

  const handleSaveProfile = async (e) => {
    e?.preventDefault();
    if (!userProfile) return;
    if (!editName.trim()) { setSaveMsg('❌ El nombre no puede estar vacío'); setTimeout(()=>setSaveMsg(''),2500); return; }
    try {
      const updated = {
        ...userProfile,
        name: editName.trim(),
        provincia: editProvincia,
        branch: editBranch.trim() || 'Sucursal Central',
        role: editRole,
        avatar: editAvatar
      };
      await updateCurrentUserProfile(updated);
      setUserProfile(updated);
      setSaveMsg('✅ Perfil guardado correctamente');
      setTimeout(()=>{ setSaveMsg(''); setIsEditingProfile(false); loadData(); }, 1200);
    } catch(err){
      setSaveMsg('❌ '+err.message);
      setTimeout(()=>setSaveMsg(''),2500);
    }
  };

  const handleDeleteRow = async (id, name) => {
    if (!confirm(`¿Borrar a "${name}"?`)) return;
    await deleteAdvisor(id);
    loadData();
  };
  const handleEditRow = (m) => {
    setEditingId(m.id);
    setEditRow({ name: m.name, provincia: m.provincia || '', branch: m.branch, role: m.role || 'PAI', avatar: m.avatar });
  };
  const handleSaveRow = async (id) => {
    if (!editRow.name.trim()) return;
    await updateAdvisorById(id, { name: editRow.name.trim(), provincia: editRow.provincia, branch: editRow.branch.trim() || 'Sucursal Central', role: editRow.role, avatar: editRow.avatar });
    setEditingId(null);
    loadData();
  };

  // Ordenar miembros por puntos descendentes — activeUser debe ir primero (evita TDZ)
  const activeUser = userProfile || (team.length > 0 ? team[0] : null);
  const baseTeam = branchFilter === 'mine' && activeUser?.branch
    ? team.filter(m => m.branch === activeUser.branch)
    : team;
  const sortedTeam = [...baseTeam].sort((a, b) => b.points - a.points);
  const branchTeam = activeUser?.branch ? team.filter(m => m.branch === activeUser.branch) : [];
  const argentinaTeam = [...team].sort((a,b)=>b.points-a.points);

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

        {/* Profile Edit Form — con Provincia y Sucursal sin desborde */}
        {isEditingProfile && activeUser && (
          <form onSubmit={handleSaveProfile} style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', alignItems: 'flex-end' }}>
            <div style={{ minWidth: 0 }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Nombre del Asesor:</label>
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                style={{ width: '100%', minWidth: 0, padding: '8px 10px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.85rem' }}
              />
            </div>
            <div style={{ minWidth: 0 }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Cargo / Rol:</label>
              <select
                value={editRole}
                onChange={e => setEditRole(e.target.value)}
                style={{ width: '100%', minWidth: 0, padding: '8px 10px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.85rem' }}
              >
                <option value="PAI">👔 PAI (Asesor Comercial)</option>
                <option value="PAOI">🛡️ PAOI (Supervisor / Organizador)</option>
              </select>
            </div>
            <div style={{ minWidth: 0 }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><MapPin size={10} style={{ display: 'inline', marginRight: '4px' }} />Provincia:</label>
              <select
                value={editProvincia}
                onChange={e => { setEditProvincia(e.target.value); setEditBranch(''); }}
                style={{ width: '100%', minWidth: 0, padding: '8px 10px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.85rem' }}
              >
                <option value="">— Seleccioná —</option>
                {PROVINCIAS_LIST.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div style={{ minWidth: 0 }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Sucursal / Agencia:</label>
              {editProvincia ? (
                <select
                  value={editBranch}
                  onChange={e => setEditBranch(e.target.value)}
                  style={{ width: '100%', minWidth: 0, padding: '8px 10px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.85rem' }}
                >
                  <option value="">— Seleccioná agencia —</option>
                  {getAgenciasByProvincia(editProvincia).map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              ) : (
                <input
                  type="text"
                  value={editBranch}
                  onChange={e => setEditBranch(e.target.value)}
                  placeholder="Ej: San Martín"
                  style={{ width: '100%', minWidth: 0, padding: '8px 10px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.85rem' }}
                />
              )}
            </div>
            <div style={{ minWidth: 0 }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Avatar:</label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
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
            <button type="submit" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem', alignSelf: 'flex-end' }}>
              <Check size={16} /> Guardar
            </button>
            {saveMsg && <div style={{ gridColumn: '1 / -1', padding: '8px 12px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, background: saveMsg.startsWith('✅') ? 'rgba(46,196,182,0.12)' : 'rgba(230,57,70,0.12)', border: saveMsg.startsWith('✅') ? '1px solid rgba(46,196,182,0.3)' : '1px solid rgba(230,57,70,0.3)', color: saveMsg.startsWith('✅') ? 'var(--accent-green)' : 'var(--accent-red)' }}>{saveMsg}</div>}
          </form>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Left Column: Leaderboard Ranking */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Trophy size={22} color="var(--primary)" />
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Ranking ({sortedTeam.length} asesores)</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{branchFilter==='mine' ? `Sucursal: ${activeUser?.branch || '-'}` : 'Toda Argentina'} • Puntos y medallas</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px', background: 'rgba(0,0,0,0.3)', padding: '3px', borderRadius: 'var(--radius-sm)' }}>
              <button onClick={()=>setBranchFilter('mine')} className={branchFilter==='mine'?'btn-primary':'btn-secondary'} style={{ fontSize:'0.72rem', padding:'5px 10px' }}>Mi sucursal ({branchTeam.length})</button>
              <button onClick={()=>setBranchFilter('all')} className={branchFilter==='all'?'btn-primary':'btn-secondary'} style={{ fontSize:'0.72rem', padding:'5px 10px' }}>Argentina ({team.length})</button>
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
                    <div key={member.id} style={{ padding: '12px', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--primary)', display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 0 }}>
                      <input value={editRow.name} onChange={e=>setEditRow({...editRow,name:e.target.value})} placeholder="Nombre" style={{ padding:'8px', background:'var(--bg-input)', border:'1px solid var(--border-color)', borderRadius:'6px', color:'var(--text-main)', fontSize:'0.85rem', minWidth: 0 }} />
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '6px' }}>
                        <select value={editRow.provincia} onChange={e=>setEditRow({...editRow,provincia:e.target.value, branch: ''})} style={{ padding:'8px', background:'var(--bg-input)', border:'1px solid var(--border-color)', borderRadius:'6px', color:'var(--text-main)', fontSize:'0.8rem', minWidth: 0 }}>
                          <option value="">Provincia</option>
                          {PROVINCIAS_LIST.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        {editRow.provincia ? (
                          <select value={editRow.branch} onChange={e=>setEditRow({...editRow,branch:e.target.value})} style={{ padding:'8px', background:'var(--bg-input)', border:'1px solid var(--border-color)', borderRadius:'6px', color:'var(--text-main)', fontSize:'0.8rem', minWidth: 0 }}>
                            <option value="">Agencia</option>
                            {getAgenciasByProvincia(editRow.provincia).map(a => <option key={a} value={a}>{a}</option>)}
                          </select>
                        ) : (
                          <input value={editRow.branch} onChange={e=>setEditRow({...editRow,branch:e.target.value})} placeholder="Sucursal" style={{ padding:'8px', background:'var(--bg-input)', border:'1px solid var(--border-color)', borderRadius:'6px', color:'var(--text-main)', fontSize:'0.8rem', minWidth: 0 }} />
                        )}
                        <select value={editRow.role} onChange={e=>setEditRow({...editRow,role:e.target.value})} style={{ padding:'8px', background:'var(--bg-input)', border:'1px solid var(--border-color)', borderRadius:'6px', color:'var(--text-main)', fontSize:'0.8rem', minWidth: 0 }}>
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
                const memberBadges = BADGES_CATALOG.filter(b=>member.unlockedBadges?.includes(b.id));
                const isExpanded = expandedMember === member.id;
                return (
                  <div
                    key={member.id}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-sm)',
                      background: isCurrent ? 'rgba(255, 159, 28, 0.15)' : 'rgba(255,255,255,0.03)',
                      border: isCurrent ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: isExpanded ? '10px' : 0
                    }}
                  >
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:'8px' }}>
                      <div onClick={()=>setExpandedMember(isExpanded?null:member.id)} style={{ display: 'flex', alignItems: 'center', gap: '12px', flex:1, minWidth:0, cursor:'pointer' }}>
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
                            <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{member.name}</span>
                            <span style={{ fontSize: '0.62rem', fontWeight: 800, padding: '1px 5px', borderRadius: '4px', background: member.role === 'PAOI' ? 'rgba(255, 159, 28, 0.25)' : 'rgba(46, 196, 182, 0.2)', color: member.role === 'PAOI' ? 'var(--primary)' : 'var(--accent-green)' }}>{member.role || 'PAI'}</span>
                            {isCurrent && <span style={{ color: 'var(--primary)', fontSize: '0.72rem', fontWeight: 600 }}>(Tú)</span>}
                          </div>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{member.branch} • {member.simulationsCompleted || 0} sims • {memberBadges.length} medallas</span>
                        </div>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:'6px', flexShrink:0 }}>
                        <div style={{ textAlign: 'right' }}>
                          <strong style={{ fontSize: '1.05rem', color: 'var(--primary)' }}>{member.points}</strong>
                          <p style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>pts</p>
                        </div>
                        {memberBadges.length>0 && <span style={{ fontSize:'0.85rem' }}>{memberBadges[0].icon}</span>}
                        {canManage && (
                          <button type="button" onClick={()=>handleEditRow(member)} title="Editar" style={{ background:'rgba(255,255,255,0.06)', border:'1px solid var(--border-color)', borderRadius:'6px', padding:'5px', cursor:'pointer', color:'var(--text-muted)' }}><Pencil size={12}/></button>
                        )}
                        {canManage && team.length>1 && (
                          <button type="button" onClick={()=>handleDeleteRow(member.id, member.name)} title="Borrar" style={{ background:'rgba(230,57,70,0.12)', border:'1px solid rgba(230,57,70,0.3)', borderRadius:'6px', padding:'5px', cursor:'pointer', color:'var(--accent-red)' }}><Trash2 size={12}/></button>
                        )}
                      </div>
                    </div>
                    {isExpanded && (
                      <div style={{ paddingTop:'10px', borderTop:'1px solid var(--border-color)', display:'flex', flexDirection:'column', gap:'8px' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                          <span style={{ fontSize:'0.7rem', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase' }}>Medallas de {member.name.split(' ')[0]} ({memberBadges.length}):</span>
                          <button onClick={(e)=>{ e.stopPropagation(); setExpandedMember(null); }} className="btn-secondary" style={{ fontSize:'0.7rem', padding:'4px 10px' }}>✕ Cerrar</button>
                        </div>
                        {memberBadges.length===0 ? <span style={{ fontSize:'0.78rem', color:'var(--text-dim)' }}>Aún sin medallas — ¡a entrenar!</span> : (
                          <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                            {memberBadges.map(b=>(
                              <span key={b.id} title={b.title+': '+b.description} style={{ display:'inline-flex', alignItems:'center', gap:'4px', padding:'4px 8px', borderRadius:'20px', background:'rgba(46,196,182,0.12)', border:'1px solid rgba(46,196,182,0.3)', fontSize:'0.72rem', color:'var(--accent-green)' }}>{b.icon} {b.title}</span>
                            ))}
                          </div>
                        )}
                        <div style={{ fontSize:'0.72rem', color:'var(--text-dim)' }}>Provincia: {member.provincia || '-'} • Tel: {member.phone || '-'}</div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Two walls — Mi sucursal / Argentina */}
        <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
          {/* Muro Sucursal */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Award size={20} color="var(--primary)" />
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Muro Sucursal — {activeUser?.branch || 'Mi sucursal'}</h3>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{branchTeam.length} asesores • Méritos de tu equipo local</p>
              </div>
            </div>
            {branchTeam.length===0 ? <p style={{ fontSize:'0.82rem', color:'var(--text-dim)', textAlign:'center', padding:'16px' }}>Sin compañeros en esta sucursal aún</p> : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(130px,1fr))', gap:'8px' }}>
                {branchTeam.sort((a,b)=>b.points-a.points).map(m=>(
                  <div key={m.id} style={{ padding:'10px', borderRadius:'var(--radius-sm)', background: m.id===activeUser?.id?'rgba(255,159,28,0.12)':'rgba(255,255,255,0.03)', border: m.id===activeUser?.id?'1px solid var(--primary)':'1px solid var(--border-color)', textAlign:'center' }}>
                    <div style={{ fontSize:'1.4rem' }}>{m.avatar}</div>
                    <strong style={{ fontSize:'0.78rem', display:'block', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{m.name.split(' ')[0]}</strong>
                    <span style={{ fontSize:'0.7rem', color:'var(--primary)', fontWeight:700 }}>{m.points} pts</span>
                    <div style={{ display:'flex', gap:'3px', justifyContent:'center', marginTop:'4px', flexWrap:'wrap' }}>
                      {(m.unlockedBadges||[]).slice(0,4).map(bid=>{
                        const b=BADGES_CATALOG.find(x=>x.id===bid);
                        return b? <span key={bid} title={b.title} style={{ fontSize:'0.9rem' }}>{b.icon}</span>:null;
                      })}
                      {(m.unlockedBadges||[]).length>4 && <span style={{ fontSize:'0.65rem', color:'var(--text-dim)' }}>+{m.unlockedBadges.length-4}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Muro Argentina */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Trophy size={20} color="var(--secondary)" />
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Muro Argentina — Todos</h3>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{team.length} asesores • Ranking nacional</p>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(130px,1fr))', gap:'8px' }}>
              {argentinaTeam.slice(0,12).map(m=>(
                <div key={m.id} style={{ padding:'10px', borderRadius:'var(--radius-sm)', background: m.id===activeUser?.id?'rgba(0,180,216,0.1)':'rgba(255,255,255,0.03)', border: m.id===activeUser?.id?'1px solid var(--secondary)':'1px solid var(--border-color)', textAlign:'center' }}>
                  <div style={{ fontSize:'1.3rem' }}>{m.avatar}</div>
                  <strong style={{ fontSize:'0.74rem', display:'block', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{m.name.split(' ')[0]} — {m.branch?.slice(0,12)}</strong>
                  <span style={{ fontSize:'0.7rem', color:'var(--secondary)', fontWeight:700 }}>{m.points} pts</span>
                </div>
              ))}
            </div>
          </div>
          {/* Mis medallas detallado */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Star size={20} color="var(--accent-green)" />
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Mis Insignias</h3>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{activeUser?.unlockedBadges?.length||0} desbloqueadas</p>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(135px,1fr))', gap:'10px' }}>
              {BADGES_CATALOG.map(badge => {
                const isUnlocked = activeUser?.unlockedBadges?.includes(badge.id);
                return (
                  <div key={badge.id} style={{ padding:'12px 10px', borderRadius:'var(--radius-sm)', background: isUnlocked ? 'rgba(46,196,182,0.1)' : 'rgba(0,0,0,0.3)', border: isUnlocked?'1px solid rgba(46,196,182,0.4)':'1px solid rgba(255,255,255,0.05)', textAlign:'center', opacity: isUnlocked?1:0.45, display:'flex', flexDirection:'column', alignItems:'center', gap:'4px' }}>
                    <span style={{ fontSize:'1.8rem', filter: isUnlocked?'none':'grayscale(100%)' }}>{badge.icon}</span>
                    <strong style={{ fontSize:'0.8rem', color: isUnlocked?'var(--accent-green)':'var(--text-muted)' }}>{badge.title}</strong>
                    <p style={{ fontSize:'0.7rem', color:'var(--text-dim)', lineHeight:1.2 }}>{badge.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
