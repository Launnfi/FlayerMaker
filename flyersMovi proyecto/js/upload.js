/* ══════════════════════════════════
   UPLOAD.JS — Logo + Imagen de fondo
   ══════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ── LOGO ──
  const logoInput = document.getElementById('logo-input');
  const logoWrap  = document.getElementById('logo-preview-wrap');
  const btnQuitarLogo = document.getElementById('btn-quitar-logo');

  logoInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    cargarImagen(file, (img, dataUrl) => {
      State.logoImg = img;
      logoWrap.innerHTML = `
        <img src="${dataUrl}" class="logo-preview-img" alt="Logo">
        <div class="upload-txt">Logo cargado ✓</div>
      `;
      btnQuitarLogo.style.display = '';
      generarFlyer();
    });
  });

  btnQuitarLogo?.addEventListener('click', () => {
    State.logoImg = null;
    logoInput.value = '';
    logoWrap.innerHTML = `
      <div class="upload-ico">✦</div>
      <div class="upload-txt">Subir logo</div>
      <div class="upload-hint">PNG, JPG · Recomendado fondo transparente</div>
    `;
    btnQuitarLogo.style.display = 'none';
    generarFlyer();
  });

  // Drag & Drop logo
  setupDragDrop('logo-drop', (file) => {
    cargarImagen(file, (img, dataUrl) => {
      State.logoImg = img;
      logoWrap.innerHTML = `
        <img src="${dataUrl}" class="logo-preview-img" alt="Logo">
        <div class="upload-txt">Logo cargado ✓</div>
      `;
      btnQuitarLogo.style.display = '';
      generarFlyer();
    });
  });

  // ── FONDO IMAGEN ──
  const fondoInput = document.getElementById('fondo-input');
  const fondoWrap  = document.getElementById('fondo-preview-wrap');
  const btnQuitarFondo = document.getElementById('btn-quitar-fondo');
  const fondoOpacidad  = document.getElementById('fondo-opacidad');
  const valOpacidad    = document.getElementById('val-opacidad');

  fondoInput?.addEventListener('change', (e) => {
    if (!State.canUse('fondoImagen')) {
      abrirModalPlanes();
      e.target.value = '';
      return;
    }
    const file = e.target.files[0];
    if (!file) return;
    cargarImagen(file, (img, dataUrl) => {
      State.fondoImg = img;
      fondoWrap.innerHTML = `
        <img src="${dataUrl}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;margin:0 auto 6px;display:block;" alt="Fondo">
        <div class="upload-txt">Imagen cargada ✓</div>
      `;
      btnQuitarFondo.style.display = '';
      State.fondoActivo = 'imagen';
      generarFlyer();
    });
  });

  btnQuitarFondo?.addEventListener('click', () => {
    State.fondoImg = null;
    fondoInput.value = '';
    fondoWrap.innerHTML = `
      <div class="upload-ico">🖼</div>
      <div class="upload-txt">Subir imagen de fondo</div>
      <div class="upload-hint">JPG, PNG · Se usará como fondo del flyer</div>
    `;
    btnQuitarFondo.style.display = 'none';
    State.fondoActivo = 'color';
    generarFlyer();
  });

  fondoOpacidad?.addEventListener('input', () => {
    if (valOpacidad) valOpacidad.textContent = fondoOpacidad.value + '%';
    generarFlyer();
  });

  setupDragDrop('fondo-drop', (file) => {
    if (!State.canUse('fondoImagen')) { abrirModalPlanes(); return; }
    cargarImagen(file, (img, dataUrl) => {
      State.fondoImg = img;
      fondoWrap.innerHTML = `
        <img src="${dataUrl}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;margin:0 auto 6px;display:block;" alt="Fondo">
        <div class="upload-txt">Imagen cargada ✓</div>
      `;
      btnQuitarFondo.style.display = '';
      State.fondoActivo = 'imagen';
      generarFlyer();
    });
  });
});

// ── Helpers ──
function cargarImagen(file, callback) {
  if (!file || !file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    const img = new Image();
    img.onload = () => callback(img, ev.target.result);
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

function setupDragDrop(dropZoneId, onDrop) {
  const zone = document.getElementById(dropZoneId);
  if (!zone) return;

  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.style.borderColor = 'var(--rosa)';
    zone.style.background  = 'var(--surface3)';
  });

  zone.addEventListener('dragleave', () => {
    zone.style.borderColor = '';
    zone.style.background  = '';
  });

  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.style.borderColor = '';
    zone.style.background  = '';
    const file = e.dataTransfer?.files[0];
    if (file) onDrop(file);
  });
}
