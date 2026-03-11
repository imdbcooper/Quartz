const COOKIE_CONSENT_KEY = "slavx-cookie-consent"
const ACCEPTED = "accepted"
const DECLINED = "declined"
const ACCEPT_EVENT = "slavx:cookie-consent-accepted"

function readConsent() {
  try {
    return window.localStorage.getItem(COOKIE_CONSENT_KEY)
  } catch {
    return null
  }
}

function writeConsent(value: string) {
  try {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, value)
  } catch {
    return
  }
}

function setVisibility(root: HTMLElement, visible: boolean) {
  root.hidden = !visible
  root.setAttribute("aria-hidden", visible ? "false" : "true")
}

function mountCookieConsent(root: HTMLElement) {
  if (root.dataset.cookieConsentMounted === "true") return
  root.dataset.cookieConsentMounted = "true"

  const acceptButton = root.querySelector<HTMLElement>("[data-cookie-consent-accept]")
  const declineButton = root.querySelector<HTMLElement>("[data-cookie-consent-decline]")
  if (!acceptButton || !declineButton) return

  const sync = () => {
    const consent = readConsent()
    setVisibility(root, !consent)
  }

  const onAccept = () => {
    writeConsent(ACCEPTED)
    setVisibility(root, false)
    document.dispatchEvent(new CustomEvent<{}>(ACCEPT_EVENT, { detail: {} }))
  }

  const onDecline = () => {
    writeConsent(DECLINED)
    setVisibility(root, false)
  }

  acceptButton.addEventListener("click", onAccept)
  declineButton.addEventListener("click", onDecline)

  sync()
}

const mountCookieConsents = () => {
  document.querySelectorAll<HTMLElement>("[data-cookie-consent-root]").forEach((root) => {
    mountCookieConsent(root)
  })
}

document.addEventListener("nav", mountCookieConsents)
mountCookieConsents()
