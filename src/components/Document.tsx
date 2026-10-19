import type { ReactNode } from 'react'
import { business } from '../site.config'
import { absolute, href, photoManifest } from '../lib/url'
import { photos } from '../content/images'
import { IS_PREVIEW, SITE_URL } from '../lib/env'
import { lang, s, type Lang } from '../i18n'
import { Footer, Header, QuickContact } from './Chrome'

/** Filled by the build with hashed file names. */
export const assets = { css: '', js: '', fontNormal: '' as string | null }

export type PageMeta = {
  /** route path, always with trailing slash, e.g. '/services/irrigation/' */
  path: string
  title: string
  description: string
  noindex?: boolean
  /** schema.org objects for this page */
  jsonLd?: object[]
  ogImage?: string
  /** the same page in each language (for hreflang + the language switch) */
  alternates?: Partial<Record<Lang, string>>
}

/**
 * Content-Security-Policy. GitHub Pages can't send HTTP headers, so it goes in a <meta> tag
 * (the build moves it right after <meta charset> so it covers everything).
 * - No inline scripts or styles allowed: blocks most XSS.
 * - Images only from this site and Unsplash (placeholder photos).
 * - Forms can only send to this site and Web3Forms.
 * When online payments are added (Stripe Checkout), see SECURITY.md for the changes.
 */
export function csp() {
  const rules = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self'",
    // Unsplash only while placeholder photos are still loaded from there
    Object.keys(photos).some((k) => !photoManifest[k]) ? "img-src 'self' https://images.unsplash.com" : "img-src 'self'",
    "font-src 'self'",
    "connect-src 'self' https://api.web3forms.com",
    "form-action 'self' https://api.web3forms.com",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "manifest-src 'self'",
  ]
  if (SITE_URL.startsWith('https://')) rules.push('upgrade-insecure-requests')
  return rules.join('; ')
}

function jsonLdString(obj: object) {
  // Escape '<' so content can never close the <script> tag.
  return JSON.stringify(obj).replace(/</g, '\\u003c')
}

export function Document({ meta, children }: { meta: PageMeta; children: ReactNode }) {
  const l = lang()
  const t = s()
  const canonical = absolute(meta.path)
  // Brand suffix only when the whole title still fits in ~60 characters (Google truncates longer ones)
  const suffixed = `${meta.title} | ${business.shortName}`
  const isHome = meta.path === '/' || meta.path === '/es/'
  const fullTitle = isHome || suffixed.length > 60 ? meta.title : suffixed
  const robots = IS_PREVIEW || meta.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'
  const og = meta.ogImage ?? absolute('/og-image.png')
  const other: Lang = l === 'en' ? 'es' : 'en'
  const altPath = meta.alternates?.[other]

  return (
    <html lang={l === 'es' ? 'es-US' : 'en-US'} dir="ltr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta httpEquiv="Content-Security-Policy" content={csp()} />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <title>{fullTitle}</title>
        <meta name="description" content={meta.description} />
        <meta name="robots" content={robots} />
        {meta.noindex ? null : <link rel="canonical" href={canonical} />}
        {!meta.noindex && meta.alternates?.en && meta.alternates?.es ? (
          <>
            <link rel="alternate" hrefLang="en" href={absolute(meta.alternates.en)} />
            <link rel="alternate" hrefLang="es" href={absolute(meta.alternates.es)} />
            <link rel="alternate" hrefLang="x-default" href={absolute(meta.alternates.en)} />
          </>
        ) : null}
        <meta name="theme-color" content="#12301C" />
        <meta name="color-scheme" content="light" />
        <meta name="format-detection" content="telephone=no" />

        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={business.shortName} />
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={meta.description} />
        {meta.noindex ? null : <meta property="og:url" content={canonical} />}
        <meta property="og:image" content={og} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={`${business.shortName} · ${business.phoneDisplay}`} />
        <meta property="og:locale" content={l === 'es' ? 'es_US' : 'en_US'} />
        <meta property="og:locale:alternate" content={l === 'es' ? 'en_US' : 'es_US'} />
        <meta name="twitter:card" content="summary_large_image" />

        <link rel="icon" href={href('/favicon.ico')} sizes="32x32" />
        <link rel="icon" href={href('/favicon.svg')} type="image/svg+xml" />
        <link rel="apple-touch-icon" href={href('/apple-touch-icon.png')} />
        <link rel="manifest" href={href('/manifest.webmanifest')} />

        {assets.fontNormal ? (
          <link rel="preload" href={href(assets.fontNormal)} as="font" type="font/woff2" crossOrigin="anonymous" />
        ) : null}
        <link rel="stylesheet" href={href(assets.css)} />
        <script defer src={href(assets.js)} />

        {(meta.jsonLd ?? []).map((obj, i) => (
          <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(obj) }} />
        ))}
      </head>
      <body>
        <a className="skip-link" href="#main">
          {t.skip}
        </a>
        <Header current={meta.path} altPath={altPath} />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <Footer />
        <QuickContact />
      </body>
    </html>
  )
}
