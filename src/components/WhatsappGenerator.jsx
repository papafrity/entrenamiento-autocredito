import React, { useState } from 'react';
import { generateWhatsappResponses } from '../services/geminiService';
import { MessageCircle, Copy, Check, Send, Sparkles, RefreshCw, Smartphone, ShieldAlert, ChevronDown, ChevronUp, Bot } from 'lucide-react';

export default function WhatsappGenerator() {
  const [copiedMessage, setCopiedMessage] = useState('');
  const [clientName, setClientName] = useState('');
  const [carOrGoal, setCarOrGoal] = useState('');
  const [clientType, setClientType] = useState('auto_context');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [generatedOptions, setGeneratedOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const scenarios = [
    { id: 'auto_context', label: '🤖 Detectar automáticamente por contexto del mensaje copiado' },
    { id: 'duda_dinero', label: 'Dice que no tiene plata este mes / le parece caro' },
    { id: 'compara_concesionaria', label: 'Está averiguando en una concesionaria oficial' },
    { id: 'desconfianza_sorteo', label: 'Tiene miedo o desconfianza con el sorteo' },
    { id: 'cierre_mes', label: 'Recordatorio de sorteo de fin de mes / Urgencia' },
    { id: 'reactivacion', label: 'Prospecto frío que dejó de responder hace días' }
  ];

  const handleGenerate = async (e) => {
    e?.preventDefault();

    if (!copiedMessage.trim() && !clientName.trim()) {
      setErrorMsg('Por favor pega el mensaje de WhatsApp que te envió el cliente.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setGeneratedOptions([]);

    const activeScenario = scenarios.find(s => s.id === clientType)?.label;

    try {
      const data = await generateWhatsappResponses({
        message: copiedMessage,
        clientName,
        carOrGoal,
        clientTypeLabel: activeScenario
      });
      setGeneratedOptions(data.options || []);
    } catch (err) {
      console.error(err);
      setErrorMsg('No se pudo generar el mensaje. Revisa tu conexión a internet.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleOpenWhatsapp = (text) => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div style={{ padding: '0 12px 30px 12px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      
      {/* Header */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)'
        }}>
          💬
        </div>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>
            Generador de Respuestas para <span style={{ color: '#25D366' }}>WhatsApp con IA</span>
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Pegá lo que te escribió el cliente por WhatsApp y la IA detectará el contexto para redactarte 3 respuestas comerciales perfectas.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Form Panel */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bot size={18} color="#25D366" /> Pegar Mensaje de WhatsApp
          </h3>

          <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span>Mensaje o duda que te envió el cliente:</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--accent-green)' }}>Detección Automática Activa</span>
              </label>
              <textarea
                rows={4}
                placeholder="Pegá acá el texto copiado de WhatsApp. Ej: 'Hola, mira me interesa pero justo este mes ando medio justo con la guita, además no se cómo es eso del sorteo...'"
                value={copiedMessage}
                onChange={e => setCopiedMessage(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-main)',
                  fontSize: '0.9rem',
                  resize: 'vertical',
                  lineHeight: 1.4
                }}
              />
            </div>

            {/* Toggle para opciones avanzadas / manuales */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="btn-secondary"
                style={{ width: '100%', fontSize: '0.78rem', padding: '8px 12px', justifyContent: 'space-between' }}
              >
                <span>⚙️ Opciones manuales adicionales (Opcional)</span>
                {showAdvancedOptions ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>
            </div>

            {showAdvancedOptions && (
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: 'var(--radius-sm)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Tipo de Enfoque / Motivo:
                  </label>
                  <select
                    value={clientType}
                    onChange={e => setClientType(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.82rem' }}
                  >
                    {scenarios.map(sc => (
                      <option key={sc.id} value={sc.id}>{sc.label}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                      Nombre del Cliente:
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Roberto"
                      value={clientName}
                      onChange={e => setClientName(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.82rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                      Modelo / Plan:
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Cronos 0km"
                      value={carOrGoal}
                      onChange={e => setCarOrGoal(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.82rem' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {errorMsg && (
              <div style={{ background: 'rgba(230, 57, 70, 0.15)', border: '1px solid rgba(230, 57, 70, 0.3)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', color: 'var(--accent-red)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldAlert size={15} /> {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !copiedMessage.trim()}
              className="btn-primary"
              style={{ padding: '12px', fontSize: '0.9rem', width: '100%' }}
            >
              {isLoading ? (
                <>
                  <RefreshCw size={16} className="typing-dot" /> Analizando contexto y redactando...
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Generar 3 Respuestas de WhatsApp
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {generatedOptions.length === 0 ? (
            <div className="glass-panel" style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Smartphone size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>Pegá el mensaje de WhatsApp del cliente</p>
              <p style={{ fontSize: '0.8rem', marginTop: '4px', maxWidth: '300px' }}>
                La IA detectará automáticamente la duda y te dará 3 opciones listas para mandar.
              </p>
            </div>
          ) : (
            generatedOptions.map((opt, idx) => (
              <div key={idx} className="glass-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-medium" style={{ fontSize: '0.72rem' }}>
                    {opt.title}
                  </span>
                </div>

                <div style={{
                  background: 'rgba(0,0,0,0.3)',
                  padding: '14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.88rem',
                  lineHeight: '1.5',
                  color: 'var(--text-main)',
                  whiteSpace: 'pre-line',
                  borderLeft: '3px solid #25D366'
                }}>
                  {opt.text}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button
                    onClick={() => handleCopy(opt.text, idx)}
                    className="btn-secondary"
                    style={{ fontSize: '0.78rem', padding: '6px 12px', gap: '6px' }}
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check size={14} color="var(--accent-green)" /> ¡Copiado!
                      </>
                    ) : (
                      <>
                        <Copy size={14} /> Copiar
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleOpenWhatsapp(opt.text)}
                    className="btn-primary"
                    style={{ fontSize: '0.78rem', padding: '6px 12px', gap: '6px', background: '#25D366', color: '#fff' }}
                  >
                    <Send size={14} /> Abrir en WhatsApp
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

    </div>
  );
}
