# FlayerMaker

SaaS para crear flyers rápido y fácil. Editor de flyers en el navegador con
plantillas por industria, kit de marca, generación de fondos con IA (Gemini) y
suscripciones pagas vía MercadoPago. Login con Google y planes vinculados a la
cuenta del usuario.

## Stack

- **Servidor:** Node.js con `http` plano (sin frameworks) — [`flyersMovi proyecto/servidor.js`](flyersMovi%20proyecto/servidor.js)
- **Auth:** Google OAuth 2.0 sin librerías + store de usuarios en JSON — [`flyersMovi proyecto/auth.js`](flyersMovi%20proyecto/auth.js)
- **Front:** HTML + CSS + JavaScript vanilla (sin bundler), scripts en [`flyersMovi proyecto/js/`](flyersMovi%20proyecto/js)
- **Pagos:** MercadoPago (checkout preferences + webhook), precios en UYU
- **IA:** Google Gemini (generación de fondos y sugerencia de paletas)
- **Permisos por plan:** matriz única en [`flyersMovi proyecto/js/permisos.js`](flyersMovi%20proyecto/js/permisos.js), compartida entre servidor y front

## Correr en local

Requiere Node.js 18+ (usa `fetch` nativo).

```bash
cd "flyersMovi proyecto"
cp config.example.json config.json   # y completá tus credenciales
node servidor.js
```

Abre http://localhost:3000 automáticamente.

Credenciales en `config.json`:

| Clave | Para qué |
|-------|----------|
| `mercadopago_access_token` | Crear preferencias y verificar pagos |
| `mercadopago_public_key` | Checkout en el front |
| `gemini_api_key` | Fondos IA y sugerencia de paletas |
| `google_client_id` / `google_client_secret` | Login con Google |
| `app_secret` | Firmar cookies de sesión (`crypto.randomBytes(32).toString('hex')`) |
| `app_url` | URL pública en producción (opcional; en local usa localhost) |

## Planes

El plan (`basico` / `pro` / `premium`) se persiste server-side por cuenta y se
activa al confirmar el pago contra MercadoPago. Los permisos se definen una sola
vez en [`js/permisos.js`](flyersMovi%20proyecto/js/permisos.js).

| Función | Básico | Pro | Premium |
|---------|:------:|:---:|:-------:|
| Plantillas | 4 | 8 | 12 |
| Fuentes | 1 | 6 | 6 |
| Formatos | cuadrado | + story | + banner |
| Color de acento | ✗ | ✓ | ✓ |
| Fondo por imagen | ✗ | ✓ | ✓ |
| Fondos con IA | ✗ | ✓ | ✓ |
| Cupo de fondos IA / mes | 0 | 5 | ∞ |
| Historial | ✗ | 20 | ∞ |
| Sitio web | ✗ | ✓ | ✓ |

Los endpoints de IA (`/api/gemini/*`) exigen sesión iniciada (401), plan con IA
habilitada (403) y respetan el cupo mensual (429).

## Configuración de secretos

> ⚠️ **No commitees secretos.** `config.json` y `usuarios.json` están en
> `.gitignore` y **no deben** subirse al repo. Tampoco commitees comprimidos
> (`*.rar`, `*.zip`): al empaquetar el proyecto suelen arrastrar `config.json`
> con las credenciales reales adentro.

- Partí siempre de `config.example.json` (solo placeholders) y copialo a
  `config.json` local.
- Si un secreto se filtró en un commit, rotá la credencial en el proveedor
  (MercadoPago / Google / Gemini) además de removerla del repo.

## Capturas

_TODO: agregar capturas del editor, selección de plantillas y checkout._

<!-- ![Editor](docs/editor.png) -->
<!-- ![Planes](docs/planes.png) -->

## Licencia

MIT — ver [LICENSE](LICENSE).
