import React, { useRef, useEffect, useState } from 'react';
import { getCurrentUserProfile } from '../services/storageService';
import { X, Download, Share2, Sparkles, CheckCircle2, Image } from 'lucide-react';

export default function VisualCardModal({ isOpen, onClose, plan }) {
  const canvasRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const currentUser = getCurrentUserProfile();

  const formatMoney = (val) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);
  };

  useEffect(() => {
    if (isOpen && plan && canvasRef.current) {
      renderCardToCanvas();
    }
  }, [isOpen, plan]);

  const renderCardToCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = 1080;
    const height = 1350; // Proporción 4:5 ideal para Instagram y WhatsApp

    canvas.width = width;
    canvas.height = height;

    // 1. Fondo Oscuro Premium con Gradiente
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#090d16');
    bgGrad.addColorStop(0.5, '#121929');
    bgGrad.addColorStop(1, '#05080e');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Luces ambientales y resplandores
    const glow1 = ctx.createRadialGradient(200, 200, 50, 200, 200, 450);
    glow1.addColorStop(0, 'rgba(255, 159, 28, 0.25)');
    glow1.addColorStop(1, 'transparent');
    ctx.fillStyle = glow1;
    ctx.fillRect(0, 0, width, height);

    const glow2 = ctx.createRadialGradient(880, 1100, 50, 880, 1100, 450);
    glow2.addColorStop(0, 'rgba(0, 180, 216, 0.22)');
    glow2.addColorStop(1, 'transparent');
    ctx.fillStyle = glow2;
    ctx.fillRect(0, 0, width, height);

    // Marco exterior con borde de neón
    ctx.strokeStyle = 'rgba(255, 159, 28, 0.4)';
    ctx.lineWidth = 6;
    ctx.strokeRect(30, 30, width - 60, height - 60);

    // 3. Encabezado Oficial AutoCrédito
    ctx.fillStyle = '#ff9f1c';
    ctx.font = '900 42px "Outfit", sans-serif';
    ctx.fillText('AUTOCRÉDITO', 70, 110);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('PLANES DE CAPITALIZACIÓN OFICIALES', 70, 150);

    // Badge Sorteo Lotería
    ctx.fillStyle = 'rgba(46, 196, 182, 0.15)';
    ctx.strokeStyle = '#2ec4b6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(width - 430, 75, 360, 70, 35);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#2ec4b6';
    ctx.font = '800 24px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🏆 SORTEO LOTERÍA NACIONAL', width - 250, 118);
    ctx.textAlign = 'left';

    // 4. Tarjeta Principal del Plan
    const cardY = 220;
    ctx.fillStyle = 'rgba(18, 25, 41, 0.9)';
    ctx.strokeStyle = 'rgba(255, 159, 28, 0.6)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(70, cardY, width - 140, 560, 28);
    ctx.fill();
    ctx.stroke();

    // Etiqueta Categoría
    ctx.fillStyle = '#ff9f1c';
    ctx.font = '700 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText((plan.category || 'PLAN OFICIAL').toUpperCase() + ' • CÓD. ' + plan.code, 110, cardY + 70);

    // Nombre del Plan / Auto
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 54px "Outfit", sans-serif';
    ctx.fillText(plan.name, 110, cardY + 140);

    // Línea divisoria
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(110, cardY + 175);
    ctx.lineTo(width - 110, cardY + 175);
    ctx.stroke();

    // Valor Nominal
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('VALOR ADJUDICABLE / CAPITAL:', 110, cardY + 230);

    ctx.fillStyle = '#ff9f1c';
    ctx.font = '900 60px "Outfit", sans-serif';
    ctx.fillText(formatMoney(plan.nominalValue), 110, cardY + 300);

    // Bloque de Cuotas (2 columnas)
    // Columna 1: Cuota 1 a 7
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.roundRect(110, cardY + 345, 400, 165, 18);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 159, 28, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '700 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('CUOTA 1 A 7:', 135, cardY + 395);

    ctx.fillStyle = '#ff9f1c';
    ctx.font = '900 48px "Outfit", sans-serif';
    ctx.fillText(formatMoney(plan.quote1to7), 135, cardY + 455);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '500 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('/ mes (suscripción diluida)', 135, cardY + 485);

    // Columna 2: Cuota 8 en adelante
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.roundRect(570, cardY + 345, 400, 165, 18);
    ctx.fill();
    ctx.strokeStyle = 'rgba(46, 196, 182, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '700 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('CUOTA 8 EN ADELANTE:', 595, cardY + 395);

    ctx.fillStyle = '#2ec4b6';
    ctx.font = '900 48px "Outfit", sans-serif';
    ctx.fillText(formatMoney(plan.quote8onwards), 595, cardY + 455);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '500 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('/ mes (cuota reducida)', 595, cardY + 485);

    // 5. Destacado Beneficio Ganador (Banner Dorado)
    const benY = 820;
    const benGrad = ctx.createLinearGradient(70, benY, width - 70, benY);
    benGrad.addColorStop(0, 'rgba(255, 159, 28, 0.2)');
    benGrad.addColorStop(1, 'rgba(247, 127, 0, 0.25)');
    ctx.fillStyle = benGrad;
    ctx.strokeStyle = 'rgba(255, 159, 28, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(70, benY, width - 140, 190, 20);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffb703';
    ctx.font = '900 28px "Outfit", sans-serif';
    ctx.fillText('✨ BENEFICIO EXCLUSIVO AUTOCRÉDITO', 110, benY + 55);

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 25px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('¡Al salir adjudicado por sorteo, te llevás tu 0km / capital', 110, benY + 105);
    ctx.fillStyle = '#2ec4b6';
    ctx.font = '900 26px "Outfit", sans-serif';
    ctx.fillText('Y NO PAGÁS NUNCA MÁS NINGUNA CUOTA! 🚫💳', 110, benY + 145);

    // 6. Pie de Página con Datos del Asesor Oficial
    const footY = 1050;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.roundRect(70, footY, width - 140, 220, 24);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 180, 216, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();

    const advisorName = currentUser?.name || 'Asesor Oficial';
    const advisorBranch = (currentUser?.provincia ? `${currentUser.provincia} — ` : '') + (currentUser?.branch || 'Agencia Oficial AutoCrédito');
    const advisorPhone = currentUser?.phone || 'Consultar por WhatsApp';

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '600 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('ASESOR OFICIAL DE ATENCIÓN:', 110, footY + 50);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 36px "Outfit", sans-serif';
    ctx.fillText(advisorName, 110, footY + 95);

    ctx.fillStyle = '#00b4d8';
    ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('📍 ' + advisorBranch, 110, footY + 135);

    ctx.fillStyle = '#25D366';
    ctx.font = '800 26px "Outfit", sans-serif';
    ctx.fillText('📲 WhatsApp: ' + advisorPhone, 110, footY + 180);

    // Convertir a Data URL para descarga y vista previa
    setImageSrc(canvas.toDataURL('image/png'));
  };

  const handleDownload = () => {
    if (!imageSrc) return;
    const link = document.createElement('a');
    link.download = `cotizacion_autocredito_${plan.code}_${plan.name.replace(/\s+/g, '_')}.png`;
    link.href = imageSrc;
    link.click();
  };

  const handleShareWhatsApp = () => {
    if (!plan) return;
    const text = `🚗 *COTIZACIÓN OFICIAL AUTOCRÉDITO*\n` +
                 `📋 *${plan.name}* (Cód. ${plan.code})\n` +
                 `💰 *Capital Adjudicable:* ${formatMoney(plan.nominalValue)}\n` +
                 `🔹 *Cuotas 1 a 7:* ${formatMoney(plan.quote1to7)} / mes\n` +
                 `🔹 *Cuotas 8 en adelante:* ${formatMoney(plan.quote8onwards)} / mes\n\n` +
                 `🏆 *Si salís sorteado en Lotería Nacional: NO PAGÁS NINGUNA CUOTA MÁS.*\n` +
                 `👤 Asesor: ${currentUser?.name || 'Asesor Oficial'} (${currentUser?.branch || 'Agencia Oficial'})\n` +
                 `📲 Consultame para reservar tu lugar en el sorteo de este mes!`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  if (!isOpen || !plan) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1200,
      padding: '16px'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '580px', padding: '20px', position: 'relative', maxHeight: '92vh', overflowY: 'auto' }}>
        
        {/* Close button */}
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', zIndex: 2 }}
        >
          <X size={22} />
        </button>

        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ background: 'rgba(255, 159, 28, 0.2)', padding: '8px', borderRadius: '10px' }}>
            <Image size={22} color="var(--primary)" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Placa Visual para WhatsApp</h3>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              Imagen de alta definición lista para compartir o publicar en estados
            </p>
          </div>
        </div>

        {/* Hidden Canvas used to generate the image */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Live Image Preview */}
        {imageSrc && (
          <div style={{
            borderRadius: 'var(--radius-sm)',
            overflow: 'hidden',
            border: '1px solid var(--border-color)',
            marginBottom: '16px',
            background: '#090d16',
            boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
            maxHeight: '420px',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <img
              src={imageSrc}
              alt="Placa Cotización AutoCrédito"
              style={{ width: '100%', height: 'auto', objectFit: 'contain', maxHeight: '420px' }}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button
            onClick={handleDownload}
            className="btn-primary"
            style={{ padding: '12px', fontSize: '0.85rem', gap: '6px' }}
          >
            <Download size={16} /> Descargar Imagen
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="btn-primary"
            style={{ padding: '12px', fontSize: '0.85rem', gap: '6px', background: '#25D366', color: '#fff' }}
          >
            <Share2 size={16} /> Enviar a WhatsApp
          </button>
        </div>

      </div>
    </div>
  );
}
