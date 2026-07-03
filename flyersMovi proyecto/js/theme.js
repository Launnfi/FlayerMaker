/* ══════════════════════════════════════════════════════
   THEME.JS — Motor de temas por industria
   Aplica un tema (data-theme en <html>), lo persiste y
   renderiza el selector de Configuración.
   Agregar un tema = una entrada en TEMAS + su bloque en
   css/themes.css. Nada más.
   ══════════════════════════════════════════════════════ */

const TEMAS = [
  { id: 'barberia',    nombre: 'Barbería',        ico: '💈' },
  { id: 'peluqueria',  nombre: 'Peluquería',      ico: '💇' },
  { id: 'estetica',    nombre: 'Estética / Spa',  ico: '💅' },
  { id: 'clinica',     nombre: 'Clínica',         ico: '🏥' },
  { id: 'odontologia', nombre: 'Odontología',     ico: '🦷' },
  { id: 'gimnasio',    nombre: 'Gimnasio',        ico: '🏋️' },
  { id: 'restaurante', nombre: 'Restaurante',     ico: '🍔' },
  { id: 'cafeteria',   nombre: 'Cafetería',       ico: '☕' },
  { id: 'tienda',      nombre: 'Tienda',          ico: '🛍️' },
  { id: 'tecnologia',  nombre: 'Tecnología',      ico: '💻' },
];

const TEMAS_OSCUROS = new Set(['dark', 'barberia', 'gimnasio']);
const TEMA_KEY      = 'flyerstudio_theme';
const TEMA_DEFAULT  = 'estetica';

function temaActual()      { return document.documentElement.getAttribute('data-theme') || TEMA_DEFAULT; }
function esTemaOscuro(id)  { return TEMAS_OSCUROS.has(id); }

// Aplica un tema al instante (sin recargar).
function aplicarTema(id, { persistir = true } = {}) {
  if (!id) return;
  document.documentElement.setAttribute('data-theme', id);
  if (persistir) { try { localStorage.setItem(TEMA_KEY, id); } catch {} }
  if (typeof State !== 'undefined') State.darkMode = esTemaOscuro(id);
  sincronizarIconoTema();
  document.querySelectorAll('.tema-card').forEach(c =>
    c.classList.toggle('activa', c.dataset.tema === id));
}

// Sincroniza el icono sol/luna del header con el tema activo.
function sincronizarIconoTema() {
  const iDark  = document.getElementById('icon-dark');
  const iLight = document.getElementById('icon-light');
  if (!iDark || !iLight) return;
  const oscuro = esTemaOscuro(temaActual());
  iDark.style.display  = oscuro ? ''     : 'none';
  iLight.style.display = oscuro ? 'none' : '';
}

function initTema() {
  let id = null;
  try { id = localStorage.getItem(TEMA_KEY); } catch {}
  aplicarTema(id || TEMA_DEFAULT, { persistir: false });
}

function renderSelectorTemas() {
  const cont = document.getElementById('temas-grid');
  if (!cont) return;
  const actual = temaActual();

  cont.innerHTML = TEMAS.map(t => `
    <button class="tema-card ${t.id === actual ? 'activa' : ''}" data-tema="${t.id}" title="${t.nombre}">
      <span class="tema-swatch" data-theme="${t.id}">
        <i style="background:var(--primary)"></i>
        <i style="background:var(--accent)"></i>
        <i style="background:var(--surface);border:1px solid var(--border)"></i>
      </span>
      <span class="tema-info">
        <span class="tema-ico">${t.ico}</span>
        <span class="tema-nom">${t.nombre}</span>
      </span>
      <span class="tema-check" aria-hidden="true">✓</span>
    </button>`).join('');

  cont.querySelectorAll('.tema-card').forEach(btn => {
    btn.addEventListener('click', () => aplicarTema(btn.dataset.tema));
  });
}

// Aplicar cuanto antes (por si el inline del <head> no corrió).
initTema();

document.addEventListener('DOMContentLoaded', () => {
  renderSelectorTemas();
  sincronizarIconoTema();
});
