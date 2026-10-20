/**
 * Demo data for the staff portal. Everything is invented and lives in memory:
 * reloading the page brings back this seed. Dates are relative to today so the
 * dashboard always has something "today", "this week" and "overdue".
 */

/* ---------- Types ---------- */

export type ClientTag = 'Recurrente' | 'Nuevo' | 'Comercial' | 'Riego' | 'VIP'
export type Client = {
  id: string
  name: string
  contact?: string
  phone: string
  email: string
  address: string
  city: string
  zip: string
  tags: ClientTag[]
  /** gate codes, pets, where to park… what the crew needs on site */
  notes: string
  prefers: 'Texto' | 'Llamada' | 'WhatsApp' | 'Email'
  lang: 'ES' | 'EN'
  since: string
}

export type Unit = 'visita' | 'servicio' | 'yd³' | 'pie²' | 'pie lin.' | 'hora' | 'c/u'
/** `cost` = estimated cost to Nino (materials + labor); internal, never shown to clients */
export type PriceItem = { id: string; name: string; unit: Unit; price: number; cost?: number; group: string }

/** `priceId` links the line to its price-book item (used to save packages) */
export type Line = { id: string; desc: string; qty: number; unit: Unit; price: number; cost?: number; priceId?: string }

/** One-tap bundles of price-book items for the quote editor */
export type Package = { id: string; name: string; note: string; repeat?: 'Semanal' | 'Quincenal' | 'Mensual'; items: { priceId: string; qty: number }[] }

export type QuoteStatus = 'Borrador' | 'Enviada' | 'Vista' | 'Aprobada' | 'Rechazada'
export type Quote = {
  id: string
  number: string
  clientId: string
  title: string
  status: QuoteStatus
  created: string
  sent?: string
  viewed?: string
  decided?: string
  /** last follow-up reminder sent */
  followUp?: string
  validDays: number
  lines: Line[]
  taxPct: number
  depositPct: number
  notes: string
}

export type ContractStatus = 'Borrador' | 'Enviado' | 'Firmado'
export type Contract = {
  id: string
  number: string
  quoteId: string
  clientId: string
  status: ContractStatus
  start: string
  end: string
  sent?: string
  signed?: string
  /** drawn signature as SVG path data */
  signature?: string
  /** typed signature (keyboard alternative to drawing) */
  signedName?: string
  /** client declined the use of job photos (contract §10) */
  noPhotos?: boolean
}

export type EventType = 'Mantenimiento' | 'Proyecto' | 'Estimado' | 'Riego' | 'Interno'
export type EventStatus = 'Programado' | 'En camino' | 'Completado' | 'Reprogramado'
export type Crew = 'Equipo 1' | 'Equipo 2'
export type Job = {
  id: string
  title: string
  clientId?: string
  date: string
  time: string
  hours: number
  type: EventType
  crew: Crew
  status: EventStatus
  repeat?: 'Semanal' | 'Quincenal' | 'Mensual'
  amount?: number
  invoiceId?: string
  notes?: string
}

export type PayMethod = 'Tarjeta' | 'ACH' | 'Efectivo' | 'Cheque' | 'Zelle'
export type Invoice = {
  id: string
  number: string
  clientId: string
  issued: string
  due: string
  lines: Line[]
  payments: { date: string; amount: number; method: PayMethod }[]
  sentReminder?: string
  linkSent?: string
}

export type Template = { id: string; name: string; text: string }

export type Db = {
  clients: Client[]
  prices: PriceItem[]
  packages: Package[]
  quotes: Quote[]
  contracts: Contract[]
  jobs: Job[]
  invoices: Invoice[]
  templates: Template[]
  activity: { at: string; text: string }[]
}

/* ---------- Date helpers (local dates as 'YYYY-MM-DD') ---------- */

export const today = () => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}
export const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
export const parse = (s: string) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}
export const addDays = (s: string | Date, n: number) => {
  const d = typeof s === 'string' ? parse(s) : new Date(s)
  d.setDate(d.getDate() + n)
  return iso(d)
}
export const daysBetween = (a: string, b: string) => Math.round((parse(b).getTime() - parse(a).getTime()) / 86400000)
/** next working day (Mon–Sat; the crew is off on Sunday) */
export const nextWorkday = (s: string) => {
  let d = addDays(s, 1)
  if (parse(d).getDay() === 0) d = addDays(d, 1)
  return d
}

/* ---------- Money ---------- */

export const lineTotal = (l: Line) => l.qty * l.price
export const subtotal = (lines: Line[]) => lines.reduce((a, l) => a + lineTotal(l), 0)
/** estimated margin over the lines that have a known cost (null when none do) */
export function margin(lines: Line[]) {
  const known = lines.filter((l) => l.cost !== undefined)
  const revenue = subtotal(known)
  if (!known.length || !revenue) return null
  const cost = known.reduce((a, l) => a + l.qty * (l.cost ?? 0), 0)
  return { profit: revenue - cost, pct: Math.round(((revenue - cost) / revenue) * 100), partial: known.length < lines.length }
}
/** price-book item → quote line */
export const lineFrom = (p: PriceItem, qty = 1): Line => ({ id: uid('l'), desc: p.name, qty, unit: p.unit, price: p.price, cost: p.cost, priceId: p.id })

/** date + n business days (Mon–Fri), for the 3-day cancellation period */
export function addBusinessDays(s: string, n: number) {
  let d = s
  while (n > 0) {
    d = addDays(d, 1)
    const wd = parse(d).getDay()
    if (wd !== 0 && wd !== 6) n--
  }
  return d
}
export const quoteTotal = (q: Pick<Quote, 'lines' | 'taxPct'>) => subtotal(q.lines) * (1 + q.taxPct / 100)
export const invoiceTotal = (i: Invoice) => subtotal(i.lines)
export const invoicePaid = (i: Invoice) => i.payments.reduce((a, p) => a + p.amount, 0)
/** rounded to cents so forms and statuses agree */
export const invoiceBalance = (i: Invoice) => Math.max(0, Math.round((invoiceTotal(i) - invoicePaid(i)) * 100) / 100)
export type InvoiceStatus = 'Pagada' | 'Parcial' | 'Vencida' | 'Pendiente'
export function invoiceStatus(i: Invoice, now = iso(today())): InvoiceStatus {
  const bal = invoiceBalance(i)
  if (bal < 0.01) return 'Pagada'
  if (i.due < now) return 'Vencida'
  if (invoicePaid(i) > 0) return 'Parcial'
  return 'Pendiente'
}

let seq = 1000
export const uid = (p: string) => `${p}${++seq}`

/** next document number after the highest one in use, e.g. F-3112 → F-3113 */
export const nextNumber = (prefix: string, list: { number: string }[]) =>
  `${prefix}-${Math.max(0, ...list.map((x) => Number(x.number.split('-')[1]) || 0)) + 1}`

/* ---------- Seed ---------- */

export function seed(): Db {
  const t = iso(today())
  const d = (n: number) => addDays(t, n)

  const clients: Client[] = [
    { id: 'c1', name: 'María y José Hernández', phone: '703-555-0142', email: 'hernandez.familia@example.com', address: '6120 Maple Ridge Ct', city: 'Centreville', zip: '20120', tags: ['Recurrente', 'VIP', 'Riego'], notes: 'Perro amigable en el patio trasero. Portón lateral con código 2580. Cortar a 3.5".', prefers: 'WhatsApp', lang: 'ES', since: d(-820) },
    { id: 'c2', name: 'Daniel Brooks', phone: '703-555-0187', email: 'dbrooks@example.com', address: '10412 Oak Hollow Dr', city: 'Fairfax', zip: '22030', tags: ['Recurrente'], notes: 'Estacionar en la calle, no en la entrada. Bolsas de recorte a la parte de atrás.', prefers: 'Texto', lang: 'EN', since: d(-540) },
    { id: 'c3', name: 'Anita Patel', phone: '571-555-0119', email: 'anita.patel@example.com', address: '43890 Brambleton Way', city: 'Ashburn', zip: '20148', tags: ['Riego', 'Recurrente'], notes: '7 zonas de riego. Controlador Rachio en el garaje.', prefers: 'Email', lang: 'EN', since: d(-400) },
    { id: 'c4', name: 'Laura Kim', phone: '703-555-0163', email: 'laura.kim@example.com', address: '1508 Cedar Glen Ln', city: 'Vienna', zip: '22182', tags: ['Nuevo'], notes: 'Quiere renovar jardineras del frente. Pidió fotos de trabajos anteriores.', prefers: 'Texto', lang: 'EN', since: d(-9) },
    { id: 'c5', name: 'Robert y Linda Carter', phone: '703-555-0131', email: 'carters@example.com', address: '11902 Lake Newport Rd', city: 'Reston', zip: '20194', tags: ['Recurrente', 'Riego'], notes: 'Agua acumulada junto a la bajante del lado izquierdo.', prefers: 'Llamada', lang: 'EN', since: d(-610) },
    { id: 'c6', name: 'Sofía Ramírez', phone: '571-555-0175', email: 'sofia.ramirez@example.com', address: '9315 Sudley Manor Dr', city: 'Manassas', zip: '20109', tags: ['Recurrente'], notes: 'Pagar en efectivo, deja el sobre con la vecina si no está.', prefers: 'WhatsApp', lang: 'ES', since: d(-300) },
    { id: 'c7', name: "Kevin O'Brien", phone: '703-555-0108', email: 'kobrien@example.com', address: '2207 Fox Mill Rd', city: 'Herndon', zip: '20171', tags: ['Nuevo'], notes: 'Townhouse. Interesado en piedra de río a los lados de la escalera.', prefers: 'Texto', lang: 'EN', since: d(-6) },
    { id: 'c8', name: 'Greenbriar Commons HOA', contact: 'Patricia Moore (administradora)', phone: '703-555-0190', email: 'board@greenbriar-hoa.example.com', address: '4400 Stonecroft Blvd', city: 'Chantilly', zip: '20151', tags: ['Comercial', 'Recurrente'], notes: '3 áreas comunes + entrada. Facturar el día 1 de cada mes. Pide certificado de seguro.', prefers: 'Email', lang: 'EN', since: d(-700) },
    { id: 'c9', name: 'Ahmed Hassan', phone: '703-555-0156', email: 'ahassan@example.com', address: '7811 Rolling Rd', city: 'Springfield', zip: '22153', tags: ['Riego'], notes: 'Válvula de la zona 3 con fuga (reparada el mes pasado).', prefers: 'Llamada', lang: 'EN', since: d(-210) },
    { id: 'c10', name: 'Jessica Nguyen', phone: '571-555-0144', email: 'jnguyen@example.com', address: '6004 Burke Centre Pkwy', city: 'Burke', zip: '22015', tags: ['Recurrente'], notes: 'Gato en el porche, cerrar la puerta de la cerca.', prefers: 'Texto', lang: 'EN', since: d(-150) },
    { id: 'c11', name: 'Thomas Wright', phone: '703-555-0122', email: 'twright@example.com', address: '19 Catoctin Cir NE', city: 'Leesburg', zip: '20176', tags: ['Nuevo'], notes: 'Luces de jardín para el frente y el camino.', prefers: 'Email', lang: 'EN', since: d(-4) },
    { id: 'c12', name: 'Carmen Díaz', phone: '571-555-0138', email: 'carmen.diaz@example.com', address: '14520 Smoketown Rd', city: 'Woodbridge', zip: '22192', tags: ['Recurrente'], notes: 'Prefiere visitas temprano en la mañana.', prefers: 'WhatsApp', lang: 'ES', since: d(-260) },
    { id: 'c13', name: 'Michael Johnson', phone: '703-555-0179', email: 'mjohnson@example.com', address: '312 Commonwealth Ave', city: 'Alexandria', zip: '22301', tags: [], notes: 'Calle angosta: llevar la camioneta pequeña.', prefers: 'Texto', lang: 'EN', since: d(-90) },
    { id: 'c14', name: 'Oakton Family Dental', contact: 'Dra. Rachel Green', phone: '703-555-0111', email: 'office@oaktondental.example.com', address: '2946 Chain Bridge Rd', city: 'Oakton', zip: '22124', tags: ['Comercial'], notes: 'Trabajar antes de las 8 am o después de las 5 pm (pacientes).', prefers: 'Email', lang: 'EN', since: d(-120) },
  ]

  const prices: PriceItem[] = [
    { id: 'p1', group: 'Césped', name: 'Mantenimiento de césped: corte, perfilado de bordes y soplado', unit: 'visita', price: 55, cost: 24 },
    { id: 'p2', group: 'Césped', name: 'Aireación mecánica y resiembra', unit: 'servicio', price: 195, cost: 95 },
    { id: 'p3', group: 'Césped', name: 'Suministro e instalación de césped en rollo', unit: 'pie²', price: 1.85, cost: 0.95 },
    { id: 'p4', group: 'Jardineras', name: 'Suministro e instalación de mulch (negro o café)', unit: 'yd³', price: 95, cost: 52 },
    { id: 'p5', group: 'Jardineras', name: 'Suministro e instalación de piedra de río', unit: 'yd³', price: 165, cost: 98 },
    { id: 'p6', group: 'Jardineras', name: 'Instalación de malla geotextil antimaleza', unit: 'pie²', price: 0.65, cost: 0.28 },
    { id: 'p7', group: 'Jardineras', name: 'Instalación de borde de adoquín', unit: 'pie lin.', price: 14, cost: 7.5 },
    { id: 'p8', group: 'Jardineras', name: 'Suministro y plantación de arbusto (3 gal.)', unit: 'c/u', price: 48, cost: 26 },
    { id: 'p9', group: 'Poda', name: 'Poda y formación de arbustos y setos', unit: 'hora', price: 65, cost: 34 },
    { id: 'p10', group: 'Limpiezas', name: 'Limpieza integral de otoño', unit: 'servicio', price: 280, cost: 140 },
    { id: 'p11', group: 'Limpiezas', name: 'Retiro de hojas y residuos vegetales', unit: 'servicio', price: 180, cost: 90 },
    { id: 'p12', group: 'Riego', name: 'Puesta en marcha del sistema de riego (primavera)', unit: 'servicio', price: 95, cost: 42 },
    { id: 'p13', group: 'Riego', name: 'Cierre y purga del sistema de riego (winterización)', unit: 'servicio', price: 85, cost: 38 },
    { id: 'p14', group: 'Riego', name: 'Diagnóstico y reparación del sistema de riego', unit: 'hora', price: 85, cost: 44 },
    { id: 'p15', group: 'Riego', name: 'Reemplazo de cabezal de aspersor', unit: 'c/u', price: 28, cost: 12 },
    { id: 'p16', group: 'Riego', name: 'Instalación de caja de válvulas', unit: 'c/u', price: 145, cost: 78 },
    { id: 'p17', group: 'Drenaje', name: 'Instalación de drenaje francés', unit: 'pie lin.', price: 38, cost: 21 },
    { id: 'p18', group: 'Drenaje', name: 'Extensión subterránea de bajante con salida emergente', unit: 'c/u', price: 425, cost: 230 },
    { id: 'p19', group: 'Iluminación', name: 'Suministro e instalación de luminaria LED de camino', unit: 'c/u', price: 165, cost: 82 },
    { id: 'p20', group: 'Iluminación', name: 'Suministro e instalación de transformador de bajo voltaje', unit: 'c/u', price: 350, cost: 190 },
  ]
  const P = (id: string, qty: number): Line => lineFrom(prices.find((x) => x.id === id)!, qty)

  const packages: Package[] = [
    { id: 'k-sem', name: 'Mantenimiento semanal de césped', note: 'Visita semanal de corte, perfilado y soplado (abril a noviembre)', repeat: 'Semanal', items: [{ priceId: 'p1', qty: 1 }] },
    { id: 'k-quin', name: 'Mantenimiento quincenal de césped', note: 'Visita cada dos semanas, recomendada en verano y otoño', repeat: 'Quincenal', items: [{ priceId: 'p1', qty: 1 }] },
    { id: 'k-prim', name: 'Programa de primavera', note: 'Puesta en marcha del riego, mulch nuevo y poda', items: [{ priceId: 'p12', qty: 1 }, { priceId: 'p4', qty: 4 }, { priceId: 'p9', qty: 2 }] },
    { id: 'k-oto', name: 'Programa de otoño', note: 'Limpieza integral, retiro de hojas, aireación y resiembra', items: [{ priceId: 'p10', qty: 1 }, { priceId: 'p11', qty: 1 }, { priceId: 'p2', qty: 1 }] },
    { id: 'k-cierre', name: 'Winterización del sistema de riego', note: 'Cierre y purga antes de la primera helada', items: [{ priceId: 'p13', qty: 1 }] },
    { id: 'k-jard', name: 'Renovación de jardineras', note: 'Mulch nuevo, 3 arbustos y poda', items: [{ priceId: 'p4', qty: 3 }, { priceId: 'p8', qty: 3 }, { priceId: 'p9', qty: 2 }] },
    { id: 'k-piedra', name: 'Jardineras de piedra de río', note: 'Malla geotextil, piedra de río y borde de adoquín, como el proyecto de la galería', items: [{ priceId: 'p6', qty: 120 }, { priceId: 'p5', qty: 2 }, { priceId: 'p7', qty: 46 }] },
    { id: 'k-dren', name: 'Drenaje de bajante pluvial', note: 'Extensión subterránea con salida emergente y drenaje francés', items: [{ priceId: 'p18', qty: 1 }, { priceId: 'p17', qty: 20 }] },
    { id: 'k-luz', name: 'Iluminación de caminos', note: '6 luminarias LED y transformador de bajo voltaje', items: [{ priceId: 'p19', qty: 6 }, { priceId: 'p20', qty: 1 }] },
  ]

  const quotes: Quote[] = [
    { id: 'q1', number: 'Q-1048', clientId: 'c7', title: 'Jardineras de piedra de río (townhouse)', status: 'Enviada', created: d(-6), sent: d(-5), validDays: 30, lines: [P('p6', 120), P('p5', 2), P('p7', 46)], taxPct: 0, depositPct: 30, notes: 'Incluye retirar maleza y nivelar. Ambos lados de la escalera.' },
    { id: 'q2', number: 'Q-1049', clientId: 'c4', title: 'Renovación de jardineras del frente', status: 'Vista', created: d(-4), sent: d(-3), viewed: d(-2), validDays: 30, lines: [P('p4', 6), P('p8', 7), P('p9', 4)], taxPct: 0, depositPct: 30, notes: 'Plantas a elegir con la clienta.' },
    { id: 'q3', number: 'Q-1050', clientId: 'c11', title: 'Iluminación de camino y frente', status: 'Borrador', created: d(-1), validDays: 30, lines: [P('p19', 8), P('p20', 1)], taxPct: 0, depositPct: 50, notes: '' },
    { id: 'q4', number: 'Q-1045', clientId: 'c5', title: 'Drenaje de bajante pluvial (lado izquierdo)', status: 'Aprobada', created: d(-20), sent: d(-19), viewed: d(-18), decided: d(-15), validDays: 30, lines: [P('p18', 1), P('p17', 30)], taxPct: 0, depositPct: 30, notes: 'Restaurar el césped con semilla al terminar.' },
    { id: 'q5', number: 'Q-1046', clientId: 'c1', title: 'Limpieza integral de otoño y mulch', status: 'Aprobada', created: d(-14), sent: d(-14), viewed: d(-13), decided: d(-12), validDays: 30, lines: [P('p10', 1), P('p4', 8)], taxPct: 0, depositPct: 0, notes: '' },
    { id: 'q6', number: 'Q-1043', clientId: 'c13', title: 'Poda de setos', status: 'Rechazada', created: d(-30), sent: d(-29), viewed: d(-27), decided: d(-25), validDays: 30, lines: [P('p9', 5)], taxPct: 0, depositPct: 0, notes: 'El cliente dijo que lo hará él mismo este año.' },
    { id: 'q7', number: 'Q-1047', clientId: 'c3', title: 'Winterización del riego y reemplazo de 3 cabezales', status: 'Enviada', created: d(-8), sent: d(-8), validDays: 30, lines: [P('p13', 1), P('p15', 3)], taxPct: 0, depositPct: 0, notes: '' },
    { id: 'q8', number: 'Q-1051', clientId: 'c14', title: 'Mantenimiento mensual de temporada baja (nov–mar)', status: 'Borrador', created: t, validDays: 30, lines: [P('p11', 2), P('p9', 6)], taxPct: 0, depositPct: 0, notes: 'Horario fuera de consulta.' },
  ]

  const contracts: Contract[] = [
    { id: 'k1', number: 'C-2031', quoteId: 'q4', clientId: 'c5', status: 'Firmado', start: d(3), end: d(4), sent: d(-15), signed: d(-14) },
    { id: 'k2', number: 'C-2032', quoteId: 'q5', clientId: 'c1', status: 'Enviado', start: d(5), end: d(5), sent: d(-4) },
  ]

  /* Jobs: recurring maintenance (generated for a window around today) + one-off work */
  const jobs: Job[] = []
  const route: [string, number, string, Crew, Job['repeat'], number][] = [
    // clientId, weekday (1=Mon), time, crew, repeat, price
    ['c1', 2, '08:00', 'Equipo 1', 'Semanal', 65],
    ['c2', 2, '09:30', 'Equipo 1', 'Semanal', 55],
    ['c10', 2, '11:00', 'Equipo 1', 'Semanal', 55],
    ['c6', 3, '08:00', 'Equipo 2', 'Semanal', 60],
    ['c12', 3, '07:30', 'Equipo 1', 'Semanal', 55],
    ['c8', 4, '08:00', 'Equipo 2', 'Semanal', 420],
    ['c3', 5, '09:00', 'Equipo 1', 'Quincenal', 70],
    ['c5', 1, '08:30', 'Equipo 2', 'Semanal', 60],
  ]
  for (let n = -21; n <= 60; n++) {
    const day = d(n)
    const wd = parse(day).getDay()
    for (const [clientId, weekday, time, crew, repeat, amount] of route) {
      if (wd !== weekday) continue
      if (repeat === 'Quincenal' && Math.floor((n + 21) / 7) % 2) continue
      jobs.push({
        id: uid('j'),
        title: clientId === 'c8' ? 'Mantenimiento de áreas comunes' : 'Mantenimiento de césped',
        clientId,
        date: day,
        time,
        hours: clientId === 'c8' ? 4 : 1,
        type: 'Mantenimiento',
        crew,
        status: n < 0 ? 'Completado' : 'Programado',
        repeat,
        amount,
      })
    }
  }
  // make sure "today" always has a full day, whatever weekday it is (Sunday stays free)
  if (parse(t).getDay() !== 0 && !jobs.some((j) => j.date === t && j.type === 'Mantenimiento')) {
    for (const [clientId, , time, crew, repeat, amount] of route.slice(0, 3))
      jobs.push({ id: uid('j'), title: 'Mantenimiento de césped', clientId, date: t, time, hours: 1, type: 'Mantenimiento', crew, status: 'Programado', repeat, amount })
  }
  const one = (j: Omit<Job, 'id'>) => jobs.push({ id: uid('j'), ...j })
  one({ title: 'Visita de estimado: jardineras del frente', clientId: 'c4', date: t, time: '14:00', hours: 1, type: 'Estimado', crew: 'Equipo 1', status: 'Programado' })
  one({ title: 'Winterización del sistema de riego', clientId: 'c9', date: t, time: '13:00', hours: 1, type: 'Riego', crew: 'Equipo 2', status: 'Programado', amount: 85 })
  one({ title: 'Drenaje de bajante pluvial (lado izquierdo)', clientId: 'c5', date: d(3), time: '08:00', hours: 8, type: 'Proyecto', crew: 'Equipo 2', status: 'Programado', notes: 'Contrato C-2031. Llamar a Miss Utility (811) antes de excavar.' })
  one({ title: 'Limpieza integral de otoño y mulch', clientId: 'c1', date: d(5), time: '08:00', hours: 6, type: 'Proyecto', crew: 'Equipo 1', status: 'Programado', notes: 'Esperando firma del contrato C-2032.' })
  one({ title: 'Winterización del sistema de riego', clientId: 'c3', date: d(9), time: '10:00', hours: 1, type: 'Riego', crew: 'Equipo 1', status: 'Programado', amount: 85 })
  one({ title: 'Winterización del sistema de riego', clientId: 'c1', date: d(12), time: '10:00', hours: 1, type: 'Riego', crew: 'Equipo 1', status: 'Programado', amount: 85 })
  one({ title: 'Winterización del sistema de riego', clientId: 'c5', date: d(13), time: '11:00', hours: 1, type: 'Riego', crew: 'Equipo 2', status: 'Programado', amount: 85 })
  one({ title: 'Visita de estimado: piedra de río', clientId: 'c7', date: d(1), time: '16:00', hours: 1, type: 'Estimado', crew: 'Equipo 1', status: 'Programado' })
  one({ title: 'Visita de estimado: iluminación exterior', clientId: 'c11', date: d(2), time: '17:00', hours: 1, type: 'Estimado', crew: 'Equipo 1', status: 'Programado' })
  one({ title: 'Mantenimiento de cortadoras y afilado de cuchillas', date: d(6), time: '15:00', hours: 3, type: 'Interno', crew: 'Equipo 2', status: 'Programado', notes: 'Cambio de aceite y afilado antes de la temporada de hojas.' })
  one({ title: 'Renovar seguro de responsabilidad', date: d(17), time: '09:00', hours: 1, type: 'Interno', crew: 'Equipo 1', status: 'Programado', notes: 'Pedir certificado para Greenbriar HOA.' })
  one({ title: 'Reparación de válvula del riego (zona 3)', clientId: 'c9', date: d(-3), time: '10:00', hours: 2, type: 'Riego', crew: 'Equipo 2', status: 'Completado', amount: 315 })
  one({ title: 'Poda de arbustos', clientId: 'c13', date: d(-2), time: '13:00', hours: 3, type: 'Mantenimiento', crew: 'Equipo 1', status: 'Completado', amount: 195 })

  /* Invoices */
  const L = (desc: string, qty: number, unit: Unit, price: number): Line => ({ id: uid('l'), desc, qty, unit, price })
  const invoices: Invoice[] = [
    { id: 'f1', number: 'F-3101', clientId: 'c8', issued: d(-50), due: d(-20), lines: [L('Mantenimiento de áreas comunes (septiembre)', 4, 'visita', 420)], payments: [{ date: d(-22), amount: 1680, method: 'ACH' }] },
    { id: 'f2', number: 'F-3104', clientId: 'c2', issued: d(-38), due: d(-23), lines: [L('Mantenimiento de césped (septiembre)', 4, 'visita', 55)], payments: [] },
    { id: 'f3', number: 'F-3106', clientId: 'c6', issued: d(-25), due: d(-10), lines: [L('Mantenimiento de césped', 4, 'visita', 60), L('Poda de arbustos y setos', 2, 'hora', 65)], payments: [{ date: d(-12), amount: 150, method: 'Efectivo' }] },
    { id: 'f4', number: 'F-3107', clientId: 'c1', issued: d(-20), due: d(-5), lines: [L('Mantenimiento de césped', 4, 'visita', 65)], payments: [{ date: d(-6), amount: 260, method: 'Zelle' }] },
    { id: 'f5', number: 'F-3108', clientId: 'c5', issued: d(-15), due: d(15), lines: [L('Depósito 30 % · Q-1045 Drenaje de bajante pluvial (lado izquierdo)', 1, 'servicio', 469.5)], payments: [{ date: d(-13), amount: 469.5, method: 'Tarjeta' }] },
    { id: 'f6', number: 'F-3109', clientId: 'c8', issued: d(-19), due: d(11), lines: [L('Mantenimiento de áreas comunes (octubre)', 4, 'visita', 420)], payments: [] },
    { id: 'f7', number: 'F-3110', clientId: 'c12', issued: d(-8), due: d(7), lines: [L('Mantenimiento de césped', 3, 'visita', 55)], payments: [] },
    { id: 'f8', number: 'F-3111', clientId: 'c10', issued: d(-12), due: d(3), lines: [L('Mantenimiento de césped', 4, 'visita', 55), L('Retiro de hojas y residuos vegetales', 1, 'servicio', 180)], payments: [{ date: d(-1), amount: 400, method: 'Tarjeta' }] },
    { id: 'f9', number: 'F-3112', clientId: 'c3', issued: d(-40), due: d(-26), lines: [L('Diagnóstico y reparación del sistema de riego', 2, 'hora', 85), L('Reemplazo de cabezal de aspersor', 4, 'c/u', 28)], payments: [{ date: d(-28), amount: 282, method: 'Tarjeta' }] },
  ]

  const templates: Template[] = [
    { id: 't1', name: 'Vamos en camino', text: 'Hola {cliente}, somos Nino’s Landscaping. Vamos en camino y llegamos en unos 20 minutos.' },
    { id: 't2', name: 'Recordatorio de visita', text: 'Hola {cliente}, le recordamos su visita de mañana a las {hora}. Responda C para confirmar.' },
    { id: 't3', name: 'Seguimiento de cotización', text: 'Hola {cliente}, ¿pudo revisar la cotización {numero}? Con gusto respondemos cualquier pregunta.' },
    { id: 't4', name: 'Recordatorio de pago', text: 'Hola {cliente}, la factura {numero} por {monto} venció el {fecha}. Puede pagar aquí: {link}. ¡Gracias!' },
    { id: 't5', name: 'Día de lluvia', text: 'Hola {cliente}, por la lluvia movimos su visita al {fecha}. Disculpe las molestias.' },
    { id: 't6', name: 'Pedir reseña', text: 'Gracias por confiar en Nino’s Landscaping. Si quedó contento, ¿nos deja una reseña en Google? {link}' },
  ]

  return { clients, prices, packages, quotes, contracts, jobs, invoices, templates, activity: [] }
}
