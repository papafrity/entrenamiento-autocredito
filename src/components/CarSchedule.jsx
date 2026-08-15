import React, { useState, useEffect } from 'react';
import { getCarReservations, addCarReservation, deleteCarReservation, getCurrentUserProfile, subscribeToRealtimeUpdates } from '../services/storageService';
import { Calendar as CalendarIcon, Clock, MapPin, User, AlertTriangle, CheckCircle, Plus, Trash2, Share2, Car, ShieldAlert, ChevronLeft, ChevronRight, List, Grid, CalendarDays, UserPlus } from 'lucide-react';

export default function CarSchedule({ onOpenAuthModal }) {
  const [reservations, setReservations] = useState([]);
  const [userProfile, setUserProfile] = useState(getCurrentUserProfile());
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState('month'); // 'list', 'month', 'week'
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Estado del formulario
  const [formClient, setFormClient] = useState('');
  const [formDestination, setFormDestination] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formStartTime, setFormStartTime] = useState('14:00');
  const [formEndTime, setFormEndTime] = useState('16:00');
  const [formPurpose, setFormPurpose] = useState('');

  useEffect(() => {
    loadReservations();
    const unsubscribe = subscribeToRealtimeUpdates((event) => {
      if (event.type === 'RESERVATIONS_UPDATED') {
        setReservations(event.payload);
      }
      if (event.type === 'USER_SWITCHED' || event.type === 'TEAM_UPDATED') {
        setUserProfile(getCurrentUserProfile());
      }
    });
    return () => unsubscribe();
  }, []);

  const loadReservations = () => {
    setReservations(getCarReservations());
    setUserProfile(getCurrentUserProfile());
  };

  const handleOpenReservationModal = (targetDate = null) => {
    const current = getCurrentUserProfile();
    if (!current) {
      onOpenAuthModal?.();
      return;
    }
    if (targetDate) {
      setFormDate(targetDate);
    }
    setErrorMsg('');
    setSuccessMsg('');
    setShowModal(true);
  };

  const handleCreateReservation = async (e) => {
    e?.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const current = getCurrentUserProfile();
    if (!current) {
      setErrorMsg('Debes registrar tu nombre de asesor antes de reservar.');
      onOpenAuthModal?.();
      return;
    }

    if (!formClient.trim() || !formDestination.trim() || !formPurpose.trim()) {
      setErrorMsg('Por favor completa todos los campos de la visita.');
      return;
    }

    if (formStartTime >= formEndTime) {
      setErrorMsg('La hora de inicio debe ser anterior a la hora de regreso.');
      return;
    }

    try {
      const newRes = {
        advisorId: current.id,
        advisorName: current.name,
        advisorPhone: current.phone || 'Sin teléfono',
        clientName: formClient.trim(),
        destination: formDestination.trim(),
        date: formDate,
        startTime: formStartTime,
        endTime: formEndTime,
        purpose: formPurpose.trim(),
        status: 'confirmada'
      };

      await addCarReservation(newRes);
      setSuccessMsg('¡Auto reservado con éxito! +50 pts acumulados en el ranking.');
      loadReservations();
      setShowModal(false);
      
      setFormClient('');
      setFormDestination('');
      setFormPurpose('');
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Seguro que deseas liberar la reserva del auto?')) {
      const updated = await deleteCarReservation(id);
      setReservations(updated);
    }
  };

  const handleShareWhatsapp = (res) => {
    const text = `🚗 *RESERVA DE AUTO - AUTOCRÉDITO*\n\n` +
                 `👤 *Asesor:* ${res.advisorName}\n` +
                 `📅 *Fecha:* ${res.date}\n` +
                 `⏰ *Horario:* ${res.startTime} a ${res.endTime} hs\n` +
                 `📍 *Destino:* ${res.destination}\n` +
                 `🎯 *Cliente/Objetivo:* ${res.clientName} (${res.purpose})\n\n` +
                 `_Auto ocupado en esa franja horaria._`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper para generar días del mes
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarDays.push(dStr);
  }

  const prevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  // Helper para semana actual
  const getWeekDates = (baseDate) => {
    const current = new Date(baseDate);
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1); // lunes
    const monday = new Date(current.setDate(diff));

    const week = [];
    for (let i = 0; i < 7; i++) {
      const nextD = new Date(monday);
      nextD.setDate(monday.getDate() + i);
      week.push(nextD.toISOString().split('T')[0]);
    }
    return week;
  };

  const currentWeekDays = getWeekDates(currentMonthDate);

  return (
    <div style={{ padding: '0 12px 30px 12px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '18px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--secondary) 0%, #0077b6 100%)',
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            boxShadow: '0 4px 15px rgba(0, 180, 216, 0.3)'
          }}>
            🚗
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
              Agenda y Reserva del <span style={{ color: 'var(--secondary)' }}>Auto de la Agencia</span>
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Calendario en tiempo real para coordinar salidas de visitas con el auto.
            </p>
          </div>
        </div>

        <button 
          onClick={() => handleOpenReservationModal()}
          className="btn-primary"
          style={{ fontSize: '0.88rem', padding: '10px 18px' }}
        >
          <Plus size={18} /> Reservar Auto
        </button>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div style={{ background: 'rgba(46, 196, 182, 0.15)', border: '1px solid rgba(46, 196, 182, 0.3)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', color: 'var(--accent-green)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <CheckCircle size={18} /> {successMsg}
        </div>
      )}

      {/* Controls Bar: View Selector (Month, Week, List) + Month Navigation */}
      <div className="glass-panel" style={{ padding: '12px 16px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        
        {/* Month Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={prevMonth} className="btn-secondary" style={{ padding: '6px 10px' }}>
            <ChevronLeft size={16} />
          </button>
          <strong style={{ fontSize: '1.05rem', minWidth: '160px', textAlign: 'center' }}>
            {monthNames[month]} {year}
          </strong>
          <button onClick={nextMonth} className="btn-secondary" style={{ padding: '6px 10px' }}>
            <ChevronRight size={16} />
          </button>
        </div>

        {/* View Mode Buttons */}
        <div style={{ display: 'flex', gap: '6px', background: 'rgba(0,0,0,0.3)', padding: '3px', borderRadius: 'var(--radius-sm)' }}>
          <button
            className={viewMode === 'month' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setViewMode('month')}
            style={{ fontSize: '0.78rem', padding: '6px 12px' }}
          >
            <Grid size={14} /> Mes
          </button>
          <button
            className={viewMode === 'week' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setViewMode('week')}
            style={{ fontSize: '0.78rem', padding: '6px 12px' }}
          >
            <CalendarDays size={14} /> Semana
          </button>
          <button
            className={viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setViewMode('list')}
            style={{ fontSize: '0.78rem', padding: '6px 12px' }}
          >
            <List size={14} /> Lista ({reservations.length})
          </button>
        </div>

      </div>

      {/* VISTA 1: CALENDARIO MENSUAL */}
      {viewMode === 'month' && (
        <div className="glass-panel" style={{ padding: '16px', overflowX: 'auto' }}>
          
          {/* Day Headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(100px, 1fr))', gap: '6px', marginBottom: '6px', textAlign: 'center' }}>
            {dayNames.map((name, i) => (
              <div key={i} style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', padding: '6px 0' }}>
                {name}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(100px, 1fr))', gap: '6px' }}>
            {calendarDays.map((dStr, idx) => {
              if (!dStr) {
                return <div key={idx} style={{ minHeight: '90px', background: 'rgba(0,0,0,0.1)', borderRadius: 'var(--radius-sm)', opacity: 0.2 }} />;
              }

              const dayNum = parseInt(dStr.split('-')[2], 10);
              const dayReservations = reservations.filter(r => r.date === dStr);
              const isToday = dStr === todayStr;

              return (
                <div
                  key={idx}
                  onClick={() => handleOpenReservationModal(dStr)}
                  style={{
                    minHeight: '90px',
                    padding: '8px',
                    borderRadius: 'var(--radius-sm)',
                    background: isToday ? 'rgba(255, 159, 28, 0.08)' : 'rgba(255,255,255,0.02)',
                    border: isToday ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  title="Haz clic para agendar reserva este día"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: isToday ? 'var(--primary)' : 'var(--text-main)' }}>
                      {dayNum}
                    </span>
                    {dayReservations.length > 0 && (
                      <span className="badge badge-medium" style={{ fontSize: '0.6rem', padding: '1px 5px' }}>
                        {dayReservations.length} {dayReservations.length === 1 ? 'salida' : 'salidas'}
                      </span>
                    )}
                  </div>

                  {/* Reservations preview tags */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
                    {dayReservations.map(res => (
                      <div
                        key={res.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShareWhatsapp(res);
                        }}
                        style={{
                          background: 'rgba(0, 180, 216, 0.2)',
                          border: '1px solid rgba(0, 180, 216, 0.4)',
                          borderRadius: '4px',
                          padding: '3px 5px',
                          fontSize: '0.68rem',
                          color: '#fff',
                          display: 'flex',
                          flexDirection: 'column',
                          lineHeight: 1.2
                        }}
                      >
                        <strong style={{ color: 'var(--secondary)' }}>{res.startTime}-{res.endTime}</strong>
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{res.advisorName} ({res.destination})</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* VISTA 2: VISTA SEMANAL */}
      {viewMode === 'week' && (
        <div className="glass-panel" style={{ padding: '16px', overflowX: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(130px, 1fr))', gap: '8px' }}>
            {currentWeekDays.map((dStr, idx) => {
              const dayReservations = reservations.filter(r => r.date === dStr);
              const isToday = dStr === todayStr;
              const dObj = new Date(dStr + 'T00:00:00');
              const dayName = dayNames[dObj.getDay()];
              const dayNum = dObj.getDate();

              return (
                <div
                  key={idx}
                  style={{
                    minHeight: '260px',
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    background: isToday ? 'rgba(255, 159, 28, 0.08)' : 'rgba(255,255,255,0.02)',
                    border: isToday ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div style={{ textAlign: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>{dayName}</span>
                    <strong style={{ fontSize: '1.2rem', color: isToday ? 'var(--primary)' : 'var(--text-main)' }}>{dayNum}</strong>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                    {dayReservations.length === 0 ? (
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textAlign: 'center', margin: 'auto 0' }}>
                        Auto Libre
                      </p>
                    ) : (
                      dayReservations.map(res => (
                        <div
                          key={res.id}
                          style={{
                            background: 'rgba(0, 180, 216, 0.15)',
                            border: '1px solid rgba(0, 180, 216, 0.3)',
                            borderRadius: 'var(--radius-sm)',
                            padding: '8px',
                            fontSize: '0.75rem'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--primary)', fontWeight: 700, marginBottom: '2px' }}>
                            <span>{res.startTime} a {res.endTime}</span>
                          </div>
                          <strong style={{ display: 'block', color: 'var(--text-main)' }}>{res.advisorName}</strong>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>📍 {res.destination}</span>
                        </div>
                      ))
                    )}
                  </div>

                  <button
                    onClick={() => handleOpenReservationModal(dStr)}
                    className="btn-secondary"
                    style={{ fontSize: '0.72rem', padding: '4px', marginTop: '10px', width: '100%' }}
                  >
                    + Agendar
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VISTA 3: LISTADO DE SALIDAS */}
      {viewMode === 'list' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {reservations.length === 0 ? (
            <div className="glass-panel" style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', gridColumn: '1 / -1' }}>
              <Car size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <p style={{ fontSize: '1rem', fontWeight: 700 }}>No hay reservas agendadas en este momento</p>
              <p style={{ fontSize: '0.82rem', marginTop: '4px' }}>El auto de la agencia se encuentra 100% disponible para salidas de visitas.</p>
              <button
                onClick={() => handleOpenReservationModal()}
                className="btn-primary"
                style={{ marginTop: '16px', fontSize: '0.85rem', padding: '8px 18px' }}
              >
                + Agendar Primera Visita
              </button>
            </div>
          ) : (
            reservations.map(res => {
              const isToday = res.date === todayStr;
              return (
                <div key={res.id} className="glass-card" style={{
                  padding: '18px',
                  borderLeft: isToday ? '4px solid var(--primary)' : '4px solid var(--secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.3rem' }}>👤</span>
                      <div>
                        <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{res.advisorName}</strong>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{res.advisorPhone}</p>
                      </div>
                    </div>

                    <span className={`badge ${isToday ? 'badge-medium' : 'badge-easy'}`} style={{ fontSize: '0.7rem' }}>
                      {isToday ? 'HOY' : res.date}
                    </span>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.84rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
                      <Clock size={15} />
                      <strong>{res.startTime} a {res.endTime} hs</strong>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                      <MapPin size={15} color="var(--secondary)" />
                      <span>{res.destination}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                      <User size={15} />
                      <span>Cliente: <strong>{res.clientName}</strong></span>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                    "{res.purpose}"
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                    <button
                      onClick={() => handleShareWhatsapp(res)}
                      className="btn-secondary"
                      style={{ fontSize: '0.78rem', padding: '6px 10px', gap: '6px', color: '#25D366', borderColor: 'rgba(37, 211, 102, 0.3)' }}
                    >
                      <Share2 size={14} /> Compartir en Grupo
                    </button>

                    <button
                      onClick={() => handleDelete(res.id)}
                      className="btn-secondary"
                      style={{ fontSize: '0.78rem', padding: '6px 10px', color: 'var(--accent-red)', borderColor: 'rgba(230, 57, 70, 0.3)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Modal para agendar nueva reserva */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1050,
          padding: '16px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '24px' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ background: 'rgba(0, 180, 216, 0.15)', padding: '8px', borderRadius: '10px' }}>
                <Car size={22} color="var(--secondary)" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Agendar Visita con el Auto</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Asesor: {userProfile ? userProfile.name : 'Asesor'}
                </p>
              </div>
            </div>

            {errorMsg && (
              <div style={{ background: 'rgba(230, 57, 70, 0.15)', border: '1px solid rgba(230, 57, 70, 0.3)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', color: 'var(--accent-red)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <ShieldAlert size={16} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateReservation} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Nombre del Cliente o Familia:
                </label>
                <input
                  type="text"
                  placeholder="Ej: Marcelo Castro"
                  value={formClient}
                  onChange={e => setFormClient(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.88rem' }}
                  autoFocus
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Destino / Zona a Visitar:
                </label>
                <input
                  type="text"
                  placeholder="Ej: Barrio Norte / Av. Rivadavia 4500"
                  value={formDestination}
                  onChange={e => setFormDestination(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Fecha:</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.82rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Salida:</label>
                  <input
                    type="time"
                    value={formStartTime}
                    onChange={e => setFormStartTime(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.82rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Regreso:</label>
                  <input
                    type="time"
                    value={formEndTime}
                    onChange={e => setFormEndTime(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.82rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Motivo de la Visita / Tipo de Plan:
                </label>
                <input
                  type="text"
                  placeholder="Ej: Presentación de Plan Capitalización 0km y cierre"
                  value={formPurpose}
                  onChange={e => setFormPurpose(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Confirmar Reserva
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
