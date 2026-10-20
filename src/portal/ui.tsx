import { useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { daysBetween, iso, parse, today, type EventType } from './data'

/* ---------- Icons (line icons, 24×24, stroke = currentColor) ---------- */

const I = {
  home: <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  calendar: <><rect x="3" y="4" width="18" height="17" rx="3" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" /></>,
  quote: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" /></>,
  sign: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></>,
  card: <><rect x="2" y="5" width="20" height="14" rx="3" /><path d="M2 10h20M6 15h4" /></>,
  more: <path d="M5 12h.01M12 12h.01M19 12h.01" strokeWidth="3" />,
  plus: <path d="M12 5v14M5 12h14" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>,
  chevR: <path d="m9 18 6-6-6-6" />,
  chevL: <path d="m15 18-6-6 6-6" />,
  phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />,
  message: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  mail: <><rect x="2" y="4" width="20" height="16" rx="3" /><path d="m22 7-10 6L2 7" /></>,
  pin: <><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" /></>,
  check: <path d="M20 6 9 17l-5-5" />,
  clock: <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>,
  rain: <path d="M4 14.9A7 7 0 1 1 15.7 8h1.8a4.5 4.5 0 0 1 2.5 8.2M16 14v6M8 14v6M12 16v6" />,
  bell: <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0" />,
  truck: <><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2M15 18H9M19 18h2a1 1 0 0 0 1-1v-3.7a1 1 0 0 0-.2-.6l-3.5-4.4A1 1 0 0 0 17.5 8H14" /><circle cx="17" cy="18" r="2" /><circle cx="7" cy="18" r="2" /></>,
  leaf: <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10ZM2 21c0-3 1.9-5.4 5.1-6" />,
  drop: <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5S5 13 5 15a7 7 0 0 0 7 7z" />,
  sliders: <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />,
  logout: <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />,
  x: <path d="M18 6 6 18M6 6l12 12" />,
  send: <path d="m22 2-7 20-4-9-9-4zM22 2 11 13" />,
  dollar: <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />,
  alert: <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h16.9a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01" />,
  repeat: <path d="m17 2 4 4-4 4M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v1a4 4 0 0 1-4 4H3" />,
  edit: <path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />,
  trash: <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />,
  eye: <><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></>,
  printer: <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z" />,
  link: <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />,
  globe: <><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z" /></>,
  list: <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />,
  lock: <><rect x="3" y="11" width="18" height="11" rx="3" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>,
  arrow: <path d="M5 12h14M12 5l7 7-7 7" />,
  trend: <path d="M22 7 13.5 15.5l-5-5L2 17M16 7h6v6" />,
  inbox: <path d="M22 12h-6l-2 3h-4l-2-3H2M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.1z" />,
  ruler: <path d="M21.3 8.7 8.7 21.3a1 1 0 0 1-1.4 0l-4.6-4.6a1 1 0 0 1 0-1.4L15.3 2.7a1 1 0 0 1 1.4 0l4.6 4.6a1 1 0 0 1 0 1.4zM7.5 10.5l2 2M10.5 7.5l2 2M13.5 4.5l2 2M4.5 13.5l2 2" />,
  box: <path d="M21 8 12 3 3 8v8l9 5 9-5zM3 8l9 5 9-5M12 13v8" />,
  shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4" />,
}
export type IconName = keyof typeof I

export function Icon({ name, size = 20, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg
      className={className ? `ic ${className}` : 'ic'}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {I[name]}
    </svg>
  )
}

/* ---------- Formatting ---------- */

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const usd0 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
export const money = (n: number) => usd.format(n)
export const money0 = (n: number) => usd0.format(n)

export const fmtDate = (s: string, o: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' }) =>
  parse(s).toLocaleDateString('es-US', o).replace(/\./g, '')
export const fmtLong = (s: string) => fmtDate(s, { weekday: 'long', day: 'numeric', month: 'long' })
export const fmtFull = (s: string) => fmtDate(s, { day: 'numeric', month: 'long', year: 'numeric' })

/** "hoy", "mañana", "hace 3 días", "en 5 días" */
export function rel(s: string) {
  const n = daysBetween(iso(today()), s)
  if (n === 0) return 'hoy'
  if (n === 1) return 'mañana'
  if (n === -1) return 'ayer'
  return n > 0 ? `en ${n} días` : `hace ${-n} días`
}

export const fmtTime = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'pm' : 'am'
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${ampm}`
}

export const initials = (name: string) =>
  name
    .replace(/\b(y|and|de)\b/gi, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

/* ---------- Status colors ---------- */

const TONE: Record<string, string> = {
  Borrador: 'gray', Enviada: 'blue', Enviado: 'blue', Vista: 'indigo', Aprobada: 'green', Rechazada: 'red', Firmado: 'green',
  Pagada: 'green', Parcial: 'orange', Vencida: 'red', Pendiente: 'blue',
  Programado: 'gray', 'En camino': 'blue', Completado: 'green', Reprogramado: 'orange',
}
export const TYPE_TONE: Record<EventType, string> = {
  Mantenimiento: 'green', Proyecto: 'orange', Estimado: 'blue', Riego: 'teal', Interno: 'gray',
}

export function Badge({ children, tone }: { children: ReactNode; tone?: string }) {
  const t = tone ?? (typeof children === 'string' ? TONE[children] : undefined) ?? 'gray'
  return <span className={`badge badge--${t}`}>{children}</span>
}

/* ---------- Building blocks ---------- */

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  kind?: 'primary' | 'secondary' | 'plain' | 'danger'
  icon?: IconName
  small?: boolean
}
export function Button({ kind = 'secondary', icon, small, className, children, type = 'button', ...rest }: BtnProps) {
  return (
    <button type={type} className={`btn btn--${kind}${small ? ' btn--sm' : ''}${className ? ' ' + className : ''}`} {...rest}>
      {icon ? <Icon name={icon} size={small ? 16 : 18} /> : null}
      {children}
    </button>
  )
}

export function LinkButton({ href, kind = 'secondary', icon, small, children, external }: { href: string; kind?: BtnProps['kind']; icon?: IconName; small?: boolean; children: ReactNode; external?: boolean }) {
  return (
    <a className={`btn btn--${kind}${small ? ' btn--sm' : ''}`} href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
      {icon ? <Icon name={icon} size={small ? 16 : 18} /> : null}
      {children}
    </a>
  )
}

/** Large iOS-style page title with optional actions on the right */
export function Header({ title, sub, back, actions }: { title: string; sub?: ReactNode; back?: { href: string; label: string }; actions?: ReactNode }) {
  return (
    <header className="ph">
      {back ? (
        <a className="ph__back" href={back.href}>
          <Icon name="chevL" size={18} /> {back.label}
        </a>
      ) : null}
      <div className="ph__row">
        <div className="ph__text">
          <h1>{title}</h1>
          {sub ? <p className="ph__sub">{sub}</p> : null}
        </div>
        {actions ? <div className="ph__actions">{actions}</div> : null}
      </div>
    </header>
  )
}

export function Card({ title, action, children, className, flush }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; flush?: boolean }) {
  return (
    <section className={`card${flush ? ' card--flush' : ''}${className ? ' ' + className : ''}`}>
      {title || action ? (
        <div className="card__head">
          {title ? <h2 className="card__title">{title}</h2> : <span />}
          {action}
        </div>
      ) : null}
      {children}
    </section>
  )
}

export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  // stable soft color per name
  const hue = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 6
  return (
    <span className={`avatar avatar--${hue}${size <= 32 ? ' avatar--sm' : size >= 56 ? ' avatar--lg' : ''}`} aria-hidden="true">
      {initials(name)}
    </span>
  )
}

export function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: { value: T; label: string; count?: number }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div className="seg" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={o.value === value} className={o.value === value ? 'seg__btn is-on' : 'seg__btn'} onClick={() => onChange(o.value)}>
          {o.label}
          {o.count !== undefined ? <span className="seg__count">{o.count}</span> : null}
        </button>
      ))}
    </div>
  )
}

export function Empty({ icon, title, text, action }: { icon: IconName; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="empty">
      <span className="empty__icon"><Icon name={icon} size={26} /></span>
      <p className="empty__title">{title}</p>
      {text ? <p className="empty__text">{text}</p> : null}
      {action}
    </div>
  )
}

export function Stat({ label, value, sub, tone, icon }: { label: string; value: string; sub?: ReactNode; tone?: string; icon: IconName }) {
  return (
    <div className={`stat${tone ? ' stat--' + tone : ''}`}>
      <span className="stat__icon"><Icon name={icon} size={18} /></span>
      <p className="stat__label">{label}</p>
      <p className="stat__value">{value}</p>
      {sub ? <p className="stat__sub">{sub}</p> : null}
    </div>
  )
}

/* ---------- Sheet: native <dialog> (focus trap, Esc to close, backdrop) ---------- */

export function Sheet({ open, onClose, title, children, footer, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null)
  const downOnBackdrop = useRef(false)
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])
  return (
    <dialog
      ref={ref}
      className={wide ? 'sheet sheet--wide' : 'sheet'}
      onClose={onClose}
      onPointerDown={(e) => {
        downOnBackdrop.current = e.target === ref.current
      }}
      onClick={(e) => {
        // a text selection that ends outside the box must not close the form
        if (e.target === ref.current && downOnBackdrop.current) onClose()
      }}
      aria-label={title}
    >
      {open ? (
        <div className="sheet__inner">
          <div className="sheet__head">
            <h2>{title}</h2>
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Cerrar">
              <Icon name="x" size={18} />
            </button>
          </div>
          <div className="sheet__body">{children}</div>
          {footer ? <div className="sheet__foot">{footer}</div> : null}
        </div>
      ) : null}
    </dialog>
  )
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      {children}
      {hint ? <span className="field__hint">{hint}</span> : null}
    </label>
  )
}

/** A row in an iOS-style grouped list. Renders a link when href is given. */
export function Row({ href, onClick, lead, title, sub, trail, chevron = true }: { href?: string; onClick?: () => void; lead?: ReactNode; title: ReactNode; sub?: ReactNode; trail?: ReactNode; chevron?: boolean }) {
  const inner = (
    <>
      {lead ? <span className="row__lead">{lead}</span> : null}
      <span className="row__main">
        <span className="row__title">{title}</span>
        {sub ? <span className="row__sub">{sub}</span> : null}
      </span>
      {trail ? <span className="row__trail">{trail}</span> : null}
      {(href || onClick) && chevron ? <Icon name="chevR" size={16} className="row__chev" /> : null}
    </>
  )
  if (href)
    return (
      <a className="row" href={href}>
        {inner}
      </a>
    )
  if (onClick)
    return (
      <button type="button" className="row" onClick={onClick}>
        {inner}
      </button>
    )
  return <div className="row">{inner}</div>
}
