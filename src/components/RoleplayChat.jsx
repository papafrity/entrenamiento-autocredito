import React, { useState, useRef, useEffect } from 'react';
import { CUSTOMER_PROFILES } from '../data/profiles';
import { generateCustomerResponse, evaluateSalesSession } from '../services/geminiService';
import { Send, Mic, MicOff, Volume2, VolumeX, Award, RotateCcw, AlertCircle, Sparkles, User, Users, ChevronDown, ChevronUp } from 'lucide-react';

export default function RoleplayChat({ hasApiKey, onOpenSettings, onShowFeedback }) {
  const [selectedProfile, setSelectedProfile] = useState(CUSTOMER_PROFILES[0]);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: CUSTOMER_PROFILES[0].initialMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true); // Default voice enabled for realistic audio experience
  const [isRecording, setIsRecording] = useState(false);
  const [showProfileSelector, setShowProfileSelector] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Inicializar Web Speech Recognition si está soportado
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'es-AR';

      recognition.onstart = () => {
        setIsRecording(true);
        setErrorMsg('');
      };

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputMessage(transcript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        if (event.error === 'not-allowed') {
          setErrorMsg('Permiso de micrófono denegado. Habilitá el micrófono en tu navegador.');
        } else if (event.error !== 'no-speech') {
          setErrorMsg('Error de micrófono: ' + event.error);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Alternar grabación por voz
  const toggleRecording = () => {
    if (!recognitionRef.current) {
      setErrorMsg('El reconocimiento de voz no está soportado en este navegador. Prueba con Google Chrome.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setInputMessage('');
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Error starting recognition:', err);
      }
    }
  };

  // Reproducir voz del cliente simulado
  const speakText = (text) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-AR';
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    
    // Buscar una voz en español si está disponible
    const voices = window.speechSynthesis.getVoices();
    const spanishVoice = voices.find(v => v.lang.startsWith('es-AR') || v.lang.startsWith('es-419') || v.lang.startsWith('es-US') || v.lang.startsWith('es-ES'));
    if (spanishVoice) {
      utterance.voice = spanishVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  };

  // Cambiar perfil de cliente
  const handleSelectProfile = (profile) => {
    setSelectedProfile(profile);
    setMessages([
      { id: Date.now(), sender: 'bot', text: profile.initialMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
    setShowProfileSelector(false);
    setErrorMsg('');
    if (voiceEnabled) {
      setTimeout(() => speakText(profile.initialMessage), 300);
    }
  };

  // Enviar mensaje del vendedor
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

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
    <div style={{ padding: '0 12px 20px 12px', maxWidth: '1280px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      
      {/* Mobile Profile Switcher Pill / Header Card */}
      <div className="glass-panel" style={{ padding: '10px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.6rem' }}>{selectedProfile.avatar}</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <strong style={{ fontSize: '0.95rem' }}>{selectedProfile.name}</strong>
                <span className={`badge ${selectedProfile.badgeClass}`} style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                  {selectedProfile.difficulty}
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {selectedProfile.occupation} • {selectedProfile.age} años
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowProfileSelector(!showProfileSelector)}
            className="btn-secondary"
            style={{ fontSize: '0.78rem', padding: '6px 12px', gap: '6px' }}
          >
            <Users size={14} />
            <span>Cambiar</span>
            {showProfileSelector ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

        </div>

        {/* Expandable Profiles Grid */}
        {showProfileSelector && (
          <div style={{
            marginTop: '12px',
            paddingTop: '12px',
            borderTop: '1px solid var(--border-color)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '8px'
          }}>
            {CUSTOMER_PROFILES.map(profile => {
              const isSelected = profile.id === selectedProfile.id;
              return (
                <div
                  key={profile.id}
                  onClick={() => handleSelectProfile(profile)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: isSelected ? 'rgba(255, 159, 28, 0.15)' : 'rgba(255,255,255,0.03)',
                    border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{profile.avatar} {profile.name}</span>
                    <span className={`badge ${profile.badgeClass}`} style={{ fontSize: '0.6rem', padding: '2px 5px' }}>{profile.difficulty}</span>
                  </div>
                  <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>{profile.occupation}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Chat Box Container */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100dvh - 165px)', minHeight: '480px', overflow: 'hidden' }}>
        
        {/* Chat Control Bar */}
        <div style={{
          padding: '8px 14px',
          borderBottom: '1px solid var(--border-color)',
          background: 'rgba(0, 0, 0, 0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '6px', height: '6px', background: 'var(--accent-green)', borderRadius: '50%' }} />
            Cliente en Vivo
          </span>

          <div style={{ display: 'flex', gap: '6px' }}>
            {/* Voice toggle */}
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className="btn-secondary"
              title={voiceEnabled ? "Desactivar voz del cliente" : "Activar voz del cliente"}
              style={{ padding: '6px 10px', fontSize: '0.75rem' }}
            >
              {voiceEnabled ? <Volume2 size={15} color="var(--primary)" /> : <VolumeX size={15} />}
            </button>

            {/* Reset */}
            <button
              onClick={handleResetChat}
              className="btn-secondary"
              title="Reiniciar conversación"
              style={{ padding: '6px 10px', fontSize: '0.75rem' }}
            >
              <RotateCcw size={15} />
            </button>

            {/* Evaluate Button */}
            <button
              onClick={handleEvaluate}
              disabled={isEvaluating || isLoading}
              className="btn-primary"
              style={{ fontSize: '0.78rem', padding: '6px 12px' }}
            >
              <Award size={15} />
              <span>{isEvaluating ? 'Evaluando...' : 'Evaluar'}</span>
            </button>
          </div>
        </div>

        {/* Messages Scroll Area */}
        <div style={{ flex: 1, padding: '14px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {messages.map(msg => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: '86%',
                  alignSelf: isUser ? 'flex-end' : 'flex-start'
                }}
              >
                <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginBottom: '3px' }}>
                  {isUser ? 'Tú (Vendedor)' : selectedProfile.name} • {msg.time}
                </span>

                <div style={{
                  padding: '10px 14px',
                  borderRadius: isUser ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  background: isUser ? 'linear-gradient(135deg, var(--primary) 0%, #f77f00 100%)' : 'rgba(255, 255, 255, 0.08)',
                  color: isUser ? '#000' : 'var(--text-main)',
                  fontWeight: isUser ? 600 : 400,
                  fontSize: '0.88rem',
                  lineHeight: 1.45,
                  border: isUser ? 'none' : '1px solid var(--border-color)',
                  boxShadow: isUser ? '0 3px 10px rgba(255, 159, 28, 0.2)' : 'none'
                }}>
                  {msg.text}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '14px 14px 14px 2px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{selectedProfile.name} está pensando</span>
              <div style={{ display: 'flex', gap: '3px' }}>
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div style={{ background: 'rgba(230, 57, 70, 0.15)', borderTop: '1px solid rgba(230, 57, 70, 0.3)', padding: '8px 14px', color: 'var(--accent-red)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={14} /> {errorMsg}
          </div>
        )}

        {/* Bottom Input Area with Microphone and Send Button */}
        <form onSubmit={handleSendMessage} style={{ padding: '10px 12px', borderTop: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          
          {/* Microphone Button */}
          <button
            type="button"
            onClick={toggleRecording}
            className={`btn-mic ${isRecording ? 'btn-mic-recording' : 'btn-mic-idle'}`}
            title={isRecording ? "Detener grabación" : "Hablar por micrófono"}
          >
            {isRecording ? <Mic size={22} /> : <Mic size={20} />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            placeholder={isRecording ? "Escuchando tu voz... Habla ahora" : `Habla o escribe tu respuesta...`}
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '12px 14px',
              background: 'var(--bg-input)',
              border: isRecording ? '1px solid var(--accent-red)' : '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-main)',
              fontSize: '0.9rem',
              outline: 'none'
            }}
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="btn-primary"
            style={{ padding: '0 16px', height: '46px', borderRadius: 'var(--radius-sm)' }}
          >
            <Send size={18} />
          </button>
        </form>

      </div>

    </div>
  );
}
