// FAQ Section interaction script.
// - Click on main FAQ card opens modal with all questions.
// - Click on a question in modal updates the main card and closes modal.

import type {} from "./util"

const OPEN_CLASS = "is-open"
const LOCK_CLASS = "home-callback-modal-open"

function mountFaqSection() {
  const faqModal = document.querySelector<HTMLElement>("[data-home-faq-modal]")
  if (!faqModal) return
  const modal = faqModal
  if (faqModal.dataset.faqMounted === "true") return
  modal.dataset.faqMounted = "true"

  const mainTitle = document.querySelector<HTMLElement>("[data-faq-title]")
  const mainAnswer = document.querySelector<HTMLElement>("[data-faq-answer]")
  const closeButton = modal.querySelector<HTMLElement>("button[data-home-faq-close]")
  let lastFocused: HTMLElement | null = null
  let focusRestoreFrame = 0

  function openFaqModal() {
    if (modal.classList.contains(OPEN_CLASS)) return
    lastFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    modal.hidden = false
    modal.setAttribute("aria-hidden", "false")
    modal.classList.add(OPEN_CLASS)
    document.documentElement.classList.add(LOCK_CLASS)
    document.body.classList.add(LOCK_CLASS)
    closeButton?.focus()
  }

  function closeFaqModal(restoreFocus = true) {
    if (!modal.classList.contains(OPEN_CLASS)) return
    modal.classList.remove(OPEN_CLASS)
    modal.setAttribute("aria-hidden", "true")
    modal.hidden = true
    document.documentElement.classList.remove(LOCK_CLASS)
    document.body.classList.remove(LOCK_CLASS)
    if (restoreFocus && lastFocused?.isConnected) {
      const focusTarget = lastFocused
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
    lastFocused = null
  }

  const onDocClick = (e: MouseEvent) => {
    const target = e.target instanceof HTMLElement ? e.target : null
    const modalItem = target?.closest<HTMLElement>(".faq-modal-item")
    if (target?.closest("[data-faq-more]")) {
      e.preventDefault()
      openFaqModal()
    }
    if (target?.closest("[data-home-faq-close]")) {
      e.preventDefault()
      closeFaqModal()
    }
    if (e.target === modal) {
      closeFaqModal()
    }
    if (modalItem && modal.contains(modalItem)) {
      e.preventDefault()
      e.stopPropagation()
      const question = modalItem.dataset.faqQuestion ?? ""
      const answer = modalItem.dataset.faqAnswerText ?? ""
      if (mainTitle) mainTitle.textContent = question
      if (mainAnswer) mainAnswer.textContent = answer
      closeFaqModal()
    }
  }

  const onDocKeyDown = (event: KeyboardEvent) => {
    const target = event.target instanceof HTMLElement ? event.target : null
    if (event.key === "Escape" && modal.classList.contains(OPEN_CLASS)) {
      event.preventDefault()
      event.stopPropagation()
      closeFaqModal()
      return
    }
    if (!target?.closest("[data-faq-more]")) return
    if (event.key !== "Enter" && event.key !== " ") return
    event.preventDefault()
    event.stopPropagation()
    openFaqModal()
  }

  document.addEventListener("click", onDocClick)
  document.addEventListener("keydown", onDocKeyDown)

  window.addCleanup(() => {
    document.removeEventListener("click", onDocClick)
    document.removeEventListener("keydown", onDocKeyDown)
    if (focusRestoreFrame) {
      window.cancelAnimationFrame(focusRestoreFrame)
    }
    closeFaqModal(false)
  })
}

document.addEventListener("nav", mountFaqSection)
mountFaqSection()
