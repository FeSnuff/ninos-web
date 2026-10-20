/** Paths passed in by the static page (they depend on the site's base path). */
const el = document.getElementById('app')!
export const SITE_HOME = el.dataset.home ?? '/'
export const LOGO = el.dataset.logo ?? ''
