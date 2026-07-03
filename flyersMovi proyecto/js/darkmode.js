/* ══════════════════════════════════
   DARKMODE.JS — Toggle modo oscuro/claro
   ══════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  const btn       = document.getElementById('btn-darkmode');
  const iconDark  = document.getElementById('icon-dark');
  const iconLight = document.getElementById('icon-light');
  const html      = document.documentElement;

  // Cargar preferencia guardada
  const saved = localStorage.getItem('flyerstudio_theme');
  if (saved) {
    html.setAttribute('data-theme', saved);
    State.darkMode = saved === 'dark';
    actualizarIcono();
  }

  btn?.addEventListener('click', () => {
    State.darkMode = !State.darkMode;
    const theme = State.darkMode ? 'dark' : 'light';
    html.setAttribute('data-theme', theme);
    localStorage.setItem('flyerstudio_theme', theme);
    actualizarIcono();
  });

  function actualizarIcono() {
    if (!iconDark || !iconLight) return;
    if (State.darkMode) {
      iconDark.style.display  = '';
      iconLight.style.display = 'none';
    } else {
      iconDark.style.display  = 'none';
      iconLight.style.display = '';
    }
  }
});
