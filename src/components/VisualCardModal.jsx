import React, { useRef, useEffect, useState } from 'react';
import { getCurrentUserProfile } from '../services/storageService';
import { X, Download, Share2, Image, Smartphone } from 'lucide-react';

export default function VisualCardModal({ isOpen, onClose, plan }) {
  const canvasRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [blobCache, setBlobCache] = useState(null);
  const currentUser = getCurrentUserProfile();

  const formatMoney = (val) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);
  };

  useEffect(() => {
    if (isOpen && plan && canvasRef.current) {
      renderCardToCanvas();
    }
  }, [isOpen, plan]);

  const getThemeColor = (fallback) => {
    try {
      const v = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
      return v || fallback;
    } catch { return fallback; }
  };

  const wrapText = (ctx, text, maxWidth) => {
    const words = text.split(' ');
    const lines = [];
    let line = '';
    for (const w of words) {
      const test = line ? line + ' ' + w : w;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = w;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  };

  const truncateText = (ctx, text, maxWidth) => {
    if (ctx.measureText(text).width <= maxWidth) return text;
    let t = text;
    while (t.length > 0 && ctx.measureText(t + '…').width > maxWidth) t = t.slice(0, -1);
    return t + '…';
  };

  const renderCardToCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = 1080;
    const height = 1350;

    canvas.width = width;
    canvas.height = height;

    const primary = getThemeColor('#ff9f1c');

    const drawCard = (productImg) => {
      // Fondo
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#090d16');
      bgGrad.addColorStop(0.5, '#121929');
      bgGrad.addColorStop(1, '#05080e');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

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

      ctx.strokeStyle = 'rgba(255, 159, 28, 0.4)';
      ctx.lineWidth = 6;
      ctx.strokeRect(30, 30, width - 60, height - 60);

      // Encabezado centrado
      ctx.textAlign = 'center';
      ctx.fillStyle = primary;
      ctx.font = '900 42px "Outfit", sans-serif';
      ctx.fillText('AUTOCRÉDITO', width / 2, 90);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('PLANES DE CAPITALIZACIÓN OFICIALES', width / 2, 122);

      // Badge centrado debajo
      ctx.fillStyle = 'rgba(46, 196, 182, 0.15)';
      ctx.strokeStyle = '#2ec4b6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(width / 2 - 180, 140, 360, 44, 22);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#2ec4b6';
      ctx.font = '800 20px "Outfit", sans-serif';
      ctx.fillText('🏆 SORTEO LOTERÍA NACIONAL', width / 2, 168);
      ctx.textAlign = 'left';

      let cardY = 210;

      if (productImg) {
        const imgMaxW = width - 200;
        const imgMaxH = 220;
        const imgAspect = productImg.width / productImg.height;
        let imgW, imgH;
        if (imgAspect > imgMaxW / imgMaxH) {
          imgW = imgMaxW;
          imgH = imgMaxW / imgAspect;
        } else {
          imgH = imgMaxH;
          imgW = imgMaxH * imgAspect;
        }
        const imgX = (width - imgW) / 2;
        ctx.drawImage(productImg, imgX, cardY, imgW, imgH);
        cardY += imgH + 16;
      }

      const cardHeight = productImg ? 500 : 560;
      ctx.fillStyle = 'rgba(18, 25, 41, 0.9)';
      ctx.strokeStyle = primary + '99';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(70, cardY, width - 140, cardHeight, 28);
      ctx.fill();
      ctx.stroke();

      // Categoría centrada
      ctx.textAlign = 'center';
      ctx.fillStyle = primary;
      ctx.font = '700 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText((plan.category || 'PLAN OFICIAL').toUpperCase() + ' • CÓD. ' + plan.code, width / 2, cardY + 60);

      // Nombre plan con wrap centrado
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 48px "Outfit", sans-serif';
      const nameMaxW = width - 220;
      const nameLines = wrapText(ctx, plan.name, nameMaxW);
      const displayLines = nameLines.slice(0, 2);
      if (nameLines.length > 2) {
        displayLines[1] = truncateText(ctx, displayLines[1], nameMaxW);
      }
      displayLines.forEach((line, i) => {
        ctx.fillText(line, width / 2, cardY + 110 + i * 52);
      });

      // Línea divisoria
      const divY = cardY + (displayLines.length > 1 ? 175 : 145);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(110, divY);
      ctx.lineTo(width - 110, divY);
      ctx.stroke();

      // Valor Nominal centrado
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('VALOR ADJUDICABLE / CAPITAL:', width / 2, divY + 40);
      ctx.fillStyle = primary;
      ctx.font = '900 56px "Outfit", sans-serif';
      ctx.fillText(formatMoney(plan.nominalValue), width / 2, divY + 100);

      // Bloque cuotas
      const cuotasY = divY + 125;
      // Col 1
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.roundRect(110, cuotasY, 400, 165, 18);
      ctx.fill();
      ctx.strokeStyle = primary + '80';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '700 20px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('CUOTA 1 A 7', 310, cuotasY + 45);
      ctx.fillStyle = primary;
      ctx.font = '900 42px "Outfit", sans-serif';
      ctx.fillText(formatMoney(plan.quote1to7), 310, cuotasY + 100);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '500 16px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('por mes', 310, cuotasY + 130);

      // Col 2
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.roundRect(570, cuotasY, 400, 165, 18);
      ctx.fill();
      ctx.strokeStyle = 'rgba(46, 196, 182, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '700 20px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('CUOTA 8 EN ADELANTE', 770, cuotasY + 45);
      ctx.fillStyle = '#2ec4b6';
      ctx.font = '900 42px "Outfit", sans-serif';
      ctx.fillText(formatMoney(plan.quote8onwards), 770, cuotasY + 100);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '500 16px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('por mes', 770, cuotasY + 130);

      // Beneficio centrado
      const benY = cuotasY + 195;
      const benGrad = ctx.createLinearGradient(70, benY, width - 70, benY);
      benGrad.addColorStop(0, 'rgba(255, 159, 28, 0.2)');
      benGrad.addColorStop(1, 'rgba(247, 127, 0, 0.25)');
      ctx.fillStyle = benGrad;
      ctx.strokeStyle = 'rgba(255, 159, 28, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(70, benY, width - 140, 170, 20);
      ctx.fill();
      ctx.stroke();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffb703';
      ctx.font = '900 26px "Outfit", sans-serif';
      ctx.fillText('✨ BENEFICIO EXCLUSIVO AUTOCRÉDITO', width / 2, benY + 55);
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('¡Al salir adjudicado por sorteo,', width / 2, benY + 95);
      ctx.fillStyle = '#2ec4b6';
      ctx.font = '900 24px "Outfit", sans-serif';
      ctx.fillText('NO PAGÁS NUNCA MÁS NINGUNA CUOTA! 🚫💳', width / 2, benY + 130);

      // Footer centrado
      const footY = benY + 200;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.beginPath();
      ctx.roundRect(70, footY, width - 140, 200, 24);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 180, 216, 0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();

      const advisorName = currentUser?.name || 'Asesor Oficial';
      const advisorBranch = (currentUser?.provincia ? `${currentUser.provincia} — ` : '') + (currentUser?.branch || 'Agencia Oficial AutoCrédito');
      const advisorPhone = currentUser?.phone || 'Consultar por WhatsApp';

      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '600 18px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('ASESOR OFICIAL DE ATENCIÓN', width / 2, footY + 45);
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 32px "Outfit", sans-serif';
      ctx.fillText(truncateText(ctx, advisorName, width - 200), width / 2, footY + 85);
      ctx.fillStyle = '#00b4d8';
      ctx.font = '600 20px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(truncateText(ctx, '📍 ' + advisorBranch, width - 200), width / 2, footY + 120);
      ctx.fillStyle = '#25D366';
      ctx.font = '800 22px "Outfit", sans-serif';
      ctx.fillText('📲 WhatsApp: ' + advisorPhone, width / 2, footY + 160);

      // Generar preview + blob
      canvas.toBlob(blob => {
        if (blob) {
          setBlobCache(blob);
          setImageSrc(URL.createObjectURL(blob));
        } else {
          setImageSrc(canvas.toDataURL('image/png'));
        }
      }, 'image/png');
    };

    if (plan.image) {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => drawCard(img);
      img.onerror = () => drawCard(null);
      img.src = plan.image;
    } else {
      drawCard(null);
    }
  };

  const handleDownload = async () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const filename = `cotizacion_autocredito_${plan.code}_${plan.name.replace(/\s+/g, '_')}.png`;

    // Intentar Web Share API (mejor para iPhone)
    if (blobCache && navigator.canShare) {
      try {
        const file = new File([blobCache], filename, { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: 'Cotización AutoCrédito', text: `Cotización ${plan.name}` });
          return;
        }
      } catch (e) {
        // si el usuario cancela, no hacer fallback
        if (e.name === 'AbortError') return;
      }
    }

    // Fallback: crear blob y descargar / abrir
    const doDownload = (blob) => {
      const url = URL.createObjectURL(blob);
      const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIos) {
        // iOS no soporta download attr para blob en muchos casos -> abrir en nueva pestaña
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      } else {
        const link = document.createElement('a');
        link.download = filename;
        link.href = url;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    };

    if (blobCache) {
      doDownload(blobCache);
    } else {
      canvas.toBlob(blob => {
        if (blob) doDownload(blob);
      }, 'image/png');
    }
  };

  const isIos = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  const canShare = typeof navigator !== 'undefined' && !!navigator.canShare;

  const handleShareWhatsApp = () => {
    if (!plan) return;
    const text = `🚗 *COTIZACIÓN OFICIAL AUTOCRÉDITO*\n` +
                 `📋 *${plan.name}* (Cód. ${plan.code})\n` +
                 `💰 *Capital:* ${formatMoney(plan.nominalValue)}\n` +
                 `🔹 *Cuotas 1 a 7:* ${formatMoney(plan.quote1to7)} / mes\n` +
                 `🔹 *Cuotas 8 en adelante:* ${formatMoney(plan.quote8onwards)} / mes\n\n` +
                 `🏆 *Si salís sorteado: NO PAGÁS NINGUNA CUOTA MÁS.*\n` +
                 `👤 Asesor: ${currentUser?.name || 'Asesor Oficial'} (${currentUser?.branch || 'Agencia Oficial'})\n` +
                 `📲 Consultame para reservar tu lugar!`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
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
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', zIndex: 2 }}><X size={22} /></button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ background: 'rgba(255, 159, 28, 0.2)', padding: '8px', borderRadius: '10px' }}><Image size={22} color="var(--primary)" /></div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Placa Visual para WhatsApp</h3>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Imagen centrada, lista para compartir</p>
          </div>
        </div>

        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {imageSrc && (
          <div style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-color)', marginBottom: '16px', background: '#090d16', boxShadow: '0 8px 30px rgba(0,0,0,0.5)', maxHeight: '420px', display: 'flex', justifyContent: 'center' }}>
            <img src={imageSrc} alt="Placa" style={{ width: '100%', height: 'auto', objectFit: 'contain', maxHeight: '420px' }} />
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button onClick={handleDownload} className="btn-primary" style={{ padding: '12px', fontSize: '0.85rem', gap: '6px' }}>
            {isIos && canShare ? <Smartphone size={16} /> : <Download size={16} />} {isIos && canShare ? 'Compartir' : isIos ? 'Abrir imagen' : 'Descargar Imagen'}
          </button>
          <button onClick={handleShareWhatsApp} className="btn-primary" style={{ padding: '12px', fontSize: '0.85rem', gap: '6px', background: '#25D366', color: '#fff' }}>
            <Share2 size={16} /> Enviar a WhatsApp
          </button>
        </div>
        {isIos && <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textAlign: 'center', marginTop: '8px' }}>En iPhone: mantené presionada la imagen → Guardar en Fotos</p>}
      </div>
    </div>
  );
}
