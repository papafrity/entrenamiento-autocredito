import React, { useState, useRef, useEffect } from 'react';
import { CUSTOMER_PROFILES } from '../data/profiles';
import { generateCustomerResponse, evaluateSalesSession } from '../services/geminiService';
import { Send, Mic, Volume2, VolumeX, Award, RotateCcw, AlertCircle, Users, ChevronDown, ChevronUp, Filter, History, Trash2, Lightbulb, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { getChatEvaluations, clearChatEvaluations } from '../services/storageService';

export default function RoleplayChat({ onShowFeedback }) {
  const [selectedProfile, setSelectedProfile] = useState(CUSTOMER_PROFILES[0]);
  const [difficultyFilter, setDifficultyFilter] = useState('Todos');
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: CUSTOMER_PROFILES[0].initialMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [showProfileSelector, setShowProfileSelector] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState(() => getChatEvaluations());
  const [expandedHistId, setExpandedHistId] = useState(null);

  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const textareaRef = useRef(null);

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
        adjustTextareaHeight();
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

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 140) + 'px';
    }
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
    adjustTextareaHeight();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
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
      setErrorMsg('Ocurrió un error al conectar con Gemini: ' + (err.message || 'Intenta de nuevo.'));
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

    setIsEvaluating(true);
    setErrorMsg('');

    try {
      const evaluationResult = await evaluateSalesSession(selectedProfile, messages);
      onShowFeedback(evaluationResult, selectedProfile);
      // refrescar historial local tras guardar
      setTimeout(() => setChatHistory(getChatEvaluations()), 300);
    } catch (err) {
      console.error(err);
      setErrorMsg('No se pudo generar la evaluación. Revisa tu conexión a internet.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleClearHistory = () => {
    if (!confirm('¿Borrar historial de evaluaciones?')) return;
    clearChatEvaluations();
    setChatHistory([]);
  };

  const filteredProfiles = difficultyFilter === 'Todos'
    ? CUSTOMER_PROFILES
    : CUSTOMER_PROFILES.filter(p => p.difficulty === difficultyFilter);

  return (
    <div style={{ padding: '0 12px 20px 12px', maxWidth: '1280px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      
      {/* Mobile Profile Switcher Pill / Header Card */}
      <div className="glass-panel" style={{ padding: '12px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.8rem' }}>{selectedProfile.avatar}</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <strong style={{ fontSize: '0.98rem' }}>{selectedProfile.name}</strong>
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
            className="btn-primary"
            style={{ fontSize: '0.78rem', padding: '7px 14px', gap: '6px' }}
          >
            <Users size={14} />
            <span>Elegir Cliente ({CUSTOMER_PROFILES.length})</span>
            {showProfileSelector ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

        </div>

        {/* Expandable Profiles Grid with Difficulty Tabs */}
        {showProfileSelector && (
          <div style={{
            marginTop: '14px',
            paddingTop: '14px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            
            {/* Difficulty Filter Tabs */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {['Todos', 'Fácil', 'Medio', 'Difícil'].map(lvl => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setDifficultyFilter(lvl)}
                  className={difficultyFilter === lvl ? 'btn-primary' : 'btn-secondary'}
                  style={{ fontSize: '0.72rem', padding: '4px 10px' }}
                >
                  {lvl === 'Todos' ? `Todos (${CUSTOMER_PROFILES.length})` : lvl}
                </button>
              ))}
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '10px',
              maxHeight: '340px',
              overflowY: 'auto',
              paddingRight: '4px'
            }}>
              {filteredProfiles.map(profile => {
                const isSelected = profile.id === selectedProfile.id;
                return (
                  <div
                    key={profile.id}
                    onClick={() => handleSelectProfile(profile)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-sm)',
                      background: isSelected ? 'rgba(255, 159, 28, 0.15)' : 'rgba(255,255,255,0.03)',
                      border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{profile.avatar} {profile.name}</span>
                      <span className={`badge ${profile.badgeClass}`} style={{ fontSize: '0.6rem', padding: '2px 5px' }}>{profile.difficulty}</span>
                    </div>
                    <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{profile.occupation} • {profile.age} años</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontStyle: 'italic', lineHeight: 1.2, marginTop: '2px' }}>
                      🎯 {profile.goal}
                    </p>
                  </div>
                );
              })}
            </div>

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
            Cliente en Vivo: <strong>{selectedProfile.name}</strong>
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
                  {isUser ? 'Tú (Asesor)' : selectedProfile.name} • {msg.time}
                </span>

                <div style={{
                  padding: '10px 14px',
                  borderRadius: isUser ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  background: isUser ? 'linear-gradient(135deg, var(--primary) 0%, #f77f00 100%)' : 'rgba(255, 255, 255, 0.08)',
                  color: isUser ? '#000' : 'var(--text-main)',
                  fontWeight: isUser ? 600 : 400,
                  fontSize: '0.88rem',
                  lineHeight: 1.45,
                  whiteSpace: 'pre-wrap',
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

        {/* Botón historial debajo del chat */}
        <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => { setChatHistory(getChatEvaluations()); setShowHistory(!showHistory); }} className="btn-secondary" style={{ fontSize: '0.74rem', padding: '6px 10px', gap: '6px' }}>
            <History size={14} /> {showHistory ? 'Ocultar historial' : `Ver historial (${chatHistory.length})`} {showHistory ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
          </button>
          {chatHistory.length > 0 && showHistory && (
            <button onClick={handleClearHistory} className="btn-secondary" style={{ fontSize: '0.7rem', padding: '4px 8px', color: 'var(--accent-red)', borderColor: 'rgba(230,57,70,0.3)' }}><Trash2 size={12}/> Limpiar</button>
          )}
        </div>

        {showHistory && (
          <div style={{ maxHeight: '340px', overflowY: 'auto', borderTop: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.15)', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {chatHistory.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textAlign: 'center', padding: '16px' }}>Aún no hay evaluaciones. ¡Practicá una charla y pedí tu evaluación!</p>
            ) : chatHistory.map(item => {
              const isExp = expandedHistId === item.id;
              const d = new Date(item.date);
              const scoreColor = item.score >= 80 ? 'var(--accent-green)' : item.score >= 60 ? 'var(--primary)' : 'var(--accent-red)';
              return (
                <div key={item.id} style={{ background: 'var(--bg-card)', border: isExp ? '1px solid var(--primary)' : '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                  <div onClick={() => setExpandedHistId(isExp ? null : item.id)} style={{ padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      <span style={{ width: '32px', height: '32px', borderRadius: '50%', background: `${scoreColor}22`, border: `2px solid ${scoreColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem', color: scoreColor, flexShrink: 0 }}>{item.score}</span>
                      <div style={{ minWidth: 0 }}>
                        <strong style={{ fontSize: '0.82rem', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.profileAvatar} {item.profileName} • {item.difficulty}</strong>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{d.toLocaleDateString('es-AR')} {d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} • {item.verdict || 'Evaluación'}</span>
                      </div>
                    </div>
                    <span style={{ color: 'var(--text-dim)', transform: isExp ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}><ChevronDown size={16}/></span>
                  </div>
                  {isExp && (
                    <div style={{ padding: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(0,0,0,0.2)' }}>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-main)', fontStyle: 'italic', background: 'rgba(255,255,255,0.04)', padding: '8px 10px', borderRadius: '6px' }}>"{item.summary}"</p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', textAlign: 'center' }}>
                        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px', borderRadius: '6px' }}><span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Objeciones</span><strong style={{ display: 'block', color: scoreColor }}>{item.objectionHandlingScore ?? '-'}%</strong></div>
                        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px', borderRadius: '6px' }}><span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Claridad</span><strong style={{ display: 'block', color: scoreColor }}>{item.conceptClarityScore ?? '-'}%</strong></div>
                        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px', borderRadius: '6px' }}><span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Cierre</span><strong style={{ display: 'block', color: scoreColor }}>{item.closingTechniqueScore ?? '-'}%</strong></div>
                      </div>
                      {item.strengths?.length > 0 && (
                        <div style={{ background: 'rgba(46,196,182,0.08)', border: '1px solid rgba(46,196,182,0.2)', padding: '10px', borderRadius: '6px' }}>
                          <strong style={{ fontSize: '0.7rem', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={12}/> Aciertos:</strong>
                          <ul style={{ paddingLeft: '16px', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>{item.strengths.map((s,i)=><li key={i}>{s}</li>)}</ul>
                        </div>
                      )}
                      {item.areasForImprovement?.length > 0 && (
                        <div style={{ background: 'rgba(230,57,70,0.08)', border: '1px solid rgba(230,57,70,0.2)', padding: '10px', borderRadius: '6px' }}>
                          <strong style={{ fontSize: '0.7rem', color: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: '4px' }}><AlertTriangle size={12}/> A mejorar:</strong>
                          <ul style={{ paddingLeft: '16px', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>{item.areasForImprovement.map((s,i)=><li key={i}>{s}</li>)}</ul>
                        </div>
                      )}
                      {item.proTip && (
                        <div style={{ background: 'rgba(255,159,28,0.08)', border: '1px solid rgba(255,159,28,0.2)', padding: '10px', borderRadius: '6px', display: 'flex', gap: '8px' }}>
                          <Lightbulb size={14} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-main)' }}>{item.proTip}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Input Area with Auto-expanding Textarea, Microphone and Send Button */}
        <form onSubmit={handleSendMessage} style={{ padding: '10px 12px', borderTop: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
          
          {/* Microphone Button */}
          <button
            type="button"
            onClick={toggleRecording}
            className={`btn-mic ${isRecording ? 'btn-mic-recording' : 'btn-mic-idle'}`}
            style={{ height: '46px', width: '46px', flexShrink: 0 }}
            title={isRecording ? "Detener grabación" : "Hablar por micrófono"}
          >
            {isRecording ? <Mic size={22} /> : <Mic size={20} />}
          </button>

          {/* Auto-expanding Text Input */}
          <textarea
            ref={textareaRef}
            rows={1}
            placeholder={isRecording ? "Escuchando tu voz... Habla ahora" : `Escribe tu respuesta comercial... (Enter para enviar)`}
            value={inputMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '12px 14px',
              background: 'var(--bg-input)',
              border: isRecording ? '1px solid var(--accent-red)' : '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-main)',
              fontSize: '0.9rem',
              outline: 'none',
              resize: 'none',
              lineHeight: '1.4',
              maxHeight: '140px',
              minHeight: '46px',
              overflowY: 'auto'
            }}
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="btn-primary"
            style={{ padding: '0 16px', height: '46px', borderRadius: 'var(--radius-sm)', flexShrink: 0 }}
          >
            <Send size={18} />
          </button>
        </form>

      </div>

    </div>
  );
}
