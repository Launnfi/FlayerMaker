/* ══════════════════════════════════════════════════════
   ASISTENTE.JS — Creación rápida (wizard de 3 pasos)

   Capa SUPERIOR sobre el sistema existente. Objetivo: flyer en
   menos de 30 segundos, sin elegir plantilla a mano.

   Flujo:
     1. Elegir rubro        (BUSINESS_TYPES — business-types.js)
     2. Elegir campaña      (CAMPANAS       — campanas.js)
     3. Completar SÓLO los campos que la campaña necesita
     → "Generar": aplica plantilla + textos + colores del rubro,
       renderiza y cierra el asistente dejando el editor listo
       para ajustes opcionales.

   NO toca render ni editor. Reutiliza:
     aplicarRubro()   (business-types.js) → colores + datos del rubro
     aplicarCampana() (campanas.js)       → plantilla + textos + render
   ══════════════════════════════════════════════════════ */

// ── Campos por defecto según la PLANTILLA de la campaña ──
// Se usan cuando una campaña NO define su propio `wizard`.
// Acá `name` = id del input real de la plantilla, así el valor se
// escribe directo (sin construir()).
const WIZARD_POR_PLANTILLA = {
  'promo':          [ { name: 'c-titulo', label: 'Nombre / título', requerido: true },
                      { name: 'c-precio', label: 'Precio o descuento' },
                      { name: 'c-desc',   label: 'Detalle', tipo: 'textarea', opcional: true } ],
  'servicios':      [ { name: 'c-titulo',    label: 'Título', requerido: true },
                      { name: 'c-servicios', label: 'Ítems (uno por línea)', tipo: 'textarea' } ],
  'turnos':         [ { name: 'c-titulo', label: 'Título' },
                      { name: 'c-desc',   label: 'Mensaje', tipo: 'textarea' },
                      { name: 'c-cta',    label: 'Llamado a la acción' } ],
  'frase':          [ { name: 'c-frase',     label: 'Frase', tipo: 'textarea', requerido: true },
                      { name: 'c-subtitulo', label: 'Subtítulo', opcional: true } ],
  'nuevo-servicio': [ { name: 'c-titulo', label: 'Nombre', requerido: true },
                      { name: 'c-desc',   label: 'Descripción', tipo: 'textarea' },
                      { name: 'c-precio', label: 'Precio', opcional: true } ],
  'oferta-flash':   [ { name: 'c-titulo', label: 'Título' },
                      { name: 'c-precio', label: 'Descuento' },
                      { name: 'c-hasta',  label: 'Válido hasta' } ],
  'navidad':        [ { name: 'c-titulo', label: 'Saludo' },
                      { name: 'c-desc',   label: 'Mensaje', tipo: 'textarea' },
                      { name: 'c-saludo', label: 'Firma' } ],
  'testimonio':     [ { name: 'c-frase',   label: 'Testimonio', tipo: 'textarea', requerido: true },
                      { name: 'c-cliente', label: 'Cliente' } ],
  'dia-madre':      [ { name: 'c-titulo', label: 'Título' },
                      { name: 'c-desc',   label: 'Mensaje', tipo: 'textarea' },
                      { name: 'c-precio', label: 'Oferta', opcional: true } ],
  'minimalista':    [ { name: 'c-titulo', label: 'Título', tipo: 'textarea', requerido: true },
                      { name: 'c-cta',    label: 'CTA', opcional: true } ],
  'luxury':         [ { name: 'c-titulo', label: 'Título', tipo: 'textarea', requerido: true },
                      { name: 'c-desc',   label: 'Descripción', tipo: 'textarea', opcional: true },
                      { name: 'c-precio', label: 'Precio', opcional: true } ],
  'verano':         [ { name: 'c-titulo', label: 'Título' },
                      { name: 'c-desc',   label: 'Descripción', tipo: 'textarea' },
                      { name: 'c-cta',    label: 'CTA' } ],
};

// Devuelve { campos, construir } para una campaña.
//   - Si la campaña define `wizard`, se usa tal cual (construir opcional).
//   - Si no, cae al set por plantilla (name = id del input; sin construir).
//   - Último fallback: derivar de las claves de camp.textos.
function getWizardDef(camp) {
  if (camp?.wizard?.campos) {
    return { campos: camp.wizard.campos, construir: camp.wizard.construir || null };
  }
  const porPlantilla = WIZARD_POR_PLANTILLA[camp?.plantilla];
  if (porPlantilla) return { campos: porPlantilla, construir: null };

  const claves = Object.keys(camp?.textos || {});
  return { campos: claves.map(k => ({ name: k, label: k })), construir: null };
}

// ── Estado del asistente ──
const AsistenteState = { paso: 1, rubroId: null, campId: null };

// ── Construcción del modal (una sola vez) ──
function _crearModalAsistente() {
  if (document.getElementById('modal-asistente')) return;

  const overlay = document.createElement('div');
  overlay.id = 'modal-asistente';
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
          <div style="font-weight:700;font-size:17px">⚡ Creación rápida</div>
          <div id="asis-progreso" style="font-size:12px;opacity:.6;margin-top:2px"></div>
        </div>
        <button id="asis-cerrar" style="background:none;border:none;color:inherit;
          font-size:22px;cursor:pointer;opacity:.7;line-height:1">✕</button>
      </div>
      <div id="asis-body" style="padding:22px"></div>
      <div id="asis-footer" style="display:flex;gap:10px;justify-content:space-between;
        padding:16px 22px;border-top:1px solid var(--border,rgba(255,255,255,.1))"></div>
    </div>`;

  document.body.appendChild(overlay);

  overlay.addEventListener('click', e => { if (e.target === overlay) cerrarAsistente(); });
  document.getElementById('asis-cerrar').addEventListener('click', cerrarAsistente);
}

// Botón reutilizable (estilo inline para no depender de CSS nuevo).
function _btn(label, { primario = false, id = '' } = {}) {
  const base = 'padding:10px 18px;border-radius:10px;font-weight:600;font-size:14px;cursor:pointer;border:1px solid;';
  const estilo = primario
    ? 'background:var(--primary,#C4748A);border-color:var(--primary,#C4748A);color:#fff'
    : 'background:transparent;border-color:var(--border,rgba(255,255,255,.2));color:inherit';
  return `<button ${id ? `id="${id}"` : ''} style="${base}${estilo}">${label}</button>`;
}

// ── Render por paso ──
function _renderAsistente() {
  const body = document.getElementById('asis-body');
  const foot = document.getElementById('asis-footer');
  const prog = document.getElementById('asis-progreso');
  if (!body) return;
  const { paso } = AsistenteState;
  prog.textContent = `Paso ${paso} de 3`;

  // ── PASO 1: rubro ──
  if (paso === 1) {
    const rubros = (typeof BUSINESS_TYPES !== 'undefined') ? Object.values(BUSINESS_TYPES) : [];
    body.innerHTML =
      `<div class="seccion-titulo" style="margin-bottom:10px">Elegí tu rubro</div>
       <div class="plantillas-grid">` +
      rubros.map(r => `
        <button class="plantilla-btn ${r.id === AsistenteState.rubroId ? 'activa' : ''}"
          data-rubro="${r.id}" title="${r.descripcion}">
          <span class="pt-ico">${r.icono}</span>
          <span class="pt-nom">${r.nombre}</span>
        </button>`).join('') + `</div>`;

    foot.innerHTML = _btn('Cancelar', { id: 'asis-cancelar' });

    body.querySelectorAll('[data-rubro]').forEach(b => b.addEventListener('click', () => {
      AsistenteState.rubroId = b.dataset.rubro;
      if (typeof aplicarRubro === 'function') aplicarRubro(b.dataset.rubro, { forzarValores: true, regenerar: false });
      AsistenteState.campId = null;
      AsistenteState.paso = 2;
      _renderAsistente();
    }));
    document.getElementById('asis-cancelar').addEventListener('click', cerrarAsistente);
    return;
  }

  // ── PASO 2: campaña ──
  if (paso === 2) {
    const camps = (typeof getCampanasDeRubro === 'function') ? getCampanasDeRubro(AsistenteState.rubroId) : [];
    body.innerHTML =
      `<div class="seccion-titulo" style="margin-bottom:10px">¿Qué querés comunicar?</div>
       <div class="plantillas-grid">` +
      camps.map(c => `
        <button class="plantilla-btn ${c.id === AsistenteState.campId ? 'activa' : ''}"
          data-camp="${c.id}" title="${c.descripcion}">
          <span class="pt-ico">${c.icono}</span>
          <span class="pt-nom">${c.nombre}</span>
          <span class="pt-desc">${c.descripcion}</span>
        </button>`).join('') + `</div>`;

    foot.innerHTML = _btn('← Volver', { id: 'asis-volver' });

    body.querySelectorAll('[data-camp]').forEach(b => b.addEventListener('click', () => {
      AsistenteState.campId = b.dataset.camp;
      AsistenteState.paso = 3;
      _renderAsistente();
    }));
    document.getElementById('asis-volver').addEventListener('click', () => { AsistenteState.paso = 1; _renderAsistente(); });
    return;
  }

  // ── PASO 3: campos mínimos ──
  const camp = (typeof getCampanasDeRubro === 'function')
    ? getCampanasDeRubro(AsistenteState.rubroId).find(c => c.id === AsistenteState.campId)
    : null;
  const def = getWizardDef(camp);

  // Servicios activos de la biblioteca (business-library.js) para autocompletar.
  const activos = (typeof getLibraryActivos === 'function') ? getLibraryActivos(AsistenteState.rubroId) : [];
  const bibliotecaHTML = activos.length ? `
    <div class="campo">
      <label>Elegir de mi biblioteca <span class="label-opt">opcional</span></label>
      <select id="asis-biblioteca">
        <option value="">— Escribir manualmente —</option>
        ${activos.map(it => `<option value="${it.id}">${it.nombre}${it.precio ? ' · ' + it.precio : ''}</option>`).join('')}
      </select>
    </div>` : '';

  // Botón de IA de marketing (ia-campanas.js), si está disponible.
  const iaHTML = (typeof generateCampaignContent === 'function') ? `
    <button id="asis-ia" style="width:100%;margin-bottom:14px;padding:10px;border-radius:10px;font-weight:600;
      cursor:pointer;background:var(--surface2,rgba(255,255,255,.06));color:inherit;
      border:1px dashed var(--primary,#C4748A)">✨ Generar textos con IA</button>` : '';

  body.innerHTML =
    `<div class="seccion-titulo" style="margin-bottom:4px">${camp?.icono || ''} ${camp?.nombre || 'Campaña'}</div>
     <p class="campo-hint" style="margin-bottom:14px">${camp?.descripcion || ''}</p>` +
    bibliotecaHTML +
    iaHTML +
    def.campos.map(f => {
      // Valor inicial: default de la campaña si name coincide con un input real.
      const pre = (camp?.textos && f.name in camp.textos) ? camp.textos[f.name] : '';
      const opt = f.opcional ? ' <span class="label-opt">opcional</span>' : (f.requerido ? ' <span style="color:var(--primary,#C4748A)">*</span>' : '');
      const ph  = f.placeholder || '';
      const ctl = f.tipo === 'textarea'
        ? `<textarea id="asis-f-${f.name}" placeholder="${ph}">${pre}</textarea>`
        : `<input type="text" id="asis-f-${f.name}" placeholder="${ph}" value="${pre.replace(/"/g,'&quot;')}">`;
      return `<div class="campo"><label>${f.label}${opt}</label>${ctl}</div>`;
    }).join('');

  // Al elegir un servicio de la biblioteca, autocompletar los campos del wizard.
  const selBib = document.getElementById('asis-biblioteca');
  selBib?.addEventListener('change', () => {
    const it = (typeof findItem === 'function') ? findItem(selBib.value, AsistenteState.rubroId) : null;
    if (!it) return;
    const v = (typeof itemAValores === 'function') ? itemAValores(it, def.campos) : {};
    def.campos.forEach(f => {
      const el = document.getElementById('asis-f-' + f.name);
      if (el && f.name in v) el.value = v[f.name];
    });
  });

  // IA de marketing: usa rubro + Brand Kit + biblioteca + campaña; rellena los campos.
  const btnIA = document.getElementById('asis-ia');
  btnIA?.addEventListener('click', async () => {
    const orig = btnIA.textContent;
    btnIA.disabled = true; btnIA.textContent = '✨ Generando…';
    try {
      const itemSel = (selBib && selBib.value && typeof findItem === 'function')
        ? findItem(selBib.value, AsistenteState.rubroId) : null;
      const content = await generateCampaignContent({ campana: camp, item: itemSel });
      AsistenteState.ultimoContenido = content;   // hashtags/emojis para futuros usos (IG, etc.)
      const v = (typeof contenidoAValores === 'function') ? contenidoAValores(content, def.campos) : {};
      def.campos.forEach(f => {
        const el = document.getElementById('asis-f-' + f.name);
        if (el && f.name in v && v[f.name]) el.value = v[f.name];
      });
    } catch (e) {
      console.warn('IA asistente:', e.message);
    } finally {
      btnIA.disabled = false; btnIA.textContent = orig;
    }
  });

  foot.innerHTML = _btn('← Volver', { id: 'asis-volver' }) + _btn('⚡ Generar flyer', { primario: true, id: 'asis-generar' });
  document.getElementById('asis-volver').addEventListener('click', () => { AsistenteState.paso = 2; _renderAsistente(); });
  document.getElementById('asis-generar').addEventListener('click', () => _asistenteGenerar(camp, def));
}

// ── Generar: reutiliza el motor de campañas ──
function _asistenteGenerar(camp, def) {
  if (!camp) return;

  // Recolectar los valores del formulario.
  const valores = {};
  def.campos.forEach(f => { valores[f.name] = document.getElementById('asis-f-' + f.name)?.value ?? ''; });

  // Traducir a textos de plantilla: construir() si la campaña lo define,
  // si no los valores ya vienen con name = id del input.
  const textos = def.construir ? def.construir(valores) : valores;

  // Merge sobre los textos por defecto de la campaña → los campos que el
  // usuario no completó igual quedan con contenido coherente.
  const campFinal = { ...camp, textos: { ...(camp.textos || {}), ...textos } };

  // aplicarCampana ya hace: plantilla + textos + colores del rubro + render.
  if (typeof aplicarCampana === 'function') aplicarCampana(campFinal);

  cerrarAsistente();

  // Dejar el editor visible para ajustes opcionales (sin forzar modo edición).
  document.querySelector('.stab[data-tab="diseno"]')?.click();
}

// ── API pública ──
function abrirAsistente() {
  _crearModalAsistente();
  // Arrancar en el rubro activo si existe.
  AsistenteState.rubroId = (typeof RubroState !== 'undefined') ? RubroState.id : null;
  AsistenteState.campId  = null;
  AsistenteState.paso    = 1;
  _renderAsistente();
  document.getElementById('modal-asistente').style.display = 'flex';
}

function cerrarAsistente() {
  const m = document.getElementById('modal-asistente');
  if (m) m.style.display = 'none';
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-asistente')?.addEventListener('click', abrirAsistente);

  // Primer uso: abrir el asistente automáticamente en vez del editor.
  // Solo la primera vez (flag en localStorage); usuarios que vuelven van directo al editor.
  try {
    if (!localStorage.getItem('flyerstudio_onboarded')) {
      localStorage.setItem('flyerstudio_onboarded', '1');
      setTimeout(abrirAsistente, 350);   // pequeño delay: dejar que rubros/campañas terminen de cargar
    }
  } catch (e) { /* localStorage bloqueado: ignorar */ }

  // Cerrar con Escape (sin pisar otros modales: sólo si el nuestro está abierto).
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const m = document.getElementById('modal-asistente');
      if (m && m.style.display === 'flex') cerrarAsistente();
    }
  });
});
