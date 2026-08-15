import React, { useState } from 'react';
import { getApiKey } from '../services/geminiService';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { MessageCircle, Copy, Check, Send, Sparkles, RefreshCw, Smartphone, ShieldAlert } from 'lucide-react';

export default function WhatsappGenerator({ hasApiKey, onOpenSettings }) {
  const [clientName, setClientName] = useState('');
  const [situation, setSituation] = useState('');
  const [carOrGoal, setCarOrGoal] = useState('');
  const [clientType, setClientType] = useState('duda_dinero');
  const [generatedOptions, setGeneratedOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const scenarios = [
    { id: 'duda_dinero', label: 'Dice que no tiene plata este mes / le parece caro' },
    { id: 'compara_concesionaria', label: 'Está averiguando en una concesionaria oficial' },
    { id: 'desconfianza_sorteo', label: 'Tiene miedo o desconfianza con el sorteo' },
    { id: 'cierre_mes', label: 'Recordatorio de sorteo de fin de mes / Urgencia' },
    { id: 'reactivacion', label: 'Prospecto frío que dejó de responder hace días' }
  ];

  const handleGenerate = async (e) => {
    e?.preventDefault();
    if (!hasApiKey) {
      setErrorMsg('Debes configurar tu API Key gratuita de Gemini para usar el generador.');
      onOpenSettings();
      return;
    }

    if (!situation.trim() && !clientName.trim()) {
      setErrorMsg('Ingresa al menos el nombre o la situación del cliente.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setGeneratedOptions([]);

    const apiKey = getApiKey();
    const prompt = `
Actúa como un Asesor Comercial Estrella de AutoCrédito en Argentina.
Genera 3 opciones de mensajes de WhatsApp persuasivos, cálidos y profesionales para enviar a un cliente potencial.

DATOS DEL CLIENTE:
- Nombre del cliente: ${clientName.trim() || 'Estimado/a'}
- Interés/Auto/Objetivo: ${carOrGoal.trim() || 'Auto 0km / Capital de Ahorro'}
- Escenario/Objeción: ${scenarios.find(s => s.id === clientType)?.label || clientType}
- Detalles adicionales: ${situation.trim() || 'Ninguno'}

REGLAS DE FORMATO Y ESTILO:
1. Español de Argentina, tono cercano, profesional y persuasivo (usa modismos como "mirá", "te comento", "buenas tardes", "¡un abrazo!").
2. Incluye emojis apropiados para WhatsApp pero sin exagerar.
3. Resalta la ventaja única de AutoCrédito: adjudicación por sorteo sin pagar más cuotas + respaldo IGJ.
4. Genera exactamente 3 enfoques distintos:
   Opción 1: Enfoque Empático y de Ahorro Inteligente
   Opción 2: Enfoque de Urgencia (Sorteo de fin de mes)
   Opción 3: Enfoque Comparativo Directo (AutoCrédito vs Concesionaria/Banco)

Responde ÚNICAMENTE en formato JSON con la siguiente estructura (sin markdown ni explicaciones adicionales):
{
  "options": [
    {
      "title": "Enfoque Empático",
      "text": "Texto completo del mensaje de WhatsApp..."
    },
    {
      "title": "Enfoque Urgencia Fin de Mes",
      "text": "Texto completo del mensaje de WhatsApp..."
    },
    {
      "title": "Enfoque Comparativa de Valor",
      "text": "Texto completo del mensaje de WhatsApp..."
    }
  ]
}
`;

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.7,
          responseMimeType: 'application/json'
        }
      });

      const result = await model.generateContent(prompt);
      const data = JSON.parse(result.response.text());
      setGeneratedOptions(data.options || []);
    } catch (err) {
      console.error(err);
      setErrorMsg('No se pudo generar el mensaje. Revisa tu conexión o API Key.');
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
            Generador de Mensajes para <span style={{ color: '#25D366' }}>WhatsApp con IA</span>
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Creá mensajes de seguimiento, reactivación y cierre personalizados para tus clientes en 3 segundos.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Form Panel */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="var(--primary)" /> Datos del Prospecto
          </h3>

          <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Nombre del Cliente:
              </label>
              <input
                type="text"
                placeholder="Ej: Roberto Giménez"
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.88rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Interés / Modelo de Auto / Capital:
              </label>
              <input
                type="text"
                placeholder="Ej: Cronos 0km / $15.000.000 / Plan Familiar"
                value={carOrGoal}
                onChange={e => setCarOrGoal(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.88rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Situación o Motivo del Mensaje:
              </label>
              <select
                value={clientType}
                onChange={e => setClientType(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.85rem' }}
              >
                {scenarios.map(sc => (
                  <option key={sc.id} value={sc.id}>{sc.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                ¿Qué te dijo el cliente? (Opcional):
              </label>
              <textarea
                rows={3}
                placeholder="Ej: Me dijo que lo tiene que hablar con la señora y que le parece riesgoso el sorteo."
                value={situation}
                onChange={e => setSituation(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.85rem', resize: 'none' }}
              />
            </div>

            {errorMsg && (
              <div style={{ background: 'rgba(230, 57, 70, 0.15)', border: '1px solid rgba(230, 57, 70, 0.3)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', color: 'var(--accent-red)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldAlert size={15} /> {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
              style={{ padding: '12px', fontSize: '0.9rem', width: '100%' }}
            >
              {isLoading ? (
                <>
                  <RefreshCw size={16} className="typing-dot" /> Redactando mensajes con IA...
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Generar 3 Opciones de WhatsApp
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
              <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>Completá los datos y generá tus mensajes</p>
              <p style={{ fontSize: '0.8rem', marginTop: '4px', maxWidth: '300px' }}>
                La IA redactará 3 enfoques comerciales listos para copiar o enviar directamente a WhatsApp.
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
