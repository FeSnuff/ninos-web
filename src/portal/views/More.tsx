import { useState } from 'react'
import { business } from '../../site.config'
import { invoiceStatus, uid, type ClientTag, type Unit } from '../data'
import { SITE_HOME } from '../env'
import { useStore } from '../store'
import { Badge, Button, Card, Empty, Field, Header, Icon, Row, Sheet, money } from '../ui'

/* ---------- "More" tab on phones ---------- */

export function More({ onOut }: { onOut: () => void }) {
  const { db, reset, toast } = useStore()
  const overdue = db.invoices.filter((i) => invoiceStatus(i) === 'Vencida').length
  const unsigned = db.contracts.filter((k) => k.status === 'Enviado').length
  return (
    <>
      <Header title="Más" />
      <div className="group">
        <Row href="#/contratos" lead={<span className="tile-icon tone-indigo"><Icon name="sign" size={17} /></span>} title="Contratos" trail={unsigned ? <Badge tone="blue">{unsigned} por firmar</Badge> : null} />
        <Row href="#/facturas" lead={<span className="tile-icon tone-green"><Icon name="card" size={17} /></span>} title="Facturas y pagos" trail={overdue ? <Badge tone="red">{overdue} vencidas</Badge> : null} />
        <Row href="#/mensajes" lead={<span className="tile-icon tone-blue"><Icon name="message" size={17} /></span>} title="Mensajes y plantillas" />
        <Row href="#/precios" lead={<span className="tile-icon tone-orange"><Icon name="list" size={17} /></span>} title="Lista de precios" />
      </div>
      <p className="group__label">Cuenta</p>
      <div className="group">
        <Row lead={<span className="avatar avatar--sm avatar--0">N</span>} title="Nino" sub={`Administrador · ${business.name}`} />
        <Row href={SITE_HOME} lead={<span className="tile-icon tone-gray"><Icon name="globe" size={17} /></span>} title="Ver sitio web" />
        <Row onClick={() => { reset(); toast('Datos de prueba restablecidos') }} lead={<span className="tile-icon tone-gray"><Icon name="repeat" size={17} /></span>} title="Restablecer datos de prueba" chevron={false} />
        <Row onClick={onOut} lead={<span className="tile-icon tone-red"><Icon name="logout" size={17} /></span>} title={<span className="txt-red">Cerrar sesión</span>} chevron={false} />
      </div>
    </>
  )
}

/* ---------- Messages: templates, bulk notices, sent log ---------- */

const TAGS: ('Todos' | ClientTag)[] = ['Todos', 'Recurrente', 'Riego', 'Comercial', 'Nuevo', 'VIP']

export function Messages() {
  const { db, update, log, toast } = useStore()
  const [editing, setEditing] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [bulk, setBulk] = useState(false)
  const [tpl, setTpl] = useState(db.templates[0]?.id ?? '')
  const [tag, setTag] = useState<'Todos' | ClientTag>('Riego')
  const to = db.clients.filter((c) => tag === 'Todos' || c.tags.includes(tag))
  const chosen = db.templates.find((t) => t.id === tpl)

  return (
    <>
      <Header title="Mensajes" sub="Plantillas para no escribir lo mismo cada día, y avisos a varios clientes a la vez." actions={<Button kind="primary" icon="send" onClick={() => setBulk(true)}>Aviso a varios clientes</Button>} />
      <div className="cols">
        <Card title="Plantillas" flush>
          <div className="group group--flat">
            {db.templates.map((t) =>
              editing === t.id ? (
                <div key={t.id} className="tpl-edit">
                  <b>{t.name}</b>
                  <textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} aria-label={`Texto de ${t.name}`} />
                  <div className="row-actions">
                    <Button small kind="plain" onClick={() => setEditing(null)}>Cancelar</Button>
                    <Button small kind="primary" onClick={() => { update((d) => { d.templates.find((x) => x.id === t.id)!.text = text }); setEditing(null); toast('Plantilla guardada') }}>Guardar</Button>
                  </div>
                </div>
              ) : (
                <Row key={t.id} onClick={() => { setEditing(t.id); setText(t.text) }} title={t.name} sub={t.text} trail={<Icon name="edit" size={16} />} chevron={false} />
              ),
            )}
          </div>
          <p className="card__foot muted small">Variables: {'{cliente}'}, {'{fecha}'}, {'{hora}'}, {'{numero}'}, {'{monto}'}, {'{link}'}</p>
        </Card>
        <Card title="Enviados" flush>
          {db.activity.length ? (
            <ul className="activity">
              {db.activity.map((a, i) => (
                <li key={i}>
                  <span className="tile-icon tile-icon--sm tone-blue"><Icon name="send" size={14} /></span>
                  <span>{a.text}<small>{new Date(a.at).toLocaleString('es-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' })}</small></span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty icon="inbox" title="Nada enviado todavía" text="Los avisos, recordatorios y cotizaciones enviados en esta sesión aparecen aquí." />
          )}
        </Card>
      </div>

      <Sheet open={bulk} onClose={() => setBulk(false)} title="Aviso a varios clientes" footer={<><Button kind="plain" onClick={() => setBulk(false)}>Cancelar</Button><Button kind="primary" icon="send" disabled={!to.length || !chosen} onClick={() => { log(`Aviso "${chosen?.name}" enviado a ${to.length} clientes (${tag.toLowerCase()})`, `Aviso enviado a ${to.length} clientes (simulado)`); setBulk(false) }}>Enviar a {to.length}</Button></>}>
        <div className="form">
          <Field label="Para">
            <select value={tag} onChange={(e) => setTag(e.target.value as typeof tag)}>
              {TAGS.map((x) => <option key={x} value={x}>{x === 'Todos' ? 'Todos los clientes' : `Clientes: ${x}`}</option>)}
            </select>
          </Field>
          <Field label="Plantilla">
            <select value={tpl} onChange={(e) => setTpl(e.target.value)}>
              {db.templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </Field>
          {chosen ? <div className="msg-preview"><small>Vista previa</small>{chosen.text.replace('{cliente}', to[0]?.name.split(' ')[0] ?? 'cliente')}</div> : null}
          <p className="muted small">{to.map((c) => c.name).join(', ') || 'Ningún cliente con esa etiqueta.'}</p>
          <p className="muted small">Cada cliente lo recibe por su medio preferido (texto, WhatsApp o email). Simulado.</p>
        </div>
      </Sheet>
    </>
  )
}

/* ---------- Price book ---------- */

const UNITS: Unit[] = ['visita', 'servicio', 'yd³', 'pie²', 'pie lin.', 'hora', 'c/u']

export function PriceBook() {
  const { db, update, toast } = useStore()
  const [adding, setAdding] = useState(false)
  const [f, setF] = useState({ name: '', group: 'Césped', unit: 'servicio' as Unit, price: '' })
  const groups = [...new Set(db.prices.map((p) => p.group))]
  const setPrice = (id: string, price: number) => update((d) => { d.prices.find((p) => p.id === id)!.price = price })
  return (
    <>
      <Header title="Lista de precios" sub="Los precios que usa para cotizar. Cambiarlos aquí no altera cotizaciones ya enviadas." actions={<Button kind="primary" icon="plus" onClick={() => setAdding(true)}>Agregar</Button>} />
      <p className="notice-soft"><Icon name="alert" size={16} /> Precios de ejemplo para la demostración: ajústelos a sus costos reales.</p>
      <div className="price-groups">
        {groups.map((g) => (
          <Card key={g} title={g} flush>
            <div className="group group--flat">
              {db.prices.filter((p) => p.group === g).map((p) => (
                <div key={p.id} className="row">
                  <span className="row__main">
                    <span className="row__title">{p.name}</span>
                    <span className="row__sub">por {p.unit}</span>
                  </span>
                  <label className="price-input">
                    <span aria-hidden="true">$</span>
                    <input type="number" min={0} step="0.01" defaultValue={p.price} aria-label={`Precio de ${p.name}`} onBlur={(e) => { if (e.target.value === '') { e.target.value = String(p.price); return } const v = Number(e.target.value); if (v !== p.price) { setPrice(p.id, v); toast(`Precio actualizado: ${money(v)}`) } }} />
                  </label>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
      <Sheet open={adding} onClose={() => setAdding(false)} title="Nuevo servicio o material" footer={<><Button kind="plain" onClick={() => setAdding(false)}>Cancelar</Button><Button kind="primary" type="submit" form="new-price">Agregar</Button></>}>
        <form id="new-price" className="form" onSubmit={(e) => { e.preventDefault(); const id = uid('p'); update((d) => { d.prices.push({ id, name: f.name, group: f.group, unit: f.unit, price: Number(f.price) }) }); toast('Agregado a la lista'); setAdding(false); setF({ ...f, name: '', price: '' }) }}>
          <Field label="Nombre"><input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
          <div className="form__row">
            <Field label="Grupo">
              <select value={f.group} onChange={(e) => setF({ ...f, group: e.target.value })}>
                {groups.map((g) => <option key={g}>{g}</option>)}
              </select>
            </Field>
            <Field label="Unidad">
              <select value={f.unit} onChange={(e) => setF({ ...f, unit: e.target.value as Unit })}>
                {UNITS.map((u) => <option key={u}>{u}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Precio ($)"><input required type="number" min={0} step="0.01" inputMode="decimal" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} /></Field>
        </form>
      </Sheet>
    </>
  )
}
