const http = require('http');
const fs   = require('fs');
const path = require('path');
const cp   = require('child_process');

const ROOT = __dirname;
const PORT = 3000;

// ── Cargar configuración ──
let CONFIG = { mercadopago_access_token: '', gemini_api_key: '' };
try {
  CONFIG = JSON.parse(fs.readFileSync(path.join(ROOT, 'config.json'), 'utf8'));
} catch { /* usar defaults */ }

const MP_ACCESS_TOKEN = CONFIG.mercadopago_access_token || '';
const GEMINI_API_KEY  = CONFIG.gemini_api_key || '';
// URL pública de la app (para las back_urls de MercadoPago). En local queda
// localhost; en producción poné el dominio https real en config.json (app_url).
const APP_URL = (CONFIG.app_url || `http://localhost:${PORT}`).replace(/\/$/, '');
const APP_ES_LOCAL = /^https?:\/\/(localhost|127\.0\.0\.1)/.test(APP_URL);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.json': 'application/json',
};

// ── Helpers ──
function leerBody(req) {
  return new Promise((resolve, reject) => {
    let chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString()));
    req.on('error', reject);
  });
}

function jsonRes(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(data));
}

function htmlRes(res, status, html) {
  res.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

// ── Servir archivos estáticos ──
function servirArchivo(res, urlPath) {
  const rel = urlPath === '/' || urlPath === '' ? '/index.html' : urlPath;
  const file = path.join(ROOT, decodeURIComponent(rel));
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end('Forbidden'); return; }
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found: ' + rel);
      return;
    }
    const ext  = path.extname(file).toLowerCase();
    const mime = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type':                mime,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control':               'no-cache',
    });
    res.end(data);
  });
}

// ═══════════════════════════════════════════════
//  API ROUTES
// ═══════════════════════════════════════════════

async function rutearAPI(req, res, urlPath) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    });
    res.end();
    return true;
  }

  // ─── MERCADOPAGO ───────────────────────────
  if (urlPath === '/api/mercadopago/crear-preferencia' && req.method === 'POST') {
    const body = JSON.parse(await leerBody(req));
    const { plan } = body;

    const precios = { pro: 12, premium: 29 };
    const titulos = { pro: 'FlyerStudio Pro', premium: 'FlyerStudio Premium' };
    const preciosId = { pro: 'plan-pro-mensual', premium: 'plan-premium-mensual' };

    if (!precios[plan]) {
      jsonRes(res, 400, { error: 'Plan inválido' });
      return true;
    }

    try {
      const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          items: [{
            id: preciosId[plan],
            title: titulos[plan],
            quantity: 1,
            currency_id: 'ARS',
            unit_price: precios[plan],
          }],
          payer: { email: '' },
          back_urls: {
            success: `${APP_URL}/?mp_success=1&mp_plan=${plan}`,
            failure: `${APP_URL}/?mp_failure=1`,
            pending: `${APP_URL}/?mp_pending=1&mp_plan=${plan}`,
          },
          // MercadoPago rechaza auto_return con back_urls en localhost; sólo lo
          // mandamos cuando la app tiene una URL pública (producción).
          ...(APP_ES_LOCAL ? {} : { auto_return: 'approved' }),
          external_reference: `plan_${plan}_${Date.now()}`,
          notification_url: `${APP_URL}/api/mercadopago/webhook`,
        }),
      });

      const data = await mpRes.json();
      if (!mpRes.ok) {
        jsonRes(res, 500, { error: data.message || 'Error al crear preferencia' });
        return true;
      }

      jsonRes(res, 200, { init_point: data.init_point, preference_id: data.id });
    } catch (err) {
      jsonRes(res, 500, { error: err.message });
    }
    return true;
  }

  if (urlPath === '/api/mercadopago/webhook' && req.method === 'POST') {
    const body = JSON.parse(await leerBody(req));
    console.log('MP Webhook:', JSON.stringify(body, null, 2));
    jsonRes(res, 200, { ok: true });
    return true;
  }

  // Verifica un pago real contra la API de MercadoPago.
  // El cliente NO debe confiar en los query params de back_urls (se pueden
  // falsificar): al volver, llama acá con el payment_id que agrega MP y sólo
  // activa el plan si MercadoPago confirma status=approved.
  if (urlPath === '/api/mercadopago/verificar' && req.method === 'GET') {
    const paymentId = new URL(req.url, `http://localhost:${PORT}`).searchParams.get('payment_id');
    if (!paymentId) { jsonRes(res, 400, { error: 'Falta payment_id' }); return true; }
    if (!MP_ACCESS_TOKEN) { jsonRes(res, 400, { error: 'MercadoPago no configurado en config.json' }); return true; }

    try {
      const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`, {
        headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` },
      });
      const data = await mpRes.json();
      if (!mpRes.ok) { jsonRes(res, 502, { error: data.message || 'Error consultando el pago' }); return true; }

      // external_reference = plan_<plan>_<timestamp> (lo seteamos en crear-preferencia)
      const ref  = data.external_reference || '';
      const plan = (ref.match(/^plan_(pro|premium)_/) || [])[1] || null;

      jsonRes(res, 200, {
        status:   data.status,               // approved | pending | in_process | rejected | ...
        approved: data.status === 'approved',
        plan,
      });
    } catch (err) {
      jsonRes(res, 500, { error: err.message });
    }
    return true;
  }

  // ─── GEMINI: GENERAR IMAGEN ────────────────
  if (urlPath === '/api/gemini/generar-imagen' && req.method === 'POST') {
    if (!GEMINI_API_KEY) {
      jsonRes(res, 400, { error: 'Gemini API key no configurada en config.json' });
      return true;
    }

    const body = JSON.parse(await leerBody(req));
    // El cliente (construirPromptImagen) ya arma el prompt completo con la industria.
    // Se usa tal cual; sólo hay un fallback genérico si llega vacío.
    const prompt = body.prompt
      || 'Generá una imagen de fondo abstracto y profesional para un flyer. Sin texto, sin caras, sin logos. Formato cuadrado.';

    // Probar modelos con soporte de imagen
    const modelosAProbar = ['gemini-2.5-flash-image', 'gemini-3.1-flash-image-preview', 'gemini-3-pro-image-preview'];

    for (const modelo of modelosAProbar) {
      try {
        const gemRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: prompt }],
              }],
              generationConfig: {
                responseModalities: ['IMAGE', 'TEXT'],
              },
            }),
          }
        );

        const data = await gemRes.json();
        if (!gemRes.ok) {
          const msg = data.error?.message || '';
          if (msg.includes('not support') || msg.includes('not found')) continue;
          jsonRes(res, 500, { error: msg });
          return true;
        }

        const part = data.candidates?.[0]?.content?.parts?.find(p => p.inlineData?.mimeType?.startsWith('image/'));
        if (part) {
          jsonRes(res, 200, { mimeType: part.inlineData.mimeType, data: part.inlineData.data });
          return true;
        }
      } catch { continue; }
    }

    jsonRes(res, 500, { error: 'Ningún modelo Gemini disponible soporta generación de imágenes. Usá Pollinations o configurá Vertex AI.' });
    return true;
  }

  // ─── GEMINI: SUGERIR PALETAS ───────────────
  if (urlPath === '/api/gemini/sugerir-paletas' && req.method === 'POST') {
    if (!GEMINI_API_KEY) {
      jsonRes(res, 400, { error: 'Gemini API key no configurada en config.json' });
      return true;
    }

    const body = JSON.parse(await leerBody(req));
    const negocio     = body.negocio     || 'estética de belleza';
    const brandingRol = body.brandingRol || 'salones de belleza';

    try {
      const gemRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Sos un diseñador experto en branding para ${brandingRol}. Sugerí 4 paletas de colores distintas y elegantes para el negocio "${negocio}". Respondé SOLO con JSON válido, sin texto extra ni markdown. Formato: {"paletas":[{"nombre":"string","principal":"#HEX","fondo":"#HEX","acento":"#HEX","descripcion":"máx 8 palabras"}]}`,
              }],
            }],
            generationConfig: {
              temperature: 0.85,
              maxOutputTokens: 600,
            },
          }),
        }
      );

      const data = await gemRes.json();
      if (!gemRes.ok) {
        jsonRes(res, 500, { error: data.error?.message || 'Error Gemini' });
        return true;
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) {
        jsonRes(res, 500, { error: 'Gemini no devolvió JSON válido' });
        return true;
      }

      jsonRes(res, 200, { paletas: JSON.parse(match[0]).paletas || [] });
    } catch (err) {
      jsonRes(res, 500, { error: err.message });
    }
    return true;
  }

  return false; // no es una ruta API
}

// ═══════════════════════════════════════════════
//  SERVER
// ═══════════════════════════════════════════════

http.createServer(async (req, res) => {
  const urlPath = req.url.split('?')[0];

  // Intentar rutear como API
  const esAPI = await rutearAPI(req, res, urlPath);
  if (esAPI) return;

  // Sino, servir archivo estático
  servirArchivo(res, urlPath);

}).listen(PORT, '127.0.0.1', () => {
  console.log(`\n  ✦ FlyerStudio corriendo en http://localhost:${PORT}\n`);
  console.log(`  Directorio: ${ROOT}\n`);
  console.log('  Presiona Ctrl+C para cerrar\n');

  const url = `http://localhost:${PORT}`;
  const cmd = process.platform === 'win32' ? `start ${url}`
    : process.platform === 'darwin' ? `open ${url}`
    : `xdg-open ${url}`;
  cp.exec(cmd);
});
