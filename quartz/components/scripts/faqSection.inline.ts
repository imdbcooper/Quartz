// FAQ Section interaction script.
// - Click on main FAQ card opens modal with all questions.
// - Click on a question in modal updates the main card and closes modal.

import type {} from "./util"

const OPEN_CLASS = "is-open"
const LOCK_CLASS = "home-callback-modal-open"

function mountFaqSection() {
  const faqModal = document.querySelector<HTMLElement>("[data-home-faq-modal]")
  if (!faqModal) return
  if (faqModal.dataset.faqMounted === "true") return
  faqModal.dataset.faqMounted = "true"

  const mainTitle = document.querySelector<HTMLElement>("[data-faq-title]")
  const mainAnswer = document.querySelector<HTMLElement>("[data-faq-answer]")
  const modalItems = faqModal.querySelectorAll<HTMLElement>(".faq-modal-item")

  function openFaqModal() {
    faqModal!.hidden = false
    faqModal!.setAttribute("aria-hidden", "false")
    faqModal!.classList.add(OPEN_CLASS)
    document.documentElement.classList.add(LOCK_CLASS)
    document.body.classList.add(LOCK_CLASS)
  }

  function closeFaqModal() {
    faqModal!.classList.remove(OPEN_CLASS)
    faqModal!.setAttribute("aria-hidden", "true")
    faqModal!.hidden = true
    document.documentElement.classList.remove(LOCK_CLASS)
    document.body.classList.remove(LOCK_CLASS)
  }

  // Open modal on main FAQ click
  const onDocClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest("[data-faq-more]")) {
      e.preventDefault()
      openFaqModal()
    }
    if (target.closest("[data-home-faq-close]")) {
      e.preventDefault()
      closeFaqModal()
    }
    if (faqModal && e.target === faqModal) {
      closeFaqModal()
    }
  }

  document.addEventListener("click", onDocClick)

  // Click on modal item → update main card
  modalItems.forEach((item) => {
    const onClick = (e: Event) => {
      e.preventDefault()
      e.stopPropagation()
      const question = item.dataset.faqQuestion ?? ""
      const answer = item.dataset.faqAnswerText ?? ""
      if (mainTitle) mainTitle.textContent = question
      if (mainAnswer) mainAnswer.textContent = answer
      closeFaqModal()
    }
    item.addEventListener("click", onClick)
    window.addCleanup(() => item.removeEventListener("click", onClick))
  })

  window.addCleanup(() => {
    document.removeEventListener("click", onDocClick)
    closeFaqModal()
  })
}

document.addEventListener("nav", mountFaqSection)
mountFaqSection()
