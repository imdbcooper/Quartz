import { QuartzComponent, QuartzComponentConstructor } from "./types"
import style from "./styles/cookieConsent.scss"
// @ts-ignore
import script from "./scripts/cookieConsent.inline"

const CookieConsent: QuartzComponent = () => {
  return (
    <div class="cookie-consent" data-cookie-consent-root hidden aria-hidden="true">
      <div
        class="cookie-consent__card"
        role="dialog"
        aria-live="polite"
        aria-label="Настройки cookie"
      >
        <p class="cookie-consent__text">
          Сайт использует технически необходимое локальное хранение для настроек интерфейса.
          Аналитика Plausible подключается только после согласия.
        </p>
        <div class="cookie-consent__links">
          <a href="/docs/cookie-policy">О cookie</a>
          <a href="/docs/privacy-policy">О персональных данных</a>
        </div>
        <div class="cookie-consent__actions">
          <button
            type="button"
            class="cookie-consent__button cookie-consent__button--secondary"
            data-cookie-consent-decline
          >
            Только необходимое
          </button>
          <button
            type="button"
            class="cookie-consent__button cookie-consent__button--primary"
            data-cookie-consent-accept
          >
            Принять
          </button>
        </div>
      </div>
    </div>
  )
}

CookieConsent.css = style
CookieConsent.afterDOMLoaded = script

export default (() => CookieConsent) satisfies QuartzComponentConstructor
