/* ══════════════════════════════════════════════════════
   BRAND-KIT.JS — Identidad de marca persistente

   El negocio configura su marca UNA vez. Se guarda en la
   persistencia existente (localStorage) y queda disponible
   para campañas, IA, render y asistente.

   API pública:
     getBrand()            → objeto marca (con defaults)
     saveBrand(obj)        → reemplaza toda la marca
     updateBrand(parcial)  → merge parcial + guardar
     tieneBrand()          → ¿hay al menos nombre?
     aplicarBrand()        → vuelca la marca al flyer (inputs + logo + colores)
     aplicarBrandDatos()   → sólo datos de contacto/identidad (sin tocar colores)

   NO modifica plantillas ni render: escribe en los MISMOS inputs
   que el render ya lee (inp-negocio, inp-tel, color-principal, …),
   así todo lo existente usa la marca sin cambios.
   ══════════════════════════════════════════════════════ */

const BRAND_KEY = 'flyerstudio_brand';

const BRAND_DEFAULT = {
  nombre:          '',
  logo:            '',   // dataURL (base64) o ''
  colorPrincipal:  '',
  colorSecundario: '',
  whatsapp:        '',
  instagram:       '',
  facebook:        '',
  direccion:       '',
  web:             '',
  horario:         '',
  eslogan:         '',
};

// ── Persistencia ──
function getBrand() {
  try {
    const raw = localStorage.getItem(BRAND_KEY);
    return raw ? { ...BRAND_DEFAULT, ...JSON.parse(raw) } : { ...BRAND_DEFAULT };
  } catch {
    return { ...BRAND_DEFAULT };
  }
}

function saveBrand(obj) {
  const limpio = { ...BRAND_DEFAULT, ...(obj || {}) };
  try { localStorage.setItem(BRAND_KEY, JSON.stringify(limpio)); } catch (e) {
    console.warn('No se pudo guardar el Brand Kit (¿storage lleno? el logo pesa mucho):', e);
  }
  return limpio;
}

function updateBrand(parcial) {
  return saveBrand({ ...getBrand(), ...(parcial || {}) });
}

function tieneBrand() {
  return getBrand().nombre.trim().length > 0;
}

// ── Aplicar la marca al flyer ──
function _setInput(id, valor) {
  if (valor == null || valor === '') return;
  const el = document.getElementById(id);
  if (el) el.value = valor;
}

// Sólo identidad + contacto. NO toca colores (para que la paleta de la
// campaña/rubro mande). Se llama después de cambiar de rubro para que la
// marca del negocio quede "pegada".
function aplicarBrandDatos() {
  const b = getBrand();
  _setInput('inp-negocio', b.nombre);
  _setInput('inp-slogan',  b.eslogan);
  _setInput('inp-tel',     b.whatsapp);
  _setInput('inp-ig',      b.instagram);
  _setInput('inp-dir',     b.direccion);
  _setInput('inp-web',     b.web);
}

// Aplicación completa: datos + colores + logo, y re-render.
function aplicarBrand({ regenerar = true } = {}) {
  const b = getBrand();
  aplicarBrandDatos();

  // Colores (reutiliza el helper de industrias.js si está).
  const setColor = (id, val) => {
    if (!val) return;
    if (typeof _syncColorInput === 'function') { _syncColorInput(id, val); return; }
    const c = document.getElementById(id);          if (c) c.value = val;
    const t = document.getElementById(id + '-txt'); if (t) t.value = val;
  };
  setColor('color-principal', b.colorPrincipal);
  setColor('color-acento',    b.colorSecundario);

  // Logo (dataURL → Image → State.logoImg), reutilizando la UI de upload.js.
  if (b.logo) {
    const img = new Image();
    img.onload = () => {
      if (typeof State !== 'undefined') State.logoImg = img;
      const wrap = document.getElementById('logo-preview-wrap');
      if (wrap) wrap.innerHTML =
        `<img src="${b.logo}" class="logo-preview-img" alt="Logo"><div class="upload-txt">Logo de la marca ✓</div>`;
      const btnQ = document.getElementById('btn-quitar-logo');
      if (btnQ) btnQ.style.display = '';
      if (typeof generarFlyer === 'function') generarFlyer();
    };
    img.src = b.logo;
  }

  if (regenerar && typeof generarFlyer === 'function') generarFlyer();
}

// ══════════════════════════════════════════════════
//  UI — Modal de configuración del Brand Kit
// ══════════════════════════════════════════════════

// Campos del formulario (label + tipo). El id se deriva de `key`.
const BRAND_CAMPOS = [
  { key: 'nombre',          label: 'Nombre del negocio',  tipo: 'text' },
  { key: 'eslogan',         label: 'Eslogan',             tipo: 'text' },
  { key: 'colorPrincipal',  label: 'Color principal',     tipo: 'color' },
  { key: 'colorSecundario', label: 'Color secundario',    tipo: 'color' },
  { key: 'whatsapp',        label: 'WhatsApp',            tipo: 'text' },
  { key: 'instagram',       label: 'Instagram',           tipo: 'text' },
  { key: 'facebook',        label: 'Facebook',            tipo: 'text' },
  { key: 'direccion',       label: 'Dirección',           tipo: 'text' },
  { key: 'web',             label: 'Sitio web',           tipo: 'text' },
  { key: 'horario',         label: 'Horario',             tipo: 'text' },
];

function _crearModalBrand() {
  if (document.getElementById('modal-brand')) return;
  const overlay = document.createElement('div');
  overlay.id = 'modal-brand';
  overlay.style.cssText =
    'display:none;position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,.6);' +
    'backdrop-filter:blur(4px);align-items:center;justify-content:center;padding:20px';
  overlay.innerHTML = `
    <div style="background:var(--surface,#1c1c22);border:1px solid var(--border,rgba(255,255,255,.12));
      border-radius:16px;width:100%;max-width:560px;max-height:88vh;overflow:auto;
      box-shadow:0 20px 60px rgba(0,0,0,.5)">
      <div style="display:flex;align-items:center;justify-content:space-between;
        padding:18px 22px;border-bottom:1px solid var(--border,rgba(255,255,255,.1))">
        <div>
          <div style="font-weight:700;font-size:17px">🎨 Brand Kit</div>
          <div style="font-size:12px;opacity:.6;margin-top:2px">Configurá tu marca una sola vez</div>
        </div>
        <button id="brand-cerrar" style="background:none;border:none;color:inherit;font-size:22px;cursor:pointer;opacity:.7">✕</button>
      </div>
      <div id="brand-body" style="padding:22px"></div>
      <div style="display:flex;gap:10px;justify-content:flex-end;padding:16px 22px;
        border-top:1px solid var(--border,rgba(255,255,255,.1))">
        <button id="brand-guardar" style="padding:10px 18px;border-radius:10px;font-weight:600;font-size:14px;cursor:pointer;
          background:var(--primary,#C4748A);border:1px solid var(--primary,#C4748A);color:#fff">Guardar y aplicar</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) cerrarBrandKit(); });
  document.getElementById('brand-cerrar').addEventListener('click', cerrarBrandKit);
  document.getElementById('brand-guardar').addEventListener('click', _guardarDesdeModal);
}

function _renderModalBrand() {
  const body = document.getElementById('brand-body');
  if (!body) return;
  const b = getBrand();

  body.innerHTML =
    // Logo
    `<div class="campo">
       <label>Logo</label>
       <div style="display:flex;align-items:center;gap:12px">
         <div id="brand-logo-preview" style="width:56px;height:56px;border-radius:10px;overflow:hidden;
           border:1px solid var(--border,rgba(255,255,255,.15));display:flex;align-items:center;justify-content:center;
           background:var(--surface2,rgba(255,255,255,.05));font-size:22px">
           ${b.logo ? `<img src="${b.logo}" style="width:100%;height:100%;object-fit:cover">` : '✦'}
         </div>
         <input type="file" id="brand-logo-input" accept="image/*">
       </div>
     </div>` +
    // Resto de campos
    BRAND_CAMPOS.map(f => {
      const val = b[f.key] || '';
      if (f.tipo === 'color') {
        return `<div class="campo"><label>${f.label}</label>
          <input type="color" id="brand-${f.key}" value="${val || '#C4748A'}"></div>`;
      }
      return `<div class="campo"><label>${f.label}</label>
        <input type="text" id="brand-${f.key}" value="${String(val).replace(/"/g,'&quot;')}"></div>`;
    }).join('');

  // Preview de logo al elegir archivo (guarda el dataURL en memoria del modal).
  const inp = document.getElementById('brand-logo-input');
  inp?.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      _brandLogoTmp = reader.result;
      const prev = document.getElementById('brand-logo-preview');
      if (prev) prev.innerHTML = `<img src="${_brandLogoTmp}" style="width:100%;height:100%;object-fit:cover">`;
    };
    reader.readAsDataURL(file);
  });
}

// dataURL temporal del logo elegido en el modal (null = mantener el guardado).
let _brandLogoTmp = null;

function _guardarDesdeModal() {
  const actual = getBrand();
  const nuevo  = { ...actual };
  BRAND_CAMPOS.forEach(f => {
    const el = document.getElementById('brand-' + f.key);
    if (el) nuevo[f.key] = el.value;
  });
  if (_brandLogoTmp) nuevo.logo = _brandLogoTmp;

  saveBrand(nuevo);
  _brandLogoTmp = null;
  aplicarBrand();          // vuelca al flyer inmediatamente
  cerrarBrandKit();
}

function abrirBrandKit() {
  _crearModalBrand();
  _brandLogoTmp = null;
  _renderModalBrand();
  document.getElementById('modal-brand').style.display = 'flex';
}

function cerrarBrandKit() {
  const m = document.getElementById('modal-brand');
  if (m) m.style.display = 'none';
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-brand-kit')?.addEventListener('click', abrirBrandKit);

  // Si ya hay una marca guardada, aplicarla al arrancar (después del render inicial).
  if (tieneBrand()) aplicarBrand({ regenerar: true });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const m = document.getElementById('modal-brand');
      if (m && m.style.display === 'flex') cerrarBrandKit();
    }
  });
});
