/* ══════════════════════════════════
   STATE.JS — Estado global de la app
   ══════════════════════════════════ */

const State = {
  // Plan activo: 'basico' | 'pro' | 'premium'
  plan: 'basico',

  // Recursos cargados
  logoImg: null,
  fondoImg: null,
  fondoIA: null,   // ImageData o null generado por IA

  // Configuración actual
  plantilla: 'promo',
  formato: 'cuadrado',  // 'cuadrado' | 'story' | 'banner'
  fuente: 'playfair',

  // Zoom del canvas
  zoom: 0.5,

  // Modo UI
  darkMode: true,

  // Fondo activo: 'color' | 'imagen' | 'ia'
  fondoActivo: 'color',

  // Helpers
  getCanvasSize() {
    const formatos = {
      cuadrado: { w: 1080, h: 1080 },
      story:    { w: 1080, h: 1920 },
      banner:   { w: 1080, h:  566 },
    };
    return formatos[this.formato] || formatos.cuadrado;
  },

  getColores() {
    return {
      principal: document.getElementById('color-principal')?.value || '#C4748A',
      fondo:     document.getElementById('color-fondo')?.value     || '#1A1018',
      acento:    document.getElementById('color-acento')?.value    || '#D4A853',
    };
  },

  getDatos() {
    return {
      negocio: document.getElementById('inp-negocio')?.value || '',
      slogan:  document.getElementById('inp-slogan')?.value  || '',
      tel:     document.getElementById('inp-tel')?.value     || '',
      ig:      document.getElementById('inp-ig')?.value      || '',
      dir:     document.getElementById('inp-dir')?.value     || '',
      web:     document.getElementById('inp-web')?.value     || '',
    };
  },

  canUse(feature) {
    const permisos = {
      basico: {
        plantillas:    ['promo','servicios','turnos','frase'],
        fuentes:       ['playfair'],
        formatos:      ['cuadrado'],
        colorAcento:   false,
        fondoImagen:   false,
        fondoIA:       false,
        historial:     false,
        sitioWeb:      false,
        maxHistorial:  0,
        fondosIAMes:   0,
      },
      pro: {
        plantillas:    ['promo','servicios','turnos','frase','nuevo-servicio','oferta-flash','navidad','testimonio'],
        fuentes:       ['playfair','montserrat','cormorant','raleway','lato','dm-sans'],
        formatos:      ['cuadrado','story'],
        colorAcento:   true,
        fondoImagen:   true,
        fondoIA:       true,
        historial:     true,
        sitioWeb:      true,
        maxHistorial:  20,
        fondosIAMes:   5,
      },
      premium: {
        plantillas:    ['promo','servicios','turnos','frase','nuevo-servicio','oferta-flash','navidad','testimonio','dia-madre','minimalista','luxury','verano'],
        fuentes:       ['playfair','montserrat','cormorant','raleway','lato','dm-sans'],
        formatos:      ['cuadrado','story','banner'],
        colorAcento:   true,
        fondoImagen:   true,
        fondoIA:       true,
        historial:     true,
        sitioWeb:      true,
        maxHistorial:  Infinity,
        fondosIAMes:   Infinity,
      },
    };
    const p = permisos[this.plan];
    if (feature in p) return p[feature];
    return false;
  },
};
