import { business, serviceAreas } from '../site.config'
import { activeServices } from '../content/services'
import { href } from '../lib/url'
import { pagePath, s, tr } from '../i18n'
import { CtaBand, Photo, SectionHead, ServiceTile, SprinklerArc, Steps } from '../components/Blocks'
import { tel, whatsappUrl } from '../components/Chrome'
import { Icon } from '../components/Icon'

export function Home() {
  const t = s()
  const featured = activeServices.find((sv) => sv.slug.en === 'irrigation') ?? activeServices[0]
  const rest = activeServices.filter((sv) => sv !== featured)
  const wa = whatsappUrl()

  return (
    <>
      {/* HERO */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__media">
          <Photo name="lawnRows" width={2000} sizes="100vw" priority />
        </div>
        <SprinklerArc />
        <div className="wrap hero__content">
          <p className="hero__kicker">
            <Icon name="pin" size={18} /> {t.hero.kicker}
          </p>
          <h1 id="hero-title" className="hero__title">
            {t.hero.title}
          </h1>
          <p className="hero__lede">{t.hero.lede}</p>
          <div className="hero__actions">
            <a className="btn btn--lime btn--lg hero__primary" href={href(pagePath('estimate'))}>
              {t.getEstimate}
            </a>
            <a className="btn btn--glass btn--lg" href={tel()}>
              <Icon name="phone" size={20} /> <span className="hide-sm">{business.phoneDisplay}</span>
              <span className="show-sm">{t.call}</span>
            </a>
            {wa ? (
              <a className="btn btn--glass btn--lg btn--wa-light" href={wa} target="_blank" rel="noopener noreferrer">
                <Icon name="whatsapp" size={20} /> WhatsApp
              </a>
            ) : null}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="section" aria-labelledby="services-title">
        <div className="wrap">
          <SectionHead id="services-title" title={t.homeServices.title} intro={t.homeServices.intro} />
        </div>
        <div className="wrap wrap--rail">
          <div className="bento rail" role="list" aria-label={t.nav.services}>
            <div role="listitem" className="bento__featured">
              <ServiceTile sv={featured} featured />
            </div>
            {rest.map((sv) => (
              <div role="listitem" key={sv.slug.en}>
                <ServiceTile sv={sv} />
              </div>
            ))}
          </div>
          <p className="rail-hint" aria-hidden="true">
            {t.swipe} <Icon name="arrow" size={16} />
          </p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section section--tint" aria-labelledby="steps-title">
        <div className="wrap split">
          <div className="split__text">
            <SectionHead id="steps-title" title={t.how.title} intro={t.how.intro} />
            <Steps />
          </div>
          <div className="split__media">
            <Photo name="mulchEdge" width={1000} sizes="(min-width: 960px) 45vw, 100vw" className="rounded-tall" />
          </div>
        </div>
      </section>

      {/* SERVICE AREAS */}
      <section className="section" aria-labelledby="areas-title">
        <div className="wrap">
          <SectionHead id="areas-title" title={t.areasBlock.title} intro={t.areasBlock.intro} />
        </div>
        <div className="wrap wrap--rail">
          <ul className="areas rail" tabIndex={0} aria-label={t.areasBlock.title}>
            {serviceAreas.map((a) => (
              <li key={a.county.en} className="areas__item">
                <h3>
                  <Icon name="pin" size={18} /> {tr(a.county)}
                </h3>
                <p>{a.towns.join(', ')}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="wrap">
          <p className="more-link">
            <a href={href(pagePath('areas'))}>{t.areasBlock.all}</a>
          </p>
        </div>
      </section>

      <CtaBand />
    </>
  )
}
