/* ══════════════════════════════════
   FUENTES.JS — Selector de tipografías
   ══════════════════════════════════ */

const FUENTES = [
  { id: 'playfair',   nom: 'Playfair',    muestra: 'Aa', estilo: `font-family:'Playfair Display',serif;font-style:italic`,   plan: 'basico' },
  { id: 'montserrat', nom: 'Montserrat',  muestra: 'Aa', estilo: `font-family:'Montserrat',sans-serif;font-weight:700`,       plan: 'pro'    },
  { id: 'cormorant',  nom: 'Cormorant',   muestra: 'Aa', estilo: `font-family:'Cormorant Garamond',serif;font-style:italic`,  plan: 'pro'    },
  { id: 'raleway',    nom: 'Raleway',     muestra: 'Aa', estilo: `font-family:'Raleway',sans-serif;font-weight:300`,          plan: 'pro'    },
  { id: 'lato',       nom: 'Lato',        muestra: 'Aa', estilo: `font-family:'Lato',sans-serif;font-weight:700`,             plan: 'pro'    },
  { id: 'dm-sans',    nom: 'DM Sans',     muestra: 'Aa', estilo: `font-family:'DM Sans',sans-serif;font-weight:400`,          plan: 'pro'    },
];

function renderizarFuentesGrid() {
  const grid = document.getElementById('fuentes-grid');
  if (!grid) return;

  const niveles = { basico: 0, pro: 1, premium: 2 };
  const nivelActual = niveles[State.plan] || 0;

  grid.innerHTML = FUENTES.map(f => {
    const locked = niveles[f.plan] > nivelActual;
    const activa = State.fuente === f.id;
    return `<button 
      class="fuente-btn ${activa ? 'activa' : ''} ${locked ? 'locked' : ''}"
      data-fuente="${f.id}"
      title="${locked ? 'Requiere plan Pro' : f.nom}"
    >
      <span class="fuente-muestra" style="${f.estilo}">${f.muestra}</span>
      <span class="fuente-nom">${f.nom}${locked ? ' 🔒' : ''}</span>
    </button>`;
  }).join('');

  grid.querySelectorAll('.fuente-btn:not(.locked)').forEach(btn => {
    btn.addEventListener('click', () => seleccionarFuente(btn));
  });

  grid.querySelectorAll('.fuente-btn.locked').forEach(btn => {
    btn.addEventListener('click', abrirModalPlanes);
  });
}

function seleccionarFuente(btn) {
  State.fuente = btn.dataset.fuente;
  document.querySelectorAll('.fuente-btn').forEach(b => b.classList.remove('activa'));
  btn.classList.add('activa');
  generarFlyer();
}

document.addEventListener('DOMContentLoaded', renderizarFuentesGrid);
