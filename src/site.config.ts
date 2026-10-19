/**
 * Business data used everywhere (header, footer, schema.org, forms).
 * Edit here, rebuild, and every page updates.
 *
 * Items marked TODO must be confirmed with Nino before the site goes public.
 */

export const business = {
  name: "Nino's Landscaping LLC",
  shortName: "Nino's Landscaping",
  phoneDisplay: '703-501-6924',
  phoneE164: '+17035016924',
  /** TODO: full email is cut off on the business card. Leave empty to hide it. */
  email: '',
  /**
   * TODO: confirm this number has WhatsApp (digits only, with country code 1).
   * Leave empty ('') to hide every WhatsApp button.
   */
  whatsapp: '17035016924',
  /** Service-area business: street address is never published (Google requirement for hidden-address SABs). */
  region: 'VA',
  regionName: 'Virginia',
  /** TODO: confirm home base city (used in schema.org address.addressLocality). */
  locality: '',
  /** TODO: confirm hours. Format used by schema.org. */
  hours: [{ days: 'Mo-Sa', opens: '07:00', closes: '18:00', label: { en: 'Mon–Sat, 7am–6pm', es: 'Lun–Sáb, 7am–6pm' } }],
  /** TODO: license details. Shown only when filled in. */
  license: {
    dporNumber: '',
    dporClass: '',
    specialties: [] as string[],
    insured: false,
  },
  /** Social / review profiles. Fill in when they exist (used in footer and schema.org sameAs). */
  profiles: {
    googleBusiness: '',
    facebook: '',
    instagram: '',
    nextdoor: '',
  },
} as const

/**
 * Web3Forms access key (https://web3forms.com). This key is designed to be public:
 * it only allows sending form submissions to the owner's inbox.
 * Leave the placeholder to show "call or text us" instead of a broken form.
 */
export const WEB3FORMS_ACCESS_KEY = process.env.WEB3FORMS_KEY || 'YOUR_WEB3FORMS_ACCESS_KEY'

export const serviceAreas = [
  // `schema` = official names used in Google structured data
  {
    county: { en: 'Fairfax County', es: 'Condado de Fairfax' },
    schema: ['Fairfax County'],
    towns: ['Fairfax', 'Vienna', 'Reston', 'Herndon', 'Chantilly', 'Centreville', 'Burke', 'Springfield', 'Annandale', 'McLean', 'Great Falls', 'Oakton', 'Lorton', 'Falls Church'],
  },
  {
    county: { en: 'Loudoun County', es: 'Condado de Loudoun' },
    schema: ['Loudoun County'],
    towns: ['Ashburn', 'Leesburg', 'Sterling', 'South Riding', 'Aldie', 'Brambleton', 'Purcellville'],
  },
  {
    county: { en: 'Prince William County', es: 'Condado de Prince William' },
    schema: ['Prince William County'],
    towns: ['Manassas', 'Woodbridge', 'Gainesville', 'Haymarket', 'Bristow', 'Dumfries', 'Dale City'],
  },
  {
    county: { en: 'Arlington & Alexandria', es: 'Arlington y Alexandria' },
    schema: ['Arlington County', 'City of Alexandria'],
    towns: ['Arlington', 'Alexandria'],
  },
] as const
