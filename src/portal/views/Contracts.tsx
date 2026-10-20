import { useRef, useState, type PointerEvent } from 'react'
import { business } from '../../site.config'
import { addBusinessDays, addDays, invoiceTotal, iso, nextNumber, quoteTotal, today, uid, type Contract, type ContractStatus } from '../data'
import { TERMS } from '../terms'
import { go, useStore } from '../store'
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

/** Highlighted gap in a document: data the owner still has to confirm */
const Todo = ({ children }: { children: string }) => <span className="doc__todo">[PENDIENTE: {children}]</span>

/** Signature pad: strokes are kept as SVG path data (the page's security policy blocks data: images). */
function SignaturePad({ onDone, onCancel }: { onDone: (sig: { path?: string; name?: string; noPhotos: boolean }) => void; onCancel: () => void }) {
  const ref = useRef<SVGSVGElement>(null)
  const [paths, setPaths] = useState<string[]>([])
  const [name, setName] = useState('')
  const [noPhotos, setNoPhotos] = useState(false)
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
      <label className="check mt">
        <input type="checkbox" checked={noPhotos} onChange={(e) => setNoPhotos(e.target.checked)} />
        No autorizo el uso de fotos de mi propiedad (cláusula 10)
      </label>
      <div className="sheet__foot sheet__foot--inline">
        <Button kind="plain" onClick={() => setPaths([])} disabled={!paths.length}>Borrar</Button>
        <Button kind="plain" onClick={onCancel}>Cancelar</Button>
        <Button kind="primary" icon="check" onClick={() => onDone(paths.length ? { path: paths.join(' '), noPhotos } : { name: name.trim(), noPhotos })} disabled={!paths.length && !name.trim()}>Firmar</Button>
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
  const earliestStart = addBusinessDays(k.signed ?? iso(today()), 3)
  // what was already billed for this quote (deposit, balance)
  const billedFor = db.invoices.filter((i) => i.lines.some((l) => l.desc.includes(q.number)))
  const billed = billedFor.reduce((a, i) => a + invoiceTotal(i), 0)
  const balanceBilled = billedFor.some((i) => i.lines.some((l) => l.desc.startsWith('Saldo')))
  const billBalance = () => {
    const fid = uid('f')
    const amount = Math.round((total - billed) * 100) / 100
    update((d) => {
      d.invoices.unshift({ id: fid, number: nextNumber('F', d.invoices), clientId: k.clientId, issued: iso(today()), due: addDays(today(), TERMS.balanceDueDays), lines: [{ id: uid('l'), desc: `Saldo · ${q.number} ${q.title}`, qty: 1, unit: 'servicio', price: amount }], payments: [] })
    })
    log(`Factura del saldo de ${k.number} creada para ${c.name}`, 'Factura del saldo creada')
    go(`/facturas/${fid}`)
  }
  const setDates = (start: string, end: string) => {
    // ignore partial dates typed digit by digit (e.g. 0002-…) and keep end ≥ start
    if (!start || start < iso(today())) return
    patch({ start, end: end < start ? start : end })
  }
  const sendForSignature = () => {
    if (missing && !window.confirm(`Faltan ${missing} requisito${missing > 1 ? 's' : ''} de Virginia y el contrato mostrará campos PENDIENTE. ¿Enviar de todos modos (demostración)?`)) return
    setSending(true)
  }
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
    [Boolean(TERMS.noticeAddress), 'Aviso de cancelación con dirección (3 días hábiles)', 'Agregue la dirección postal en src/portal/terms.ts (noticeAddress).'],
    [lic.insured, 'Seguro de responsabilidad confirmado', 'Marque business.license.insured en site.config.ts cuando esté confirmado.'],
    [k.start >= earliestStart, 'Inicio después del plazo de cancelación (3 días hábiles)', `Con la firma ${k.signed ? 'del ' + fmtDate(k.signed) : 'de hoy'}, el trabajo puede empezar desde el ${fmtDate(earliestStart)}.`],
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
          <p className="doc__small">Basado en la cotización {q.number}. Vigente desde la firma de ambas partes.</p>

          <h4>1. Partes y propiedad</h4>
          <p>
            Este contrato es entre <b>{business.name}</b> («el Contratista»),{' '}
            {lic.dporNumber ? <>licencia DPOR {lic.dporClass} N.º {lic.dporNumber}{lic.specialties.length ? ` (${lic.specialties.join(', ')})` : ''}</> : <Todo>número, clase y especialidades de la licencia DPOR</Todo>}, con dirección para avisos en{' '}
            {TERMS.noticeAddress || <Todo>dirección postal del negocio</Todo>}, y <b>{c.name}</b> («el Cliente»), para trabajos en{' '}
            <b>{c.address}, {c.city}, VA {c.zip}</b> («la Propiedad»).
          </p>

          <h4>2. Alcance del trabajo y materiales</h4>
          <DocLines lines={q.lines} taxPct={q.taxPct} depositPct={q.depositPct} />
          {q.notes ? <p className="doc__notes">{q.notes}</p> : null}
          <p>
            <b>Incluye:</b> preparación del área, los materiales y cantidades indicados arriba, la mano de obra, la limpieza final y el retiro de restos
            del trabajo. <b>No incluye:</b> trabajos no descritos en esta sección, reparación de daños que ya existían, permisos municipales ni
            aprobaciones de la asociación de propietarios (HOA), salvo que se indiquen arriba.
          </p>

          <h4>3. Precio y forma de pago</h4>
          <ul>
            <li>Precio total: <b>{money(total)}</b>.</li>
            {q.depositPct ? <li>Depósito de {q.depositPct} % (<b>{money(deposit)}</b>) después de que ambas partes firmen, para reservar la fecha. No se acepta ningún pago antes de la firma.</li> : null}
            <li>Saldo de <b>{money(total - deposit)}</b> dentro de los {TERMS.balanceDueDays} días siguientes a la terminación del trabajo.</li>
            <li>Formas de pago: tarjeta, transferencia bancaria (ACH), cheque, Zelle o efectivo, con recibo por cada pago.</li>
            <li>Los saldos con más de 30 días de atraso pueden generar un cargo de {TERMS.lateFeePct} % mensual. Los cheques devueltos tienen un cargo de {money(TERMS.returnedCheckFee)}.</li>
            <li>Si un pago acordado no se recibe, el Contratista puede suspender el trabajo con aviso por escrito hasta que se ponga al día.</li>
          </ul>

          <h4>4. Fechas, clima y retrasos</h4>
          <p>
            Inicio: <b>{fmtFull(k.start)}</b>. Terminación estimada: <b>{fmtFull(k.end)}</b>. La lluvia, la tierra saturada o congelada, la
            disponibilidad de materiales o la espera de la marcación de servicios públicos pueden mover estas fechas. El Contratista avisará al
            Cliente antes de cualquier cambio y los días perdidos por clima no tienen costo adicional.
          </p>

          <h4>5. Cambios al trabajo</h4>
          <p>
            Cualquier cambio al alcance, los materiales, el precio o las fechas se hace con una orden de cambio por escrito, firmada por ambas partes
            antes de realizar el trabajo adicional, que indica el costo y el efecto en el calendario.
          </p>

          <h4>6. Acceso, servicios públicos y líneas privadas</h4>
          <ul>
            <li>El Cliente da acceso a las áreas de trabajo, agua y electricidad para las herramientas, y mantiene a sus mascotas aseguradas durante las visitas.</li>
            <li>Antes de excavar, el Contratista solicita la marcación de servicios públicos a Virginia 811 y espera el plazo de ley.</li>
            <li>Virginia 811 no marca líneas privadas: riego, iluminación de jardín, cercas invisibles para mascotas, líneas de gas o agua hacia anexos, sistemas sépticos ni drenajes. El Cliente debe señalarlas antes de empezar. El Contratista no responde por daños a líneas privadas que no fueron señaladas, y las reparará al costo si el Cliente lo pide.</li>
          </ul>

          <h4>7. Condiciones ocultas</h4>
          <p>
            Si al excavar se encuentran rocas, raíces grandes, escombros enterrados, materiales de construcción u otras condiciones que no se podían
            ver al cotizar, el Contratista avisará al Cliente y propondrá una orden de cambio antes de continuar con esa parte del trabajo.
          </p>

          <h4>8. Garantía</h4>
          <ul>
            <li><b>Mano de obra:</b> {TERMS.workmanshipMonths} meses desde la terminación. El Contratista corrige sin costo los defectos de instalación.</li>
            <li><b>Plantas y césped nuevos:</b> un reemplazo, una sola vez, de lo que muera dentro de los {TERMS.plantMonths} meses, si se siguieron las instrucciones de riego entregadas por escrito.</li>
            <li><b>Equipos:</b> los componentes de riego e iluminación tienen la garantía de su fabricante.</li>
            <li><b>No cubre:</b> sequía o restricciones de agua, falta de riego, plagas, animales o enfermedades fuera del control del Contratista, tormentas, inundaciones o heladas extremas, ni daños o cambios hechos por otras personas.</li>
            <li>La garantía aplica cuando el contrato está pagado en su totalidad.</li>
          </ul>

          <h4>9. Seguro y responsabilidad</h4>
          <p>
            {lic.insured ? 'El Contratista mantiene un seguro de responsabilidad general vigente y entrega el certificado si el Cliente lo pide.' : <Todo>confirmar el seguro de responsabilidad general antes de usar este contrato</Todo>}{' '}
            El Contratista responde por los daños que cause por negligencia durante el trabajo, y no por condiciones que ya existían en la Propiedad.
          </p>

          <h4>10. Fotos del trabajo</h4>
          <p>
            El Contratista puede fotografiar el trabajo y usar las fotos en su sitio web y redes sociales, sin mostrar la dirección, nombres ni
            números de casa. El Cliente puede negarse marcando aquí: {k.noPhotos ? '☑' : '☐'} No autorizo el uso de fotos.
          </p>

          <h4>11. Derecho a cancelar</h4>
          <div className="doc__box">
            <b>AVISO DE CANCELACIÓN.</b> Si este contrato se firma en su casa, usted puede cancelarlo sin penalidad ni obligación hasta la medianoche
            del tercer día hábil después de firmarlo. Para cancelar, envíe un aviso por escrito, firmado y con fecha, a{' '}
            {TERMS.noticeAddress || <Todo>dirección para avisos</Todo>}. Si cancela, se le devolverá cualquier pago que haya hecho. El trabajo no empieza antes de que termine este plazo, salvo una emergencia que usted solicite por escrito.
            <small>Virginia Home Solicitation Sales Act, Va. Code § 59.1-21.3. Use el texto exacto del aviso que exige § 59.1-21.4.</small>
          </div>

          <h4>12. Aviso al consumidor</h4>
          <p>
            El Virginia Contractor Transaction Recovery Fund puede ayudar a consumidores que sufrieron pérdidas por actos indebidos de contratistas
            con licencia. Puede verificar licencias y presentar quejas ante el Department of Professional and Occupational Regulation (DPOR),
            dpor.virginia.gov.
          </p>
          <div className="doc__box">
            <b>Reconocimiento del consumidor.</b> Al firmar, el Cliente confirma que recibió una copia de este contrato, que leyó el aviso sobre el
            Fondo de Recuperación y que puede verificar la licencia del Contratista en el sitio de DPOR.
            <small>18VAC50-22-260 B 9. Confirme el texto exigido vigente con un abogado.</small>
          </div>

          <h4>13. Disposiciones generales</h4>
          <ul>
            <li>Este contrato se rige por las leyes del Estado de Virginia.</li>
            <li>Las partes intentarán resolver cualquier desacuerdo de buena fe durante 15 días. Si no se resuelve, se presentará ante los tribunales de {TERMS.venue}.</li>
            <li>Este documento, junto con las órdenes de cambio firmadas, es el acuerdo completo entre las partes y reemplaza conversaciones anteriores.</li>
            <li>Si alguna cláusula no fuera válida, las demás siguen vigentes.</li>
            <li>Los avisos entre las partes se dan por escrito a las direcciones de este contrato; el email cuenta como aviso por escrito.</li>
          </ul>
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
                  <Field label="Inicio"><input type="date" value={k.start} min={iso(today())} onChange={(e) => setDates(e.target.value, k.end)} /></Field>
                  <Field label="Terminación"><input type="date" value={k.end} min={k.start} onChange={(e) => e.target.value >= k.start && patch({ end: e.target.value })} /></Field>
                </div>
              </div>
            ) : null}
            <div className="side-actions">
              {k.status === 'Borrador' ? <Button kind="primary" icon="send" className="btn--block" onClick={sendForSignature}>Enviar para firma</Button> : null}
              {k.status === 'Enviado' ? (
                <>
                  <Button kind="primary" icon="sign" className="btn--block" onClick={() => setSigning(true)}>Simular firma del cliente</Button>
                  <Button icon="bell" className="btn--block" onClick={() => { patch({ sent: iso(today()) }); log(`Contrato ${k.number} reenviado a ${c.name}`, 'Recordatorio de firma enviado (simulado)') }}>Reenviar para firma</Button>
                </>
              ) : null}
              {k.status === 'Firmado' ? (
                <>
                  <p className="ok-line"><Icon name="check" size={16} /> Firmado {k.signed ? rel(k.signed) : ''}</p>
                  <a className="btn btn--primary btn--block" href={`#/calendario?nuevo=1&dia=${k.start}&cliente=${k.clientId}&titulo=${encodeURIComponent(q.title)}`}><Icon name="calendar" size={18} /> Programar trabajo</a>
                  {!balanceBilled && total - billed > 0.01 ? <Button icon="card" className="btn--block" onClick={billBalance}>Facturar saldo ({money(total - billed)})</Button> : null}
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
            patch({ status: 'Firmado', signed: iso(today()), signature: sig.path, signedName: sig.name, noPhotos: sig.noPhotos })
            log(`Contrato ${k.number} firmado por ${c.name}`, 'Contrato firmado: ya puede programar el trabajo')
            setSigning(false)
          }}
        />
      </Sheet>
    </>
  )
}
