import React, { useState, useEffect } from 'react';
import { getTeamMembers, getCarReservations, awardPointsToCurrentUser, saveTeamMembers, syncFromCloud } from '../services/storageService';
import { ShieldCheck, Users, Trophy, Car, Award, Download, Plus, Star, Lock, Unlock, RefreshCw, CheckCircle2, TrendingUp, Target, Edit3, Check, Sparkles, Flame } from 'lucide-react';

const GOAL_STORAGE_KEY = 'autocredito_agency_monthly_goal_v1';

export default function SupervisorDashboard() {
  const [team, setTeam] = useState(getTeamMembers());
  const [reservations, setReservations] = useState(getCarReservations());
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [bonusSuccessMsg, setBonusSuccessMsg] = useState('');

  // Metas de la agencia
  const [monthlySalesGoal, setMonthlySalesGoal] = useState(() => {
    return Number(localStorage.getItem(GOAL_STORAGE_KEY)) || 30;
  });
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [editGoalInput, setEditGoalInput] = useState(monthlySalesGoal);

  // PIN por defecto para el supervisor de agencia (fácil de usar)
  const SUPERVISOR_PIN = '1234';

  useEffect(() => {
    loadData();
    syncFromCloud();
  }, []);

  const loadData = () => {
    setTeam(getTeamMembers());
    setReservations(getCarReservations());
  };

  const handleUnlock = (e) => {
    e.preventDefault();
    if (pinInput.trim() === SUPERVISOR_PIN || pinInput.trim() === 'autocredito') {
      setIsUnlocked(true);
      setPinError('');
    } else {
      setPinError('PIN incorrecto. (PIN por defecto: 1234)');
    }
  };

  const handleSync = async () => {
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

  const handleSaveGoal = (e) => {
    e?.preventDefault();
    const parsed = Number(editGoalInput);
    if (parsed > 0) {
      setMonthlySalesGoal(parsed);
      localStorage.setItem(GOAL_STORAGE_KEY, String(parsed));
      setIsEditingGoal(false);
      setBonusSuccessMsg(`¡Meta mensual de agencia actualizada a ${parsed} suscripciones!`);
      setTimeout(() => setBonusSuccessMsg(''), 3000);
    }
  };

  const handleAddRealSale = async (advisorId) => {
    const currentTeam = getTeamMembers();
    const index = currentTeam.findIndex(a => a.id === advisorId);
    if (index !== -1) {
      const adv = currentTeam[index];
      adv.salesClosed = (adv.salesClosed || 0) + 1;
      adv.points = (adv.points || 0) + 150; // +150 pts por venta real
      if (!adv.unlockedBadges.includes('closer_star')) {
        adv.unlockedBadges.push('closer_star');
      }
      await saveTeamMembers(currentTeam);
      loadData();
      setBonusSuccessMsg(`🎉 ¡Venta registrada para ${adv.name}! (+150 pts y +1 al objetivo de agencia)`);
      setTimeout(() => setBonusSuccessMsg(''), 3500);
    }
  };

  const handleAwardBonus = async (advisorId, bonusPoints, reason) => {
    const currentTeam = getTeamMembers();
    const index = currentTeam.findIndex(a => a.id === advisorId);
    if (index !== -1) {
      currentTeam[index].points = (currentTeam[index].points || 0) + bonusPoints;
      await saveTeamMembers(currentTeam);
      loadData();
      setBonusSuccessMsg(`¡+${bonusPoints} pts otorgados a ${currentTeam[index].name} por ${reason}!`);
      setTimeout(() => setBonusSuccessMsg(''), 3000);
    }
  };

  const handleExportTeamReport = () => {
    const headers = 'ID;Nombre;Provincia;Sucursal;Telefono;Puntos;Ventas_Reales;Simulaciones;Insignias;Fecha_Alta\n';
    const rows = team.map(a => 
      `${a.id};${a.name};${a.provincia || ''};${a.branch};${a.phone};${a.points || 0};${a.salesClosed || 0};${a.simulationsCompleted || 0};${(a.unlockedBadges || []).join('|')};${a.createdAt || ''}`
    ).join('\n');

    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_agencia_autocredito_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Métricas globales
  const totalPoints = team.reduce((acc, a) => acc + (a.points || 0), 0);
  const avgPoints = team.length > 0 ? Math.round(totalPoints / team.length) : 0;
  const totalSimulations = team.reduce((acc, a) => acc + (a.simulationsCompleted || 0), 0);
  const totalRealSales = team.reduce((acc, a) => acc + (a.salesClosed || 0), 0);

  // Cálculo de campaña 21-20 (21 del mes anterior al 20 del actual)
  const goalProgress = Math.min(100, Math.round((totalRealSales / monthlySalesGoal) * 100));
  const now = new Date();
  const getCampaignProgress = () => {
    const y = now.getFullYear(), m = now.getMonth(), d = now.getDate();
    const start = new Date(y, m, 21);
    if (d < 21) start.setMonth(m - 1);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 20);
    const totalMs = end - start;
    const elapsedMs = now - start;
    const totalDays = Math.round(totalMs / 86400000);
    const elapsedDays = Math.max(0, Math.min(totalDays, Math.floor(elapsedMs / 86400000) + 1));
    return { start, end, totalDays, elapsedDays, monthProgress: Math.round((elapsedDays / totalDays)*100), currentDay: elapsedDays, totalDaysInMonth: totalDays };
  };
  const { start: campStart, end: campEnd, monthProgress, currentDay, totalDaysInMonth } = getCampaignProgress();

  // Pantalla de Bloqueo por PIN
  if (!isUnlocked) {
    return (
      <div style={{ padding: '40px 16px', maxWidth: '460px', margin: '0 auto', width: '100%' }}>
        <div className="glass-panel" style={{ padding: '30px 24px', textAlign: 'center' }}>
          <div style={{
            background: 'rgba(255, 159, 28, 0.15)',
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            margin: '0 auto 16px auto'
          }}>
            🛡️
          </div>
          
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Panel del Supervisor</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', marginBottom: '20px' }}>
            Acceso exclusivo para Gerentes, Supervisores y Capacitadores de Agencia.
          </p>

          <form onSubmit={handleUnlock} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '6px', textAlign: 'left' }}>
                Ingresá el PIN de Supervisor:
              </label>
              <input
                type="password"
                placeholder="PIN (por defecto: 1234)"
                value={pinInput}
                onChange={e => setPinInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-main)',
                  fontSize: '1rem',
                  textAlign: 'center',
                  letterSpacing: '3px'
                }}
                autoFocus
              />
            </div>

            {pinError && (
              <p style={{ color: 'var(--accent-red)', fontSize: '0.78rem', margin: 0 }}>{pinError}</p>
            )}

            <button
              type="submit"
              className="btn-primary"
              style={{ padding: '12px', fontSize: '0.9rem', marginTop: '6px' }}
            >
              <Unlock size={16} /> Desbloquear Panel de Agencia
            </button>
          </form>

          <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '16px' }}>
            PIN de acceso rápido: <strong>1234</strong>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '0 12px 30px 12px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      
      {/* Header */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, #f77f00 100%)',
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            boxShadow: '0 4px 15px rgba(255, 159, 28, 0.4)'
          }}>
            📊
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                Panel de Supervisión y <span style={{ color: 'var(--primary)' }}>Gestión de Agencia</span>
              </h2>
              <span className="badge badge-medium" style={{ fontSize: '0.65rem' }}>Supervisor Activo</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Metas mensuales del equipo, monitoreo de rendimiento y asignación de bonos de producción.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="btn-secondary"
            style={{ fontSize: '0.8rem', padding: '8px 12px', gap: '6px' }}
          >
            <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
            <span>{isSyncing ? 'Sincronizando...' : 'Actualizar Nube'}</span>
          </button>

          <button
            onClick={handleExportTeamReport}
            className="btn-primary"
            style={{ fontSize: '0.8rem', padding: '8px 14px', gap: '6px' }}
          >
            <Download size={15} /> Exportar Reporte Excel
          </button>
          <button
            onClick={() => setIsUnlocked(false)}
            className="btn-secondary"
            style={{ fontSize: '0.8rem', padding: '8px 12px', gap: '6px', borderColor: 'rgba(230,57,70,0.4)', color: 'var(--accent-red)' }}
          >
            <Lock size={14} /> Cerrar sesión
          </button>
        </div>
      </div>

      {bonusSuccessMsg && (
        <div style={{ background: 'rgba(46, 196, 182, 0.15)', border: '1px solid rgba(46, 196, 182, 0.3)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', color: 'var(--accent-green)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <CheckCircle2 size={18} /> {bonusSuccessMsg}
        </div>
      )}

      {/* METAS Y OBJETIVOS DEL MES PARA EL EQUIPO (Punto 5) */}
      <div className="glass-card" style={{
        padding: '24px',
        marginBottom: '20px',
        border: '2px solid var(--primary)',
        background: 'linear-gradient(135deg, rgba(255, 159, 28, 0.12) 0%, rgba(18, 25, 41, 0.95) 100%)',
        boxShadow: '0 0 25px rgba(255, 159, 28, 0.15)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(255, 159, 28, 0.2)', padding: '8px', borderRadius: '10px' }}>
              <Target size={24} color="var(--primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                🎯 Meta Mensual de Suscripciones del Equipo
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Objetivo de producción de la agencia para la temporada actual
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {!isEditingGoal ? (
              <button
                onClick={() => {
                  setEditGoalInput(monthlySalesGoal);
                  setIsEditingGoal(true);
                }}
                className="btn-secondary"
                style={{ fontSize: '0.78rem', padding: '6px 12px', gap: '4px' }}
              >
                <Edit3 size={13} /> Editar Meta ({monthlySalesGoal} ventas)
              </button>
            ) : (
              <form onSubmit={handleSaveGoal} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={editGoalInput}
                  onChange={e => setEditGoalInput(e.target.value)}
                  style={{ width: '80px', padding: '6px 8px', background: 'var(--bg-input)', border: '1px solid var(--primary)', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '0.85rem', textAlign: 'center' }}
                  autoFocus
                />
                <button type="submit" className="btn-primary" style={{ padding: '6px 10px', fontSize: '0.75rem' }}>
                  <Check size={14} />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Progress Bar Display */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <span style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--primary)', lineHeight: 1 }}>
                {totalRealSales}
              </span>
              <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
                / {monthlySalesGoal} suscripciones logradas
              </span>
            </div>

            <div style={{ textAlign: 'right' }}>
              <strong style={{ fontSize: '1.4rem', color: goalProgress >= 100 ? 'var(--accent-green)' : 'var(--primary)' }}>
                {goalProgress}%
              </strong>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block' }}>
                {goalProgress >= 100 ? '🎉 ¡META SUPERADA!' : `Faltan ${Math.max(0, monthlySalesGoal - totalRealSales)} ventas`}
              </span>
            </div>
          </div>

          {/* Progress Track */}
          <div style={{ width: '100%', height: '14px', background: 'rgba(0,0,0,0.4)', borderRadius: '7px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{
              width: `${goalProgress}%`,
              height: '100%',
              background: goalProgress >= 100
                ? 'linear-gradient(90deg, var(--accent-green) 0%, #48cae4 100%)'
                : 'linear-gradient(90deg, var(--primary) 0%, #f77f00 100%)',
              borderRadius: '7px',
              transition: 'width 0.4s ease'
            }} />
          </div>

          {/* Rhythm / Pacing Indicator — campaña 21-20 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '2px', flexWrap: 'wrap', gap: '6px' }}>
            <span>📅 Campaña {campStart.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })} → {campEnd.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })} — Día {currentDay} de {totalDaysInMonth} ({monthProgress}% transcurrido)</span>
            <span style={{ color: goalProgress >= monthProgress ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 600 }}>
              {goalProgress >= monthProgress ? '⚡ Ritmo por encima de lo esperado' : '⚠️ Se requiere acelerar el ritmo'}
            </span>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '20px' }}>
        
        <div className="glass-card" style={{ padding: '18px', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>ASESORES REGISTRADOS</span>
            <Users size={18} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '6px' }}>
            {team.length}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--accent-green)' }}>En toda la red oficial</span>
        </div>

        <div className="glass-card" style={{ padding: '18px', borderLeft: '4px solid var(--secondary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>VENTAS REALES CERRADAS</span>
            <Flame size={18} color="var(--secondary)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '6px' }}>
            {totalRealSales}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--primary)' }}>Suma directa al objetivo</span>
        </div>

        <div className="glass-card" style={{ padding: '18px', borderLeft: '4px solid var(--accent-green)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>PROMEDIO DE PUNTOS</span>
            <Star size={18} color="var(--accent-green)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--accent-green)', marginTop: '6px' }}>
            {avgPoints}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Puntos por asesor</span>
        </div>

        <div className="glass-card" style={{ padding: '18px', borderLeft: '4px solid var(--accent-red)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>SALIDAS DE AUTO</span>
            <Car size={18} color="var(--accent-red)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '6px' }}>
            {reservations.length}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Visitas coordinadas</span>
        </div>

      </div>

      {/* Team Activity Management Table */}
      <div className="glass-panel" style={{ padding: '20px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Desempeño Individual y Registro de Ventas</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sumá ventas reales cerradas (+150 pts) o asigná bonificaciones al equipo</p>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Total: {team.length} asesores
          </span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '10px 12px' }}>Asesor</th>
              <th style={{ padding: '10px 12px' }}>Provincia / Sucursal</th>
              <th style={{ padding: '10px 12px', textAlign: 'center' }}>Ventas Reales</th>
              <th style={{ padding: '10px 12px', textAlign: 'center' }}>Simulaciones</th>
              <th style={{ padding: '10px 12px', textAlign: 'right' }}>Puntos</th>
              <th style={{ padding: '10px 12px', textAlign: 'center' }}>Acciones Supervisor</th>
            </tr>
          </thead>
          <tbody>
            {team.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  No hay asesores cargados en la base de datos.
                </td>
              </tr>
            ) : (
              [...team].sort((a, b) => (b.salesClosed || 0) - (a.salesClosed || 0) || (b.points || 0) - (a.points || 0)).map((advisor, index) => (
                <tr key={advisor.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.3rem' }}>{advisor.avatar || '👨‍💼'}</span>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <strong style={{ color: 'var(--text-main)' }}>{advisor.name}</strong>
                          <span style={{
                            fontSize: '0.62rem',
                            fontWeight: 800,
                            padding: '1px 5px',
                            borderRadius: '4px',
                            background: advisor.role === 'PAOI' ? 'rgba(255, 159, 28, 0.25)' : 'rgba(46, 196, 182, 0.2)',
                            color: advisor.role === 'PAOI' ? 'var(--primary)' : 'var(--accent-green)'
                          }}>
                            {advisor.role || 'PAI'}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{advisor.phone || 'Sin tel'}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>
                      {advisor.provincia ? `${advisor.provincia} — ` : ''}{advisor.branch}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <span className="badge badge-hard" style={{ fontSize: '0.75rem', fontWeight: 800, padding: '3px 8px' }}>
                      {advisor.salesClosed || 0} cerradas
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <span className="badge badge-medium" style={{ fontSize: '0.7rem' }}>
                      {advisor.simulationsCompleted || 0}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <strong style={{ fontSize: '1rem', color: 'var(--primary)' }}>
                      {advisor.points || 0}
                    </strong>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginLeft: '2px' }}>pts</span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleAddRealSale(advisor.id)}
                        className="btn-primary"
                        style={{ fontSize: '0.72rem', padding: '4px 10px', background: 'linear-gradient(135deg, var(--accent-green) 0%, #00b4d8 100%)', color: '#000' }}
                        title="Anotar 1 venta real cerrada (+150 pts al asesor y +1 a la meta de agencia)"
                      >
                        +1 Venta Real
                      </button>
                      <button
                        onClick={() => handleAwardBonus(advisor.id, 50, 'Desempeño Destacado')}
                        className="btn-secondary"
                        style={{ fontSize: '0.7rem', padding: '4px 8px', borderColor: 'rgba(255, 159, 28, 0.4)' }}
                        title="Otorgar +50 pts extra"
                      >
                        +50 Bono
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
