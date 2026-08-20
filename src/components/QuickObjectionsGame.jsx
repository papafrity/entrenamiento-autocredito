import React, { useState, useEffect, useRef } from 'react';
import { awardPointsToCurrentUser } from '../services/storageService';
import { Zap, Clock, CheckCircle2, XCircle, Trophy, RotateCcw, Play, Award, Sparkles, ShieldCheck, Mic, MicOff } from 'lucide-react';

const FLASH_QUESTIONS = [
  {
    id: 1,
    objection: '“¿Si salgo sorteado en la cuota 3 me dan el auto pero tengo que seguir pagando las otras cuotas?”',
    options: [
      { text: 'Sí, tenés que pagar todas las cuotas igual que en una concesionaria.', isCorrect: false },
      { text: 'NO, quedás 100% liberado de pagar las cuotas restantes y te llevás el premio.', isCorrect: true, explanation: 'AutoCrédito te libera de toda la deuda restante si salís adjudicado por sorteo.' },
      { text: 'Depende de si licitás con plata encima o no.', isCorrect: false }
    ]
  },
  {
    id: 2,
    objection: '“¿AutoCrédito es un préstamo o crédito que me entregan la plata mañana?”',
    options: [
      { text: 'Sí, te damos el préstamo en 24 horas.', isCorrect: false },
      { text: 'No, es un plan de ahorro y capitalización con sorteos mensuales, no un préstamo.', isCorrect: true, explanation: 'AutoCrédito es una empresa de capitalización regulada por la IGJ, no una financiera.' },
      { text: 'Es un crédito prendario bancario con tasa fija.', isCorrect: false }
    ]
  },
  {
    id: 3,
    objection: '“¿Quién me garantiza que el sorteo no está arreglado o es mentira?”',
    options: [
      { text: 'El sorteo sale por la Lotería oficial ante Escribano Público el último sábado de cada mes.', isCorrect: true, explanation: 'Los sorteos son públicos y están auditados por Lotería y la Inspección General de Justicia (IGJ).' },
      { text: 'Lo hacemos nosotros en las oficinas de la empresa con un bolillero propio.', isCorrect: false },
      { text: 'La empresa elige al ganador según quién pagó primero.', isCorrect: false }
    ]
  },
  {
    id: 4,
    objection: '“¿Qué pasa si me quedo sin trabajo y quiero rescatar mi dinero antes de tiempo?”',
    options: [
      { text: 'El dinero se pierde completamente y no hay rescate.', isCorrect: false },
      { text: 'Existe una tabla de rescate aprobada por la IGJ que estipula el porcentaje recuperable.', isCorrect: true, explanation: 'El contrato cuenta con una tabla de valores de rescate oficial avalada por la IGJ.' },
      { text: 'Te devuelven el 100% al otro día sin ningún gasto de suscripción.', isCorrect: false }
    ]
  },
  {
    id: 5,
    objection: '“¿Por qué no me piden recibo de sueldo como en el banco?”',
    options: [
      { text: 'Porque vos estás ahorrando tu propio dinero y no adquiriendo una deuda con riesgo crediticio.', isCorrect: true, explanation: 'Al ser un plan de ahorro voluntario y no un préstamo bancario, solo se requiere DNI.' },
      { text: 'Porque es una empresa informal que no pide papeles.', isCorrect: false },
      { text: 'Porque el recibo de sueldo te lo piden después de salir sorteado obligatoriamente.', isCorrect: false }
    ]
  }
];

export default function QuickObjectionsGame() {
  const [hasStarted, setHasStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [micMsg, setMicMsg] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!hasStarted || isGameOver || isAnswered) return;

    if (timeLeft <= 0) {
      handleTimeOut();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [hasStarted, timeLeft, isGameOver, isAnswered]);

  const handleStartGame = () => {
    setHasStarted(true);
    setCurrentIndex(0);
    setTimeLeft(30);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsGameOver(false);
  };

  const handleTimeOut = () => {
    setIsAnswered(true);
    setSelectedOption(-1);
  };

  const handleSelectOption = (idx, isCorrect) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    if (isCorrect) {
      setScore(prev => prev + 20);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < FLASH_QUESTIONS.length) {
      setCurrentIndex(prev => prev + 1);
      setTimeLeft(30);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsGameOver(true);
      const finalScore = score + (selectedOption !== null && FLASH_QUESTIONS[currentIndex].options[selectedOption]?.isCorrect ? 20 : 0);
      awardPointsToCurrentUser(finalScore, finalScore >= 80 ? 'flash_master' : null);
    }
  };

  // Mic para responder por voz: "uno", "dos", "tres" / "opción 1/2/3"
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = 'es-AR';
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e) => {
      const t = e.results[0][0].transcript.toLowerCase().trim();
      setMicMsg(`Escuchado: "${t}"`);
      let idx = -1;
      if (t.includes('uno') || t.includes('opción 1') || t.includes('opcion 1') || t.includes('primera') || t.includes('1')) idx = 0;
      else if (t.includes('dos') || t.includes('opción 2') || t.includes('opcion 2') || t.includes('segunda') || t.includes('2')) idx = 1;
      else if (t.includes('tres') || t.includes('opción 3') || t.includes('opcion 3') || t.includes('tercera') || t.includes('3')) idx = 2;
      if (idx >= 0 && !isAnswered) {
        const opt = currentQ.options[idx];
        if (opt) handleSelectOption(idx, opt.isCorrect);
      }
      setTimeout(()=>setMicMsg(''), 2500);
    };
    rec.onend = () => setIsMicOn(false);
    rec.onerror = () => setIsMicOn(false);
    recognitionRef.current = rec;
  }, [currentIndex, isAnswered]);

  const toggleMic = () => {
    if (!recognitionRef.current) { setMicMsg('Voz no soportada en este navegador'); setTimeout(()=>setMicMsg(''),2000); return; }
    if (isMicOn) { try{ recognitionRef.current.stop(); }catch{} setIsMicOn(false); }
    else { setMicMsg('Escuchando... decí "uno", "dos" o "tres"'); setIsMicOn(true); try{ recognitionRef.current.start(); }catch{} }
  };

  const currentQ = FLASH_QUESTIONS[currentIndex];

  return (
    <div style={{ padding: '0 12px 30px 12px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      
      {/* Header */}
      <div className="glass-panel" style={{ padding: '18px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--accent-red) 0%, #d90429 100%)',
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.3rem'
          }}>
            ⚡
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Desafío de Objeciones Relámpago</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Entrená tus reflejos rápidos frente al cliente</p>
          </div>
        </div>

        {hasStarted && !isGameOver && (
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)' }}>
            Puntaje: {score} pts
          </div>
        )}
      </div>

      {/* Pantalla Inicial con Botón de Inicio */}
      {!hasStarted && (
        <div className="glass-panel" style={{ padding: '36px 24px', textAlign: 'center' }}>
          <div style={{
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            background: 'rgba(255, 159, 28, 0.15)',
            border: '2px solid var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            margin: '0 auto 16px auto'
          }}>
            🎯
          </div>

          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>
            ¿Estás listo para el Desafío Flash?
          </h3>
          
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 24px auto', lineHeight: 1.5 }}>
            Te mostraremos 5 objeciones típicas de clientes de AutoCrédito. Tendrás <strong>30 segundos por pregunta</strong> para responder correctamente y acumular puntos para tu ranking del equipo.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', maxWidth: '520px', margin: '0 auto 28px auto', textAlign: 'left' }}>
            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '12px', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} color="var(--primary)" />
              <span>30 seg por objeción</span>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '12px', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trophy size={16} color="var(--accent-green)" />
              <span>Hasta +100 pts de ranking</span>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '12px', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={16} color="var(--secondary)" />
              <span>Insignia "Reflejos de Oro"</span>
            </div>
          </div>

          <button
            onClick={handleStartGame}
            className="btn-primary"
            style={{ fontSize: '1.05rem', padding: '14px 32px', gap: '10px', boxShadow: '0 6px 20px rgba(255, 159, 28, 0.4)' }}
          >
            <Play size={20} fill="#000" /> Comenzar Desafío Ahora
          </button>
        </div>
      )}

      {/* Pantalla del Juego Activo */}
      {hasStarted && !isGameOver && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          
          {/* Progress & Timer + Mic */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <span className="badge badge-medium" style={{ fontSize: '0.75rem' }}>
              Pregunta {currentIndex + 1} de {FLASH_QUESTIONS.length}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button onClick={toggleMic} disabled={isAnswered} className={isMicOn ? 'btn-mic btn-mic-recording' : 'btn-mic btn-mic-idle'} style={{ width: '36px', height: '36px' }} title="Responder por voz: decí uno/dos/tres">
                {isMicOn ? <Mic size={16}/> : <MicOff size={14}/>}
              </button>
              {micMsg && <span style={{ fontSize: '0.72rem', color: 'var(--accent-green)', fontWeight: 600 }}>{micMsg}</span>}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: timeLeft <= 10 ? 'var(--accent-red)' : 'var(--primary)',
                fontWeight: 800,
                fontSize: '1.1rem'
              }}>
                <Clock size={18} /> {timeLeft}s
              </div>
            </div>
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '8px' }}>💡 Tip: podés decir <strong>"uno"</strong>, <strong>"dos"</strong> o <strong>"tres"</strong> por micrófono</p>

          {/* Objection Question */}
          <div style={{
            background: 'rgba(0,0,0,0.3)',
            padding: '20px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '20px',
            borderLeft: '4px solid var(--accent-red)'
          }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
              Objeción del Cliente:
            </span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.4 }}>
              {currentQ.objection}
            </h3>
          </div>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {currentQ.options.map((opt, idx) => {
              let borderStyle = '1px solid var(--border-color)';
              let bgStyle = 'rgba(255,255,255,0.03)';

              if (isAnswered) {
                if (opt.isCorrect) {
                  borderStyle = '2px solid var(--accent-green)';
                  bgStyle = 'rgba(46, 196, 182, 0.15)';
                } else if (selectedOption === idx) {
                  borderStyle = '2px solid var(--accent-red)';
                  bgStyle = 'rgba(230, 57, 70, 0.15)';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx, opt.isCorrect)}
                  disabled={isAnswered}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-sm)',
                    background: bgStyle,
                    border: borderStyle,
                    color: 'var(--text-main)',
                    fontSize: '0.88rem',
                    textAlign: 'left',
                    cursor: isAnswered ? 'default' : 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span>{opt.text}</span>
                  {isAnswered && opt.isCorrect && <CheckCircle2 size={20} color="var(--accent-green)" />}
                  {isAnswered && !opt.isCorrect && selectedOption === idx && <XCircle size={20} color="var(--accent-red)" />}
                </button>
              );
            })}
          </div>

          {/* Explanation Banner */}
          {isAnswered && (
            <div style={{
              background: 'rgba(0, 180, 216, 0.08)',
              border: '1px solid rgba(0, 180, 216, 0.25)',
              padding: '14px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '20px',
              fontSize: '0.84rem',
              color: 'var(--text-main)'
            }}>
              <strong>💡 Explicación Técnica: </strong>
              {currentQ.options.find(o => o.isCorrect)?.explanation}
            </div>
          )}

          {/* Next Button */}
          {isAnswered && (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={handleNextQuestion} className="btn-primary" style={{ padding: '10px 20px' }}>
                {currentIndex + 1 < FLASH_QUESTIONS.length ? 'Siguiente Pregunta ➔' : 'Ver Resultado Final 🏆'}
              </button>
            </div>
          )}

        </div>
      )}

      {/* Pantalla Final de Resultados */}
      {hasStarted && isGameOver && (
        <div className="glass-panel" style={{ padding: '36px 20px', textAlign: 'center' }}>
          <Trophy size={60} color="var(--primary)" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '6px' }}>
            ¡Desafío Completado!
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Has acumulado <strong>{score} puntos</strong> para tu ranking en el equipo.
          </p>

          <div style={{ display: 'inline-flex', gap: '12px', marginBottom: '16px' }}>
            <button onClick={handleStartGame} className="btn-primary" style={{ padding: '10px 20px', gap: '8px' }}>
              <RotateCcw size={16} /> Jugar de Nuevo
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
