/** Build-time settings. Set by GitHub Actions (actions/configure-pages) or defaults for local preview. */
const rawSite = process.env.SITE_URL || 'http://localhost:4321'
const rawBase = process.env.BASE_PATH || '/'

export const SITE_URL = rawSite.replace(/\/+$/, '')
/** Always starts and ends with '/' */
export const BASE_PATH = ('/' + rawBase.replace(/^\/+|\/+$/g, '') + '/').replace('//', '/')
/** Preview deployments (github.io, localhost) are kept out of search engines until the real domain is live. */
export const IS_PREVIEW = /github\.io|localhost|127\.0\.0\.1/.test(SITE_URL) || process.env.NOINDEX === '1'
/** RELATIVE_LINKS=1 → links like '../services/index.html' (for previews opened from files or a preview host). */
export const RELATIVE_LINKS = process.env.RELATIVE_LINKS === '1'
