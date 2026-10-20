import { useState } from 'react'
import { addDays, daysBetween, invoiceBalance, invoiceStatus, iso, nextWorkday, quoteTotal, today, uid, type Db, type Job, nextNumber } from '../data'
import { go, useStore } from '../store'
import { TERMS } from '../terms'
import { Avatar, Badge, Button, Card, Empty, Header, Icon, Sheet, Stat, TYPE_TONE, fmtDate, fmtLong, fmtTime, money, money0, rel, type IconName } from '../ui'

const greeting = () => {
  const h = new Date().getHours()
  return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches'
}

/** Things that need someone to act, newest problems first */
type Alert = { id: string; icon: IconName; tone: string; title: string; sub: string; action: string; run: () => void }

/** create the invoice for a finished one-off job (id made by the caller, outside the state update) */
export function invoiceFromJob(d: Db, job: Job, id: string) {
  const inv = {
    id,
    number: nextNumber('F', d.invoices),
    clientId: job.clientId!,
    issued: iso(today()),
    due: addDays(today(), TERMS.balanceDueDays),
    lines: [{ id: uid('l'), desc: job.title, qty: 1, unit: 'servicio' as const, price: job.amount ?? 0 }],
    payments: [],
  }
  d.invoices.unshift(inv)
  const j = d.jobs.find((x) => x.id === job.id)
  if (j) j.invoiceId = inv.id
}

export function Today() {
  const { db, update, log, client } = useStore()
  const [rainOpen, setRainOpen] = useState(false)
  const t = iso(today())
  const week = addDays(t, 7)

  const todays = db.jobs.filter((j) => j.date === t).sort((a, b) => a.time.localeCompare(b.time))
  const pending = todays.filter((j) => j.status !== 'Completado' && j.type !== 'Interno')
  const upcoming = db.jobs.filter((j) => j.date > t && j.date <= week).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))

  /* stats */
  const month = t.slice(0, 7)
  const collected = db.invoices.flatMap((i) => i.payments).filter((p) => p.date.startsWith(month)).reduce((a, p) => a + p.amount, 0)
  const open = db.invoices.filter((i) => invoiceBalance(i) > 0)
  const receivable = open.reduce((a, i) => a + invoiceBalance(i), 0)
  const overdueList = open.filter((i) => invoiceStatus(i) === 'Vencida')
  const overdue = overdueList.reduce((a, i) => a + invoiceBalance(i), 0)
  const openQuotes = db.quotes.filter((q) => q.status === 'Enviada' || q.status === 'Vista')
  const weekJobs = db.jobs.filter((j) => j.date >= t && j.date < week && j.type !== 'Interno')

  /* alerts */
  const alerts: Alert[] = []
  for (const q of openQuotes) {
    const since = daysBetween(q.followUp ?? q.sent ?? q.created, t)
    if (since < 3) continue
    alerts.push({
      id: q.id, icon: 'quote', tone: 'blue',
      title: `Seguimiento de ${q.number} · ${client(q.clientId)?.name}`,
      sub: `${q.status === 'Vista' ? 'La vio' : 'Enviada'} ${rel(q.viewed ?? q.sent ?? q.created)}, sin respuesta · ${money0(quoteTotal(q))}`,
      action: 'Enviar recordatorio',
      run: () => {
        update((d) => { d.quotes.find((x) => x.id === q.id)!.followUp = t })
        log(`Recordatorio de cotización ${q.number} enviado a ${client(q.clientId)?.name}`, 'Recordatorio enviado (simulado)')
      },
    })
  }
  for (const i of overdueList) {
    alerts.push({
      id: i.id, icon: 'dollar', tone: 'red',
      title: `${i.number} vencida · ${client(i.clientId)?.name}`,
      sub: `${money(invoiceBalance(i))} pendiente · venció ${rel(i.due)}${i.sentReminder ? ` · recordatorio ${rel(i.sentReminder)}` : ''}`,
      action: 'Recordar pago',
      run: () => {
        update((d) => { d.invoices.find((x) => x.id === i.id)!.sentReminder = t })
        log(`Recordatorio de pago ${i.number} enviado a ${client(i.clientId)?.name} con link de pago`, 'Recordatorio con link de pago enviado (simulado)')
      },
    })
  }
  for (const j of db.jobs.filter((j) => j.status === 'Completado' && j.amount && !j.repeat && !j.invoiceId && j.clientId)) {
    alerts.push({
      id: j.id, icon: 'card', tone: 'orange',
      title: `Trabajo sin facturar · ${client(j.clientId)?.name}`,
      sub: `${j.title} · terminado ${rel(j.date)} · ${money(j.amount!)}`,
      action: 'Facturar',
      run: () => {
        const id = uid('f')
        update((d) => invoiceFromJob(d, j, id))
        log(`Factura creada para ${client(j.clientId)?.name}`, 'Factura creada')
        go(`/facturas/${id}`)
      },
    })
  }
  for (const k of db.contracts.filter((k) => k.status === 'Enviado' && k.sent && daysBetween(k.sent, t) >= 2)) {
    alerts.push({
      id: k.id, icon: 'sign', tone: 'indigo',
      title: `${k.number} sin firmar · ${client(k.clientId)?.name}`,
      sub: `Enviado ${rel(k.sent!)} · el trabajo empieza ${rel(k.start)}`,
      action: 'Ver contrato',
      run: () => go(`/contratos/${k.id}`),
    })
  }
  const m = today().getMonth()
  if (m >= 8 && m <= 10) {
    const irrigation = db.clients.filter((c) => c.tags.includes('Riego'))
    const booked = new Set(db.jobs.filter((j) => j.date >= t && /winterizaci[oó]n|cierre de invierno/i.test(j.title)).map((j) => j.clientId))
    const missing = irrigation.filter((c) => !booked.has(c.id))
    if (missing.length)
      alerts.push({
        id: 'season', icon: 'drop', tone: 'teal',
        title: `Temporada de cierre de riego: ${missing.length} sin cita`,
        sub: `${missing.map((c) => c.name.split(' ')[0]).join(', ')} · antes de la primera helada (mediados de nov.)`,
        action: 'Ver clientes',
        run: () => go('/clientes?tag=Riego'),
      })
  }

  const setStatus = (j: Job, status: Job['status']) => {
    update((d) => { d.jobs.find((x) => x.id === j.id)!.status = status })
    const c = client(j.clientId)
    if (status === 'En camino' && c) log(`"Vamos en camino" enviado a ${c.name} por ${c.prefers.toLowerCase()}`, `Aviso "vamos en camino" enviado a ${c.name} (simulado)`)
    if (status === 'Completado') log(`${j.title} completado${c ? ' · ' + c.name : ''}`, 'Trabajo marcado como completado')
  }

  const rainDay = () => {
    const to = nextWorkday(t)
    const ids = new Set(pending.map((j) => j.id))
    update((d) => {
      for (const j of d.jobs) if (ids.has(j.id)) { j.date = to; j.status = 'Reprogramado' }
    })
    const n = pending.filter((j) => j.clientId).length
    log(`Día de lluvia: ${pending.length} visitas movidas al ${fmtDate(to)}; ${n} clientes avisados`, `${pending.length} visitas movidas al ${fmtDate(to)} y ${n} clientes avisados (simulado)`)
    setRainOpen(false)
  }

  return (
    <>
      <Header
        title={`${greeting()}, Nino`}
        sub={<span className="cap">{fmtLong(t)} · {pending.length ? `${pending.length} visitas pendientes hoy` : 'sin visitas pendientes hoy'}</span>}
        actions={<Button icon="rain" onClick={() => setRainOpen(true)} disabled={!pending.length}>Día de lluvia</Button>}
      />

      <div className="stats">
        <Stat icon="trend" tone="green" label="Cobrado este mes" value={money0(collected)} />
        <Stat icon="dollar" tone={overdue ? 'red' : 'blue'} label="Por cobrar" value={money0(receivable)} sub={overdue ? <span className="txt-red">{money0(overdue)} vencido</span> : 'Todo al día'} />
        <Stat icon="quote" tone="indigo" label="Cotizaciones abiertas" value={money0(openQuotes.reduce((a, q) => a + quoteTotal(q), 0))} sub={`${openQuotes.length} esperando respuesta`} />
        <Stat icon="truck" tone="orange" label="Próximos 7 días" value={`${weekJobs.length} visitas`} sub={`${weekJobs.reduce((a, j) => a + j.hours, 0)} horas de trabajo`} />
      </div>

      <div className="cols">
        <Card title="Agenda de hoy" action={<a className="card__link" href="#/calendario">Calendario</a>} flush>
          {todays.length ? (
            <ul className="agenda">
              {todays.map((j) => {
                const c = client(j.clientId)
                return (
                  <li key={j.id} className={`agenda__item${j.status === 'Completado' ? ' is-done' : ''}`}>
                    <span className="agenda__time">
                      {fmtTime(j.time)}
                      <small>{j.hours} h</small>
                    </span>
                    <span className={`agenda__bar tone-${TYPE_TONE[j.type]}`} aria-hidden="true" />
                    <div className="agenda__main">
                      <p className="agenda__title">
                        {c ? <a href={`#/clientes/${c.id}`}>{c.name}</a> : j.title}
                        {j.status !== 'Programado' ? <Badge>{j.status}</Badge> : null}
                      </p>
                      <p className="agenda__sub">
                        {c ? `${j.title} · ` : ''}{j.crew}{j.repeat ? ` · ${j.repeat.toLowerCase()}` : ''}
                      </p>
                      {c ? (
                        <p className="agenda__addr">
                          <Icon name="pin" size={14} />
                          <a href={`https://maps.google.com/?q=${encodeURIComponent(`${c.address}, ${c.city}, VA ${c.zip}`)}`} target="_blank" rel="noopener noreferrer">{c.address}, {c.city}</a>
                        </p>
                      ) : null}
                      {c?.notes ? <p className="agenda__note"><Icon name="alert" size={14} /> {c.notes}</p> : null}
                      {j.notes ? <p className="agenda__note"><Icon name="alert" size={14} /> {j.notes}</p> : null}
                      {j.status !== 'Completado' ? (
                        <div className="agenda__actions">
                          {c && j.status !== 'En camino' ? <Button small icon="send" onClick={() => setStatus(j, 'En camino')}>En camino</Button> : null}
                          <Button small kind="primary" icon="check" onClick={() => setStatus(j, 'Completado')}>Completar</Button>
                          {c ? <a className="btn btn--plain btn--sm" href={`tel:${c.phone}`}><Icon name="phone" size={16} /> Llamar</a> : null}
                        </div>
                      ) : null}
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            <Empty icon="calendar" title="Día libre" text="No hay visitas programadas para hoy." />
          )}
        </Card>

        <div className="stack">
          <Card title={<>Necesita atención {alerts.length ? <span className="pill">{alerts.length}</span> : null}</>} flush>
            {alerts.length ? (
              <ul className="alerts">
                {alerts.map((a) => (
                  <li key={a.id} className="alert">
                    <span className={`tile-icon tone-${a.tone}`}><Icon name={a.icon} size={17} /></span>
                    <div className="alert__main">
                      <p className="alert__title">{a.title}</p>
                      <p className="alert__sub">{a.sub}</p>
                    </div>
                    <Button small onClick={a.run}>{a.action}</Button>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty icon="check" title="Todo al día" text="No hay cobros, seguimientos ni firmas pendientes." />
            )}
          </Card>

          <Card title="Próximos 7 días" action={<a className="card__link" href="#/calendario">Ver todo</a>} flush>
            <ul className="upcoming">
              {Array.from({ length: 7 }, (_, n) => addDays(t, n + 1)).map((day) => {
                const list = upcoming.filter((j) => j.date === day)
                const special = list.filter((j) => j.type !== 'Mantenimiento')
                const routine = list.length - special.length
                return (
                  <li key={day} className="upcoming__day">
                    <a href={`#/calendario?dia=${day}`} className="upcoming__date">
                      <span className="cap">{fmtDate(day, { weekday: 'short' })}</span>
                      <b>{fmtDate(day, { day: 'numeric' })}</b>
                    </a>
                    <div className="upcoming__list">
                      {routine ? <p className="upcoming__routine"><span className="dot tone-green" /> {routine} mantenimientos de rutina</p> : null}
                      {special.map((j) => (
                        <p key={j.id}>
                          <span className={`dot tone-${TYPE_TONE[j.type]}`} /> <b>{fmtTime(j.time)}</b> {j.title}
                          {j.clientId ? <span className="muted"> · {client(j.clientId)?.name}</span> : null}
                        </p>
                      ))}
                      {!list.length ? <p className="muted">{new Date(day + 'T12:00').getDay() === 0 ? 'Domingo · descanso' : 'Sin visitas'}</p> : null}
                    </div>
                  </li>
                )
              })}
            </ul>
          </Card>

          {db.activity.length ? (
            <Card title="Actividad reciente" flush>
              <ul className="activity">
                {db.activity.slice(0, 6).map((a, i) => (
                  <li key={i}>
                    <Avatar name="Nino" size={28} />
                    <span>{a.text}<small>{new Date(a.at).toLocaleTimeString('es-US', { hour: 'numeric', minute: '2-digit' })}</small></span>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </div>
      </div>

      <Sheet
        open={rainOpen}
        onClose={() => setRainOpen(false)}
        title="Reprogramar por lluvia"
        footer={
          <>
            <Button kind="plain" onClick={() => setRainOpen(false)}>Cancelar</Button>
            <Button kind="primary" icon="rain" onClick={rainDay}>Mover {pending.length} visitas</Button>
          </>
        }
      >
        <p>
          Las visitas pendientes de hoy pasan al <b>{fmtLong(nextWorkday(t))}</b>, a la misma hora. Cada cliente recibe un aviso con la
          plantilla <i>Día de lluvia</i> por su medio preferido.
        </p>
        <div className="group">
          {pending.map((j) => (
            <div key={j.id} className="row">
              <span className="row__lead"><b>{fmtTime(j.time)}</b></span>
              <span className="row__main">
                <span className="row__title">{client(j.clientId)?.name ?? j.title}</span>
                <span className="row__sub">{j.title} · {client(j.clientId)?.prefers ?? 'sin aviso'}</span>
              </span>
            </div>
          ))}
        </div>
        <p className="muted small">Las visitas recurrentes siguen en su día normal la próxima semana.</p>
      </Sheet>
    </>
  )
}
