/* ══════════════════════════════════════════════════════
   INDUSTRIAS.JS — Configuración multi-industria
   Desacopla la industria de los prompts de IA, los colores
   por defecto y los campos de datos. Agregar una industria
   nueva = agregar una entrada a INDUSTRIAS.
   ══════════════════════════════════════════════════════ */

const INDUSTRIAS = {
  estetica: {
    id: 'estetica',
    nombre: 'Estética / Belleza',
    ico: '💅',
    headerSub: 'Diseños profesionales para estéticas',
    // Frase que se inserta en el prompt de imagen de Gemini (español)
    promptImagen: 'estética de belleza',
    // Tema por defecto (inglés) cuando el usuario no escribe nada
    promptImagenBase: 'elegant abstract background for a luxury beauty salon',
    // Rol del "diseñador" para el prompt de paletas de colores
    brandingRol: 'salones de belleza',
    estetica: 'suave y lujosa',
    colores: { principal: '#C4748A', fondo: '#1A1018', acento: '#D4A853' },
    igUser: 'tuestética',
    datos: {
      negocio: { placeholder: 'Ej: Estética Valentina', default: 'Estética Valentina' },
      slogan:  { placeholder: 'Ej: Belleza que transforma', default: 'Belleza que transforma' },
      ig:      { placeholder: '@tuestética', default: '@estetica.valentina' },
      dir:     { placeholder: 'Av. 18 de Julio 1234' },
      web:     { placeholder: 'www.miestetica.com' },
    },
  },

  gym: {
    id: 'gym',
    nombre: 'Gimnasio / Fitness',
    ico: '💪',
    headerSub: 'Diseños profesionales para gimnasios',
    promptImagen: 'gimnasio / entrenamiento fitness',
    promptImagenBase: 'dynamic abstract background for a modern fitness gym',
    brandingRol: 'gimnasios y centros de fitness',
    estetica: 'enérgica y moderna',
    colores: { principal: '#E63946', fondo: '#0D1B2A', acento: '#F1C40F' },
    igUser: 'tugym',
    datos: {
      negocio: { placeholder: 'Ej: PowerFit Gym', default: 'PowerFit Gym' },
      slogan:  { placeholder: 'Ej: Superá tus límites', default: 'Superá tus límites' },
      ig:      { placeholder: '@tugym', default: '@powerfit.gym' },
      dir:     { placeholder: 'Av. Principal 456' },
      web:     { placeholder: 'www.powerfitgym.com' },
    },
  },

  restaurant: {
    id: 'restaurant',
    nombre: 'Restaurante / Gastronomía',
    ico: '🍽️',
    headerSub: 'Diseños profesionales para gastronomía',
    promptImagen: 'restaurante / gastronomía',
    promptImagenBase: 'warm abstract background for a cozy gourmet restaurant',
    brandingRol: 'restaurantes y locales gastronómicos',
    estetica: 'cálida y apetitosa',
    colores: { principal: '#C1440E', fondo: '#1B1210', acento: '#E9C46A' },
    igUser: 'turestaurante',
    datos: {
      negocio: { placeholder: 'Ej: La Trattoria', default: 'La Trattoria' },
      slogan:  { placeholder: 'Ej: Sabor que enamora', default: 'Sabor que enamora' },
      ig:      { placeholder: '@turestaurante', default: '@la.trattoria' },
      dir:     { placeholder: 'Calle Gourmet 789' },
      web:     { placeholder: 'www.latrattoria.com' },
    },
  },

  inmobiliaria: {
    id: 'inmobiliaria',
    nombre: 'Inmobiliaria',
    ico: '🏠',
    headerSub: 'Diseños profesionales para inmobiliarias',
    promptImagen: 'inmobiliaria / bienes raíces',
    promptImagenBase: 'clean modern abstract background for a real estate agency',
    brandingRol: 'inmobiliarias y agentes de bienes raíces',
    estetica: 'confiable y profesional',
    colores: { principal: '#1D6A96', fondo: '#0E1A24', acento: '#C9A227' },
    igUser: 'tuinmobiliaria',
    datos: {
      negocio: { placeholder: 'Ej: Grupo Hogar', default: 'Grupo Hogar' },
      slogan:  { placeholder: 'Ej: Tu próximo hogar te espera', default: 'Tu próximo hogar te espera' },
      ig:      { placeholder: '@tuinmobiliaria', default: '@grupo.hogar' },
      dir:     { placeholder: 'Av. Central 100' },
      web:     { placeholder: 'www.grupohogar.com' },
    },
  },

  eventos: {
    id: 'eventos',
    nombre: 'Eventos / Fiestas',
    ico: '🎉',
    headerSub: 'Diseños profesionales para eventos',
    promptImagen: 'eventos y fiestas',
    promptImagenBase: 'festive abstract background for a party events company',
    brandingRol: 'organizadores de eventos y fiestas',
    estetica: 'festiva y vibrante',
    colores: { principal: '#7B2CBF', fondo: '#140A1F', acento: '#F72585' },
    igUser: 'tuseventos',
    datos: {
      negocio: { placeholder: 'Ej: Fiesta Total', default: 'Fiesta Total' },
      slogan:  { placeholder: 'Ej: Momentos inolvidables', default: 'Momentos inolvidables' },
      ig:      { placeholder: '@tuseventos', default: '@fiesta.total' },
      dir:     { placeholder: 'Salón Central 55' },
      web:     { placeholder: 'www.fiestatotal.com' },
    },
  },

  barberia: {
    id: 'barberia',
    nombre: 'Barbería',
    ico: '💈',
    headerSub: 'Diseños profesionales para barberías',
    promptImagen: 'barbería masculina',
    promptImagenBase: 'bold vintage abstract background for a men barbershop',
    brandingRol: 'barberías',
    estetica: 'ruda y elegante',
    colores: { principal: '#B08D57', fondo: '#141210', acento: '#D9D9D9' },
    igUser: 'tubarberia',
    datos: {
      negocio: { placeholder: 'Ej: The Barber Club', default: 'The Barber Club' },
      slogan:  { placeholder: 'Ej: Estilo que se nota', default: 'Estilo que se nota' },
      ig:      { placeholder: '@tubarberia', default: '@the.barber.club' },
      dir:     { placeholder: 'Calle Corte 22' },
      web:     { placeholder: 'www.thebarberclub.com' },
    },
  },
};

// ── Estado de la industria (persistido en localStorage) ──
const IndustriaState = {
  get id()  { return localStorage.getItem('flyerstudio_industria') || 'estetica'; },
  set id(v) { localStorage.setItem('flyerstudio_industria', v); },
  actual()  { return INDUSTRIAS[this.id] || INDUSTRIAS.estetica; },
};

// ── Utilidades internas ──

// Devuelve todos los valores default conocidos para un campo, en todas las industrias.
// Sirve para saber si un input todavía tiene un valor "de ejemplo" (reemplazable)
// o si el usuario escribió algo propio (no se debe pisar).
function _defaultsConocidos(campo) {
  return Object.values(INDUSTRIAS)
    .map(i => i.datos[campo]?.default)
    .filter(v => typeof v === 'string');
}

function _syncColorInput(id, valor) {
  const c = document.getElementById(id);          if (c) c.value = valor;
  const t = document.getElementById(id + '-txt'); if (t) t.value = valor;
}

// ── Aplicar una industria a toda la UI ──
// forzarValores: si true, reemplaza los valores de los campos aunque el usuario
// los haya editado (se usa al cambiar de industria manualmente sólo para ejemplos).
function aplicarIndustria(id, { forzarValores = false, regenerar = true } = {}) {
  const ind = INDUSTRIAS[id];
  if (!ind) return;
  IndustriaState.id = id;

  // Subtítulo del header
  const sub = document.querySelector('.header-sub');
  if (sub) sub.textContent = ind.headerSub;

  // Colores por defecto de la industria
  _syncColorInput('color-principal', ind.colores.principal);
  _syncColorInput('color-fondo',     ind.colores.fondo);
  _syncColorInput('color-acento',    ind.colores.acento);

  // Campos de datos: placeholder siempre; valor sólo si está vacío o es un ejemplo conocido
  for (const campo of ['negocio', 'slogan', 'ig', 'dir', 'web']) {
    const el = document.getElementById('inp-' + campo);
    if (!el) continue;
    const cfg = ind.datos[campo];
    if (!cfg) continue;

    if (cfg.placeholder) el.placeholder = cfg.placeholder;

    if ('default' in cfg) {
      const actual = el.value.trim();
      const esEjemplo = actual === '' || _defaultsConocidos(campo).includes(actual);
      if (forzarValores || esEjemplo) el.value = cfg.default;
    }
  }

  // Usuario de Instagram en el preview de IG
  const igUser = document.getElementById('ig-username');
  const igCap  = document.getElementById('ig-cap-user');
  if (igUser) igUser.textContent = '@' + ind.igUser;
  if (igCap)  igCap.textContent  = ind.igUser;

  if (regenerar && typeof generarFlyer === 'function') generarFlyer();
}

// ── Selector de industria en el sidebar ──
function renderSelectorIndustria() {
  const cont = document.getElementById('industria-selector');
  if (!cont) return;
  const actual = IndustriaState.id;

  cont.innerHTML = `
    <div class="seccion-titulo">Industria</div>
    <div class="campo">
      <select id="sel-industria">
        ${Object.values(INDUSTRIAS).map(i =>
          `<option value="${i.id}" ${i.id === actual ? 'selected' : ''}>${i.ico} ${i.nombre}</option>`
        ).join('')}
      </select>
      <p class="campo-hint">Cambia colores, textos de ejemplo y el estilo de la IA.</p>
    </div>`;

  document.getElementById('sel-industria').addEventListener('change', e => {
    aplicarIndustria(e.target.value);
  });
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  renderSelectorIndustria();
  // No regeneramos acá: el resto de los módulos aún se están inicializando.
  aplicarIndustria(IndustriaState.id, { regenerar: false });
});
