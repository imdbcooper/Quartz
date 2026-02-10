import type {} from "./util"

type CarouselButton = {
  text?: string
  href?: string
  target?: string
  action?: string
}

type CarouselCard = {
  title: string
  description: string
  price?: string
  note?: string
  button?: CarouselButton
}

type CarouselData = {
  title?: string
  subtitle?: string
  hint?: string
  footerHint?: string
  autoSpeed?: number
  dragSensitivity?: number
  height?: number
  radiusScale?: number
  minRadius?: number
  maxRadius?: number
  minGap?: number
  form?: CarouselForm
  defaultNote?: string
  cards?: CarouselCard[]
}

type CarouselForm = {
  subtitle?: string
  action?: string
  method?: string
  submitLabel?: string
  privacyNote?: string
}

const DEFAULTS = {
  title: "Services",
  subtitle: "Drag to rotate.",
  hint: "3D - drag - auto-rotate",
  autoSpeed: 8,
  dragSensitivity: 0.25,
  height: 520,
  radiusScale: 0.35,
  minRadius: 240,
  maxRadius: 520,
  ringScale: 0.82,
  minGap: 24,
}

const DEFAULT_FORM: Required<Pick<CarouselForm, "subtitle" | "submitLabel" | "privacyNote">> = {
  subtitle: "Оставьте заявку — я свяжусь с вами.",
  submitLabel: "Отправить",
  privacyNote: "Без спама",
}

function clamp(min: number, max: number, value: number) {
  return Math.min(max, Math.max(min, value))
}

function readNumber(value: unknown, fallback: number) {
  const num = typeof value === "number" ? value : Number(value)
  return Number.isFinite(num) ? num : fallback
}

function createEl<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string) {
  const el = document.createElement(tag)
  if (className) {
    el.className = className
  }
  return el
}

function resolveSource(source: string) {
  try {
    return new URL(source, window.location.href).toString()
  } catch {
    return source
  }
}

function renderError(root: HTMLElement, message: string) {
  root.classList.add("services-carousel", "is-error")
  root.innerHTML = ""
  root.textContent = message
}

function createModal(root: HTMLElement, data: CarouselData) {
  let isOpen = false
  const modal = createEl("div", "services-carousel__modal")
  const backdrop = createEl("div", "services-carousel__modal-backdrop")
  const card = createEl("div", "services-carousel__modal-card")
  const header = createEl("div", "services-carousel__modal-header")
  const title = createEl("div", "services-carousel__modal-title")
  const closeButton = createEl("button", "services-carousel__modal-close") as HTMLButtonElement
  const subtitle = createEl("div", "services-carousel__modal-subtitle")
  const form = createEl("form", "services-carousel__modal-form") as HTMLFormElement
  const nameField = createEl("input", "services-carousel__modal-field") as HTMLInputElement
  const emailField = createEl("input", "services-carousel__modal-field") as HTMLInputElement
  const taskField = createEl("textarea", "services-carousel__modal-field") as HTMLTextAreaElement
  const actions = createEl("div", "services-carousel__modal-actions")
  const submitButton = createEl("button", "services-carousel__modal-submit") as HTMLButtonElement
  const privacyNote = createEl("div", "services-carousel__modal-privacy")
  const status = createEl("div", "services-carousel__modal-status")
  const chosen = createEl("div", "services-carousel__modal-chosen")
  const serviceInput = createEl("input") as HTMLInputElement
  const priceInput = createEl("input") as HTMLInputElement

  const formConfig = data.form ?? {}
  const formSubtitle = formConfig.subtitle ?? DEFAULT_FORM.subtitle
  const rawFormAction = formConfig.action ?? root.dataset.formAction ?? ""
  const rawFormMethod = formConfig.method ?? root.dataset.formMethod ?? "POST"
  const trimmedAction = typeof rawFormAction === "string" ? rawFormAction.trim() : ""
  const formAction = trimmedAction ? resolveSource(trimmedAction) : ""
  const normalizedMethod =
    typeof rawFormMethod === "string" ? rawFormMethod.trim().toUpperCase() : "POST"
  const formMethod =
    normalizedMethod === "GET" || normalizedMethod === "POST" ? normalizedMethod : "POST"
  const submitLabel = formConfig.submitLabel ?? DEFAULT_FORM.submitLabel
  const privacyText = formConfig.privacyNote ?? DEFAULT_FORM.privacyNote
  const hasValidAction =
    formAction !== "" &&
    formAction !== "null" &&
    formAction !== "undefined" &&
    !/\/null(?:[/?#]|$)/.test(formAction)

  modal.setAttribute("role", "dialog")
  modal.setAttribute("aria-modal", "true")
  modal.setAttribute("aria-hidden", "true")

  closeButton.type = "button"
  closeButton.textContent = "Закрыть"

  subtitle.textContent = formSubtitle

  nameField.type = "text"
  nameField.name = "name"
  nameField.placeholder = "Имя"
  nameField.autocomplete = "name"
  nameField.required = true

  emailField.type = "email"
  emailField.name = "email"
  emailField.placeholder = "Email"
  emailField.autocomplete = "email"
  emailField.required = true

  taskField.name = "message"
  taskField.placeholder = "Коротко о задаче"
  taskField.rows = 3

  submitButton.type = "submit"
  submitButton.textContent = submitLabel

  privacyNote.textContent = privacyText
  status.setAttribute("role", "status")
  status.setAttribute("aria-live", "polite")

  serviceInput.type = "hidden"
  serviceInput.name = "service"
  priceInput.type = "hidden"
  priceInput.name = "price"

  if (hasValidAction) {
    form.action = formAction
  }
  form.method = formMethod

  header.append(title, closeButton)
  actions.append(submitButton, privacyNote)
  form.append(nameField, emailField, taskField, actions, status, chosen, serviceInput, priceInput)
  card.append(header, subtitle, form)
  modal.append(backdrop, card)
  document.body.append(modal)

  const lockScroll = () => {
    document.documentElement.classList.add("services-carousel-modal-open")
    document.body.classList.add("services-carousel-modal-open")
  }

  const unlockScroll = () => {
    document.documentElement.classList.remove("services-carousel-modal-open")
    document.body.classList.remove("services-carousel-modal-open")
  }

  const closeModal = () => {
    modal.classList.remove("is-open")
    modal.setAttribute("aria-hidden", "true")
    isOpen = false
    unlockScroll()
    root.dispatchEvent(new CustomEvent("services-carousel:layout", { bubbles: true }))
  }

  const openModal = (cardData: CarouselCard) => {
    if (isOpen) return
    title.textContent = cardData.title
    if (cardData.price) {
      chosen.textContent = `Вы выбрали: ${cardData.price}`
    } else {
      chosen.textContent = ""
    }
    serviceInput.value = cardData.title
    priceInput.value = cardData.price ?? ""
    modal.classList.add("is-open")
    modal.setAttribute("aria-hidden", "false")
    isOpen = true
    lockScroll()
    root.dispatchEvent(new CustomEvent("services-carousel:layout", { bubbles: true }))
    nameField.focus()
  }

  const onBackdrop = () => closeModal()
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault()
      closeModal()
    }
  }

  let isSubmitting = false
  const onSubmit = async (event: Event) => {
    event.preventDefault()
    if (!hasValidAction) {
      status.textContent = "Не задан корректный URL формы. Проверьте data.form.action."
      return
    }
    if (isSubmitting) return
    isSubmitting = true
    submitButton.disabled = true
    status.textContent = "Отправляем..."

    try {
      const payload = {
        name: nameField.value,
        email: emailField.value,
        message: taskField.value,
        service: serviceInput.value,
        price: priceInput.value,
      }
      const response = await fetch(formAction, {
        method: formMethod,
        body: JSON.stringify(payload),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        redirect: "manual",
      })
      if (response.type === "opaqueredirect") {
        status.textContent = "Спасибо! Заявка отправлена."
        form.reset()
        return
      }

      const responseText = await response.text()
      let responseData: unknown = null
      if (responseText) {
        try {
          responseData = JSON.parse(responseText)
        } catch {
          responseData = responseText
        }
      }
      const responseMessage =
        typeof responseData === "object" && responseData !== null
          ? ((responseData as { message?: string; error?: string }).message ??
            (responseData as { message?: string; error?: string }).error ??
            responseText)
          : responseText

      const isRedirect = response.status >= 300 && response.status < 400
      if (response.ok || isRedirect) {
        status.textContent = "Спасибо! Заявка отправлена."
        form.reset()
      } else {
        status.textContent = responseMessage
          ? `Не удалось отправить (${response.status}). ${responseMessage}`
          : `Не удалось отправить (${response.status}).`
      }
    } catch {
      status.textContent = "Ошибка сети. Попробуйте еще раз."
    } finally {
      submitButton.disabled = false
      isSubmitting = false
    }
  }

  backdrop.addEventListener("click", onBackdrop)
  closeButton.addEventListener("click", closeModal)
  form.addEventListener("submit", onSubmit)
  document.addEventListener("keydown", onKeyDown)

  window.addCleanup(() => {
    backdrop.removeEventListener("click", onBackdrop)
    closeButton.removeEventListener("click", closeModal)
    form.removeEventListener("submit", onSubmit)
    document.removeEventListener("keydown", onKeyDown)
    modal.remove()
    unlockScroll()
  })

  return { open: openModal, close: closeModal, isOpen: () => isOpen }
}

function buildBaseLayout(root: HTMLElement, data: CarouselData) {
  root.innerHTML = ""
  const frame = createEl("div", "services-carousel__frame")
  const header = createEl("div", "services-carousel__header")
  const titles = createEl("div", "services-carousel__titles")
  const title = createEl("div", "services-carousel__title")
  const subtitle = createEl("div", "services-carousel__subtitle")
  const hint = createEl("div", "services-carousel__header-hint")
  const stageWrap = createEl("div", "services-carousel__stage-wrap")
  const stage = createEl("div", "services-carousel__stage")
  const ring = createEl("div", "services-carousel__ring")
  // no floor glow
  const footerHint = createEl("div", "services-carousel__footer-hint")

  const useDefaults =
    data.title === undefined &&
    data.subtitle === undefined &&
    data.hint === undefined &&
    data.footerHint === undefined

  const titleText = useDefaults ? DEFAULTS.title : (data.title ?? "")
  title.textContent = titleText
  const subtitleText = useDefaults ? DEFAULTS.subtitle : (data.subtitle ?? "")
  if (subtitleText) {
    subtitle.textContent = subtitleText
  }

  const hintText = useDefaults ? DEFAULTS.hint : (data.hint ?? "")
  if (hintText) {
    hint.textContent = hintText
  }

  const footerHintText = data.footerHint
  if (footerHintText) {
    footerHint.textContent = footerHintText
  }

  if (titleText) {
    titles.append(title)
  }
  if (subtitleText) {
    titles.append(subtitle)
  }

  const hasHeader = Boolean(titleText || subtitleText || hintText)
  if (hasHeader) {
    header.append(titles)
    if (hintText) {
      header.append(hint)
    }
  } else {
    root.classList.add("no-header")
  }

  stage.append(ring)
  stageWrap.append(stage)
  if (hasHeader) {
    frame.append(header)
  }
  frame.append(stageWrap)

  if (footerHintText) {
    frame.append(footerHint)
  } else {
    root.classList.add("no-footer-hint")
  }

  root.append(frame)

  return { root, stageWrap, stage, ring }
}

function buildCard(root: HTMLElement, card: CarouselCard, fallbackNote?: string) {
  const cardEl = createEl("div", "services-carousel__card")
  const top = createEl("div", "services-carousel__card-top")
  const titleRow = createEl("div", "services-carousel__card-header")
  const titleWrap = createEl("div", "services-carousel__card-title-wrap")
  const title = createEl("div", "services-carousel__card-title")
  const desc = createEl("div", "services-carousel__card-desc")

  title.textContent = card.title
  desc.textContent = card.description

  titleWrap.append(title, desc)
  titleRow.append(titleWrap)

  if (card.price) {
    const price = createEl("div", "services-carousel__price")
    price.textContent = card.price
    titleRow.append(price)
  }

  const bottom = createEl("div", "services-carousel__card-bottom")
  const note = createEl("div", "services-carousel__note")

  const buttonConfig = card.button ?? {}
  const buttonText = buttonConfig.text ?? "Подробнее"
  let button: HTMLElement

  if (buttonConfig.href) {
    const link = createEl("a", "services-carousel__button")
    link.textContent = buttonText
    link.href = buttonConfig.href
    if (buttonConfig.target) {
      link.target = buttonConfig.target
    }
    if (link.target === "_blank") {
      link.rel = "noopener noreferrer"
    }
    button = link
  } else {
    const btn = createEl("button", "services-carousel__button") as HTMLButtonElement
    btn.type = "button"
    btn.textContent = buttonText
    button = btn
  }

  if (buttonConfig.action) {
    button.dataset.action = buttonConfig.action
    const handleAction = () => {
      const detail = { action: buttonConfig.action, card }
      root.dispatchEvent(new CustomEvent("services-carousel:action", { detail, bubbles: true }))
    }
    button.addEventListener("click", handleAction)
    window.addCleanup(() => button.removeEventListener("click", handleAction))
  }

  const noteText = card.note ?? fallbackNote
  if (noteText) {
    note.textContent = noteText
  }

  bottom.append(button)
  if (noteText) {
    bottom.append(note)
  }

  top.append(titleRow)
  cardEl.append(top, bottom)

  return cardEl
}

async function initCarousel(root: HTMLElement) {
  if (root.dataset.scReady === "true") return
  root.dataset.scReady = "true"
  root.classList.add("services-carousel")

  const source = root.dataset.source
  if (!source) {
    renderError(root, "services-carousel: missing data-source")
    return
  }

  let data: CarouselData
  try {
    const response = await fetch(resolveSource(source))
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    data = (await response.json()) as CarouselData
  } catch (err) {
    renderError(root, `services-carousel: failed to load ${source}`)
    return
  }

  const elements = buildBaseLayout(root, data)
  const cards = data.cards ?? []
  if (!cards.length) {
    renderError(root, "services-carousel: no cards in data")
    return
  }

  const modal = createModal(root, data)

  const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches
  const autoSpeed = prefersReducedMotion
    ? 0
    : readNumber(root.dataset.autoSpeed ?? data.autoSpeed, DEFAULTS.autoSpeed)
  const dragSensitivity = readNumber(
    root.dataset.dragSensitivity ?? data.dragSensitivity,
    DEFAULTS.dragSensitivity,
  )
  const radiusScale = readNumber(root.dataset.radiusScale ?? data.radiusScale, DEFAULTS.radiusScale)
  const minRadius = readNumber(root.dataset.minRadius ?? data.minRadius, DEFAULTS.minRadius)
  const maxRadius = readNumber(root.dataset.maxRadius ?? data.maxRadius, DEFAULTS.maxRadius)
  let minGap = readNumber(root.dataset.minGap ?? data.minGap, DEFAULTS.minGap)
  let ringScale = DEFAULTS.ringScale * 1.1
  if (window.innerWidth <= 600) {
    minGap = Math.max(minGap, 36)
    ringScale = DEFAULTS.ringScale
  }
  const fallbackNote = data.defaultNote

  const cardHolders: HTMLElement[] = []
  const step = 360 / cards.length
  let cardWidth = 0
  let cardHeight = 0

  cards.forEach((card, index) => {
    const holder = createEl("div", "services-carousel__card-holder")
    const cardEl = buildCard(root, card, fallbackNote)
    cardEl.dataset.cardIndex = String(index)
    holder.append(cardEl)
    elements.ring.append(holder)
    cardHolders.push(holder)

    if (!cardWidth) {
      const rect = cardEl.getBoundingClientRect()
      if (rect.width) {
        cardWidth = rect.width
      }
      if (rect.height) {
        cardHeight = rect.height
      }
    }

    const angle = index * step
    holder.dataset.angle = String(angle)
  })

  let ringRadius = DEFAULTS.minRadius
  let isPointerDown = false
  let isDragging = false
  let dragDistance = 0
  let downCardIndex: number | null = null
  let capturedPointerId: number | null = null
  const dragThreshold = 8
  const perspectiveValue = (() => {
    const perspective = window.getComputedStyle(elements.stageWrap).perspective
    if (!perspective || perspective === "none") return 1100
    const parsed = Number.parseFloat(perspective)
    return Number.isFinite(parsed) ? parsed : 1100
  })()

  const getCardIndexAtPoint = (x: number, y: number) => {
    const rect = elements.stageWrap.getBoundingClientRect()
    if (!rect.width || !rect.height) return null
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const relX = x - centerX
    const relY = y - centerY
    let bestIndex: number | null = null
    let bestScore = Number.POSITIVE_INFINITY

    for (let i = 0; i < cards.length; i += 1) {
      const baseAngle = i * step
      const theta = ((baseAngle + rotation) * Math.PI) / 180
      const cardX = Math.sin(theta) * ringRadius
      const cardZ = Math.cos(theta) * ringRadius
      const scale = perspectiveValue / (perspectiveValue - cardZ)
      const projectedX = cardX * scale
      const halfW = (cardWidth * scale) / 2
      const halfH = (cardHeight * scale) / 2
      const dx = Math.abs(relX - projectedX)
      const dy = Math.abs(relY)

      if (dx <= halfW && dy <= halfH) {
        const score = dx + dy
        if (score < bestScore) {
          bestScore = score
          bestIndex = i
        }
      }
    }

    if (bestIndex !== null) {
      return bestIndex
    }

    let fallbackIndex: number | null = null
    let fallbackScore = Number.POSITIVE_INFINITY
    for (let i = 0; i < cards.length; i += 1) {
      const baseAngle = i * step
      const theta = ((baseAngle + rotation) * Math.PI) / 180
      const cardX = Math.sin(theta) * ringRadius
      const cardZ = Math.cos(theta) * ringRadius
      const scale = perspectiveValue / (perspectiveValue - cardZ)
      const projectedX = cardX * scale
      const dx = Math.abs(relX - projectedX)
      if (dx < fallbackScore) {
        fallbackScore = dx
        fallbackIndex = i
      }
    }

    return fallbackIndex
  }
  const updateRadius = () => {
    const width = root.clientWidth || window.innerWidth
    const cardWidthTarget = clamp(200, Math.round(width * 0.6), 420)
    root.style.setProperty("--sc-card-width", `${cardWidthTarget}px`)
    const firstCard = cardHolders[0]?.firstElementChild as HTMLElement | null
    if (firstCard) {
      // IMPORTANT: getBoundingClientRect() on 3D/perspective content can return projected sizes.
      // That can shrink ringRadius and make cards overlap after scroll/modal.
      const style = window.getComputedStyle(firstCard)
      if (style.width) {
        cardWidth = Number.parseFloat(style.width)
      }
      if (style.height) {
        cardHeight = Number.parseFloat(style.height)
      }
    }
    if (!Number.isFinite(cardWidth) || cardWidth <= 0) {
      cardWidth = cardWidthTarget
    }
    // Stage height must account for 3D perspective scaling, otherwise overflow:hidden clips card borders.
    // We'll set it after computing ringRadius (needs perspective + ringRadius for max scale).
    const rawHeight = readNumber(root.dataset.height ?? data.height, 0)
    let resolvedHeight = rawHeight > 0 ? rawHeight : 0

    const radius = clamp(minRadius, maxRadius, Math.round(width * radiusScale))
    const ringTarget = Math.round(radius * ringScale)
    const edgeGap = window.innerWidth <= 600 ? 8 : 0
    let maxSin = 0
    for (let i = 0; i < cards.length; i += 1) {
      const angle = (i * step * Math.PI) / 180
      maxSin = Math.max(maxSin, Math.abs(Math.sin(angle)))
    }
    const halfWidth = Math.max(0, width / 2 - edgeGap - cardWidth / 2)
    const fitRadius =
      maxSin > 0 ? Math.max(0, Math.floor(halfWidth / maxSin)) : Math.max(0, Math.floor(halfWidth))
    let minSpacingRadius = 0
    if (cards.length > 1 && cardWidth > 0) {
      const angle = Math.PI / cards.length
      const chord = cardWidth + minGap
      minSpacingRadius = Math.ceil(chord / (2 * Math.sin(angle)))
    }
    ringRadius = Math.max(ringTarget, minSpacingRadius, fitRadius)

    // Set stage height with minimal safe padding based on the maximum perspective scale.
    // Front-most card has cardZ ~= ringRadius, so scale = perspective / (perspective - cardZ).
    if (resolvedHeight <= 0) {
      const denom = Math.max(1, perspectiveValue - ringRadius)
      const maxScale = perspectiveValue / denom
      const pad = window.innerWidth <= 600 ? 6 : 8
      const projectedH = Math.max(0, cardHeight) * maxScale
      // Compute minimal safe height, then aggressively reduce vertical slack.
      resolvedHeight = Math.ceil(projectedH + pad * 2)
      // Reduce extra whitespace, but keep a bit of breathing room
      resolvedHeight = Math.max(0, resolvedHeight - 112)
      // Keep it within reasonable bounds
      resolvedHeight = clamp(198, 358, resolvedHeight)
      // Slight extra breathing room (requested +6 total)
      resolvedHeight = clamp(198, 364, resolvedHeight + 6)
    }
    root.style.setProperty("--sc-height", `${resolvedHeight}px`)

    cardHolders.forEach((holder) => {
      const angle = Number(holder.dataset.angle ?? 0)
      holder.style.transform = `translate(-50%, -50%) rotateY(${angle}deg) translateZ(${ringRadius}px)`
    })
  }

  let resizeRaf = 0
  const scheduleUpdate = () => {
    if (resizeRaf) {
      window.cancelAnimationFrame(resizeRaf)
    }
    resizeRaf = window.requestAnimationFrame(() => {
      resizeRaf = 0
      updateRadius()
    })
  }

  updateRadius()
  scheduleUpdate()

  const onModalLayout = () => {
    scheduleUpdate()
    window.requestAnimationFrame(() => scheduleUpdate())
  }
  root.addEventListener("services-carousel:layout", onModalLayout)

  let rotation = 0
  let lastX = 0
  let rafId = 0
  let lastTime = performance.now()

  const tick = (time: number) => {
    const delta = (time - lastTime) / 1000
    lastTime = time

    if (!isDragging) {
      rotation += autoSpeed * delta
    }

    elements.ring.style.transform = `translateZ(${-ringRadius}px) rotateY(${rotation}deg)`
    rafId = window.requestAnimationFrame(tick)
  }

  const onPointerDown = (event: PointerEvent) => {
    isPointerDown = true
    isDragging = false
    lastX = event.clientX
    dragDistance = 0
    downCardIndex = getCardIndexAtPoint(event.clientX, event.clientY)
    if (capturedPointerId !== null) {
      elements.stage.releasePointerCapture?.(capturedPointerId)
      capturedPointerId = null
    }
  }

  const onPointerMove = (event: PointerEvent) => {
    if (!isPointerDown) return
    const dx = event.clientX - lastX
    lastX = event.clientX
    dragDistance += Math.abs(dx)
    if (dragDistance > dragThreshold && !isDragging) {
      isDragging = true
      root.classList.add("is-dragging")
      elements.stage.setPointerCapture?.(event.pointerId)
      capturedPointerId = event.pointerId
    }
    if (isDragging) {
      rotation += dx * dragSensitivity
    }
  }

  const onPointerUp = (event: PointerEvent) => {
    if (!isPointerDown) return
    isPointerDown = false
    if (!isDragging && !modal.isOpen()) {
      const candidate = downCardIndex ?? getCardIndexAtPoint(event.clientX, event.clientY)
      if (candidate !== null) {
        const card = cards[candidate]
        if (card) {
          modal.open(card)
        }
      }
    }
    if (isDragging) {
      root.classList.remove("is-dragging")
    }
    if (capturedPointerId !== null) {
      elements.stage.releasePointerCapture?.(capturedPointerId)
      capturedPointerId = null
    }
    isDragging = false
    downCardIndex = null
  }

  const onPointerCancel = () => {
    isPointerDown = false
    downCardIndex = null
    if (isDragging) {
      root.classList.remove("is-dragging")
    }
    if (capturedPointerId !== null) {
      elements.stage.releasePointerCapture?.(capturedPointerId)
      capturedPointerId = null
    }
    isDragging = false
  }

  elements.stage.addEventListener("pointerdown", onPointerDown)
  elements.stage.addEventListener("pointermove", onPointerMove)
  elements.stage.addEventListener("pointerup", onPointerUp)
  elements.stage.addEventListener("pointercancel", onPointerCancel)
  elements.stage.addEventListener("pointerleave", onPointerCancel)
  window.addEventListener("resize", scheduleUpdate)
  window.visualViewport?.addEventListener("resize", scheduleUpdate)
  window.visualViewport?.addEventListener("scroll", scheduleUpdate)

  let resizeObserver: ResizeObserver | null = null
  if ("ResizeObserver" in window) {
    resizeObserver = new ResizeObserver(() => scheduleUpdate())
    resizeObserver.observe(elements.stageWrap)
    const firstCard = cardHolders[0]?.firstElementChild
    if (firstCard instanceof HTMLElement) {
      resizeObserver.observe(firstCard)
    }
  }

  rafId = window.requestAnimationFrame(tick)
  root.classList.add("is-ready")

  window.addCleanup(() => {
    window.cancelAnimationFrame(rafId)
    elements.stage.removeEventListener("pointerdown", onPointerDown)
    elements.stage.removeEventListener("pointermove", onPointerMove)
    elements.stage.removeEventListener("pointerup", onPointerUp)
    elements.stage.removeEventListener("pointercancel", onPointerCancel)
    elements.stage.removeEventListener("pointerleave", onPointerCancel)
    window.removeEventListener("resize", scheduleUpdate)
    window.visualViewport?.removeEventListener("resize", scheduleUpdate)
    window.visualViewport?.removeEventListener("scroll", scheduleUpdate)
    if (resizeObserver) {
      resizeObserver.disconnect()
    }
    if (resizeRaf) {
      window.cancelAnimationFrame(resizeRaf)
    }
    root.removeEventListener("services-carousel:layout", onModalLayout)
  })
}

const mountCarousels = () => {
  document
    .querySelectorAll<HTMLElement>("services-carousel, .services-carousel")
    .forEach((root) => {
      initCarousel(root)
    })
}

document.addEventListener("nav", mountCarousels)
mountCarousels()
