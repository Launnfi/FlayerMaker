/* ══════════════════════════════════════════════════════
   IA-REAL.JS — Integración con Google Gemini
   IMÁGENES → Gemini 2.0 Flash (generación nativa)
   PALETAS  → Gemini 2.0 Flash (texto → JSON)
   ══════════════════════════════════════════════════════ */

const GEMINI_MODELOS = [
  { id: 'gemini-2.0-flash', nombre: 'Gemini 2.0 Flash (rápido)' },
  { id: 'gemini-2.5-flash', nombre: 'Gemini 2.5 Flash (calidad)' },
];

// ── Estado ──
const IAState = {
  get apiKey()       { return localStorage.getItem('flyerstudio_gemini_key') || ''; },
  get modelo()       { return localStorage.getItem('flyerstudio_gemini_modelo') || 'gemini-2.0-flash'; },
  get usarServidor() { return localStorage.getItem('flyerstudio_gemini_servidor') !== 'false'; },

  set apiKey(v)        { localStorage.setItem('flyerstudio_gemini_key', v); },
  set modelo(v)        { localStorage.setItem('flyerstudio_gemini_modelo', v); },
  set usarServidor(v)  { localStorage.setItem('flyerstudio_gemini_servidor', v ? 'true' : 'false'); },

  tieneKey() { return this.apiKey.trim().length > 10; },
};

// ══════════════════════════════════════════════════
//  GENERACIÓN DE IMAGEN — Gemini
// ══════════════════════════════════════════════════

async function iaGenerarImagenFondo(promptUsuario, onProgress) {
  const prompt = construirPromptImagen(promptUsuario);
  // Solo Gemini 2.0 Flash soporta generación nativa de imágenes
  const modelo = 'gemini-2.0-flash';

  // Intentar vía servidor proxy
  if (IAState.usarServidor) {
    try {
      if (onProgress) onProgress('Generando con Imagen 3...');
      const res = await fetch('/api/gemini/generar-imagen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (res.ok) return { data: data.data, mimeType: data.mimeType };
      if (res.status !== 400 || !data.error?.includes('key no configurada')) throw new Error(data.error);
      // Si dice "key no configurada", fallback a cliente
    } catch (e) {
      if (e.message.includes('key no configurada')) {
        if (onProgress) onProgress('Servidor sin key, usando cliente...');
      } else {
        throw e;
      }
    }
  }

  // Fallback vía cliente (API key en localStorage)
  if (!IAState.tieneKey()) {
    throw new Error('Gemini/Imagen no está configurado. Configurá tu API key en config.json.');
  }

  if (onProgress) onProgress('Generando imagen con Gemini...');
  const modelos = ['gemini-2.5-flash-image', 'gemini-3.1-flash-image-preview', 'gemini-3-pro-image-preview'];

  for (const modelo of modelos) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${IAState.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        const msg = data.error?.message || '';
        if (msg.includes('not support') || msg.includes('not found')) continue;
        throw new Error(msg);
      }

      const part = data.candidates?.[0]?.content?.parts?.find(p => p.inlineData?.mimeType?.startsWith('image/'));
      if (part) return { data: part.inlineData.data, mimeType: part.inlineData.mimeType };
    } catch { continue; }
  }

  throw new Error('No hay modelo Gemini disponible para generar imágenes. Probá con Pollinations o configurá Vertex AI.');
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

  return `Generá una imagen de fondo abstracto para un flyer de ${rubro}. ` +
    `Tema: ${base}. ` +
    `Paleta de colores: ${colorNombre}. ` +
    `Estética ${estetica}. ` +
    `Sin texto, sin caras, sin logos. ` +
    `Formato cuadrado. ` +
    `La imagen debe verse profesional, apta para Instagram.`;
}

// ══════════════════════════════════════════════════
//  SUGERENCIA DE PALETAS — Gemini
// ══════════════════════════════════════════════════

async function iaSugerirColores() {
  const ind        = (typeof IndustriaState !== 'undefined') ? IndustriaState.actual() : null;
  const brandingRol = ind?.brandingRol || 'salones de belleza';
  const negocio = document.getElementById('inp-negocio')?.value || ind?.nombre || 'estética de belleza';
  const modelo  = IAState.modelo;

  // Intentar vía servidor proxy
  if (IAState.usarServidor) {
    try {
      const res = await fetch('/api/gemini/sugerir-paletas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ negocio, modelo, brandingRol }),
      });
      const data = await res.json();
      if (res.ok) return data;
      if (res.status !== 400 || !data.error?.includes('key no configurada')) throw new Error(data.error);
    } catch (e) {
      if (!e.message.includes('key no configurada')) throw e;
    }
  }

  // Fallback vía cliente
  if (!IAState.tieneKey()) {
    throw new Error('Configurá tu API key de Gemini para usar esta función.');
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${IAState.apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Sos un diseñador experto en branding para ${brandingRol}. Sugerí 4 paletas de colores distintas y elegantes para el negocio "${negocio}". Respondé SOLO con JSON válido, sin texto extra ni markdown. Formato: {"paletas":[{"nombre":"string","principal":"#HEX","fondo":"#HEX","acento":"#HEX","descripcion":"máx 8 palabras"}]}`,
          }],
        }],
        generationConfig: { temperature: 0.85, maxOutputTokens: 600 },
      }),
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || `Error ${res.status}`);

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Gemini no devolvió JSON válido. Intentá de nuevo.');

  try {
    return { paletas: JSON.parse(match[0]).paletas || [] };
  } catch {
    throw new Error('Error parseando la respuesta de Gemini.');
  }
}

// ══════════════════════════════════════════════════
//  CARGAR IMAGEN (base64 desde Gemini)
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
  if (IAState.tieneKey() || IAState.usarServidor) {
    badge.textContent = `● Gemini (${modo})`;
    badge.className = 'ia-status-badge conectada';
  } else {
    badge.textContent = '○ Gemini sin configurar';
    badge.className = 'ia-status-badge';
  }

  if (btnImg) btnImg.disabled = false;
  if (btnCol) btnCol.disabled = !IAState.tieneKey() && !IAState.usarServidor;
  if (btnImg) btnImg.textContent = '✦ Generar fondo con Gemini';
}

function renderizarUIIaReal() {
  const inputKey  = document.getElementById('ia-api-key');
  const selModelo = document.getElementById('ia-modelo-img');

  if (inputKey)  inputKey.value  = IAState.tieneKey() ? '••••••••••••' : '';
  if (selModelo) selModelo.value = IAState.modelo;

  actualizarEstadoUI();
}

// ══════════════════════════════════════════════════
//  EVENT LISTENERS
// ══════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  // Guardar API key de Gemini (fallback cliente)
  document.getElementById('btn-ia-guardar-key')?.addEventListener('click', () => {
    const input = document.getElementById('ia-api-key');
    const val   = input?.value?.trim();
    if (!val || val === '••••••••••••') { mostrarToast('Ingresá una API key válida'); return; }
    IAState.apiKey = val;
    input.value    = '••••••••••••';
    actualizarEstadoUI();
    mostrarToast('✓ API key de Gemini guardada');
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

  // Limpiar key
  document.getElementById('btn-ia-limpiar-key')?.addEventListener('click', () => {
    if (!confirm('¿Eliminás la API key guardada?')) return;
    localStorage.removeItem('flyerstudio_gemini_key');
    const input = document.getElementById('ia-api-key');
    if (input) input.value = '';
    actualizarEstadoUI();
    mostrarToast('Key eliminada');
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
        mostrarToast('✓ Fondo generado por Imagen 3 aplicado al flyer');
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
    if (btn) { btn.disabled = false; btn.textContent = '✦ Generar fondo con Imagen 3'; }
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
    mostrarToast(`✓ ${resultado.paletas?.length || 0} paletas sugeridas por Gemini`);
  } catch (err) {
    console.error(err);
    if (errorEl) { errorEl.textContent = err.message; errorEl.style.display = 'block'; }
    mostrarToast('Error al sugerir colores');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '✦ Sugerir paletas con Gemini'; }
    if (document.getElementById('btn-ia-generar-img')) {
      document.getElementById('btn-ia-generar-img').textContent = '✦ Generar fondo con Gemini';
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
