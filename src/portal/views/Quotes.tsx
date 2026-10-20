import { useEffect, useState } from 'react'
import { addDays, daysBetween, iso, lineFrom, lineTotal, margin, quoteTotal, subtotal, today, uid, type Line, type Package, type Quote, type QuoteStatus, type Unit, nextNumber } from '../data'
import { go, useStore } from '../store'
import { Avatar, Badge, Button, Card, Empty, Field, Header, Icon, Row, Segmented, Sheet, Stat, fmtDate, money, money0, rel } from '../ui'
import { Doc, DocLines } from './Doc'
import { AreaCalculator } from './Calculator'

/** lines handed over by the area calculator page to a new quote */
let pending: Line[] = []
export const startQuoteWith = (lines: Line[]) => {
  pending = lines
  go('/cotizaciones/nueva')
}

type Filter = 'Todas' | 'Borrador' | 'Abiertas' | 'Aprobada' | 'Rechazada'
const UNITS: Unit[] = ['visita', 'servicio', 'yd³', 'pie²', 'pie lin.', 'hora', 'c/u']

export function Quotes() {
  const { db, client } = useStore()
  const [filter, setFilter] = useState<Filter>('Todas')
  const match = (q: Quote) => filter === 'Todas' || (filter === 'Abiertas' ? q.status === 'Enviada' || q.status === 'Vista' : q.status === filter)
  const list = db.quotes.filter(match).sort((a, b) => b.created.localeCompare(a.created))

  const open = db.quotes.filter((q) => q.status === 'Enviada' || q.status === 'Vista')
  const won = db.quotes.filter((q) => q.status === 'Aprobada')
  const lost = db.quotes.filter((q) => q.status === 'Rechazada')
  const rate = won.length + lost.length ? Math.round((won.length / (won.length + lost.length)) * 100) : 0
  const decided = won.filter((q) => q.sent && q.decided)
  const avgDays = decided.length ? Math.round(decided.reduce((a, q) => a + daysBetween(q.sent!, q.decided!), 0) / decided.length) : 0

  return (
    <>
      <Header title="Cotizaciones" sub="Cree, envíe y dé seguimiento. Las aprobadas pasan a contrato con un clic." actions={<Button kind="primary" icon="plus" onClick={() => go('/cotizaciones/nueva')}>Nueva cotización</Button>} />
      <div className="stats stats--3">
        <Stat icon="send" tone="blue" label="Esperando respuesta" value={money0(open.reduce((a, q) => a + quoteTotal(q), 0))} sub={`${open.length} cotizaciones`} />
        <Stat icon="check" tone="green" label="Tasa de cierre" value={`${rate} %`} sub={`${won.length} aprobadas · ${lost.length} rechazadas`} />
        <Stat icon="clock" tone="indigo" label="Respuesta promedio" value={`${avgDays} días`} sub="De enviada a aprobada" />
      </div>
      <Segmented
        label="Filtrar cotizaciones"
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'Todas', label: 'Todas', count: db.quotes.length },
          { value: 'Borrador', label: 'Borradores', count: db.quotes.filter((q) => q.status === 'Borrador').length },
          { value: 'Abiertas', label: 'Abiertas', count: open.length },
          { value: 'Aprobada', label: 'Aprobadas', count: won.length },
          { value: 'Rechazada', label: 'Rechazadas', count: lost.length },
        ]}
      />
      <Card flush className="mt">
        {list.length ? (
          <div className="group group--flat">
            {list.map((q) => {
              const c = client(q.clientId)
              return (
                <Row
                  key={q.id}
                  href={`#/cotizaciones/${q.id}`}
                  lead={<Avatar name={c?.name ?? '?'} />}
                  title={<>{q.title}</>}
                  sub={`${q.number} · ${c?.name} · ${q.status === 'Vista' ? `vista ${rel(q.viewed!)}` : q.sent ? `enviada ${rel(q.sent)}` : `creada ${rel(q.created)}`}`}
                  trail={<><span className="strong">{money(quoteTotal(q))}</span><Badge>{q.status}</Badge></>}
                />
              )
            })}
          </div>
        ) : (
          <Empty icon="quote" title="No hay cotizaciones aquí" action={<Button small icon="plus" onClick={() => go('/cotizaciones/nueva')}>Nueva cotización</Button>} />
        )}
      </Card>
    </>
  )
}

/** Area calculator as its own page: the result starts a new quote */
export function CalculatorPage() {
  return (
    <>
      <Header title="Calculadora por área" sub="Mida las áreas, elija materiales y obtenga un aproximado con su lista de precios." />
      <AreaCalculator onAdd={startQuoteWith} addLabel="Crear cotización con esto" />
    </>
  )
}

const STEPS: { key: QuoteStatus; label: string }[] = [
  { key: 'Borrador', label: 'Creada' },
  { key: 'Enviada', label: 'Enviada' },
  { key: 'Vista', label: 'Vista' },
  { key: 'Aprobada', label: 'Aprobada' },
]

export function QuoteEditor({ id, query }: { id: string; query: URLSearchParams }) {
  const { db, update, log, toast, client } = useStore()
  const existing = db.quotes.find((q) => q.id === id)
  const isNew = id === 'nueva'
  const [q, setQ] = useState<Quote>(() =>
    existing
      ? structuredClone(existing)
      : { id: uid('q'), number: nextNumber('Q', db.quotes), clientId: query.get('cliente') ?? '', title: '', status: 'Borrador', created: iso(today()), validDays: 30, lines: [...pending], taxPct: 0, depositPct: 30, notes: '' },
  )
  useEffect(() => {
    pending = []
  }, [])
  const [calc, setCalc] = useState(false)
  const [picker, setPicker] = useState(false)
  const [preview, setPreview] = useState(false)
  const [sending, setSending] = useState(false)
  if (!existing && !isNew) return <Empty icon="quote" title="Cotización no encontrada" action={<a className="btn btn--secondary" href="#/cotizaciones">Volver</a>} />

  const c = client(q.clientId)
  const editable = q.status === 'Borrador'
  const dirty = !existing || JSON.stringify(existing) !== JSON.stringify(q)
  const total = quoteTotal(q)
  const contract = db.contracts.find((k) => k.quoteId === q.id)
  const depositBilled = db.invoices.some((i) => i.lines.some((l) => l.desc.includes(q.number)))
  const signed = contract?.status === 'Firmado'

  const set = <K extends keyof Quote>(k: K, v: Quote[K]) => setQ((x) => ({ ...x, [k]: v }))
  const addLines = (lines: Line[]) => setQ((x) => ({ ...x, lines: [...x.lines, ...lines] }))
  const addPackage = (p: Package) => {
    const lines = p.items.flatMap(({ priceId, qty }) => {
      const item = db.prices.find((x) => x.id === priceId)
      if (!item) return []
      const l = lineFrom(item, qty)
      return [p.repeat ? { ...l, desc: `${l.desc} (por visita, ${p.repeat.toLowerCase()})` } : l]
    })
    if (!lines.length) return toast('Ese paquete ya no tiene servicios en la lista de precios')
    setQ((x) => ({ ...x, title: x.title || p.name, depositPct: p.repeat && !x.lines.length ? 0 : x.depositPct, lines: [...x.lines, ...lines] }))
    toast(`Agregado: ${p.name}${lines.length < p.items.length ? ' (faltan servicios borrados de la lista)' : ''}`)
  }
  const duplicate = () => {
    if (dirty && existing && !window.confirm('Hay cambios sin guardar. La copia se hará de la versión guardada. ¿Continuar?')) return
    const nid = uid('q')
    const copy: Quote = { ...structuredClone(existing ?? q), id: nid, number: nextNumber('Q', db.quotes), status: 'Borrador', created: iso(today()), sent: undefined, viewed: undefined, decided: undefined, followUp: undefined, lines: (existing ?? q).lines.map((l) => ({ ...l, id: uid('l') })) }
    update((d) => { d.quotes.unshift(copy) })
    toast(`Copia creada: ${copy.number}`)
    go(`/cotizaciones/${nid}`)
  }
  const m = margin(q.lines)
  const saveAsPackage = () => {
    const items = q.lines.flatMap((l) => (l.priceId && db.prices.some((p) => p.id === l.priceId) ? [{ priceId: l.priceId, qty: l.qty }] : []))
    if (!items.length) return toast('Solo se guardan líneas que vienen de la lista de precios')
    const name = q.title.trim() || `Paquete ${db.packages.length + 1}`
    update((d) => { d.packages.push({ id: uid('k'), name, note: `Guardado desde ${q.number}`, items }) })
    const skipped = q.lines.length - items.length
    toast(`Paquete guardado: ${name}${skipped ? ` (${skipped} línea${skipped > 1 ? 's' : ''} personalizada${skipped > 1 ? 's' : ''} no incluida${skipped > 1 ? 's' : ''})` : ''}. Usa los precios de la lista.`)
  }
  const setLine = (lid: string, patch: Partial<Line>) => setQ((x) => ({ ...x, lines: x.lines.map((l) => (l.id === lid ? { ...l, ...patch } : l)) }))
  const save = (next: Quote = q, msg = 'Cotización guardada') => {
    if (!next.clientId) return toast('Elija un cliente primero')
    if (!next.lines.length) return toast('Agregue al menos una línea')
    const final = { ...next, title: next.title.trim() || next.lines[0].desc }
    update((d) => {
      const i = d.quotes.findIndex((x) => x.id === final.id)
      if (i >= 0) d.quotes[i] = final
      else d.quotes.unshift(final)
    })
    setQ(final)
    if (msg) toast(msg)
    if (isNew) go(`/cotizaciones/${final.id}`)
    return true
  }
  const setStatus = (status: QuoteStatus, extra: Partial<Quote> = {}) => {
    const next = { ...q, status, ...extra }
    update((d) => {
      const i = d.quotes.findIndex((x) => x.id === q.id)
      d.quotes[i] = next
    })
    setQ(next)
  }

  const send = (via: string) => {
    const next = { ...q, status: 'Enviada' as QuoteStatus, sent: iso(today()) }
    if (save(next, '')) log(`Cotización ${q.number} enviada a ${c?.name} por ${via.toLowerCase()}`, `Cotización enviada por ${via.toLowerCase()} (simulado)`)
    setSending(false)
  }
  const createContract = () => {
    const kid = uid('k')
    update((d) => {
      d.contracts.unshift({ id: kid, number: nextNumber('C', d.contracts), quoteId: q.id, clientId: q.clientId, status: 'Borrador', start: addDays(today(), 7), end: addDays(today(), 8) })
    })
    log(`Contrato creado desde ${q.number}`, 'Contrato creado')
    go(`/contratos/${kid}`)
  }
  const depositInvoice = () => {
    const fid = uid('f')
    update((d) => {
      d.invoices.unshift({ id: fid, number: nextNumber('F', d.invoices), clientId: q.clientId, issued: iso(today()), due: addDays(today(), 7), lines: [{ id: uid('l'), desc: `Depósito ${q.depositPct} % · ${q.number} ${q.title}`, qty: 1, unit: 'servicio', price: Math.round(total * q.depositPct) / 100 }], payments: [] })
    })
    log(`Factura de depósito creada para ${c?.name}`, 'Factura de depósito creada')
    go(`/facturas/${fid}`)
  }

  const stepIndex = q.status === 'Rechazada' ? -1 : STEPS.findIndex((s) => s.key === q.status)

  return (
    <>
      <Header
        back={{ href: '#/cotizaciones', label: 'Cotizaciones' }}
        title={isNew ? 'Nueva cotización' : `${q.number}`}
        sub={isNew ? 'Elija el cliente y agregue servicios de la lista de precios.' : <>{c?.name} · <Badge>{q.status}</Badge></>}
        actions={
          <>
            {!isNew ? <Button kind="plain" icon="repeat" onClick={duplicate}>Duplicar</Button> : null}
            <Button icon="eye" onClick={() => setPreview(true)} disabled={!q.lines.length}>Vista del cliente</Button>
            {editable ? <Button kind="primary" icon="check" onClick={() => save()} disabled={!dirty}>Guardar</Button> : null}
          </>
        }
      />

      <div className="editor">
        <div className="stack">
          <Card title="Datos">
            <div className="form">
              <div className="form__row">
                <Field label="Cliente">
                  <select value={q.clientId} onChange={(e) => set('clientId', e.target.value)} disabled={!editable} required>
                    <option value="">Elegir cliente…</option>
                    {db.clients.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
                  </select>
                </Field>
                <Field label="Válida por (días)"><input type="number" min={1} value={q.validDays} onChange={(e) => set('validDays', Number(e.target.value))} disabled={!editable} /></Field>
              </div>
              <Field label="Título del trabajo"><input value={q.title} onChange={(e) => set('title', e.target.value)} placeholder="Ej. Jardineras de piedra de río" disabled={!editable} /></Field>
            </div>
          </Card>

          {editable ? (
            <Card title="Paquetes rápidos" action={<span className="muted small">Un toque y se agregan</span>}>
              <div className="packs">
                {db.packages.map((p) => (
                  <button key={p.id} type="button" className="pack" onClick={() => addPackage(p)} title={p.note}>
                    <Icon name={p.repeat ? 'repeat' : 'plus'} size={15} />
                    {p.name}
                    <span className="visually-hidden">: {p.note}</span>
                  </button>
                ))}
              </div>
            </Card>
          ) : null}

          <Card title="Servicios y materiales" action={editable ? <div className="row-actions"><Button small icon="ruler" onClick={() => setCalc(true)}>Calcular por área</Button><Button small icon="list" onClick={() => setPicker(true)}>De la lista de precios</Button><Button small kind="plain" icon="plus" onClick={() => set('lines', [...q.lines, { id: uid('l'), desc: '', qty: 1, unit: 'servicio', price: 0 }])}>Línea</Button>{q.lines.length ? <Button small kind="plain" icon="box" onClick={saveAsPackage}>Guardar como paquete</Button> : null}</div> : null}>
            {q.lines.length ? (
              <div className="lines">
                <div className="lines__head" aria-hidden="true"><span>Descripción</span><span>Cant.</span><span>Unidad</span><span>Precio</span><span>Total</span><span /></div>
                {q.lines.map((l, n) => (
                  <div key={l.id} className="lines__row">
                    <input aria-label={`Descripción, línea ${n + 1}`} value={l.desc} onChange={(e) => setLine(l.id, { desc: e.target.value })} disabled={!editable} />
                    <input aria-label={`Cantidad, línea ${n + 1}`} type="number" min={0} step="any" value={l.qty} onChange={(e) => setLine(l.id, { qty: Number(e.target.value) })} disabled={!editable} />
                    <select aria-label={`Unidad, línea ${n + 1}`} value={l.unit} onChange={(e) => setLine(l.id, { unit: e.target.value as Unit })} disabled={!editable}>
                      {UNITS.map((u) => <option key={u}>{u}</option>)}
                    </select>
                    <input aria-label={`Precio, línea ${n + 1}`} type="number" min={0} step="any" value={l.price} onChange={(e) => setLine(l.id, { price: Number(e.target.value) })} disabled={!editable} />
                    <span className="lines__total">{money(lineTotal(l))}</span>
                    {editable ? <button type="button" className="icon-btn" aria-label="Quitar línea" onClick={() => set('lines', q.lines.filter((x) => x.id !== l.id))}><Icon name="trash" size={16} /></button> : <span />}
                  </div>
                ))}
              </div>
            ) : (
              <Empty icon="list" title="Sin líneas todavía" text="Agregue servicios de la lista de precios para cotizar en segundos." action={<Button small icon="list" onClick={() => setPicker(true)}>Abrir lista de precios</Button>} />
            )}
          </Card>

          <Card title="Condiciones">
            <div className="form">
              <div className="form__row">
                <Field label="Impuesto (%)" hint="Confirme con su contador qué servicios llevan impuesto."><input type="number" min={0} step="0.1" value={q.taxPct} onChange={(e) => set('taxPct', Number(e.target.value))} disabled={!editable} /></Field>
                <Field label="Depósito para agendar (%)"><input type="number" min={0} max={100} value={q.depositPct} onChange={(e) => set('depositPct', Number(e.target.value))} disabled={!editable} /></Field>
              </div>
              <Field label="Notas para el cliente"><textarea rows={3} value={q.notes} onChange={(e) => set('notes', e.target.value)} disabled={!editable} placeholder="Qué incluye, qué no incluye, tiempos…" /></Field>
            </div>
          </Card>
        </div>

        <div className="stack editor__side">
          <Card className="totals">
            <dl>
              <div><dt>Subtotal</dt><dd>{money(subtotal(q.lines))}</dd></div>
              {q.taxPct ? <div><dt>Impuesto</dt><dd>{money(subtotal(q.lines) * q.taxPct / 100)}</dd></div> : null}
              <div className="is-total"><dt>Total</dt><dd>{money(total)}</dd></div>
              {q.depositPct ? <div><dt>Depósito ({q.depositPct} %)</dt><dd>{money(total * q.depositPct / 100)}</dd></div> : null}
            </dl>
            {m ? (
              <div className={`margin margin--${m.pct >= 40 ? 'good' : m.pct >= 25 ? 'ok' : 'low'}`}>
                <span><Icon name="trend" size={16} /> Margen estimado</span>
                <b>{m.pct} % · {money(m.profit)}</b>
                <small>Solo lo ve usted{m.partial ? ' · hay líneas sin costo conocido' : ''}. {m.pct < 25 ? 'Revise el precio: el margen es bajo.' : ''}</small>
              </div>
            ) : null}
          </Card>

          {!isNew ? (
            <Card title="Estado">
              {q.status === 'Rechazada' ? (
                <p className="txt-red strong"><Icon name="x" size={16} /> Rechazada {q.decided ? rel(q.decided) : ''}</p>
              ) : (
                <ol className="timeline">
                  {STEPS.map((s, i) => {
                    const date = s.key === 'Borrador' ? q.created : s.key === 'Enviada' ? q.sent : s.key === 'Vista' ? q.viewed : q.decided
                    return (
                      <li key={s.key} className={i <= stepIndex ? 'is-done' : ''}>
                        <span className="timeline__dot">{i <= stepIndex ? <Icon name="check" size={12} /> : null}</span>
                        <span>{s.label}</span>
                        <small className="cap">{date && i <= stepIndex ? fmtDate(date) : ''}</small>
                      </li>
                    )
                  })}
                </ol>
              )}
              {q.sent && (q.status === 'Enviada' || q.status === 'Vista') ? <p className="muted small">Vence {rel(addDays(q.sent, q.validDays))}{q.followUp ? ` · último recordatorio ${rel(q.followUp)}` : ''}</p> : null}
              <div className="side-actions">
                {q.status === 'Borrador' ? <Button kind="primary" icon="send" className="btn--block" onClick={() => setSending(true)}>Enviar al cliente</Button> : null}
                {q.status === 'Enviada' || q.status === 'Vista' ? (
                  <>
                    <Button kind="primary" icon="check" className="btn--block" onClick={() => { setStatus('Aprobada', { decided: iso(today()) }); log(`${q.number} aprobada por ${c?.name}`, 'Cotización aprobada') }}>Marcar aprobada</Button>
                    <Button icon="bell" className="btn--block" onClick={() => { setStatus(q.status, { followUp: iso(today()) }); log(`Recordatorio de ${q.number} enviado a ${c?.name}`, 'Recordatorio enviado (simulado)') }}>Enviar recordatorio</Button>
                    {q.status === 'Enviada' ? <Button kind="plain" icon="eye" className="btn--block" onClick={() => { setStatus('Vista', { viewed: iso(today()) }); toast('Simulado: el cliente abrió la cotización') }}>Simular: el cliente la abre</Button> : null}
                    <Button kind="plain" icon="x" className="btn--block txt-red" onClick={() => { setStatus('Rechazada', { decided: iso(today()) }); toast('Cotización marcada como rechazada') }}>Marcar rechazada</Button>
                  </>
                ) : null}
                {q.status === 'Aprobada' ? (
                  <>
                    {contract ? <a className="btn btn--primary btn--block" href={`#/contratos/${contract.id}`}><Icon name="sign" size={18} /> Ver contrato {contract.number}</a> : <Button kind="primary" icon="sign" className="btn--block" onClick={createContract}>Crear contrato</Button>}
                    {q.depositPct && !depositBilled ? (
                      signed ? <Button icon="card" className="btn--block" onClick={depositInvoice}>Cobrar depósito ({money(total * q.depositPct / 100)})</Button>
                        : <p className="muted small">El depósito se cobra después de que el cliente firme el contrato.</p>
                    ) : null}
                    <a className="btn btn--secondary btn--block" href={`#/calendario?nuevo=1&cliente=${q.clientId}&titulo=${encodeURIComponent(q.title)}`}><Icon name="calendar" size={18} /> Programar trabajo</a>
                  </>
                ) : null}
                {/* once a contract exists the quote is locked: the contract shows these lines and prices */}
                {q.status !== 'Borrador' && !contract && !depositBilled ? <Button kind="plain" icon="edit" className="btn--block" onClick={() => setStatus('Borrador')}>Volver a borrador para editar</Button> : null}
              </div>
            </Card>
          ) : null}
        </div>
      </div>

      {calc ? (
        <Sheet open onClose={() => setCalc(false)} title="Calculadora por área" wide>
          <AreaCalculator onAdd={(lines) => { addLines(lines); setCalc(false); toast(`${lines.length} líneas agregadas desde la calculadora`) }} />
        </Sheet>
      ) : null}
      {picker ? <PricePicker onClose={() => setPicker(false)} onPick={(l) => setQ((x) => ({ ...x, lines: [...x.lines, l] }))} /> : null}

      <Sheet open={preview} onClose={() => setPreview(false)} title="Vista del cliente" wide>
        <Doc kind="Cotización" number={q.number} date={q.sent ?? q.created} client={c}>
          <h3 className="doc__title">{q.title || 'Cotización'}</h3>
          <DocLines lines={q.lines} taxPct={q.taxPct} depositPct={q.depositPct} />
          {q.notes ? <p className="doc__notes">{q.notes}</p> : null}
          <p className="doc__small">Cotización válida por {q.validDays} días. Precios en dólares (USD).</p>
          <div className="doc__cta">
            <p className="doc__small">Vista previa: así verá el cliente los botones en su celular.</p>
            <span className="btn btn--primary">Aprobar cotización</span>
            <span className="btn btn--secondary">Tengo una pregunta</span>
          </div>
        </Doc>
      </Sheet>

      <Sheet open={sending} onClose={() => setSending(false)} title={`Enviar ${q.number}`}>
        {c ? (
          <>
            <p>El cliente recibe un link para ver la cotización y aprobarla desde su celular. Prefiere <b>{c.prefers.toLowerCase()}</b>.</p>
            <div className="msg-preview">
              <small>Mensaje</small>
              Hola {c.name.split(' ')[0]}, gracias por su interés en Nino’s Landscaping. Aquí está su cotización {q.number} por {money(total)}: <span className="link-ph">[link para ver y aprobar]</span>
            </div>
            <div className="send-grid">
              {(['Texto', 'WhatsApp', 'Email'] as const).map((via) => (
                <Button key={via} kind={via === c.prefers || (via === 'Texto' && c.prefers === 'Llamada') ? 'primary' : 'secondary'} icon={via === 'Email' ? 'mail' : via === 'WhatsApp' ? 'send' : 'message'} onClick={() => send(via)}>{via}</Button>
              ))}
            </div>
            <p className="muted small">Simulado: no se envía ningún mensaje real.</p>
          </>
        ) : <p>Elija un cliente primero.</p>}
      </Sheet>
    </>
  )
}

function PricePicker({ onClose, onPick }: { onClose: () => void; onPick: (l: Line) => void }) {
  const { db, toast } = useStore()
  const [q, setQ] = useState('')
  const items = db.prices.filter((p) => !q || `${p.name} ${p.group}`.toLowerCase().includes(q.toLowerCase()))
  const groups = [...new Set(items.map((p) => p.group))]
  return (
    <Sheet open onClose={onClose} title="Lista de precios">
      <label className="search">
        <Icon name="search" size={18} />
        <input type="search" placeholder="Buscar servicio o material" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar en la lista de precios" autoFocus />
      </label>
      {groups.map((g) => (
        <div key={g}>
          <p className="group__label">{g}</p>
          <div className="group">
            {items.filter((p) => p.group === g).map((p) => (
              <Row key={p.id} onClick={() => { onPick(lineFrom(p)); toast(`Agregado: ${p.name}`) }} title={p.name} trail={<span className="muted">{money(p.price)} / {p.unit}</span>} chevron={false} lead={<span className="tile-icon tile-icon--sm"><Icon name="plus" size={14} /></span>} />
            ))}
          </div>
        </div>
      ))}
      {!items.length ? <Empty icon="search" title="Sin resultados" /> : null}
    </Sheet>
  )
}
