import { useState, type FormEvent } from 'react'
import { invoiceBalance, invoiceStatus, invoiceTotal, iso, quoteTotal, today, uid, type Client, type ClientTag } from '../data'
import { go, useStore } from '../store'
import { Avatar, Badge, Button, Card, Empty, Field, Header, Icon, Row, Segmented, Sheet, TYPE_TONE, fmtDate, fmtFull, fmtTime, money, rel } from '../ui'

const TAGS: ClientTag[] = ['Recurrente', 'Comercial', 'Riego', 'Nuevo', 'VIP']
const digits = (p: string) => p.replace(/\D/g, '')

export function Clients({ query }: { query: URLSearchParams }) {
  const { db } = useStore()
  const [q, setQ] = useState('')
  const tag = (query.get('tag') ?? 'Todos') as 'Todos' | ClientTag
  const t = iso(today())

  const list = db.clients
    .filter((c) => tag === 'Todos' || c.tags.includes(tag))
    .filter((c) => !q || `${c.name} ${c.city} ${c.address} ${c.phone} ${c.email}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name))

  const balance = (c: Client) => db.invoices.filter((i) => i.clientId === c.id).reduce((a, i) => a + invoiceBalance(i), 0)
  const late = (c: Client) => db.invoices.some((i) => i.clientId === c.id && invoiceStatus(i) === 'Vencida')
  const next = (c: Client) => db.jobs.filter((j) => j.clientId === c.id && j.date >= t && j.status !== 'Completado').sort((a, b) => a.date.localeCompare(b.date))[0]

  return (
    <>
      <Header title="Clientes" sub={`${db.clients.length} clientes · ${db.clients.filter((c) => c.tags.includes('Recurrente')).length} con mantenimiento recurrente`} actions={<Button kind="primary" icon="plus" onClick={() => go('/clientes?nuevo=1')}>Nuevo cliente</Button>} />
      <div className="toolbar">
        <label className="search">
          <Icon name="search" size={18} />
          <input type="search" placeholder="Buscar por nombre, ciudad, teléfono…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar clientes" />
        </label>
        <Segmented
          label="Filtrar por etiqueta"
          value={tag}
          onChange={(v) => go(v === 'Todos' ? '/clientes' : `/clientes?tag=${v}`)}
          options={[{ value: 'Todos', label: 'Todos' }, ...TAGS.map((x) => ({ value: x, label: x, count: db.clients.filter((c) => c.tags.includes(x)).length }))]}
        />
      </div>
      <Card flush>
        {list.length ? (
          <div className="group group--flat">
            {list.map((c) => {
              const bal = balance(c)
              const n = next(c)
              return (
                <Row
                  key={c.id}
                  href={`#/clientes/${c.id}`}
                  lead={<Avatar name={c.name} />}
                  title={<>{c.name} {c.tags.includes('VIP') ? <Badge tone="orange">VIP</Badge> : null}</>}
                  sub={`${c.city} · ${c.tags.filter((x) => x !== 'VIP').join(', ') || 'Sin etiqueta'}${n ? ` · próxima visita ${rel(n.date)}` : ''}`}
                  trail={bal > 0 ? <span className={late(c) ? 'txt-red strong' : 'strong'}>{money(bal)}</span> : <span className="muted small">Al día</span>}
                />
              )
            })}
          </div>
        ) : (
          <Empty icon="users" title="Sin resultados" text="Pruebe con otro nombre o quite el filtro." />
        )}
      </Card>
      {query.get('nuevo') === '1' ? <NewClient onClose={() => go('/clientes')} /> : null}
    </>
  )
}

function NewClient({ onClose }: { onClose: () => void }) {
  const { update, log } = useStore()
  const [f, setF] = useState({ name: '', phone: '', email: '', address: '', city: '', zip: '', notes: '', prefers: 'Texto' as Client['prefers'], lang: 'ES' as Client['lang'], tags: ['Nuevo'] as ClientTag[] })
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }))
  const submit = (e: FormEvent) => {
    e.preventDefault()
    const id = uid('c')
    update((d) => { d.clients.unshift({ id, ...f, since: iso(today()) }) })
    log(`Cliente agregado: ${f.name}`, 'Cliente agregado')
    go(`/clientes/${id}`)
  }
  return (
    <Sheet open onClose={onClose} title="Nuevo cliente" footer={<><Button kind="plain" onClick={onClose}>Cancelar</Button><Button kind="primary" type="submit" form="new-client">Guardar</Button></>}>
      <form id="new-client" className="form" onSubmit={submit}>
        <Field label="Nombre"><input required value={f.name} onChange={(e) => set('name', e.target.value)} autoComplete="off" /></Field>
        <div className="form__row">
          <Field label="Teléfono"><input type="tel" required value={f.phone} onChange={(e) => set('phone', e.target.value)} placeholder="703-555-0100" /></Field>
          <Field label="Email"><input type="email" value={f.email} onChange={(e) => set('email', e.target.value)} /></Field>
        </div>
        <Field label="Dirección"><input value={f.address} onChange={(e) => set('address', e.target.value)} /></Field>
        <div className="form__row">
          <Field label="Ciudad"><input value={f.city} onChange={(e) => set('city', e.target.value)} /></Field>
          <Field label="ZIP"><input inputMode="numeric" value={f.zip} onChange={(e) => set('zip', e.target.value)} /></Field>
        </div>
        <div className="form__row">
          <Field label="Prefiere">
            <select value={f.prefers} onChange={(e) => set('prefers', e.target.value as Client['prefers'])}>
              <option>Texto</option><option>Llamada</option><option>WhatsApp</option><option>Email</option>
            </select>
          </Field>
          <Field label="Idioma">
            <select value={f.lang} onChange={(e) => set('lang', e.target.value as Client['lang'])}>
              <option value="ES">Español</option><option value="EN">Inglés</option>
            </select>
          </Field>
        </div>
        <fieldset className="tags-pick">
          <legend className="field__label">Etiquetas</legend>
          {TAGS.map((x) => (
            <label key={x} className="check">
              <input type="checkbox" checked={f.tags.includes(x)} onChange={(e) => set('tags', e.target.checked ? [...f.tags, x] : f.tags.filter((y) => y !== x))} /> {x}
            </label>
          ))}
        </fieldset>
        <Field label="Notas de la propiedad" hint="Códigos de portón, mascotas, dónde estacionar…"><textarea rows={2} value={f.notes} onChange={(e) => set('notes', e.target.value)} /></Field>
      </form>
    </Sheet>
  )
}

type Tab = 'visitas' | 'cotizaciones' | 'facturas' | 'contratos'

export function ClientDetail({ id }: { id: string }) {
  const { db, update, toast, client } = useStore()
  const c = client(id)
  const [tab, setTab] = useState<Tab>('visitas')
  const [notes, setNotes] = useState(c?.notes ?? '')
  if (!c) return <Empty icon="users" title="Cliente no encontrado" action={<a className="btn btn--secondary" href="#/clientes">Volver a clientes</a>} />

  const t = iso(today())
  const jobs = db.jobs.filter((j) => j.clientId === id).sort((a, b) => b.date.localeCompare(a.date))
  const nextJobs = jobs.filter((j) => j.date >= t && j.status !== 'Completado').reverse()
  const pastJobs = jobs.filter((j) => j.date < t || j.status === 'Completado')
  const quotes = db.quotes.filter((q) => q.clientId === id)
  const invoices = db.invoices.filter((i) => i.clientId === id)
  const contracts = db.contracts.filter((k) => k.clientId === id)
  const balance = invoices.reduce((a, i) => a + invoiceBalance(i), 0)
  const billed = invoices.reduce((a, i) => a + invoiceTotal(i), 0)
  const wa = `https://wa.me/1${digits(c.phone)}`
  const map = `https://maps.google.com/?q=${encodeURIComponent(`${c.address}, ${c.city}, VA ${c.zip}`)}`

  return (
    <>
      <Header back={{ href: '#/clientes', label: 'Clientes' }} title={c.name} sub={c.contact} actions={
        <>
          <a className="btn btn--secondary" href={`#/calendario?nuevo=1`}><Icon name="calendar" size={18} /> Programar</a>
          <a className="btn btn--primary" href={`#/cotizaciones/nueva?cliente=${c.id}`}><Icon name="quote" size={18} /> Cotizar</a>
        </>
      } />

      <div className="client-top">
        <Card className="client-card">
          <div className="client-card__id">
            <Avatar name={c.name} size={56} />
            <div>
              <p className="client-card__tags">{c.tags.map((x) => <Badge key={x} tone={x === 'VIP' ? 'orange' : x === 'Comercial' ? 'indigo' : x === 'Riego' ? 'teal' : x === 'Nuevo' ? 'blue' : 'green'}>{x}</Badge>)}</p>
              <p className="muted small">Cliente desde {fmtFull(c.since)} · prefiere {c.prefers.toLowerCase()} · {c.lang === 'ES' ? 'español' : 'inglés'}</p>
            </div>
          </div>
          <div className="quick">
            <a href={`tel:${c.phone}`}><span><Icon name="phone" /></span>Llamar</a>
            <a href={`sms:${c.phone}`}><span><Icon name="message" /></span>Texto</a>
            <a href={wa} target="_blank" rel="noopener noreferrer"><span><Icon name="send" /></span>WhatsApp</a>
            <a href={`mailto:${c.email}`}><span><Icon name="mail" /></span>Email</a>
            <a href={map} target="_blank" rel="noopener noreferrer"><span><Icon name="pin" /></span>Mapa</a>
          </div>
          <div className="group group--flat">
            <Row lead={<Icon name="phone" size={18} />} title={c.phone} chevron={false} />
            <Row lead={<Icon name="mail" size={18} />} title={c.email} chevron={false} />
            <Row lead={<Icon name="pin" size={18} />} title={`${c.address}, ${c.city}, VA ${c.zip}`} chevron={false} />
          </div>
        </Card>

        <div className="stack">
          <div className="mini-stats">
            <div><small>Saldo</small><b className={balance ? 'txt-red' : ''}>{money(balance)}</b></div>
            <div><small>Facturado</small><b>{money(billed)}</b></div>
            <div><small>Próxima visita</small><b className="cap">{nextJobs[0] ? fmtDate(nextJobs[0].date) : '—'}</b></div>
          </div>
          <Card title="Notas de la propiedad" action={notes !== c.notes ? <Button small kind="primary" onClick={() => { update((d) => { d.clients.find((x) => x.id === id)!.notes = notes }); toast('Notas guardadas') }}>Guardar</Button> : null}>
            <textarea className="notes" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} aria-label="Notas de la propiedad" placeholder="Códigos de portón, mascotas, dónde estacionar…" />
            <p className="muted small">El equipo ve estas notas en la agenda del día.</p>
          </Card>
        </div>
      </div>

      <Segmented
        label="Historial del cliente"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'visitas', label: 'Visitas', count: jobs.length },
          { value: 'cotizaciones', label: 'Cotizaciones', count: quotes.length },
          { value: 'facturas', label: 'Facturas', count: invoices.length },
          { value: 'contratos', label: 'Contratos', count: contracts.length },
        ]}
      />

      <Card flush className="mt">
        {tab === 'visitas' ? (
          jobs.length ? (
            <div className="group group--flat">
              {[...nextJobs.slice(0, 6), ...pastJobs.slice(0, 10)].map((j) => (
                <Row key={j.id} href={`#/calendario?dia=${j.date}`} lead={<span className={`dot dot--lg tone-${TYPE_TONE[j.type]}`} />} title={j.title} sub={<span className="cap">{fmtDate(j.date)} · {fmtTime(j.time)} · {j.crew}</span>} trail={<Badge>{j.status}</Badge>} />
              ))}
            </div>
          ) : <Empty icon="calendar" title="Sin visitas" />
        ) : null}
        {tab === 'cotizaciones' ? (
          quotes.length ? (
            <div className="group group--flat">
              {quotes.map((q) => <Row key={q.id} href={`#/cotizaciones/${q.id}`} title={`${q.number} · ${q.title}`} sub={`Creada ${rel(q.created)}`} trail={<><span className="strong">{money(quoteTotal(q))}</span> <Badge>{q.status}</Badge></>} />)}
            </div>
          ) : <Empty icon="quote" title="Sin cotizaciones" action={<a className="btn btn--secondary btn--sm" href={`#/cotizaciones/nueva?cliente=${c.id}`}>Crear cotización</a>} />
        ) : null}
        {tab === 'facturas' ? (
          invoices.length ? (
            <div className="group group--flat">
              {invoices.map((i) => <Row key={i.id} href={`#/facturas/${i.id}`} title={i.number} sub={`Emitida ${fmtDate(i.issued)} · vence ${fmtDate(i.due)}`} trail={<><span className="strong">{money(invoiceTotal(i))}</span> <Badge>{invoiceStatus(i)}</Badge></>} />)}
            </div>
          ) : <Empty icon="card" title="Sin facturas" />
        ) : null}
        {tab === 'contratos' ? (
          contracts.length ? (
            <div className="group group--flat">
              {contracts.map((k) => <Row key={k.id} href={`#/contratos/${k.id}`} title={k.number} sub={`Inicio ${fmtDate(k.start)}`} trail={<Badge>{k.status}</Badge>} />)}
            </div>
          ) : <Empty icon="sign" title="Sin contratos" />
        ) : null}
      </Card>
    </>
  )
}
