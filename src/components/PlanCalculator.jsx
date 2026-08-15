import React, { useState } from 'react';
import { Calculator, CheckCircle2, XCircle, TrendingUp, DollarSign, Award, HelpCircle } from 'lucide-react';

export default function PlanCalculator() {
  const [targetCapital, setTargetCapital] = useState(15000000); // 15 millones
  const [selectedTerm, setSelectedTerm] = useState(300); // 300 cuotas (25 años) o 120 cuotas

  const formatMoney = (val) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);
  };

  // Cálculo aproximado de cuota de ahorro mensual
  const monthlyContribution = Math.round(targetCapital / selectedTerm * 1.15); // +15% gastos administrativos/suscripción
  const bankMonthlyPayment = Math.round(targetCapital / 48 * 1.85); // Préstamo bancario a 48 meses con intereses altos
  const dealershipMonthlyPayment = Math.round(targetCapital / 84 * 1.25); // Plan concesionaria a 84 meses

  return (
    <div style={{ padding: '0 12px 30px 12px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      
      {/* Header */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, #f77f00 100%)',
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          boxShadow: '0 4px 12px rgba(255, 159, 28, 0.3)'
        }}>
          📊
        </div>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>
            Calculadora y Comparador de <span style={{ color: 'var(--primary)' }}>Planes AutoCrédito</span>
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Herramienta visual para demostrarle al cliente por qué AutoCrédito es más inteligente que endeudarse con un banco o un plan tradicional.
          </p>
        </div>
      </div>

      {/* Input Slider Controls */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', alignItems: 'center' }}>
          
          <div>
            <label style={{ fontSize: '0.88rem', fontWeight: 700, display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Capital / Valor del Auto 0km:</span>
              <strong style={{ color: 'var(--primary)', fontSize: '1.15rem' }}>{formatMoney(targetCapital)}</strong>
            </label>
            <input
              type="range"
              min="5000000"
              max="40000000"
              step="500000"
              value={targetCapital}
              onChange={e => setTargetCapital(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              <span>$5.000.000 (Motos / Ahorro)</span>
              <span>$20.000.000 (Sedán)</span>
              <span>$40.000.000 (Pick-up / Casa)</span>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.88rem', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
              Plazo de Suscripción:
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setSelectedTerm(300)}
                className={selectedTerm === 300 ? 'btn-primary' : 'btn-secondary'}
                style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}
              >
                300 Meses (Cuota Mínima)
              </button>
              <button
                type="button"
                onClick={() => setSelectedTerm(120)}
                className={selectedTerm === 120 ? 'btn-primary' : 'btn-secondary'}
                style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}
              >
                120 Meses (10 Años)
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Comparison Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        
        {/* AutoCrédito Card (Highlighted) */}
        <div className="glass-card" style={{
          padding: '24px',
          border: '2px solid var(--primary)',
          background: 'linear-gradient(180deg, rgba(255, 159, 28, 0.12) 0%, rgba(18, 25, 41, 0.9) 100%)',
          boxShadow: '0 0 25px rgba(255, 159, 28, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: '-12px',
            right: '20px',
            background: 'var(--primary)',
            color: '#000',
            fontWeight: 800,
            fontSize: '0.72rem',
            padding: '3px 10px',
            borderRadius: 'var(--radius-full)',
            textTransform: 'uppercase'
          }}>
            ⭐ La Opción Más Inteligente
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '4px' }}>
            AutoCrédito Capitalización
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Ahorro programado con sorteo mensual de liberación de deuda.
          </p>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Aporte mensual estimado:</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
              {formatMoney(monthlyContribution)} <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted)' }}>/ mes</span>
            </div>
          </div>

          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.84rem', marginBottom: '20px' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-green)' }}>
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <strong>Si salís sorteado: NO PAGÁS MÁS CUOTAS y te llevás el total.</strong>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-green)' }}>
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              Cero intereses bancarios ni endeudamiento prendario.
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-green)' }}>
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              Fiscalizado bajo ley nacional por la IGJ.
            </li>
          </ul>
        </div>

        {/* Traditional Dealership Plan Card */}
        <div className="glass-card" style={{ padding: '24px', opacity: 0.85 }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
            Plan Ahorro Concesionaria
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Ej: Plan Rombo, Fiat Plan, etc. (84 cuotas).
          </p>

          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cuota pura + cargos promedio:</span>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
              {formatMoney(dealershipMonthlyPayment)} <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted)' }}>/ mes</span>
            </div>
          </div>

          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.82rem' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-red)' }}>
              <XCircle size={18} style={{ flexShrink: 0 }} />
              <strong>Si adjudicas: TENÉS QUE SEGUIR PAGANDO todas las cuotas que queden.</strong>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
              <XCircle size={18} style={{ flexShrink: 0 }} />
              Gastos de flete y entrega obligatorios muy elevados.
            </li>
          </ul>
        </div>

        {/* Bank Loan Card */}
        <div className="glass-card" style={{ padding: '24px', opacity: 0.85 }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
            Préstamo Bancario Prendario
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Crédito tradicional a 48 meses con intereses altos.
          </p>

          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cuota bancaria con interés:</span>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--accent-red)', marginTop: '2px' }}>
              {formatMoney(bankMonthlyPayment)} <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted)' }}>/ mes</span>
            </div>
          </div>

          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.82rem' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-red)' }}>
              <XCircle size={18} style={{ flexShrink: 0 }} />
              Terminás pagando 2 o 3 veces el valor del auto por las tasas de interés.
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-red)' }}>
              <XCircle size={18} style={{ flexShrink: 0 }} />
              Requisitos bancarios y de recibo de sueldo excluyentes.
            </li>
          </ul>
        </div>

      </div>

    </div>
  );
}
