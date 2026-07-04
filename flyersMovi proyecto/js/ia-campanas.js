/* ══════════════════════════════════════════════════════
   IA-CAMPANAS.JS — Asistente de marketing (generador de campañas)

   No genera flyers: genera COPY. Usa automáticamente el contexto
   que ya existe y NO vuelve a pedir nada:
     • Rubro          (business-types.js  → getRubroActual)
     • Brand Kit      (brand-kit.js       → getBrand)
     • Biblioteca     (business-library.js→ item elegido)
     • Campaña        (campanas.js        → la campaña seleccionada)

   Función principal:
     generateCampaignContent({ campana, item, rubro, brand }) →
       Promise<{ titulo, subtitulo, cta, descripcion, hashtags[], emojis[] }>

   El objeto es compatible con el asistente: contenidoAValores() lo
   mapea a los campos del wizard. Si hay API key de Gemini se usa;
   si no, un fallback local arma buen copy con el mismo contexto.

   NO toca render, plantillas ni editor. Sólo texto.
   ══════════════════════════════════════════════════════ */

// ── Reunir el contexto disponible (sin pedirlo de nuevo) ──
function _iaContexto({ campana = null, item = null, rubro = null, brand = null } = {}) {
  const r = rubro || (typeof getRubroActual === 'function' ? getRubroActual() : {});
  const b = brand || (typeof getBrand === 'function' ? getBrand() : {});
  return {
    rubro:   r || {},
    brand:   b || {},
    item:    item || null,
    campana: campana || {},
    negocio: (b && b.nombre) || (r && r.nombre) || 'tu negocio',
    servicio: item ? item.nombre : '',
    precio:   item ? item.precio : '',
    precioAnterior: item ? item.precioAnterior : '',
  };
}

// ══════════════════════════════════════════════════
//  API principal
// ══════════════════════════════════════════════════
async function generateCampaignContent(opts = {}) {
  const ctx = _iaContexto(opts);

  // Si hay API key de Gemini, intentar copy real; ante cualquier fallo, fallback.
  if (typeof IAState !== 'undefined' && IAState.tieneKey && IAState.tieneKey()) {
    try {
      const r = await _iaGeminiCopy(ctx);
      if (r && r.titulo) return _normalizarContenido(r);
    } catch (e) {
      console.warn('IA campaña: usando fallback local —', e.message);
    }
  }
  return _fallbackContenido(ctx);
}

function _normalizarContenido(o) {
  return {
    titulo:      o.titulo      || '',
    subtitulo:   o.subtitulo   || '',
    cta:         o.cta         || '',
    descripcion: o.descripcion || '',
    hashtags:    Array.isArray(o.hashtags) ? o.hashtags : (o.hashtags ? String(o.hashtags).split(/\s+/) : []),
    emojis:      Array.isArray(o.emojis)   ? o.emojis   : (o.emojis ? String(o.emojis).split('') : []),
  };
}

// ── Gemini (cliente directo, mismo patrón que ia-real.js) ──
async function _iaGeminiCopy(ctx) {
  const modelo = (typeof IAState !== 'undefined' && IAState.modelo) || 'gemini-2.0-flash';
  const rubroNombre = ctx.rubro.nombre || 'negocio';
  const estilo = (ctx.rubro.estilos || []).join(', ') || 'profesional';
  const prompt =
    `Sos un experto en marketing para ${rubroNombre}. Generá el copy de una campaña de tipo ` +
    `"${ctx.campana.nombre || 'promoción'}" para el negocio "${ctx.negocio}"` +
    (ctx.servicio ? `, sobre el servicio/producto "${ctx.servicio}"` : '') +
    (ctx.precio ? ` (precio ${ctx.precio})` : '') +
    (ctx.brand.eslogan ? `. Eslogan de la marca: "${ctx.brand.eslogan}"` : '') +
    `. Estilo: ${estilo}. Español rioplatense, tono cercano y vendedor. ` +
    `Respondé SOLO con JSON válido, sin markdown, con este formato exacto: ` +
    `{"titulo":"máx 4 palabras","subtitulo":"máx 6 palabras","cta":"llamada a la acción corta",` +
    `"descripcion":"1-2 líneas","hashtags":["#uno","#dos","#tres"],"emojis":["✨","🔥"]}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${IAState.apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.9, maxOutputTokens: 500 },
      }),
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Error Gemini');
  const text  = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Gemini no devolvió JSON');
  return JSON.parse(match[0]);
}

// ══════════════════════════════════════════════════
//  Fallback local — buen copy sin API key, mismo contexto
// ══════════════════════════════════════════════════
const _IA_CTA = {
  'oferta-flash': 'Aprovechá ahora',
  'promo':        'Aprovechá la promo',
  'turnos':       'Reservá tu turno',
  'nuevo-servicio':'Conocé más',
  'servicios':    'Consultá disponibilidad',
  'testimonio':   'Sumate vos también',
  'frase':        'Escribinos',
  'dia-madre':    'Regalá algo especial',
};
const _IA_EMOJIS = {
  estetica: ['💅','✨','💖'], barberia: ['💈','✂️','🔥'], restaurante: ['🍽️','😋','🔥'],
  cafeteria: ['☕','🥐','✨'], ropa: ['👗','🛍️','✨'], veterinaria: ['🐾','❤️','🐶'],
  gimnasio: ['💪','🔥','⚡'], taller: ['🔧','🚗','⚙️'], inmobiliaria: ['🏠','🔑','✨'],
  celulares: ['📱','⚡','🔥'], informatica: ['💻','⚡','🚀'], pasteleria: ['🧁','🎂','😍'],
};

function _slugHash(s) {
  return '#' + String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '');
}

function _fallbackContenido(ctx) {
  const rubroId = ctx.rubro.id || 'estetica';
  const campId  = ctx.campana.id || ctx.campana.plantilla || 'promo';
  const plant   = ctx.campana.plantilla || 'promo';
  const negocio = ctx.negocio;
  const serv    = ctx.servicio;
  const emojis  = _IA_EMOJIS[rubroId] || ['✨','🔥','💫'];
  const kw      = ctx.rubro.keywordsIA || [];

  // Título según haya servicio + tipo de campaña.
  let titulo;
  if (campId.includes('sorteo'))          titulo = serv ? `¡Sorteamos ${serv}!` : '¡Gran sorteo!';
  else if (plant === 'oferta-flash')      titulo = serv ? `${serv} en oferta` : '¡Oferta flash!';
  else if (plant === 'nuevo-servicio')    titulo = serv ? `Nuevo: ${serv}` : 'Nuevo servicio';
  else if (plant === 'turnos')            titulo = '¡Agenda abierta!';
  else if (serv)                          titulo = `${serv} que enamora`;
  else                                    titulo = ctx.campana.nombre || '¡Aprovechá!';

  const subtitulo = ctx.brand.eslogan || `${negocio}${ctx.rubro.nombre ? ' · ' + ctx.rubro.nombre : ''}`;
  const cta = _IA_CTA[plant] || _IA_CTA[campId] || 'Escribinos por WhatsApp';

  // Descripción con precio si existe.
  let descripcion = serv
    ? `Viví la experiencia ${serv.toLowerCase()} en ${negocio}.`
    : `Lo mejor de ${negocio} te está esperando.`;
  if (ctx.precioAnterior && ctx.precio) descripcion += `\nAntes ${ctx.precioAnterior} · Ahora ${ctx.precio}`;
  else if (ctx.precio)                  descripcion += `\nDesde ${ctx.precio}`;

  const hashtags = [
    _slugHash(negocio),
    _slugHash(ctx.rubro.nombre || rubroId),
    ...(serv ? [_slugHash(serv)] : []),
    ...kw.slice(0, 2).map(_slugHash),
  ].filter((h, i, a) => h.length > 1 && a.indexOf(h) === i).slice(0, 6);

  return _normalizarContenido({ titulo, subtitulo, cta, descripcion, hashtags, emojis });
}

// ══════════════════════════════════════════════════
//  Puente contenido IA → campos del asistente
// ══════════════════════════════════════════════════
function contenidoAValores(content, campos) {
  const v = {};
  (campos || []).forEach(f => {
    const n = String(f.name).toLowerCase();
    if      (/titulo|nombre|frase|premio/.test(n)) v[f.name] = content.titulo;
    else if (/subtitulo|slogan|subtexto/.test(n))  v[f.name] = content.subtitulo;
    else if (/cta|accion|acci/.test(n))            v[f.name] = content.cta;
    else if (/desc|servicios|mensaje/.test(n))     v[f.name] = content.descripcion;
    else if (/hasta|fecha|horario/.test(n))        { /* datos que la IA no inventa: se dejan */ }
  });
  return v;
}
