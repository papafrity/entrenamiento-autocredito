import React, { useState, useEffect } from 'react';
import { Clock, Calendar, AlertCircle, Share2, Sparkles, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { getCurrentUserProfile } from '../services/storageService';

const STORAGE_KEY = 'autocredito_countdown_plan';

const DEADLINES = {
  di_total_1:  { base: new Date(2026, 9, 15),  label: 'DI Total — 1 Pago',    sublabel: 'Vto. cuota + sorteo', color: '#ff9f1c' },
  di_total_2:  { base: new Date(2026, 10, 15), label: 'DI Total — 2 Pagos',   sublabel: 'Vto. cuota + sorteo', color: '#ff9f1c' },
  di_parcial:  { base: new Date(2026, 9, 15),  label: 'DI Parcial — 1 Pago',  sublabel: 'Vto. cuota + sorteo', color: '#2ec4b6' },
  tradicional: { base: new Date(2026, 10, 15), label: 'Tradicional',          sublabel: 'Vto. cuota 1 + sorteo', color: '#00b4d8' },
};

const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

function getNextDeadline(planKey) {
  const base = DEADLINES[planKey].base;
  const now = new Date();
  let target = new Date(base);
  while (target <= now) {
    target.setMonth(target.getMonth() + 1);
  }
  return target;
}

function getUpcomingDeadlines(planKey) {
  const base = DEADLINES[planKey].base;
  const now = new Date();
  let target = new Date(base);
  while (target <= now) {
    target.setMonth(target.getMonth() + 1);
  }
  const deadlines = [];
  for (let i = 0; i < 6; i++) {
    deadlines.push(new Date(target));
    target.setMonth(target.getMonth() + 1);
  }
  return deadlines;
}

function formatDateLong(date) {
  return date.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function formatDateShort(date) {
  return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function PaymentSeasonTimer() {
  const [selectedPlan, setSelectedPlan] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || 'di_total_1';
  });
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const currentUser = getCurrentUserProfile();
  const nextDeadline = getNextDeadline(selectedPlan);
  const upcoming = getUpcomingDeadlines(selectedPlan);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const diff = nextDeadline - now;
      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [nextDeadline]);

  const handlePlanChange = (key) => {
    setSelectedPlan(key);
    localStorage.setItem(STORAGE_KEY, key);
  };

  const planConfig = DEADLINES[selectedPlan];
  const isExpired = nextDeadline <= new Date();

  const currentMonthName = monthNames[new Date().getMonth()];

  const reminderMessages = [
    {
      title: '⏰ Recordatorio de Cuota en Término',
      text: `Hola! 👋 Te escribo de AutoCrédito para recordarte que tenés tiempo hasta el día ${nextDeadline.getDate()} para abonar tu cuota en término y mantener tu número 100% activo para el sorteo de este mes. Cualquier consulta o si necesitás el cupón digital avisame! 🚗✨\n— Asesor: ${currentUser?.name || 'Oficial'}`
    },
    {
      title: '🏆 Cuenta Regresiva para el Sorteo Oficial',
      text: `¡Hola! Quedan solo ${timeLeft.days} días para el vencimiento de tu cuota y el sorteo oficial de Lotería Nacional de AutoCrédito del mes de ${currentMonthName} 🏆 Recordá tener tu cuota al día para participar por la adjudicación del 0km / Capital y no pagar nunca más ninguna cuota! Avisame si querés verificar tu estado de cuenta. 🙌`
    },
    {
      title: '🔥 Urgencia — Cierre de Temporada',
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
            background: `${planConfig.color}22`,
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem'
          }}>
            {isExpired ? '✅' : '⏳'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <strong style={{ fontSize: '0.92rem', color: 'var(--text-main)' }}>
                {planConfig.label}
              </strong>
              <span className="badge badge-medium" style={{ fontSize: '0.65rem', padding: '2px 6px', background: `${planConfig.color}22`, color: planConfig.color, border: `1px solid ${planConfig.color}44` }}>
                {isExpired ? 'Vencido' : 'Lotería Oficial'}
              </span>
            </div>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              {planConfig.sublabel}: <strong>{formatDateLong(nextDeadline)}</strong>
            </p>
          </div>
        </div>

        {/* Countdown Digits */}
        {!isExpired && (
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
          </div>
        )}
      </div>

      {/* Plan Selector Tabs */}
      <div style={{ display: 'flex', gap: '6px', marginTop: '12px', flexWrap: 'wrap' }}>
        {Object.entries(DEADLINES).map(([key, config]) => (
          <button
            key={key}
            onClick={() => handlePlanChange(key)}
            style={{
              flex: '1 1 auto',
              minWidth: '120px',
              padding: '8px 10px',
              borderRadius: 'var(--radius-sm)',
              border: selectedPlan === key ? `2px solid ${config.color}` : '1px solid var(--border-color)',
              background: selectedPlan === key ? `${config.color}18` : 'rgba(255,255,255,0.02)',
              color: selectedPlan === key ? config.color : 'var(--text-muted)',
              fontSize: '0.72rem',
              fontWeight: selectedPlan === key ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'center'
            }}
          >
            {config.label}
          </button>
        ))}
      </div>

      {/* Upcoming Deadlines Reference */}
      <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            📋 Próximos vencimientos ({planConfig.label}):
          </span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="btn-secondary"
            style={{ fontSize: '0.72rem', padding: '4px 8px', gap: '4px' }}
          >
            <span>{isExpanded ? 'Ocultar' : 'Mensajes'}</span>
            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {upcoming.map((date, i) => {
            const isCurrent = i === 0;
            return (
              <div
                key={i}
                style={{
                  flex: '0 0 auto',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: isCurrent ? `2px solid ${planConfig.color}` : '1px solid var(--border-color)',
                  background: isCurrent ? `${planConfig.color}15` : 'rgba(255,255,255,0.02)',
                  textAlign: 'center',
                  minWidth: '100px'
                }}
              >
                <div style={{ fontSize: '0.68rem', color: isCurrent ? planConfig.color : 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>
                  {monthNames[date.getMonth()]}
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {date.getDate()}/{date.getMonth() + 1}
                </div>
                {isCurrent && (
                  <div style={{ fontSize: '0.58rem', color: planConfig.color, fontWeight: 600 }}>
                    ← ACTUAL
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Expandable Section: WhatsApp Messages */}
      {isExpanded && (
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            💬 Mensajes Rápidos de Recordatorio:
          </span>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '8px' }}>
            {reminderMessages.map((msg, index) => (
              <div
                key={index}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <strong style={{ fontSize: '0.78rem', color: 'var(--text-main)' }}>{msg.title}</strong>
                <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.4, whiteSpace: 'pre-line' }}>
                  {msg.text}
                </p>

                <div style={{ display: 'flex', gap: '6px', marginTop: 'auto' }}>
                  <button
                    onClick={() => handleCopyMessage(msg, index)}
                    className="btn-secondary"
                    style={{ flex: 1, fontSize: '0.68rem', padding: '5px' }}
                  >
                    {copiedIndex === index ? <Check size={11} color="var(--accent-green)" /> : null}
                    <span>{copiedIndex === index ? '¡Copiado!' : 'Copiar'}</span>
                  </button>
                  <button
                    onClick={() => handleShareWhatsApp(msg)}
                    className="btn-primary"
                    style={{ fontSize: '0.68rem', padding: '5px 10px', background: '#25D366', color: '#fff' }}
                  >
                    <Share2 size={11} /> WhatsApp
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