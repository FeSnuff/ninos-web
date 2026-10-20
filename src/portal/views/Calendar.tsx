import { useState, type FormEvent } from 'react'
import { addDays, iso, parse, today, uid, type Crew, type EventType, type Job } from '../data'
import { go, useStore } from '../store'
import { Badge, Button, Card, Empty, Field, Header, Icon, Segmented, Sheet, TYPE_TONE, fmtDate, fmtLong, fmtTime, money, rel } from '../ui'

const WEEKDAYS = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom']
const TYPES: EventType[] = ['Mantenimiento', 'Proyecto', 'Estimado', 'Riego', 'Interno']

/** 6 weeks starting on the Monday on/before the 1st */
function monthGrid(year: number, month: number) {
  const first = new Date(year, month, 1)
  const offset = (first.getDay() + 6) % 7
  const start = addDays(first, -offset)
  return Array.from({ length: 42 }, (_, i) => addDays(start, i))
}

export function CalendarView({ query }: { query: URLSearchParams }) {
  const { db, update, log, client } = useStore()
  const t = iso(today())
  const [selected, setSelected] = useState(query.get('dia') ?? t)
  const [cursor, setCursor] = useState(() => {
    const d = parse(query.get('dia') ?? t)
    return { y: d.getFullYear(), m: d.getMonth() }
  })
  const [crew, setCrew] = useState<'Todos' | Crew>('Todos')
  const adding = query.get('nuevo') === '1'

  const jobs = db.jobs.filter((j) => crew === 'Todos' || j.crew === crew)
  const byDay = (day: string) => jobs.filter((j) => j.date === day).sort((a, b) => a.time.localeCompare(b.time))
  const cells = monthGrid(cursor.y, cursor.m)
  const monthLabel = new Date(cursor.y, cursor.m, 1).toLocaleDateString('es-US', { month: 'long', year: 'numeric' })
  const shift = (n: number) => setCursor(({ y, m }) => ({ y: m + n < 0 ? y - 1 : m + n > 11 ? y + 1 : y, m: (m + n + 12) % 12 }))
  const goToday = () => {
    const d = today()
    setCursor({ y: d.getFullYear(), m: d.getMonth() })
    setSelected(t)
  }

  const dayJobs = byDay(selected)
  const important = jobs
    .filter((j) => j.date >= t && j.date <= addDays(t, 30) && j.type !== 'Mantenimiento')
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, 8)

  const move = (j: Job, date: string) => {
    // typing a year digit by digit fires change with dates like 0002-…; only accept today or later
    if (!date || date < t) return
    update((d) => {
      const x = d.jobs.find((x) => x.id === j.id)!
      x.date = date
      x.status = 'Reprogramado'
    })
    const c = client(j.clientId)
    log(`${j.title} movido al ${fmtDate(date)}${c ? `; aviso enviado a ${c.name}` : ''}`, c ? `Movido al ${fmtDate(date)} y cliente avisado (simulado)` : `Movido al ${fmtDate(date)}`)
  }
  const complete = (j: Job) => {
    update((d) => { d.jobs.find((x) => x.id === j.id)!.status = 'Completado' })
    log(`${j.title} completado`, 'Marcado como completado')
  }
  const remove = (j: Job) => {
    update((d) => { d.jobs = d.jobs.filter((x) => x.id !== j.id) })
    log(`Evento eliminado: ${j.title}`, 'Evento eliminado')
  }

  return (
    <>
      <Header
        title="Calendario"
        sub="Mantenimientos, proyectos, estimados y recordatorios internos."
        actions={<Button kind="primary" icon="plus" onClick={() => go(`/calendario?nuevo=1&dia=${selected}`)}>Nuevo evento</Button>}
      />

      <div className="cal-layout">
        <Card className="cal">
          <div className="cal__bar">
            <div className="cal__nav">
              <button type="button" className="icon-btn" onClick={() => shift(-1)} aria-label="Mes anterior"><Icon name="chevL" size={18} /></button>
              <h2 className="cal__month">{monthLabel}</h2>
              <button type="button" className="icon-btn" onClick={() => shift(1)} aria-label="Mes siguiente"><Icon name="chevR" size={18} /></button>
              <Button small kind="plain" onClick={goToday}>Hoy</Button>
            </div>
            <Segmented label="Equipo" value={crew} onChange={setCrew} options={[{ value: 'Todos', label: 'Todos' }, { value: 'Equipo 1', label: 'Equipo 1' }, { value: 'Equipo 2', label: 'Equipo 2' }]} />
          </div>
          <div className="cal__grid">
            {WEEKDAYS.map((w) => <div key={w} className="cal__wd" aria-hidden="true">{w}</div>)}
            {cells.map((day) => {
              const list = byDay(day)
              const out = parse(day).getMonth() !== cursor.m
              const cls = ['cal__cell', out && 'is-out', day === t && 'is-today', day === selected && 'is-sel'].filter(Boolean).join(' ')
              return (
                <button key={day} type="button" className={cls} onClick={() => setSelected(day)} aria-label={`${fmtLong(day)}, ${list.length} eventos`} aria-pressed={day === selected}>
                  <span className="cal__num">{parse(day).getDate()}</span>
                  <span className="cal__chips">
                    {list.slice(0, 3).map((j) => (
                      <span key={j.id} className={`chip tone-${TYPE_TONE[j.type]}${j.status === 'Completado' ? ' is-done' : ''}`}>
                        {j.type === 'Mantenimiento' && j.clientId ? client(j.clientId)?.name.split(' ')[0] : j.title}
                      </span>
                    ))}
                    {list.length > 3 ? <span className="chip chip--more">+{list.length - 3}</span> : null}
                  </span>
                  <span className="cal__dots" aria-hidden="true">
                    {list.slice(0, 4).map((j) => <span key={j.id} className={`dot tone-${TYPE_TONE[j.type]}`} />)}
                  </span>
                </button>
              )
            })}
          </div>
          <ul className="legend">
            {TYPES.map((ty) => <li key={ty}><span className={`dot tone-${TYPE_TONE[ty]}`} /> {ty}</li>)}
          </ul>
        </Card>

        <div className="stack">
          <Card title={<span className="cap">{fmtLong(selected)}</span>} action={<span className="muted small">{rel(selected)}</span>} flush>
            {dayJobs.length ? (
              <ul className="agenda">
                {dayJobs.map((j) => {
                  const c = client(j.clientId)
                  return (
                    <li key={j.id} className={`agenda__item${j.status === 'Completado' ? ' is-done' : ''}`}>
                      <span className="agenda__time">{fmtTime(j.time)}<small>{j.hours} h</small></span>
                      <span className={`agenda__bar tone-${TYPE_TONE[j.type]}`} aria-hidden="true" />
                      <div className="agenda__main">
                        <p className="agenda__title">
                          {c ? <a href={`#/clientes/${c.id}`}>{c.name}</a> : j.title}
                          {j.status !== 'Programado' ? <Badge>{j.status}</Badge> : null}
                        </p>
                        <p className="agenda__sub">
                          {c ? `${j.title} · ` : ''}{j.type} · {j.crew}{j.repeat ? ` · ${j.repeat.toLowerCase()}` : ''}{j.amount ? ` · ${money(j.amount)}` : ''}
                        </p>
                        {j.notes ? <p className="agenda__note"><Icon name="alert" size={14} /> {j.notes}</p> : null}
                        {j.status !== 'Completado' ? (
                          <div className="agenda__actions">
                            <label className="btn btn--secondary btn--sm date-btn">
                              <Icon name="calendar" size={16} /> Mover
                              <input type="date" min={t} aria-label="Nueva fecha" onChange={(e) => move(j, e.target.value)} />
                            </label>
                            <Button small kind="primary" icon="check" onClick={() => complete(j)}>Completar</Button>
                            {!j.repeat ? <Button small kind="plain" icon="trash" onClick={() => remove(j)} aria-label="Eliminar evento" /> : null}
                          </div>
                        ) : null}
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <Empty icon="calendar" title="Sin eventos" text="Nada programado para este día." action={<Button small icon="plus" onClick={() => go(`/calendario?nuevo=1&dia=${selected}`)}>Agregar</Button>} />
            )}
          </Card>

          <Card title="Próximos importantes" action={<span className="muted small">30 días</span>} flush>
            {important.length ? (
              <ul className="reminders">
                {important.map((j) => (
                  <li key={j.id}>
                    <button type="button" onClick={() => { setSelected(j.date); const d = parse(j.date); setCursor({ y: d.getFullYear(), m: d.getMonth() }) }}>
                      <span className={`tile-icon tone-${TYPE_TONE[j.type]}`}><Icon name={j.type === 'Riego' ? 'drop' : j.type === 'Interno' ? 'bell' : j.type === 'Estimado' ? 'quote' : 'truck'} size={16} /></span>
                      <span className="reminders__main">
                        <b>{j.title}</b>
                        <small>{j.clientId ? client(j.clientId)?.name + ' · ' : ''}{fmtDate(j.date)} · {rel(j.date)}</small>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty icon="bell" title="Nada importante" text="Sin proyectos ni recordatorios en los próximos 30 días." />
            )}
          </Card>
        </div>
      </div>

      {/* mounted only while open, so the form starts fresh with the right day */}
      {adding ? <NewEvent open day={query.get('dia') ?? selected} clientId={query.get('cliente') ?? ''} title={query.get('titulo') ?? ''} onClose={() => go(`/calendario?dia=${selected}`)} /> : null}
    </>
  )
}

function NewEvent({ open, day, clientId, title: presetTitle, onClose }: { open: boolean; day: string; clientId: string; title: string; onClose: () => void }) {
  const { db, update, log, client } = useStore()
  const [f, setF] = useState({ title: presetTitle, clientId, type: (presetTitle ? 'Proyecto' : 'Mantenimiento') as EventType, date: day, time: '09:00', hours: 1, crew: 'Equipo 1' as Crew, repeat: '', amount: '', notes: '', notify: true })
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }))

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const c = client(f.clientId)
    const title = f.title.trim() || (f.type === 'Estimado' ? 'Estimado' : f.type === 'Interno' ? 'Recordatorio' : f.type)
    // next 8 weeks of visits; monthly keeps the same day of the month
    const step = f.repeat === 'Semanal' ? 7 : f.repeat === 'Quincenal' ? 14 : 0
    const dates = step
      ? Array.from({ length: Math.ceil(56 / step) + 1 }, (_, i) => addDays(f.date, i * step))
      : f.repeat === 'Mensual'
        ? [0, 1, 2].map((i) => { const d = parse(f.date); d.setMonth(d.getMonth() + i); return iso(d) })
        : [f.date]
    const ids = dates.map(() => uid('j'))
    update((d) => {
      dates.forEach((date, i) =>
        d.jobs.push({
          id: ids[i], title, clientId: f.clientId || undefined, date, time: f.time, hours: Number(f.hours) || 1, type: f.type, crew: f.crew, status: 'Programado',
          repeat: (f.repeat || undefined) as Job['repeat'], amount: f.amount ? Number(f.amount) : undefined, notes: f.notes || undefined,
        }),
      )
    })
    log(
      `Evento creado: ${title}${dates.length > 1 ? ` (${dates.length} visitas)` : ''}${c && f.notify ? `; confirmación enviada a ${c.name}` : ''}`,
      c && f.notify ? 'Evento creado y confirmación enviada (simulado)' : 'Evento creado',
    )
    // reopen the calendar on the new event's day (the view is keyed by ?dia=)
    go(`/calendario?dia=${f.date}`)
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Nuevo evento"
      footer={<><Button kind="plain" onClick={onClose}>Cancelar</Button><Button kind="primary" type="submit" form="new-event">Guardar</Button></>}
    >
      <form id="new-event" className="form" onSubmit={submit}>
        <Field label="Tipo">
          <select value={f.type} onChange={(e) => set('type', e.target.value as EventType)}>
            {TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Título">
          <input value={f.title} onChange={(e) => set('title', e.target.value)} placeholder="Ej. Corte y bordes, Estimado de drenaje…" />
        </Field>
        <Field label="Cliente (opcional)">
          <select value={f.clientId} onChange={(e) => set('clientId', e.target.value)}>
            <option value="">Sin cliente (interno)</option>
            {db.clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <div className="form__row">
          <Field label="Fecha"><input type="date" required value={f.date} onChange={(e) => set('date', e.target.value)} /></Field>
          <Field label="Hora"><input type="time" required value={f.time} onChange={(e) => set('time', e.target.value)} /></Field>
        </div>
        <div className="form__row">
          <Field label="Horas"><input type="number" min={0.5} step={0.5} value={f.hours} onChange={(e) => set('hours', Number(e.target.value))} /></Field>
          <Field label="Equipo">
            <select value={f.crew} onChange={(e) => set('crew', e.target.value as Crew)}>
              <option>Equipo 1</option>
              <option>Equipo 2</option>
            </select>
          </Field>
        </div>
        <div className="form__row">
          <Field label="Repetir">
            <select value={f.repeat} onChange={(e) => set('repeat', e.target.value)}>
              <option value="">No se repite</option>
              <option>Semanal</option>
              <option>Quincenal</option>
              <option>Mensual</option>
            </select>
          </Field>
          <Field label="Precio por visita ($)"><input type="number" min={0} step={1} inputMode="decimal" value={f.amount} onChange={(e) => set('amount', e.target.value)} /></Field>
        </div>
        <Field label="Notas para el equipo"><textarea rows={2} value={f.notes} onChange={(e) => set('notes', e.target.value)} /></Field>
        {f.clientId ? (
          <label className="check">
            <input type="checkbox" checked={f.notify} onChange={(e) => set('notify', e.target.checked)} />
            Enviar confirmación al cliente ({client(f.clientId)?.prefers.toLowerCase()})
          </label>
        ) : null}
        {f.repeat ? <p className="muted small">Se crean las visitas de las próximas 8 semanas.</p> : null}
      </form>
    </Sheet>
  )
}
