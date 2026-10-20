import type { ReactNode } from 'react'
import { photos, type PhotoKey, type Project } from '../content/images'
import { type SeasonSpan, type Service } from '../content/services'
import { business } from '../site.config'
import { href, photoSrc } from '../lib/url'
import { pagePath, s, servicePath, tr } from '../i18n'
import { tel, whatsappUrl } from './Chrome'
import { Icon } from './Icon'

/* ---------- Photo ---------- */

export function Photo({
  name,
  width = 1200,
  sizes = '100vw',
  priority = false,
  className,
  decorative = false,
}: {
  name: PhotoKey
  width?: number
  sizes?: string
  priority?: boolean
  className?: string
  /** true when a visible caption/title already says what the photo shows */
  decorative?: boolean
}) {
  const { src, srcSet, alt, ratio } = photoSrc(name, photos[name], width)
  const h = Math.round(width / ratio)
  return (
    <img
      className={className ? `photo ${className}` : 'photo'}
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={decorative ? '' : alt}
      width={width}
      height={h}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : undefined}
    />
  )
}

/* ---------- Project photos with a Before / During / After badge (Gallery, Home spotlight) ---------- */

export function ProjectPhotos({ items }: { items: Project['photos'] }) {
  const stages = s().gallery.stages
  return (
    <ul className={items.length === 1 ? 'gallery gallery--single' : 'gallery'}>
      {items.map(({ key, stage }) => (
        <li key={key} className="gallery__item">
          <figure>
            <Photo name={key} width={800} sizes="(min-width: 960px) 33vw, (min-width: 640px) 50vw, 100vw" />
            {stage ? <figcaption className={`stage stage--${stage}`}>{stages[stage]}</figcaption> : null}
          </figure>
        </li>
      ))}
    </ul>
  )
}

/* ---------- The sprinkler arc: the logo's water swirl, drawn across the hero ---------- */

export function SprinklerArc() {
  return (
    <svg className="arc" viewBox="0 0 1200 420" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path className="arc__outer" pathLength={1} d="M-40 300 C 220 120, 760 40, 1240 170" />
      <path className="arc__inner" pathLength={1} d="M-40 340 C 260 200, 760 120, 1240 230" />
      <g className="arc__drops">
        <circle cx="1040" cy="118" r="7" />
        <circle cx="1100" cy="150" r="5" />
        <circle cx="1150" cy="128" r="4" />
        <circle cx="990" cy="96" r="4" />
      </g>
    </svg>
  )
}

/* ---------- Section heading ---------- */

export function SectionHead({ title, intro, id }: { title: string; intro?: ReactNode; id?: string }) {
  return (
    <div className="section-head">
      <h2 id={id}>{title}</h2>
      {intro ? <p>{intro}</p> : null}
    </div>
  )
}

/* ---------- Breadcrumbs ---------- */

export function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  return (
    <nav className="crumbs" aria-label={s().breadcrumb}>
      <ol>
        {items.map((it, i) => (
          <li key={it.path}>
            {i < items.length - 1 ? (
              <a href={href(it.path)}>{it.name}</a>
            ) : (
              <span aria-current="page">{it.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

/* ---------- Page header for inner pages ---------- */

export function PageHeader({
  title,
  intro,
  crumbs,
  children,
}: {
  title: string
  intro?: ReactNode
  crumbs: { name: string; path: string }[]
  children?: ReactNode
}) {
  return (
    <section className="page-head">
      <div className="wrap">
        <Breadcrumbs items={crumbs} />
        <h1>{title}</h1>
        {intro ? <p className="lede">{intro}</p> : null}
        {children}
      </div>
    </section>
  )
}

/* ---------- Timing tip (service pages): year-round availability + best window ---------- */

function spanText(sp: SeasonSpan) {
  const t = s().timing
  if (sp.from === sp.to) return t.monthsLong[sp.from - 1]
  return `${t.monthsLong[sp.from - 1]} ${t.to} ${t.monthsLong[sp.to - 1]}`
}

export function TimingTip({ service }: { service: Service }) {
  const t = s().timing
  const peaks = service.season.filter((sp) => sp.peak)
  return (
    <aside className="timing" aria-label={t.title}>
      <span className="timing__icon"><Icon name="calendar" size={24} /></span>
      <div>
        <p className="timing__title">{t.title}</p>
        <p>{t.text}</p>
        {peaks.length ? (
          <p className="timing__best">
            <strong>{t.best}:</strong>{' '}
            {peaks.map((sp, i) => (
              <span key={i}>
                {i > 0 ? ' · ' : ''}
                {tr(sp.label)} ({spanText(sp)})
              </span>
            ))}
          </p>
        ) : null}
      </div>
    </aside>
  )
}

/* ---------- How it works (a real sequence, so numbered) ---------- */

export function Steps() {
  return (
    <ol className="steps">
      {s().steps.map((st, i) => (
        <li key={st.title} className="steps__item">
          <span className="steps__num" aria-hidden="true">{i + 1}</span>
          <h3>{st.title}</h3>
          <p>{st.text}</p>
        </li>
      ))}
    </ol>
  )
}

/* ---------- FAQ ---------- */

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  if (!items.length) return null
  return (
    <div className="faq">
      {items.map((f) => (
        <details key={f.q} className="faq__item">
          <summary>
            <span>{f.q}</span>
            <Icon name="plus" size={20} />
          </summary>
          <p>{f.a}</p>
        </details>
      ))}
    </div>
  )
}

/* ---------- Closing call to action (mowing-stripe band) ---------- */

export function CtaBand({ title, text }: { title?: string; text?: string }) {
  const t = s()
  const wa = whatsappUrl()
  return (
    <section className="cta-band" aria-labelledby="cta-title">
      <div className="wrap cta-band__inner">
        <div>
          <h2 id="cta-title">{title ?? t.cta.title}</h2>
          <p>{text ?? t.cta.text}</p>
        </div>
        <div className="cta-band__actions">
          <a className="btn btn--lime btn--lg" href={href(pagePath('estimate'))}>
            {t.getEstimate}
          </a>
          <a className="btn btn--ghost-light btn--lg" href={tel()}>
            <Icon name="phone" size={18} /> {business.phoneDisplay}
          </a>
          {wa ? (
            <a className="btn btn--ghost-light btn--lg btn--wa-light" href={wa} target="_blank" rel="noopener noreferrer">
              <Icon name="whatsapp" size={20} /> WhatsApp
            </a>
          ) : null}
        </div>
      </div>
    </section>
  )
}

/* ---------- Service card (Home, Services hub, related) ---------- */

export function ServiceTile({ sv, featured = false, headingLevel = 3 }: { sv: Service; featured?: boolean; headingLevel?: 2 | 3 }) {
  const H = headingLevel === 2 ? 'h2' : 'h3'
  return (
    <article className={`tile${featured ? ' tile--featured' : ''}`}>
      <div className="tile__media">
        <Photo
          name={sv.photo}
          width={featured ? 1200 : 800}
          decorative
          sizes={featured ? '(min-width: 960px) 50vw, 85vw' : '(min-width: 960px) 25vw, (min-width: 640px) 50vw, 85vw'}
        />
        <span className="tile__icon"><Icon name={sv.icon} /></span>
      </div>
      <div className="tile__body">
        <H className="tile__title">
          <a className="tile__link" href={href(servicePath(sv.slug))}>{tr(sv.name)}</a>
        </H>
        <p>{tr(sv.summary)}</p>
        {featured ? (
          <ul className="chips">
            {sv.items.slice(0, 6).map((i) => <li key={i.name.en}>{tr(i.name)}</li>)}
          </ul>
        ) : null}
        <span className="tile__more" aria-hidden="true">
          {s().service.see} <Icon name="arrow" size={18} />
        </span>
      </div>
    </article>
  )
}
