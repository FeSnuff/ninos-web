import type { ReactNode } from 'react'
import type { PageMeta } from './components/Document'
import { activeServices } from './content/services'
import { breadcrumbSchema, businessSchema, serviceSchema, websiteSchema } from './lib/schema'
import { LANGS, pagePath, s, servicePath, setLang, tr, type Lang, type PageKey } from './i18n'
import { Home } from './pages/Home'
import { ServicePage, ServicesHub } from './pages/Services'
import { About, Contact, FreeEstimate, Gallery, NotFound, Privacy, ServiceAreas, Thanks } from './pages/Other'

export type Route = PageMeta & {
  lang: Lang
  render: () => ReactNode
  /** output file; defaults to <path>/index.html */
  file?: string
  /** include in sitemap.xml */
  sitemap?: boolean
  priority?: number
}

const crumbs = (...items: [string, string][]) => breadcrumbSchema(items.map(([name, path]) => ({ name, path })))

const both = (key: PageKey) => ({ en: pagePath(key, 'en'), es: pagePath(key, 'es') })

/** Titles and descriptions per language. Kept here so all SEO text is in one place. */
const SEO: Record<Exclude<PageKey, 'home'>, Record<Lang, { title: string; description: string }>> & {
  home: Record<Lang, { title: string; description: string }>
} = {
  home: {
    en: {
      title: "Nino's Landscaping | Lawn Care & Irrigation in Virginia",
      description: 'Lawn mowing, mulch, trimming, sprinkler repair, drainage and landscape lighting in Fairfax, Loudoun and Prince William. Free estimates: 703-501-6924.',
    },
    es: {
      title: "Nino's Landscaping | Jardinería y riego en Virginia",
      description: 'Corte de césped, mulch, poda, reparación de riego, drenaje e iluminación exterior en Fairfax, Loudoun y Prince William. Estimados gratis: 703-501-6924.',
    },
  },
  services: {
    en: { title: 'Landscaping Services in Virginia', description: 'Lawn care, mulching, trimming, irrigation, drainage, landscape lighting and seasonal cleanups for homes in Virginia.' },
    es: { title: 'Servicios de jardinería en Virginia', description: 'Césped, mulch, poda, riego, drenaje, iluminación exterior y limpiezas de temporada para casas en Virginia.' },
  },
  areas: {
    en: { title: 'Service Areas in Virginia', description: "Nino's Landscaping serves homes in Fairfax, Loudoun and Prince William counties, Arlington and Alexandria, Virginia." },
    es: { title: 'Áreas de servicio en Virginia', description: "Nino's Landscaping atiende casas en los condados de Fairfax, Loudoun y Prince William, Arlington y Alexandria, Virginia." },
  },
  gallery: {
    en: { title: 'Our Work: Before & After in Northern VA', description: "Real before-and-after photos from Nino's Landscaping jobs in Northern Virginia: river rock beds, mulch, drainage, irrigation repair and aeration." },
    es: { title: 'Nuestros trabajos: antes y después en Virginia', description: "Fotos reales de antes y después de trabajos de Nino's Landscaping en el norte de Virginia: piedra de río, mulch, drenaje, riego y aireación." },
  },
  about: {
    en: { title: 'About Us', description: "Nino's Landscaping is a local Virginia company for lawn care, irrigation, drainage and landscape lighting." },
    es: { title: 'Sobre nosotros', description: "Nino's Landscaping es una empresa local de Virginia de césped, riego, drenaje e iluminación exterior." },
  },
  estimate: {
    en: { title: 'Free Estimate', description: 'Request a free landscaping estimate in Virginia. Tell us what your yard needs and we will call or text you back.' },
    es: { title: 'Estimado gratis', description: 'Pida un estimado gratis de jardinería en Virginia. Cuéntenos qué necesita su jardín y lo llamamos o le escribimos.' },
  },
  contact: {
    en: { title: 'Contact', description: "Call, text or WhatsApp Nino's Landscaping at 703-501-6924, or send the free estimate form." },
    es: { title: 'Contacto', description: "Llame, escriba o mande WhatsApp a Nino's Landscaping al 703-501-6924, o envíe el formulario de estimado." },
  },
  privacy: {
    en: { title: 'Privacy Policy', description: "How Nino's Landscaping handles the information you send through this website." },
    es: { title: 'Política de privacidad', description: "Cómo maneja Nino's Landscaping la información que envía por este sitio." },
  },
  thanks: {
    en: { title: 'Request sent', description: 'Your estimate request was sent.' },
    es: { title: 'Solicitud enviada', description: 'Su solicitud de estimado fue enviada.' },
  },
}

function page(key: PageKey, l: Lang, render: () => ReactNode, extra: Partial<Route> = {}): Route {
  return { path: pagePath(key, l), lang: l, alternates: both(key), ...SEO[key][l], render, ...extra }
}

/** Builds the list of pages for one language (call after setLang so translated text is used). */
function routesFor(l: Lang): Route[] {
  setLang(l)
  const t = s()
  const home: [string, string] = [t.home, pagePath('home', l)]
  return [
    page('home', l, () => <Home />, { jsonLd: [businessSchema(), websiteSchema()], sitemap: true, priority: 1 }),
    page('services', l, () => <ServicesHub />, {
      jsonLd: [crumbs(home, [t.nav.services, pagePath('services', l)])],
      sitemap: true,
      priority: 0.9,
    }),
    ...activeServices.map<Route>((sv) => ({
      path: servicePath(sv.slug, l),
      lang: l,
      alternates: { en: servicePath(sv.slug, 'en'), es: servicePath(sv.slug, 'es') },
      title: tr(sv.seoTitle),
      description: tr(sv.seoDescription),
      jsonLd: [serviceSchema(sv), crumbs(home, [t.nav.services, pagePath('services', l)], [tr(sv.name), servicePath(sv.slug, l)])],
      render: () => <ServicePage sv={sv} />,
      sitemap: true,
      priority: 0.8,
    })),
    page('areas', l, () => <ServiceAreas />, { jsonLd: [crumbs(home, [t.nav.areas, pagePath('areas', l)])], sitemap: true, priority: 0.7 }),
    page('gallery', l, () => <Gallery />, { jsonLd: [crumbs(home, [t.nav.gallery, pagePath('gallery', l)])], sitemap: true, priority: 0.7 }),
    page('about', l, () => <About />, { jsonLd: [crumbs(home, [t.nav.about, pagePath('about', l)])], sitemap: true, priority: 0.6 }),
    page('estimate', l, () => <FreeEstimate />, { jsonLd: [crumbs(home, [t.freeEstimate, pagePath('estimate', l)])], sitemap: true, priority: 0.9 }),
    page('contact', l, () => <Contact />, { jsonLd: [crumbs(home, [t.nav.contact, pagePath('contact', l)])], sitemap: true, priority: 0.6 }),
    page('privacy', l, () => <Privacy />, { sitemap: true, priority: 0.2 }),
    page('thanks', l, () => <Thanks />, { noindex: true }),
  ]
}

export function buildRoutes(): Route[] {
  const all = LANGS.flatMap(routesFor)
  setLang('en')
  all.push({
    path: '/404.html',
    file: '404.html',
    lang: 'en',
    title: 'Page not found · Página no encontrada',
    description: 'This page could not be found.',
    noindex: true,
    render: () => <NotFound />,
  })
  return all
}
