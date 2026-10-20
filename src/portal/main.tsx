/**
 * Staff portal (demo). A small React app mounted on /portal/.
 * DEMO ONLY: the login is checked in the browser and the data is invented and kept in memory.
 * Before real use it needs a real backend (e.g. Supabase auth + database with RLS). See PLAN-SITIO-WEB.md §6.
 */
import { StrictMode, useState, type FormEvent } from 'react'
import { createRoot } from 'react-dom/client'
import { invoiceStatus } from './data'
import { LOGO, SITE_HOME } from './env'
import { StoreProvider, go, useRoute, useStore } from './store'
import { Button, Icon, Sheet, type IconName } from './ui'
import { Today } from './views/Today'
import { CalendarView } from './views/Calendar'
import { ClientDetail, Clients } from './views/Clients'
import { CalculatorPage, QuoteEditor, Quotes } from './views/Quotes'
import { ContractDetail, Contracts } from './views/Contracts'
import { InvoiceDetail, Invoices } from './views/Invoices'
import { Messages, More, PriceBook } from './views/More'

const root = document.getElementById('app')!

/* ---------- Login (demo credentials) ---------- */

const DEMO_USER = 'admin'
const DEMO_PASS = '12345'
const KEY = 'ninos-portal-session'

const readSession = () => {
  try {
    return sessionStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

function Login({ onIn }: { onIn: () => void }) {
  // demo: credentials come filled in so testers only press "Entrar"
  const [user, setUser] = useState(DEMO_USER)
  const [pass, setPass] = useState(DEMO_PASS)
  const [error, setError] = useState('')
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (user.trim().toLowerCase() === DEMO_USER && pass === DEMO_PASS) {
      try {
        sessionStorage.setItem(KEY, '1')
      } catch {
        /* private mode: stay logged in until reload */
      }
      onIn()
    } else setError('Usuario o contraseña incorrectos.')
  }
  return (
    <main className="login">
      <form className="login__card" onSubmit={submit} noValidate>
        <img className="login__logo" src={LOGO} alt="" width={64} height={64} />
        <h1>Portal del equipo</h1>
        <p className="login__sub">Nino’s Landscaping · acceso solo para personal</p>
        <label className="field">
          <span className="field__label">Usuario</span>
          <input autoComplete="username" value={user} onChange={(e) => setUser(e.target.value)} />
        </label>
        <label className="field">
          <span className="field__label">Contraseña</span>
          <input type="password" autoComplete="current-password" value={pass} onChange={(e) => setPass(e.target.value)} />
        </label>
        {error ? <p className="login__error" role="alert"><Icon name="alert" size={16} /> {error}</p> : null}
        <Button kind="primary" type="submit" className="btn--block" autoFocus>Entrar</Button>
        <p className="login__demo"><Icon name="lock" size={14} /> Demostración: los datos ya vienen puestos, solo presione Entrar</p>
        <a className="login__site" href={SITE_HOME}>← Volver al sitio</a>
      </form>
    </main>
  )
}

/* ---------- App shell ---------- */

type Nav = { path: string; label: string; icon: IconName; tab?: boolean }
const NAV: Nav[] = [
  { path: 'hoy', label: 'Hoy', icon: 'home', tab: true },
  { path: 'calendario', label: 'Calendario', icon: 'calendar', tab: true },
  { path: 'clientes', label: 'Clientes', icon: 'users', tab: true },
  { path: 'cotizaciones', label: 'Cotizaciones', icon: 'quote', tab: true },
  { path: 'calculadora', label: 'Calculadora por área', icon: 'ruler' },
  { path: 'contratos', label: 'Contratos', icon: 'sign' },
  { path: 'facturas', label: 'Facturas y pagos', icon: 'card' },
  { path: 'mensajes', label: 'Mensajes', icon: 'message' },
  { path: 'precios', label: 'Lista de precios', icon: 'list' },
]

function QuickAdd({ open, onClose }: { open: boolean; onClose: () => void }) {
  const items: [string, string, IconName][] = [
    ['Nuevo cliente', '/clientes?nuevo=1', 'user'],
    ['Nueva cotización', '/cotizaciones/nueva', 'quote'],
    ['Nuevo evento o visita', '/calendario?nuevo=1', 'calendar'],
    ['Nueva factura', '/facturas?nueva=1', 'card'],
  ]
  return (
    <Sheet open={open} onClose={onClose} title="Crear">
      <div className="group">
        {items.map(([label, path, icon]) => (
          <button key={path} type="button" className="row" onClick={() => { onClose(); go(path) }}>
            <span className="row__lead"><span className="tile-icon"><Icon name={icon} size={18} /></span></span>
            <span className="row__main"><span className="row__title">{label}</span></span>
            <Icon name="chevR" size={16} className="row__chev" />
          </button>
        ))}
      </div>
    </Sheet>
  )
}

function Shell({ onOut }: { onOut: () => void }) {
  const { parts, query } = useRoute()
  const { db, reset, toast, version } = useStore()
  const [adding, setAdding] = useState(false)
  const section = parts[0] ?? 'hoy'
  const id = parts[1]
  const isActive = (p: string) => section === p || (p === 'mas' && !NAV.some((n) => n.tab && n.path === section))

  let view
  switch (section) {
    case 'calendario': view = <CalendarView key={query.get('dia') ?? ''} query={query} />; break
    // key = id so each record opens with fresh local state
    case 'clientes': view = id ? <ClientDetail key={id} id={id} /> : <Clients query={query} />; break
    case 'cotizaciones': view = id ? <QuoteEditor key={id} id={id} query={query} /> : <Quotes />; break
    case 'contratos': view = id ? <ContractDetail key={id} id={id} /> : <Contracts />; break
    case 'facturas': view = id ? <InvoiceDetail key={id} id={id} /> : <Invoices query={query} />; break
    case 'mensajes': view = <Messages />; break
    case 'precios': view = <PriceBook />; break
    case 'calculadora': view = <CalculatorPage />; break
    case 'mas': view = <More onOut={onOut} />; break
    default: view = <Today />
  }

  const overdue = db.invoices.filter((i) => invoiceStatus(i) === 'Vencida').length

  return (
    <div className="app">
      <aside className="side" aria-label="Menú del portal">
        <a className="side__brand" href="#/hoy">
          <img src={LOGO} alt="" width={34} height={34} />
          <span>
            <b>Nino’s</b>
            <small>Portal del equipo</small>
          </span>
        </a>
        <Button kind="primary" icon="plus" className="btn--block side__new" onClick={() => setAdding(true)}>Crear</Button>
        <nav>
          <ul>
            {NAV.map((n) => (
              <li key={n.path}>
                <a href={`#/${n.path}`} className={isActive(n.path) ? 'side__link is-on' : 'side__link'} aria-current={isActive(n.path) ? 'page' : undefined}>
                  <Icon name={n.icon} size={19} />
                  {n.label}
                  {n.path === 'facturas' && overdue ? <span className="side__count" aria-label={`${overdue} vencidas`}>{overdue}</span> : null}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="side__foot">
          <a className="side__link" href={SITE_HOME}><Icon name="globe" size={19} /> Ver sitio web</a>
          <button type="button" className="side__link" onClick={() => window.confirm('¿Restablecer todos los datos de prueba? Se pierden los cambios de esta sesión.') && (reset(), toast('Datos de prueba restablecidos'))}><Icon name="repeat" size={19} /> Restablecer demo</button>
          <button type="button" className="side__link" onClick={onOut}><Icon name="logout" size={19} /> Cerrar sesión</button>
          <div className="side__user">
            <span className="avatar avatar--sm avatar--0">N</span>
            <span><b>Nino</b><small>Administrador</small></span>
          </div>
        </div>
      </aside>

      <div className="app-main">
        <div className="demo-bar" role="note">
          <Icon name="alert" size={15} /> Demostración: datos inventados que se borran al recargar. Los envíos y pagos son simulados.
        </div>
        <main className="content" id="content" key={version}>{view}</main>
      </div>

      <nav className="tabbar" aria-label="Navegación">
        {NAV.filter((n) => n.tab).map((n) => (
          <a key={n.path} href={`#/${n.path}`} className={isActive(n.path) ? 'tab is-on' : 'tab'} aria-current={isActive(n.path) ? 'page' : undefined}>
            <Icon name={n.icon} size={23} />
            <span>{n.label === 'Cotizaciones' ? 'Cotizar' : n.label}</span>
          </a>
        ))}
        <a href="#/mas" className={isActive('mas') ? 'tab is-on' : 'tab'}>
          <Icon name="more" size={23} />
          <span>Más</span>
        </a>
      </nav>
      <button type="button" className="fab" onClick={() => setAdding(true)} aria-label="Crear">
        <Icon name="plus" size={24} />
      </button>
      <QuickAdd open={adding} onClose={() => setAdding(false)} />
    </div>
  )
}

function App() {
  const [inside, setInside] = useState(readSession)
  const out = () => {
    try {
      sessionStorage.removeItem(KEY)
    } catch {
      /* ignore */
    }
    setInside(false)
    history.replaceState(null, '', location.pathname)
  }
  if (!inside) return <Login onIn={() => setInside(true)} />
  return (
    <StoreProvider>
      <Shell onOut={out} />
    </StoreProvider>
  )
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
