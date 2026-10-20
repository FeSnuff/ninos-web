import { useState } from 'react'
import { lineFrom, margin, subtotal, uid, type Line } from '../data'
import { useStore } from '../store'
import { Button, Card, Field, Icon, Segmented, money, money0 } from '../ui'

/**
 * Area calculator: measure one or more areas, pick materials, get quantities and an approximate price
 * from the price book. Simulated estimate: the final quote still needs a site visit.
 */

type Shape = 'rect' | 'circle' | 'tri' | 'sqft'
type Area = { id: string; label: string; shape: Shape; a: number; b: number }

const SHAPES: { value: Shape; label: string }[] = [
  { value: 'rect', label: 'Rectángulo' },
  { value: 'circle', label: 'Círculo' },
  { value: 'tri', label: 'Triángulo' },
  { value: 'sqft', label: 'pie²' },
]

function measure({ shape, a, b }: Area) {
  switch (shape) {
    case 'rect': return { area: a * b, edge: 2 * (a + b) }
    case 'circle': return { area: Math.PI * (a / 2) ** 2, edge: Math.PI * a }
    // isosceles triangle: base a, height b
    case 'tri': return { area: (a * b) / 2, edge: a + 2 * Math.hypot(a / 2, b) }
    // only the area is known: assume a square bed for the edge
    default: return { area: a, edge: 4 * Math.sqrt(a) }
  }
}

const ceilTo = (n: number, step: number) => Math.ceil(n / step - 1e-9) * step

/** material → price-book item, how to turn area/edge into a quantity */
type Material = { key: string; label: string; priceId: string; param?: { label: string; unit: string; def: number; min: number; max: number }; qty: (area: number, edge: number, p: number) => number; hint: string }
const MATERIALS: Material[] = [
  { key: 'mulch', label: 'Mulch', priceId: 'p4', param: { label: 'Profundidad', unit: 'pulg.', def: 3, min: 1, max: 6 }, qty: (ar, _e, d) => ceilTo((ar * d) / 12 / 27, 0.5), hint: '2–3 pulgadas es lo recomendado; más puede ahogar las raíces.' },
  { key: 'rock', label: 'Piedra de río', priceId: 'p5', param: { label: 'Profundidad', unit: 'pulg.', def: 2, min: 1, max: 6 }, qty: (ar, _e, d) => ceilTo((ar * d) / 12 / 27, 0.5), hint: '2 pulgadas cubren bien sobre malla antimaleza.' },
  { key: 'fabric', label: 'Malla antimaleza', priceId: 'p6', param: { label: 'Traslape', unit: '%', def: 10, min: 0, max: 30 }, qty: (ar, _e, o) => Math.ceil(ar * (1 + o / 100)), hint: 'Se suma un 10 % para traslapar las uniones.' },
  { key: 'sod', label: 'Césped en rollo', priceId: 'p3', param: { label: 'Desperdicio', unit: '%', def: 5, min: 0, max: 20 }, qty: (ar, _e, w) => Math.ceil(ar * (1 + w / 100)), hint: 'Un 5 % extra para cortes en curvas y bordes.' },
  { key: 'edge', label: 'Borde de adoquín', priceId: 'p7', param: { label: 'Del perímetro', unit: '%', def: 100, min: 10, max: 100 }, qty: (_a, e, pct) => Math.ceil((e * pct) / 100), hint: 'Use menos de 100 % si un lado toca la casa o la acera.' },
]

/** Optional: per-visit services priced by property size (factor over the price-book price) */
type Size = 'none' | 'S' | 'M' | 'L'
const SIZES: Record<Exclude<Size, 'none'>, { label: string; lot: string; factor: number }> = {
  S: { label: 'Pequeña', lot: 'hasta 5,000 pie² de jardín (townhouse o lote chico)', factor: 0.8 },
  M: { label: 'Mediana', lot: '5,000 a 10,000 pie² (casa típica de vecindario)', factor: 1 },
  L: { label: 'Grande', lot: '10,000 a 20,000 pie² (lote amplio o esquina)', factor: 1.5 },
}
/** price-book items that scale with property size */
const SIZE_SERVICES = ['p1', 'p10', 'p11', 'p2']

export function AreaCalculator({ onAdd, addLabel = 'Agregar a la cotización' }: { onAdd: (lines: Line[]) => void; addLabel?: string }) {
  const { db } = useStore()
  const [areas, setAreas] = useState<Area[]>([{ id: uid('a'), label: 'Jardinera del frente', shape: 'rect', a: 30, b: 4 }])
  const [on, setOn] = useState<Record<string, boolean>>({ mulch: true })
  const [raw, setRaw] = useState<Record<string, string>>(Object.fromEntries(MATERIALS.map((m) => [m.key, String(m.param?.def ?? 0)])))
  const params = Object.fromEntries(
    MATERIALS.map((m) => {
      const v = Number(raw[m.key])
      return [m.key, m.param ? (raw[m.key] === '' || Number.isNaN(v) ? m.param.def : Math.min(m.param.max, Math.max(m.param.min, v))) : 0]
    }),
  )
  const [size, setSize] = useState<Size>('none')
  const [sizeOn, setSizeOn] = useState<Record<string, boolean>>({ p1: true })

  const setArea = (id: string, patch: Partial<Area>) => setAreas((xs) => xs.map((x) => (x.id === id ? { ...x, ...patch } : x)))
  const totals = areas.reduce((t, ar) => { const m = measure(ar); return { area: t.area + m.area, edge: t.edge + m.edge } }, { area: 0, edge: 0 })

  const lines: Line[] = MATERIALS.filter((m) => on[m.key]).flatMap((m) => {
    const item = db.prices.find((p) => p.id === m.priceId)
    const qty = m.qty(totals.area, totals.edge, params[m.key])
    return item && qty > 0 ? [{ ...lineFrom(item, qty), id: `calc-${m.key}`, desc: `${item.name} · ${Math.round(totals.area)} pie²${m.param && m.key !== 'edge' ? ` · ${params[m.key]} ${m.param.unit}` : ''}` }] : []
  })
  if (size !== 'none') {
    const { label, factor } = SIZES[size]
    for (const id of SIZE_SERVICES) {
      const item = db.prices.find((p) => p.id === id)
      if (!item || !sizeOn[id]) continue
      const round = (n: number) => Math.round(n * factor * 100) / 100
      lines.push({ ...lineFrom(item, 1), id: `calc-size-${id}`, desc: `${item.name} · propiedad ${label.toLowerCase()}`, price: Math.round(item.price * factor), cost: item.cost === undefined ? undefined : round(item.cost) })
    }
  }
  const total = subtotal(lines)
  const mg = margin(lines)

  return (
    <div className="calc">
      <div className="stack">
        <Card title="1. Medidas (en pies)" action={<Button small kind="plain" icon="plus" onClick={() => setAreas((xs) => [...xs, { id: uid('a'), label: `Área ${xs.length + 1}`, shape: 'rect', a: 10, b: 10 }])}>Otra área</Button>}>
          <div className="areas">
            {areas.map((ar) => {
              const m = measure(ar)
              return (
                <div key={ar.id} className="area">
                  <div className="area__top">
                    <input className="area__label" value={ar.label} onChange={(e) => setArea(ar.id, { label: e.target.value })} aria-label="Nombre del área" />
                    {areas.length > 1 ? <button type="button" className="icon-btn" aria-label={`Quitar ${ar.label}`} onClick={() => setAreas((xs) => xs.filter((x) => x.id !== ar.id))}><Icon name="trash" size={15} /></button> : null}
                  </div>
                  <Segmented label="Forma" value={ar.shape} onChange={(shape) => setArea(ar.id, { shape })} options={SHAPES} />
                  <div className="form__row">
                    <Field label={ar.shape === 'rect' ? 'Largo' : ar.shape === 'circle' ? 'Diámetro' : ar.shape === 'tri' ? 'Base' : 'Área (pies²)'}>
                      <input type="number" min={0} step="any" inputMode="decimal" value={ar.a} onChange={(e) => setArea(ar.id, { a: Math.max(0, Number(e.target.value)) })} />
                    </Field>
                    {ar.shape === 'rect' || ar.shape === 'tri' ? (
                      <Field label={ar.shape === 'rect' ? 'Ancho' : 'Altura'}>
                        <input type="number" min={0} step="any" inputMode="decimal" value={ar.b} onChange={(e) => setArea(ar.id, { b: Math.max(0, Number(e.target.value)) })} />
                      </Field>
                    ) : <span />}
                  </div>
                  <p className="area__res">{Math.round(m.area).toLocaleString('en-US')} pie² · perímetro ~{Math.round(m.edge)} pies</p>
                </div>
              )
            })}
          </div>
          <p className="calc__sum"><b>Total: {Math.round(totals.area).toLocaleString('en-US')} pie²</b> · perímetro ~{Math.round(totals.edge)} pies lineales</p>
        </Card>

        <Card title="2. Tamaño de la propiedad (opcional)">
          <p className="muted small">Agrega servicios por visita con precio según el tamaño del jardín.</p>
          <div className="mt">
            <Segmented label="Tamaño de la propiedad" value={size} onChange={setSize} options={[{ value: 'none', label: 'No agregar' }, { value: 'S', label: 'Pequeña' }, { value: 'M', label: 'Mediana' }, { value: 'L', label: 'Grande' }]} />
          </div>
          {size !== 'none' ? (
            <>
              <p className="area__res mt">{SIZES[size].lot} · precio {SIZES[size].factor === 1 ? 'base' : `× ${SIZES[size].factor}`}</p>
              <div className="mats mt">
                {SIZE_SERVICES.map((id) => {
                  const item = db.prices.find((p) => p.id === id)
                  if (!item) return null
                  return (
                    <div key={id} className={sizeOn[id] ? 'mat is-on' : 'mat'}>
                      <label className="check">
                        <input type="checkbox" checked={!!sizeOn[id]} onChange={(e) => setSizeOn({ ...sizeOn, [id]: e.target.checked })} />
                        <span><b>{item.name}</b><small> · {money(Math.round(item.price * SIZES[size].factor))} / {item.unit}</small></span>
                      </label>
                    </div>
                  )
                })}
              </div>
            </>
          ) : null}
        </Card>

        <Card title="3. Materiales (para el total de las áreas)">
          <div className="mats">
            {MATERIALS.map((m) => {
              const item = db.prices.find((p) => p.id === m.priceId)
              return (
                <div key={m.key} className={on[m.key] ? 'mat is-on' : 'mat'}>
                  <label className="check">
                    <input type="checkbox" checked={!!on[m.key]} onChange={(e) => setOn({ ...on, [m.key]: e.target.checked })} />
                    <span><b>{m.label}</b>{item ? <small> · {money(item.price)} / {item.unit}</small> : null}</span>
                  </label>
                  {on[m.key] && m.param ? (
                    <div className="mat__param">
                      <label>
                        {m.param.label}
                        <input type="number" min={m.param.min} max={m.param.max} value={raw[m.key]} onChange={(e) => setRaw({ ...raw, [m.key]: e.target.value })} onBlur={() => setRaw({ ...raw, [m.key]: String(params[m.key]) })} />
                        {m.param.unit}
                      </label>
                      <small>{m.hint}</small>
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      <Card title="4. Aproximado" className="calc__result">
        {lines.length ? (
          <>
            <ul className="calc__lines">
              {lines.map((l) => (
                <li key={l.id}>
                  <span>{l.desc}<small>{l.qty} {l.unit} × {money(l.price)}</small></span>
                  <b>{money(l.qty * l.price)}</b>
                </li>
              ))}
            </ul>
            <div className="calc__total">
              <small>Precio estimado</small>
              <b>{money0(total)}</b>
              <span>Rango para el cliente: {money0(total * 0.9)} – {money0(total * 1.15)}</span>
            </div>
            {mg ? <p className="muted small"><Icon name="trend" size={14} /> Margen estimado {mg.pct} % ({money(mg.profit)}), solo interno.</p> : null}
            <Button kind="primary" icon="plus" className="btn--block" onClick={() => onAdd(lines.map((l) => ({ ...l, id: uid('l') })))}>{addLabel}</Button>
            <p className="muted small">Cálculo aproximado con precios de la lista. Confirme medidas y acceso en la visita.</p>
          </>
        ) : (
          <p className="muted">Elija al menos un material o un tamaño de propiedad.</p>
        )}
      </Card>
    </div>
  )
}
