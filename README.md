# Nino's Landscaping LLC — Sitio web

Sitio para **Nino's Landscaping LLC** (norte de Virginia). Hecho con **React 19 pre-renderizado a HTML estático**: cada página sale como HTML listo, rápida y fácil de indexar para Google, y se publica gratis en **GitHub Pages**.

- **Bilingüe:** inglés (idioma principal, en `/`) y español (en `/es/`, con direcciones en español como `/es/servicios/riego-y-aspersores/`). 33 páginas en total.
- Botón de **WhatsApp**: flotante en computadora y en la barra inferior del celular
- Generados automáticamente: `sitemap.xml`, `robots.txt`, datos estructurados (schema.org), Open Graph y manifest
- ~25 KB de CSS y ~3 KB de JavaScript en total, sin frameworks en el navegador
- Seguridad: ver [SECURITY.md](SECURITY.md)

---

## 1. Probarlo en tu computadora

Necesitas **Node.js 22.12 o más nuevo** ([nodejs.org](https://nodejs.org), versión LTS).

```bash
cd ninos-web
npm install        # la primera vez (crea package-lock.json, súbelo a GitHub también)
npm run dev        # abre http://localhost:4321 y reconstruye al guardar cambios
```

Otros comandos:

| Comando | Qué hace |
|---|---|
| `npm run build` | Genera el sitio final en `dist/` y lista lo que falta confirmar |
| `npm run preview` | Sirve `dist/` en http://localhost:4321 |
| `npm run check` | Revisa los tipos de TypeScript |

El build **falla a propósito** si hay un link roto o una imagen local que no existe, para no publicar algo roto.

---

## 2. Subirlo a GitHub Pages (primera vez)

1. Crea un repositorio en GitHub (por ejemplo `ninos-web`).
   - Con el plan gratis, GitHub Pages necesita que el repo sea **público**. El código no tiene secretos, así que no hay problema.
2. **Renombra la carpeta `_github` a `.github`** (con punto al inicio). Contiene la publicación automática y Dependabot; se entregó con otro nombre porque esa carpeta no se puede escribir de forma remota.
   - En Windows, desde la terminal dentro de `ninos-web`: `ren _github .github`
3. Sube el proyecto. Antes corre `npm install` (sección 1) para que exista `package-lock.json`: GitHub lo necesita para instalar versiones exactas.
   ```bash
   git init
   git add .
   git commit -m "Sitio inicial"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/ninos-web.git
   git push -u origin main
   ```
4. En GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
5. Ve a la pestaña **Actions**: el flujo *Build & deploy* se ejecuta solo. En 1–2 minutos el sitio queda en `https://TU_USUARIO.github.io/ninos-web/`.

Mientras esté en `github.io`, el sitio se marca como **noindex** (Google no lo indexa) para que no compita con el dominio definitivo.

### Dominio propio (cuando lo tengan)

1. **Settings → Pages → Custom domain**: escribe el dominio (ej. `www.ninoslandscapingva.com`) y guarda.
   - Con GitHub Actions no hace falta archivo `CNAME`: se configura ahí.
2. En el proveedor del dominio, crea los registros DNS que indica GitHub (CNAME `www` → `TU_USUARIO.github.io`, y registros A para el dominio sin `www`).
3. Marca **Enforce HTTPS**.
4. Vuelve a ejecutar el flujo en **Actions → Build & deploy → Run workflow**. El sitio detecta el dominio, se vuelve indexable y genera el sitemap con las URLs correctas.
5. Registra el sitio en **Google Search Console** y envía `https://tudominio.com/sitemap.xml`.

---

## 3. Conectar el formulario de estimados

1. Entra a [web3forms.com](https://web3forms.com), escribe el correo donde Nino quiere recibir los pedidos y copia la *Access Key*.
2. Elige **una** de dos formas:
   - En GitHub: **Settings → Secrets and variables → Actions → Variables → New variable**, nombre `WEB3FORMS_KEY`. Luego *Run workflow*.
   - O pégala en `src/site.config.ts` en `WEB3FORMS_ACCESS_KEY`.
3. Mientras no haya llave, la página muestra botones de **Llamar / Enviar texto** en lugar de un formulario roto.

---

## 4. Cómo editar el contenido

| Quiero cambiar… | Archivo |
|---|---|
| Teléfono, email, horario, WhatsApp, licencia, redes | `src/site.config.ts` |
| Textos de la interfaz (botones, menús, formulario) en inglés y español | `src/i18n.ts` |
| Ciudades y condados | `src/site.config.ts` → `serviceAreas` |
| Servicios, lo que incluye cada uno, mejores temporadas, preguntas (cada texto tiene `en` y `es`) | `src/content/services.ts` |
| Ocultar un servicio | `enabled: false` en `services.ts` |
| Fotos | `src/content/images.ts` (ver abajo) |
| Textos de inicio / about / contacto | `src/pages/*.tsx` |
| Colores y estilos | `src/styles/01-base.css` (variables al inicio) |

### Reemplazar las fotos de prueba por fotos reales

1. Guarda la foto original en `src/photos/` (JPG, PNG o WebP, idealmente 2000 px o más; las fotos del celular sirven tal cual).
2. En `src/content/images.ts` cambia, por ejemplo:
   ```ts
   lawnRows: { src: 'frente-casa-fairfax.jpg', alt: { en: 'Front yard in Fairfax', es: 'Jardín delantero en Fairfax' } },
   ```
3. Al compilar se crean versiones WebP optimizadas (480 a 2000 px) y se borran los datos GPS de la foto.
4. Borra esa foto de `CREDITS.md`. Cuando ya no quede ninguna de Unsplash, el sitio deja de permitir imágenes externas solo.
5. En la galería, quita el aviso "fotos de muestra" (`gallery.notice` en `src/i18n.ts` y su uso en `src/pages/Other.tsx`).

---

## 5. ⚠️ Antes de hacerlo público: confirmar con Nino

`npm run build` imprime esta lista automáticamente. Resumen:

- [ ] **Licencias** (ver `../PLAN-SITIO-WEB.md` §11, en la carpeta de arriba). Hasta confirmarlas, marcar `confirmed: true` o quitar el servicio:
  - Irrigación → DPOR especialidad ISC
  - Drenaje y diseño de camas → DPOR especialidad LSC
  - Fertilización → certificación VDACS de fertilizante
  - Control de maleza → certificación + licencia VDACS de pesticidas
- [ ] Número de licencia DPOR y si tienen seguro → `business.license` (aparece en footer y "About")
- [ ] Email completo, horario real, ciudad base
- [ ] Que el 703-501-6924 tenga WhatsApp (si no, dejar `whatsapp: ''` y los botones desaparecen)
- [ ] Revisar los textos en español con Nino
- [ ] Ciudades y condados que realmente cubren
- [ ] Promesas en los textos: *"estimado gratis"*, *"respuesta en un día hábil"*, *"cotización escrita"*
- [ ] Historia real en "About"
- [ ] Hardscaping: oculto (`enabled: false`) hasta confirmar que lo hacen y tienen licencia
- [ ] Fotos reales de trabajos
- [ ] Perfil de **Google Business** (negocio de área de servicio, dirección oculta), y agregar el link en `business.profiles`

---

## 6. Estructura

```
ninos-web/
├─ src/
│  ├─ site.config.ts        datos del negocio (editar aquí)
│  ├─ routes.tsx            lista de páginas, títulos y descripciones SEO
│  ├─ content/              servicios e imágenes
│  ├─ components/           React: Document (head/SEO/CSP), Chrome (header/footer), Blocks, EstimateForm, Icon
│  ├─ pages/                páginas
│  ├─ lib/                  URLs, schema.org, variables de build
│  ├─ client/main.ts        el único JavaScript del navegador (~3 KB)
│  └─ styles/               CSS (tokens de marca, layout, componentes, páginas)
├─ public/                  logo, favicons, imagen para redes (og-image.png)
├─ scripts/                 build (React → HTML), dev y preview
├─ .github/workflows/       publicación automática en GitHub Pages
├─ SECURITY.md · CREDITS.md
```

### Por qué así y no Astro/Next.js

Los componentes son React normales (`.tsx`), pero en lugar de enviar React al navegador, se convierten a HTML al compilar. Resultado: el sitio carga casi instantáneo, Google ve todo el contenido y hay muy pocas dependencias que mantener. Si más adelante se quiere Astro, los mismos componentes se pueden usar dentro de Astro casi sin cambios.

## 7. Siguientes fases

2. Intranet con Supabase (subdominio `portal.`)
3. Pagos en línea con Stripe Checkout: ver [SECURITY.md](SECURITY.md#pagos-en-línea-fase-futura-cómo-hacerlo-seguro)
