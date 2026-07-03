/* ══════════════════════════════════
   RENDER.JS — Orquestador del canvas
   ══════════════════════════════════ */

function generarFlyer() {
  const canvas = document.getElementById('flyer-canvas');
  const ctx    = canvas.getContext('2d');
  const { w: W, h: H } = State.getCanvasSize();

  // Redimensionar canvas si cambia el formato
  if (canvas.width !== W || canvas.height !== H) {
    canvas.width  = W;
    canvas.height = H;
  }

  // Aplicar zoom al display
  canvas.style.width  = (W * State.zoom) + 'px';
  canvas.style.height = (H * State.zoom) + 'px';

  ctx.clearRect(0, 0, W, H);

  const colores = State.getColores();
  const datos   = State.getDatos();

  const d = {
    ...datos,
    colorP: colores.principal,
    colorF: colores.fondo,
    acento: colores.acento,
    // alias
    principal: colores.principal,
    fondo:     colores.fondo,
  };

  // Llamar al renderer según plantilla
  try {
    switch (State.plantilla) {
      case 'promo':          dibujarPromo(ctx, W, H, d);          break;
      case 'servicios':      dibujarServicios(ctx, W, H, d);      break;
      case 'turnos':         dibujarTurnos(ctx, W, H, d);         break;
      case 'frase':          dibujarFrase(ctx, W, H, d);          break;
      case 'nuevo-servicio': dibujarNuevoServicio(ctx, W, H, d);  break;
      case 'oferta-flash':   dibujarOfertaFlash(ctx, W, H, d);    break;
      case 'navidad':        dibujarNavidad(ctx, W, H, d);        break;
      case 'testimonio':     dibujarTestimonio(ctx, W, H, d);     break;
      case 'dia-madre':      dibujarDiaMadre(ctx, W, H, d);       break;
      case 'minimalista':    dibujarMinimalista(ctx, W, H, d);    break;
      case 'luxury':         dibujarLuxury(ctx, W, H, d);         break;
      case 'verano':         dibujarVerano(ctx, W, H, d);         break;
      default:               dibujarPromo(ctx, W, H, d);
    }
  } catch(err) {
    console.warn('Error en render:', err);
    ctx.fillStyle = d.colorF;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = d.colorP;
    ctx.font = '32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Error al renderizar', W/2, H/2);
  }

  // ── Dibujar handles del editor encima del flyer ──
  if (typeof dibujarHandles === 'function') {
    dibujarHandles(ctx);
  }

  // ── Sincronizar overlay con el canvas ──
  sincronizarOverlay();
}

function descargarFlyer() {
  generarFlyer();
  const canvas = document.getElementById('flyer-canvas');
  const link = document.createElement('a');
  const fecha = new Date().toISOString().slice(0,10);
  link.download = `flyer-${State.plantilla}-${fecha}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

// Sincronizar el overlay invisible con el tamaño display del canvas
function sincronizarOverlay() {
  const canvas  = document.getElementById('flyer-canvas');
  const overlay = document.getElementById('editor-overlay');
  if (!overlay || !canvas) return;
  overlay.style.width  = canvas.style.width  || canvas.width  + 'px';
  overlay.style.height = canvas.style.height || canvas.height + 'px';
}

// Actualizar el label del preview según formato
function actualizarPreviewLabel() {
  const labels = {
    cuadrado: 'Post cuadrado · 1080×1080 px',
    story:    'Historia · 1080×1920 px',
    banner:   'Banner · 1080×566 px',
  };
  const el = document.getElementById('preview-label');
  if (el) el.textContent = labels[State.formato] || '';
}
