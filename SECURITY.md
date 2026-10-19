# Seguridad del sitio

## Lo que ya está aplicado

| Medida | Qué protege |
|---|---|
| **Sitio 100 % estático** (HTML ya generado, sin servidor ni base de datos) | No hay nada que hackear del lado del servidor |
| **Content-Security-Policy** (en `<meta>`, porque GitHub Pages no permite cabeceras) | Bloquea scripts inyectados (XSS): solo corre el JS propio del sitio, sin scripts ni estilos en línea |
| `form-action` limitado a este sitio + Web3Forms | Nadie puede desviar el formulario a otro servidor |
| `img-src` limitado a este sitio + Unsplash | Imágenes de terceros bloqueadas |
| `object-src 'none'`, `base-uri 'self'`, `frame-src 'none'` | Bloquea plugins, inyección de `<base>` e iframes |
| `Referrer-Policy: strict-origin-when-cross-origin` | No se filtran URLs completas a otros sitios |
| Enlaces externos con `rel="noopener noreferrer"` | Evita que otra pestaña controle la página |
| JSON-LD escapado (`<` se escribe como `\u003c`) | Los datos estructurados no pueden cerrar el `<script>` |
| Formulario con campo trampa (honeypot) + validación | Filtra spam de bots |
| **Sin cookies ni rastreadores** | Privacidad; no hace falta banner de cookies |
| Pocas dependencias (React, fuente Montserrat; para compilar: esbuild y tsx) | Menos riesgo en la cadena de paquetes |
| `npm audit` en cada build + **Dependabot** semanal | Avisa y corrige paquetes vulnerables |
| GitHub Actions con permisos mínimos y `persist-credentials: false` | Un paso comprometido no puede escribir en el repo |
| El build **falla** si hay links rotos o estilos en línea | Nunca se publica una versión rota |

### Limitaciones de GitHub Pages (aceptables para un sitio informativo)

- No se pueden enviar cabeceras HTTP como `Strict-Transport-Security`, `X-Frame-Options` ni `frame-ancestors`. GitHub ya fuerza HTTPS (activar **Enforce HTTPS** en Settings → Pages).
- Si más adelante se quieren esas cabeceras, el sitio se muda a **Cloudflare Pages** sin cambiar código: se agrega un archivo `_headers`.

### La llave de Web3Forms

La *access key* de Web3Forms **es pública por diseño**: solo sirve para enviar mensajes al correo del dueño. No es una contraseña. Se puede poner en `src/site.config.ts` o como variable `WEB3FORMS_KEY` en GitHub (Settings → Secrets and variables → Actions → **Variables**).

**Nunca** subas al repositorio contraseñas, llaves `sb_secret_` de Supabase ni llaves secretas de Stripe. El `.gitignore` ya excluye archivos `.env`.

---

## Pagos en línea (fase futura): cómo hacerlo seguro

**Regla de oro: los datos de tarjeta nunca tocan nuestro sitio.**

1. **Usar Stripe Checkout o Stripe Payment Links** (páginas de pago alojadas por Stripe).
   - El cliente paga en `checkout.stripe.com`, no en nuestro sitio.
   - Así el negocio queda en el nivel más simple de cumplimiento PCI (SAQ A).
   - Aceptan tarjeta, Apple Pay, Google Pay y ACH.
2. **Opción simple (sin servidor):** Payment Links o facturas de Stripe enviadas por correo/SMS. Funciona con el sitio estático tal cual.
3. **Opción completa (con la intranet):**
   - Una **Supabase Edge Function** crea la sesión de Checkout con la llave secreta de Stripe guardada como *secret* de Supabase (nunca en el navegador ni en el repo).
   - Un **webhook** de Stripe confirma el pago. La función verifica la firma antes de marcar la factura como pagada. En Supabase (Deno) se usa `stripe.webhooks.constructEventAsync(body, firma, secreto, undefined, Stripe.createSubtleCryptoProvider())` sobre el cuerpo crudo (`await req.text()`).
   - El monto **siempre** se calcula en el servidor a partir de la factura en la base de datos, nunca se confía en el precio que manda el navegador.
4. Cambios en la CSP cuando se agregue:
   - `form-action` → agregar `https://checkout.stripe.com`
   - Si se usa Stripe.js: `script-src https://js.stripe.com https://*.js.stripe.com`, `frame-src https://js.stripe.com https://*.js.stripe.com https://hooks.stripe.com` y `connect-src https://api.stripe.com` (ver la [guía de CSP de Stripe](https://docs.stripe.com/security/guide#content-security-policy))
5. Para el cobro con datos de clientes conviene mudar el hosting a Cloudflare Pages (cabeceras de seguridad completas) y activar 2FA en GitHub, Stripe y Supabase.

## Intranet con Supabase (fase futura)

- En el navegador solo la llave **`sb_publishable_…`**. La llave **`sb_secret_…`** solo en Edge Functions.
- **Row Level Security (RLS) activado en todas las tablas**, con políticas por usuario/rol.
- Login con Supabase Auth + 2FA para administradores.
- La intranet va en un subdominio aparte (`portal.tudominio.com`), separada del sitio público.

## Reportar un problema

Si encuentras una vulnerabilidad, escribe al dueño del sitio en privado. No abras un *issue* público.
