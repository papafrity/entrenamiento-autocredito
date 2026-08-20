import React, { useState, useEffect, useRef } from 'react';
import { evaluatePitchSession } from '../services/geminiService';
import { awardPointsToCurrentUser, savePitchResult, getPitchHistory } from '../services/storageService';
import { Mic, MicOff, Play, Square, RotateCcw, Award, CheckCircle2, AlertTriangle, Sparkles, Clock, Flame, BookOpen, Volume2 } from 'lucide-react';

const PITCH_CHALLENGES = [
  {
    id: 'cronos_0km',
    title: '🚗 El 0KM en 60 Segundos (Fiat Cronos 1.3)',
    category: 'Vehículo',
    difficulty: 'Fácil',
    prompt: 'Un cliente en WhatsApp te pregunta: "¿Por qué debería entrar a AutoCrédito por un Cronos en vez de ir a una concesionaria?". Tenés 60 segundos para convencerlo.',
    keyPointsTarget: ['Sorteo mensual por Lotería Nacional', 'Si adjudica NO paga más cuotas', 'Cuota pura accesible sin intereses bancarios']
  },
  {
    id: 'capital_40m',
    title: '💰 Presentá el Plan $40.000.000 de Efectivo',
    category: 'Dinero en Efectivo',
    difficulty: 'Medio',
    prompt: 'Un comerciante necesita $40.000.000 para ampliar su local pero le asustan las tasas de los bancos. Explicále en 1 minuto cómo AutoCrédito es su mejor opción.',
    keyPointsTarget: ['Monto nominal adjudicable', 'Sin deudas ni hipotecas', 'Aporte de ahorro inteligente']
  },
  {
    id: 'no_mas_cuotas',
    title: '🏆 "Si salís sorteado NO pagás más cuotas"',
    category: 'Concepto Clave',
    difficulty: 'Medio',
    prompt: 'Un cliente escéptico te dice: "Nadie regala nada, seguro si salgo sorteado me siguen cobrando las cuotas". Explicále en 60 segundos cómo funciona la masa de capitalización y la IGJ.',
    keyPointsTarget: ['Inspección General de Justicia (IGJ)', 'Fondo de capitalización oficial', 'Contrato nominativo']
  },
  {
    id: 'vivienda_58m',
    title: '🏡 Plan Vivienda Kit 58 m² para Familias',
    category: 'Vivienda',
    difficulty: 'Difícil',
    prompt: 'Una pareja joven quiere su primera casa propia. Tenés 60 segundos para motivarlos con el Kit Vivienda de 58 m² y el sorteo de adjudicación.',
    keyPointsTarget: ['Kit constructivo completo', 'Casa propia sin endeudarse a 30 años', 'Entrega ante Escribano Público']
  },
  {
    id: 'inflacion_dolar',
    title: '🛡️ "En este país con la inflación no se puede ahorrar"',
    category: 'Objeción Fuerte',
    difficulty: 'Difícil',
    prompt: 'El cliente duda de comprometerse a largo plazo por la economía argentina. Demostrále en 60s cómo el bien (auto o valor de rescate) se protege de la devaluación.',
    keyPointsTarget: ['Actualización según valor del bien', 'Disciplina de ahorro', 'Cuota congelada de suscripción']
  }
];

export default function ElevatorPitch({ onPointsAwarded }) {
  const [selectedChallenge, setSelectedChallenge] = useState(PITCH_CHALLENGES[0]);
  const [pitchText, setPitchText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [history, setHistory] = useState(getPitchHistory());
  const [hasSpeech, setHasSpeech] = useState(false);

  const timerRef = useRef(null);
  const recognitionRef = useRef(null);

  // Inicializar Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setHasSpeech(!!SpeechRecognition);
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'es-AR';

      recognition.onstart = () => setIsRecording(true);
      recognition.onend = () => setIsRecording(false);
      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal || event.results[i][0].transcript) {
            transcript += event.results[i][0].transcript + ' ';
          }
        }
        if (transcript.trim()) {
          setPitchText(prev => {
            // evitar duplicar si ya contiene el texto
            const combined = (prev + ' ' + transcript).trim().replace(/\s+/g, ' ');
            return combined;
          });
        }
      };

      recognition.onerror = (event) => {
        console.error('Pitch recognition error:', event.error);
        setIsRecording(false);
        if (event.error === 'not-allowed') {
          setErrorMsg('Habilitá el permiso de micrófono en tu navegador para grabar por voz.');
        } else if (event.error === 'no-speech') {
          setErrorMsg('No se detectó voz. Probá hablar más cerca del micrófono.');
        }
      };

      recognition.onend = () => setIsRecording(false);

      recognitionRef.current = recognition;
    }
  }, []);

  // Control del cronómetro de 60 segundos
  useEffect(() => {
    if (isRunning && timerSeconds > 0) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            handleStop();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, timerSeconds]);

  const toggleMic = () => {
    if (!recognitionRef.current) {
      setErrorMsg('Tu navegador no soporta voz (probá en Chrome). Podés escribir tu pitch manualmente.');
      return;
    }
    if (isRecording) {
      try { recognitionRef.current.stop(); } catch {}
      setIsRecording(false);
    } else {
      setErrorMsg('');
      try { recognitionRef.current.start(); } catch (err) { console.warn(err); }
    }
  };

  const handleStart = () => {
    setErrorMsg('');
    setEvaluation(null);
    setTimerSeconds(60);
    setPitchText('');
    setIsRunning(true);
    // auto-iniciar mic si hay soporte
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Recognition already started or error:', err);
      }
    } else if (!hasSpeech) {
      setErrorMsg('Tu navegador no soporta dictado por voz. Escribí tu pitch manualmente.');
    }
  };

  const handleStop = () => {
    setIsRunning(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.warn('Recognition stop error:', err);
      }
    }
    setIsRecording(false);
  };

  const handleReset = () => {
    handleStop();
    setTimerSeconds(60);
    setPitchText('');
    setEvaluation(null);
    setErrorMsg('');
  };

  const handleEvaluate = async () => {
    if (!pitchText.trim() || pitchText.trim().length < 20) {
      setErrorMsg('Por favor grabá o escribí al menos 1 o 2 oraciones para evaluar tu pitch.');
      return;
    }

    handleStop();
    setIsEvaluating(true);
    setErrorMsg('');

    const durationUsed = 60 - timerSeconds;

    try {
      const result = await evaluatePitchSession({
        challengeTitle: selectedChallenge.title,
        pitchText: pitchText.trim(),
        durationSeconds: durationUsed > 0 ? durationUsed : 60
      });

      setEvaluation(result);

      // Otorgar puntos si el puntaje es bueno
      if (result.score) {
        await awardPointsToCurrentUser(result.score, result.score >= 80 ? 'pitch_master' : null);
        onPointsAwarded?.();
      }

      // Guardar en historial local
      const saved = savePitchResult({
        id: Date.now(),
        challengeTitle: selectedChallenge.title,
        score: result.score,
        verdict: result.verdict,
        date: new Date().toLocaleDateString('es-AR')
      });
      setHistory(saved);

    } catch (err) {
      console.error(err);
      setErrorMsg('Error al conectar con la IA para evaluar: ' + (err.message || 'Intenta de nuevo.'));
    } finally {
      setIsEvaluating(false);
    }
  };

  const progressPercentage = ((60 - timerSeconds) / 60) * 100;
  const isTimeCritical = timerSeconds <= 10 && isRunning;

  return (
    <div style={{ padding: '0 12px 30px 12px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      
      {/* Header */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #e63946 0%, #ff9f1c 100%)',
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            boxShadow: '0 4px 15px rgba(230, 57, 70, 0.4)'
          }}>
            ⏱️
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>
              Modo Pitch de <span style={{ color: 'var(--accent-red)' }}>60 Segundos</span>
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Entrenamiento intensivo contra reloj: presentá un plan en 1 minuto y recibí correcciones de la IA.
            </p>
          </div>
        </div>

        <span className="badge badge-hard" style={{ fontSize: '0.75rem', padding: '6px 12px' }}>
          ⚡ +75 Puntos al ranking
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* Left Column: Challenge Selector & Recording Studio */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Challenge Selector Pills */}
          <div className="glass-panel" style={{ padding: '16px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '10px' }}>
              🎯 Elegí tu desafío de pitch:
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {PITCH_CHALLENGES.map(ch => {
                const isSelected = ch.id === selectedChallenge.id;
                return (
                  <div
                    key={ch.id}
                    onClick={() => {
                      if (!isRunning) {
                        setSelectedChallenge(ch);
                        handleReset();
                      }
                    }}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: isSelected ? 'rgba(230, 57, 70, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                      border: isSelected ? '1px solid var(--accent-red)' : '1px solid var(--border-color)',
                      cursor: isRunning ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '0.86rem', color: isSelected ? 'var(--accent-red)' : 'var(--text-main)' }}>
                        {ch.title}
                      </strong>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {ch.category} • Dificultad: {ch.difficulty}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Challenge Prompt Card */}
          <div className="glass-card" style={{ padding: '18px', borderLeft: '4px solid var(--primary)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>
              Tu Misión:
            </span>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginTop: '4px', lineHeight: 1.4, fontWeight: 600 }}>
              {selectedChallenge.prompt}
            </p>
            <div style={{ marginTop: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {selectedChallenge.keyPointsTarget.map((pt, i) => (
                <span key={i} style={{ fontSize: '0.68rem', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '12px', color: 'var(--text-muted)' }}>
                  ✔ {pt}
                </span>
              ))}
            </div>
          </div>

          {/* Recording / Timer Dashboard */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            
            {/* Circular Timer & Progress */}
            <div style={{ position: 'relative', width: '130px', height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                borderRadius: '50%',
                border: isTimeCritical ? '4px solid var(--accent-red)' : '4px solid var(--primary)',
                boxShadow: isRunning ? (isTimeCritical ? '0 0 25px rgba(230, 57, 70, 0.6)' : '0 0 20px rgba(255, 159, 28, 0.4)') : 'none',
                transition: 'all 0.3s'
              }} />
              <div style={{ textAlign: 'center' }}>
                <span style={{
                  fontSize: '2.4rem',
                  fontWeight: 900,
                  color: isTimeCritical ? 'var(--accent-red)' : (timerSeconds === 0 ? 'var(--text-muted)' : 'var(--text-main)'),
                  lineHeight: 1
                }}>
                  {timerSeconds}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block', textTransform: 'uppercase' }}>
                  segundos
                </span>
              </div>
            </div>

            {/* Controls Bar */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
              {!isRunning ? (
                <button
                  onClick={handleStart}
                  className="btn-primary"
                  style={{ padding: '12px 24px', fontSize: '0.95rem', gap: '8px', background: 'linear-gradient(135deg, var(--accent-red) 0%, #ff9f1c 100%)', color: '#fff' }}
                >
                  <Play size={18} /> Iniciar Pitch de 60s
                </button>
              ) : (
                <button
                  onClick={handleStop}
                  className="btn-secondary"
                  style={{ padding: '12px 20px', fontSize: '0.9rem', gap: '8px', borderColor: 'var(--accent-red)', color: 'var(--accent-red)' }}
                >
                  <Square size={16} /> Detener
                </button>
              )}

              <button
                onClick={toggleMic}
                className={isRecording ? 'btn-mic btn-mic-recording' : 'btn-mic btn-mic-idle'}
                style={{ width: '46px', height: '46px', flexShrink: 0 }}
                title={isRecording ? 'Detener micrófono' : 'Hablar por micrófono'}
                type="button"
              >
                {isRecording ? <Mic size={20} /> : <MicOff size={18} />}
              </button>
              <span style={{ fontSize: '0.72rem', color: isRecording ? 'var(--accent-red)' : 'var(--text-dim)', fontWeight: 600 }}>{isRecording ? '● Grabando...' : hasSpeech ? 'Mic listo' : 'Sin voz'}</span>

              <button
                onClick={handleReset}
                className="btn-secondary"
                style={{ padding: '12px', fontSize: '0.85rem' }}
                title="Reiniciar cronómetro"
              >
                <RotateCcw size={16} />
              </button>
            </div>

            {/* Pitch Textarea Live Transcription */}
            <div style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {isRecording ? '🎙️ Escuchando tu voz en vivo...' : 'Texto del Pitch (hablá por micrófono o escribí):'}
                </label>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                  {pitchText.split(/\s+/).filter(Boolean).length} palabras
                </span>
              </div>

              <textarea
                rows={4}
                value={pitchText}
                onChange={e => setPitchText(e.target.value)}
                placeholder="Hacé clic en Iniciar Pitch y hablá por tu micrófono, o escribí acá tu presentación..."
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'var(--bg-input)',
                  border: isRecording ? '1px solid var(--accent-red)' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-main)',
                  fontSize: '0.88rem',
                  lineHeight: 1.4,
                  outline: 'none',
                  resize: 'none'
                }}
              />
            </div>

            {errorMsg && (
              <p style={{ color: 'var(--accent-red)', fontSize: '0.78rem', margin: 0 }}>{errorMsg}</p>
            )}

            {/* Evaluate Button */}
            <button
              onClick={handleEvaluate}
              disabled={isEvaluating || !pitchText.trim()}
              className="btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '0.95rem', gap: '8px' }}
            >
              <Award size={18} />
              <span>{isEvaluating ? 'La IA está analizando tu pitch...' : 'Solicitar Evaluación de la IA'}</span>
            </button>

          </div>

        </div>

        {/* Right Column: AI Evaluation Result & Pro Pitch Script */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {evaluation ? (
            <div className="glass-card" style={{
              padding: '24px',
              border: evaluation.score >= 80 ? '2px solid var(--accent-green)' : '2px solid var(--primary)',
              background: 'linear-gradient(180deg, rgba(255, 159, 28, 0.08) 0%, rgba(18, 25, 41, 0.95) 100%)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              
              {/* Score Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span className="badge badge-medium" style={{ fontSize: '0.7rem' }}>
                    {evaluation.verdict}
                  </span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '4px' }}>
                    Devolución del Director Comercial
                  </h3>
                </div>

                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: evaluation.score >= 80 ? 'rgba(46, 196, 182, 0.2)' : 'rgba(255, 159, 28, 0.2)',
                  border: evaluation.score >= 80 ? '2px solid var(--accent-green)' : '2px solid var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column'
                }}>
                  <strong style={{ fontSize: '1.3rem', color: evaluation.score >= 80 ? 'var(--accent-green)' : 'var(--primary)', lineHeight: 1 }}>
                    {evaluation.score}
                  </strong>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>/100</span>
                </div>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.45, fontStyle: 'italic', background: 'rgba(0,0,0,0.25)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
                "{evaluation.summary}"
              </p>

              {/* Sub-scores */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', textAlign: 'center' }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Claridad</span>
                  <strong style={{ fontSize: '1rem', color: 'var(--primary)', display: 'block' }}>{evaluation.clarityScore || 85}%</strong>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Persuasión</span>
                  <strong style={{ fontSize: '1rem', color: 'var(--secondary)', display: 'block' }}>{evaluation.persuasionScore || 80}%</strong>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Cierre</span>
                  <strong style={{ fontSize: '1rem', color: 'var(--accent-green)', display: 'block' }}>{evaluation.closingScore || 75}%</strong>
                </div>
              </div>

              {/* Strengths & Improvements */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <strong style={{ fontSize: '0.78rem', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <CheckCircle2 size={14} /> Puntos Fuertes:
                  </strong>
                  <ul style={{ paddingLeft: '16px', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {evaluation.strengths?.map((st, i) => <li key={i}>{st}</li>)}
                  </ul>
                </div>

                <div>
                  <strong style={{ fontSize: '0.78rem', color: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <AlertTriangle size={14} /> Cómo Mejorar tu Próximo Pitch:
                  </strong>
                  <ul style={{ paddingLeft: '16px', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {evaluation.improvements?.map((imp, i) => <li key={i}>{imp}</li>)}
                  </ul>
                </div>
              </div>

              {/* Improved Pitch Example */}
              {evaluation.improvedPitchExample && (
                <div style={{ background: 'rgba(46, 196, 182, 0.08)', border: '1px solid rgba(46, 196, 182, 0.3)', padding: '14px', borderRadius: 'var(--radius-sm)' }}>
                  <strong style={{ fontSize: '0.8rem', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <Sparkles size={15} /> Versión Sugerida por la IA (Pitch Modelo):
                  </strong>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-main)', fontStyle: 'italic', lineHeight: 1.5 }}>
                    "{evaluation.improvedPitchExample}"
                  </p>
                </div>
              )}

            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '360px' }}>
              <Flame size={44} color="var(--primary)" style={{ opacity: 0.7, marginBottom: '14px' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Poné a prueba tu velocidad comercial
              </h3>
              <p style={{ fontSize: '0.82rem', marginTop: '6px', maxWidth: '340px', lineHeight: 1.5 }}>
                Elegí un desafío arriba<span className="mobile-hide"> a la izquierda</span>, presioná <strong>"Iniciar Pitch"</strong> o el <strong>micrófono 🎙️</strong> y grabá tu argumento en menos de 60s. La IA te dará una devolución con puntuación.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
