/* ══════════════════════════════════
   FORMATO.JS — Selector de formato/tamaño
   ══════════════════════════════════ */

const FORMATOS = [
  { id: 'cuadrado', ico: '⬜', nom: 'Post',   dim: '1080×1080', plan: 'basico' },
  { id: 'story',    ico: '📱', nom: 'Story',   dim: '1080×1920', plan: 'pro'    },
  { id: 'banner',   ico: '📺', nom: 'Banner',  dim: '1080×566',  plan: 'premium'},
];

function renderizarFormatosBtns() {
  const wrap = document.getElementById('formato-btns');
  if (!wrap) return;

  const niveles = { basico: 0, pro: 1, premium: 2 };
  const nivelActual = niveles[State.plan] || 0;

  wrap.innerHTML = FORMATOS.map(f => {
    const locked = niveles[f.plan] > nivelActual;
    const activo = State.formato === f.id;
    return `<button 
      class="formato-btn ${activo ? 'activo' : ''} ${locked ? 'locked' : ''}"
      data-formato="${f.id}"
      title="${locked ? 'Requiere plan ' + f.plan : f.dim}"
    >
      <span class="formato-ico">${f.ico}</span>
      <span class="formato-nom">${f.nom}${locked ? ' 🔒' : ''}</span>
      <span class="formato-dim">${f.dim}</span>
    </button>`;
  }).join('');

  wrap.querySelectorAll('.formato-btn:not(.locked)').forEach(btn => {
    btn.addEventListener('click', () => seleccionarFormato(btn));
  });

  wrap.querySelectorAll('.formato-btn.locked').forEach(btn => {
    btn.addEventListener('click', abrirModalPlanes);
  });
}

function seleccionarFormato(btn) {
  State.formato = btn.dataset.formato;
  document.querySelectorAll('.formato-btn').forEach(b => b.classList.remove('activo'));
  btn.classList.add('activo');
  actualizarPreviewLabel();
  generarFlyer();
}

document.addEventListener('DOMContentLoaded', renderizarFormatosBtns);
