/* ══════════════════════════════════
   EDITOR.JS — Motor drag / escala / rotación sobre canvas

   Arquitectura:
   - El canvas tiene una capa de interacción encima (div transparente)
   - Cuando modoEditor=true se capturan eventos de mouse/touch
   - Al hacer click se detecta qué elemento fue tocado (hit-test)
   - Drag mueve, handle de escala escala, handle de rotación rota
   ══════════════════════════════════ */

// ── Constantes de handle ──
const HANDLE_RADIO   = 10;   // radio de los handles en px del canvas
const HANDLE_ESCALA  = 'escala';
const HANDLE_ROTAR   = 'rotar';

// ── Estado interno del editor ──
const EditorState = {
  activo:    false,
  drag:      null,   // { tipo: 'mover'|'escala'|'rotar', elementoId, startX, startY, origX, origY, origEscala, origRot, cx, cy }
};

// ── Tamaño de los "hit boxes" de cada tipo de elemento ──
// Estos son los tamaños de referencia a escala=1 (coordenadas del canvas 1080px).
// Se multiplican por el escala del elemento en el hit-test.
const HITBOX = {
  logo:       { w: 160,  h: 160  },
  texto:      { w: 700,  h: 90   },
  badge:      { w: 380,  h: 120  },
  footer:     { w: 1080, h: 110  },
  decoracion: { w: 100,  h: 100  },
};

// ═══════════════════════════════════
//  INICIALIZAR
// ═══════════════════════════════════
function initEditor() {
  const canvas  = document.getElementById('flyer-canvas');
  const overlay = document.getElementById('editor-overlay');
  if (!overlay) return;

  // Mouse
  overlay.addEventListener('mousedown',  onPointerDown);
  overlay.addEventListener('mousemove',  onPointerMove);
  overlay.addEventListener('mouseup',    onPointerUp);
  overlay.addEventListener('mouseleave', onPointerUp);

  // Touch
  overlay.addEventListener('touchstart',  e => onPointerDown(normTouch(e)), { passive: false });
  overlay.addEventListener('touchmove',   e => { e.preventDefault(); onPointerMove(normTouch(e)); }, { passive: false });
  overlay.addEventListener('touchend',    e => onPointerUp(normTouch(e)));
}

// ═══════════════════════════════════
//  CONVERSIÓN COORDENADAS
//  canvas display → canvas real (1080px)
// ═══════════════════════════════════
function clientToCanvas(clientX, clientY) {
  const canvas  = document.getElementById('flyer-canvas');
  const rect    = canvas.getBoundingClientRect();
  const scaleX  = canvas.width  / rect.width;
  const scaleY  = canvas.height / rect.height;
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top)  * scaleY,
  };
}

function normTouch(e) {
  const t = e.touches[0] || e.changedTouches[0];
  return { clientX: t.clientX, clientY: t.clientY, preventDefault: () => e.preventDefault() };
}

// ═══════════════════════════════════
//  HIT TEST
// ═══════════════════════════════════
function hitTestElemento(cx, cy, el) {
  const hb  = HITBOX[el.tipo] || { w: 200, h: 80 };
  const hw  = (hb.w * el.escala) / 2;
  const hh  = (hb.h * el.escala) / 2;

  // Transformar el punto al espacio local del elemento (con rotación)
  const dx  = cx - el.x;
  const dy  = cy - el.y;
  const cos = Math.cos(-el.rotacion);
  const sin = Math.sin(-el.rotacion);
  const lx  = dx * cos - dy * sin;
  const ly  = dx * sin + dy * cos;

  return Math.abs(lx) <= hw && Math.abs(ly) <= hh;
}

function hitTestHandle(cx, cy, el, handle) {
  const pos = getHandlePos(el, handle);
  const d   = Math.hypot(cx - pos.x, cy - pos.y);
  return d <= HANDLE_RADIO * 2.5;
}

function getHandlePos(el, handle) {
  const hb  = HITBOX[el.tipo] || { w: 200, h: 80 };
  const hw  = (hb.w * el.escala) / 2;
  const hh  = (hb.h * el.escala) / 2;

  if (handle === HANDLE_ESCALA) {
    // Esquina inferior derecha
    return rotarPunto(el.x + hw, el.y + hh, el.x, el.y, el.rotacion);
  }
  if (handle === HANDLE_ROTAR) {
    // Encima del centro
    return rotarPunto(el.x, el.y - hh - 36, el.x, el.y, el.rotacion);
  }
  return { x: el.x, y: el.y };
}

function rotarPunto(px, py, cx, cy, ang) {
  const dx  = px - cx;
  const dy  = py - cy;
  const cos = Math.cos(ang);
  const sin = Math.sin(ang);
  return {
    x: cx + dx * cos - dy * sin,
    y: cy + dx * sin + dy * cos,
  };
}

// ═══════════════════════════════════
//  EVENTOS POINTER
// ═══════════════════════════════════
function onPointerDown(e) {
  if (!ElementosState.modoEditor) return;
  e.preventDefault?.();

  const { x, y } = clientToCanvas(e.clientX, e.clientY);
  const selId     = ElementosState.seleccionado;
  const selEl     = selId ? ElementosState.getById(selId) : null;

  // 1. Verificar handles del elemento seleccionado primero
  if (selEl) {
    if (hitTestHandle(x, y, selEl, HANDLE_ROTAR)) {
      EditorState.drag = {
        tipo:       'rotar',
        elementoId: selEl.id,
        cx:         selEl.x,
        cy:         selEl.y,
        origRot:    selEl.rotacion,
        startAngle: Math.atan2(y - selEl.y, x - selEl.x),
      };
      return;
    }
    if (hitTestHandle(x, y, selEl, HANDLE_ESCALA)) {
      const hb = HITBOX[selEl.tipo] || { w: 200, h: 80 };
      EditorState.drag = {
        tipo:       'escala',
        elementoId: selEl.id,
        cx:         selEl.x,
        cy:         selEl.y,
        origEscala: selEl.escala,
        origDist:   Math.hypot(x - selEl.x, y - selEl.y) || 1,
      };
      return;
    }
  }

  // 2. Hit test todos los elementos (de arriba hacia abajo, último dibujado primero)
  const lista = [...ElementosState.elementos].reverse();
  for (const el of lista) {
    if (hitTestElemento(x, y, el)) {
      ElementosState.seleccionado = el.id;
      EditorState.drag = {
        tipo:       'mover',
        elementoId: el.id,
        startX:     x,
        startY:     y,
        origX:      el.x,
        origY:      el.y,
      };
      generarFlyer();
      actualizarPanelEdicion(el);
      return;
    }
  }

  // 3. Click en vacío: deseleccionar
  ElementosState.seleccionado = null;
  EditorState.drag = null;
  generarFlyer();
  actualizarPanelEdicion(null);
}

function onPointerMove(e) {
  if (!EditorState.drag || !ElementosState.modoEditor) {
    actualizarCursorEditor(e);
    return;
  }

  const { x, y } = clientToCanvas(e.clientX, e.clientY);
  const d        = EditorState.drag;
  const el       = ElementosState.getById(d.elementoId);
  if (!el) return;

  if (d.tipo === 'mover') {
    el.x = d.origX + (x - d.startX);
    el.y = d.origY + (y - d.startY);
  }

  if (d.tipo === 'escala') {
    const dist    = Math.hypot(x - d.cx, y - d.cy);
    el.escala     = Math.max(0.15, (d.origEscala * dist) / d.origDist);
  }

  if (d.tipo === 'rotar') {
    const angAhora = Math.atan2(y - d.cy, x - d.cx);
    el.rotacion    = d.origRot + (angAhora - d.startAngle);
  }

  generarFlyer();
  actualizarPanelEdicion(el);
}

function onPointerUp() {
  EditorState.drag = null;
}

function actualizarCursorEditor(e) {
  const overlay = document.getElementById('editor-overlay');
  if (!overlay || !ElementosState.modoEditor) return;

  const { x, y }  = clientToCanvas(e.clientX, e.clientY);
  const selId      = ElementosState.seleccionado;
  const selEl      = selId ? ElementosState.getById(selId) : null;

  if (selEl) {
    if (hitTestHandle(x, y, selEl, HANDLE_ROTAR)) { overlay.style.cursor = 'crosshair'; return; }
    if (hitTestHandle(x, y, selEl, HANDLE_ESCALA)) { overlay.style.cursor = 'nwse-resize'; return; }
  }

  const lista = [...ElementosState.elementos].reverse();
  for (const el of lista) {
    if (hitTestElemento(x, y, el)) { overlay.style.cursor = 'move'; return; }
  }
  overlay.style.cursor = 'default';
}

// ═══════════════════════════════════
//  DIBUJAR HANDLES (llamado desde render.js)
// ═══════════════════════════════════
function dibujarHandles(ctx) {
  if (!ElementosState.modoEditor) return;

  const selId = ElementosState.seleccionado;

  // Dibujar bounding box de todos los elementos
  ElementosState.elementos.forEach(el => {
    const esSel = el.id === selId;
    dibujarBoundingBox(ctx, el, esSel);
  });

  // Handles solo del seleccionado
  if (selId) {
    const el = ElementosState.getById(selId);
    if (el) dibujarHandlesElemento(ctx, el);
  }
}

function dibujarBoundingBox(ctx, el, seleccionado) {
  const hb  = HITBOX[el.tipo] || { w: 200, h: 80 };
  const hw  = (hb.w * el.escala) / 2;
  const hh  = (hb.h * el.escala) / 2;

  ctx.save();
  ctx.translate(el.x, el.y);
  ctx.rotate(el.rotacion);

  ctx.strokeStyle = seleccionado ? '#FFFFFF' : 'rgba(255,255,255,.3)';
  ctx.lineWidth   = seleccionado ? 2 : 1;
  ctx.setLineDash(seleccionado ? [] : [6, 4]);
  ctx.strokeRect(-hw, -hh, hw*2, hh*2);
  ctx.setLineDash([]);

  // Etiqueta del elemento
  if (seleccionado) {
    ctx.fillStyle = 'rgba(0,0,0,.55)';
    const labelW = 160, labelH = 26;
    roundRect(ctx, -labelW/2, -hh - labelH - 6, labelW, labelH, 6);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '500 18px DM Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(el.label, 0, -hh - labelH/2 - 6);
    ctx.textBaseline = 'alphabetic';
  }

  ctx.restore();
}

function dibujarHandlesElemento(ctx, el) {
  // Handle ROTAR (círculo arriba)
  const hRot = getHandlePos(el, HANDLE_ROTAR);
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,.4)';
  ctx.shadowBlur  = 6;
  ctx.fillStyle   = '#4FC3F7';
  ctx.beginPath();
  ctx.arc(hRot.x, hRot.y, HANDLE_RADIO, 0, Math.PI*2);
  ctx.fill();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth   = 2;
  ctx.stroke();
  // Ícono de flecha rotación
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('↻', hRot.x, hRot.y);
  ctx.restore();

  // Handle ESCALA (cuadrado esquina inferior derecha)
  const hEsc = getHandlePos(el, HANDLE_ESCALA);
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,.4)';
  ctx.shadowBlur  = 6;
  ctx.fillStyle   = '#C4748A';
  roundRect(ctx, hEsc.x - HANDLE_RADIO, hEsc.y - HANDLE_RADIO, HANDLE_RADIO*2, HANDLE_RADIO*2, 3);
  ctx.fill();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth   = 2;
  ctx.stroke();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('⤡', hEsc.x, hEsc.y + 1);
  ctx.restore();

  // Línea del handle de rotar al borde
  const hb = HITBOX[el.tipo] || { w: 200, h: 80 };
  const topCenter = rotarPunto(el.x, el.y - (hb.h * el.escala)/2, el.x, el.y, el.rotacion);
  ctx.save();
  ctx.strokeStyle = 'rgba(79,195,247,.6)';
  ctx.lineWidth   = 1.5;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.moveTo(topCenter.x, topCenter.y);
  ctx.lineTo(hRot.x, hRot.y);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

// ═══════════════════════════════════
//  PANEL DE EDICIÓN (sidebar inferior)
// ═══════════════════════════════════
function actualizarPanelEdicion(el) {
  const panel = document.getElementById('panel-edicion');
  if (!panel) return;

  if (!el) {
    panel.innerHTML = `<p class="hint-txt" style="text-align:center">Hacé click en un elemento del flyer para seleccionarlo</p>`;
    return;
  }

  const escPct  = Math.round(el.escala * 100);
  const rotGrad = Math.round(el.rotacion * 180 / Math.PI);
  const { w: W, h: H } = State.getCanvasSize();
  const f = el.fondo || { tipo: 'ninguno' };

  // Solo mostrar fondo en elementos de texto (no logo ni footer)
  const esSoloTexto = el.tipo === 'texto' || el.tipo === 'badge';

  panel.innerHTML = `
    <div class="editor-elem-header">
      <span class="editor-elem-label">${el.label}</span>
      <button class="btn-reset-elem" onclick="resetElemento('${el.id}')">↺ Resetear</button>
    </div>

    <!-- TABS del panel -->
    <div class="panel-tabs">
      <button class="ptab active" data-ptab="transform" onclick="switchPanelTab(this)">Posición</button>
      ${esSoloTexto ? `<button class="ptab" data-ptab="fondo" onclick="switchPanelTab(this)">Fondo / Marco</button>` : ''}
    </div>

    <!-- TAB: Transformación -->
    <div class="ptab-panel active" id="ptab-transform">
      <div class="editor-controles">
        <div class="editor-control-row">
          <label>X <span class="editor-val">${Math.round(el.x)}</span></label>
          <input type="range" min="0" max="${W}" value="${Math.round(el.x)}"
            oninput="moverElementoX('${el.id}', +this.value); this.previousElementSibling.querySelector('.editor-val').textContent=Math.round(this.value)">
        </div>
        <div class="editor-control-row">
          <label>Y <span class="editor-val">${Math.round(el.y)}</span></label>
          <input type="range" min="0" max="${H}" value="${Math.round(el.y)}"
            oninput="moverElementoY('${el.id}', +this.value); this.previousElementSibling.querySelector('.editor-val').textContent=Math.round(this.value)">
        </div>
        <div class="editor-control-row">
          <label>Tamaño <span class="editor-val">${escPct}%</span></label>
          <input type="range" min="20" max="300" value="${escPct}"
            oninput="escalarElemento('${el.id}', +this.value/100); this.previousElementSibling.querySelector('.editor-val').textContent=this.value+'%'">
        </div>
        <div class="editor-control-row">
          <label>Rotación <span class="editor-val">${rotGrad}°</span></label>
          <input type="range" min="-180" max="180" value="${rotGrad}"
            oninput="rotarElemento('${el.id}', +this.value*Math.PI/180); this.previousElementSibling.querySelector('.editor-val').textContent=this.value+'°'">
        </div>
      </div>
    </div>

    ${esSoloTexto ? `
    <!-- TAB: Fondo / Marco -->
    <div class="ptab-panel" id="ptab-fondo">
      <div class="fondo-tipo-grid" id="fondo-tipo-grid">
        ${renderizarBotonesTipoFondo(el.id, f.tipo)}
      </div>

      <!-- Controles dinámicos según el tipo elegido -->
      <div id="fondo-controles-extra">
        ${renderizarControlesFondo(el.id, f)}
      </div>
    </div>
    ` : ''}
  `;
}

// ── Botones de tipo de fondo ──
function renderizarBotonesTipoFondo(elId, tipoActual) {
  const tipos = [
    { id: 'ninguno',        ico: '✕',  nom: 'Ninguno'      },
    { id: 'solido',         ico: '■',  nom: 'Sólido'       },
    { id: 'semitransparente',ico:'◧',  nom: 'Vidrio'       },
    { id: 'degradado',      ico: '▣',  nom: 'Degradado'    },
    { id: 'marco',          ico: '□',  nom: 'Marco'        },
    { id: 'marco-doble',    ico: '⬜',  nom: 'Marco doble'  },
    { id: 'pill',           ico: '⬭',  nom: 'Cápsula'      },
    { id: 'pill-borde',     ico: '⬮',  nom: 'Cápsula borde'},
    { id: 'sombra-texto',   ico: '🌫', nom: 'Sombra'       },
    { id: 'neon',           ico: '✨',  nom: 'Neón'         },
    { id: 'subrayado',      ico: '▁',  nom: 'Subrayado'    },
    { id: 'subrayado-doble',ico: '▬',  nom: 'Subray. doble'},
  ];

  return tipos.map(t => `
    <button class="fondo-tipo-btn ${t.id === tipoActual ? 'activo' : ''}"
      onclick="cambiarTipoFondo('${elId}', '${t.id}')">
      <span class="ft-ico">${t.ico}</span>
      <span class="ft-nom">${t.nom}</span>
    </button>
  `).join('');
}

// ── Controles según tipo ──
function renderizarControlesFondo(elId, f) {
  const tipo = f.tipo || 'ninguno';
  if (tipo === 'ninguno') return '';

  const col  = f.color      || '#000000';
  const op   = f.opacidad   ?? 0.85;
  const r    = f.radio      ?? 10;
  const ph   = f.padding?.h ?? 24;
  const pv   = f.padding?.v ?? 14;
  const gr   = f.grosorMarco?? 4;
  const colS = f.colorSombra|| '#000000';
  const dif  = f.difusion   ?? 20;
  const col2 = f.colorDeg2  || '#ffffff';
  const ang  = f.anguloDeg  ?? 135;

  const necesitaColor   = !['sombra-texto','neon'].includes(tipo);
  const necesitaOpac    = !['sombra-texto','neon'].includes(tipo);
  const necesitaRadio   = ['solido','semitransparente','degradado','marco','marco-doble'].includes(tipo);
  const necesitaPad     = !['subrayado','subrayado-doble','tachado','sombra-texto','neon'].includes(tipo);
  const necesitaGrosor  = ['marco','marco-doble','pill-borde','subrayado','subrayado-doble'].includes(tipo);
  const necesitaSombra  = ['sombra-texto','neon'].includes(tipo);
  const necesitaDeg2    = tipo === 'degradado';

  const fn = `actualizarFondo_${elId.replace(/-/g,'_')}`;

  return `
    <div class="fondo-ctrl-grid">
      ${necesitaColor ? `
      <div class="fondo-ctrl-row">
        <label>Color</label>
        <div class="fondo-color-row">
          <input type="color" value="${col}"
            oninput="cambiarFondo('${elId}',{color:this.value})">
          <div class="fondo-paleta-rapida">
            ${['#000000','#FFFFFF','#C4748A','#D4A853','#1A1018','#F7EEF1','#7C9E8E','#7B8EC8']
              .map(c=>`<button class="paleta-color" style="background:${c}"
                onclick="cambiarFondo('${elId}',{color:'${c}'})" title="${c}"></button>`).join('')}
          </div>
        </div>
      </div>` : ''}

      ${necesitaOpac ? `
      <div class="fondo-ctrl-row">
        <label>Opacidad <span class="editor-val">${Math.round(op*100)}%</span></label>
        <input type="range" min="5" max="100" value="${Math.round(op*100)}"
          oninput="cambiarFondo('${elId}',{opacidad:+this.value/100}); this.previousElementSibling.querySelector('.editor-val').textContent=this.value+'%'">
      </div>` : ''}

      ${necesitaRadio ? `
      <div class="fondo-ctrl-row">
        <label>Redondez <span class="editor-val">${r}px</span></label>
        <input type="range" min="0" max="60" value="${r}"
          oninput="cambiarFondo('${elId}',{radio:+this.value}); this.previousElementSibling.querySelector('.editor-val').textContent=this.value+'px'">
      </div>` : ''}

      ${necesitaPad ? `
      <div class="fondo-ctrl-row">
        <label>Padding H <span class="editor-val">${ph}px</span></label>
        <input type="range" min="0" max="120" value="${ph}"
          oninput="cambiarFondo('${elId}',{padding:{h:+this.value,v:${pv}}}); this.previousElementSibling.querySelector('.editor-val').textContent=this.value+'px'">
      </div>
      <div class="fondo-ctrl-row">
        <label>Padding V <span class="editor-val">${pv}px</span></label>
        <input type="range" min="0" max="80" value="${pv}"
          oninput="cambiarFondo('${elId}',{padding:{h:${ph},v:+this.value}}); this.previousElementSibling.querySelector('.editor-val').textContent=this.value+'px'">
      </div>` : ''}

      ${necesitaGrosor ? `
      <div class="fondo-ctrl-row">
        <label>Grosor <span class="editor-val">${gr}px</span></label>
        <input type="range" min="1" max="20" value="${gr}"
          oninput="cambiarFondo('${elId}',{grosorMarco:+this.value}); this.previousElementSibling.querySelector('.editor-val').textContent=this.value+'px'">
      </div>` : ''}

      ${necesitaSombra ? `
      <div class="fondo-ctrl-row">
        <label>Color</label>
        <input type="color" value="${colS}"
          oninput="cambiarFondo('${elId}',{colorSombra:this.value})">
      </div>
      <div class="fondo-ctrl-row">
        <label>Difusión <span class="editor-val">${dif}px</span></label>
        <input type="range" min="2" max="80" value="${dif}"
          oninput="cambiarFondo('${elId}',{difusion:+this.value}); this.previousElementSibling.querySelector('.editor-val').textContent=this.value+'px'">
      </div>` : ''}

      ${necesitaDeg2 ? `
      <div class="fondo-ctrl-row">
        <label>Color 2</label>
        <input type="color" value="${col2}"
          oninput="cambiarFondo('${elId}',{colorDeg2:this.value})">
      </div>
      <div class="fondo-ctrl-row">
        <label>Ángulo <span class="editor-val">${ang}°</span></label>
        <input type="range" min="0" max="360" value="${ang}"
          oninput="cambiarFondo('${elId}',{anguloDeg:+this.value}); this.previousElementSibling.querySelector('.editor-val').textContent=this.value+'°'">
      </div>` : ''}
    </div>
  `;
}

function switchPanelTab(btn) {
  const tabId = btn.dataset.ptab;
  btn.closest('.panel-edicion').querySelectorAll('.ptab').forEach(b => b.classList.remove('active'));
  btn.closest('.panel-edicion').querySelectorAll('.ptab-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(`ptab-${tabId}`)?.classList.add('active');
}

function cambiarTipoFondo(elId, tipo) {
  ElementosState.setFondo(elId, { tipo });
  const el = ElementosState.getById(elId);
  if (!el) return;

  generarFlyer();

  // Re-renderizar el panel manteniendo el tab "fondo" activo
  actualizarPanelEdicion(el);
  // Activar el tab de fondo directamente sin setTimeout
  const panelEl = document.getElementById('panel-edicion');
  panelEl?.querySelectorAll('.ptab').forEach(b => b.classList.remove('active'));
  panelEl?.querySelectorAll('.ptab-panel').forEach(p => p.classList.remove('active'));
  const btnFondo = panelEl?.querySelector('.ptab[data-ptab="fondo"]');
  if (btnFondo) btnFondo.classList.add('active');
  document.getElementById('ptab-fondo')?.classList.add('active');
}

function cambiarFondo(elId, cambios) {
  ElementosState.setFondo(elId, cambios);
  generarFlyer();
}

// ═══════════════════════════════════
//  API PÚBLICA — funciones de control
// ═══════════════════════════════════
function moverElementoX(id, x) {
  const el = ElementosState.getById(id);
  if (!el) return;
  el.x = x;
  generarFlyer();
  actualizarPanelEdicion(el);
}

function moverElementoY(id, y) {
  const el = ElementosState.getById(id);
  if (!el) return;
  el.y = y;
  generarFlyer();
  actualizarPanelEdicion(el);
}

function escalarElemento(id, escala) {
  ElementosState.setEscala(id, escala);
  const el = ElementosState.getById(id);
  generarFlyer();
  if (el) actualizarPanelEdicion(el);
}

function rotarElemento(id, rad) {
  ElementosState.setRotacion(id, rad);
  const el = ElementosState.getById(id);
  generarFlyer();
  if (el) actualizarPanelEdicion(el);
}

function resetElemento(id) {
  const el = ElementosState.getById(id);
  if (!el) return;
  el.x        = el._origX;
  el.y        = el._origY;
  el.escala   = el._origEscala;
  el.rotacion = el._origRotacion;
  generarFlyer();
  actualizarPanelEdicion(el);
}

function resetTodosElementos() {
  ElementosState.resetear();
  generarFlyer();
  actualizarPanelEdicion(null);
}

// ═══════════════════════════════════
//  TOGGLE MODO EDITOR
// ═══════════════════════════════════
function toggleModoEditor() {
  ElementosState.modoEditor = !ElementosState.modoEditor;
  const overlay  = document.getElementById('editor-overlay');
  const btn      = document.getElementById('btn-toggle-editor');
  const panelWrap= document.getElementById('panel-edicion-wrap');

  if (ElementosState.modoEditor) {
    overlay?.classList.add('activo');
    btn?.classList.add('activo');
    panelWrap?.classList.add('visible');
    if (btn) btn.textContent = '✎ Modo edición ON';
  } else {
    overlay?.classList.remove('activo');
    btn?.classList.remove('activo');
    panelWrap?.classList.remove('visible');
    if (btn) btn.textContent = '✎ Editar posiciones';
    ElementosState.seleccionado = null;
  }
  generarFlyer();
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  initEditor();

  document.getElementById('btn-toggle-editor')?.addEventListener('click', toggleModoEditor);
  document.getElementById('btn-reset-editor')?.addEventListener('click', resetTodosElementos);
});
