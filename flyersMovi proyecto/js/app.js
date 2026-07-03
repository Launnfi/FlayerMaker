/* ══════════════════════════════════
   APP.JS — Inicialización y event listeners globales
   ══════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Tabs del sidebar ──
  document.querySelectorAll('.stab').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.dataset.tab;

      document.querySelectorAll('.stab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      document.getElementById('tab-' + tabId)?.classList.add('active');
    });
  });

  // ── Inputs globales del negocio (auto-render) ──
  const inputsNegocio = ['inp-negocio','inp-slogan','inp-tel','inp-ig','inp-dir','inp-web'];
  inputsNegocio.forEach(id => {
    document.getElementById(id)?.addEventListener('input', () => generarFlyer());
  });

  // ── Botones principales ──
  document.getElementById('btn-generar')?.addEventListener('click', () => generarFlyer());
  document.getElementById('btn-descargar')?.addEventListener('click', () => descargarFlyer());

  // ── Zoom ──
  document.getElementById('btn-zoom-in')?.addEventListener('click', () => {
    State.zoom = Math.min(1.5, +(State.zoom + .1).toFixed(1));
    actualizarZoomUI();
    generarFlyer();
  });

  document.getElementById('btn-zoom-out')?.addEventListener('click', () => {
    State.zoom = Math.max(0.2, +(State.zoom - .1).toFixed(1));
    actualizarZoomUI();
    generarFlyer();
  });

  // ── Teclado: Ctrl+Enter = generar ──
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      generarFlyer();
    }
    if (e.key === 'Escape') {
      cerrarModalPlanes();
      cerrarHistorial();
      cerrarPreviewIG();
    }
  });

  // ── Render inicial ──
  actualizarPreviewLabel();
  actualizarLockUI();

  // Inicializar posiciones del editor con la plantilla por defecto
  if (typeof initElementos === 'function') {
    initElementos(State.plantilla);
  }

  generarFlyer();

  console.log('%c✦ FlyerStudio cargado correctamente', 'color:#C4748A;font-weight:700;font-size:14px');
});

function actualizarZoomUI() {
  const val = document.getElementById('zoom-val');
  if (val) val.textContent = Math.round(State.zoom * 100) + '%';
}
