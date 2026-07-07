/* ══════════════════════════════════════════════════════
   RESPONSIVE.JS — Detección de dispositivo + flujo mobile

   Setea document.body.dataset.mode = "mobile|tablet|desktop"
   según el ancho. El CSS (css/responsive.css) hace el resto.

   Breakpoints:
     mobile  < 768px
     tablet  768–1024px
     desktop > 1024px

   En mobile: si no hay una creación en curso, abre el asistente
   automáticamente (única vía de inicio en el teléfono).

   NO toca render, editor, plantillas ni IDs. Solo lee el ancho
   y llama a abrirAsistente() (API pública ya existente).
   ══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  function detectarModo() {
    var w = window.innerWidth || document.documentElement.clientWidth;
    if (w < 768) return 'mobile';
    if (w <= 1024) return 'tablet';
    return 'desktop';
  }

  var _autoAsistenteHecho = false;

  // Abre el asistente en mobile si no hay nada abierto ni una creación activa.
  function _maybeAutoAsistente() {
    if (_autoAsistenteHecho) return;
    if (typeof abrirAsistente !== 'function') return;

    var modal = document.getElementById('modal-asistente');
    var yaAbierto = modal && modal.style.display === 'flex';
    if (yaAbierto) { _autoAsistenteHecho = true; return; }

    // "Estado activo" = el usuario ya generó/está editando algo en esta sesión.
    var hayEstado = false;
    try { hayEstado = sessionStorage.getItem('fs_creacion_activa') === '1'; } catch (e) {}
    if (hayEstado) return;

    _autoAsistenteHecho = true;
    abrirAsistente();
  }

  function aplicarModo() {
    var modo = detectarModo();
    if (document.body.dataset.mode !== modo) {
      document.body.dataset.mode = modo;
    }
    if (modo === 'mobile') {
      _maybeAutoAsistente();
    } else {
      // Al pasar a tablet/desktop permitimos que un futuro regreso a mobile
      // vuelva a evaluar el auto-asistente.
      _autoAsistenteHecho = false;
      cerrarPanel(); // el drawer no debe quedar "abierto" fuera de mobile
    }
  }

  // ── Drawer del sidebar en mobile ──
  // El sidebar existe siempre en el DOM; en mobile se muestra como panel
  // deslizante. Inyectamos FAB (abrir), backdrop y botón cerrar sin tocar IDs.
  function abrirPanel()  { document.body.classList.add('sidebar-open'); }
  function cerrarPanel() { document.body.classList.remove('sidebar-open'); }
  function togglePanel() { document.body.classList.toggle('sidebar-open'); }

  function montarDrawerUI() {
    if (document.getElementById('fs-panel-toggle')) return; // ya montado

    // FAB para abrir/cerrar el panel lateral
    var fab = document.createElement('button');
    fab.id = 'fs-panel-toggle';
    fab.className = 'fs-panel-toggle';
    fab.type = 'button';
    fab.setAttribute('aria-label', 'Abrir panel de edición');
    fab.innerHTML = '✎ Editar';
    fab.addEventListener('click', togglePanel);
    document.body.appendChild(fab);

    // Backdrop: cerrar al tocar fuera
    var backdrop = document.createElement('div');
    backdrop.className = 'fs-sidebar-backdrop';
    backdrop.addEventListener('click', cerrarPanel);
    document.body.appendChild(backdrop);

    // Botón cerrar dentro del sidebar (arriba de todo)
    var sidebar = document.getElementById('sidebar');
    if (sidebar && !sidebar.querySelector('.fs-panel-cerrar')) {
      var cerrar = document.createElement('button');
      cerrar.className = 'fs-panel-cerrar';
      cerrar.type = 'button';
      cerrar.innerHTML = '✕ Cerrar panel';
      cerrar.addEventListener('click', cerrarPanel);
      sidebar.insertBefore(cerrar, sidebar.firstChild);
    }

    // Cerrar el drawer cuando el usuario dispara una generación (ver el flyer).
    document.addEventListener('click', function (e) {
      var t = e.target;
      if (t && t.closest && t.closest('#asis-generar,#btn-generar')) cerrarPanel();
    }, true);
  }

  // Marca que hay una creación activa (evita reabrir el asistente sobre el preview).
  // Se dispara cuando el usuario genera desde el asistente (botón id="asis-generar")
  // o desde el botón principal de generar.
  function _marcarCreacionActiva() {
    try { sessionStorage.setItem('fs_creacion_activa', '1'); } catch (e) {}
    _autoAsistenteHecho = true;
  }
  // Delegación global: cualquier click en generar marca estado activo.
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t) return;
    var id = t.id || (t.closest && t.closest('#asis-generar,#btn-generar') && 'gen');
    if (id === 'asis-generar' || id === 'btn-generar' || id === 'gen') {
      _marcarCreacionActiva();
    }
  }, true);

  // Reaccionar a cambios de tamaño / rotación con un pequeño debounce.
  var _t;
  function _onResize() {
    clearTimeout(_t);
    _t = setTimeout(aplicarModo, 150);
  }

  window.addEventListener('resize', _onResize);
  window.addEventListener('orientationchange', _onResize);

  // Aplicar en cuanto el DOM esté listo (por si el inline temprano falló).
  function _init() { montarDrawerUI(); aplicarModo(); }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _init);
  } else {
    _init();
  }
})();
