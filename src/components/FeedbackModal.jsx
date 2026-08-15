import React from 'react';
import { X, Award, CheckCircle2, AlertTriangle, Lightbulb, RefreshCw } from 'lucide-react';

export default function FeedbackModal({ isOpen, onClose, feedback, profile, onRestartSession }) {
  if (!isOpen || !feedback) return null;

  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--accent-green)';
    if (score >= 60) return 'var(--primary)';
    return 'var(--accent-red)';
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '680px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '32px',
        position: 'relative'
      }}>
        
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={22} />
        </button>

        {/* Header Report */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${getScoreColor(feedback.score)}22 0%, transparent 70%)`,
            border: `2px solid ${getScoreColor(feedback.score)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: '800',
            color: getScoreColor(feedback.score)
          }}>
            {feedback.score}
          </div>

          <div>
            <span className="badge badge-medium" style={{ marginBottom: '4px' }}>
              Reporte de Evaluación IA
            </span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
              Resultado vs. {profile.name}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {feedback.summary}
            </p>
          </div>
        </div>

        {/* Metric Progress Bars */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.25)',
          padding: '18px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '16px'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
              <span>Manejo de Objeciones</span>
              <strong style={{ color: getScoreColor(feedback.objectionHandlingScore) }}>{feedback.objectionHandlingScore}%</strong>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${feedback.objectionHandlingScore}%`, height: '100%', background: getScoreColor(feedback.objectionHandlingScore) }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
              <span>Claridad AutoCrédito</span>
              <strong style={{ color: getScoreColor(feedback.conceptClarityScore) }}>{feedback.conceptClarityScore}%</strong>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${feedback.conceptClarityScore}%`, height: '100%', background: getScoreColor(feedback.conceptClarityScore) }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
              <span>Técnica de Cierre</span>
              <strong style={{ color: getScoreColor(feedback.closingTechniqueScore) }}>{feedback.closingTechniqueScore}%</strong>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${feedback.closingTechniqueScore}%`, height: '100%', background: getScoreColor(feedback.closingTechniqueScore) }} />
            </div>
          </div>
        </div>

        {/* Strengths & Weaknesses Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          
          {/* Strengths */}
          <div style={{ background: 'rgba(46, 196, 182, 0.06)', border: '1px solid rgba(46, 196, 182, 0.2)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', marginBottom: '12px' }}>
              <CheckCircle2 size={18} /> Aciertos de la Venta
            </h4>
            <ul style={{ paddingLeft: '18px', fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
              {feedback.strengths.map((str, idx) => (
                <li key={idx}>{str}</li>
              ))}
            </ul>
          </div>

          {/* Improvements */}
          <div style={{ background: 'rgba(230, 57, 70, 0.06)', border: '1px solid rgba(230, 57, 70, 0.2)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ color: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', marginBottom: '12px' }}>
              <AlertTriangle size={18} /> Áreas a Reforzar
            </h4>
            <ul style={{ paddingLeft: '18px', fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
              {feedback.areasForImprovement.map((imp, idx) => (
                <li key={idx}>{imp}</li>
              ))}
            </ul>
          </div>

        </div>

        {/* Golden Pro Tip */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 159, 28, 0.15) 0%, rgba(255, 140, 0, 0.08) 100%)',
          border: '1px solid rgba(255, 159, 28, 0.3)',
          padding: '18px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '24px',
          display: 'flex',
          gap: '14px',
          alignItems: 'flex-start'
        }}>
          <Lightbulb size={24} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '4px' }}>
              Tip de Oro para AutoCrédito:
            </h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
              {feedback.proTip}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button className="btn-secondary" onClick={onClose}>
            Cerrar Reporte
          </button>
          <button className="btn-primary" onClick={() => { onClose(); onRestartSession(); }}>
            <RefreshCw size={16} /> Practicar Otra Vez
          </button>
        </div>

      </div>
    </div>
  );
}
