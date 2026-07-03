/* ══════════════════════════════════
   CANVAS-HELPERS.JS — Utilidades canvas
   ══════════════════════════════════ */

// ── Color utils ──
function hexToRgb(hex) {
  let clean = String(hex).replace('#','');
  // Expandir hex corto de 3 dígitos (#FFF -> #FFFFFF)
  if (clean.length === 3) clean = clean.split('').map(c => c + c).join('');
  const r = parseInt(clean.slice(0,2), 16);
  const g = parseInt(clean.slice(2,4), 16);
  const b = parseInt(clean.slice(4,6), 16);
  return { r, g, b };
}

function hexToRgba(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

function lighten(hex, amount) {
  const { r, g, b } = hexToRgb(hex);
  const toHex = v => Math.min(255, v + amount).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function darken(hex, amount) {
  const { r, g, b } = hexToRgb(hex);
  const toHex = v => Math.max(0, v - amount).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function isLight(hex) {
  const { r, g, b } = hexToRgb(hex);
  return (r * 0.299 + g * 0.587 + b * 0.114) > 186;
}

function contrasteTexto(fondoHex) {
  return isLight(fondoHex) ? '#1A1018' : '#FFFFFF';
}

// ── Texto ──
function wrapText(ctx, text, x, y, maxWidth, lineHeight, align = 'center') {
  const words = text.split(' ');
  let line = '';
  const lines = [];
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
  lines.forEach((l, i) => {
    const drawX = align === 'left' ? x : align === 'right' ? x : x;
    ctx.fillText(l, drawX, y + i * lineHeight);
  });
  return lines.length;
}

function textShadow(ctx, text, x, y, color = 'rgba(0,0,0,.4)', blur = 8) {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
  ctx.fillText(text, x, y);
  ctx.restore();
}

// ── Formas ──
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function circulo(ctx, cx, cy, r) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
}

// ── Logo en canvas ──
function dibujarLogo(ctx, img, cx, cy, size, forma = 'circulo') {
  ctx.save();
  if (forma === 'circulo') {
    ctx.beginPath();
    ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
    ctx.clip();
  } else if (forma === 'cuadrado') {
    roundRect(ctx, cx - size/2, cy - size/2, size, size, 12);
    ctx.clip();
  }
  ctx.drawImage(img, cx - size/2, cy - size/2, size, size);
  ctx.restore();
}

// ── Footer común ──
function dibujarFooter(ctx, W, H, d, fuenteBody = 'DM Sans') {
  const { tel, ig, dir } = d;
  const colorP = d.colorP || d.principal;
  const textColor = '#FFFFFF';

  // Fondo footer
  const gradFooter = ctx.createLinearGradient(0, H-110, 0, H);
  gradFooter.addColorStop(0, colorP + 'DD');
  gradFooter.addColorStop(1, colorP);
  ctx.fillStyle = gradFooter;
  ctx.fillRect(0, H - 100, W, 100);

  // Línea separadora
  ctx.strokeStyle = 'rgba(255,255,255,.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, H - 100);
  ctx.lineTo(W - 60, H - 100);
  ctx.stroke();

  ctx.fillStyle = textColor;
  ctx.font = `500 26px '${fuenteBody}', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const partes = [];
  if (tel) partes.push(`📞 ${tel}`);
  if (ig)  partes.push(ig);
  if (dir) partes.push(`📍 ${dir}`);

  if (partes.length > 0) {
    ctx.fillText(partes.join('   ·   '), W/2, H - 50);
  }
  ctx.textBaseline = 'alphabetic';
}

// ── Fondo base (color, imagen, IA) ──
function dibujarFondoBase(ctx, W, H) {
  const colorF = document.getElementById('color-fondo')?.value || '#1A1018';

  if (State.fondoActivo === 'imagen' && State.fondoImg) {
    // Imagen de fondo
    const opacidad = (document.getElementById('fondo-opacidad')?.value || 60) / 100;
    ctx.fillStyle = colorF;
    ctx.fillRect(0, 0, W, H);

    // Fit cover
    const imgW = State.fondoImg.naturalWidth || State.fondoImg.width;
    const imgH = State.fondoImg.naturalHeight || State.fondoImg.height;
    const scale = Math.max(W/imgW, H/imgH);
    const dw = imgW * scale, dh = imgH * scale;
    const dx = (W - dw)/2, dy = (H - dh)/2;

    ctx.save();
    ctx.globalAlpha = opacidad;
    ctx.drawImage(State.fondoImg, dx, dy, dw, dh);
    ctx.restore();

  } else if (State.fondoActivo === 'ia' && State.fondoIA) {
    // Fondo IA (canvas offscreen)
    ctx.drawImage(State.fondoIA, 0, 0, W, H);
  } else {
    // Color plano
    ctx.fillStyle = colorF;
    ctx.fillRect(0, 0, W, H);
  }
}

// ══════════════════════════════════
// SISTEMA DE ELEMENTOS POSICIONABLES
// ══════════════════════════════════

/**
 * ctxConTransform — aplica translate + rotate + scale al ctx
 * y ejecuta fn(ctx) en ese espacio transformado.
 * Si el elemento no existe en ElementosState se usa la posición por defecto.
 */
function ctxConTransform(ctx, elementoId, defaultX, defaultY, fn) {
  const el = (typeof ElementosState !== 'undefined')
    ? ElementosState.getById(elementoId)
    : null;

  const x   = el ? el.x        : defaultX;
  const y   = el ? el.y        : defaultY;
  const sc  = el ? el.escala   : 1;
  const rot = el ? el.rotacion : 0;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(sc, sc);
  fn(ctx, x, y);
  ctx.restore();
}

/**
 * getPosEl — devuelve {x, y, escala, rotacion} de un elemento
 * con fallback a los valores por defecto dados.
 */
function getPosEl(id, defX, defY) {
  const el = (typeof ElementosState !== 'undefined')
    ? ElementosState.getById(id)
    : null;
  return {
    x:        el ? el.x        : defX,
    y:        el ? el.y        : defY,
    escala:   el ? el.escala   : 1,
    rotacion: el ? el.rotacion : 0,
  };
}

// ══════════════════════════════════════════════════
//  FONDO DE ELEMENTO
//  Dibuja el fondo/marco detrás de un bloque de texto.
//  Se llama DENTRO del save/translate/scale del elemento,
//  centrado en (0,0), antes de dibujar el texto.
//
//  fondo = {
//    tipo:       'ninguno' | 'solido' | 'semitransparente' | 'degradado'
//                | 'marco' | 'pill' | 'sombra-texto' | 'neón'
//    color:      '#HEX'        — color del fondo o marco
//    opacidad:   0-1           — transparencia
//    radio:      0-50          — redondez de esquinas (px canvas)
//    padding:    { h, v }      — espacio extra alrededor del texto
//    grosorMarco: 1-20         — solo para 'marco'
//    colorSombra: '#HEX'       — solo para 'sombra-texto' y 'neón'
//    difusion:   0-60          — blur de sombra/neón
//    colorDeg2:  '#HEX'        — segundo color para 'degradado'
//    anguloDeg:  0-360         — ángulo del degradado
//  }
//
//  anchoTexto, altoTexto — dimensiones del texto medido (px canvas, sin escala)
// ══════════════════════════════════════════════════

function dibujarFondoElemento(ctx, fondo, anchoTexto, altoTexto) {
  if (!fondo || fondo.tipo === 'ninguno') return;

  const ph = (fondo.padding?.h ?? 24);
  const pv = (fondo.padding?.v ?? 14);
  const w  = anchoTexto + ph * 2;
  const h  = altoTexto  + pv * 2;
  const x  = -w / 2;
  const y  = -h / 2;
  const r  = Math.min(fondo.radio ?? 10, h / 2);
  const op = fondo.opacidad ?? 1;
  const col= fondo.color || '#000000';

  ctx.save();
  // Resetear sombras heredadas del contexto padre para que no contaminen el fondo
  ctx.shadowColor   = 'transparent';
  ctx.shadowBlur    = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  switch (fondo.tipo) {

    case 'solido': {
      roundRect(ctx, x, y, w, h, r);
      ctx.fillStyle = hexToRgba(col, op);
      ctx.fill();
      break;
    }

    case 'semitransparente': {
      roundRect(ctx, x, y, w, h, r);
      ctx.fillStyle = hexToRgba(col, op * 0.6);
      ctx.fill();
      // Borde sutil
      ctx.strokeStyle = hexToRgba('#FFFFFF', 0.15);
      ctx.lineWidth = 1;
      ctx.stroke();
      break;
    }

    case 'degradado': {
      const col2 = fondo.colorDeg2 || lighten(col, 60);
      const ang  = ((fondo.anguloDeg ?? 135) * Math.PI) / 180;

      // Canvas offscreen del tamaño exacto del fondo — sin transformaciones
      const oc  = document.createElement('canvas');
      oc.width  = Math.max(1, Math.ceil(w));
      oc.height = Math.max(1, Math.ceil(h));
      const oc2 = oc.getContext('2d');

      // Degradado en coordenadas locales del offscreen (0,0 = esquina superior izquierda)
      const gx1 = w/2 + Math.cos(ang + Math.PI) * (w/2);
      const gy1 = h/2 + Math.sin(ang + Math.PI) * (h/2);
      const gx2 = w/2 + Math.cos(ang) * (w/2);
      const gy2 = h/2 + Math.sin(ang) * (h/2);
      const grad = oc2.createLinearGradient(gx1, gy1, gx2, gy2);
      grad.addColorStop(0, hexToRgba(col, op));
      grad.addColorStop(1, hexToRgba(col2, op));
      oc2.fillStyle = grad;
      oc2.fillRect(0, 0, oc.width, oc.height);

      // Dibujar el offscreen en el canvas principal con clip a la forma redondeada
      roundRect(ctx, x, y, w, h, r);
      ctx.clip();
      ctx.drawImage(oc, x, y, w, h);
      break;
    }

    case 'marco': {
      roundRect(ctx, x, y, w, h, r);
      ctx.strokeStyle = hexToRgba(col, op);
      ctx.lineWidth   = fondo.grosorMarco ?? 4;
      ctx.stroke();
      break;
    }

    case 'marco-doble': {
      const g = fondo.grosorMarco ?? 3;
      const sep = 6;
      roundRect(ctx, x, y, w, h, r);
      ctx.strokeStyle = hexToRgba(col, op);
      ctx.lineWidth = g; ctx.stroke();
      roundRect(ctx, x - sep, y - sep, w + sep*2, h + sep*2, r + sep);
      ctx.strokeStyle = hexToRgba(col, op * 0.5);
      ctx.lineWidth = 1; ctx.stroke();
      break;
    }

    case 'pill': {
      const pillR = h / 2;
      roundRect(ctx, x, y, w, h, pillR);
      ctx.fillStyle = hexToRgba(col, op);
      ctx.fill();
      break;
    }

    case 'pill-borde': {
      const pillR = h / 2;
      roundRect(ctx, x, y, w, h, pillR);
      ctx.strokeStyle = hexToRgba(col, op);
      ctx.lineWidth   = fondo.grosorMarco ?? 3;
      ctx.stroke();
      break;
    }

    case 'sombra-texto': {
      ctx.shadowColor   = hexToRgba(fondo.colorSombra || '#000000', op);
      ctx.shadowBlur    = fondo.difusion ?? 20;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      // No dibuja caja, la sombra se aplica al texto que viene después
      // Solo seteamos la sombra en ctx, el restore del caller la limpia
      ctx.restore();
      return;   // salir sin restore doble
    }

    case 'neon': {
      ctx.shadowColor = hexToRgba(fondo.colorSombra || col, 1);
      ctx.shadowBlur  = fondo.difusion ?? 30;
      ctx.restore();
      return;
    }

    case 'subrayado': {
      const lineY = h/2 - 4;
      ctx.strokeStyle = hexToRgba(col, op);
      ctx.lineWidth   = fondo.grosorMarco ?? 4;
      ctx.beginPath();
      ctx.moveTo(x + 8, lineY);
      ctx.lineTo(x + w - 8, lineY);
      ctx.stroke();
      break;
    }

    case 'subrayado-doble': {
      const ly = h/2 - 4;
      ctx.strokeStyle = hexToRgba(col, op);
      ctx.lineWidth = fondo.grosorMarco ?? 3;
      ctx.beginPath(); ctx.moveTo(x+8, ly);   ctx.lineTo(x+w-8, ly);   ctx.stroke();
      ctx.strokeStyle = hexToRgba(col, op * 0.4);
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x+8, ly+6); ctx.lineTo(x+w-8, ly+6); ctx.stroke();
      break;
    }

    case 'tachado': {
      ctx.strokeStyle = hexToRgba(col, op);
      ctx.lineWidth   = fondo.grosorMarco ?? 3;
      ctx.beginPath();
      ctx.moveTo(x + 8, 0); ctx.lineTo(x + w - 8, 0);
      ctx.stroke();
      break;
    }
  }

  ctx.restore();
}

// ── Mide el texto de un elemento para calcular el tamaño del fondo ──
function medirBloque(ctx, lineas, font, lineHeight) {
  ctx.save();
  ctx.font = font;
  const maxW = Math.max(...lineas.map(l => ctx.measureText(l).width));
  const h    = lineas.length * lineHeight;
  ctx.restore();
  return { w: maxW, h };
}

/**
 * dibujarBloque — helper universal para texto + fondo de elemento.
 *
 * Uso en cualquier plantilla:
 *   dibujarBloque(ctx, 'negocio', defX, defY, (ctx, medir) => {
 *     ctx.font = '...';
 *     ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
 *     const w = ctx.measureText(texto).width, h = 50;
 *     if (!medir) { ctx.fillStyle = color; ctx.fillText(texto, 0, 0); }
 *     return { w, h };
 *   });
 *
 * La función drawFn se llama dos veces:
 *   1. con medir=true  → solo retorna {w,h}, no dibuja
 *   2. con medir=false → dibuja, ignora el retorno
 */
function dibujarBloque(ctx, elId, defX, defY, drawFn) {
  const pos = getPosEl(elId, defX, defY);
  ctx.save();
  ctx.translate(pos.x, pos.y);
  ctx.rotate(pos.rotacion);
  ctx.scale(pos.escala, pos.escala);
  // Limpiar cualquier sombra heredada del contexto exterior
  ctx.shadowColor   = 'transparent';
  ctx.shadowBlur    = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // Medir primero (sin dibujar)
  const { w, h } = drawFn(ctx, true) || { w: 200, h: 60 };

  // Dibujar fondo/marco
  if (typeof ElementosState !== 'undefined') {
    dibujarFondoElemento(ctx, ElementosState.getFondo(elId), w, h);
  }

  // Dibujar contenido (también con sombra limpia para que el fondo no interfiera)
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur  = 0;
  drawFn(ctx, false);

  ctx.restore();
}

// ── Fuente activa ──
function getFuente() {
  const mapeo = {
    'playfair':   { titulo: 'Playfair Display', body: 'DM Sans' },
    'montserrat': { titulo: 'Montserrat',        body: 'Montserrat' },
    'cormorant':  { titulo: 'Cormorant Garamond', body: 'DM Sans' },
    'raleway':    { titulo: 'Raleway',            body: 'Raleway' },
    'lato':       { titulo: 'Lato',               body: 'Lato' },
    'dm-sans':    { titulo: 'DM Sans',            body: 'DM Sans' },
  };
  return mapeo[State.fuente] || mapeo['playfair'];
}
