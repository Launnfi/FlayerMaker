/* ══════════════════════════════════════════════════════
   AUTH.JS — Autenticación (Google OAuth) + store de usuarios
   Sin dependencias externas: sólo módulos nativos de Node.
   ══════════════════════════════════════════════════════ */

const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');

// ── Store de usuarios en archivo JSON ──
// Estructura: { users: [ { id, googleId, email, nombre, picture, plan, createdAt, updatedAt } ] }
function crearStore(rootDir) {
  const FILE = path.join(rootDir, 'usuarios.json');

  function cargar() {
    try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); }
    catch { return { users: [] }; }
  }
  function guardar(data) {
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
  }

  return {
    findById(id) {
      return cargar().users.find(u => u.id === id) || null;
    },
    findByGoogleId(googleId) {
      return cargar().users.find(u => u.googleId === googleId) || null;
    },
    // Busca por googleId; si no existe lo crea. Devuelve el usuario.
    upsertGoogle(perfil) {
      const data = cargar();
      let u = data.users.find(x => x.googleId === perfil.googleId)
           || data.users.find(x => x.email && x.email === perfil.email);
      const ahora = new Date().toISOString();
      if (u) {
        u.googleId = perfil.googleId;
        u.email    = perfil.email   || u.email;
        u.nombre   = perfil.nombre  || u.nombre;
        u.picture  = perfil.picture || u.picture;
        u.updatedAt = ahora;
      } else {
        u = {
          id:        crypto.randomUUID(),
          googleId:  perfil.googleId,
          email:     perfil.email  || '',
          nombre:    perfil.nombre || '',
          picture:   perfil.picture || '',
          plan:      'basico',
          createdAt: ahora,
          updatedAt: ahora,
        };
        data.users.push(u);
      }
      guardar(data);
      return u;
    },
    setPlan(userId, plan) {
      const data = cargar();
      const u = data.users.find(x => x.id === userId);
      if (!u) return null;
      u.plan = plan;
      u.updatedAt = new Date().toISOString();
      guardar(data);
      return u;
    },
  };
}

// ── Sesión: cookie firmada con HMAC (stateless) ──
function crearSesiones(secret) {
  const b64u = (buf) => Buffer.from(buf).toString('base64url');

  function firmar(payload) {
    const data = b64u(JSON.stringify(payload));
    const sig  = crypto.createHmac('sha256', secret).update(data).digest('base64url');
    return `${data}.${sig}`;
  }
  function verificar(token) {
    if (!token || typeof token !== 'string') return null;
    const [data, sig] = token.split('.');
    if (!data || !sig) return null;
    const esperado = crypto.createHmac('sha256', secret).update(data).digest('base64url');
    const a = Buffer.from(sig), b = Buffer.from(esperado);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    try {
      const p = JSON.parse(Buffer.from(data, 'base64url').toString());
      if (p.exp && Date.now() > p.exp) return null;
      return p;
    } catch { return null; }
  }
  return { firmar, verificar };
}

// ── Helpers de cookies ──
function parseCookies(req) {
  const raw = req.headers.cookie || '';
  const out = {};
  raw.split(';').forEach(par => {
    const i = par.indexOf('=');
    if (i > -1) out[par.slice(0, i).trim()] = decodeURIComponent(par.slice(i + 1).trim());
  });
  return out;
}
function cookieHeader(nombre, valor, { maxAge, secure, borrar } = {}) {
  const partes = [`${nombre}=${borrar ? '' : encodeURIComponent(valor)}`, 'Path=/', 'HttpOnly', 'SameSite=Lax'];
  if (secure) partes.push('Secure');
  if (borrar) partes.push('Max-Age=0');
  else if (maxAge) partes.push(`Max-Age=${maxAge}`);
  return partes.join('; ');
}

// ── Google OAuth (sin librerías) ──
function crearGoogleOAuth({ clientId, clientSecret, redirectUri }) {
  const AUTH_URL  = 'https://accounts.google.com/o/oauth2/v2/auth';
  const TOKEN_URL = 'https://oauth2.googleapis.com/token';

  return {
    configurado() { return !!(clientId && clientSecret); },

    urlConsentimiento(state) {
      const p = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        access_type: 'online',
        prompt: 'select_account',
        state,
      });
      return `${AUTH_URL}?${p.toString()}`;
    },

    // Intercambia el code por tokens y devuelve el perfil del usuario.
    async intercambiarCode(code) {
      const body = new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      });
      const res = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error_description || data.error || 'Error al intercambiar el code');

      // Decodificar el payload del id_token (JWT). Viene directo del endpoint
      // de tokens de Google sobre TLS, así que se acepta sin verificar la firma.
      const idToken = data.id_token || '';
      const parte = idToken.split('.')[1];
      if (!parte) throw new Error('Google no devolvió id_token');
      const claims = JSON.parse(Buffer.from(parte, 'base64url').toString());

      return {
        googleId: claims.sub,
        email:    claims.email,
        nombre:   claims.name || claims.given_name || '',
        picture:  claims.picture || '',
      };
    },
  };
}

module.exports = { crearStore, crearSesiones, parseCookies, cookieHeader, crearGoogleOAuth };
