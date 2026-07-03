/* ══════════════════════════════════
   IA-FONDO.JS — Generador de fondos ARTÍSTICOS (canvas generativo)
   
   NOTA: Este módulo genera fondos con algoritmos canvas (gradientes,
   patrones, partículas, etc.). NO usa inteligencia artificial.
   Para IA real ver js/ia-real.js
   ══════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  const btnGenerar  = document.getElementById('btn-generar-fondo');
  const btnQuitar   = document.getElementById('btn-quitar-ia');
  const promptInput = document.getElementById('ia-prompt');
  const estiloSel   = document.getElementById('ia-estilo');
  const intensidad  = document.getElementById('ia-intensidad');

  btnGenerar?.addEventListener('click', () => {
    if (!State.canUse('fondoIA')) {
      abrirModalPlanes();
      return;
    }
    generarFondoIA();
  });

  btnQuitar?.addEventListener('click', () => {
    State.fondoIA = null;
    State.fondoActivo = 'color';
    btnQuitar.style.display = 'none';
    generarFlyer();
  });
});

function generarFondoIA() {
  const btnGenerar = document.getElementById('btn-generar-fondo');
  const btnQuitar  = document.getElementById('btn-quitar-ia');
  const estilo     = document.getElementById('ia-estilo')?.value || 'degradado';
  const intensidad = parseInt(document.getElementById('ia-intensidad')?.value || '6');
  const prompt     = document.getElementById('ia-prompt')?.value || '';

  // Feedback visual
  if (btnGenerar) {
    btnGenerar.disabled = true;
    btnGenerar.textContent = '✦ Generando...';
  }

  // Canvas offscreen 1080x1080
  const { w: W, h: H } = State.getCanvasSize();
  const oc  = document.createElement('canvas');
  oc.width  = W;
  oc.height = H;
  const octx = oc.getContext('2d');

  const colorP = document.getElementById('color-principal')?.value || '#C4748A';
  const colorF = document.getElementById('color-fondo')?.value     || '#1A1018';
  const colorA = document.getElementById('color-acento')?.value    || '#D4A853';

  // Usar requestAnimationFrame para no bloquear UI
  requestAnimationFrame(() => {
    try {
      switch (estilo) {
        case 'acuarela':   iaAcuarela(octx, W, H, colorP, colorF, colorA, intensidad);   break;
        case 'geometrico': iaGeometrico(octx, W, H, colorP, colorF, colorA, intensidad); break;
        case 'flores':     iaFlores(octx, W, H, colorP, colorF, colorA, intensidad);     break;
        case 'abstracto':  iaAbstracto(octx, W, H, colorP, colorF, colorA, intensidad);  break;
        case 'degradado':  iaDegradado(octx, W, H, colorP, colorF, colorA, intensidad);  break;
        case 'particles':  iaParticles(octx, W, H, colorP, colorF, colorA, intensidad);  break;
        case 'ondas':      iaOndas(octx, W, H, colorP, colorF, colorA, intensidad);      break;
        case 'marmol':     iaMarmol(octx, W, H, colorP, colorF, colorA, intensidad);     break;
        default:           iaDegradado(octx, W, H, colorP, colorF, colorA, intensidad);
      }
    } catch(e) {
      console.warn('IA fondo error:', e);
    }

    State.fondoIA = oc;
    State.fondoActivo = 'ia';
    if (btnGenerar) {
      btnGenerar.disabled = false;
      btnGenerar.textContent = '✦ Generar fondo';
    }
    if (btnQuitar) btnQuitar.style.display = '';
    generarFlyer();
  });
}

// ── Algoritmos generativos ──

function iaAcuarela(ctx, W, H, c1, c2, c3, intens) {
  ctx.fillStyle = c2;
  ctx.fillRect(0, 0, W, H);

  // Manchas difusas superpuestas
  for (let i = 0; i < 12 * (intens/5); i++) {
    const x  = Math.random() * W;
    const y  = Math.random() * H;
    const rx = 100 + Math.random() * 300;
    const ry = 80  + Math.random() * 250;
    const col = i % 3 === 0 ? c1 : i % 3 === 1 ? c3 : lighten(c1, 60);
    const grad = ctx.createRadialGradient(x, y, 0, x, y, rx);
    grad.addColorStop(0, hexToRgba(col, .35 * (intens/10)));
    grad.addColorStop(.6, hexToRgba(col, .18 * (intens/10)));
    grad.addColorStop(1,  'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, Math.random()*Math.PI, 0, Math.PI*2);
    ctx.fill();
  }

  // Textura de papel
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    ctx.fillStyle = `rgba(255,255,255,${Math.random()*.04})`;
    ctx.fillRect(x, y, 1, 1);
  }
}

function iaGeometrico(ctx, W, H, c1, c2, c3, intens) {
  ctx.fillStyle = c2;
  ctx.fillRect(0, 0, W, H);

  const n = Math.floor(8 * (intens/5));
  for (let i = 0; i < n; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const s = 60 + Math.random() * 200;
    const sides = [3,4,6][Math.floor(Math.random()*3)];
    const col = i % 2 === 0 ? c1 : c3;
    const alpha = .15 + Math.random() * .25;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.random() * Math.PI*2);
    ctx.strokeStyle = hexToRgba(col, alpha);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let k = 0; k < sides; k++) {
      const ang = (k/sides)*Math.PI*2;
      k === 0 ? ctx.moveTo(Math.cos(ang)*s, Math.sin(ang)*s)
              : ctx.lineTo(Math.cos(ang)*s, Math.sin(ang)*s);
    }
    ctx.closePath();
    ctx.stroke();

    // Interior
    ctx.fillStyle = hexToRgba(col, alpha*.4);
    ctx.fill();
    ctx.restore();
  }
}

function iaFlores(ctx, W, H, c1, c2, c3, intens) {
  ctx.fillStyle = c2;
  ctx.fillRect(0, 0, W, H);

  // Pétalos radiales
  const nFlores = Math.floor(6 * (intens/5));
  for (let f = 0; f < nFlores; f++) {
    const cx = Math.random() * W;
    const cy = Math.random() * H;
    const size = 60 + Math.random() * 180;
    const petals = 5 + Math.floor(Math.random()*4);
    const col = f % 2 === 0 ? c1 : c3;

    for (let p = 0; p < petals; p++) {
      const ang = (p/petals)*Math.PI*2;
      const px  = cx + Math.cos(ang)*size*.55;
      const py  = cy + Math.sin(ang)*size*.55;
      ctx.fillStyle = hexToRgba(col, .25);
      ctx.beginPath();
      ctx.ellipse(px, py, size*.42, size*.24, ang, 0, Math.PI*2);
      ctx.fill();
    }

    // Centro
    ctx.fillStyle = hexToRgba(c3, .5);
    ctx.beginPath();
    ctx.arc(cx, cy, size*.15, 0, Math.PI*2);
    ctx.fill();
  }
}

function iaAbstracto(ctx, W, H, c1, c2, c3, intens) {
  ctx.fillStyle = c2;
  ctx.fillRect(0, 0, W, H);

  const n = Math.floor(20 * (intens/5));
  for (let i = 0; i < n; i++) {
    ctx.save();
    ctx.translate(Math.random()*W, Math.random()*H);
    ctx.rotate(Math.random()*Math.PI*2);
    const col = [c1,c3,lighten(c1,40)][i%3];
    const grad = ctx.createLinearGradient(-100,0,100,0);
    grad.addColorStop(0, hexToRgba(col, .3));
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(-80, -15, 160+Math.random()*200, 8+Math.random()*30);
    ctx.restore();
  }

  // Manchas circulares
  for (let i = 0; i < 8; i++) {
    const r = 50 + Math.random()*200;
    const g = ctx.createRadialGradient(Math.random()*W, Math.random()*H, 0, Math.random()*W, Math.random()*H, r);
    g.addColorStop(0, hexToRgba(i%2===0?c1:c3, .2));
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,W,H);
  }
}

function iaDegradado(ctx, W, H, c1, c2, c3, intens) {
  // Multi-stop gradient premium
  const type = Math.floor(Math.random()*3);
  let grad;

  if (type === 0) {
    grad = ctx.createLinearGradient(0, 0, W, H);
  } else if (type === 1) {
    grad = ctx.createLinearGradient(0, H, W, 0);
  } else {
    grad = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W*.8);
  }

  grad.addColorStop(0,   c2);
  grad.addColorStop(.3,  darken(c1, 20));
  grad.addColorStop(.65, c1);
  grad.addColorStop(1,   c3);

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Brillo central
  const gBrillo = ctx.createRadialGradient(W*.35, H*.3, 0, W*.35, H*.3, W*.5);
  gBrillo.addColorStop(0, hexToRgba('#FFFFFF', .12));
  gBrillo.addColorStop(1, 'transparent');
  ctx.fillStyle = gBrillo;
  ctx.fillRect(0,0,W,H);
}

function iaParticles(ctx, W, H, c1, c2, c3, intens) {
  ctx.fillStyle = c2;
  ctx.fillRect(0, 0, W, H);

  const n = Math.floor(120 * (intens/5));
  for (let i = 0; i < n; i++) {
    const x    = Math.random() * W;
    const y    = Math.random() * H;
    const r    = 2 + Math.random() * 12;
    const col  = i % 3 === 0 ? c1 : i % 3 === 1 ? c3 : '#FFFFFF';
    const alpha= .1 + Math.random() * .5;
    ctx.fillStyle = hexToRgba(col, alpha);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI*2);
    ctx.fill();

    // Halo bokeh
    if (r > 7) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r*2.5);
      g.addColorStop(0, hexToRgba(col, .15));
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r*2.5, 0, Math.PI*2);
      ctx.fill();
    }
  }
}

function iaOndas(ctx, W, H, c1, c2, c3, intens) {
  ctx.fillStyle = c2;
  ctx.fillRect(0, 0, W, H);

  const waves = Math.floor(6 * (intens/5));
  for (let w = 0; w < waves; w++) {
    const amp   = 40 + Math.random() * 120;
    const freq  = 1 + Math.random() * 3;
    const yOff  = (H/(waves+1)) * (w+1);
    const col   = w % 2 === 0 ? c1 : c3;
    const alpha = .12 + Math.random() * .2;

    ctx.fillStyle = hexToRgba(col, alpha);
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 4) {
      const y = yOff + Math.sin((x/W)*Math.PI*2*freq + w) * amp;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fill();
  }
}

function iaMarmol(ctx, W, H, c1, c2, c3, intens) {
  ctx.fillStyle = lighten(c2, 20);
  ctx.fillRect(0, 0, W, H);

  // Venas de mármol
  const venas = Math.floor(8 * (intens/5));
  for (let v = 0; v < venas; v++) {
    const startX = Math.random() * W;
    const startY = Math.random() * H;
    const col    = v % 3 === 0 ? c3 : v % 3 === 1 ? c1 : lighten(c2, 60);

    ctx.strokeStyle = hexToRgba(col, .25 + Math.random()*.3);
    ctx.lineWidth = 1 + Math.random() * 3;
    ctx.beginPath();
    ctx.moveTo(startX, startY);

    let cx = startX, cy = startY;
    for (let s = 0; s < 20; s++) {
      const ang = (Math.random()-.5)*Math.PI*.6;
      const len = 40 + Math.random()*100;
      cx += Math.cos(ang)*len;
      cy += Math.sin(ang)*len;
      ctx.lineTo(cx, cy);
    }
    ctx.stroke();
  }

  // Overlay semi-translúcido
  const g = ctx.createLinearGradient(0,0,W,H);
  g.addColorStop(0, hexToRgba('#FFFFFF', .04));
  g.addColorStop(.5, 'transparent');
  g.addColorStop(1, hexToRgba(c1, .08));
  ctx.fillStyle = g;
  ctx.fillRect(0,0,W,H);
}
