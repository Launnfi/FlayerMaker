/* ══════════════════════════════════════════════════════
   BUSINESS-TYPES.JS — Sistema central de RUBROS (tipos de negocio)

   Catálogo maestro y ampliable de rubros. Cada rubro concentra
   toda la info que orienta la app a ese tipo de negocio:
   colores sugeridos, campañas disponibles, categorías, palabras
   clave para IA y estilos recomendados.

   ▸ Agregar un rubro nuevo = agregar UNA entrada a BUSINESS_TYPES.
     No hace falta tocar ningún otro archivo.

   ▸ Reutiliza js/industrias.js cuando existe un equivalente
     (campo `industriaRef`): así aprovechamos placeholders, textos
     de ejemplo y el prompt de IA ya definidos, sin duplicarlos ni
     romper compatibilidad. industrias.js NO se elimina.

   ▸ Esta etapa sólo prepara la infraestructura. NO modifica
     plantillas, render, editor, historial, auth ni pagos.
   ══════════════════════════════════════════════════════ */

const BUSINESS_TYPES = {

  estetica: {
    id: 'estetica',
    nombre: 'Estética / Belleza',
    icono: '💅',
    descripcion: 'Salones de belleza, spa y estética facial o corporal.',
    colores: { principal: '#C4748A', fondo: '#1A1018', acento: '#D4A853' },
    campanas:   ['promo', 'nuevo-servicio', 'turnos', 'testimonio', 'dia-madre'],
    categorias: ['Faciales', 'Uñas', 'Depilación', 'Masajes', 'Maquillaje'],
    keywordsIA: ['belleza', 'spa', 'skincare', 'elegante', 'suave', 'lujoso'],
    estilos:    ['minimalista', 'luxury', 'suave'],
    industriaRef: 'estetica',
  },

  barberia: {
    id: 'barberia',
    nombre: 'Barbería',
    icono: '💈',
    descripcion: 'Barberías y peluquerías masculinas.',
    colores: { principal: '#B08D57', fondo: '#141210', acento: '#D9D9D9' },
    campanas:   ['promo', 'servicios', 'turnos', 'testimonio'],
    categorias: ['Corte', 'Barba', 'Afeitado', 'Diseño', 'Color'],
    keywordsIA: ['barber', 'vintage', 'masculino', 'rudo', 'elegante'],
    estilos:    ['vintage', 'luxury', 'oscuro'],
    industriaRef: 'barberia',
  },

  restaurante: {
    id: 'restaurante',
    nombre: 'Restaurante',
    icono: '🍽️',
    descripcion: 'Restaurantes, parrillas y locales gastronómicos.',
    colores: { principal: '#C1440E', fondo: '#1B1210', acento: '#E9C46A' },
    campanas:   ['promo', 'servicios', 'oferta-flash', 'nuevo-servicio'],
    categorias: ['Menú del día', 'Delivery', 'Reservas', 'Eventos', 'Postres'],
    keywordsIA: ['comida', 'gourmet', 'cálido', 'apetitoso', 'rústico'],
    estilos:    ['cálido', 'rústico', 'minimalista'],
    industriaRef: 'restaurant',
  },

  cafeteria: {
    id: 'cafeteria',
    nombre: 'Cafetería',
    icono: '☕',
    descripcion: 'Cafeterías, coffee shops y casas de té.',
    colores: { principal: '#8C5A3B', fondo: '#17110C', acento: '#D9B382' },
    campanas:   ['promo', 'servicios', 'nuevo-servicio', 'frase'],
    categorias: ['Café de especialidad', 'Desayunos', 'Meriendas', 'Pastelería'],
    keywordsIA: ['café', 'acogedor', 'artesanal', 'cálido', 'aroma'],
    estilos:    ['cálido', 'minimalista', 'acogedor'],
  },

  ropa: {
    id: 'ropa',
    nombre: 'Tienda de ropa',
    icono: '👗',
    descripcion: 'Indumentaria, boutiques y moda.',
    colores: { principal: '#2B2B2B', fondo: '#F5F0EB', acento: '#C9A227' },
    campanas:   ['promo', 'oferta-flash', 'nuevo-servicio', 'testimonio'],
    categorias: ['Temporada', 'Ofertas', 'Nueva colección', 'Accesorios'],
    keywordsIA: ['moda', 'fashion', 'minimalista', 'tendencia', 'elegante'],
    estilos:    ['minimalista', 'luxury', 'moderno'],
  },

  veterinaria: {
    id: 'veterinaria',
    nombre: 'Veterinaria',
    icono: '🐾',
    descripcion: 'Clínicas veterinarias, pet shops y peluquería canina.',
    colores: { principal: '#2A9D8F', fondo: '#0E1B1A', acento: '#E9C46A' },
    campanas:   ['promo', 'servicios', 'turnos', 'nuevo-servicio'],
    categorias: ['Consultas', 'Vacunas', 'Peluquería', 'Accesorios', 'Urgencias'],
    keywordsIA: ['mascotas', 'amigable', 'cuidado', 'confiable', 'suave'],
    estilos:    ['amigable', 'moderno', 'suave'],
  },

  gimnasio: {
    id: 'gimnasio',
    nombre: 'Gimnasio / Fitness',
    icono: '💪',
    descripcion: 'Gimnasios, boxes de crossfit y centros de fitness.',
    colores: { principal: '#E63946', fondo: '#0D1B2A', acento: '#F1C40F' },
    campanas:   ['promo', 'oferta-flash', 'servicios', 'turnos'],
    categorias: ['Musculación', 'Clases', 'Planes', 'Personal trainer'],
    keywordsIA: ['fitness', 'energía', 'fuerza', 'dinámico', 'moderno'],
    estilos:    ['moderno', 'enérgico', 'oscuro'],
    industriaRef: 'gym',
  },

  taller: {
    id: 'taller',
    nombre: 'Taller mecánico',
    icono: '🔧',
    descripcion: 'Talleres mecánicos, gomerías y service automotor.',
    colores: { principal: '#F4A100', fondo: '#14161A', acento: '#4A90D9' },
    campanas:   ['promo', 'servicios', 'oferta-flash', 'turnos'],
    categorias: ['Service', 'Neumáticos', 'Chapa y pintura', 'Diagnóstico'],
    keywordsIA: ['mecánica', 'automotor', 'industrial', 'robusto', 'técnico'],
    estilos:    ['industrial', 'moderno', 'oscuro'],
  },

  inmobiliaria: {
    id: 'inmobiliaria',
    nombre: 'Inmobiliaria',
    icono: '🏠',
    descripcion: 'Inmobiliarias y agentes de bienes raíces.',
    colores: { principal: '#1D6A96', fondo: '#0E1A24', acento: '#C9A227' },
    campanas:   ['promo', 'nuevo-servicio', 'servicios', 'testimonio'],
    categorias: ['Venta', 'Alquiler', 'Tasaciones', 'Emprendimientos'],
    keywordsIA: ['inmueble', 'moderno', 'confiable', 'profesional', 'limpio'],
    estilos:    ['minimalista', 'profesional', 'moderno'],
    industriaRef: 'inmobiliaria',
  },

  celulares: {
    id: 'celulares',
    nombre: 'Celulares / Telefonía',
    icono: '📱',
    descripcion: 'Venta y reparación de celulares y accesorios.',
    colores: { principal: '#3A86FF', fondo: '#0B1220', acento: '#8338EC' },
    campanas:   ['promo', 'oferta-flash', 'servicios', 'nuevo-servicio'],
    categorias: ['Venta', 'Reparación', 'Accesorios', 'Financiación'],
    keywordsIA: ['tecnología', 'moderno', 'gadget', 'futurista', 'digital'],
    estilos:    ['moderno', 'tecnológico', 'oscuro'],
  },

  informatica: {
    id: 'informatica',
    nombre: 'Informática',
    icono: '💻',
    descripcion: 'Servicio técnico, PC gamer, redes y software.',
    colores: { principal: '#00B4D8', fondo: '#0A0F1C', acento: '#90E0EF' },
    campanas:   ['promo', 'servicios', 'oferta-flash', 'nuevo-servicio'],
    categorias: ['Service', 'Armado de PC', 'Redes', 'Software', 'Hosting'],
    keywordsIA: ['tecnología', 'digital', 'futurista', 'neón', 'técnico'],
    estilos:    ['tecnológico', 'moderno', 'oscuro'],
  },

  pasteleria: {
    id: 'pasteleria',
    nombre: 'Pastelería',
    icono: '🧁',
    descripcion: 'Pastelerías, reposterías y tortas artesanales.',
    colores: { principal: '#E8A0BF', fondo: '#1E1418', acento: '#F6C177' },
    campanas:   ['promo', 'nuevo-servicio', 'oferta-flash', 'dia-madre'],
    categorias: ['Tortas', 'Por encargo', 'Cumpleaños', 'Delivery', 'Postres'],
    keywordsIA: ['dulce', 'artesanal', 'pastel', 'tierno', 'colorido'],
    estilos:    ['suave', 'colorido', 'artesanal'],
  },

};

// ── Estado del rubro (persistido en localStorage) ──
const RubroState = {
  KEY: 'flyerstudio_rubro',
  get id()  { try { return localStorage.getItem(this.KEY) || 'estetica'; } catch { return 'estetica'; } },
  set id(v) { try { localStorage.setItem(this.KEY, v); } catch {} },
  actual()  { return BUSINESS_TYPES[this.id] || BUSINESS_TYPES.estetica; },
};

// Snapshot del rubro activo — fuente única para futuras funciones de IA y Campañas.
// Se mantiene actualizado por aplicarRubro().
let RubroActivo = RubroState.actual();

// Devuelve el rubro activo completo (para IA / Campañas / etc.).
function getRubroActual() { return RubroActivo; }

// ── Aplicar colores sugeridos del rubro a los inputs ──
// Reutiliza _syncColorInput de industrias.js si está disponible;
// si no, escribe los inputs directamente (fallback sin dependencias).
function _aplicarColoresRubro(colores) {
  if (!colores) return;
  const set = (id, val) => {
    if (typeof _syncColorInput === 'function') { _syncColorInput(id, val); return; }
    const c = document.getElementById(id);          if (c) c.value = val;
    const t = document.getElementById(id + '-txt'); if (t) t.value = val;
  };
  set('color-principal', colores.principal);
  set('color-fondo',     colores.fondo);
  set('color-acento',    colores.acento);
}

// ── Aplicar un rubro a toda la app ──
// - guarda la selección
// - reutiliza la industria equivalente (placeholders/datos/prompt IA) si existe
// - aplica los colores sugeridos del rubro
// - deja RubroActivo listo (campañas + keywords + estilos) para la próxima etapa
function aplicarRubro(id, { forzarValores = false, regenerar = true } = {}) {
  const rubro = BUSINESS_TYPES[id];
  if (!rubro) return;

  RubroState.id = id;
  RubroActivo   = rubro;

  // Reutilizar la maquinaria de industrias.js cuando hay un equivalente:
  // trae placeholders, textos de ejemplo y el prompt de imagen ya definidos.
  if (rubro.industriaRef
      && typeof aplicarIndustria === 'function'
      && typeof INDUSTRIAS !== 'undefined'
      && INDUSTRIAS[rubro.industriaRef]) {
    aplicarIndustria(rubro.industriaRef, { forzarValores, regenerar: false });
  }

  // Los colores sugeridos del rubro tienen prioridad (se aplican después).
  _aplicarColoresRubro(rubro.colores);

  // Actualizar la descripción visible del selector.
  const hint = document.getElementById('rubro-descripcion');
  if (hint) hint.textContent = rubro.descripcion;

  // Refrescar los chips de campañas preparadas (visual, sin lógica todavía).
  renderCampanasPreparadas(rubro);

  // Refrescar el grid de campañas del nuevo rubro (js/campanas.js, si está cargado).
  if (typeof renderCampanas === 'function') renderCampanas();

  // Mantener la identidad de marca pegada por encima de los ejemplos del rubro
  // (js/brand-kit.js, si está cargado y hay marca guardada).
  if (typeof tieneBrand === 'function' && tieneBrand() && typeof aplicarBrandDatos === 'function') {
    aplicarBrandDatos();
  }

  if (regenerar && typeof generarFlyer === 'function') generarFlyer();
}

// ── Chips de campañas disponibles (preparado para la etapa Campañas) ──
function renderCampanasPreparadas(rubro) {
  const cont = document.getElementById('rubro-campanas');
  if (!cont) return;
  const lista = rubro?.campanas || [];
  if (!lista.length) { cont.innerHTML = ''; return; }
  cont.innerHTML =
    `<div class="campo-hint" style="margin-bottom:6px">Campañas disponibles para este rubro:</div>` +
    `<div style="display:flex;flex-wrap:wrap;gap:6px">` +
    lista.map(c =>
      `<span style="font-size:11px;padding:4px 10px;border-radius:999px;` +
      `background:var(--surface,rgba(255,255,255,.06));border:1px solid var(--border,rgba(255,255,255,.12));` +
      `opacity:.85">${c}</span>`
    ).join('') +
    `</div>`;
}

// ── Selector de rubro en el sidebar (tab Negocio) ──
function renderSelectorRubro() {
  const cont = document.getElementById('rubro-selector');
  if (!cont) return;
  const actual = RubroState.id;

  cont.innerHTML = `
    <div class="seccion-titulo">Rubro del negocio</div>
    <div class="campo">
      <select id="sel-rubro">
        ${Object.values(BUSINESS_TYPES).map(r =>
          `<option value="${r.id}" ${r.id === actual ? 'selected' : ''}>${r.icono} ${r.nombre}</option>`
        ).join('')}
      </select>
      <p class="campo-hint" id="rubro-descripcion"></p>
    </div>
    <div id="rubro-campanas" style="margin-top:8px"></div>`;

  document.getElementById('sel-rubro').addEventListener('change', e => {
    aplicarRubro(e.target.value, { forzarValores: true });
  });
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  renderSelectorRubro();
  // No regeneramos acá: el resto de los módulos aún se están inicializando.
  // app.js dispara el primer generarFlyer() al final del arranque.
  aplicarRubro(RubroState.id, { regenerar: false });
});
