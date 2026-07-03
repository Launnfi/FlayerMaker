/* ══════════════════════════════════
   PREVIEW-IG.JS — Simulador feed Instagram
   ══════════════════════════════════ */

function abrirPreviewIG() {
  generarFlyer();

  const mainCanvas = document.getElementById('flyer-canvas');
  const igCanvas   = document.getElementById('ig-canvas');
  if (!igCanvas || !mainCanvas) return;

  // Dimensiones del mockup (siempre cuadrado en el feed)
  const SIZE = 540;
  igCanvas.width  = SIZE;
  igCanvas.height = SIZE;

  const ctx   = igCanvas.getContext('2d');
  const { w: W, h: H } = State.getCanvasSize();

  // Escalar el flyer al cuadrado del mockup (crop centrado)
  const scale = Math.max(SIZE/W, SIZE/H);
  const sw    = W * scale;
  const sh    = H * scale;
  const sx    = (SIZE - sw) / 2;
  const sy    = (SIZE - sh) / 2;

  ctx.clearRect(0, 0, SIZE, SIZE);
  ctx.drawImage(mainCanvas, sx, sy, sw, sh);

  // Actualizar datos del mockup
  const datos = State.getDatos();
  const igUser = (datos.ig || datos.negocio || 'tuestética')
    .replace('@','').toLowerCase().replace(/\s+/g,'.');

  const igUsername  = document.getElementById('ig-username');
  const igCapUser   = document.getElementById('ig-cap-user');
  const igLoc       = document.getElementById('ig-loc');
  const igAvatar    = document.getElementById('ig-avatar');

  if (igUsername)  igUsername.textContent  = '@' + igUser;
  if (igCapUser)   igCapUser.textContent   = igUser;
  if (igLoc && datos.dir) igLoc.textContent = datos.dir;
  else if (igLoc)  igLoc.textContent = '';

  // Avatar: si hay logo, dibujarlo
  if (igAvatar) {
    if (State.logoImg) {
      const ac = document.createElement('canvas');
      ac.width = ac.height = 72;
      const actx = ac.getContext('2d');
      actx.beginPath();
      actx.arc(36,36,36,0,Math.PI*2);
      actx.clip();
      actx.drawImage(State.logoImg, 0, 0, 72, 72);
      igAvatar.innerHTML = `<img src="${ac.toDataURL()}" style="width:100%;height:100%;border-radius:50%;">`;
    } else {
      igAvatar.innerHTML = '';
      igAvatar.style.background = `linear-gradient(135deg, ${document.getElementById('color-principal')?.value||'#C4748A'}, ${document.getElementById('color-acento')?.value||'#D4A853'})`;
    }
  }

  document.getElementById('modal-ig').style.display = 'flex';
}

function cerrarPreviewIG() {
  document.getElementById('modal-ig').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-preview-ig')?.addEventListener('click', abrirPreviewIG);
  document.getElementById('modal-ig-close')?.addEventListener('click', cerrarPreviewIG);
  document.getElementById('modal-ig')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) cerrarPreviewIG();
  });
});
