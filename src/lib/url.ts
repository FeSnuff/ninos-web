import { BASE_PATH, RELATIVE_LINKS, SITE_URL } from './env'
import type { Photo } from '../content/images'
import { tr } from '../i18n'

/** Path of the page being rendered (set by the build before each page). */
let currentPage = '/'
export const setCurrentPage = (p: string) => (currentPage = p)

/**
 * Internal link.
 * - Normal: '/services/' → '/<base>/services/' (custom domain or user.github.io/repo/).
 * - RELATIVE_LINKS=1: '../services/index.html' (works when opened as files or inside a preview host).
 */
export function href(path: string): string {
  if (/^(https?:|mailto:|tel:|sms:|#)/.test(path)) return path
  if (RELATIVE_LINKS) return relativeTo(currentPage, path)
  return BASE_PATH + path.replace(/^\/+/, '')
}

function relativeTo(from: string, to: string) {
  const fromDir = from.endsWith('/') ? from : from.replace(/[^/]*$/, '')
  const fromParts = fromDir.split('/').filter(Boolean)
  const [pathPart, hash = ''] = to.split('#')
  const target = pathPart.endsWith('/') ? pathPart + 'index.html' : pathPart
  const toParts = target.split('/').filter(Boolean)
  let i = 0
  while (i < fromParts.length && i < toParts.length - 1 && fromParts[i] === toParts[i]) i++
  const up = fromParts.length - i
  const rel = '../'.repeat(up) + toParts.slice(i).join('/')
  return (rel || 'index.html') + (hash ? '#' + hash : '')
}

/** Absolute URL for canonical, Open Graph, sitemap and schema.org. */
export function absolute(path: string): string {
  const base = SITE_URL + BASE_PATH.replace(/\/$/, '')
  return base + '/' + path.replace(/^\/+/, '')
}

/**
 * Local photos (src/photos/*) are resized by the build into /img/<name>-<width>.webp.
 * The build fills this manifest before rendering pages.
 */
export const photoManifest: Record<string, { base: string; widths: number[]; ratio: number }> = {}

const UNSPLASH_WIDTHS = [480, 800, 1200, 1600, 2000]

/** Responsive src + srcset + alt (current language) for a photo. */
export function photoSrc(key: string, photo: Photo, width = 1200) {
  const alt = tr(photo.alt)
  const local = photoManifest[key]
  if (local) {
    const best = local.widths.find((w) => w >= width) ?? local.widths[local.widths.length - 1]
    const file = (w: number) => href(`/img/${local.base}-${w}.webp`)
    return { src: file(best), srcSet: local.widths.map((w) => `${file(w)} ${w}w`).join(', '), alt, ratio: local.ratio }
  }
  const make = (w: number) => `https://images.unsplash.com/${photo.src}?auto=format&fit=crop&w=${w}&q=70`
  return {
    src: make(width),
    srcSet: UNSPLASH_WIDTHS.filter((w) => w <= Math.max(width * 1.7, 800)).map((w) => `${make(w)} ${w}w`).join(', '),
    alt,
    ratio: photo.ratio ?? 1.5,
  }
}
