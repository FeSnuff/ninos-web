/**
 * Static site build: renders every React page to plain HTML (no client-side React).
 *   npm run build   → ./dist  (ready for GitHub Pages)
 *
 * Steps: clean → CSS + JS bundles (hashed) → fonts → pages → sitemap/robots/manifest → checks.
 * The build FAILS on broken internal links or missing images, so a bad deploy never goes live.
 */
import { createHash } from 'node:crypto'
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, normalize, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { renderToStaticMarkup } from 'react-dom/server'
import * as esbuild from 'esbuild'

import { Document, assets } from '../src/components/Document'
import { buildRoutes } from '../src/routes'
import { BASE_PATH, IS_PREVIEW, RELATIVE_LINKS, SITE_URL } from '../src/lib/env'
import { absolute, photoManifest, setCurrentPage } from '../src/lib/url'
import { photos } from '../src/content/images'
import { setLang } from '../src/i18n'
import { business, WEB3FORMS_ACCESS_KEY } from '../src/site.config'
import { licenseLabel, services } from '../src/content/services'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const t0 = Date.now()
const warnings: string[] = []

const hash = (buf: string | Buffer) => createHash('sha256').update(buf).digest('hex').slice(0, 10)

function write(rel: string, content: string | Buffer) {
  const file = join(dist, rel)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, content)
}

// 1. Clean + static files
rmSync(dist, { recursive: true, force: true })
mkdirSync(dist, { recursive: true })
cpSync(join(root, 'public'), dist, { recursive: true })

// 2. Fonts (self-hosted Montserrat from @fontsource-variable; no request to Google)
const fontDir = join(root, 'node_modules/@fontsource-variable/montserrat/files')
const fontFiles = { normal: 'montserrat-latin-wght-normal.woff2', italic: 'montserrat-latin-wght-italic.woff2' }
let fontCss = ''
if (existsSync(join(fontDir, fontFiles.normal))) {
  mkdirSync(join(dist, 'fonts'), { recursive: true })
  for (const f of Object.values(fontFiles)) cpSync(join(fontDir, f), join(dist, 'fonts', f))
  assets.fontNormal = `/fonts/${fontFiles.normal}`
  const face = (file: string, style: string) =>
    `@font-face{font-family:'Montserrat Variable';font-style:${style};font-display:swap;font-weight:100 900;src:url('${RELATIVE_LINKS ? '../' : BASE_PATH}fonts/${file}') format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}`
  fontCss = face(fontFiles.normal, 'normal') + face(fontFiles.italic, 'italic')
} else {
  assets.fontNormal = null
  warnings.push('Montserrat font not found (run `npm install`). Using fallback system font.')
}

// 2b. Photos: local files (src/photos/) → responsive WebP sizes in /img/
//     PHOTOS_OVERRIDE=<dir> also uses <dir>/<kebab-key>.webp for any photo (used for offline previews).
const PHOTO_WIDTHS = [480, 800, 1200, 1600, 2000]
const kebab = (k: string) => k.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase())
let sharp: typeof import('sharp') | null = null
try {
  sharp = (await import('sharp')).default as unknown as typeof import('sharp')
} catch {
  sharp = null
}
for (const [key, p] of Object.entries(photos)) {
  let source: string | null = null
  const isUnsplash = /^photo-\d+-[0-9a-f]+$/.test(p.src)
  if (!isUnsplash) {
    if (!/^[\w.-]+\.(jpe?g|png|webp|avif)$/i.test(p.src)) {
      console.error(`✖ Photo "${key}": src must be a plain file name in src/photos/ (got "${p.src}")`)
      process.exit(1)
    }
    source = join(root, 'src/photos', p.src)
  }
  else if (process.env.PHOTOS_OVERRIDE && existsSync(join(process.env.PHOTOS_OVERRIDE, kebab(key) + '.webp')))
    source = join(process.env.PHOTOS_OVERRIDE, kebab(key) + '.webp')
  if (!source) continue
  if (!existsSync(source)) {
    console.error(`✖ Photo "${key}": file not found: ${relative(root, source)}`)
    process.exit(1)
  }
  const base = kebab(key)
  mkdirSync(join(dist, 'img'), { recursive: true })
  if (!sharp) {
    warnings.push('sharp not installed: photos copied without resizing (run `npm install`).')
    const out = `${base}-orig${source.slice(source.lastIndexOf('.'))}`
    cpSync(source, join(dist, 'img', out))
    photoManifest[key] = { base, widths: [], ratio: p.ratio ?? 1.5 }
    continue
  }
  // phone photos are often stored sideways with an EXIF rotation flag: use the upright size
  const meta = await sharp(source).metadata()
  const upright = meta.autoOrient ?? meta
  const ratio = (upright.width ?? 1) / (upright.height ?? 1)
  let widths = PHOTO_WIDTHS.filter((w) => w <= (upright.width ?? 0))
  if (!widths.length) widths = [upright.width ?? 480]
  for (const w of widths) {
    await sharp(source).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: 72, effort: 5 }).toFile(join(dist, 'img', `${base}-${w}.webp`))
  }
  photoManifest[key] = { base, widths, ratio }
}

// 3. CSS: concatenate src/styles/*.css in name order, minify
const styleDir = join(root, 'src/styles')
const cssSource =
  fontCss +
  readdirSync(styleDir)
    .filter((f) => f.endsWith('.css'))
    .sort()
    .map((f) => readFileSync(join(styleDir, f), 'utf8'))
    .join('\n')
const css = (await esbuild.transform(cssSource, { loader: 'css', minify: true, target: ['chrome111', 'safari16.4', 'firefox115'] })).code
const cssName = `assets/site.${hash(css)}.css`
write(cssName, css)
assets.css = '/' + cssName

// 4. Client JS (small, no framework)
const js = await esbuild.build({
  entryPoints: [join(root, 'src/client/main.ts')],
  bundle: true,
  minify: true,
  format: 'iife',
  target: ['chrome111', 'safari16.4', 'firefox115'],
  write: false,
  legalComments: 'none',
})
const jsCode = js.outputFiles[0].text
const jsName = `assets/site.${hash(jsCode)}.js`
write(jsName, jsCode)
assets.js = '/' + jsName

// 5. Pages (each one rendered in its own language)
const routes = buildRoutes()
for (const r of routes) {
  setLang(r.lang)
  setCurrentPage(r.file ? '/' + r.file : r.path)
  let html = '<!doctype html>' + renderToStaticMarkup(<Document meta={r}>{r.render()}</Document>)
  // A CSP <meta> only protects what comes AFTER it. React hoists <link rel=preload> tags to the top of <head>,
  // so move the CSP right after <meta charset> to cover everything.
  const cspTag = html.match(/<meta http-equiv="Content-Security-Policy"[^>]*\/>/)?.[0]
  if (!cspTag) throw new Error('CSP meta tag missing')
  html = html.replace(cspTag, '').replace('<meta charSet="utf-8"/>', '<meta charSet="utf-8"/>' + cspTag)
  const file = r.file ?? join(r.path.replace(/^\//, ''), 'index.html')
  write(file, html)
}

// 6. sitemap.xml, robots.txt, manifest
const sitemapRoutes = routes.filter((r) => r.sitemap)
write(
  'sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
    sitemapRoutes
      .filter((r) => !r.noindex)
      .map((r) => {
        const alts = r.alternates?.en && r.alternates?.es
          ? `\n    <xhtml:link rel="alternate" hreflang="en" href="${absolute(r.alternates.en)}"/>` +
            `\n    <xhtml:link rel="alternate" hreflang="es" href="${absolute(r.alternates.es)}"/>` +
            `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${absolute(r.alternates.en)}"/>`
          : ''
        return `  <url>\n    <loc>${absolute(r.path)}</loc>${alts}\n    <priority>${(r.priority ?? 0.5).toFixed(1)}</priority>\n  </url>`
      })
      .join('\n') +
    `\n</urlset>\n`,
)
write(
  'robots.txt',
  IS_PREVIEW
    ? `# Preview build: keep out of search engines until the real domain is live\nUser-agent: *\nDisallow: /\n`
    : `User-agent: *\nAllow: /\n\nSitemap: ${absolute('/sitemap.xml')}\n`,
)
write(
  'manifest.webmanifest',
  JSON.stringify(
    {
      name: business.name,
      short_name: business.shortName,
      start_url: BASE_PATH,
      scope: BASE_PATH,
      display: 'browser',
      background_color: '#F4F7F1',
      theme_color: '#12301C',
      icons: [
        { src: `${BASE_PATH}icon-192.png`, sizes: '192x192', type: 'image/png' },
        { src: `${BASE_PATH}icon-512.png`, sizes: '512x512', type: 'image/png' },
      ],
    },
    null,
    2,
  ),
)

// 7. Checks: every internal link / asset in every HTML file must exist
function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f)
    return statSync(p).isDirectory() ? walk(p) : [p]
  })
}
const allFiles = walk(dist)
const htmlFiles = allFiles.filter((f) => f.endsWith('.html'))
const broken: string[] = []
for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8')
  for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const url = m[1].replace(/&amp;/g, '&')
    if (/^([a-z]+:|\/\/|#)/i.test(url)) continue
    let path: string
    if (RELATIVE_LINKS) {
      if (url.startsWith('/')) {
        broken.push(`${relative(dist, file)} → ${url} (absolute link in relative build; use href())`)
        continue
      }
      path = relative(dist, normalize(join(dirname(file), decodeURI(url.split('#')[0].split('?')[0]))))
    } else {
      if (!url.startsWith(BASE_PATH)) {
        broken.push(`${relative(dist, file)} → ${url} (missing base path ${BASE_PATH}; use href())`)
        continue
      }
      path = decodeURI(url.slice(BASE_PATH.length).split('#')[0].split('?')[0])
    }
    const target = path === '' || path.endsWith('/') ? join(dist, path, 'index.html') : join(dist, path)
    if (!existsSync(target)) broken.push(`${relative(dist, file)} → ${url}`)
  }
  if (/style="/.test(html)) broken.push(`${relative(dist, file)} has an inline style attribute (blocked by CSP)`)
}

// Business-data reminders
if (WEB3FORMS_ACCESS_KEY.startsWith('YOUR_')) warnings.push('Estimate form not connected: set WEB3FORMS_ACCESS_KEY in src/site.config.ts (the page shows call/text instead).')
if (!business.email) warnings.push('business.email is empty (hidden on the site).')
if (!business.license.dporNumber) warnings.push('No DPOR license number in site.config.ts (license badge hidden).')
const licenseIssues: string[] = []
for (const sv of services.filter((sv) => sv.enabled)) {
  if (sv.license && !sv.confirmed) licenseIssues.push(`"${sv.name.en}" page needs: ${licenseLabel[sv.license]}`)
  for (const i of sv.items) if (i.license && !i.confirmed) licenseIssues.push(`"${sv.name.en} › ${i.name.en}" needs: ${licenseLabel[i.license]}`)
}
// Virginia law forbids advertising work you aren't licensed for (18VAC50-22-260).
// Preview builds (github.io / localhost) only warn; a build for the real domain refuses to publish.
if (IS_PREVIEW) warnings.push(...licenseIssues.map((l) => l + ' → set confirmed: true or remove it before going public.'))
else broken.push(...licenseIssues.map((l) => l + ' → not confirmed. Set confirmed: true in src/content/services.ts or remove it.'))

console.log(`\n✔ Built ${htmlFiles.length} pages in ${Date.now() - t0} ms → dist/`)
console.log(`  site: ${SITE_URL}${BASE_PATH}${IS_PREVIEW ? '  (preview: noindex)' : ''}`)
console.log(`  css ${(css.length / 1024).toFixed(1)} KB · js ${(jsCode.length / 1024).toFixed(1)} KB`)
if (warnings.length) {
  console.log(`\n⚠ To confirm before going public (${warnings.length}):`)
  for (const w of warnings) console.log('  - ' + w)
}
if (broken.length) {
  console.error(`\n✖ ${broken.length} problem(s):`)
  for (const b of broken) console.error('  - ' + b)
  process.exit(1)
}
