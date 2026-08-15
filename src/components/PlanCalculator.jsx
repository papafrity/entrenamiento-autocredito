import React, { useState } from 'react';
import { OFFICIAL_AUTOCREDITO_PLANS, OFFICIAL_PLANS_CATEGORIES } from '../data/officialPlans';
import { Calculator, CheckCircle2, XCircle, Share2, DollarSign, Award, HelpCircle, FileText, Sparkles, Send, Download, Search } from 'lucide-react';

export default function PlanCalculator() {
  const [activeMode, setActiveMode] = useState('official'); // 'official' o 'custom'
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedPlanCode, setSelectedPlanCode] = useState('31607'); // Default: Fiat Cronos
  const [searchFilter, setSearchFilter] = useState('');

  // Estado para modo personalizado libre
  const [customCapital, setCustomCapital] = useState(43900000);
  const [customTerm, setCustomTerm] = useState(300);

  const formatMoney = (val) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 2 }).format(val);
  };

  const filteredPlans = OFFICIAL_AUTOCREDITO_PLANS.filter(p => {
    const matchesCat = selectedCategory === 'Todos' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
                          p.code.toLowerCase().includes(searchFilter.toLowerCase()) ||
                          (p.brand && p.brand.toLowerCase().includes(searchFilter.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const selectedPlan = OFFICIAL_AUTOCREDITO_PLANS.find(p => p.code === selectedPlanCode) || OFFICIAL_AUTOCREDITO_PLANS[0];

  const handleShareOfficialQuote = (plan) => {
    const text = `🚗 *COTIZACIÓN OFICIAL AUTOCRÉDITO* 🚗\n` +
                 `━━━━━━━━━━━━━━━━━━━━\n` +
                 `📋 *Plan / Vehículo:* ${plan.name}\n` +
                 `🏷️ *Categoría:* ${plan.category} (${plan.brand || 'AutoCrédito'})\n` +
                 `🔖 *Código Oficial:* ${plan.code}\n` +
                 `💰 *Valor Nominal Adjudicable:* ${formatMoney(plan.nominalValue)}\n\n` +
                 `💳 *VALORES DE CUOTAS (Plan 300):*\n` +
                 `🔹 *Cuotas 1 a 7:* ${formatMoney(plan.quote1to7)} / mes\n` +
                 `🔹 *Cuotas 8 en adelante:* ${formatMoney(plan.quote8onwards)} / mes\n\n` +
                 `📌 *Derecho de Ingreso (DI):*\n` +
                 `• DI Total: ${formatMoney(plan.diTotal)}\n` +
                 `• DI Financiado en 2 Cuotas: ${formatMoney(plan.di2Quotes)}\n\n` +
                 `🎁 *BENEFICIO EXCLUSIVO:*\n` +
                 `Participás mensualmente por Lotería de la Ciudad oficial. ¡Al salir sorteado, te llevás el 0km / capital y *NO PAGÁS NUNCA MÁS NINGUNA CUOTA!* 🏆`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Función para exportar y descargar Excel (CSV)
  const handleDownloadExcel = () => {
    const headers = 'Codigo;Categoria;Marca;Descripcion;Valor_Nominal;Suscripcion;Cuota_1_a_7;Cuota_8_adelante;DI_Total;DI_2_Cuotas;Plazo_Meses\n';
    const rows = OFFICIAL_AUTOCREDITO_PLANS.map(p => 
      `${p.code};${p.category};${p.brand || ''};${p.name};${p.nominalValue};${p.subscription};${p.quote1to7};${p.quote8onwards};${p.diTotal};${p.di2Quotes};${p.term}`
    ).join('\n');

    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `planes_autocredito_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Cálculos para modo personalizado
  const monthlyContribution = Math.round(customCapital / customTerm * 1.15);
  const bankMonthlyPayment = Math.round(customCapital / 48 * 1.85);
  const dealershipMonthlyPayment = Math.round(customCapital / 84 * 1.25);

  return (
    <div style={{ padding: '0 12px 30px 12px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      
      {/* Header */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
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
              Cotizador y Calculadora <span style={{ color: 'var(--primary)' }}>AutoCrédito Oficial</span>
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Planillas arancelarias oficiales (Plan 300 V032019) con {OFFICIAL_AUTOCREDITO_PLANS.length} planes disponibles.
            </p>
          </div>
        </div>

        {/* Mode Switcher & Download Excel Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={handleDownloadExcel}
            className="btn-secondary"
            style={{ fontSize: '0.8rem', padding: '8px 12px', gap: '6px', color: 'var(--accent-green)', borderColor: 'rgba(46, 196, 182, 0.4)' }}
            title="Descargar toda la lista de planes en formato Excel (CSV)"
          >
            <Download size={15} /> Descargar Excel
          </button>

          <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.3)', padding: '3px', borderRadius: 'var(--radius-sm)' }}>
            <button
              className={activeMode === 'official' ? 'btn-primary' : 'btn-secondary'}
              onClick={() => setActiveMode('official')}
              style={{ fontSize: '0.78rem', padding: '6px 12px' }}
            >
              <FileText size={14} /> Planes Oficiales
            </button>
            <button
              className={activeMode === 'custom' ? 'btn-primary' : 'btn-secondary'}
              onClick={() => setActiveMode('custom')}
              style={{ fontSize: '0.78rem', padding: '6px 12px' }}
            >
              <Calculator size={14} /> Comparador Libre
            </button>
          </div>
        </div>
      </div>

      {/* MODO 1: PLANES OFICIALES DE AUTOCRÉDITO */}
      {activeMode === 'official' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Controls Bar: Categories & Live Search */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            
            {/* Category Filters */}
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
              {OFFICIAL_PLANS_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    const firstOfCat = OFFICIAL_AUTOCREDITO_PLANS.find(p => cat === 'Todos' || p.category === cat);
                    if (firstOfCat) setSelectedPlanCode(firstOfCat.code);
                  }}
                  className={selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}
                  style={{ fontSize: '0.78rem', padding: '6px 12px', whiteSpace: 'nowrap' }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', minWidth: '220px', flex: '1', maxWidth: '340px' }}>
              <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Buscar por auto, marca o código..."
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-main)',
                  fontSize: '0.84rem',
                  outline: 'none'
                }}
              />
            </div>

          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            
            {/* Left: Plan Selector List */}
            <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '540px', overflowY: 'auto' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Seleccionar Plan ({filteredPlans.length} resultados):
              </span>

              {filteredPlans.map(plan => {
                const isSelected = plan.code === selectedPlanCode;
                return (
                  <div
                    key={plan.code}
                    onClick={() => setSelectedPlanCode(plan.code)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: isSelected ? 'rgba(255, 159, 28, 0.15)' : 'rgba(255,255,255,0.02)',
                      border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '0.86rem', color: isSelected ? 'var(--primary)' : 'var(--text-main)' }}>
                        {plan.name}
                      </strong>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Cód: <strong>{plan.code}</strong> • {plan.category}
                      </p>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {formatMoney(plan.quote1to7)}
                      </span>
                      <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Cuota 1 a 7</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Detailed Plan Card with WhatsApp Action */}
            <div className="glass-card" style={{
              padding: '24px',
              border: '2px solid var(--primary)',
              background: 'linear-gradient(180deg, rgba(255, 159, 28, 0.12) 0%, rgba(18, 25, 41, 0.95) 100%)',
              boxShadow: '0 0 25px rgba(255, 159, 28, 0.18)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span className="badge badge-medium" style={{ fontSize: '0.7rem' }}>
                    Plan 300 V032019 • Cód. {selectedPlan.code}
                  </span>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '4px', color: 'var(--text-main)' }}>
                    {selectedPlan.name}
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Categoría: {selectedPlan.category} ({selectedPlan.brand || 'AutoCrédito'})
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Valor Nominal:</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {formatMoney(selectedPlan.nominalValue)}
                  </div>
                </div>
              </div>

              {/* Exact Quotes Breakdown Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--primary)' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Cuotas 1 a 7 (con suscripción):
                  </span>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)', marginTop: '2px' }}>
                    {formatMoney(selectedPlan.quote1to7)}
                  </div>
                  <p style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                    Incluye 9.90% derecho de ingreso diluido
                  </p>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--accent-green)' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Cuotas 8 en adelante:
                  </span>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-green)', marginTop: '2px' }}>
                    {formatMoney(selectedPlan.quote8onwards)}
                  </div>
                  <p style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                    Cuota comercial reducida hasta el final
                  </p>
                </div>

              </div>

              {/* Derecho de Ingreso Breakdown */}
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.82rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Derecho de Ingreso Total:</span>
                  <strong style={{ display: 'block', color: 'var(--text-main)', fontSize: '0.92rem' }}>
                    {formatMoney(selectedPlan.diTotal)}
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>DI Financiado (2 cuotas):</span>
                  <strong style={{ display: 'block', color: 'var(--text-main)', fontSize: '0.92rem' }}>
                    {formatMoney(selectedPlan.di2Quotes)}
                  </strong>
                </div>
              </div>

              {/* Highlights */}
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-green)' }}>
                  <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                  <strong>Si sale sorteado en cualquier mes: NO PAGA MÁS CUOTAS.</strong>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                  <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                  Sorteo oficial con Lotería de la Ciudad ante Escribano Público.
                </li>
              </ul>

              {/* Send Quote via WhatsApp Button */}
              <button
                onClick={() => handleShareOfficialQuote(selectedPlan)}
                className="btn-primary"
                style={{ padding: '14px', fontSize: '0.92rem', gap: '8px', background: '#25D366', color: '#fff', boxShadow: '0 4px 15px rgba(37, 211, 102, 0.4)' }}
              >
                <Send size={18} /> Mandar Cotización Oficial a WhatsApp
              </button>

            </div>

          </div>

        </div>
      )}

      {/* MODO 2: COMPARADOR LIBRE CON BANCO Y CONCESIONARIA */}
      {activeMode === 'custom' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', alignItems: 'center' }}>
              <div>
                <label style={{ fontSize: '0.88rem', fontWeight: 700, display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Capital / Monto Simulado:</span>
                  <strong style={{ color: 'var(--primary)', fontSize: '1.15rem' }}>{formatMoney(customCapital)}</strong>
                </label>
                <input
                  type="range"
                  min="5000000"
                  max="150000000"
                  step="1000000"
                  value={customCapital}
                  onChange={e => setCustomCapital(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.88rem', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                  Plazo de Suscripción:
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setCustomTerm(300)}
                    className={customTerm === 300 ? 'btn-primary' : 'btn-secondary'}
                    style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}
                  >
                    300 Meses (Plan Estándar)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomTerm(120)}
                    className={customTerm === 120 ? 'btn-primary' : 'btn-secondary'}
                    style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}
                  >
                    120 Meses (10 Años)
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            
            {/* AutoCrédito Card */}
            <div className="glass-card" style={{ padding: '24px', border: '2px solid var(--primary)' }}>
              <span className="badge badge-medium" style={{ marginBottom: '8px' }}>⭐ AutoCrédito</span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>Plan Capitalización</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '14px' }}>Aporte de ahorro + Sorteo sin deuda</p>
              
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cuota estimada:</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {formatMoney(monthlyContribution)} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ mes</span>
                </div>
              </div>

              <p style={{ fontSize: '0.82rem', color: 'var(--accent-green)' }}>
                ✔ Si salís adjudicado, no pagás ninguna cuota más.
              </p>
            </div>

            {/* Dealership Plan */}
            <div className="glass-card" style={{ padding: '24px', opacity: 0.85 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Plan Concesionaria (84 meses)</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '14px' }}>Ej: Plan Rombo / Fiat Plan</p>
              
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cuota pura promedio:</span>
                <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>
                  {formatMoney(dealershipMonthlyPayment)} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ mes</span>
                </div>
              </div>

              <p style={{ fontSize: '0.82rem', color: 'var(--accent-red)' }}>
                ✖ Si adjudicas, seguís pagando todas las cuotas restantes.
              </p>
            </div>

            {/* Bank Loan */}
            <div className="glass-card" style={{ padding: '24px', opacity: 0.85 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Préstamo Bancario Prendario</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '14px' }}>48 meses con intereses bancarios</p>
              
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cuota con interés:</span>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--accent-red)' }}>
                  {formatMoney(bankMonthlyPayment)} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ mes</span>
                </div>
              </div>

              <p style={{ fontSize: '0.82rem', color: 'var(--accent-red)' }}>
                ✖ Pagás 2 o 3 veces el valor del auto en intereses.
              </p>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
