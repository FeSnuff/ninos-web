/**
 * Two languages: English (default, at /) and Spanish (at /es/).
 * The build renders every page once per language and sets the current language
 * before rendering, so components just call `s()` (interface text) or `tr()` (content).
 */

export type Lang = 'en' | 'es'
export const LANGS: Lang[] = ['en', 'es']
/** A piece of content in both languages */
export type L<T = string> = { en: T; es: T }

let current: Lang = 'en'
export const setLang = (l: Lang) => (current = l)
export const lang = () => current
export const tr = <T>(v: L<T>): T => v[current]

/* ---------- Page paths in each language (Spanish slugs help Spanish searches) ---------- */

export type PageKey =
  | 'home'
  | 'services'
  | 'areas'
  | 'gallery'
  | 'about'
  | 'estimate'
  | 'contact'
  | 'privacy'
  | 'thanks'

const PATHS: Record<PageKey, L> = {
  home: { en: '/', es: '/es/' },
  services: { en: '/services/', es: '/es/servicios/' },
  areas: { en: '/service-areas/', es: '/es/areas-de-servicio/' },
  gallery: { en: '/gallery/', es: '/es/galeria/' },
  about: { en: '/about/', es: '/es/nosotros/' },
  estimate: { en: '/free-estimate/', es: '/es/estimado-gratis/' },
  contact: { en: '/contact/', es: '/es/contacto/' },
  privacy: { en: '/privacy/', es: '/es/privacidad/' },
  thanks: { en: '/thanks/', es: '/es/gracias/' },
}

export const pagePath = (key: PageKey, l: Lang = current) => PATHS[key][l]
export const servicePath = (slug: L, l: Lang = current) => `${PATHS.services[l]}${slug[l]}/`

/* ---------- Interface text ---------- */

const en = {
  langName: 'English',
  switchTo: 'Español',
  switchLabel: 'Ver esta página en español',
  skip: 'Skip to content',
  home: 'Home',
  nav: { services: 'Services', areas: 'Service areas', gallery: 'Gallery', about: 'About', contact: 'Contact' },
  menu: 'Menu',
  menuServices: 'Services',
  freeEstimate: 'Free estimate',
  getEstimate: 'Get a free estimate',
  call: 'Call',
  text: 'Text',
  textUs: 'Text us',
  whatsapp: 'WhatsApp',
  whatsappLabel: 'Chat with us on WhatsApp',
  whatsappMsg: "Hi Nino's Landscaping, I'd like a free estimate.",
  estimate: 'Estimate',
  quickContact: 'Quick contact',
  region: 'Virginia',
  footerBlurb: 'Lawn care, mulch and beds, trimming, irrigation, drainage and landscape lighting for homes in Northern Virginia.',
  company: 'Company',
  talk: 'Talk to us',
  rights: 'All rights reserved.',
  privacy: 'Privacy',
  staff: 'Staff login',
  breadcrumb: 'Breadcrumb',
  main: 'Main',
  mobileNav: 'Mobile',
  swipe: 'Swipe to see more',

  hero: {
    kicker: 'Lawn & landscape care in Northern Virginia',
    title: 'Green lawns, clean beds and sprinklers that work.',
    lede: 'Mowing, mulch, river rock, trimming, irrigation repair, drainage and landscape lighting for homes in Fairfax, Loudoun, Prince William, Arlington and Alexandria.',
  },
  homeServices: { title: 'One crew for the whole yard', intro: 'From the grass to the sprinkler lines under it. Pick a service to see everything it includes.' },
  how: { title: 'How it works', intro: 'No pressure and no surprises. You get a clear quote before any work starts.', titleAbout: 'How we work' },
  timing: {
    title: 'We work all year',
    text: 'Call or text whenever you need us and we will schedule your project.',
    best: 'Best results in Virginia',
    to: 'to',
    monthsLong: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  },
  steps: [
    { title: 'Call, text or send the form', text: 'Tell us what your yard needs. Photos help.' },
    { title: 'Free estimate', text: 'We look at the property and give you a clear quote before any work starts.' },
    { title: 'We do the work', text: 'On the scheduled day, with the yard cleaned up when we leave.' },
    { title: 'Follow-up', text: 'We check that you are happy and set up the next seasonal visit if you want one.' },
  ],
  areasBlock: { title: 'Where we work', intro: 'Homes across Virginia. Not sure if we reach your street? Call or text and ask.', all: 'All service areas' },
  cta: {
    title: 'Send us a photo of your yard',
    text: 'Free estimates in Northern Virginia. Call, text or WhatsApp. A photo or two helps us understand the job before we visit.',
  },

  servicesHub: {
    title: 'Landscaping services',
    intro: "Everything we do for homes in Virginia, grouped the way you'd think about your yard. Open a service to see exactly what it includes.",
    all: 'All services',
    ctaTitle: 'Need more than one service?',
    ctaText: "Most yards do. Tell us everything in one request and we'll quote it together.",
  },
  service: {
    included: "What's included",
    faq: 'Common questions',
    more: 'Often booked together',
    ctaTitle: (name: string) => `Free estimate for ${name.toLowerCase()}`,
    see: 'See what’s included',
  },
  areasPage: {
    title: 'Service areas in Virginia',
    intro: "We work at homes across these counties and towns. If your town isn't listed, call or text: we may still reach you.",
    ctaTitle: 'Is your street on our route?',
    ctaText: "Send your ZIP code with the estimate form, or just call. We'll tell you right away.",
  },
  gallery: {
    title: 'Our work',
    intro: 'Real jobs from our crew in Northern Virginia, from first visit to finished yard.',
    stages: { before: 'Before', during: 'During', after: 'After' },
    viewService: 'See this service',
    spotlightKicker: 'Recent project',
    spotlightCta: 'See more of our work',
  },
  about: {
    title: "About Nino's Landscaping",
    intro: 'A local landscaping crew taking care of homes across Northern Virginia.',
    p1: "Nino's Landscaping takes care of the whole yard: the lawn, the beds, the shrubs, and the water system underneath. Our logo is a sprinkler head for a reason. Irrigation and drainage are a big part of what we do, and they are what keep everything else green.",
    p2: 'We work in Fairfax, Loudoun, Prince William, Arlington and Alexandria, so we know the heavy clay soil, the humid summers and the freeze dates that shape every yard here.',
    expectTitle: 'What you can expect',
    expect: [
      'A clear quote before any work starts',
      'A time window for every visit',
      'The yard left clean when we finish',
      'One call for lawn, beds, irrigation, drainage and lighting',
    ],
    licensedTitle: 'Licensed & insured',
    license: (cls: string, num: string, spec: string) => `Virginia ${cls} Contractor License #${num}${spec ? ` with ${spec} specialties` : ''}.`,
    footerLicense: (cls: string, num: string, spec: string) => `Virginia ${cls} Contractor #${num}${spec ? ` (${spec})` : ''}`,
    insured: 'Fully insured.',
  },
  estimatePage: {
    title: 'Get a free estimate',
    intro: "Tell us a little about your yard and we'll call or text you back to set up a visit.",
    asideTitle: 'Rather talk?',
    asideText: "Call or text during working hours. If we miss you, we'll call you back.",
    asideLabel: 'Other ways to reach us',
  },
  form: {
    notReadyTitle: 'Request a free estimate',
    notReadyText: 'The online form is being set up. In the meantime, call or text and we will answer quickly.',
    callNum: (n: string) => `Call ${n}`,
    sendText: 'Send a text',
    subject: (biz: string) => `New estimate request – ${biz} website`,
    name: 'Your name',
    nameErr: 'Enter your name so we know who to ask for.',
    phone: 'Phone',
    phoneErr: 'Enter a phone number with area code, like 703-555-0123.',
    email: 'Email',
    optional: '(optional)',
    emailErr: 'Check the email address. It looks incomplete.',
    zip: 'ZIP code',
    zipErr: 'Enter the 5-digit ZIP code of the property.',
    need: 'What do you need?',
    other: 'Something else',
    otherValue: 'Other',
    msg: 'Tell us about the yard',
    msgPh: 'Size of the yard, what you want done, best days to visit…',
    reach: 'Best way to reach you',
    reachOpts: ['Call', 'Text', 'WhatsApp', 'Email'],
    language: 'Language',
    photos: 'Have photos? Text them to',
    photosAfter: 'after sending the form.',
    privacy1: 'We use your details only to reply to this request. See our',
    privacyLink: 'privacy policy',
    send: 'Send my request',
    sending: 'Sending…',
    error: "The request didn't go through. Check your connection and try again, or call/text",
    notSpecified: 'Not specified',
  },
  contactPage: {
    title: 'Contact',
    intro: 'The fastest way to reach us is a call, a text or WhatsApp.',
    callTitle: 'Call',
    textTitle: 'Text',
    textSub: 'Send photos of your yard',
    waSub: 'Message us',
    emailTitle: 'Email',
    formTitle: 'Estimate form',
    formSub: 'Two minutes, no obligation',
    serving: 'Serving Virginia: Fairfax, Loudoun, Prince William, Arlington and Alexandria',
  },
  thanks: {
    title: 'Request sent',
    text: (phone: string) => `Thanks. We'll get back to you soon. If it's urgent, call or text ${phone}.`,
    back: 'Back to home',
  },
  privacyPage: {
    title: 'Privacy policy',
    intro: 'Plain-language summary of what this website collects and why.',
    updated: 'Last updated',
    sections: [
      ['What we collect', 'When you send the estimate form, we receive the details you type: name, phone, ZIP code, and optionally your email and a message. We use them only to answer your request and, if you hire us, to schedule the work.'],
      ['Who processes it', 'Form submissions are delivered to our inbox by Web3Forms, a form-delivery service. We do not sell or share your information with anyone else.'],
      ['Cookies and tracking', 'This website does not use cookies, analytics or advertising trackers.'],
      ['Services that see your visit', 'Like any website, loading a page shares your IP address and browser details with the services that deliver it: GitHub Pages (hosting){unsplash} and, if you send the form, Web3Forms. They use this information to deliver content and prevent abuse.'],
    ] as [string, string][],
    unsplash: ', Unsplash (some photos)',
    choicesTitle: 'Your choices',
    choices: (phone: string) => `To ask what information we have about you, or to have it deleted, call or text ${phone}.`,
  },
}

export type Strings = typeof en

const es: Strings = {
  langName: 'Español',
  switchTo: 'English',
  switchLabel: 'View this page in English',
  skip: 'Ir al contenido',
  home: 'Inicio',
  nav: { services: 'Servicios', areas: 'Áreas', gallery: 'Galería', about: 'Nosotros', contact: 'Contacto' },
  menu: 'Menú',
  menuServices: 'Servicios',
  freeEstimate: 'Estimado gratis',
  getEstimate: 'Pida su estimado gratis',
  call: 'Llamar',
  text: 'Texto',
  textUs: 'Envíenos un texto',
  whatsapp: 'WhatsApp',
  whatsappLabel: 'Escríbanos por WhatsApp',
  whatsappMsg: "Hola Nino's Landscaping, quisiera un estimado gratis.",
  estimate: 'Estimado',
  quickContact: 'Contacto rápido',
  region: 'Virginia',
  footerBlurb: 'Césped, mulch y jardineras, poda, riego, drenaje e iluminación exterior para casas en el norte de Virginia.',
  company: 'Empresa',
  talk: 'Hable con nosotros',
  rights: 'Todos los derechos reservados.',
  privacy: 'Privacidad',
  staff: 'Acceso del personal',
  breadcrumb: 'Ruta de navegación',
  main: 'Principal',
  mobileNav: 'Móvil',
  swipe: 'Deslice para ver más',

  hero: {
    kicker: 'Jardinería y césped en el norte de Virginia',
    title: 'Césped verde, jardines limpios y riego que funciona.',
    lede: 'Corte de césped, mulch, piedra de río, poda, reparación de riego, drenaje e iluminación exterior para casas en Fairfax, Loudoun, Prince William, Arlington y Alexandria.',
  },
  homeServices: { title: 'Un solo equipo para todo el jardín', intro: 'Desde el césped hasta las tuberías de riego debajo. Elija un servicio para ver todo lo que incluye.' },
  how: { title: 'Cómo funciona', intro: 'Sin presión y sin sorpresas. Usted recibe un precio claro antes de empezar cualquier trabajo.', titleAbout: 'Cómo trabajamos' },
  timing: {
    title: 'Trabajamos todo el año',
    text: 'Llame o escríbanos cuando nos necesite y agendamos su proyecto.',
    best: 'Mejores resultados en Virginia',
    to: 'a',
    monthsLong: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  },
  steps: [
    { title: 'Llame, escriba o envíe el formulario', text: 'Cuéntenos qué necesita su jardín. Las fotos ayudan.' },
    { title: 'Estimado gratis', text: 'Revisamos la propiedad y le damos un precio claro antes de empezar.' },
    { title: 'Hacemos el trabajo', text: 'El día acordado, y dejamos el jardín limpio al terminar.' },
    { title: 'Seguimiento', text: 'Confirmamos que todo quedó a su gusto y, si quiere, agendamos la próxima visita de temporada.' },
  ],
  areasBlock: { title: 'Dónde trabajamos', intro: 'Casas en todo Virginia. ¿No sabe si llegamos a su calle? Llame o escríbanos.', all: 'Todas las áreas' },
  cta: {
    title: 'Mándenos una foto de su jardín',
    text: 'Estimados gratis en el norte de Virginia. Llame, escriba o mande un WhatsApp. Una o dos fotos nos ayudan a entender el trabajo antes de la visita.',
  },

  servicesHub: {
    title: 'Servicios de jardinería',
    intro: 'Todo lo que hacemos para casas en Virginia, agrupado como usted piensa en su jardín. Abra un servicio para ver exactamente lo que incluye.',
    all: 'Todos los servicios',
    ctaTitle: '¿Necesita más de un servicio?',
    ctaText: 'Casi todos los jardines sí. Cuéntenos todo en una sola solicitud y le damos un solo precio.',
  },
  service: {
    included: 'Qué incluye',
    faq: 'Preguntas frecuentes',
    more: 'Servicios que suelen contratarse juntos',
    ctaTitle: (name: string) => `Estimado gratis de ${name.toLowerCase()}`,
    see: 'Ver qué incluye',
  },
  areasPage: {
    title: 'Áreas de servicio en Virginia',
    intro: 'Trabajamos en casas de estos condados y ciudades. Si la suya no aparece, llame o escríbanos: quizás también llegamos.',
    ctaTitle: '¿Su calle está en nuestra ruta?',
    ctaText: 'Envíe su código postal con el formulario, o simplemente llame. Le decimos de inmediato.',
  },
  gallery: {
    title: 'Nuestros trabajos',
    intro: 'Trabajos reales de nuestro equipo en el norte de Virginia, desde la primera visita hasta el jardín terminado.',
    stages: { before: 'Antes', during: 'Durante', after: 'Después' },
    viewService: 'Ver este servicio',
    spotlightKicker: 'Proyecto reciente',
    spotlightCta: 'Ver más trabajos',
  },
  about: {
    title: "Sobre Nino's Landscaping",
    intro: 'Un equipo local de jardinería que cuida casas en todo el norte de Virginia.',
    p1: "Nino's Landscaping cuida todo el jardín: el césped, las jardineras, los arbustos y el sistema de riego que está debajo. Nuestro logo es un aspersor por una razón. El riego y el drenaje son una gran parte de lo que hacemos, y son lo que mantiene todo lo demás verde.",
    p2: 'Trabajamos en Fairfax, Loudoun, Prince William, Arlington y Alexandria, así que conocemos el suelo arcilloso, los veranos húmedos y las heladas que marcan cada jardín de aquí.',
    expectTitle: 'Lo que puede esperar',
    expect: [
      'Un precio claro antes de empezar cualquier trabajo',
      'Un horario definido para cada visita',
      'El jardín limpio al terminar',
      'Una sola llamada para césped, jardineras, riego, drenaje e iluminación',
    ],
    licensedTitle: 'Con licencia y seguro',
    license: (cls: string, num: string, spec: string) => `Licencia de Contratista de Virginia ${cls} #${num}${spec ? ` con especialidades ${spec}` : ''}.`,
    footerLicense: (cls: string, num: string, spec: string) => `Contratista con licencia de Virginia ${cls} #${num}${spec ? ` (${spec})` : ''}`,
    insured: 'Totalmente asegurados.',
  },
  estimatePage: {
    title: 'Pida su estimado gratis',
    intro: 'Cuéntenos un poco sobre su jardín y lo llamamos o le escribimos para agendar una visita.',
    asideTitle: '¿Prefiere hablar?',
    asideText: 'Llame o escriba en horario de trabajo. Si no contestamos, le devolvemos la llamada.',
    asideLabel: 'Otras formas de contactarnos',
  },
  form: {
    notReadyTitle: 'Pida un estimado gratis',
    notReadyText: 'El formulario en línea se está configurando. Mientras tanto, llame o escríbanos y le respondemos rápido.',
    callNum: (n: string) => `Llamar al ${n}`,
    sendText: 'Enviar un texto',
    subject: (biz: string) => `Nueva solicitud de estimado – sitio web de ${biz}`,
    name: 'Su nombre',
    nameErr: 'Escriba su nombre para saber por quién preguntar.',
    phone: 'Teléfono',
    phoneErr: 'Escriba un teléfono con código de área, por ejemplo 703-555-0123.',
    email: 'Correo electrónico',
    optional: '(opcional)',
    emailErr: 'Revise el correo, parece incompleto.',
    zip: 'Código postal (ZIP)',
    zipErr: 'Escriba el código postal de 5 dígitos de la propiedad.',
    need: '¿Qué necesita?',
    other: 'Otra cosa',
    otherValue: 'Otro',
    msg: 'Cuéntenos sobre el jardín',
    msgPh: 'Tamaño del jardín, qué quiere que hagamos, mejores días para visitar…',
    reach: '¿Cómo prefiere que lo contactemos?',
    reachOpts: ['Llamada', 'Texto', 'WhatsApp', 'Correo'],
    language: 'Idioma',
    photos: '¿Tiene fotos? Envíelas por texto al',
    photosAfter: 'después de mandar el formulario.',
    privacy1: 'Usamos sus datos solo para responder esta solicitud. Vea nuestra',
    privacyLink: 'política de privacidad',
    send: 'Enviar mi solicitud',
    sending: 'Enviando…',
    error: 'La solicitud no se envió. Revise su conexión e intente de nuevo, o llame/escriba al',
    notSpecified: 'No indicado',
  },
  contactPage: {
    title: 'Contacto',
    intro: 'La forma más rápida de contactarnos es una llamada, un texto o WhatsApp.',
    callTitle: 'Llamar',
    textTitle: 'Texto',
    textSub: 'Mándenos fotos de su jardín',
    waSub: 'Escríbanos',
    emailTitle: 'Correo',
    formTitle: 'Formulario de estimado',
    formSub: 'Dos minutos, sin compromiso',
    serving: 'Trabajamos en todo Virginia: Fairfax, Loudoun, Prince William, Arlington y Alexandria',
  },
  thanks: {
    title: 'Solicitud enviada',
    text: (phone: string) => `Gracias. Le responderemos pronto. Si es urgente, llame o escriba al ${phone}.`,
    back: 'Volver al inicio',
  },
  privacyPage: {
    title: 'Política de privacidad',
    intro: 'Resumen en palabras simples de lo que este sitio recoge y por qué.',
    updated: 'Última actualización',
    sections: [
      ['Qué datos recibimos', 'Cuando envía el formulario de estimado, recibimos lo que escribe: nombre, teléfono, código postal y, si quiere, su correo y un mensaje. Los usamos solo para responder su solicitud y, si nos contrata, para agendar el trabajo.'],
      ['Quién los procesa', 'Los formularios llegan a nuestro correo a través de Web3Forms, un servicio de envío de formularios. No vendemos ni compartimos su información con nadie más.'],
      ['Cookies y rastreo', 'Este sitio no usa cookies, analítica ni rastreadores de publicidad.'],
      ['Servicios que ven su visita', 'Como cualquier sitio web, al cargar una página se comparte su dirección IP y datos del navegador con los servicios que la entregan: GitHub Pages (alojamiento){unsplash} y, si envía el formulario, Web3Forms. Usan esa información para entregar el contenido y evitar abusos.'],
    ],
    unsplash: ', Unsplash (algunas fotos)',
    choicesTitle: 'Sus opciones',
    choices: (phone: string) => `Para saber qué información tenemos sobre usted, o pedir que la borremos, llame o escriba al ${phone}.`,
  },
}

const STRINGS: Record<Lang, Strings> = { en, es }
export const s = (): Strings => STRINGS[current]
