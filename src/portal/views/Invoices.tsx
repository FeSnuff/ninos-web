import { useEffect, useRef, useState, type FormEvent } from 'react'
import { addDays, invoiceBalance, invoicePaid, invoiceStatus, invoiceTotal, iso, today, uid, type Invoice, type InvoiceStatus, type PayMethod, nextNumber } from '../data'
import { go, useStore } from '../store'
import { Avatar, Badge, Button, Card, Empty, Field, Header, Icon, Row, Segmented, Sheet, Stat, fmtDate, money, money0, rel } from '../ui'
import { Doc, DocLines } from './Doc'

type Filter = 'Todas' | InvoiceStatus

export function Invoices({ query }: { query: URLSearchParams }) {
  const { db, update, log, client } = useStore()
  const [filter, setFilter] = useState<Filter>('Todas')
  const [batch, setBatch] = useState(false)
  const t = iso(today())

  const list = db.invoices.filter((i) => filter === 'Todas' || invoiceStatus(i) === filter).sort((a, b) => b.issued.localeCompare(a.issued))
  const balanceOf = (s: InvoiceStatus[]) => db.invoices.filter((i) => s.includes(invoiceStatus(i))).reduce((a, i) => a + invoiceBalance(i), 0)
  const last30 = db.invoices.flatMap((i) => i.payments).filter((p) => p.date >= addDays(t, -30)).reduce((a, p) => a + p.amount, 0)
  const count = (s: InvoiceStatus) => db.invoices.filter((i) => invoiceStatus(i) === s).length

  /* batch: finished recurring visits not billed yet, grouped by client */
  const unbilled = db.jobs.filter((j) => j.repeat && j.status === 'Completado' && !j.invoiceId && j.clientId && j.amount)
  const byClient = [...new Set(unbilled.map((j) => j.clientId!))].map((cid) => ({ cid, jobs: unbilled.filter((j) => j.clientId === cid) }))
  const runBatch = () => {
    const ids = byClient.map(() => uid('f'))
    // one line per visit, each at its own price
    const lines = byClient.map(({ jobs }) =>
      jobs.map((j) => ({ id: uid('l'), desc: `${j.title} · ${fmtDate(j.date, { day: 'numeric', month: 'short' })}`, qty: 1, unit: 'visita' as const, price: j.amount! })),
    )
    update((d) => {
      byClient.forEach(({ cid, jobs }, n) => {
        d.invoices.unshift({
          id: ids[n], number: nextNumber('F', d.invoices), clientId: cid, issued: t, due: addDays(t, 15),
          lines: lines[n],
          payments: [], linkSent: t,
        })
        for (const j of d.jobs) if (jobs.some((x) => x.id === j.id)) j.invoiceId = ids[n]
      })
    })
    log(`Facturación en lote: ${byClient.length} facturas creadas y enviadas con link de pago`, `${byClient.length} facturas creadas y enviadas con link de pago (simulado)`)
    setBatch(false)
  }

  return (
    <>
      <Header
        title="Facturas y pagos"
        sub="Cobre con link de pago, registre efectivo o cheque y vea quién debe."
        actions={
          <>
            <Button icon="repeat" onClick={() => setBatch(true)} disabled={!byClient.length}>Facturar visitas ({byClient.length})</Button>
            <Button kind="primary" icon="plus" onClick={() => go('/facturas?nueva=1')}>Nueva factura</Button>
          </>
        }
      />
      <div className="stats stats--3">
        <Stat icon="dollar" tone="blue" label="Por cobrar" value={money0(balanceOf(['Pendiente', 'Parcial', 'Vencida']))} sub={`${count('Pendiente') + count('Parcial') + count('Vencida')} facturas abiertas`} />
        <Stat icon="alert" tone="red" label="Vencido" value={money0(balanceOf(['Vencida']))} sub={`${count('Vencida')} facturas`} />
        <Stat icon="trend" tone="green" label="Cobrado (30 días)" value={money0(last30)} />
      </div>
      <Segmented
        label="Filtrar facturas"
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'Todas', label: 'Todas', count: db.invoices.length },
          { value: 'Vencida', label: 'Vencidas', count: count('Vencida') },
          { value: 'Pendiente', label: 'Pendientes', count: count('Pendiente') },
          { value: 'Parcial', label: 'Parciales', count: count('Parcial') },
          { value: 'Pagada', label: 'Pagadas', count: count('Pagada') },
        ]}
      />
      <Card flush className="mt">
        {list.length ? (
          <div className="group group--flat">
            {list.map((i) => {
              const c = client(i.clientId)
              const st = invoiceStatus(i)
              return (
                <Row
                  key={i.id}
                  href={`#/facturas/${i.id}`}
                  lead={<Avatar name={c?.name ?? '?'} />}
                  title={c?.name}
                  sub={`${i.number} · ${st === 'Pagada' ? `pagada ${rel(i.payments[i.payments.length - 1]?.date ?? i.issued)}` : `vence ${rel(i.due)}`}`}
                  trail={<><span className={st === 'Vencida' ? 'strong txt-red' : 'strong'}>{money(st === 'Pagada' ? invoiceTotal(i) : invoiceBalance(i))}</span><Badge>{st}</Badge></>}
                />
              )
            })}
          </div>
        ) : (
          <Empty icon="card" title="No hay facturas aquí" />
        )}
      </Card>

      <Sheet open={batch} onClose={() => setBatch(false)} title="Facturar visitas recurrentes" footer={<><Button kind="plain" onClick={() => setBatch(false)}>Cancelar</Button><Button kind="primary" icon="send" onClick={runBatch}>Crear y enviar {byClient.length} facturas</Button></>}>
        <p>Una factura por cliente con todas sus visitas terminadas que aún no se cobraron. Cada cliente recibe su link de pago.</p>
        <div className="group">
          {byClient.map(({ cid, jobs }) => (
            <Row key={cid} lead={<Avatar name={client(cid)?.name ?? '?'} size={32} />} title={client(cid)?.name} sub={`${jobs.length} visitas`} trail={<b>{money(jobs.reduce((a, j) => a + (j.amount ?? 0), 0))}</b>} />
          ))}
        </div>
      </Sheet>

      {query.get('nueva') === '1' ? <NewInvoice onClose={() => go('/facturas')} /> : null}
    </>
  )
}

function NewInvoice({ onClose }: { onClose: () => void }) {
  const { db, update, log, client } = useStore()
  const [f, setF] = useState({ clientId: '', desc: '', amount: '', days: 15 })
  const submit = (e: FormEvent) => {
    e.preventDefault()
    const id = uid('f')
    update((d) => {
      d.invoices.unshift({ id, number: nextNumber('F', d.invoices), clientId: f.clientId, issued: iso(today()), due: addDays(today(), f.days), lines: [{ id: uid('l'), desc: f.desc, qty: 1, unit: 'servicio', price: Number(f.amount) }], payments: [] })
    })
    log(`Factura creada para ${client(f.clientId)?.name}`, 'Factura creada')
    go(`/facturas/${id}`)
  }
  return (
    <Sheet open onClose={onClose} title="Nueva factura" footer={<><Button kind="plain" onClick={onClose}>Cancelar</Button><Button kind="primary" type="submit" form="new-invoice">Crear</Button></>}>
      <form id="new-invoice" className="form" onSubmit={submit}>
        <Field label="Cliente">
          <select required value={f.clientId} onChange={(e) => setF({ ...f, clientId: e.target.value })}>
            <option value="">Elegir cliente…</option>
            {db.clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Descripción"><input required value={f.desc} onChange={(e) => setF({ ...f, desc: e.target.value })} placeholder="Ej. Limpieza de otoño" /></Field>
        <div className="form__row">
          <Field label="Monto ($)"><input required type="number" min={1} step="0.01" inputMode="decimal" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} /></Field>
          <Field label="Vence en (días)"><input type="number" min={0} value={f.days} onChange={(e) => setF({ ...f, days: Number(e.target.value) })} /></Field>
        </div>
      </form>
    </Sheet>
  )
}

const METHODS: PayMethod[] = ['Efectivo', 'Cheque', 'Zelle', 'Tarjeta', 'ACH']

export function InvoiceDetail({ id }: { id: string }) {
  const { db, update, log, client } = useStore()
  const inv = db.invoices.find((x) => x.id === id)
  const [paying, setPaying] = useState(false)
  const [recording, setRecording] = useState(false)
  const [linkOpen, setLinkOpen] = useState(false)
  if (!inv) return <Empty icon="card" title="Factura no encontrada" action={<a className="btn btn--secondary" href="#/facturas">Volver</a>} />
  const c = client(inv.clientId)
  const st = invoiceStatus(inv)
  const bal = invoiceBalance(inv)

  const pay = (amount: number, method: PayMethod) => {
    update((d) => { d.invoices.find((x) => x.id === id)!.payments.push({ date: iso(today()), amount, method }) })
    log(`Pago de ${money(amount)} (${method.toLowerCase()}) en ${inv.number} · ${c?.name}`, `Pago de ${money(amount)} registrado (simulado)`)
  }
  const patch = (p: Partial<Invoice>) => update((d) => { Object.assign(d.invoices.find((x) => x.id === id)!, p) })

  return (
    <>
      <Header
        back={{ href: '#/facturas', label: 'Facturas' }}
        title={inv.number}
        sub={<>{c?.name} · <Badge>{st}</Badge></>}
        actions={<Button icon="printer" onClick={() => window.print()}>Imprimir / PDF</Button>}
      />
      <div className="editor">
        <Doc kind="Factura" number={inv.number} date={inv.issued} client={c}>
          <p className="doc__small">Vence el {fmtDate(inv.due, { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <DocLines lines={inv.lines} paid={invoicePaid(inv)} />
          {inv.payments.length ? (
            <>
              <h4>Pagos recibidos</h4>
              <ul className="doc__payments">
                {inv.payments.map((p, n) => <li key={n}><span className="cap">{fmtDate(p.date)}</span> · {p.method} <b>{money(p.amount)}</b></li>)}
              </ul>
            </>
          ) : null}
          <p className="doc__small">Gracias por confiar en Nino’s Landscaping.</p>
        </Doc>

        <div className="stack editor__side">
          <Card className="totals">
            <dl>
              <div><dt>Total</dt><dd>{money(invoiceTotal(inv))}</dd></div>
              <div><dt>Pagado</dt><dd>{money(invoicePaid(inv))}</dd></div>
              <div className="is-total"><dt>Saldo</dt><dd className={st === 'Vencida' ? 'txt-red' : ''}>{money(bal)}</dd></div>
            </dl>
            {st === 'Vencida' ? <p className="txt-red small strong">Venció {rel(inv.due)}{inv.sentReminder ? ` · recordatorio ${rel(inv.sentReminder)}` : ''}</p> : null}
          </Card>
          {bal > 0 ? (
            <Card title="Cobrar">
              <div className="side-actions">
                <Button kind="primary" icon="link" className="btn--block" onClick={() => setLinkOpen(true)}>{inv.linkSent ? 'Reenviar link de pago' : 'Enviar link de pago'}</Button>
                <Button icon="dollar" className="btn--block" onClick={() => setRecording(true)}>Registrar pago</Button>
                <Button kind="plain" icon="eye" className="btn--block" onClick={() => setPaying(true)}>Ver página de pago del cliente</Button>
                {st === 'Vencida' ? <Button kind="plain" icon="bell" className="btn--block" onClick={() => { patch({ sentReminder: iso(today()) }); log(`Recordatorio de pago ${inv.number} enviado a ${c?.name}`, 'Recordatorio enviado (simulado)') }}>Enviar recordatorio</Button> : null}
              </div>
              {inv.linkSent ? <p className="muted small">Link enviado {rel(inv.linkSent)}.</p> : null}
            </Card>
          ) : (
            <Card>
              <p className="ok-line"><Icon name="check" size={16} /> Pagada por completo</p>
              <Button kind="plain" icon="message" className="btn--block" onClick={() => log(`Pedido de reseña enviado a ${c?.name}`, 'Pedido de reseña en Google enviado (simulado)')}>Pedir reseña en Google</Button>
            </Card>
          )}
        </div>
      </div>

      <Sheet open={linkOpen} onClose={() => setLinkOpen(false)} title="Link de pago">
        <p>{c?.name} recibe un link para pagar <b>{money(bal)}</b> con tarjeta o transferencia desde el celular.</p>
        <div className="msg-preview">
          <small>Mensaje por {c?.prefers.toLowerCase()}</small>
          Hola {c?.name.split(' ')[0]}, su factura {inv.number} de Nino’s Landscaping es de {money(bal)}. Puede pagar aquí: <span className="link-ph">[link de pago seguro]</span>
        </div>
        <dl className="fees">
          <div><dt>Tarjeta (ejemplo 2.9 % + $0.30)</dt><dd>usted recibe ~{money(bal - (bal * 0.029 + 0.3))}</dd></div>
          <div><dt>Transferencia ACH (ejemplo 0.8 %, máx. $5)</dt><dd>usted recibe ~{money(bal - Math.min(5, bal * 0.008))}</dd></div>
        </dl>
        <p className="muted small">Comisiones de ejemplo; dependen del procesador (Stripe, Square…). Simulado: no se envía nada.</p>
        <div className="sheet__foot sheet__foot--inline">
          <Button kind="plain" onClick={() => setLinkOpen(false)}>Cancelar</Button>
          <Button kind="primary" icon="send" onClick={() => { patch({ linkSent: iso(today()) }); log(`Link de pago de ${inv.number} enviado a ${c?.name}`, 'Link de pago enviado (simulado)'); setLinkOpen(false) }}>Enviar</Button>
        </div>
      </Sheet>

      {recording ? <RecordPayment balance={bal} onClose={() => setRecording(false)} onSave={(a, m) => { pay(a, m); setRecording(false) }} /> : null}
      {paying ? <Checkout amount={bal} number={inv.number} onClose={() => setPaying(false)} onPaid={(m) => pay(bal, m)} /> : null}
    </>
  )
}

function RecordPayment({ balance, onClose, onSave }: { balance: number; onClose: () => void; onSave: (amount: number, method: PayMethod) => void }) {
  const [amount, setAmount] = useState(String(balance.toFixed(2)))
  const [method, setMethod] = useState<PayMethod>('Efectivo')
  return (
    <Sheet open onClose={onClose} title="Registrar pago" footer={<><Button kind="plain" onClick={onClose}>Cancelar</Button><Button kind="primary" type="submit" form="pay-form">Guardar pago</Button></>}>
      <form id="pay-form" className="form" onSubmit={(e) => { e.preventDefault(); const a = Number(amount); if (a > 0) onSave(Math.min(a, balance), method) }}>
        <Field label="Monto ($)"><input type="number" min={0.01} max={balance} step="0.01" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} required /></Field>
        <div>
          <span className="field__label">Forma de pago</span>
          <div className="chips-pick">
            {METHODS.map((m) => <button key={m} type="button" className={m === method ? 'chip-btn is-on' : 'chip-btn'} onClick={() => setMethod(m)} aria-pressed={m === method}>{m}</button>)}
          </div>
        </div>
      </form>
    </Sheet>
  )
}

/** What the client would see after tapping the payment link. Visual only: nothing is charged. */
function Checkout({ amount: due, number, onClose, onPaid }: { amount: number; number: string; onClose: () => void; onPaid: (m: PayMethod) => void }) {
  // keep the amount shown when the page opened (the balance drops to 0 once paid)
  const [amount] = useState(due)
  const [tab, setTab] = useState<'Tarjeta' | 'ACH'>('Tarjeta')
  const [step, setStep] = useState<'form' | 'processing' | 'done'>('form')
  const timer = useRef<number>(0)
  // closing the sheet while "processing" cancels the simulated payment
  useEffect(() => () => clearTimeout(timer.current), [])
  const go2 = (m: PayMethod) => {
    setStep('processing')
    timer.current = window.setTimeout(() => { setStep('done'); onPaid(m) }, 1400)
  }
  return (
    <Sheet open onClose={onClose} title="Página de pago (vista del cliente)">
      <div className="checkout">
        {step === 'done' ? (
          <div className="checkout__done">
            <span className="big-check"><Icon name="check" size={34} /></span>
            <p className="strong">Pago recibido (simulado)</p>
            <p className="muted">{money(amount)} · {number}. En la versión real el cliente recibe el recibo por email.</p>
            <Button kind="primary" onClick={onClose}>Cerrar</Button>
          </div>
        ) : (
          <>
            <div className="checkout__amount">
              <small>Nino’s Landscaping · {number}</small>
              <b>{money(amount)}</b>
            </div>
            <button type="button" className="paybtn" onClick={() => go2('Tarjeta')} disabled={step !== 'form'}>
              Apple Pay · Google Pay
            </button>
            <p className="checkout__or"><span>o pague con</span></p>
            <Segmented label="Forma de pago" value={tab} onChange={setTab} options={[{ value: 'Tarjeta', label: 'Tarjeta' }, { value: 'ACH', label: 'Cuenta bancaria' }]} />
            <div className="checkout__fields" aria-label="Campos de demostración, no editables">
              {tab === 'Tarjeta' ? (
                <>
                  <div className="fake-input">•••• •••• •••• 4242<span>VISA</span></div>
                  <div className="form__row">
                    <div className="fake-input">12 / 28</div>
                    <div className="fake-input">•••</div>
                  </div>
                </>
              ) : (
                <div className="fake-input"><Icon name="lock" size={16} /> Conectar banco de forma segura</div>
              )}
            </div>
            <Button kind="primary" className="btn--block" onClick={() => go2(tab)} disabled={step !== 'form'}>
              {step === 'processing' ? <span className="spinner" aria-label="Procesando" /> : `Pagar ${money(amount)}`}
            </Button>
            <p className="muted small center"><Icon name="lock" size={13} /> Demostración: no se cobra nada y no se piden datos reales.</p>
          </>
        )}
      </div>
    </Sheet>
  )
}
