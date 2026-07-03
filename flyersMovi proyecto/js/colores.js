/* ══════════════════════════════════
   COLORES.JS — Pickers + paleta rápida
   ══════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  // Sincronizar color picker ↔ text input
  const sincPares = [
    ['color-principal', 'color-principal-txt'],
    ['color-fondo',     'color-fondo-txt'],
    ['color-acento',    'color-acento-txt'],
  ];

  sincPares.forEach(([pickerId, textId]) => {
    const picker = document.getElementById(pickerId);
    const texto  = document.getElementById(textId);
    if (!picker || !texto) return;

    picker.addEventListener('input', () => {
      texto.value = picker.value;
      generarFlyer();
    });

    texto.addEventListener('input', () => {
      if (/^#[0-9A-Fa-f]{6}$/.test(texto.value)) {
        picker.value = texto.value;
        generarFlyer();
      }
    });
  });

  // Paleta rápida
  document.querySelectorAll('.paleta-color').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const val      = btn.dataset.val;
      const picker   = document.getElementById(targetId);
      const texto    = document.getElementById(targetId + '-txt');
      if (picker) picker.value = val;
      if (texto)  texto.value  = val;
      generarFlyer();
    });
  });

  // Tabs de fondo (color / imagen / IA)
  document.querySelectorAll('.ftab').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.ftab;

      // Verificar permisos para imagen e IA
      if ((tab === 'imagen' || tab === 'ia') && !State.canUse('fondoImagen')) {
        abrirModalPlanes();
        return;
      }

      document.querySelectorAll('.ftab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      document.querySelectorAll('.ftab-panel').forEach(p => p.classList.remove('active'));
      document.getElementById('ftab-' + tab)?.classList.add('active');

      State.fondoActivo = tab;
      generarFlyer();
    });
  });
});
