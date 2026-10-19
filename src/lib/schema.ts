import { business, serviceAreas } from '../site.config'
import type { Service } from '../content/services'
import { lang, pagePath, servicePath, tr } from '../i18n'
import { absolute } from './url'

const BUSINESS_ID = () => absolute('/#business')

/**
 * schema.org has no "Landscaping" type: HomeAndConstructionBusiness is the closest.
 * Service-area business: the street address is NOT published (it's hidden on Google too).
 * No self-written aggregateRating (Google ignores/penalizes self-serving reviews).
 */
export function businessSchema() {
  const sameAs = Object.values(business.profiles).filter(Boolean)
  const address: Record<string, string> = {
    '@type': 'PostalAddress',
    addressRegion: business.region,
    addressCountry: 'US',
  }
  if (business.locality) address.addressLocality = business.locality

  return {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    '@id': BUSINESS_ID(),
    name: business.name,
    url: absolute('/'),
    logo: absolute('/brand/logo-icon-1024.png'),
    image: absolute('/og-image.png'),
    telephone: business.phoneE164,
    ...(business.email ? { email: business.email } : {}),
    address,
    areaServed: areaServed(),
    openingHoursSpecification: business.hours.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: expandDays(h.days),
      opens: h.opens,
      closes: h.closes,
    })),
    knowsLanguage: ['en', 'es'],
    ...(sameAs.length ? { sameAs } : {}),
  }
}

function areaServed() {
  return serviceAreas.flatMap((a) =>
    a.schema.map((name) => ({ '@type': 'AdministrativeArea', name: `${name}, Virginia` })),
  )
}

function expandDays(range: string) {
  const all = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const short = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
  const [a, b] = range.split('-')
  const from = short.indexOf(a)
  const to = short.indexOf(b ?? a)
  return all.slice(from, to + 1)
}

export function serviceSchema(sv: Service) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: tr(sv.name),
    serviceType: sv.name.en,
    description: tr(sv.seoDescription),
    url: absolute(servicePath(sv.slug)),
    inLanguage: lang() === 'es' ? 'es-US' : 'en-US',
    provider: { '@id': BUSINESS_ID() },
    areaServed: areaServed(),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: tr(sv.name),
      itemListElement: sv.items.map((i) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: tr(i.name), description: tr(i.text) },
      })),
    },
  }
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: absolute(it.path),
    })),
  }
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: business.shortName,
    url: absolute(pagePath('home')),
    publisher: { '@id': BUSINESS_ID() },
    inLanguage: lang() === 'es' ? 'es-US' : 'en-US',
  }
}
