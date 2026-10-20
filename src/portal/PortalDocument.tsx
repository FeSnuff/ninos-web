import { assets, csp } from '../components/Document'
import { href } from '../lib/url'

/** Static shell for /portal/ (rendered at build time). The React app in src/portal/main.tsx fills #app. */
export function PortalDocument() {
  return (
    <html lang="es-US" dir="ltr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta httpEquiv="Content-Security-Policy" content={csp()} />
        <meta name="referrer" content="no-referrer" />
        <meta name="robots" content="noindex, nofollow" />
        <title>Portal del equipo · Nino’s Landscaping</title>
        <meta name="theme-color" content="#F2F2F7" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
        <meta name="color-scheme" content="light dark" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="icon" href={href('/favicon.svg')} type="image/svg+xml" />
        <link rel="apple-touch-icon" href={href('/apple-touch-icon.png')} />
        {assets.fontNormal ? <link rel="preload" href={href(assets.fontNormal)} as="font" type="font/woff2" crossOrigin="anonymous" /> : null}
        <link rel="stylesheet" href={href(assets.portalCss)} />
        <script defer src={href(assets.portalJs)} />
      </head>
      <body className="portal">
        <div id="app" data-home={href('/')} data-logo={href('/brand/logo-icon.svg')}>
          <noscript>El portal necesita JavaScript.</noscript>
        </div>
      </body>
    </html>
  )
}
