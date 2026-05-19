const OPEN_CLASS = "is-open"
const LOCK_CLASS = "home-callback-modal-open"
const addCleanup = (fn: (...args: any[]) => void) => {
  if (typeof window.addCleanup === "function") {
    window.addCleanup(fn)
  }
}

function mountHomeCallback(root: HTMLElement) {
  if (root.dataset.homeCallbackMounted === "true") return
  root.dataset.homeCallbackMounted = "true"

  const openButtons = Array.from(root.querySelectorAll<HTMLElement>("[data-home-callback-open]"))
  const modal = root.querySelector<HTMLElement>("[data-home-callback-modal]")
  const dialog = root.querySelector<HTMLElement>("[data-home-callback-dialog]")
  if (!openButtons.length || !modal || !dialog) return

  const closeButtons = Array.from(root.querySelectorAll<HTMLElement>("[data-home-callback-close]"))
  let lastFocused: HTMLElement | null = null
  let focusRestoreFrame = 0

  const lockScroll = () => {
    document.documentElement.classList.add(LOCK_CLASS)
    document.body.classList.add(LOCK_CLASS)
  }

  const unlockScroll = () => {
    document.documentElement.classList.remove(LOCK_CLASS)
    document.body.classList.remove(LOCK_CLASS)
  }

  const getFirstFocusable = () =>
    dialog.querySelector<HTMLElement>(
      'input, button, textarea, select, a[href], [tabindex]:not([tabindex="-1"])',
    )

  const closeModal = (restoreFocus = true) => {
    if (!modal.classList.contains(OPEN_CLASS)) return
    modal.classList.remove(OPEN_CLASS)
    modal.setAttribute("aria-hidden", "true")
    modal.hidden = true
    unlockScroll()
    if (restoreFocus) {
      const focusTarget = lastFocused
      if (focusTarget?.isConnected) {
        if (focusRestoreFrame) {
          window.cancelAnimationFrame(focusRestoreFrame)
        }
        focusRestoreFrame = window.requestAnimationFrame(() => {
          focusRestoreFrame = 0
          if (focusTarget.isConnected) {
            focusTarget.focus()
          }
        })
      }
    }
    lastFocused = null
  }

  const openModal = () => {
    if (modal.classList.contains(OPEN_CLASS)) return
    lastFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    modal.hidden = false
    modal.classList.add(OPEN_CLASS)
    modal.setAttribute("aria-hidden", "false")
    lockScroll()
    getFirstFocusable()?.focus()
  }

  const onOpen = (event: Event) => {
    event.preventDefault()
    openModal()
  }

  const onClose = (event: Event) => {
    event.preventDefault()
    closeModal()
  }

  const onModalClick = (event: MouseEvent) => {
    if (event.target === modal) {
      closeModal()
    }
  }

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault()
      event.stopPropagation()
      closeModal()
    }
  }

  openButtons.forEach((button) => button.addEventListener("click", onOpen))
  closeButtons.forEach((button) => button.addEventListener("click", onClose))
  modal.addEventListener("click", onModalClick)
  document.addEventListener("keydown", onKeyDown)

  addCleanup(() => {
    openButtons.forEach((button) => button.removeEventListener("click", onOpen))
    closeButtons.forEach((button) => button.removeEventListener("click", onClose))
    modal.removeEventListener("click", onModalClick)
    document.removeEventListener("keydown", onKeyDown)
    if (focusRestoreFrame) {
      window.cancelAnimationFrame(focusRestoreFrame)
    }
    closeModal(false)
  })
}

const mountHomeCallbacks = () => {
  document.querySelectorAll<HTMLElement>("[data-home-callback-root]").forEach((root) => {
    mountHomeCallback(root)
  })
}

document.addEventListener("nav", mountHomeCallbacks)
mountHomeCallbacks()
