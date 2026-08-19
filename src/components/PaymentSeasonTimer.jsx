import React, { useState, useEffect } from 'react';
import { Clock, Calendar, AlertCircle, Share2, Sparkles, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { getCurrentUserProfile } from '../services/storageService';

export default function PaymentSeasonTimer() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [nextDrawDate, setNextDrawDate] = useState(null);
  const [cutoffDate, setCutoffDate] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const currentUser = getCurrentUserProfile();

  useEffect(() => {
    calculateDates();
    const interval = setInterval(calculateDates, 1000);
    return () => clearInterval(interval);
  }, []);

  const calculateDates = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    // 1. Fecha del corte de pago en término (Día 10 del mes actual o siguiente si ya pasó)
    let paymentCutoff = new Date(year, month, 10, 23, 59, 59);
    if (now > paymentCutoff) {
      paymentCutoff = new Date(year, month + 1, 10, 23, 59, 59);
    }
    setCutoffDate(paymentCutoff);

    // 2. Fecha del sorteo oficial de AutoCrédito (Último sábado del mes)
    const lastDayOfMonth = new Date(year, month + 1, 0);
    let lastSaturday = new Date(lastDayOfMonth);
    while (lastSaturday.getDay() !== 6) { // 6 = Sábado
      lastSaturday.setDate(lastSaturday.getDate() - 1);
    }
    lastSaturday.setHours(21, 0, 0, 0); // Sorteo nocturno ~21hs

    if (now > lastSaturday) {
      // Calcular último sábado del mes siguiente
      const nextMonthLastDay = new Date(year, month + 2, 0);
      lastSaturday = new Date(nextMonthLastDay);
      while (lastSaturday.getDay() !== 6) {
        lastSaturday.setDate(lastSaturday.getDate() - 1);
      }
      lastSaturday.setHours(21, 0, 0, 0);
    }
    setNextDrawDate(lastSaturday);

    // Calcular tiempo restante hacia el próximo sorteo/cierre de temporada
    const diff = lastSaturday - now;
    if (diff > 0) {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft({ days, hours, minutes, seconds });
    }
  };

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const currentMonthName = monthNames[new Date().getMonth()];

  const reminderMessages = [
    {
      title: '⏰ Recordatorio de Cuota en Término (1 al 10)',
      text: `Hola! 👋 Te escribo de AutoCrédito para recordarte que tenés tiempo hasta el día 10 para abonar tu cuota en término y mantener tu número 100% activo para el sorteo de este mes de ${currentMonthName}. Cualquier consulta o si necesitás el cupón digital avisame! 🚗✨\n— Asesor: ${currentUser?.name || 'Oficial'}`
    },
    {
      title: '🏆 Cuenta Regresiva para el Sorteo Oficial',
      text: `¡Hola! Quedan solo ${timeLeft.days} días para el sorteo oficial de Lotería Nacional de AutoCrédito del mes de ${currentMonthName} 🏆 Recordá tener tu cuota al día para participar por la adjudicación del 0km / Capital y no pagar nunca más ninguna cuota! Avisame si querés verificar tu estado de cuenta. 🙌`
    },
    {
      title: '🔥 Urgencia Cierre de Temporada para Nuevos Clientes',
      text: `¡Buenas! Te paso a avisar que quedan los últimos ${timeLeft.days} días de la temporada comercial de ${currentMonthName} para suscribirte y congelar el valor de la cuota actual antes del ajuste mensual. ¿Te guardo el lugar para entrar en el sorteo de este mes? 🚗💨`
    }
  ];

  const handleCopyMessage = (msg, index) => {
    navigator.clipboard.writeText(msg.text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const handleShareWhatsApp = (msg) => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg.text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="glass-panel" style={{ margin: '0 12px 14px 12px', padding: '12px 16px', border: '1px solid rgba(255, 159, 28, 0.3)' }}>
      
      {/* Top Banner Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: 'rgba(255, 159, 28, 0.15)',
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem'
          }}>
            ⏳
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <strong style={{ fontSize: '0.92rem', color: 'var(--text-main)' }}>
                Temporada {currentMonthName} • Cierre de Pagos y Sorteo
              </strong>
              <span className="badge badge-medium" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                Lotería Oficial
              </span>
            </div>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Sorteo: <strong>{nextDrawDate ? nextDrawDate.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Próximo sábado'}</strong>
            </p>
          </div>
        </div>

        {/* Countdown Digits */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '6px', textAlign: 'center' }}>
            <div style={{ background: 'rgba(0,0,0,0.35)', padding: '4px 8px', borderRadius: '6px', minWidth: '40px' }}>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary)', display: 'block', lineHeight: 1 }}>{timeLeft.days}</span>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>días</span>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.35)', padding: '4px 8px', borderRadius: '6px', minWidth: '40px' }}>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', display: 'block', lineHeight: 1 }}>{timeLeft.hours}</span>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>hs</span>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.35)', padding: '4px 8px', borderRadius: '6px', minWidth: '40px' }}>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', display: 'block', lineHeight: 1 }}>{timeLeft.minutes}</span>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>min</span>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.35)', padding: '4px 8px', borderRadius: '6px', minWidth: '40px' }} className="mobile-hide">
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent-green)', display: 'block', lineHeight: 1 }}>{timeLeft.seconds}</span>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>seg</span>
            </div>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="btn-secondary"
            style={{ fontSize: '0.75rem', padding: '6px 10px', gap: '4px' }}
          >
            <span>{isExpanded ? 'Ocultar' : 'Mensajes'}</span>
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

      </div>

      {/* Expandable Section: Ready-to-use WhatsApp Messages for Clients */}
      {isExpanded && (
        <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            💬 Mensajes Rápidos de Recordatorio para Clientes:
          </span>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
            {reminderMessages.map((msg, index) => (
              <div
                key={index}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <strong style={{ fontSize: '0.84rem', color: 'var(--text-main)' }}>{msg.title}</strong>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4, whiteSpace: 'pre-line' }}>
                  {msg.text}
                </p>

                <div style={{ display: 'flex', gap: '6px', marginTop: 'auto' }}>
                  <button
                    onClick={() => handleCopyMessage(msg, index)}
                    className="btn-secondary"
                    style={{ flex: 1, fontSize: '0.72rem', padding: '6px' }}
                  >
                    {copiedIndex === index ? <Check size={12} color="var(--accent-green)" /> : null}
                    <span>{copiedIndex === index ? '¡Copiado!' : 'Copiar'}</span>
                  </button>
                  <button
                    onClick={() => handleShareWhatsApp(msg)}
                    className="btn-primary"
                    style={{ fontSize: '0.72rem', padding: '6px 12px', background: '#25D366', color: '#fff' }}
                  >
                    <Share2 size={12} /> WhatsApp
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
