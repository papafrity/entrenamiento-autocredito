import React, { useState, useEffect } from 'react';
import { getCarReservations, addCarReservation, deleteCarReservation, getCurrentUserProfile, subscribeToRealtimeUpdates } from '../services/storageService';
import { Calendar, Clock, MapPin, User, AlertTriangle, CheckCircle, Plus, Trash2, Share2, Car, ShieldAlert } from 'lucide-react';

export default function CarSchedule() {
  const [reservations, setReservations] = useState([]);
  const [userProfile, setUserProfile] = useState(getCurrentUserProfile());
  const [showModal, setShowModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filtro de fecha
  const [filterDate, setFilterDate] = useState('todas');

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
    });
    return () => unsubscribe();
  }, []);

  const loadReservations = () => {
    setReservations(getCarReservations());
    setUserProfile(getCurrentUserProfile());
  };

  const handleCreateReservation = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

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
        advisorId: userProfile.id,
        advisorName: userProfile.name,
        advisorPhone: userProfile.phone || 'Sin teléfono',
        clientName: formClient.trim(),
        destination: formDestination.trim(),
        date: formDate,
        startTime: formStartTime,
        endTime: formEndTime,
        purpose: formPurpose.trim(),
        status: 'confirmada'
      };

      addCarReservation(newRes);
      setSuccessMsg('¡Auto reservado con éxito! +50 pts acumulados en el ranking.');
      loadReservations();
      setShowModal(false);
      
      // Limpiar campos
      setFormClient('');
      setFormDestination('');
      setFormPurpose('');
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Seguro que deseas liberar la reserva del auto?')) {
      const updated = deleteCarReservation(id);
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

  const filteredReservations = reservations.filter(r => {
    if (filterDate === 'hoy') return r.date === todayStr;
    if (filterDate === 'proximas') return r.date >= todayStr;
    return true;
  }).sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));

  return (
    <div style={{ padding: '0 12px 30px 12px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--secondary) 0%, #0077b6 100%)',
            width: '50px',
            height: '50px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.6rem',
            boxShadow: '0 4px 15px rgba(0, 180, 216, 0.3)'
          }}>
            🚗
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
              Agenda y Reserva del <span style={{ color: 'var(--secondary)' }}>Auto de la Agencia</span>
            </h2>
            <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>
              Organizá las salidas de asesoramiento presencial para que todo el equipo sepa cuándo el vehículo está ocupado.
            </p>
          </div>
        </div>

        <button 
          onClick={() => { setShowModal(true); setErrorMsg(''); setSuccessMsg(''); }}
          className="btn-primary"
          style={{ fontSize: '0.9rem', padding: '10px 18px' }}
        >
          <Plus size={18} /> Reservar Auto
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={filterDate === 'todas' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setFilterDate('todas')}
            style={{ fontSize: '0.8rem', padding: '6px 14px' }}
          >
            Todas las Salidas
          </button>
          <button
            className={filterDate === 'hoy' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setFilterDate('hoy')}
            style={{ fontSize: '0.8rem', padding: '6px 14px' }}
          >
            Solo Hoy ({todayStr})
          </button>
          <button
            className={filterDate === 'proximas' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setFilterDate('proximas')}
            style={{ fontSize: '0.8rem', padding: '6px 14px' }}
          >
            Próximas
          </button>
        </div>

        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {filteredReservations.length} {filteredReservations.length === 1 ? 'salida agendada' : 'salidas agendadas'}
        </span>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div style={{ background: 'rgba(46, 196, 182, 0.15)', border: '1px solid rgba(46, 196, 182, 0.3)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', color: 'var(--accent-green)', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <CheckCircle size={18} /> {successMsg}
        </div>
      )}

      {/* Reservations Grid */}
      {filteredReservations.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Car size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <p style={{ fontSize: '1rem', fontWeight: 600 }}>El auto está 100% disponible</p>
          <p style={{ fontSize: '0.82rem', marginTop: '4px' }}>No hay salidas agendadas para el filtro seleccionado.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {filteredReservations.map(res => {
            const isToday = res.date === todayStr;
            return (
              <div key={res.id} className="glass-card" style={{
                padding: '18px',
                borderLeft: isToday ? '4px solid var(--primary)' : '4px solid var(--secondary)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                
                {/* Card Header */}
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

                {/* Details */}
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

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                  <button
                    onClick={() => handleShareWhatsapp(res)}
                    className="btn-secondary"
                    style={{ fontSize: '0.78rem', padding: '6px 10px', gap: '6px', color: '#25D366', borderColor: 'rgba(37, 211, 102, 0.3)' }}
                    title="Avisar al grupo de WhatsApp"
                  >
                    <Share2 size={14} /> Compartir en Grupo
                  </button>

                  <button
                    onClick={() => handleDelete(res.id)}
                    className="btn-secondary"
                    style={{ fontSize: '0.78rem', padding: '6px 10px', color: 'var(--accent-red)', borderColor: 'rgba(230, 57, 70, 0.3)' }}
                    title="Liberar auto"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

              </div>
            );
          })}
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
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Asesor: {userProfile.name}</p>
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
