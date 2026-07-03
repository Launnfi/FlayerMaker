/* ══════════════════════════════════
   PLANTILLAS.JS — Grid de plantillas + campos dinámicos
   ══════════════════════════════════ */

const PLANTILLAS = [
  { id: 'promo',          ico: '💰', nom: 'Promoción',     desc: 'Descuentos y ofertas',    plan: 'basico'  },
  { id: 'servicios',      ico: '✂️', nom: 'Servicios',     desc: 'Menú de servicios',       plan: 'basico'  },
  { id: 'turnos',         ico: '📅', nom: 'Turnos',        desc: 'Disponibilidad',           plan: 'basico'  },
  { id: 'frase',          ico: '✨', nom: 'Frase',         desc: 'Motivacional / branding',  plan: 'basico'  },
  { id: 'nuevo-servicio', ico: '🆕', nom: 'Nuevo serv.',   desc: 'Lanzamiento',              plan: 'pro'     },
  { id: 'oferta-flash',   ico: '⚡', nom: 'Flash',         desc: 'Oferta urgente',           plan: 'pro'     },
  { id: 'navidad',        ico: '🎄', nom: 'Navidad',       desc: 'Fiestas y fin de año',     plan: 'pro'     },
  { id: 'testimonio',     ico: '⭐', nom: 'Testimonio',    desc: 'Reseña de cliente',        plan: 'pro'     },
  { id: 'dia-madre',      ico: '🌸', nom: 'Día Madre',     desc: 'Fechas especiales',        plan: 'premium' },
  { id: 'minimalista',    ico: '◻️', nom: 'Minimalista',  desc: 'Limpio y elegante',        plan: 'premium' },
  { id: 'luxury',         ico: '👑', nom: 'Luxury',        desc: 'Lujo y exclusividad',      plan: 'premium' },
  { id: 'verano',         ico: '☀️', nom: 'Verano',        desc: 'Temporada de verano',      plan: 'premium' },
];

const CAMPOS_POR_PLANTILLA = {
  'promo':          () => camposPromo,
  'servicios':      () => camposServicios,
  'turnos':         () => camposTurnos,
  'frase':          () => camposFrase,
  'nuevo-servicio': () => camposNuevoServicio,
  'oferta-flash':   () => camposOfertaFlash,
  'navidad':        () => camposNavidad,
  'testimonio':     () => camposTestimonio,
  'dia-madre':      () => camposDiaMadre,
  'minimalista':    () => camposMinimalista,
  'luxury':         () => camposLuxury,
  'verano':         () => camposVerano,
};

function renderizarGridPlantillas() {
  const grid = document.getElementById('plantillas-grid');
  if (!grid) return;

  const planActual = State.plan;
  const niveles = { basico: 0, pro: 1, premium: 2 };
  const nivelActual = niveles[planActual] || 0;

  grid.innerHTML = PLANTILLAS.map(p => {
    const nivelReq = niveles[p.plan] || 0;
    const locked = nivelActual < nivelReq;
    const activa = State.plantilla === p.id;

    return `<button 
      class="plantilla-btn ${activa ? 'activa' : ''} ${locked ? 'locked' : ''}" 
      data-plantilla="${p.id}"
      title="${locked ? 'Requiere plan ' + p.plan.charAt(0).toUpperCase() + p.plan.slice(1) : p.desc}"
    >
      ${locked ? '<span class="pt-lock">🔒</span>' : ''}
      <span class="pt-ico">${p.ico}</span>
      <span class="pt-nom">${p.nom}</span>
      <span class="pt-desc">${p.desc}</span>
    </button>`;
  }).join('');

  // Eventos
  grid.querySelectorAll('.plantilla-btn:not(.locked)').forEach(btn => {
    btn.addEventListener('click', () => seleccionarPlantilla(btn));
  });

  // Click en locked → abrir modal planes
  grid.querySelectorAll('.plantilla-btn.locked').forEach(btn => {
    btn.addEventListener('click', abrirModalPlanes);
  });
}

function seleccionarPlantilla(btn) {
  const id = btn.dataset.plantilla;
  State.plantilla = id;

  // UI
  document.querySelectorAll('.plantilla-btn').forEach(b => b.classList.remove('activa'));
  btn.classList.add('activa');

  // Campos dinámicos
  cargarCamposPlantilla(id);

  // Reiniciar posiciones del editor para la nueva plantilla
  if (typeof initElementos === 'function') {
    initElementos(id);
    if (typeof actualizarPanelEdicion === 'function') actualizarPanelEdicion(null);
  }

  generarFlyer();
}

function cargarCamposPlantilla(id) {
  const contenedor = document.getElementById('campos-contenido');
  if (!contenedor) return;
  const fn = CAMPOS_POR_PLANTILLA[id];
  contenedor.innerHTML = fn ? fn() : '';

  // Auto-render al cambiar campos dinámicos
  contenedor.querySelectorAll('input, textarea, select').forEach(el => {
    el.addEventListener('input', () => generarFlyer());
  });
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  renderizarGridPlantillas();
  cargarCamposPlantilla(State.plantilla);
});
