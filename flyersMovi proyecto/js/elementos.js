/* ══════════════════════════════════
   ELEMENTOS.JS — Estado de elementos arrastrables por plantilla

   Cada elemento tiene:
     id        — identificador único
     tipo      — 'logo' | 'texto' | 'badge' | 'footer' | 'decoracion'
     label     — nombre legible para la UI
     x, y      — posición en coordenadas del canvas (0-1080 o según formato)
     escala    — factor de escala (1 = tamaño original)
     rotacion  — ángulo en radianes
     visible   — boolean
     locked    — no se puede mover (decoraciones fijas opcionales)
   ══════════════════════════════════ */

const ElementosState = {
  elementos: [],          // Lista de elementos de la plantilla actual
  seleccionado: null,     // id del elemento seleccionado
  modoEditor: false,      // true = modo edición activo

  getById(id) {
    return this.elementos.find(e => e.id === id) || null;
  },

  setPos(id, x, y) {
    const el = this.getById(id);
    if (el) { el.x = x; el.y = y; }
  },

  setEscala(id, escala) {
    const el = this.getById(id);
    if (el) el.escala = Math.max(0.1, Math.min(5, escala));
  },

  setRotacion(id, rad) {
    const el = this.getById(id);
    if (el) el.rotacion = rad;
  },

  // Devuelve el estilo de fondo del elemento (con defaults)
  getFondo(id) {
    const el = this.getById(id);
    return el?.fondo || { tipo: 'ninguno' };
  },

  setFondo(id, fondo) {
    const el = this.getById(id);
    if (el) el.fondo = { ...el.fondo, ...fondo };
  },

  resetear() {
    this.elementos.forEach(el => {
      el.x        = el._origX;
      el.y        = el._origY;
      el.escala   = el._origEscala;
      el.rotacion = el._origRotacion;
      el.fondo    = { tipo: 'ninguno' };  // resetear fondo también
    });
    this.seleccionado = null;
  },
};

// ── Posiciones por defecto para cada plantilla ──
// Las coordenadas son para canvas 1080x1080 (se escalan para otros formatos)

const ELEMENTOS_DEFECTO = {
  promo: (W, H) => [
    { id: 'logo',       tipo: 'logo',       label: 'Logo',           x: W/2,    y: H*.14,  escala: 1, rotacion: 0 },
    { id: 'negocio',    tipo: 'texto',      label: 'Nombre',         x: W/2,    y: H*.30,  escala: 1, rotacion: 0 },
    { id: 'slogan',     tipo: 'texto',      label: 'Slogan',         x: W/2,    y: H*.36,  escala: 1, rotacion: 0 },
    { id: 'titulo',     tipo: 'texto',      label: 'Título promo',   x: W*.14,  y: H*.52,  escala: 1, rotacion: 0 },
    { id: 'badge',      tipo: 'badge',      label: 'Badge precio',   x: W*.73,  y: H*.56,  escala: 1, rotacion: 0 },
    { id: 'descripcion',tipo: 'texto',      label: 'Descripción',    x: W*.1,   y: H*.72,  escala: 1, rotacion: 0 },
    { id: 'footer',     tipo: 'footer',     label: 'Pie de página',  x: W/2,    y: H*.95,  escala: 1, rotacion: 0 },
  ],
  servicios: (W, H) => [
    { id: 'logo',       tipo: 'logo',       label: 'Logo',           x: W*.13,  y: H*.12,  escala: 1, rotacion: 0 },
    { id: 'negocio',    tipo: 'texto',      label: 'Nombre',         x: W*.42,  y: H*.12,  escala: 1, rotacion: 0 },
    { id: 'titulo',     tipo: 'texto',      label: 'Título',         x: W/2,    y: H*.28,  escala: 1, rotacion: 0 },
    { id: 'lista',      tipo: 'texto',      label: 'Servicios',      x: W*.12,  y: H*.40,  escala: 1, rotacion: 0 },
    { id: 'footer',     tipo: 'footer',     label: 'Pie de página',  x: W/2,    y: H*.95,  escala: 1, rotacion: 0 },
  ],
  turnos: (W, H) => [
    { id: 'logo',       tipo: 'logo',       label: 'Logo',           x: W/2,    y: H*.10,  escala: 1, rotacion: 0 },
    { id: 'negocio',    tipo: 'texto',      label: 'Nombre',         x: W/2,    y: H*.22,  escala: 1, rotacion: 0 },
    { id: 'titulo',     tipo: 'texto',      label: 'Título',         x: W/2,    y: H*.50,  escala: 1, rotacion: 0 },
    { id: 'descripcion',tipo: 'texto',      label: 'Descripción',    x: W/2,    y: H*.62,  escala: 1, rotacion: 0 },
    { id: 'cta',        tipo: 'badge',      label: 'Botón CTA',      x: W/2,    y: H*.74,  escala: 1, rotacion: 0 },
    { id: 'footer',     tipo: 'footer',     label: 'Pie de página',  x: W/2,    y: H*.95,  escala: 1, rotacion: 0 },
  ],
  frase: (W, H) => [
    { id: 'logo',       tipo: 'logo',       label: 'Logo',           x: W/2,    y: H*.14,  escala: 1, rotacion: 0 },
    { id: 'negocio',    tipo: 'texto',      label: 'Nombre',         x: W/2,    y: H*.24,  escala: 1, rotacion: 0 },
    { id: 'frase',      tipo: 'texto',      label: 'Frase',          x: W/2,    y: H*.50,  escala: 1, rotacion: 0 },
    { id: 'subtitulo',  tipo: 'texto',      label: 'Subtítulo',      x: W/2,    y: H*.72,  escala: 1, rotacion: 0 },
    { id: 'footer',     tipo: 'footer',     label: 'Pie de página',  x: W/2,    y: H*.95,  escala: 1, rotacion: 0 },
  ],
  'nuevo-servicio': (W, H) => [
    { id: 'badge',      tipo: 'badge',      label: 'Badge',          x: W*.22,  y: H*.10,  escala: 1, rotacion: 0 },
    { id: 'logo',       tipo: 'logo',       label: 'Logo',           x: W*.13,  y: H*.22,  escala: 1, rotacion: 0 },
    { id: 'negocio',    tipo: 'texto',      label: 'Nombre',         x: W*.38,  y: H*.22,  escala: 1, rotacion: 0 },
    { id: 'titulo',     tipo: 'texto',      label: 'Nombre servicio',x: W*.1,   y: H*.50,  escala: 1, rotacion: 0 },
    { id: 'descripcion',tipo: 'texto',      label: 'Descripción',    x: W*.1,   y: H*.66,  escala: 1, rotacion: 0 },
    { id: 'precio',     tipo: 'badge',      label: 'Precio',         x: W*.2,   y: H*.80,  escala: 1, rotacion: 0 },
    { id: 'footer',     tipo: 'footer',     label: 'Pie de página',  x: W/2,    y: H*.95,  escala: 1, rotacion: 0 },
  ],
  'oferta-flash': (W, H) => [
    { id: 'logo',       tipo: 'logo',       label: 'Logo',           x: W/2,    y: H*.12,  escala: 1, rotacion: 0 },
    { id: 'negocio',    tipo: 'texto',      label: 'Nombre',         x: W/2,    y: H*.24,  escala: 1, rotacion: 0 },
    { id: 'titulo',     tipo: 'texto',      label: 'Título',         x: W/2,    y: H*.42,  escala: 1, rotacion: 0 },
    { id: 'descuento',  tipo: 'badge',      label: 'Descuento',      x: W/2,    y: H*.54,  escala: 1, rotacion: 0 },
    { id: 'hasta',      tipo: 'badge',      label: 'Duración',       x: W/2,    y: H*.74,  escala: 1, rotacion: 0 },
    { id: 'descripcion',tipo: 'texto',      label: 'Descripción',    x: W/2,    y: H*.85,  escala: 1, rotacion: 0 },
    { id: 'footer',     tipo: 'footer',     label: 'Pie de página',  x: W/2,    y: H*.95,  escala: 1, rotacion: 0 },
  ],
  navidad: (W, H) => [
    { id: 'logo',       tipo: 'logo',       label: 'Logo',           x: W/2,    y: H*.13,  escala: 1, rotacion: 0 },
    { id: 'negocio',    tipo: 'texto',      label: 'Nombre',         x: W/2,    y: H*.26,  escala: 1, rotacion: 0 },
    { id: 'titulo',     tipo: 'texto',      label: 'Saludo',         x: W/2,    y: H*.48,  escala: 1, rotacion: 0 },
    { id: 'descripcion',tipo: 'texto',      label: 'Mensaje + firma',x: W/2,    y: H*.65,  escala: 1, rotacion: 0 },
    { id: 'footer',     tipo: 'footer',     label: 'Pie de página',  x: W/2,    y: H*.95,  escala: 1, rotacion: 0 },
  ],
  testimonio: (W, H) => [
    { id: 'logo',       tipo: 'logo',       label: 'Logo',           x: W/2,    y: H*.11,  escala: 1, rotacion: 0 },
    { id: 'negocio',    tipo: 'texto',      label: 'Nombre',         x: W/2,    y: H*.22,  escala: 1, rotacion: 0 },
    { id: 'frase',      tipo: 'texto',      label: 'Testimonio',     x: W/2,    y: H*.48,  escala: 1, rotacion: 0 },
    { id: 'cliente',    tipo: 'texto',      label: 'Cliente',        x: W/2,    y: H*.72,  escala: 1, rotacion: 0 },
    { id: 'footer',     tipo: 'footer',     label: 'Pie de página',  x: W/2,    y: H*.95,  escala: 1, rotacion: 0 },
  ],
  'dia-madre': (W, H) => [
    { id: 'logo',       tipo: 'logo',       label: 'Logo',           x: W/2,    y: H*.16,  escala: 1, rotacion: 0 },
    { id: 'negocio',    tipo: 'texto',      label: 'Nombre',         x: W/2,    y: H*.28,  escala: 1, rotacion: 0 },
    { id: 'titulo',     tipo: 'texto',      label: 'Título',         x: W/2,    y: H*.52,  escala: 1, rotacion: 0 },
    { id: 'descripcion',tipo: 'texto',      label: 'Mensaje',        x: W/2,    y: H*.65,  escala: 1, rotacion: 0 },
    { id: 'oferta',     tipo: 'badge',      label: 'Oferta',         x: W/2,    y: H*.78,  escala: 1, rotacion: 0 },
    { id: 'footer',     tipo: 'footer',     label: 'Pie de página',  x: W/2,    y: H*.95,  escala: 1, rotacion: 0 },
  ],
  minimalista: (W, H) => [
    { id: 'logo',       tipo: 'logo',       label: 'Logo',           x: W/2,    y: H*.26,  escala: 1, rotacion: 0 },
    { id: 'negocio',    tipo: 'texto',      label: 'Nombre',         x: W/2,    y: H*.38,  escala: 1, rotacion: 0 },
    { id: 'titulo',     tipo: 'texto',      label: 'Título',         x: W/2,    y: H*.52,  escala: 1, rotacion: 0 },
    { id: 'subtitulo',  tipo: 'texto',      label: 'Subtexto',       x: W/2,    y: H*.62,  escala: 1, rotacion: 0 },
    { id: 'cta',        tipo: 'texto',      label: 'CTA',            x: W/2,    y: H*.78,  escala: 1, rotacion: 0 },
  ],
  luxury: (W, H) => [
    { id: 'logo',       tipo: 'logo',       label: 'Logo',           x: W/2,    y: H*.15,  escala: 1, rotacion: 0 },
    { id: 'negocio',    tipo: 'texto',      label: 'Nombre',         x: W/2,    y: H*.28,  escala: 1, rotacion: 0 },
    { id: 'titulo',     tipo: 'texto',      label: 'Título',         x: W/2,    y: H*.52,  escala: 1, rotacion: 0 },
    { id: 'descripcion',tipo: 'texto',      label: 'Descripción',    x: W/2,    y: H*.66,  escala: 1, rotacion: 0 },
    { id: 'precio',     tipo: 'texto',      label: 'Precio',         x: W/2,    y: H*.77,  escala: 1, rotacion: 0 },
  ],
  verano: (W, H) => [
    { id: 'logo',       tipo: 'logo',       label: 'Logo',           x: W/2,    y: H*.12,  escala: 1, rotacion: 0 },
    { id: 'negocio',    tipo: 'texto',      label: 'Nombre',         x: W/2,    y: H*.22,  escala: 1, rotacion: 0 },
    { id: 'titulo',     tipo: 'texto',      label: 'Título',         x: W/2,    y: H*.50,  escala: 1, rotacion: 0 },
    { id: 'descripcion',tipo: 'texto',      label: 'Descripción',    x: W/2,    y: H*.64,  escala: 1, rotacion: 0 },
    { id: 'cta',        tipo: 'badge',      label: 'CTA',            x: W/2,    y: H*.78,  escala: 1, rotacion: 0 },
    { id: 'footer',     tipo: 'footer',     label: 'Pie de página',  x: W/2,    y: H*.95,  escala: 1, rotacion: 0 },
  ],
};

function initElementos(plantillaId) {
  const { w: W, h: H } = State.getCanvasSize();
  const fn = ELEMENTOS_DEFECTO[plantillaId];
  const lista = fn ? fn(W, H) : [];

  // Guardar valores originales para reset
  ElementosState.elementos = lista.map(el => ({
    ...el,
    _origX:        el.x,
    _origY:        el.y,
    _origEscala:   el.escala,
    _origRotacion: el.rotacion,
  }));
  ElementosState.seleccionado = null;
}

function getPosElemento(id) {
  return ElementosState.getById(id);
}
