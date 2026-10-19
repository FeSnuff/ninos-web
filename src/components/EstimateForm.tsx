import { WEB3FORMS_ACCESS_KEY, business } from '../site.config'
import { activeServices } from '../content/services'
import { absolute, href } from '../lib/url'
import { pagePath, s, tr } from '../i18n'
import { sms, tel } from './Chrome'
import { Icon } from './Icon'

export const formIsConfigured = !WEB3FORMS_ACCESS_KEY.startsWith('YOUR_')

/**
 * Free-estimate form.
 * - Works without JavaScript (normal POST to Web3Forms, which redirects to the thanks page).
 * - With JavaScript: validated in the browser and sent with fetch, no page reload.
 * - Spam: hidden "botcheck" honeypot (Web3Forms rejects any submission that fills it).
 * - No file upload: free plan doesn't support it, and it avoids handling files. Photos go by text/WhatsApp.
 */
export function EstimateForm() {
  const t = s().form
  if (!formIsConfigured) {
    return (
      <div className="form-fallback" role="note">
        <h2>{t.notReadyTitle}</h2>
        <p>{t.notReadyText}</p>
        <div className="form-fallback__actions">
          <a className="btn btn--primary" href={tel()}>
            <Icon name="phone" size={18} /> {t.callNum(business.phoneDisplay)}
          </a>
          <a className="btn btn--outline" href={sms()}>
            <Icon name="message" size={18} /> {t.sendText}
          </a>
        </div>
      </div>
    )
  }

  return (
    <form
      className="estimate-form"
      action="https://api.web3forms.com/submit"
      method="POST"
      data-estimate-form
      data-msg-sending={t.sending}
      data-msg-send={t.send}
      data-msg-error={`${t.error} ${business.phoneDisplay}.`}
      data-msg-none={t.notSpecified}
      noValidate
    >
      <input type="hidden" name="access_key" value={WEB3FORMS_ACCESS_KEY} />
      <input type="hidden" name="subject" value={t.subject(business.shortName)} />
      <input type="hidden" name="from_name" value={`${business.shortName} website`} />
      <input type="hidden" name="redirect" value={absolute(pagePath('thanks'))} />
      {/* Honeypot: real people never see or fill this */}
      <input type="checkbox" name="botcheck" className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />

      <div className="field-grid">
        <div className="field">
          <label htmlFor="f-name">{t.name}</label>
          <input id="f-name" name="name" type="text" autoComplete="name" required maxLength={80} />
          <p className="field__error" id="f-name-err" hidden>{t.nameErr}</p>
        </div>
        <div className="field">
          <label htmlFor="f-phone">{t.phone}</label>
          <input id="f-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required maxLength={20} />
          <p className="field__error" id="f-phone-err" hidden>{t.phoneErr}</p>
        </div>
        <div className="field">
          <label htmlFor="f-email">{t.email} <span className="field__optional">{t.optional}</span></label>
          <input id="f-email" name="email" type="email" autoComplete="email" maxLength={120} />
          <p className="field__error" id="f-email-err" hidden>{t.emailErr}</p>
        </div>
        <div className="field">
          <label htmlFor="f-zip">{t.zip}</label>
          <input id="f-zip" name="zip" type="text" inputMode="numeric" autoComplete="postal-code" required pattern="[0-9]{5}" maxLength={5} />
          <p className="field__error" id="f-zip-err" hidden>{t.zipErr}</p>
        </div>
      </div>

      <fieldset className="field">
        <legend>{t.need}</legend>
        <div className="checks">
          {activeServices.map((sv) => (
            <label className="check" key={sv.slug.en}>
              <input type="checkbox" name="services" value={tr(sv.name)} />
              <span>{tr(sv.name)}</span>
            </label>
          ))}
          <label className="check">
            <input type="checkbox" name="services" value={t.otherValue} />
            <span>{t.other}</span>
          </label>
        </div>
      </fieldset>

      <div className="field">
        <label htmlFor="f-msg">{t.msg}</label>
        <textarea id="f-msg" name="message" rows={4} maxLength={2000} placeholder={t.msgPh} />
      </div>

      <div className="field-grid">
        <fieldset className="field">
          <legend>{t.reach}</legend>
          <div className="radios">
            {t.reachOpts.map((v, i) => (
              <label className="check" key={v}>
                <input type="radio" name="contact_preference" value={v} defaultChecked={i === 0} />
                <span>{v}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className="field">
          <legend>{t.language}</legend>
          <div className="radios">
            <label className="check" lang="en">
              <input type="radio" name="language" value="English" defaultChecked={s().langName === 'English'} />
              <span>English</span>
            </label>
            <label className="check" lang="es">
              <input type="radio" name="language" value="Español" defaultChecked={s().langName === 'Español'} />
              <span>Español</span>
            </label>
          </div>
        </fieldset>
      </div>

      <p className="form-note">
        {t.photos} <a href={sms()}>{business.phoneDisplay}</a> {t.photosAfter} {t.privacy1}{' '}
        <a href={href(pagePath('privacy'))}>{t.privacyLink}</a>.
      </p>

      <button className="btn btn--primary btn--lg btn--block-mobile" type="submit">
        {t.send}
      </button>
      <p className="form-status" role="status" aria-live="polite" data-form-status />
    </form>
  )
}
