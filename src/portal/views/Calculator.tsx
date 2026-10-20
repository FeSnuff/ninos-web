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
  { value: 'sqft', label: 'Pies²' },
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

export function AreaCalculator({ onAdd, addLabel = 'Agregar a la cotización' }: { onAdd: (lines: Line[]) => void; addLabel?: string }) {
  const { db } = useStore()
  const [areas, setAreas] = useState<Area[]>([{ id: uid('a'), label: 'Jardinera del frente', shape: 'rect', a: 30, b: 4 }])
  const [on, setOn] = useState<Record<string, boolean>>({ mulch: true })
  const [params, setParams] = useState<Record<string, number>>(Object.fromEntries(MATERIALS.map((m) => [m.key, m.param?.def ?? 0])))

  const setArea = (id: string, patch: Partial<Area>) => setAreas((xs) => xs.map((x) => (x.id === id ? { ...x, ...patch } : x)))
  const totals = areas.reduce((t, ar) => { const m = measure(ar); return { area: t.area + m.area, edge: t.edge + m.edge } }, { area: 0, edge: 0 })

  const lines: Line[] = MATERIALS.filter((m) => on[m.key]).flatMap((m) => {
    const item = db.prices.find((p) => p.id === m.priceId)
    const qty = m.qty(totals.area, totals.edge, params[m.key])
    return item && qty > 0 ? [{ ...lineFrom(item, qty), desc: `${item.name} · ${Math.round(totals.area)} pie²${m.param && m.key !== 'edge' ? ` · ${params[m.key]} ${m.param.unit}` : ''}` }] : []
  })
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

        <Card title="2. Materiales y servicio">
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
                        <input type="number" min={m.param.min} max={m.param.max} value={params[m.key]} onChange={(e) => setParams({ ...params, [m.key]: Math.min(m.param!.max, Math.max(m.param!.min, Number(e.target.value))) })} />
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

      <Card title="3. Aproximado" className="calc__result">
        {lines.length ? (
          <>
            <ul className="calc__lines">
              {lines.map((l) => (
                <li key={l.id}>
                  <span>{l.desc.split(' · ')[0]}<small>{l.qty} {l.unit} × {money(l.price)}</small></span>
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
          <p className="muted">Elija al menos un material.</p>
        )}
      </Card>
    </div>
  )
}
