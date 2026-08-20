import React, { useState } from 'react';
import { OFFICIAL_AUTOCREDITO_PLANS } from '../data/officialPlans';
import { getCurrentUserProfile } from '../services/storageService';
import { DollarSign, TrendingUp, Award, Sparkles, CheckCircle2, Share2, Plus, Trash2, HelpCircle, Calculator, ChevronRight } from 'lucide-react';

export default function CommissionCalculator() {
  const [calculationMode, setCalculationMode] = useState('quick'); // 'quick' | 'custom_plans'
  const [quickSalesCount, setQuickSalesCount] = useState(4);
  const [planType, setPlanType] = useState('di_total_1'); // 'di_total_1', 'di_total_2', 'di_parcial', 'tradicional'
  const [averageQuote, setAverageQuote] = useState(155000); // Promedio de cuota 1 a 7

  // Estado para modo lista de planes vendidos
  const [soldPlans, setSoldPlans] = useState([
    { id: '1', planCode: '31607', planName: 'Fiat Cronos 1.3 Like', quote: 172960, di: 345920 },
    { id: '2', planCode: '16465', planName: 'Plan 40 Millones Efectivo', quote: 157600, di: 315200 },
    { id: '3', planCode: '30041', planName: 'Honda Wave 110 S', quote: 38700, di: 77400 }
  ]);

  const [selectedPlanToAdd, setSelectedPlanToAdd] = useState('31607');
  const currentUser = getCurrentUserProfile();

  const formatMoney = (val) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);
  };

  // Escalas de comisión por volumen mensual en AutoCrédito
  // 1-2 ventas: Base (100% de la cuota comercial / DI pactado)
  // 3-5 ventas: Base + 15% bono
  // 6-8 ventas: Base + 30% bono
  // 9+ ventas: Base + 50% bono de Top Producer
  const getCommissionTier = (count) => {
    if (count >= 9) {
      return { tierName: 'Top Producer Diamante', bonusPercent: 0.50, badgeClass: 'badge-hard', emoji: '💎', nextThreshold: null, nextBonus: null };
    }
    if (count >= 6) {
      return { tierName: 'Productor Oro', bonusPercent: 0.30, badgeClass: 'badge-medium', emoji: '🥇', nextThreshold: 9, nextBonus: '+50% bono Diamante' };
    }
    if (count >= 3) {
      return { tierName: 'Productor Plata', bonusPercent: 0.15, badgeClass: 'badge-easy', emoji: '🥈', nextThreshold: 6, nextBonus: '+30% bono Oro' };
    }
    return { tierName: 'Nivel Inicial Bronce', bonusPercent: 0.0, badgeClass: 'badge-easy', emoji: '🥉', nextThreshold: 3, nextBonus: '+15% bono Plata' };
  };

  // Cálculos en Modo Rápido
  const quickTier = getCommissionTier(quickSalesCount);
  // En AutoCrédito el Derecho de Ingreso / Suscripción equivale aproximadamente a 1 o 2 cuotas comerciales según modalidad
  let commissionFactor = 1.0;
  if (planType === 'di_total_1') commissionFactor = 1.2;
  if (planType === 'di_total_2') commissionFactor = 1.0;
  if (planType === 'di_parcial') commissionFactor = 0.85;
  if (planType === 'tradicional') commissionFactor = 0.90;

  const quickBaseCommission = Math.round(quickSalesCount * averageQuote * commissionFactor);
  const quickBonusAmount = Math.round(quickBaseCommission * quickTier.bonusPercent);
  const quickTotalCommission = quickBaseCommission + quickBonusAmount;

  // Cálculos en Modo Planes Vendidos
  const customSalesCount = soldPlans.length;
  const customTier = getCommissionTier(customSalesCount);
  const customBaseCommission = soldPlans.reduce((acc, p) => acc + Math.round(p.quote * 1.1), 0);
  const customBonusAmount = Math.round(customBaseCommission * customTier.bonusPercent);
  const customTotalCommission = customBaseCommission + customBonusAmount;

  const activeCount = calculationMode === 'quick' ? quickSalesCount : customSalesCount;
  const activeTier = calculationMode === 'quick' ? quickTier : customTier;
  const activeTotal = calculationMode === 'quick' ? quickTotalCommission : customTotalCommission;
  const activeBase = calculationMode === 'quick' ? quickBaseCommission : customBaseCommission;
  const activeBonus = calculationMode === 'quick' ? quickBonusAmount : customBonusAmount;

  const handleAddPlan = () => {
    const planObj = OFFICIAL_AUTOCREDITO_PLANS.find(p => p.code === selectedPlanToAdd);
    if (!planObj) return;

    const newSold = {
      id: String(Date.now()),
      planCode: planObj.code,
      planName: planObj.name,
      quote: planObj.quote1to7,
      di: planObj.diTotal
    };
    setSoldPlans(prev => [...prev, newSold]);
  };

  const handleRemovePlan = (id) => {
    setSoldPlans(prev => prev.filter(p => p.id !== id));
  };

  const handleShareProjection = () => {
    const text = `💼 *MI PROYECCIÓN DE COMISIONES - AUTOCRÉDITO*\n` +
                 `━━━━━━━━━━━━━━━━━━━━\n` +
                 `👤 *Asesor:* ${currentUser?.name || 'Asesor Oficial'}\n` +
                 `📍 *Sucursal:* ${currentUser?.branch || 'Agencia Oficial'}\n` +
                 `🎯 *Ventas registradas:* ${activeCount} suscripciones\n` +
                 `🏅 *Escala alcanzada:* ${activeTier.emoji} ${activeTier.tierName}\n` +
                 `━━━━━━━━━━━━━━━━━━━━\n` +
                 `💵 *Comisión Base:* ${formatMoney(activeBase)}\n` +
                 `🎁 *Bono por Escala (+${Math.round(activeTier.bonusPercent * 100)}%):* ${formatMoney(activeBonus)}\n` +
                 `💰 *TOTAL ESTIMADO A COBRAR:* ${formatMoney(activeTotal)}\n\n` +
                 `_¡A seguir cerrando para alcanzar el siguiente escalón de la temporada!_ 🚗🔥`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div style={{ padding: '0 12px 30px 12px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      
      {/* Header */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #2ec4b6 0%, #00b4d8 100%)',
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            boxShadow: '0 4px 15px rgba(46, 196, 182, 0.4)'
          }}>
            💵
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>
              Estimador de <span style={{ color: 'var(--accent-green)' }}>Comisiones y Ganancias</span>
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Calculá cuánto vas a cobrar en la temporada en base a tus ventas y bonificaciones por escala.
            </p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.3)', padding: '3px', borderRadius: 'var(--radius-sm)' }}>
          <button
            className={calculationMode === 'quick' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setCalculationMode('quick')}
            style={{ fontSize: '0.78rem', padding: '6px 12px' }}
          >
            <Calculator size={14} /> Estimador Rápido
          </button>
          <button
            className={calculationMode === 'custom_plans' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setCalculationMode('custom_plans')}
            style={{ fontSize: '0.78rem', padding: '6px 12px' }}
          >
            <Plus size={14} /> Por Planes Vendidos ({soldPlans.length})
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', overflow: 'hidden' }}>
        
        {/* Left Column: Input Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {calculationMode === 'quick' ? (
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              
              {/* Sales Counter Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.86rem', fontWeight: 700 }}>
                    Cantidad de Suscripciones / Ventas del Mes:
                  </label>
                  <strong style={{ fontSize: '1.4rem', color: 'var(--accent-green)', fontWeight: 900 }}>
                    {quickSalesCount} {quickSalesCount === 1 ? 'venta' : 'ventas'}
                  </strong>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={quickSalesCount}
                  onChange={e => setQuickSalesCount(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-green)', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                  <span>1 venta</span>
                  <span>5 ventas</span>
                  <span>10 ventas</span>
                  <span>20 ventas</span>
                </div>
              </div>

              {/* Modalidad de Contratación */}
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Modalidad Comercial Promedio:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {[
                    { id: 'di_total_1', label: 'DI Total (1 Pago)', desc: 'Máxima comisión' },
                    { id: 'di_total_2', label: 'DI Financiado (2 Pagos)', desc: 'Comisión dividida' },
                    { id: 'di_parcial', label: 'DI Parcial (1 Pago)', desc: 'Suscripción reducida' },
                    { id: 'tradicional', label: 'Tradicional', desc: 'Cuota 1 directa' },
                  ].map(m => (
                    <div
                      key={m.id}
                      onClick={() => setPlanType(m.id)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        background: planType === m.id ? 'rgba(46, 196, 182, 0.15)' : 'rgba(255,255,255,0.02)',
                        border: planType === m.id ? '1px solid var(--accent-green)' : '1px solid var(--border-color)',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      <strong style={{ fontSize: '0.8rem', color: planType === m.id ? 'var(--accent-green)' : 'var(--text-main)', display: 'block' }}>
                        {m.label}
                      </strong>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>{m.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cuota Promedio Estimada */}
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Valor de Cuota Promedio de tus Planes Vendidos:
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[
                    { label: 'Moto / Económico (~$50k)', val: 50000 },
                    { label: 'Auto Promedio (~$155k)', val: 155000 },
                    { label: 'Auto / 40M (~$220k)', val: 220000 },
                    { label: 'Vivienda / Alta Gama (~$350k)', val: 350000 }
                  ].map(c => (
                    <button
                      key={c.val}
                      type="button"
                      onClick={() => setAverageQuote(c.val)}
                      className={averageQuote === c.val ? 'btn-primary' : 'btn-secondary'}
                      style={{ fontSize: '0.74rem', padding: '6px 10px' }}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            /* Modo Planes Vendidos Específicos */
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', minWidth: 0, overflow: 'hidden' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Agregar Planes Vendidos a tu Lista:
              </span>

              <div style={{ display: 'flex', gap: '8px', minWidth: 0 }}>
                <select
                  value={selectedPlanToAdd}
                  onChange={e => setSelectedPlanToAdd(e.target.value)}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    padding: '10px 12px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-main)',
                    fontSize: '0.84rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {OFFICIAL_AUTOCREDITO_PLANS.map(p => (
                    <option key={p.code} value={p.code}>
                      {p.name} ({formatMoney(p.quote1to7)}/mes)
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleAddPlan}
                  className="btn-primary"
                  style={{ padding: '0 16px', fontSize: '0.85rem' }}
                >
                  <Plus size={16} /> Sumar
                </button>
              </div>

              {/* Lista de planes sumados */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
                {soldPlans.map((plan, index) => (
                  <div
                    key={plan.id}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '10px 12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{index + 1}. {plan.planName}</strong>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Cuota: {formatMoney(plan.quote)} • Cód: {plan.planCode}
                      </p>
                    </div>

                    <button
                      onClick={() => handleRemovePlan(plan.id)}
                      className="btn-secondary"
                      style={{ padding: '6px', color: 'var(--accent-red)', borderColor: 'rgba(230, 57, 70, 0.3)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tabla de Escalas de Comisión */}
          <div className="glass-panel" style={{ padding: '16px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '10px' }}>
              📊 Escala Oficial de Bonificaciones por Producción:
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', borderRadius: '4px', background: activeCount < 3 ? 'rgba(46, 196, 182, 0.15)' : 'transparent' }}>
                <span>🥉 1 a 2 suscripciones:</span>
                <strong>Comisión Base (100%)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', borderRadius: '4px', background: activeCount >= 3 && activeCount < 6 ? 'rgba(46, 196, 182, 0.15)' : 'transparent' }}>
                <span>🥈 3 a 5 suscripciones:</span>
                <strong style={{ color: 'var(--accent-green)' }}>Comisión + 15% Bono Plata</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', borderRadius: '4px', background: activeCount >= 6 && activeCount < 9 ? 'rgba(255, 159, 28, 0.15)' : 'transparent' }}>
                <span>🥇 6 a 8 suscripciones:</span>
                <strong style={{ color: 'var(--primary)' }}>Comisión + 30% Bono Oro</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', borderRadius: '4px', background: activeCount >= 9 ? 'rgba(230, 57, 70, 0.15)' : 'transparent' }}>
                <span>💎 9+ suscripciones:</span>
                <strong style={{ color: 'var(--accent-red)' }}>Comisión + 50% Bono Diamante</strong>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Earnings Summary Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="glass-card" style={{
            padding: '24px',
            border: '2px solid var(--accent-green)',
            background: 'linear-gradient(180deg, rgba(46, 196, 182, 0.12) 0%, rgba(18, 25, 41, 0.95) 100%)',
            boxShadow: '0 0 30px rgba(46, 196, 182, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            
            {/* Tier Badge & Sales Count */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="badge badge-medium" style={{ fontSize: '0.72rem' }}>
                  Temporada en Curso
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '4px' }}>
                  Estimación de Cobro
                </h3>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Escala:</span>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                  <span>{activeTier.emoji}</span>
                  <span>{activeTier.tierName}</span>
                </div>
              </div>
            </div>

            {/* Total Estimated Earnings Main Display */}
            <div style={{ background: 'rgba(0,0,0,0.4)', padding: '20px', borderRadius: 'var(--radius-sm)', textAlign: 'center', border: '1px solid rgba(46, 196, 182, 0.3)' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Total Estimado a Cobrar:
              </span>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--accent-green)', lineHeight: 1.1, margin: '6px 0' }}>
                {formatMoney(activeTotal)}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Por {activeCount} {activeCount === 1 ? 'suscripción cerrada' : 'suscripciones cerradas'} este mes
              </span>
            </div>

            {/* Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Comisión Directa:</span>
                <strong style={{ fontSize: '1.1rem', color: 'var(--text-main)', display: 'block', marginTop: '2px' }}>
                  {formatMoney(activeBase)}
                </strong>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Bono por Escala (+{Math.round(activeTier.bonusPercent * 100)}%):
                </span>
                <strong style={{ fontSize: '1.1rem', color: 'var(--primary)', display: 'block', marginTop: '2px' }}>
                  {formatMoney(activeBonus)}
                </strong>
              </div>
            </div>

            {/* Next Tier Motivation Callout */}
            {activeTier.nextThreshold && (
              <div style={{ background: 'rgba(255, 159, 28, 0.1)', border: '1px solid rgba(255, 159, 28, 0.3)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Sparkles size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
                <div>
                  <strong style={{ fontSize: '0.82rem', color: 'var(--primary)', display: 'block' }}>
                    ¡Te faltan {activeTier.nextThreshold - activeCount} {activeTier.nextThreshold - activeCount === 1 ? 'venta' : 'ventas'} para subir de escala!
                  </strong>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Alcanzá {activeTier.nextThreshold} ventas y desbloqueá {activeTier.nextBonus} en todo tu mes.
                  </span>
                </div>
              </div>
            )}

            {/* Share Projection Button */}
            <button
              onClick={handleShareProjection}
              className="btn-primary"
              style={{ padding: '14px', fontSize: '0.9rem', gap: '8px', background: '#25D366', color: '#fff', boxShadow: '0 4px 15px rgba(37, 211, 102, 0.4)' }}
            >
              <Share2 size={16} /> Compartir Mi Proyección en WhatsApp
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}
