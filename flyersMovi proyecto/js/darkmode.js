/* ══════════════════════════════════
   DARKMODE.JS — Botón claro/oscuro del header
   Delega en el motor de temas (theme.js). El botón alterna
   entre los temas clásicos 'dark' y 'light'.
   ══════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('btn-darkmode');
  btn?.addEventListener('click', () => {
    const oscuro = (typeof esTemaOscuro === 'function') && esTemaOscuro(temaActual());
    if (typeof aplicarTema === 'function') aplicarTema(oscuro ? 'light' : 'dark');
  });
  if (typeof sincronizarIconoTema === 'function') sincronizarIconoTema();
});
