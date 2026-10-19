import { activeServices, type Service } from '../content/services'
import { business } from '../site.config'
import { href } from '../lib/url'
import { pagePath, s, servicePath, tr } from '../i18n'
import { Breadcrumbs, CtaBand, Faq, PageHeader, Photo, SectionHead, ServiceTile, Steps, TimingTip } from '../components/Blocks'
import { tel } from '../components/Chrome'
import { Icon } from '../components/Icon'

export function ServicesHub() {
  const t = s()
  return (
    <>
      <PageHeader
        title={t.servicesHub.title}
        intro={t.servicesHub.intro}
        crumbs={[{ name: t.home, path: pagePath('home') }, { name: t.nav.services, path: pagePath('services') }]}
      />
      <section className="section section--flush-top" aria-labelledby="all-services">
        <div className="wrap">
          <h2 id="all-services" className="visually-hidden">{t.servicesHub.all}</h2>
          <div className="grid-services">
            {activeServices.map((sv) => (
              <ServiceTile key={sv.slug.en} sv={sv} />
            ))}
          </div>
        </div>
      </section>
      <CtaBand title={t.servicesHub.ctaTitle} text={t.servicesHub.ctaText} />
    </>
  )
}

export function ServicePage({ sv }: { sv: Service }) {
  const t = s()
  const others = activeServices.filter((o) => o !== sv).slice(0, 3)
  const crumbs = [
    { name: t.home, path: pagePath('home') },
    { name: t.nav.services, path: pagePath('services') },
    { name: tr(sv.name), path: servicePath(sv.slug) },
  ]
  return (
    <>
      <section className="svc-hero">
        <div className="wrap svc-hero__grid">
          <div className="svc-hero__media">
            <Photo name={sv.photo} width={1200} sizes="(min-width: 960px) 50vw, 100vw" priority />
          </div>
          <div className="svc-hero__text">
            <Breadcrumbs items={crumbs} />
            <span className="svc-hero__icon"><Icon name={sv.icon} size={28} /></span>
            <h1>{tr(sv.headline)}</h1>
            <p className="lede">{tr(sv.intro)}</p>
            <div className="hero__actions">
              <a className="btn btn--primary btn--lg" href={href(pagePath('estimate'))}>
                {t.getEstimate}
              </a>
              <a className="btn btn--outline btn--lg" href={tel()}>
                <Icon name="phone" size={20} /> {business.phoneDisplay}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="included-title">
        <div className="wrap">
          <SectionHead id="included-title" title={t.service.included} />
          <ul className="included">
            {sv.items.map((i) => (
              <li key={i.name.en} className="included__item">
                <Icon name="check" className="included__check" />
                <div>
                  <h3>{tr(i.name)}</h3>
                  <p>{tr(i.text)}</p>
                </div>
              </li>
            ))}
          </ul>
          <TimingTip service={sv} />
        </div>
      </section>

      <section className="section section--tint" aria-labelledby="steps-title">
        <div className="wrap split">
          <div className="split__text">
            <SectionHead id="steps-title" title={t.how.title} />
            <Steps />
          </div>
          {sv.photoAlt ? (
            <div className="split__media">
              <Photo name={sv.photoAlt} width={1000} sizes="(min-width: 960px) 45vw, 100vw" className="rounded-tall" />
            </div>
          ) : null}
        </div>
      </section>

      {sv.faqs.length ? (
        <section className="section" aria-labelledby="faq-title">
          <div className="wrap narrow">
            <SectionHead id="faq-title" title={t.service.faq} />
            <Faq items={sv.faqs.map((f) => ({ q: tr(f.q), a: tr(f.a) }))} />
          </div>
        </section>
      ) : null}

      <section className="section section--tint" aria-labelledby="more-title">
        <div className="wrap">
          <SectionHead id="more-title" title={t.service.more} />
        </div>
        <div className="wrap wrap--rail">
          <div className="grid-services grid-services--3 rail" role="region" tabIndex={0} aria-label={t.service.more}>
            {others.map((o) => (
              <ServiceTile key={o.slug.en} sv={o} />
            ))}
          </div>
        </div>
      </section>

      <CtaBand title={t.service.ctaTitle(tr(sv.menu))} />
    </>
  )
}
