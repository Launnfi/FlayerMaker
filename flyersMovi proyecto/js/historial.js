/* ══════════════════════════════════
   HISTORIAL.JS — Guardar/restaurar flyers (localStorage)
   ══════════════════════════════════ */

const HISTORIAL_KEY = 'flyerstudio_historial';
const MAX_ITEMS_FREE = 5; // Para demos (plan básico simulado)

function getHistorial() {
  try {
    return JSON.parse(localStorage.getItem(HISTORIAL_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveHistorial(items) {
  try {
    localStorage.setItem(HISTORIAL_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('Error guardando historial (storage lleno?):', e);
  }
}

function guardarEnHistorial() {
  if (!State.canUse('historial')) {
    abrirModalPlanes();
    return;
  }

  generarFlyer();
  const canvas = document.getElementById('flyer-canvas');
  const thumb  = canvas.toDataURL('image/jpeg', 0.4); // miniatura comprimida

  const datos = State.getDatos();
  const item  = {
    id:        Date.now(),
    fecha:     new Date().toLocaleDateString('es-ES'),
    hora:      new Date().toLocaleTimeString('es-ES', { hour:'2-digit', minute:'2-digit' }),
    plantilla: State.plantilla,
    formato:   State.formato,
    fuente:    State.fuente,
    negocio:   datos.negocio,
    thumb,
  };

  let items = getHistorial();
  items.unshift(item);

  // Limitar según plan
  const max = State.canUse('maxHistorial');
  if (max !== Infinity) items = items.slice(0, max);

  saveHistorial(items);

  // Feedback
  const btn = document.getElementById('btn-guardar-historial');
  if (btn) {
    const orig = btn.innerHTML;
    btn.innerHTML = '✓';
    setTimeout(() => { btn.innerHTML = orig; }, 1500);
  }
}

function abrirHistorial() {
  if (!State.canUse('historial')) {
    abrirModalPlanes();
    return;
  }
  renderizarHistorial();
  document.getElementById('modal-historial').style.display = 'flex';
}

function cerrarHistorial() {
  document.getElementById('modal-historial').style.display = 'none';
}

function renderizarHistorial() {
  const grid  = document.getElementById('historial-grid');
  const items = getHistorial();

  if (items.length === 0) {
    grid.innerHTML = `<div class="historial-empty">
      <div style="font-size:40px;margin-bottom:12px">🖼</div>
      <p>Todavía no guardaste ningún flyer.</p>
      <p style="margin-top:6px;font-size:12px">Usá el botón guardar después de generar un flyer.</p>
    </div>`;
    return;
  }

  grid.innerHTML = items.map(item => `
    <div class="hist-item" data-id="${item.id}" title="Restaurar este flyer">
      <img src="${item.thumb}" alt="Flyer ${item.plantilla}" loading="lazy">
      <div class="hist-item-info">
        <div class="hist-item-name">${item.negocio || item.plantilla}</div>
        <div class="hist-item-date">${item.fecha} ${item.hora}</div>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('.hist-item').forEach(el => {
    el.addEventListener('click', () => {
      const id   = parseInt(el.dataset.id);
      const item = getHistorial().find(i => i.id === id);
      if (item) restaurarDesdeHistorial(item);
    });
  });
}

function restaurarDesdeHistorial(item) {
  // Restaurar configuración básica
  State.plantilla = item.plantilla;
  State.formato   = item.formato   || 'cuadrado';
  State.fuente    = item.fuente    || 'playfair';

  // Actualizar UI de plantillas
  if (typeof renderizarGridPlantillas === 'function') renderizarGridPlantillas();
  if (typeof cargarCamposPlantilla   === 'function') cargarCamposPlantilla(item.plantilla);
  if (typeof renderizarFormatosBtns  === 'function') renderizarFormatosBtns();
  if (typeof renderizarFuentesGrid   === 'function') renderizarFuentesGrid();

  if (item.negocio) {
    const inp = document.getElementById('inp-negocio');
    if (inp) inp.value = item.negocio;
  }

  cerrarHistorial();
  generarFlyer();
}

function limpiarHistorial() {
  if (confirm('¿Eliminás todo el historial? Esta acción no se puede deshacer.')) {
    localStorage.removeItem(HISTORIAL_KEY);
    renderizarHistorial();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-historial')?.addEventListener('click', abrirHistorial);
  document.getElementById('modal-hist-close')?.addEventListener('click', cerrarHistorial);
  document.getElementById('btn-guardar-historial')?.addEventListener('click', guardarEnHistorial);
  document.getElementById('btn-limpiar-historial')?.addEventListener('click', limpiarHistorial);

  document.getElementById('modal-historial')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) cerrarHistorial();
  });
});
