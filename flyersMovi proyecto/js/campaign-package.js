/* ══════════════════════════════════════════════════════
   CAMPAIGN-PACKAGE.JS — Generador de campañas completas

   No genera un flyer: genera un PAQUETE para redes sociales
   reutilizando TODO el contexto existente (rubro, Brand Kit,
   biblioteca, campaña, IA). No vuelve a pedir nada.

   generateCampaignPackage({ campana?, item?, content? }) → Promise<{
     post,             // dataURL PNG — cuadrado 1080x1080
     story,            // dataURL PNG — 9:16 1080x1920
     banner,           // dataURL PNG — horizontal 1080x566
     instagramCaption, // string
     facebookCaption,  // string
     whatsappStatus,   // string
     hashtags,         // string[]
     emojis            // string[]
   }>

   Los 3 gráficos usan EXACTAMENTE la misma campaña: sólo cambia
   State.formato y se re-renderiza con el motor existente. No toca
   render, plantillas ni editor.
   ══════════════════════════════════════════════════════ */

// Formatos gráficos del paquete. `formato` debe existir en State.getCanvasSize.
// Agregar un formato nuevo = una entrada acá (+ registrarlo en state.js).
const PACKAGE_FORMATOS = [
  { key: 'post',   formato: 'cuadrado', label: 'Post 1:1' },
  { key: 'story',  formato: 'story',    label: 'Story 9:16' },
  { key: 'banner', formato: 'banner',   label: 'Banner' },
];

// ── Contexto: campaña + item actuales, sin volver a pedir ──
function _paqueteContexto(opts = {}) {
  let camp = opts.campana;
  if (!camp && typeof getCampanasDeRubro === 'function' && typeof CampanaState !== 'undefined') {
    camp = getCampanasDeRubro().find(c => c.id === CampanaState.id) || null;
  }
  if (!camp) camp = { id: 'actual', nombre: 'Campaña', plantilla: (typeof State !== 'undefined' ? State.plantilla : 'promo') };
  return { campana: camp, item: opts.item || null };
}

// ── Re-render de la campaña en cada formato (motor existente) ──
function _renderFormatos() {
  const canvas = document.getElementById('flyer-canvas');
  if (!canvas) return {};

  // Snapshot para restaurar el estado del editor tal cual estaba.
  const formatoOrig = State.formato;
  const snapElems   = JSON.stringify(ElementosState.elementos);
  const selOrig     = ElementosState.seleccionado;
  const editorOrig  = ElementosState.modoEditor;
  ElementosState.modoEditor = false;   // sin handles en la exportación

  const out = {};
  for (const f of PACKAGE_FORMATOS) {
    State.formato = f.formato;
    if (typeof initElementos === 'function') initElementos(State.plantilla); // recalcula posiciones para W/H del formato
    if (typeof generarFlyer  === 'function') generarFlyer();
    out[f.key] = canvas.toDataURL('image/png');
  }

  // Restaurar todo.
  State.formato = formatoOrig;
  try { ElementosState.elementos = JSON.parse(snapElems); } catch {}
  ElementosState.seleccionado = selOrig;
  ElementosState.modoEditor   = editorOrig;
  if (typeof generarFlyer === 'function') generarFlyer();

  return out;
}

// ── Captions a partir del copy + Brand Kit ──
function _armarCaptions(content, brand) {
  const emojis   = (content.emojis || []).join('');
  const hashtags = (content.hashtags || []).join(' ');
  const titulo   = content.titulo || '';
  const desc     = content.descripcion || '';
  const cta      = content.cta || '';

  const ig  = brand.instagram || '';
  const fb  = brand.facebook || '';
  const wa  = brand.whatsapp || '';
  const web = brand.web || '';
  const dir = brand.direccion || '';
  const hor = brand.horario || '';

  const linea = (etiqueta, valor) => valor ? `\n${etiqueta} ${valor}` : '';

  // Instagram: emojis + gancho + descripción + CTA + hashtags.
  const instagramCaption =
    `${emojis ? emojis + ' ' : ''}${titulo}\n\n${desc}\n\n${cta ? '👉 ' + cta : ''}` +
    linea('📲', wa) + linea('📍', dir) +
    `\n\n${hashtags}`;

  // Facebook: más descriptivo, con datos de contacto.
  const facebookCaption =
    `${titulo}\n\n${desc}\n\n${cta ? cta + '.' : ''}` +
    linea('📲 WhatsApp:', wa) + linea('🌐', web) + linea('📍', dir) + linea('🕒', hor) +
    `\n\n${hashtags}`;

  // WhatsApp Estado: corto y directo.
  const whatsappStatus =
    `${emojis ? emojis + ' ' : ''}${titulo}` +
    (desc ? `\n${desc.split('\n')[0]}` : '') +
    (cta ? `\n${cta}` : '') +
    (wa ? `\n📲 ${wa}` : '');

  return { instagramCaption, facebookCaption, whatsappStatus };
}

// ══════════════════════════════════════════════════
//  API principal
// ══════════════════════════════════════════════════
async function generateCampaignPackage(opts = {}) {
  const brand = (typeof getBrand === 'function') ? getBrand() : {};
  const ctx   = _paqueteContexto(opts);

  // Copy: reutiliza el asistente de IA (etapa 7). Si ya viene, no regenera.
  let content = opts.content;
  if (!content && typeof generateCampaignContent === 'function') {
    content = await generateCampaignContent({ campana: ctx.campana, item: ctx.item });
  }
  content = content || { titulo: '', subtitulo: '', cta: '', descripcion: '', hashtags: [], emojis: [] };

  const graficos = _renderFormatos();
  const captions = _armarCaptions(content, brand);

  return {
    post:   graficos.post   || '',
    story:  graficos.story  || '',
    banner: graficos.banner || '',
    ...captions,
    hashtags: content.hashtags || [],
    emojis:   content.emojis || [],
  };
}

// ══════════════════════════════════════════════════
//  UI — Modal con el paquete listo (previews + copiar + descargar)
// ══════════════════════════════════════════════════
function _crearModalPaquete() {
  if (document.getElementById('modal-paquete')) return;
  const overlay = document.createElement('div');
  overlay.id = 'modal-paquete';
  overlay.style.cssText =
    'display:none;position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,.6);' +
    'backdrop-filter:blur(4px);align-items:center;justify-content:center;padding:20px';
  overlay.innerHTML = `
    <div style="background:var(--surface,#1c1c22);border:1px solid var(--border,rgba(255,255,255,.12));
      border-radius:16px;width:100%;max-width:680px;max-height:90vh;overflow:auto;box-shadow:0 20px 60px rgba(0,0,0,.5)">
      <div style="display:flex;align-items:center;justify-content:space-between;
        padding:18px 22px;border-bottom:1px solid var(--border,rgba(255,255,255,.1))">
        <div style="font-weight:700;font-size:17px">📦 Campaña completa</div>
        <button id="paq-cerrar" style="background:none;border:none;color:inherit;font-size:22px;cursor:pointer;opacity:.7">✕</button>
      </div>
      <div id="paq-body" style="padding:22px"></div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) cerrarPaquete(); });
  document.getElementById('paq-cerrar').addEventListener('click', cerrarPaquete);
}

function _bloqueCaption(titulo, texto, id) {
  return `
    <div style="margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <span class="seccion-titulo" style="margin:0">${titulo}</span>
        <button data-copy="${id}" style="font-size:12px;padding:4px 10px;border-radius:8px;cursor:pointer;
          background:var(--surface2,rgba(255,255,255,.06));border:1px solid var(--border,rgba(255,255,255,.15));color:inherit">Copiar</button>
      </div>
      <textarea id="${id}" readonly style="width:100%;min-height:90px;font-size:13px">${texto || ''}</textarea>
    </div>`;
}

function _renderModalPaquete(pkg) {
  const body = document.getElementById('paq-body');
  if (!body) return;

  const graf = PACKAGE_FORMATOS.map(f => `
    <div style="flex:1;text-align:center">
      <img src="${pkg[f.key]}" alt="${f.label}" style="width:100%;border-radius:10px;border:1px solid var(--border,rgba(255,255,255,.12))">
      <div style="font-size:12px;opacity:.7;margin:6px 0">${f.label}</div>
      <a href="${pkg[f.key]}" download="campana-${f.key}.png"
        style="font-size:12px;padding:5px 10px;border-radius:8px;text-decoration:none;
        background:var(--primary,#C4748A);color:#fff">Descargar</a>
    </div>`).join('');

  body.innerHTML = `
    <div class="seccion-titulo" style="margin-bottom:10px">Gráficos</div>
    <div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:22px">${graf}</div>
    ${_bloqueCaption('Caption Instagram', pkg.instagramCaption, 'paq-ig')}
    ${_bloqueCaption('Caption Facebook',  pkg.facebookCaption,  'paq-fb')}
    ${_bloqueCaption('Estado WhatsApp',   pkg.whatsappStatus,   'paq-wa')}
    <div class="seccion-titulo" style="margin-bottom:6px">Hashtags</div>
    <p class="campo-hint" style="margin-bottom:14px">${(pkg.hashtags || []).join(' ')}</p>
    <div class="seccion-titulo" style="margin-bottom:6px">Emojis</div>
    <p style="font-size:22px;margin:0">${(pkg.emojis || []).join(' ')}</p>`;

  body.querySelectorAll('[data-copy]').forEach(b => b.addEventListener('click', () => {
    const ta = document.getElementById(b.dataset.copy);
    if (ta && navigator.clipboard) navigator.clipboard.writeText(ta.value).then(() => {
      const o = b.textContent; b.textContent = '✓'; setTimeout(() => b.textContent = o, 1200);
    });
  }));
}

async function abrirPaquete() {
  _crearModalPaquete();
  const body = document.getElementById('paq-body');
  if (body) body.innerHTML = `<p class="campo-hint" style="text-align:center;padding:30px">Generando la campaña completa…</p>`;
  document.getElementById('modal-paquete').style.display = 'flex';
  try {
    const pkg = await generateCampaignPackage();
    _renderModalPaquete(pkg);
  } catch (e) {
    if (body) body.innerHTML = `<p class="campo-hint" style="text-align:center;padding:30px">No se pudo generar: ${e.message}</p>`;
  }
}

function cerrarPaquete() {
  const m = document.getElementById('modal-paquete');
  if (m) m.style.display = 'none';
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-paquete')?.addEventListener('click', abrirPaquete);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const m = document.getElementById('modal-paquete');
      if (m && m.style.display === 'flex') cerrarPaquete();
    }
  });
});
