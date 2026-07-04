/* ══════════════════════════════════════════════════════
   IA-REAL.JS — Integración con Hugging Face Inference
   IMÁGENES → router.huggingface.co (FLUX.1 / SDXL)
   PALETAS  → chat completions (texto → JSON)
   Necesita token de Hugging Face (hf_...). Server-first.
   ══════════════════════════════════════════════════════ */

const HF_MODELOS = [
  { id: 'black-forest-labs/FLUX.1-schnell', nombre: 'FLUX.1 Schnell (rápido)' },
  { id: 'black-forest-labs/FLUX.1-dev',     nombre: 'FLUX.1 Dev (calidad)' },
];

// Providers de imagen a probar en orden (endpoint OpenAI-style images/generations).
const HF_IMAGE_PROVIDERS = ['together', 'nscale'];

// Modelo de texto (chat) para las paletas cuando se genera desde el cliente.
const HF_TEXT_MODEL = 'meta-llama/Llama-3.1-8B-Instruct';

// ── Estado ──
const IAState = {
  get token()        { return localStorage.getItem('flyerstudio_hf_token') || ''; },
  get modelo()       { return localStorage.getItem('flyerstudio_hf_modelo') || 'black-forest-labs/FLUX.1-schnell'; },
  get usarServidor() { return localStorage.getItem('flyerstudio_hf_servidor') !== 'false'; },

  set token(v)         { localStorage.setItem('flyerstudio_hf_token', v); },
  set modelo(v)        { localStorage.setItem('flyerstudio_hf_modelo', v); },
  set usarServidor(v)  { localStorage.setItem('flyerstudio_hf_servidor', v ? 'true' : 'false'); },

  tieneToken() { return this.token.trim().length > 10; },
};

// ══════════════════════════════════════════════════
//  GENERACIÓN DE IMAGEN — Hugging Face
// ══════════════════════════════════════════════════

async function iaGenerarImagenFondo(promptUsuario, onProgress) {
  const prompt = construirPromptImagen(promptUsuario);
  const modelo = IAState.modelo;

  // Intentar vía servidor proxy (respeta cupo/plan, evita CORS y no expone el token).
  if (IAState.usarServidor) {
    try {
      if (onProgress) onProgress('Generando con Hugging Face...');
      const res = await fetch('/api/ia/generar-imagen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, modelo }),
      });
      const data = await res.json();
      if (res.ok) return { data: data.data, mimeType: data.mimeType };
      // Si el server no tiene token, probamos con el del cliente; el resto son errores de negocio.
      if (res.status !== 400 || !data.error?.includes('token no configurado')) throw new Error(data.error);
      if (onProgress) onProgress('Servidor sin token, usando cliente...');
    } catch (e) {
      if (!e.message.includes('token no configurado')) throw e;
    }
  }

  // Fallback vía cliente (token en localStorage). Puede fallar por CORS.
  if (!IAState.tieneToken()) {
    throw new Error('Configurá tu token de Hugging Face en config.json o en el panel.');
  }

  if (onProgress) onProgress('Generando imagen con Hugging Face...');
  // Endpoint OpenAI-style images/generations; se prueban varios providers.
  let ultimoError = 'Ningún provider pudo generar la imagen.';
  for (const provider of HF_IMAGE_PROVIDERS) {
    const res = await fetch(`https://router.huggingface.co/${provider}/v1/images/generations`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${IAState.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model: modelo, prompt, response_format: 'b64_json' }),
    }).catch(e => { ultimoError = e.message; return null; });
    if (!res) continue;

    const data = await res.json().catch(() => ({}));
    if (!res.ok) { ultimoError = data.error?.message || data.error || `provider ${provider} ${res.status}`; continue; }

    const b64 = data.data?.[0]?.b64_json;
    if (!b64) { ultimoError = `provider ${provider} no devolvió imagen`; continue; }
    return { data: b64, mimeType: mimeDesdeBase64(b64) };
  }
  throw new Error(`Hugging Face: ${ultimoError}`);
}

// Detecta el MIME de una imagen a partir de sus primeros bytes en base64.
function mimeDesdeBase64(b64) {
  if (b64.startsWith('iVBORw0KGgo')) return 'image/png';
  if (b64.startsWith('/9j/'))        return 'image/jpeg';
  if (b64.startsWith('UklGR'))       return 'image/webp';
  return 'image/png';
}

// Nombre aproximado de un color a partir de su hex (independiente de la industria).
function nombreColorES(hex) {
  const { r, g, b } = hexToRgb(hex);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  if (d < 25) return max > 200 ? 'blanco' : max < 70 ? 'negro' : 'gris';
  let h;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h = Math.round(h * 60); if (h < 0) h += 360;
  const rangos = [[15,'rojo'],[45,'naranja'],[70,'amarillo'],[160,'verde'],[200,'cian'],[255,'azul'],[290,'violeta'],[335,'rosa'],[360,'rojo']];
  for (const [lim, n] of rangos) if (h <= lim) return n;
  return 'color neutro';
}

function construirPromptImagen(textoUsuario) {
  const colorP = document.getElementById('color-principal')?.value || '#C4748A';
  const colorA = document.getElementById('color-acento')?.value    || '#D4A853';
  const colorNombre = `tonos ${nombreColorES(colorP)} con acentos ${nombreColorES(colorA)}`;

  const ind  = (typeof IndustriaState !== 'undefined') ? IndustriaState.actual() : null;
  const rubro    = ind?.promptImagen     || 'estética de belleza';
  const baseDef  = ind?.promptImagenBase || 'elegant abstract background for a luxury beauty salon';
  const estetica = ind?.estetica         || 'suave y lujosa';

  const base = textoUsuario?.trim() || baseDef;

  return `Fondo abstracto para un flyer de ${rubro}. ` +
    `Tema: ${base}. ` +
    `Paleta de colores: ${colorNombre}. ` +
    `Estética ${estetica}. ` +
    `Sin texto, sin caras, sin logos. ` +
    `Formato cuadrado. ` +
    `Aspecto profesional, apto para Instagram.`;
}

// ══════════════════════════════════════════════════
//  SUGERENCIA DE PALETAS — Hugging Face
// ══════════════════════════════════════════════════

async function iaSugerirColores() {
  const ind        = (typeof IndustriaState !== 'undefined') ? IndustriaState.actual() : null;
  const brandingRol = ind?.brandingRol || 'salones de belleza';
  const negocio = document.getElementById('inp-negocio')?.value || ind?.nombre || 'estética de belleza';

  // Intentar vía servidor proxy
  if (IAState.usarServidor) {
    try {
      const res = await fetch('/api/ia/sugerir-paletas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ negocio, brandingRol }),
      });
      const data = await res.json();
      if (res.ok) return data;
      if (res.status !== 400 || !data.error?.includes('token no configurado')) throw new Error(data.error);
    } catch (e) {
      if (!e.message.includes('token no configurado')) throw e;
    }
  }

  // Fallback vía cliente
  if (!IAState.tieneToken()) {
    throw new Error('Configurá tu token de Hugging Face para usar esta función.');
  }

  const res = await fetch('https://router.huggingface.co/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${IAState.token}`,
    },
    body: JSON.stringify({
      model: HF_TEXT_MODEL,
      messages: [{
        role: 'user',
        content: `Sos un diseñador experto en branding para ${brandingRol}. Sugerí 4 paletas de colores distintas y elegantes para el negocio "${negocio}". Respondé SOLO con JSON válido, sin texto extra ni markdown. Formato: {"paletas":[{"nombre":"string","principal":"#HEX","fondo":"#HEX","acento":"#HEX","descripcion":"máx 8 palabras"}]}`,
      }],
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || data.error || `Error ${res.status}`);

  const text = data.choices?.[0]?.message?.content || '';
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Hugging Face no devolvió JSON válido. Intentá de nuevo.');

  try {
    return { paletas: JSON.parse(match[0]).paletas || [] };
  } catch {
    throw new Error('Error parseando la respuesta de Hugging Face.');
  }
}

// ══════════════════════════════════════════════════
//  CARGAR IMAGEN (base64 desde Hugging Face)
// ══════════════════════════════════════════════════

function cargarImagenIA(base64Data, mimeType, onSuccess, onError) {
  const img = new Image();
  img.crossOrigin = 'anonymous';

  img.onload = () => {
    try {
      const t = document.createElement('canvas');
      t.width = t.height = 4;
      t.getContext('2d').drawImage(img, 0, 0, 4, 4);
      t.getContext('2d').getImageData(0, 0, 4, 4);
      onSuccess(img);
    } catch {
      mostrarImagenSoloVisual(base64Data, mimeType);
      onError(new Error('La imagen cargó pero CORS impide usarla en el canvas.'));
    }
  };

  img.onerror = () => onError(new Error('No se pudo cargar la imagen generada.'));
  img.src = `data:${mimeType || 'image/png'};base64,${base64Data}`;
}

function mostrarImagenSoloVisual(base64Data, mimeType) {
  const preview = document.getElementById('ia-img-preview');
  if (preview) {
    preview.src = `data:${mimeType || 'image/png'};base64,${base64Data}`;
    preview.style.display = 'block';
  }
}

// ══════════════════════════════════════════════════
//  UI
// ══════════════════════════════════════════════════

function actualizarEstadoUI() {
  const badge  = document.getElementById('ia-status-badge');
  const btnImg = document.getElementById('btn-ia-generar-img');
  const btnCol = document.getElementById('btn-ia-colores');

  if (!badge) return;

  const modo = IAState.usarServidor ? 'Servidor' : 'Cliente';
  if (IAState.tieneToken() || IAState.usarServidor) {
    badge.textContent = `● Hugging Face (${modo})`;
    badge.className = 'ia-status-badge conectada';
  } else {
    badge.textContent = '○ Hugging Face sin configurar';
    badge.className = 'ia-status-badge';
  }

  if (btnImg) btnImg.disabled = false;
  if (btnCol) btnCol.disabled = !IAState.tieneToken() && !IAState.usarServidor;
  if (btnImg) btnImg.textContent = '✦ Generar fondo con Hugging Face';
}

function renderizarUIIaReal() {
  const inputToken = document.getElementById('ia-api-key');
  const selModelo  = document.getElementById('ia-modelo-img');

  if (inputToken) inputToken.value = IAState.tieneToken() ? '••••••••••••' : '';
  if (selModelo)  selModelo.value  = IAState.modelo;

  actualizarEstadoUI();
}

// ══════════════════════════════════════════════════
//  EVENT LISTENERS
// ══════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  // Guardar token de Hugging Face (fallback cliente)
  document.getElementById('btn-ia-guardar-key')?.addEventListener('click', () => {
    const input = document.getElementById('ia-api-key');
    const val   = input?.value?.trim();
    if (!val || val === '••••••••••••') { mostrarToast('Ingresá un token válido'); return; }
    IAState.token = val;
    input.value   = '••••••••••••';
    actualizarEstadoUI();
    mostrarToast('✓ Token de Hugging Face guardado');
  });

  document.getElementById('ia-api-key')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('btn-ia-guardar-key')?.click();
  });

  // Toggle modo servidor vs cliente
  document.getElementById('ia-usar-servidor')?.addEventListener('change', e => {
    IAState.usarServidor = e.target.checked;
    actualizarEstadoUI();
  });

  // Cambiar modelo
  document.getElementById('ia-modelo-img')?.addEventListener('change', e => {
    IAState.modelo = e.target.value;
  });

  // Limpiar token
  document.getElementById('btn-ia-limpiar-key')?.addEventListener('click', () => {
    if (!confirm('¿Eliminás el token guardado?')) return;
    localStorage.removeItem('flyerstudio_hf_token');
    const input = document.getElementById('ia-api-key');
    if (input) input.value = '';
    actualizarEstadoUI();
    mostrarToast('Token eliminado');
  });

  // Generar imagen
  document.getElementById('btn-ia-generar-img')
    ?.addEventListener('click', ejecutarGeneracionImagen);

  // Sugerir colores
  document.getElementById('btn-ia-colores')
    ?.addEventListener('click', ejecutarSugerenciaColores);

  // Quitar fondo IA
  document.getElementById('btn-ia-real-quitar')?.addEventListener('click', () => {
    State.fondoImg    = null;
    State.fondoActivo = 'color';
    document.getElementById('btn-ia-real-quitar').style.display = 'none';
    const p = document.getElementById('ia-img-preview'); if (p) p.style.display = 'none';
    const e = document.getElementById('ia-error');       if (e) e.style.display = 'none';
    generarFlyer();
    mostrarToast('Fondo eliminado');
  });

  renderizarUIIaReal();
});

// ══════════════════════════════════════════════════
//  EJECUCIÓN — Imagen
// ══════════════════════════════════════════════════

let _generando = false;

async function ejecutarGeneracionImagen() {
  if (_generando) return;
  _generando = true;

  const prompt  = document.getElementById('ia-img-prompt')?.value?.trim() || '';
  const btn     = document.getElementById('btn-ia-generar-img');
  const preview = document.getElementById('ia-img-preview');
  const errorEl = document.getElementById('ia-error');

  if (errorEl) { errorEl.style.display = 'none'; }
  if (preview) preview.style.display = 'none';
  if (btn)     { btn.disabled = true; btn.textContent = '⏳ Generando imagen...'; }

  try {
    const result = await iaGenerarImagenFondo(prompt, (msg) => {
      if (btn) btn.textContent = '⏳ ' + msg;
    });

    if (preview) {
      preview.src = `data:${result.mimeType || 'image/png'};base64,${result.data}`;
      preview.style.display = 'block';
    }

    cargarImagenIA(
      result.data,
      result.mimeType,
      img => {
        State.fondoImg    = img;
        State.fondoActivo = 'imagen';
        document.getElementById('btn-ia-real-quitar').style.display = '';
        generarFlyer();
        mostrarToast('✓ Fondo generado por Hugging Face aplicado al flyer');
      },
      err => {
        document.getElementById('btn-ia-real-quitar').style.display = '';
        console.warn('CORS:', err.message);
      }
    );

  } catch (err) {
    console.error(err);
    if (errorEl) { errorEl.textContent = err.message; errorEl.style.display = 'block'; }
    mostrarToast('Error: ' + err.message);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '✦ Generar fondo con Hugging Face'; }
    _generando = false;
  }
}

// ══════════════════════════════════════════════════
//  EJECUCIÓN — Paletas de colores
// ══════════════════════════════════════════════════

async function ejecutarSugerenciaColores() {
  const btn      = document.getElementById('btn-ia-colores');
  const panelRes = document.getElementById('ia-paletas-resultado');
  const errorEl  = document.getElementById('ia-error');

  if (errorEl) errorEl.style.display = 'none';
  if (btn)     { btn.disabled = true; btn.textContent = '⏳ Pensando...'; }

  try {
    const resultado = await iaSugerirColores();
    renderizarPaletasIA(panelRes, resultado.paletas || []);
    mostrarToast(`✓ ${resultado.paletas?.length || 0} paletas sugeridas por Hugging Face`);
  } catch (err) {
    console.error(err);
    if (errorEl) { errorEl.textContent = err.message; errorEl.style.display = 'block'; }
    mostrarToast('Error al sugerir colores');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '✦ Sugerir paletas con Hugging Face'; }
    if (document.getElementById('btn-ia-generar-img')) {
      document.getElementById('btn-ia-generar-img').textContent = '✦ Generar fondo con Hugging Face';
    }
  }
}

// ══════════════════════════════════════════════════
//  RENDER DE PALETAS
// ══════════════════════════════════════════════════

function renderizarPaletasIA(container, paletas) {
  if (!container || !paletas.length) return;
  container.style.display = 'flex';
  container.innerHTML = paletas.map(p => {
    const pr = /^#[0-9A-Fa-f]{6}$/.test(p.principal) ? p.principal : '#C4748A';
    const pf = /^#[0-9A-Fa-f]{6}$/.test(p.fondo)     ? p.fondo     : '#1A1018';
    const pa = /^#[0-9A-Fa-f]{6}$/.test(p.acento)    ? p.acento    : '#D4A853';
    return `
      <div class="ia-paleta-card">
        <div class="ia-paleta-colores">
          <div class="ia-paleta-muestra" style="background:${pf}" title="Fondo"></div>
          <div class="ia-paleta-muestra" style="background:${pr}" title="Principal"></div>
          <div class="ia-paleta-muestra" style="background:${pa}" title="Acento"></div>
        </div>
        <div class="ia-paleta-info">
          <div class="ia-paleta-nombre">${p.nombre || 'Paleta'}</div>
          <div class="ia-paleta-desc">${p.descripcion || ''}</div>
        </div>
        <button class="btn-ia-aplicar-paleta"
          onclick="aplicarPaletaIA('${pr}','${pf}','${pa}')">Aplicar</button>
      </div>`;
  }).join('');
}

function aplicarPaletaIA(principal, fondo, acento) {
  const set = (id, val) => {
    const p = document.getElementById(id);         if (p) p.value = val;
    const t = document.getElementById(id + '-txt'); if (t) t.value = val;
  };
  set('color-principal', principal);
  set('color-fondo',     fondo);
  set('color-acento',    acento);
  generarFlyer();
  mostrarToast('✓ Paleta aplicada');
}

// ══════════════════════════════════════════════════
//  TOAST
// ══════════════════════════════════════════════════

function mostrarToast(msg) {
  let t = document.getElementById('fs-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'fs-toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('visible');
  clearTimeout(t._to);
  t._to = setTimeout(() => t.classList.remove('visible'), 3500);
}
