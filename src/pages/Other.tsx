import { business, serviceAreas } from '../site.config'
import { photos, projects } from '../content/images'
import { activeServices } from '../content/services'
import { href, photoManifest } from '../lib/url'
import { pagePath, s, servicePath, tr } from '../i18n'
import { CtaBand, PageHeader, Photo, ProjectPhotos, SectionHead, Steps } from '../components/Blocks'
import { EstimateForm } from '../components/EstimateForm'
import { sms, tel, whatsappUrl } from '../components/Chrome'
import { Icon } from '../components/Icon'

const homeCrumb = () => ({ name: s().home, path: pagePath('home') })

/* ---------- Service areas ---------- */

export function ServiceAreas() {
  const t = s()
  return (
    <>
      <PageHeader
        title={t.areasPage.title}
        intro={t.areasPage.intro}
        crumbs={[homeCrumb(), { name: t.nav.areas, path: pagePath('areas') }]}
      />
      <section className="section section--flush-top">
        <div className="wrap">
          <ul className="areas areas--large">
            {serviceAreas.map((a) => (
              <li key={a.county.en} className="areas__item">
                <h2>
                  <Icon name="pin" size={20} /> {tr(a.county)}
                </h2>
                <ul className="chips">
                  {a.towns.map((town) => <li key={town}>{town}</li>)}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <CtaBand title={t.areasPage.ctaTitle} text={t.areasPage.ctaText} />
    </>
  )
}

/* ---------- Gallery ---------- */

export function Gallery() {
  const t = s()
  // a project only shows while its service is offered on the site
  const shown = projects.flatMap((pr) => {
    const sv = activeServices.find((a) => a.slug.en === pr.service)
    return sv ? [{ pr, sv }] : []
  })
  return (
    <>
      <PageHeader title={t.gallery.title} intro={t.gallery.intro} crumbs={[homeCrumb(), { name: t.nav.gallery, path: pagePath('gallery') }]} />
      <section className="section section--flush-top">
        <div className="wrap projects">
          {shown.map(({ pr, sv }) => (
            <article key={pr.id} className="project" aria-labelledby={`project-${pr.id}`}>
              <div className="project__head">
                <h2 id={`project-${pr.id}`}>{tr(pr.title)}</h2>
                <p>{tr(pr.text)}</p>
                <a className="project__link" href={href(servicePath(sv.slug))}>
                  {t.gallery.viewService}: {tr(sv.name)} <Icon name="arrow" size={18} />
                </a>
              </div>
              <ProjectPhotos items={pr.photos} />
            </article>
          ))}
        </div>
      </section>
      <CtaBand />
    </>
  )
}

/* ---------- About ---------- */

export function About() {
  const t = s()
  const lic = business.license
  const licenseText = [
    lic.dporNumber ? t.about.license(lic.dporClass, lic.dporNumber, lic.specialties.join(', ')) : '',
    lic.insured ? t.about.insured : '',
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <>
      <PageHeader title={t.about.title} intro={t.about.intro} crumbs={[homeCrumb(), { name: t.nav.about, path: pagePath('about') }]} />
      <section className="section section--flush-top">
        <div className="wrap split">
          <div className="split__text prose">
            {/* TODO: replace with Nino's real story (how he started, years in business, team). */}
            <p>{t.about.p1}</p>
            <p>{t.about.p2}</p>
            <h2>{t.about.expectTitle}</h2>
            <ul className="ticks">
              {t.about.expect.map((e) => (
                <li key={e}>
                  <Icon name="check" /> {e}
                </li>
              ))}
            </ul>
            {licenseText ? (
              <>
                <h2>{t.about.licensedTitle}</h2>
                <p>{licenseText}</p>
              </>
            ) : null}
          </div>
          <div className="split__media">
            <Photo name="aerationCrew" width={1000} sizes="(min-width: 960px) 45vw, 100vw" className="rounded-tall" />
          </div>
        </div>
      </section>
      <section className="section section--tint">
        <div className="wrap">
          <SectionHead title={t.how.titleAbout} />
          <Steps />
        </div>
      </section>
      <CtaBand />
    </>
  )
}

/* ---------- Free estimate ---------- */

export function FreeEstimate() {
  const t = s()
  const wa = whatsappUrl()
  return (
    <>
      <PageHeader
        title={t.estimatePage.title}
        intro={t.estimatePage.intro}
        crumbs={[homeCrumb(), { name: t.freeEstimate, path: pagePath('estimate') }]}
      />
      <section className="section section--flush-top">
        <div className="wrap form-layout">
          <div className="form-card">
            <EstimateForm />
          </div>
          <aside className="form-aside" aria-label={t.estimatePage.asideLabel}>
            <h2>{t.estimatePage.asideTitle}</h2>
            <p>{t.estimatePage.asideText}</p>
            <ul className="contact-list">
              <li><a href={tel()}><Icon name="phone" /> {business.phoneDisplay}</a></li>
              {wa ? <li><a href={wa} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp" /> WhatsApp</a></li> : null}
              <li><a href={sms()}><Icon name="message" /> {t.form.sendText}</a></li>
              <li><Icon name="clock" /> {tr(business.hours[0].label)}</li>
            </ul>
            <Photo name="brickBeds" width={800} sizes="(min-width: 960px) 30vw, 100vw" className="rounded hide-sm" />
          </aside>
        </div>
      </section>
    </>
  )
}

/* ---------- Contact ---------- */

export function Contact() {
  const t = s()
  const c = t.contactPage
  const wa = whatsappUrl()
  return (
    <>
      <PageHeader title={c.title} intro={c.intro} crumbs={[homeCrumb(), { name: t.nav.contact, path: pagePath('contact') }]} />
      <section className="section section--flush-top">
        <div className="wrap contact-grid">
          <a className="contact-card" href={tel()}>
            <Icon name="phone" size={28} />
            <h2>{c.callTitle}</h2>
            <p>{business.phoneDisplay}</p>
          </a>
          {wa ? (
            <a className="contact-card contact-card--wa" href={wa} target="_blank" rel="noopener noreferrer">
              <Icon name="whatsapp" size={28} />
              <h2>WhatsApp</h2>
              <p>{c.waSub}</p>
            </a>
          ) : null}
          <a className="contact-card" href={sms()}>
            <Icon name="message" size={28} />
            <h2>{c.textTitle}</h2>
            <p>{c.textSub}</p>
          </a>
          {business.email ? (
            <a className="contact-card" href={`mailto:${business.email}`}>
              <Icon name="mail" size={28} />
              <h2>{c.emailTitle}</h2>
              <p>{business.email}</p>
            </a>
          ) : null}
          <a className="contact-card contact-card--accent" href={href(pagePath('estimate'))}>
            <Icon name="clipboard" size={28} />
            <h2>{c.formTitle}</h2>
            <p>{c.formSub}</p>
          </a>
        </div>
        <div className="wrap contact-meta">
          <p><Icon name="clock" /> {tr(business.hours[0].label)}</p>
          <p><Icon name="pin" /> {c.serving}</p>
        </div>
      </section>
    </>
  )
}

/* ---------- Thanks (not indexed) ---------- */

export function Thanks() {
  const t = s()
  return (
    <section className="section center-page">
      <div className="wrap narrow">
        <span className="big-check"><Icon name="check" size={40} /></span>
        <h1>{t.thanks.title}</h1>
        <p className="lede">{t.thanks.text(business.phoneDisplay)}</p>
        <p>
          <a className="btn btn--primary" href={href(pagePath('home'))}>{t.thanks.back}</a>
        </p>
      </div>
    </section>
  )
}

/* ---------- 404 (one page for both languages) ---------- */

export function NotFound() {
  return (
    <section className="section center-page">
      <div className="wrap narrow">
        <h1>This page isn't here</h1>
        <p className="lede">The link may be old or mistyped. These pages can help:</p>
        <p className="center-page__actions">
          <a className="btn btn--primary" href={href('/')}>Home</a>
          <a className="btn btn--outline" href={href('/services/')}>Services</a>
          <a className="btn btn--outline" href={href('/free-estimate/')}>Free estimate</a>
        </p>
        <div lang="es" className="center-page__alt">
          <h2>Esta página no existe</h2>
          <p className="lede">Puede que el enlace sea viejo o tenga un error.</p>
          <p className="center-page__actions">
            <a className="btn btn--primary" href={href('/es/')}>Inicio</a>
            <a className="btn btn--outline" href={href('/es/servicios/')}>Servicios</a>
            <a className="btn btn--outline" href={href('/es/estimado-gratis/')}>Estimado gratis</a>
          </p>
        </div>
      </div>
    </section>
  )
}

/* ---------- Privacy ---------- */

/** Update this date whenever the policy text changes. */
const PRIVACY_UPDATED = { en: 'October 2026', es: 'octubre de 2026' }

export function Privacy() {
  const t = s()
  const usesUnsplash = Object.keys(photos).some((k) => !photoManifest[k])
  const p = t.privacyPage
  return (
    <>
      <PageHeader title={p.title} intro={p.intro} crumbs={[homeCrumb(), { name: t.privacy, path: pagePath('privacy') }]} />
      <section className="section section--flush-top">
        <div className="wrap narrow prose">
          <p>
            <em>
              {p.updated}: {tr(PRIVACY_UPDATED)}
            </em>
          </p>
          {p.sections.map(([h, body]) => (
            <div key={h}>
              <h2>{h}</h2>
              <p>{body.replace('{unsplash}', usesUnsplash ? p.unsplash : '')}</p>
            </div>
          ))}
          <h2>{p.choicesTitle}</h2>
          <p>{p.choices(business.phoneDisplay)}</p>
        </div>
      </section>
    </>
  )
}
