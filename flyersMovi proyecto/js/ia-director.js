/* IA-DIRECTOR.JS — Director de arte IA. El flyer es estado estructurado:
   brief -> plan JSON -> aplicar determinístico. El modal se abre desde "Generar flyer". */

const FUENTES_CATALOGO = ['playfair', 'montserrat', 'cormorant', 'raleway', 'lato', 'dm-sans'];

if (typeof window._getFuenteOriginal === 'undefined' && typeof getFuente === 'function') {
  window._getFuenteOriginal = getFuente;
  window.getFuente = function () {
    if (State.fuenteCustom && State.fuenteCustom.titulo) return State.fuenteCustom;
    return window._getFuenteOriginal();
  };
}

function recopilarBriefFlyer() {
  const { w: W, h: H } = State.getCanvasSize();
  const colores = State.getColores(), datos = State.getDatos();
  const campos = {};
  document.querySelectorAll('#campos-contenido input, #campos-contenido textarea, #campos-contenido select')
    .forEach(el => { if (el.id) campos[el.id] = el.value; });
  const elementos = ElementosState.elementos.map(e => ({
    id: e.id, tipo: e.tipo, x: +(e.x / W).toFixed(3), y: +(e.y / H).toFixed(3),
    escala: +(e.escala || 1).toFixed(2), rotacion: +(e.rotacion || 0).toFixed(3),
  }));
  const ind = (typeof IndustriaState !== 'undefined') ? IndustriaState.actual() : null;
  return {
    rubro: ind?.nombre || 'estética / belleza', plantilla: State.plantilla, formato: State.formato,
    fuenteActual: State.fuente, negocio: datos, colores, campos, elementos,
    tieneImagenObjeto: elementos.some(e => e.tipo === 'imagen'),
  };
}

async function iaMejorarFlyer(instruccion = '') {
  const brief = recopilarBriefFlyer();
  const res = await fetch('/api/ia/mejorar-flyer', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ brief, instruccion }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
  return data.plan;
}

async function aplicarPlanIA(plan) {
  if (!plan || typeof plan !== 'object') throw new Error('Plan IA vacío');
  if (plan.copy) {
    Object.entries(plan.copy).forEach(([id, valor]) => {
      const el = document.getElementById(id);
      if (el && typeof valor === 'string') { el.value = valor; el.dispatchEvent(new Event('input', { bubbles: true })); }
    });
  }
  if (plan.paleta) {
    const set = (id, v) => { if (!/^#[0-9A-Fa-f]{6}$/.test(v || '')) return; const p = document.getElementById(id); if (p) p.value = v; const t = document.getElementById(id + '-txt'); if (t) t.value = v; };
    set('color-principal', plan.paleta.principal); set('color-fondo', plan.paleta.fondo); set('color-acento', plan.paleta.acento);
  }
  if (plan.fuente) {
    if (typeof plan.fuente === 'string' && FUENTES_CATALOGO.includes(plan.fuente)) {
      State.fuenteCustom = null; State.fuente = plan.fuente;
      document.querySelectorAll('.fuente-btn').forEach(b => b.classList.toggle('activa', b.dataset.fuente === plan.fuente));
    } else if (plan.fuente.google) {
      await cargarFuenteGoogle(plan.fuente.google, plan.fuente.weight || 600);
      State.fuenteCustom = { titulo: plan.fuente.google, body: 'DM Sans' };
    }
  }
  const { w: W, h: H } = State.getCanvasSize();
  if (Array.isArray(plan.layout)) plan.layout.forEach(l => {
    const el = ElementosState.getById(l.id); if (!el) return;
    if (typeof l.x === 'number') el.x = l.x * W; if (typeof l.y === 'number') el.y = l.y * H;
    if (typeof l.escala === 'number') el.escala = Math.max(0.2, Math.min(4, l.escala));
    if (typeof l.rotacion === 'number') el.rotacion = l.rotacion;
  });
  if (Array.isArray(plan.imagenes)) plan.imagenes.forEach(im => {
    const el = ElementosState.getById(im.id); if (!el || el.tipo !== 'imagen') return;
    if (typeof im.x === 'number') el.x = im.x * W; if (typeof im.y === 'number') el.y = im.y * H;
    if (typeof im.escala === 'number') el.escala = Math.max(0.2, Math.min(4, im.escala));
    if (typeof im.rotacion === 'number') el.rotacion = im.rotacion;
    if (im.tratamiento) el.tratamiento = { ...el.tratamiento, ...im.tratamiento };
  });
  if (plan.fondoIA && plan.fondoIA.prompt && typeof iaGenerarImagenFondo === 'function') {
    try {
      const r = await iaGenerarImagenFondo(plan.fondoIA.prompt);
      cargarImagenIA(r.data, r.mimeType, img => { State.fondoImg = img; State.fondoActivo = 'imagen'; generarFlyer(); }, () => {});
    } catch (e) { console.warn('Fondo IA opcional falló:', e.message); }
  }
  if (typeof generarFlyer === 'function') generarFlyer();
  return plan.notas || 'Flyer mejorado con IA';
}

function cargarFuenteGoogle(nombre, weight = 600) {
  return new Promise((resolve) => {
    const fam = nombre.trim().replace(/\s+/g, '+'), linkId = 'gf-' + fam.toLowerCase();
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link'); link.id = linkId; link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${fam}:wght@${weight}&display=swap`;
      document.head.appendChild(link);
    }
    if (document.fonts && document.fonts.load) {
      document.fonts.load(`${weight} 48px '${nombre}'`).then(() => resolve()).catch(() => resolve());
      setTimeout(resolve, 2500);
    } else setTimeout(resolve, 800);
  });
}

let _mejorando = false;
async function ejecutarMejorarConIA(instruccion = '') {
  if (_mejorando) return; _mejorando = true;
  const btn = document.getElementById('btn-ia-mejorar'), txt = btn?.textContent;
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Mejorando...'; }
  const snapshot = _snapshotEstado();
  try {
    const plan = await iaMejorarFlyer(instruccion);
    const notas = await aplicarPlanIA(plan);
    window._ultimoSnapshotIA = snapshot;
    if (typeof mostrarToast === 'function') mostrarToast('✓ ' + notas);
    cerrarModalMejorar();
  } catch (err) {
    console.error(err);
    if (typeof mostrarToast === 'function') mostrarToast('Error IA: ' + err.message);
  } finally { if (btn) { btn.disabled = false; btn.textContent = txt || '✦ Mejorar con IA'; } _mejorando = false; }
}
function deshacerMejoraIA() {
  if (!window._ultimoSnapshotIA) { if (typeof mostrarToast === 'function') mostrarToast('No hay cambios de IA para deshacer'); return; }
  _restaurarEstado(window._ultimoSnapshotIA); window._ultimoSnapshotIA = null;
  if (typeof mostrarToast === 'function') mostrarToast('Cambios de IA revertidos');
}
function _snapshotEstado() {
  const inputs = {};
  document.querySelectorAll('#campos-contenido input, #campos-contenido textarea, #campos-contenido select, #inp-negocio, #inp-slogan, #inp-tel, #inp-ig, #inp-dir, #inp-web, #color-principal, #color-fondo, #color-acento')
    .forEach(el => { if (el.id) inputs[el.id] = el.value; });
  return { inputs, fuente: State.fuente, fuenteCustom: State.fuenteCustom || null,
    elementos: JSON.parse(JSON.stringify(ElementosState.elementos.map(({ img, ...rest }) => rest))) };
}
function _restaurarEstado(snap) {
  Object.entries(snap.inputs).forEach(([id, v]) => { const el = document.getElementById(id); if (el) { el.value = v; const t = document.getElementById(id + '-txt'); if (t) t.value = v; } });
  State.fuente = snap.fuente; State.fuenteCustom = snap.fuenteCustom;
  snap.elementos.forEach(se => { const el = ElementosState.getById(se.id); if (el) Object.assign(el, se, { img: el.img }); });
  if (typeof generarFlyer === 'function') generarFlyer();
}

/* ── MODAL "Mejorar con IA" (se crea lazy, se abre desde btn-generar) ── */
function _crearModalMejorar() {
  if (document.getElementById('modal-mejorar')) return;
  const ov = document.createElement('div');
  ov.id = 'modal-mejorar';
  ov.style.cssText = 'display:none;position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,.6);backdrop-filter:blur(4px);align-items:center;justify-content:center;padding:20px';
  ov.innerHTML = `
    <div style="background:var(--surface,#1c1c22);border:1px solid var(--border,rgba(255,255,255,.12));border-radius:16px;width:100%;max-width:520px;max-height:88vh;overflow:auto;box-shadow:0 20px 60px rgba(0,0,0,.5)">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:18px 22px;border-bottom:1px solid var(--border,rgba(255,255,255,.1))">
        <div style="font-weight:700;font-size:17px">✦ Mejorar flyer con IA</div>
        <button id="mej-cerrar" style="background:none;border:none;color:inherit;font-size:22px;cursor:pointer;opacity:.7;line-height:1">✕</button>
      </div>
      <div style="padding:22px;display:flex;flex-direction:column;gap:16px">
        <div>
          <label style="display:block;font-size:13px;opacity:.75;margin-bottom:6px">¿Qué querés mejorar? (opcional)</label>
          <input id="ia-mejorar-instruccion" type="text" placeholder="Ej: más elegante, resaltá el precio, tono cálido"
            style="width:100%;padding:10px 12px;border-radius:10px;border:1px solid var(--border,rgba(255,255,255,.2));background:transparent;color:inherit">
        </div>
        <button id="btn-ia-mejorar" style="padding:12px;border-radius:10px;font-weight:700;font-size:15px;cursor:pointer;border:none;background:var(--primary,#C4748A);color:#fff">✦ Mejorar con IA</button>
        <div style="display:flex;gap:10px">
          <label style="flex:1;text-align:center;padding:10px;border-radius:10px;border:1px solid var(--border,rgba(255,255,255,.2));cursor:pointer;font-size:14px">🖼️ Agregar imagen
            <input id="inp-imagen-objeto" type="file" accept="image/*" hidden></label>
          <button id="btn-ia-mejorar-deshacer" style="flex:1;padding:10px;border-radius:10px;border:1px solid var(--border,rgba(255,255,255,.2));background:transparent;color:inherit;cursor:pointer;font-size:14px">↩ Deshacer IA</button>
        </div>
        <div id="mej-lista-img" style="display:flex;flex-direction:column;gap:6px"></div>
      </div>
    </div>`;
  document.body.appendChild(ov);
  ov.addEventListener('click', e => { if (e.target === ov) cerrarModalMejorar(); });
  document.getElementById('mej-cerrar').addEventListener('click', cerrarModalMejorar);
  document.getElementById('btn-ia-mejorar').addEventListener('click', () => {
    ejecutarMejorarConIA(document.getElementById('ia-mejorar-instruccion')?.value?.trim() || '');
  });
  document.getElementById('btn-ia-mejorar-deshacer').addEventListener('click', deshacerMejoraIA);
  document.getElementById('inp-imagen-objeto').addEventListener('change', async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const id = await agregarImagenObjeto(file);
    if (id && typeof armonizarConImagen === 'function') armonizarConImagen(id);
    e.target.value = ''; _refrescarListaImgMejorar();
  });
}
function abrirModalMejorar() { _crearModalMejorar(); document.getElementById('modal-mejorar').style.display = 'flex'; _refrescarListaImgMejorar(); }
function cerrarModalMejorar() { const m = document.getElementById('modal-mejorar'); if (m) m.style.display = 'none'; }
function _refrescarListaImgMejorar() {
  const cont = document.getElementById('mej-lista-img'); if (!cont) return;
  const imgs = listarImagenesObjeto();
  cont.innerHTML = imgs.map(im => `<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:13px;padding:6px 10px;border:1px solid var(--border,rgba(255,255,255,.15));border-radius:8px">
      <span>${im.label}</span>
      <button data-quitar="${im.id}" style="background:none;border:none;color:inherit;cursor:pointer;opacity:.7">🗑️ Quitar</button></div>`).join('');
  cont.querySelectorAll('[data-quitar]').forEach(b => b.addEventListener('click', () => { quitarImagenObjeto(b.dataset.quitar); _refrescarListaImgMejorar(); }));
}

window.iaMejorarFlyer = iaMejorarFlyer; window.aplicarPlanIA = aplicarPlanIA;
window.recopilarBriefFlyer = recopilarBriefFlyer; window.ejecutarMejorarConIA = ejecutarMejorarConIA;
window.abrirModalMejorar = abrirModalMejorar; window.cerrarModalMejorar = cerrarModalMejorar;
