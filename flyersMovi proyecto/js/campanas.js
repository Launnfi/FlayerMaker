/* ══════════════════════════════════════════════════════
   CAMPANAS.JS — Sistema de CAMPAÑAS (capa sobre plantillas)

   Una campaña es un objetivo de comunicación concreto
   ("Menú del día", "Antes y después", "Delivery"). El usuario
   piensa en campañas, no en plantillas.

   Cada campaña define automáticamente:
     • distribución → reutiliza una PLANTILLA existente (su layout
                       y sus posiciones de ELEMENTOS_DEFECTO)
     • textos       → valores pre-cargados en los campos de esa plantilla
     • iconos       → ícono de la campaña (UI)
     • colores      → paleta sugerida (cae al color del rubro si no define)

   ▸ Las campañas están agrupadas por RUBRO (js/business-types.js).
   ▸ Reutiliza el motor de plantillas actual: NO toca render, editor
     ni los archivos templates/*. Sólo orquesta lo que ya existe.
   ▸ Agregar/editar campañas = tocar SÓLO este archivo.
   ══════════════════════════════════════════════════════ */

// Campañas por rubro. La clave es el id del rubro en BUSINESS_TYPES.
// Cada campaña: { id, nombre, icono, descripcion, plantilla, colores?, textos }
//   plantilla → id de una plantilla existente (define la distribución)
//   textos    → { 'c-xxx': valor }  se cargan en los inputs de esa plantilla
const CAMPANAS = {

  estetica: [
    { id: 'antes-despues', nombre: 'Antes y después', icono: '✨', descripcion: 'Mostrá resultados',
      plantilla: 'testimonio',
      colores: { principal: '#C4748A', fondo: '#1A1018', acento: '#D4A853' },
      textos: {
        'c-frase':   '"El cambio fue increíble,\nno lo puedo creer.\n¡Gracias totales!"',
        'c-cliente': 'Resultado real',
        'c-servicio':'Tratamiento facial',
        'c-estrellas':'5',
      } },
    { id: 'agenda-abierta', nombre: 'Agenda abierta', icono: '📅', descripcion: 'Turnos disponibles',
      plantilla: 'turnos',
      textos: {
        'c-titulo': '¡Agenda abierta!',
        'c-desc':   'Reservá tu turno\nesta semana\n¡Lugares limitados!',
        'c-cta':    'Escribinos por WhatsApp',
      },
      // El asistente sólo pide fecha y horario; construir() los mapea al layout.
      wizard: {
        campos: [
          { name: 'fecha',   label: 'Fecha',   placeholder: 'Esta semana', requerido: true },
          { name: 'horario', label: 'Horario', placeholder: '9 a 18 h' },
        ],
        construir: (v) => ({
          'c-desc': `Turnos: ${v.fecha || 'esta semana'}\nHorario: ${v.horario || 'a coordinar'}\n¡Reservá el tuyo!`,
        }),
      } },
    { id: 'nuevo-servicio', nombre: 'Nuevo servicio', icono: '🆕', descripcion: 'Lanzá una novedad',
      plantilla: 'nuevo-servicio',
      textos: {
        'c-titulo': 'Nuevo tratamiento',
        'c-desc':   'Resultados visibles\nDesde la primera sesión\nAgendá tu consulta',
        'c-precio': 'Desde $1.800',
        'c-badge':  '¡NUEVO!',
      },
      wizard: {
        campos: [
          { name: 'nombre',      label: 'Nombre',      placeholder: 'Ej: Limpieza facial', requerido: true },
          { name: 'descripcion', label: 'Descripción', tipo: 'textarea', placeholder: 'Beneficio principal\nSegundo beneficio' },
        ],
        construir: (v) => ({
          'c-titulo': v.nombre || 'Nuevo servicio',
          'c-desc':   v.descripcion || 'Agendá tu consulta',
        }),
      } },
    { id: 'sorteo', nombre: 'Sorteo', icono: '🎁', descripcion: 'Sorteá un premio',
      plantilla: 'promo',
      textos: { 'c-titulo': '¡SORTEO!', 'c-desc': 'Participá y ganá', 'c-precio': 'SORTEO' },
      wizard: {
        campos: [
          { name: 'premio', label: 'Premio', placeholder: 'Ej: Sesión completa', requerido: true },
          { name: 'fecha',  label: 'Fecha del sorteo', placeholder: 'Ej: 31/07' },
        ],
        construir: (v) => ({
          'c-titulo': `¡Sorteamos ${v.premio || 'un premio'}!`,
          'c-desc':   `Participá hasta el ${v.fecha || 'fin de mes'}\nSeguinos y comentá`,
          'c-precio': 'SORTEO',
        }),
      } },
  ],

  restaurante: [
    { id: 'menu-dia', nombre: 'Menú del día', icono: '📋', descripcion: 'Plato del día',
      plantilla: 'servicios',
      colores: { principal: '#C1440E', fondo: '#1B1210', acento: '#E9C46A' },
      textos: {
        'c-titulo':    'Menú del día',
        'c-servicios': 'Entrada + plato principal\nBebida incluida\nPostre del día\nCafé de cortesía',
      } },
    { id: 'delivery', nombre: 'Delivery', icono: '🛵', descripcion: 'Pedidos a domicilio',
      plantilla: 'promo',
      textos: {
        'c-titulo':  'Ahora con\nDelivery',
        'c-desc':    'Pedí y recibí en casa\nEnvío en 30 minutos',
        'c-precio':  'ENVÍO GRATIS',
      } },
    { id: 'promo', nombre: 'Promoción', icono: '💰', descripcion: 'Oferta gastronómica',
      plantilla: 'oferta-flash',
      textos: {
        'c-titulo':  '2x1 HOY',
        'c-precio':  '2x1',
        'c-hasta':   'Sólo esta noche',
        'c-desc':    'En platos seleccionados\n¡Reservá tu mesa!',
      } },
  ],

  barberia: [
    { id: 'promo-corte', nombre: 'Promo corte', icono: '💈', descripcion: 'Oferta de corte',
      plantilla: 'promo',
      textos: { 'c-titulo': 'Corte + Barba', 'c-desc': 'Combo completo\nReservá tu turno', 'c-precio': '20% OFF' } },
    { id: 'servicios', nombre: 'Servicios', icono: '✂️', descripcion: 'Menú de servicios',
      plantilla: 'servicios',
      textos: { 'c-titulo': 'Nuestros servicios', 'c-servicios': 'Corte clásico\nArreglo de barba\nAfeitado a navaja\nDiseño y color' } },
    { id: 'turnos', nombre: 'Turnos', icono: '📅', descripcion: 'Disponibilidad',
      plantilla: 'turnos',
      textos: { 'c-titulo': '¡Turnos abiertos!', 'c-desc': 'Reservá tu lugar\nesta semana', 'c-cta': 'Escribinos al WhatsApp' } },
  ],

  cafeteria: [
    { id: 'nuevo', nombre: 'Nuevo en carta', icono: '☕', descripcion: 'Producto nuevo',
      plantilla: 'nuevo-servicio',
      textos: { 'c-titulo': 'Nuevo en carta', 'c-desc': 'Café de especialidad\nHecho al momento\nProbalo hoy', 'c-precio': 'Desde $180', 'c-badge': '¡NUEVO!' } },
    { id: 'promo', nombre: 'Promo merienda', icono: '🥐', descripcion: 'Combo merienda',
      plantilla: 'promo',
      textos: { 'c-titulo': 'Combo merienda', 'c-desc': 'Café + medialunas\nTodas las tardes', 'c-precio': '$350' } },
    { id: 'frase', nombre: 'Frase / branding', icono: '✨', descripcion: 'Momento de marca',
      plantilla: 'frase',
      textos: { 'c-frase': '"Un buen café\nlo cambia todo"', 'c-subtitulo': 'Te esperamos' } },
  ],

  ropa: [
    { id: 'nueva-coleccion', nombre: 'Nueva colección', icono: '👗', descripcion: 'Lanzamiento',
      plantilla: 'nuevo-servicio',
      textos: { 'c-titulo': 'Nueva colección', 'c-desc': 'Temporada 2026\nYa disponible en tienda', 'c-precio': '', 'c-badge': 'NEW' } },
    { id: 'liquidacion', nombre: 'Liquidación', icono: '🏷️', descripcion: 'Oferta fuerte',
      plantilla: 'oferta-flash',
      textos: { 'c-titulo': 'LIQUIDACIÓN', 'c-precio': '50% OFF', 'c-hasta': 'Fin de temporada', 'c-desc': 'En prendas seleccionadas' } },
    { id: 'promo', nombre: 'Promoción', icono: '💰', descripcion: 'Descuento',
      plantilla: 'promo',
      textos: { 'c-titulo': '3x2', 'c-desc': 'Llevá 3 y pagá 2\nEn toda la tienda', 'c-precio': '3x2' } },
  ],

  veterinaria: [
    { id: 'vacunacion', nombre: 'Vacunación', icono: '💉', descripcion: 'Campaña de vacunas',
      plantilla: 'promo',
      textos: { 'c-titulo': 'Plan de\nvacunación', 'c-desc': 'Protegé a tu mascota\nTurnos disponibles', 'c-precio': '' } },
    { id: 'servicios', nombre: 'Servicios', icono: '🐾', descripcion: 'Menú de servicios',
      plantilla: 'servicios',
      textos: { 'c-titulo': 'Nuestros servicios', 'c-servicios': 'Consultas\nVacunación\nPeluquería canina\nUrgencias 24h' } },
    { id: 'turnos', nombre: 'Turnos', icono: '📅', descripcion: 'Agenda',
      plantilla: 'turnos',
      textos: { 'c-titulo': 'Pedí tu turno', 'c-desc': 'Atención con cita previa\n¡Escribinos!', 'c-cta': 'Reservá por WhatsApp' } },
  ],

  gimnasio: [
    { id: 'inscripcion', nombre: 'Inscripción abierta', icono: '💪', descripcion: 'Sumá socios',
      plantilla: 'promo',
      textos: { 'c-titulo': 'Inscripción\nabierta', 'c-desc': 'Empezá hoy tu cambio\nSin matrícula este mes', 'c-precio': 'MATRÍCULA $0' } },
    { id: 'promo-plan', nombre: 'Promo plan', icono: '🔥', descripcion: 'Oferta de plan',
      plantilla: 'oferta-flash',
      textos: { 'c-titulo': 'PROMO ANUAL', 'c-precio': '30% OFF', 'c-hasta': 'Sólo esta semana', 'c-desc': 'En el plan anual\n¡Aprovechá!' } },
    { id: 'clases', nombre: 'Clases', icono: '🏋️', descripcion: 'Grilla de clases',
      plantilla: 'servicios',
      textos: { 'c-titulo': 'Nuestras clases', 'c-servicios': 'Funcional\nSpinning\nMusculación\nEntrenamiento personal' } },
  ],

  taller: [
    { id: 'service', nombre: 'Service completo', icono: '🔧', descripcion: 'Promo de service',
      plantilla: 'promo',
      textos: { 'c-titulo': 'Service\ncompleto', 'c-desc': 'Revisión integral\nTurno en el día', 'c-precio': 'Desde $2.500' } },
    { id: 'servicios', nombre: 'Servicios', icono: '🛠️', descripcion: 'Menú de servicios',
      plantilla: 'servicios',
      textos: { 'c-titulo': 'Nuestros servicios', 'c-servicios': 'Service general\nCambio de neumáticos\nChapa y pintura\nDiagnóstico computarizado' } },
    { id: 'oferta', nombre: 'Oferta', icono: '🏷️', descripcion: 'Descuento',
      plantilla: 'oferta-flash',
      textos: { 'c-titulo': 'OFERTA', 'c-precio': '15% OFF', 'c-hasta': 'Este mes', 'c-desc': 'En cambio de aceite y filtros' } },
  ],

  inmobiliaria: [
    { id: 'nueva-propiedad', nombre: 'Nueva propiedad', icono: '🏠', descripcion: 'Publicá un inmueble',
      plantilla: 'nuevo-servicio',
      textos: { 'c-titulo': 'Nueva propiedad', 'c-desc': '3 ambientes\nExcelente ubicación\nConsultá por financiación', 'c-precio': 'Consultar', 'c-badge': 'EN VENTA' } },
    { id: 'promo', nombre: 'Oportunidad', icono: '💰', descripcion: 'Destacado',
      plantilla: 'promo',
      textos: { 'c-titulo': 'Oportunidad\núnica', 'c-desc': 'Precio de contado\n¡Coordiná tu visita!', 'c-precio': '' } },
    { id: 'servicios', nombre: 'Servicios', icono: '📋', descripcion: 'Qué ofrecés',
      plantilla: 'servicios',
      textos: { 'c-titulo': 'Nuestros servicios', 'c-servicios': 'Venta\nAlquiler\nTasaciones\nAdministración' } },
  ],

  celulares: [
    { id: 'oferta', nombre: 'Oferta flash', icono: '📱', descripcion: 'Precio destacado',
      plantilla: 'oferta-flash',
      textos: { 'c-titulo': 'OFERTA', 'c-precio': 'HASTA 40% OFF', 'c-hasta': 'Sólo hoy', 'c-desc': 'En celulares seleccionados' } },
    { id: 'reparacion', nombre: 'Reparación', icono: '🔧', descripcion: 'Servicio técnico',
      plantilla: 'promo',
      textos: { 'c-titulo': 'Reparamos\ntu celular', 'c-desc': 'Pantalla, batería y más\nEn el día', 'c-precio': '' } },
    { id: 'nuevo-ingreso', nombre: 'Nuevo ingreso', icono: '🆕', descripcion: 'Producto nuevo',
      plantilla: 'nuevo-servicio',
      textos: { 'c-titulo': 'Nuevo ingreso', 'c-desc': 'Últimos modelos\nFinanciación disponible', 'c-precio': 'Consultá', 'c-badge': '¡NUEVO!' } },
  ],

  informatica: [
    { id: 'service', nombre: 'Service PC', icono: '💻', descripcion: 'Servicio técnico',
      plantilla: 'promo',
      textos: { 'c-titulo': 'Service\nde PC', 'c-desc': 'Diagnóstico gratis\nMantenimiento y limpieza', 'c-precio': '' } },
    { id: 'armado', nombre: 'Armado a medida', icono: '🖥️', descripcion: 'PC gamer / trabajo',
      plantilla: 'nuevo-servicio',
      textos: { 'c-titulo': 'PC a medida', 'c-desc': 'Gamer y trabajo\nArmado según tu presupuesto', 'c-precio': 'Presupuesto sin cargo', 'c-badge': 'NUEVO' } },
    { id: 'servicios', nombre: 'Servicios', icono: '🛠️', descripcion: 'Qué ofrecés',
      plantilla: 'servicios',
      textos: { 'c-titulo': 'Nuestros servicios', 'c-servicios': 'Reparación\nArmado de PC\nRedes\nSoftware' } },
  ],

  pasteleria: [
    { id: 'por-encargo', nombre: 'Tortas por encargo', icono: '🎂', descripcion: 'Pedidos',
      plantilla: 'nuevo-servicio',
      textos: { 'c-titulo': 'Tortas por\nencargo', 'c-desc': 'Diseños personalizados\nPara toda ocasión\nHacé tu pedido', 'c-precio': 'Desde $900', 'c-badge': '🎂' } },
    { id: 'promo', nombre: 'Promoción', icono: '🧁', descripcion: 'Oferta dulce',
      plantilla: 'promo',
      textos: { 'c-titulo': 'Docena de\ncupcakes', 'c-desc': 'Recién horneados\nSabores a elección', 'c-precio': '$650' } },
    { id: 'delivery', nombre: 'Delivery', icono: '🛵', descripcion: 'A domicilio',
      plantilla: 'oferta-flash',
      textos: { 'c-titulo': 'DELIVERY', 'c-precio': 'ENVÍO GRATIS', 'c-hasta': 'Este fin de semana', 'c-desc': 'En pedidos desde $1.000' } },
  ],

};

// ── Estado de la campaña activa (persistido) ──
const CampanaState = {
  KEY: 'flyerstudio_campana',
  get id()  { try { return localStorage.getItem(this.KEY) || ''; } catch { return ''; } },
  set id(v) { try { localStorage.setItem(this.KEY, v || ''); } catch {} },
};

// Devuelve las campañas del rubro dado (o del rubro activo si no se pasa).
// Si el rubro no tiene campañas propias, deriva unas básicas de los ids de
// plantilla que declara BUSINESS_TYPES[rubro].campanas (fallback seguro).
function getCampanasDeRubro(rubroId) {
  const id = rubroId || (typeof RubroState !== 'undefined' ? RubroState.id : 'estetica');
  if (CAMPANAS[id]) return CAMPANAS[id];

  const rubro = (typeof BUSINESS_TYPES !== 'undefined') ? BUSINESS_TYPES[id] : null;
  const ids   = rubro?.campanas || [];
  const meta  = (typeof PLANTILLAS !== 'undefined')
    ? Object.fromEntries(PLANTILLAS.map(p => [p.id, p]))
    : {};
  return ids.map(pid => ({
    id: pid,
    nombre: meta[pid]?.nom || pid,
    icono:  meta[pid]?.ico || '📄',
    descripcion: meta[pid]?.desc || '',
    plantilla: pid,
    textos: {},
  }));
}

// ── Aplicar una campaña ──
// Orquesta el motor de plantillas existente. No reimplementa nada del render.
function aplicarCampana(camp) {
  if (!camp) return;
  CampanaState.id = camp.id;

  // 1. DISTRIBUCIÓN → seleccionar la plantilla base de la campaña.
  if (typeof State !== 'undefined') State.plantilla = camp.plantilla;

  // Sincronizar la UI de plantillas y reconstruir los campos de esa plantilla.
  if (typeof renderizarGridPlantillas === 'function') renderizarGridPlantillas();
  if (typeof cargarCamposPlantilla   === 'function') cargarCamposPlantilla(camp.plantilla);
  if (typeof initElementos           === 'function') initElementos(camp.plantilla);

  // 2. TEXTOS → precargar los valores de la campaña en los inputs recién creados.
  const textos = camp.textos || {};
  for (const inputId in textos) {
    const el = document.getElementById(inputId);
    if (el) el.value = textos[inputId];
  }

  // 3. COLORES → paleta de la campaña; si no define, usa la del rubro activo.
  const colores = camp.colores
    || (typeof getRubroActual === 'function' ? getRubroActual().colores : null);
  if (colores && typeof _aplicarColoresRubro === 'function') {
    _aplicarColoresRubro(colores);
  }

  // Marcar la campaña activa en el grid.
  document.querySelectorAll('.campana-btn').forEach(b =>
    b.classList.toggle('activa', b.dataset.campana === camp.id));

  // 4. RENDER.
  if (typeof generarFlyer === 'function') generarFlyer();
}

// ── Grid de campañas del rubro activo (tab Diseño) ──
// Reutiliza las clases .plantillas-grid / .plantilla-btn ya estilizadas.
function renderCampanas() {
  const grid = document.getElementById('campanas-grid');
  if (!grid) return;

  const camps  = getCampanasDeRubro();
  const activa = CampanaState.id;

  grid.innerHTML = camps.map(c => `
    <button class="plantilla-btn campana-btn ${c.id === activa ? 'activa' : ''}"
      data-campana="${c.id}" title="${c.descripcion}">
      <span class="pt-ico">${c.icono}</span>
      <span class="pt-nom">${c.nombre}</span>
      <span class="pt-desc">${c.descripcion}</span>
    </button>`).join('');

  grid.querySelectorAll('.campana-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const camp = getCampanasDeRubro().find(c => c.id === btn.dataset.campana);
      if (camp) aplicarCampana(camp);
    });
  });
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  renderCampanas();
});
