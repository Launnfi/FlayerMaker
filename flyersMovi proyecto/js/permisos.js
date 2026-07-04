/* ══════════════════════════════════════════════════════
   PERMISOS.JS — Matriz de permisos por plan (fuente única)
   Compartido entre el servidor (Node/CommonJS) y el front
   (browser, como window.PERMISOS). NO duplicar esta tabla.
   ══════════════════════════════════════════════════════ */
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;            // Node: require('./js/permisos')
  } else {
    root.PERMISOS = api.PERMISOS;    // Browser: window.PERMISOS
    root.PERMISOS_API = api;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  // Plan activo: 'basico' | 'pro' | 'premium'
  const PERMISOS = {
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

  // Devuelve el valor del permiso `feature` para `plan`, o false si no aplica.
  function canUse(plan, feature) {
    const p = PERMISOS[plan];
    if (p && feature in p) return p[feature];
    return false;
  }

  return { PERMISOS, canUse };
});
