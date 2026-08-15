import React, { useState, useRef, useEffect } from 'react';
import { CUSTOMER_PROFILES } from '../data/profiles';
import { generateCustomerResponse, evaluateSalesSession } from '../services/geminiService';
import { Send, Volume2, VolumeX, Award, RotateCcw, AlertCircle, Sparkles, User, CheckCircle } from 'lucide-react';

export default function RoleplayChat({ hasApiKey, onOpenSettings, onShowFeedback }) {
  const [selectedProfile, setSelectedProfile] = useState(CUSTOMER_PROFILES[0]);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: CUSTOMER_PROFILES[0].initialMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Cambiar perfil de cliente
  const handleSelectProfile = (profile) => {
    setSelectedProfile(profile);
    setMessages([
      { id: Date.now(), sender: 'bot', text: profile.initialMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
    setErrorMsg('');
  };

  // Reproducir voz si está habilitada
  const speakText = (text) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-AR';
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Enviar mensaje del vendedor
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    if (!hasApiKey) {
      setErrorMsg('Debes configurar tu API Key gratuita de Gemini en el botón de arriba.');
      onOpenSettings();
      return;
    }

    const userText = inputMessage.trim();
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputMessage('');
    setIsLoading(true);
    setErrorMsg('');

    try {
      const botResponse = await generateCustomerResponse(selectedProfile, newHistory);
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: botResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
      speakText(botResponse);
    } catch (err) {
      console.error(err);
      if (err.message === 'API_KEY_MISSING') {
        setErrorMsg('Falta la API Key de Gemini. Por favor ingresala en Configuración.');
        onOpenSettings();
      } else {
        setErrorMsg('Ocurrió un error al conectar con Gemini: ' + (err.message || 'Intenta de nuevo.'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Reiniciar sesión de chat
  const handleResetChat = () => {
    setMessages([
      { id: Date.now(), sender: 'bot', text: selectedProfile.initialMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
    setErrorMsg('');
  };

  // Finalizar charla y solicitar evaluación de la IA
  const handleEvaluate = async () => {
    if (messages.length < 2) {
      setErrorMsg('Intercambiá al menos 2 mensajes con el cliente antes de solicitar la evaluación.');
      return;
    }

    if (!hasApiKey) {
      onOpenSettings();
      return;
    }

    setIsEvaluating(true);
    setErrorMsg('');

    try {
      const evaluationResult = await evaluateSalesSession(selectedProfile, messages);
      onShowFeedback(evaluationResult, selectedProfile);
    } catch (err) {
      console.error(err);
      setErrorMsg('No se pudo generar la evaluación. Revisa tu conexión o API Key.');
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div style={{ padding: '0 20px 40px 20px', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
      
      {/* Grid Layout: Left Profiles Selector, Right Chat Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* Left Column: Customer Selector & Instructions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={18} color="var(--primary)" /> Seleccionar Perfil de Cliente
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Elige con quién querés practicar tu argumento de venta hoy:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {CUSTOMER_PROFILES.map(profile => {
                const isSelected = profile.id === selectedProfile.id;
                return (
                  <div
                    key={profile.id}
                    onClick={() => handleSelectProfile(profile)}
                    style={{
                      padding: '14px',
                      borderRadius: 'var(--radius-sm)',
                      background: isSelected ? 'rgba(255, 159, 28, 0.12)' : 'rgba(255,255,255,0.03)',
                      border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{profile.avatar}</span> {profile.name}
                      </div>
                      <span className={`badge ${profile.badgeClass}`}>
                        {profile.difficulty}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      {profile.occupation} ({profile.age} años)
                    </p>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-main)', fontStyle: 'italic' }}>
                      "{profile.goal}"
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Tip Box */}
          <div className="glass-panel" style={{ padding: '18px', background: 'rgba(0, 180, 216, 0.05)', border: '1px solid rgba(0, 180, 216, 0.2)' }}>
            <h4 style={{ fontSize: '0.88rem', color: 'var(--secondary)', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} /> Objetivo del Juego
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Explicale que AutoCrédito es un plan de capitalización y ahorro con adjudicación por sorteo sin pagar más cuotas. Desarma sus objeciones y al terminar haz clic en <strong>"Evaluar Venta"</strong> para ver tu puntaje de coach.
            </p>
          </div>

        </div>

        {/* Right Column: Chat Box */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '640px', overflow: 'hidden' }}>
          
          {/* Chat Header */}
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-color)',
            background: 'rgba(0, 0, 0, 0.2)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '1.8rem' }}>{selectedProfile.avatar}</div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.1 }}>
                  {selectedProfile.name}
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', background: 'var(--accent-green)', borderRadius: '50%' }} />
                  En línea (Cliente Simulado)
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {/* Voice toggle */}
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className="btn-secondary"
                title={voiceEnabled ? "Desactivar audio" : "Activar lectura por voz"}
                style={{ padding: '8px 12px' }}
              >
                {voiceEnabled ? <Volume2 size={16} color="var(--primary)" /> : <VolumeX size={16} />}
              </button>

              {/* Reset */}
              <button
                onClick={handleResetChat}
                className="btn-secondary"
                title="Reiniciar conversación"
                style={{ padding: '8px 12px' }}
              >
                <RotateCcw size={16} />
              </button>

              {/* Evaluate Button */}
              <button
                onClick={handleEvaluate}
                disabled={isEvaluating || isLoading}
                className="btn-primary"
                style={{ fontSize: '0.85rem', padding: '8px 14px' }}
              >
                <Award size={16} />
                {isEvaluating ? 'Evaluando...' : 'Evaluar Venta'}
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {messages.map(msg => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    alignSelf: isUser ? 'flex-end' : 'flex-start'
                  }}
                >
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                    {isUser ? 'Tú (Vendedor)' : selectedProfile.name} • {msg.time}
                  </span>

                  <div style={{
                    padding: '12px 16px',
                    borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                    background: isUser ? 'linear-gradient(135deg, var(--primary) 0%, #f77f00 100%)' : 'rgba(255, 255, 255, 0.08)',
                    color: isUser ? '#000' : 'var(--text-main)',
                    fontWeight: isUser ? 600 : 400,
                    fontSize: '0.92rem',
                    lineHeight: 1.5,
                    border: isUser ? 'none' : '1px solid var(--border-color)',
                    boxShadow: isUser ? '0 4px 12px rgba(255, 159, 28, 0.2)' : 'none'
                  }}>
                    {msg.text}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '16px 16px 16px 2px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedProfile.name} está pensando su respuesta</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Error Banner if any */}
          {errorMsg && (
            <div style={{ background: 'rgba(230, 57, 70, 0.15)', borderTop: '1px solid rgba(230, 57, 70, 0.3)', padding: '10px 20px', color: 'var(--accent-red)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} /> {errorMsg}
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSendMessage} style={{ padding: '16px 20px', borderTop: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.3)', display: 'flex', gap: '12px' }}>
            <input
              type="text"
              placeholder={`Escribe tu argumento para responder a ${selectedProfile.name}...`}
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '14px 18px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-main)',
                fontSize: '0.93rem',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="btn-primary"
              style={{ padding: '0 22px' }}
            >
              <Send size={18} />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
