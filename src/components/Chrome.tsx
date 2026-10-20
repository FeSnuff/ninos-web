import { business } from '../site.config'
import { activeServices } from '../content/services'
import { href } from '../lib/url'
import { lang, pagePath, s, servicePath, tr } from '../i18n'
import { Icon } from './Icon'

export const tel = () => `tel:${business.phoneE164}`
export const sms = () => `sms:${business.phoneE164}`
export const whatsappUrl = () =>
  business.whatsapp ? `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(s().whatsappMsg)}` : ''

export function Logo() {
  return (
    <a className="logo" href={href(pagePath('home'))} aria-label={`${business.shortName}, ${s().home}`}>
      <img src={href('/brand/logo-icon.svg')} alt="" width="56" height="56" />
      <span className="logo__text">
        <span className="logo__name">NINO’S</span>
        <span className="logo__sub">
          <span className="logo__land">Landscaping</span> <span className="logo__llc">LLC</span>
        </span>
      </span>
    </a>
  )
}

const navItems = () => {
  const t = s().nav
  return [
    { path: pagePath('services'), label: t.services },
    { path: pagePath('areas'), label: t.areas },
    { path: pagePath('gallery'), label: t.gallery },
    { path: pagePath('about'), label: t.about },
    { path: pagePath('contact'), label: t.contact },
  ]
}

function isCurrent(current: string, path: string) {
  return current === path || (path !== pagePath('home') && current.startsWith(path))
}

/** Link to the same page in the other language */
function LangSwitch({ altPath, className = 'lang-switch' }: { altPath?: string; className?: string }) {
  if (!altPath) return null
  const other = lang() === 'en' ? 'es' : 'en'
  return (
    <a className={className} href={href(altPath)} hrefLang={other} lang={other}>
      <Icon name="globe" size={16} />
      <span>{other.toUpperCase()}</span>
      <span className="visually-hidden"> {s().switchLabel}</span>
    </a>
  )
}

export function Header({ current, altPath }: { current: string; altPath?: string }) {
  const t = s()
  return (
    <header className="site-header">
      <div className="site-header__inner wrap">
        <Logo />

        <nav className="nav-desktop" aria-label={t.main}>
          <ul>
            {navItems().map((n) => (
              <li key={n.path}>
                <a href={href(n.path)} aria-current={isCurrent(current, n.path) ? 'page' : undefined}>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-header__actions">
          <LangSwitch altPath={altPath} />
          <a className="header-phone" href={tel()}>
            <Icon name="phone" size={18} />
            <span>{business.phoneDisplay}</span>
          </a>
          <a className="btn btn--primary btn--sm header-cta" href={href(pagePath('estimate'))}>
            {t.freeEstimate}
          </a>
        </div>

        {/* Mobile menu: native <details> works without JavaScript */}
        <details className="nav-mobile">
          <summary aria-label={t.menu}>
            <Icon name="menu" className="nav-mobile__open" />
            <Icon name="close" className="nav-mobile__close" />
          </summary>
          <div className="nav-mobile__panel">
            <nav aria-label={t.mobileNav}>
              <ul className="nav-mobile__main">
                {navItems().map((n, i) => (
                  <li key={n.path} className={`stagger-${i}`}>
                    <a href={href(n.path)} aria-current={isCurrent(current, n.path) ? 'page' : undefined}>
                      {n.label}
                      <Icon name="chevron" size={20} />
                    </a>
                  </li>
                ))}
              </ul>
              <p className="nav-mobile__label">{t.menuServices}</p>
              <ul className="nav-mobile__services">
                {activeServices.map((sv) => (
                  <li key={sv.slug.en}>
                    <a href={href(servicePath(sv.slug))}>
                      <Icon name={sv.icon} size={18} />
                      {tr(sv.menu)}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="nav-mobile__foot">
              <a className="btn btn--primary btn--block btn--lg" href={href(pagePath('estimate'))}>
                {t.getEstimate}
              </a>
              <div className="nav-mobile__row">
                <a className="btn btn--outline btn--block" href={tel()}>
                  <Icon name="phone" size={18} /> {t.call}
                </a>
                <LangSwitch altPath={altPath} className="btn btn--outline btn--block lang-switch--menu" />
              </div>
            </div>
          </div>
        </details>
      </div>
    </header>
  )
}

/** Mobile: floating dock. Desktop: floating WhatsApp button. */
export function QuickContact() {
  const t = s()
  const wa = whatsappUrl()
  return (
    <>
      <nav className="dock" aria-label={t.quickContact}>
        <a className="dock__icon" href={tel()}>
          <Icon name="phone" size={22} />
          <span>{t.call}</span>
        </a>
        {wa ? (
          <a className="dock__icon dock__icon--wa" href={wa} target="_blank" rel="noopener noreferrer">
            <Icon name="whatsapp" size={22} />
            <span>{t.whatsapp}</span>
          </a>
        ) : (
          <a className="dock__icon" href={sms()}>
            <Icon name="message" size={22} />
            <span>{t.text}</span>
          </a>
        )}
        <a className="dock__cta" href={href(pagePath('estimate'))}>
          {t.freeEstimate}
        </a>
      </nav>
      {wa ? (
        <a className="wa-fab" href={wa} target="_blank" rel="noopener noreferrer" aria-label={t.whatsappLabel}>
          <Icon name="whatsapp" size={28} />
          <span className="wa-fab__label" aria-hidden="true">{t.whatsapp}</span>
        </a>
      ) : null}
    </>
  )
}

export function Footer() {
  const t = s()
  const year = new Date().getFullYear()
  const lic = business.license
  const wa = whatsappUrl()
  return (
    <footer className="site-footer">
      <div className="wrap site-footer__grid">
        <div className="site-footer__brand">
          <Logo />
          <p>{t.footerBlurb}</p>
          {lic.dporNumber ? (
            <p className="site-footer__license">
              {t.about.footerLicense(lic.dporClass, lic.dporNumber, lic.specialties.join(', '))}
              {lic.insured ? `. ${t.about.insured}` : ''}
            </p>
          ) : null}
        </div>

        <div>
          <h2 className="site-footer__title">{t.nav.services}</h2>
          <ul>
            {activeServices.map((sv) => (
              <li key={sv.slug.en}>
                <a href={href(servicePath(sv.slug))}>{tr(sv.name)}</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="site-footer__title">{t.company}</h2>
          <ul>
            <li><a href={href(pagePath('about'))}>{t.nav.about}</a></li>
            <li><a href={href(pagePath('areas'))}>{t.nav.areas}</a></li>
            <li><a href={href(pagePath('gallery'))}>{t.nav.gallery}</a></li>
            <li><a href={href(pagePath('estimate'))}>{t.freeEstimate}</a></li>
            <li><a href={href(pagePath('contact'))}>{t.nav.contact}</a></li>
          </ul>
        </div>

        <div>
          <h2 className="site-footer__title">{t.talk}</h2>
          <ul className="site-footer__contact">
            <li>
              <a href={tel()}><Icon name="phone" size={18} /> {business.phoneDisplay}</a>
            </li>
            {wa ? (
              <li>
                <a href={wa} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp" size={18} /> WhatsApp</a>
              </li>
            ) : null}
            <li>
              <a href={sms()}><Icon name="message" size={18} /> {t.textUs}</a>
            </li>
            {business.email ? (
              <li>
                <a href={`mailto:${business.email}`}><Icon name="mail" size={18} /> {business.email}</a>
              </li>
            ) : null}
            <li><Icon name="clock" size={18} /> {tr(business.hours[0].label)}</li>
            <li><Icon name="pin" size={18} /> Virginia</li>
          </ul>
        </div>
      </div>

      <div className="wrap site-footer__legal">
        <p>© {year} {business.name}. {t.rights}</p>
        <p>
          <a href={href(pagePath('privacy'))}>{t.privacy}</a>
          {' · '}
          <a href={href('/portal/')} rel="nofollow">{t.staff}</a>
        </p>
      </div>
    </footer>
  )
}
