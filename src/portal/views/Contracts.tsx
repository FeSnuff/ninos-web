import { useRef, useState, type PointerEvent } from 'react'
import { business } from '../../site.config'
import { iso, quoteTotal, today, type Contract, type ContractStatus } from '../data'
import { useStore } from '../store'
import { Avatar, Badge, Button, Card, Empty, Field, Header, Icon, Row, Segmented, Sheet, fmtDate, fmtFull, money, rel } from '../ui'
import { Doc, DocLines } from './Doc'

export function Contracts() {
  const { db, client } = useStore()
  const [filter, setFilter] = useState<'Todos' | ContractStatus>('Todos')
  const list = db.contracts.filter((k) => filter === 'Todos' || k.status === filter)
  const count = (s: ContractStatus) => db.contracts.filter((k) => k.status === s).length
  return (
    <>
      <Header title="Contratos" sub="Se crean desde una cotización aprobada, con los datos que pide Virginia para trabajos residenciales." />
      <Segmented label="Filtrar contratos" value={filter} onChange={setFilter} options={[{ value: 'Todos', label: 'Todos', count: db.contracts.length }, { value: 'Borrador', label: 'Borradores', count: count('Borrador') }, { value: 'Enviado', label: 'Por firmar', count: count('Enviado') }, { value: 'Firmado', label: 'Firmados', count: count('Firmado') }]} />
      <Card flush className="mt">
        {list.length ? (
          <div className="group group--flat">
            {list.map((k) => {
              const q = db.quotes.find((x) => x.id === k.quoteId)
              const c = client(k.clientId)
              return (
                <Row key={k.id} href={`#/contratos/${k.id}`} lead={<Avatar name={c?.name ?? '?'} />} title={q?.title ?? k.number} sub={`${k.number} · ${c?.name} · inicio ${fmtDate(k.start)}${k.status === 'Enviado' && k.sent ? ` · enviado ${rel(k.sent)}` : ''}`} trail={<><span className="strong">{q ? money(quoteTotal(q)) : ''}</span><Badge>{k.status}</Badge></>} />
              )
            })}
          </div>
        ) : (
          <Empty icon="sign" title="Sin contratos" text="Apruebe una cotización y cree el contrato desde ahí." action={<a className="btn btn--secondary btn--sm" href="#/cotizaciones">Ir a cotizaciones</a>} />
        )}
      </Card>
    </>
  )
}

/** Signature pad: strokes are kept as SVG path data (the page's security policy blocks data: images). */
function SignaturePad({ onDone, onCancel }: { onDone: (sig: { path?: string; name?: string }) => void; onCancel: () => void }) {
  const ref = useRef<SVGSVGElement>(null)
  const [paths, setPaths] = useState<string[]>([])
  const [name, setName] = useState('')
  const drawing = useRef(false)
  const point = (e: PointerEvent) => {
    const r = ref.current!.getBoundingClientRect()
    return `${Math.round(((e.clientX - r.left) / r.width) * 600)} ${Math.round(((e.clientY - r.top) / r.height) * 200)}`
  }
  return (
    <>
      <svg
        ref={ref}
        className="sigpad"
        viewBox="0 0 600 200"
        role="img"
        aria-label="Área de firma: dibuje con el dedo o el mouse"
        onPointerDown={(e) => { drawing.current = true; (e.target as Element).setPointerCapture?.(e.pointerId); setPaths((p) => [...p, `M${point(e)}`]) }}
        onPointerMove={(e) => { if (drawing.current) setPaths((p) => [...p.slice(0, -1), `${p[p.length - 1]} L${point(e)}`]) }}
        onPointerUp={() => { drawing.current = false }}
      >
        <line x1="30" y1="160" x2="570" y2="160" className="sigpad__line" />
        {paths.map((d, i) => <path key={i} d={d} />)}
      </svg>
      {/* keyboard alternative to drawing */}
      <Field label="O escriba su nombre completo">
        <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" />
      </Field>
      <div className="sheet__foot sheet__foot--inline">
        <Button kind="plain" onClick={() => setPaths([])} disabled={!paths.length}>Borrar</Button>
        <Button kind="plain" onClick={onCancel}>Cancelar</Button>
        <Button kind="primary" icon="check" onClick={() => onDone(paths.length ? { path: paths.join(' ') } : { name: name.trim() })} disabled={!paths.length && !name.trim()}>Firmar</Button>
      </div>
    </>
  )
}

export function ContractDetail({ id }: { id: string }) {
  const { db, update, log, client } = useStore()
  const k = db.contracts.find((x) => x.id === id)
  const [sending, setSending] = useState(false)
  const [signing, setSigning] = useState(false)
  if (!k) return <Empty icon="sign" title="Contrato no encontrado" action={<a className="btn btn--secondary" href="#/contratos">Volver</a>} />
  const q = db.quotes.find((x) => x.id === k.quoteId)
  const c = client(k.clientId)
  if (!q || !c) return <Empty icon="sign" title="Falta la cotización o el cliente de este contrato" />

  const total = quoteTotal(q)
  const deposit = (total * q.depositPct) / 100
  const lic = business.license
  const patch = (p: Partial<Contract>) => update((d) => { Object.assign(d.contracts.find((x) => x.id === id)!, p) })

  const checks: [boolean, string, string?][] = [
    [Boolean(business.name && business.phoneDisplay), 'Nombre y contacto del contratista'],
    [Boolean(lic.dporNumber), 'Número de licencia DPOR', 'Agregue el número en site.config.ts (business.license).'],
    [Boolean(lic.dporClass), 'Clase de licencia y especialidades', 'Ej. Clase C · LSC, ISC.'],
    [Boolean(k.start && k.end), 'Fecha de inicio y fecha estimada de terminación'],
    [q.lines.length > 0, 'Descripción del trabajo y materiales'],
    [total > 0, 'Precio total y plan de pagos'],
    [true, 'Aviso del Fondo de Recuperación (Virginia Contractor Transaction Recovery Fund)'],
    [true, 'Cambios por escrito firmados por ambas partes'],
    [k.status === 'Firmado', 'Firma del cliente y del contratista antes de empezar'],
  ]
  const missing = checks.filter(([ok]) => !ok).length

  const send = (via: string) => {
    patch({ status: 'Enviado', sent: iso(today()) })
    log(`Contrato ${k.number} enviado a ${c.name} por ${via.toLowerCase()} para firma`, `Contrato enviado para firma por ${via.toLowerCase()} (simulado)`)
    setSending(false)
  }

  return (
    <>
      <Header
        back={{ href: '#/contratos', label: 'Contratos' }}
        title={k.number}
        sub={<>{c.name} · <Badge>{k.status}</Badge></>}
        actions={<Button icon="printer" onClick={() => window.print()}>Imprimir / PDF</Button>}
      />
      <div className="editor">
        <Doc kind="Contrato de servicios" number={k.number} date={k.sent ?? iso(today())} client={c}>
          <h3 className="doc__title">{q.title}</h3>
          <p className="doc__small">Basado en la cotización {q.number}. Trabajo en {c.address}, {c.city}, VA {c.zip}.</p>
          <h4>1. Trabajo y materiales</h4>
          <DocLines lines={q.lines} taxPct={q.taxPct} depositPct={q.depositPct} />
          {q.notes ? <p className="doc__notes">{q.notes}</p> : null}
          <h4>2. Fechas</h4>
          <p>Inicio: <b>{fmtFull(k.start)}</b>. Terminación estimada: <b>{fmtFull(k.end)}</b>. El clima puede mover las fechas; avisaremos al cliente antes de cualquier cambio.</p>
          <h4>3. Plan de pagos</h4>
          <ul>
            {q.depositPct ? <li>Depósito de {q.depositPct} % ({money(deposit)}) al firmar, para reservar la fecha.</li> : null}
            <li>Saldo de {money(total - deposit)} al terminar el trabajo.</li>
            <li>Pago con tarjeta, transferencia, cheque, Zelle o efectivo.</li>
          </ul>
          <h4>4. Condiciones</h4>
          <ul>
            <li>Cualquier cambio al trabajo o al precio se hace por escrito y lo firman ambas partes.</li>
            <li>Antes de excavar se solicita la marcación de servicios públicos (Virginia 811).</li>
            <li>Al terminar se limpia el área de trabajo y se retiran los restos.</li>
          </ul>
          <h4>5. Aviso al consumidor</h4>
          <p className="doc__small">
            Virginia mantiene el Virginia Contractor Transaction Recovery Fund, que puede ayudar a consumidores perjudicados por contratistas
            con licencia. Información: Department of Professional and Occupational Regulation (DPOR).
          </p>
          <div className="doc__signs">
            <div>
              <div className="doc__sig">
                {k.signature ? <svg viewBox="0 0 600 200" aria-label={`Firma de ${c.name}`} role="img"><path d={k.signature} /></svg> : k.signedName ? <span className="doc__typed">{k.signedName}</span> : null}
              </div>
              <small>{c.name} · Cliente{k.signed ? ` · ${fmtFull(k.signed)}` : ''}</small>
            </div>
            <div>
              <div className="doc__sig doc__sig--brand">{k.status !== 'Borrador' ? 'Nino’s Landscaping' : ''}</div>
              <small>{business.name} · Contratista</small>
            </div>
          </div>
        </Doc>

        <div className="stack editor__side">
          <Card title="Acciones">
            {k.status === 'Borrador' ? (
              <div className="form">
                <div className="form__row">
                  <Field label="Inicio"><input type="date" value={k.start} onChange={(e) => patch({ start: e.target.value })} /></Field>
                  <Field label="Terminación"><input type="date" value={k.end} min={k.start} onChange={(e) => patch({ end: e.target.value })} /></Field>
                </div>
              </div>
            ) : null}
            <div className="side-actions">
              {k.status === 'Borrador' ? <Button kind="primary" icon="send" className="btn--block" onClick={() => setSending(true)}>Enviar para firma</Button> : null}
              {k.status === 'Enviado' ? (
                <>
                  <Button kind="primary" icon="sign" className="btn--block" onClick={() => setSigning(true)}>Simular firma del cliente</Button>
                  <Button icon="bell" className="btn--block" onClick={() => { patch({ sent: iso(today()) }); log(`Contrato ${k.number} reenviado a ${c.name}`, 'Recordatorio de firma enviado (simulado)') }}>Reenviar para firma</Button>
                </>
              ) : null}
              {k.status === 'Firmado' ? (
                <>
                  <p className="ok-line"><Icon name="check" size={16} /> Firmado {k.signed ? rel(k.signed) : ''}</p>
                  <a className="btn btn--primary btn--block" href="#/calendario?nuevo=1"><Icon name="calendar" size={18} /> Programar trabajo</a>
                </>
              ) : null}
              <a className="btn btn--plain btn--block" href={`#/cotizaciones/${q.id}`}><Icon name="quote" size={18} /> Ver cotización {q.number}</a>
            </div>
          </Card>

          <Card title={<>Requisitos de Virginia {missing ? <Badge tone="orange">{missing} pendiente{missing > 1 ? 's' : ''}</Badge> : <Badge tone="green">Completo</Badge>}</>}>
            <ul className="checklist">
              {checks.map(([ok, label, hint]) => (
                <li key={label} className={ok ? 'is-ok' : 'is-miss'}>
                  <Icon name={ok ? 'check' : 'alert'} size={16} />
                  <span>{label}{!ok && hint ? <small>{hint}</small> : null}</span>
                </li>
              ))}
            </ul>
            <p className="muted small">Guía basada en 18VAC50-22-260. Revise el texto final del contrato con un abogado antes de usarlo.</p>
          </Card>
        </div>
      </div>

      <Sheet open={sending} onClose={() => setSending(false)} title={`Enviar ${k.number} para firma`}>
        <p>{c.name} recibe un link para leer y firmar desde el celular. Prefiere <b>{c.prefers.toLowerCase()}</b>.</p>
        <div className="send-grid">
          {(['Texto', 'WhatsApp', 'Email'] as const).map((via) => (
            <Button key={via} kind={via === c.prefers ? 'primary' : 'secondary'} icon={via === 'Email' ? 'mail' : via === 'WhatsApp' ? 'send' : 'message'} onClick={() => send(via)}>{via}</Button>
          ))}
        </div>
        <p className="muted small">Simulado: no se envía ningún mensaje real.</p>
      </Sheet>

      <Sheet open={signing} onClose={() => setSigning(false)} title="Firma del cliente (simulación)">
        <p className="muted small">Así firmaría {c.name} desde su celular.</p>
        <SignaturePad
          onCancel={() => setSigning(false)}
          onDone={(sig) => {
            patch({ status: 'Firmado', signed: iso(today()), signature: sig.path, signedName: sig.name })
            log(`Contrato ${k.number} firmado por ${c.name}`, 'Contrato firmado: ya puede programar el trabajo')
            setSigning(false)
          }}
        />
      </Sheet>
    </>
  )
}
