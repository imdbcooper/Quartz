import type {} from "./util"

type LibraryPageConfig = {
  backendBaseUrl: string
  catalogPath: string
  previewDescriptionLength: number
}

type Category = {
  id: number
  name: string
  description?: string | null
  emoji?: string | null
  books?: Book[]
}

type Book = {
  id: number
  title: string
  author: string
  description?: string | null
  file_extension?: string | null
  coverUrl: string
  coverSrc?: string | null
  number: number
}

type CatalogPayload = {
  schemaVersion: number
  generatedAt: string
  source: string
  categories: Category[]
}

type DisplayBook = Book & {
  categoryName: string
  coverSrc: string
  excerpt: string
  formatLabel: string
}

type CategorySection = {
  section: HTMLElement
  railWrap: HTMLElement
  rail: HTMLElement
  count: HTMLElement
  syncScrollbar: () => void
}

const HOVER_MEDIA_QUERY = "(hover: hover) and (pointer: fine)"
const MODAL_LOCK_CLASS = "library-modal-open"

function addCleanup(fn: (...args: any[]) => void) {
  if (typeof window.addCleanup === "function") {
    window.addCleanup(fn)
  }
}

function clamp(min: number, max: number, value: number) {
  return Math.min(max, Math.max(min, value))
}

function createEl<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string) {
  const el = document.createElement(tag)
  if (className) {
    el.className = className
  }
  return el
}

function readNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function resolveBackendBaseUrl(rawValue: string | undefined) {
  const trimmed = rawValue?.trim() ?? ""
  if (!trimmed) return ""

  try {
    return new URL(trimmed, window.location.href).toString().replace(/\/+$/, "")
  } catch {
    return ""
  }
}

function resolveResourceUrl(rawValue: string | undefined) {
  const trimmed = rawValue?.trim() ?? ""
  if (!trimmed) return ""

  try {
    return new URL(trimmed, window.location.href).toString()
  } catch {
    return ""
  }
}

function buildUrl(baseUrl: string, path: string) {
  return new URL(path, `${baseUrl}/`).toString()
}

function normalizeText(value: string | null | undefined) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : ""
}

function clipText(value: string | null | undefined, limit: number) {
  const normalized = normalizeText(value)
  if (!normalized) return ""
  if (normalized.length <= limit) return normalized

  const sliced = normalized.slice(0, limit)
  const lastSpace = sliced.lastIndexOf(" ")
  const safeSlice = lastSpace > limit * 0.55 ? sliced.slice(0, lastSpace) : sliced
  return `${safeSlice.trim()}…`
}

function pluralizeBooks(count: number) {
  const remainder10 = count % 10
  const remainder100 = count % 100

  if (remainder10 === 1 && remainder100 !== 11) return `${count} книга`
  if (remainder10 >= 2 && remainder10 <= 4 && (remainder100 < 10 || remainder100 >= 20)) {
    return `${count} книги`
  }
  return `${count} книг`
}

function getFormatLabel(value: string | null | undefined) {
  const normalized = normalizeText(value).replace(/^\./, "")
  return normalized ? normalized.toUpperCase() : "Файл"
}

function getFallbackLetter(title: string) {
  return normalizeText(title).charAt(0).toUpperCase() || "•"
}

function isCrossOrigin(baseUrl: string) {
  try {
    return new URL(baseUrl).origin !== window.location.origin
  } catch {
    return false
  }
}

function readConfig(root: HTMLElement): LibraryPageConfig {
  return {
    backendBaseUrl: resolveBackendBaseUrl(root.dataset.libraryBackendBaseUrl),
    catalogPath: resolveResourceUrl(root.dataset.libraryCatalogPath),
    previewDescriptionLength: clamp(
      100,
      320,
      readNumber(root.dataset.libraryPreviewDescriptionLength, 180),
    ),
  }
}

function normalizeBook(book: Book, categoryName: string, config: LibraryPageConfig): DisplayBook {
  return {
    ...book,
    categoryName,
    coverSrc: book.coverSrc
      ? resolveResourceUrl(book.coverSrc)
      : book.coverUrl
        ? buildUrl(config.backendBaseUrl, book.coverUrl)
        : "",
    excerpt: clipText(book.description, config.previewDescriptionLength),
    formatLabel: getFormatLabel(book.file_extension),
  }
}

function setStatus(
  status: HTMLElement,
  message: string,
  tone: "info" | "error" | "success" = "info",
) {
  status.hidden = false
  status.textContent = message
  status.dataset.state = tone
}

function clearStatus(status: HTMLElement) {
  status.hidden = true
  status.textContent = ""
  delete status.dataset.state
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }

  return (await response.json()) as T
}

async function fetchStaticCatalog(url: string) {
  if (!url) return null

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Static catalog request failed: ${response.status}`)
  }

  const payload = (await response.json()) as CatalogPayload
  return Array.isArray(payload.categories) ? payload.categories : null
}

function formatLoadError(error: unknown, backendBaseUrl: string) {
  if (error instanceof TypeError && isCrossOrigin(backendBaseUrl)) {
    return `Не удалось загрузить библиотеку. Проверьте, что backend разрешает origin ${window.location.origin} в ALLOWED_ORIGINS.`
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return "Не удалось загрузить библиотеку."
}

function syncImage(
  image: HTMLImageElement | null,
  fallback: HTMLElement | null,
  title: string,
  source: string,
) {
  if (!image || !fallback) return

  fallback.textContent = getFallbackLetter(title)

  const showFallback = () => {
    image.hidden = true
    fallback.hidden = false
  }

  const showImage = () => {
    image.hidden = false
    fallback.hidden = true
  }

  if (!source) {
    image.removeAttribute("src")
    showFallback()
    return
  }

  image.alt = `Обложка: ${title}`
  image.hidden = true
  fallback.hidden = false
  image.onload = () => showImage()
  image.onerror = () => showFallback()
  image.src = source
}

function getScrollDelta(event: WheelEvent) {
  const dominantDelta =
    Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX
  return Number.isFinite(dominantDelta) ? dominantDelta : 0
}

function bindHorizontalScrollbar(
  railWrap: HTMLElement,
  rail: HTMLElement,
  scrollbar: HTMLElement,
  thumb: HTMLElement,
) {
  let resizeObserver: ResizeObserver | null = null
  let dragPointerId: number | null = null
  let dragOffset = 0
  let thumbWidth = 0
  let maxScroll = 0
  let maxThumbOffset = 0

  const syncScrollbar = () => {
    const trackWidth = Math.max(0, railWrap.clientWidth)
    maxScroll = Math.max(0, railWrap.scrollWidth - railWrap.clientWidth)
    if (trackWidth === 0 || maxScroll <= 1) {
      scrollbar.hidden = true
      thumb.style.width = ""
      thumb.style.setProperty("--library-scrollbar-thumb-x", "0px")
      return
    }

    const visibleRatio = railWrap.scrollWidth > 0 ? railWrap.clientWidth / railWrap.scrollWidth : 1
    thumbWidth = clamp(36, trackWidth, Math.round(trackWidth * visibleRatio))
    maxThumbOffset = Math.max(0, trackWidth - thumbWidth)

    const progress = maxScroll > 0 ? railWrap.scrollLeft / maxScroll : 0
    scrollbar.hidden = false
    thumb.style.width = `${thumbWidth}px`
    thumb.style.setProperty(
      "--library-scrollbar-thumb-x",
      `${Math.round(progress * maxThumbOffset)}px`,
    )
  }

  const setScrollFromClientX = (clientX: number, preserveThumbOffset: boolean) => {
    if (maxScroll <= 0) return

    const rect = scrollbar.getBoundingClientRect()
    if (rect.width <= 0) return

    const relativeX = clamp(0, rect.width, clientX - rect.left)
    const nextThumbOffset = clamp(
      0,
      maxThumbOffset,
      preserveThumbOffset ? relativeX - dragOffset : relativeX - thumbWidth / 2,
    )
    const progress = maxThumbOffset > 0 ? nextThumbOffset / maxThumbOffset : 0
    railWrap.scrollLeft = progress * maxScroll
  }

  const stopDragging = (pointerId?: number) => {
    if (dragPointerId === null) return

    const activePointerId = dragPointerId
    dragPointerId = null
    scrollbar.classList.remove("is-dragging")
    if (
      typeof pointerId === "number" &&
      activePointerId === pointerId &&
      scrollbar.hasPointerCapture?.(pointerId)
    ) {
      scrollbar.releasePointerCapture(pointerId)
    }
  }

  const onScroll = () => syncScrollbar()
  const onWheel = (event: WheelEvent) => {
    if (scrollbar.hidden) return

    const delta = getScrollDelta(event)
    if (delta === 0) return

    event.preventDefault()
    railWrap.scrollLeft += delta
  }
  const onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0 || scrollbar.hidden) return

    const target = event.target
    const targetIsThumb = target instanceof Node ? thumb.contains(target) : false
    dragPointerId = event.pointerId
    dragOffset = targetIsThumb
      ? clamp(0, thumbWidth, event.clientX - thumb.getBoundingClientRect().left)
      : thumbWidth / 2

    scrollbar.classList.add("is-dragging")
    scrollbar.setPointerCapture?.(event.pointerId)
    setScrollFromClientX(event.clientX, targetIsThumb)
    event.preventDefault()
  }
  const onPointerMove = (event: PointerEvent) => {
    if (dragPointerId !== event.pointerId) return

    setScrollFromClientX(event.clientX, true)
    event.preventDefault()
  }
  const onPointerUp = (event: PointerEvent) => {
    if (dragPointerId !== event.pointerId) return
    stopDragging(event.pointerId)
  }
  const onPointerCancel = (event: PointerEvent) => {
    if (dragPointerId !== event.pointerId) return
    stopDragging(event.pointerId)
  }
  const onLostPointerCapture = () => stopDragging()
  const onWindowResize = () => syncScrollbar()

  railWrap.addEventListener("scroll", onScroll)
  scrollbar.addEventListener("wheel", onWheel, { passive: false })
  scrollbar.addEventListener("pointerdown", onPointerDown)
  scrollbar.addEventListener("pointermove", onPointerMove)
  scrollbar.addEventListener("pointerup", onPointerUp)
  scrollbar.addEventListener("pointercancel", onPointerCancel)
  scrollbar.addEventListener("lostpointercapture", onLostPointerCapture)
  window.addEventListener("resize", onWindowResize)

  if ("ResizeObserver" in window) {
    resizeObserver = new ResizeObserver(() => syncScrollbar())
    resizeObserver.observe(railWrap)
    resizeObserver.observe(rail)
  }

  addCleanup(() => {
    railWrap.removeEventListener("scroll", onScroll)
    scrollbar.removeEventListener("wheel", onWheel)
    scrollbar.removeEventListener("pointerdown", onPointerDown)
    scrollbar.removeEventListener("pointermove", onPointerMove)
    scrollbar.removeEventListener("pointerup", onPointerUp)
    scrollbar.removeEventListener("pointercancel", onPointerCancel)
    scrollbar.removeEventListener("lostpointercapture", onLostPointerCapture)
    window.removeEventListener("resize", onWindowResize)
    resizeObserver?.disconnect()
    stopDragging()
  })

  return syncScrollbar
}

function mountLibraryPage(root: HTMLElement) {
  if (root.dataset.libraryPageMounted === "true") return
  root.dataset.libraryPageMounted = "true"

  const config = readConfig(root)
  const status = root.querySelector<HTMLElement>("[data-library-status]")
  const categoriesContainer = root.querySelector<HTMLElement>("[data-library-categories]")
  const preview = root.querySelector<HTMLElement>("[data-library-preview]")
  const previewMeta = preview?.querySelector<HTMLElement>("[data-library-preview-meta]")
  const previewTitle = preview?.querySelector<HTMLElement>("[data-library-preview-title]")
  const previewAuthor = preview?.querySelector<HTMLElement>("[data-library-preview-author]")
  const previewDescription = preview?.querySelector<HTMLElement>(
    "[data-library-preview-description]",
  )
  const modal = root.querySelector<HTMLElement>("[data-library-modal]")
  const modalDialog = root.querySelector<HTMLElement>("[data-library-modal-dialog]")
  const modalCover = modal?.querySelector<HTMLImageElement>("[data-library-modal-cover]")
  const modalCoverFallback = modal?.querySelector<HTMLElement>(
    "[data-library-modal-cover-fallback]",
  )
  const modalMeta = modal?.querySelector<HTMLElement>("[data-library-modal-meta]")
  const modalTitle = modal?.querySelector<HTMLElement>("[data-library-modal-title]")
  const modalAuthor = modal?.querySelector<HTMLElement>("[data-library-modal-author]")
  const modalDescription = modal?.querySelector<HTMLElement>("[data-library-modal-description]")
  const modalCloseButtons = Array.from(
    modal?.querySelectorAll<HTMLElement>("[data-library-modal-close]") ?? [],
  )

  if (
    !status ||
    !categoriesContainer ||
    !preview ||
    !previewMeta ||
    !previewTitle ||
    !previewAuthor ||
    !previewDescription ||
    !modal ||
    !modalDialog ||
    !modalCover ||
    !modalCoverFallback ||
    !modalMeta ||
    !modalTitle ||
    !modalAuthor ||
    !modalDescription
  ) {
    return
  }

  if (!config.backendBaseUrl) {
    setStatus(status, "Не задан backendBaseUrl для страницы библиотеки.", "error")
    return
  }

  const hoverMedia = window.matchMedia(HOVER_MEDIA_QUERY)
  const categorySections = new Map<number, CategorySection>()
  const booksCache = new Map<number, DisplayBook[]>()
  const pendingLoads = new Map<number, Promise<DisplayBook[]>>()
  let staticCatalogPromise: Promise<Category[] | null> | null = null
  let observer: IntersectionObserver | null = null
  let modalOpen = false
  let lastFocused: HTMLElement | null = null
  let focusRestoreFrame = 0
  let activePreviewTrigger: HTMLElement | null = null
  let previewRaf = 0

  const lockScroll = () => {
    document.documentElement.classList.add(MODAL_LOCK_CLASS)
    document.body.classList.add(MODAL_LOCK_CLASS)
  }

  const unlockScroll = () => {
    document.documentElement.classList.remove(MODAL_LOCK_CLASS)
    document.body.classList.remove(MODAL_LOCK_CLASS)
  }

  const hidePreview = () => {
    activePreviewTrigger = null
    if (previewRaf) {
      window.cancelAnimationFrame(previewRaf)
      previewRaf = 0
    }
    preview.classList.remove("is-visible")
    preview.hidden = true
    preview.setAttribute("aria-hidden", "true")
  }

  const positionPreview = (trigger: HTMLElement) => {
    if (preview.hidden) return
    const triggerRect = trigger.getBoundingClientRect()
    const previewRect = preview.getBoundingClientRect()
    const gap = 14
    const viewportPadding = 16
    const maxLeft = Math.max(16, window.innerWidth - previewRect.width - 16)
    const maxTop = Math.max(16, window.innerHeight - previewRect.height - 16)
    const rightSpace = window.innerWidth - triggerRect.right - gap - viewportPadding
    const leftSpace = triggerRect.left - gap - viewportPadding
    const prefersRight = rightSpace >= previewRect.width || rightSpace >= leftSpace
    const placeRight = triggerRect.right + gap
    const placeLeft = triggerRect.left - previewRect.width - gap

    let left = prefersRight ? placeRight : placeLeft
    left = Math.min(maxLeft, Math.max(viewportPadding, left))

    let top = triggerRect.top
    if (top + previewRect.height > window.innerHeight - viewportPadding) {
      top = triggerRect.bottom - previewRect.height
    }
    top = Math.min(maxTop, Math.max(viewportPadding, top))

    preview.style.left = `${Math.round(left)}px`
    preview.style.top = `${Math.round(top)}px`
  }

  const showPreview = (book: DisplayBook, trigger: HTMLElement) => {
    if (!hoverMedia.matches || modalOpen) return

    activePreviewTrigger = trigger
    previewMeta.textContent = `${book.categoryName} · ${book.formatLabel}`
    previewTitle.textContent = book.title
    previewAuthor.textContent = book.author
    previewDescription.textContent = book.excerpt || "Описание книги пока не добавлено в каталоге."

    preview.hidden = false
    preview.setAttribute("aria-hidden", "false")
    preview.classList.add("is-visible")

    if (previewRaf) {
      window.cancelAnimationFrame(previewRaf)
    }
    previewRaf = window.requestAnimationFrame(() => {
      previewRaf = 0
      if (activePreviewTrigger === trigger) {
        positionPreview(trigger)
      }
    })
  }

  const closeModal = (restoreFocus = true) => {
    if (!modalOpen) return

    modalOpen = false
    modal.classList.remove("is-open")
    modal.setAttribute("aria-hidden", "true")
    modal.hidden = true
    unlockScroll()

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

  const openModal = (book: DisplayBook, trigger?: HTMLElement | null) => {
    hidePreview()
    lastFocused =
      trigger ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null)

    modalMeta.textContent = `${book.categoryName} · №${book.number} · ${book.formatLabel}`
    modalTitle.textContent = book.title
    modalAuthor.textContent = book.author
    modalDescription.textContent =
      normalizeText(book.description) || "Описание книги пока не добавлено в каталоге."
    syncImage(modalCover, modalCoverFallback, book.title, book.coverSrc)

    modal.hidden = false
    modal.setAttribute("aria-hidden", "false")
    modal.classList.add("is-open")
    modalOpen = true
    lockScroll()

    const closeButton = modal.querySelector<HTMLButtonElement>("button[data-library-modal-close]")
    closeButton?.focus()
  }

  const createSkeletonBook = () => {
    const skeleton = createEl("div", "library-page__book library-page__book--skeleton")
    skeleton.setAttribute("aria-hidden", "true")
    return skeleton
  }

  const renderCategoryMessage = (
    rail: HTMLElement,
    count: HTMLElement,
    className: string,
    message: string,
  ) => {
    rail.innerHTML = ""
    const state = createEl("div", className)
    state.textContent = message
    rail.append(state)
    count.textContent = message
  }

  const createBookButton = (book: DisplayBook) => {
    const button = createEl("button", "library-page__book") as HTMLButtonElement
    const cover = createEl("span", "library-page__book-cover")
    const image = createEl("img", "library-page__book-image") as HTMLImageElement
    const fallback = createEl("span", "library-page__book-fallback")

    button.type = "button"
    button.setAttribute("aria-label", `Открыть карточку книги ${book.title}`)

    syncImage(image, fallback, book.title, book.coverSrc)

    cover.append(image, fallback)
    button.append(cover)

    const onEnter = () => showPreview(book, button)
    const onLeave = () => hidePreview()
    const onClick = () => openModal(book, button)

    button.addEventListener("mouseenter", onEnter)
    button.addEventListener("focus", onEnter)
    button.addEventListener("mouseleave", onLeave)
    button.addEventListener("blur", onLeave)
    button.addEventListener("click", onClick)

    addCleanup(() => {
      button.removeEventListener("mouseenter", onEnter)
      button.removeEventListener("focus", onEnter)
      button.removeEventListener("mouseleave", onLeave)
      button.removeEventListener("blur", onLeave)
      button.removeEventListener("click", onClick)
    })

    return button
  }

  const renderBooks = (category: Category, books: DisplayBook[]) => {
    const section = categorySections.get(category.id)
    if (!section) return

    section.rail.innerHTML = ""
    section.count.textContent = pluralizeBooks(books.length)

    if (books.length === 0) {
      renderCategoryMessage(
        section.rail,
        section.count,
        "library-page__category-empty",
        "В этой категории пока нет книг.",
      )
      section.syncScrollbar()
      return
    }

    books.forEach((book) => {
      section.rail.append(createBookButton(book))
    })
    section.syncScrollbar()
  }

  const loadStaticCategories = () => {
    if (!config.catalogPath) {
      return Promise.resolve(null)
    }

    if (!staticCatalogPromise) {
      staticCatalogPromise = fetchStaticCatalog(config.catalogPath).catch(() => null)
    }

    return staticCatalogPromise
  }

  const loadBooks = async (category: Category) => {
    if (booksCache.has(category.id)) {
      return booksCache.get(category.id)!
    }

    const existing = pendingLoads.get(category.id)
    if (existing) return existing

    const request = (async () => {
      try {
        const books = await fetchJson<Book[]>(
          buildUrl(config.backendBaseUrl, `/api/categories/${category.id}/books`),
        )
        const normalized = books.map((book) => normalizeBook(book, category.name, config))
        booksCache.set(category.id, normalized)
        return normalized
      } catch (liveError) {
        const staticCategories = await loadStaticCategories()
        const staticCategory = staticCategories?.find((item) => item.id === category.id)

        if (Array.isArray(staticCategory?.books)) {
          const normalized = staticCategory.books.map((book) =>
            normalizeBook(book, category.name, config),
          )
          booksCache.set(category.id, normalized)
          return normalized
        }

        throw liveError
      } finally {
        pendingLoads.delete(category.id)
      }
    })()

    pendingLoads.set(category.id, request)
    return request
  }

  const ensureCategoryBooks = async (category: Category) => {
    const section = categorySections.get(category.id)
    if (!section || section.section.dataset.loaded === "true") return

    section.section.dataset.loaded = "pending"
    section.count.textContent = "Загрузка..."

    try {
      const books = await loadBooks(category)
      section.section.dataset.loaded = "true"
      renderBooks(category, books)
    } catch (error) {
      section.section.dataset.loaded = "error"
      renderCategoryMessage(
        section.rail,
        section.count,
        "library-page__category-error",
        formatLoadError(error, config.backendBaseUrl),
      )
      section.syncScrollbar()
    }
  }

  const renderCategory = (category: Category, index: number) => {
    const section = createEl("section", "library-page__category")
    const titleId = `library-category-title-${category.id}`
    const header = createEl("div", "library-page__category-header")
    const titleWrap = createEl("div", "library-page__category-title-wrap")
    const title = createEl("h3", "library-page__category-title")
    const description = createEl("p", "library-page__category-description")
    const count = createEl("span", "library-page__category-count")
    const railWrap = createEl("div", "library-page__rail-wrap")
    const rail = createEl("div", "library-page__rail")
    const scrollbar = createEl("div", "library-page__scrollbar")
    const scrollbarThumb = createEl("div", "library-page__scrollbar-thumb")
    const hint = createEl("p", "library-page__rail-hint")

    section.dataset.categoryId = String(category.id)
    section.setAttribute("aria-labelledby", titleId)

    title.id = titleId
    title.textContent = category.name
    description.textContent =
      normalizeText(category.description) || "Описание категории пока не добавлено."
    count.textContent = "Загрузка..."
    hint.textContent = hoverMedia.matches
      ? "Тяните полосу прокрутки ниже или крутите колесо мыши прямо над ней."
      : "Пролистывайте обложки по горизонтали."
    rail.setAttribute("aria-label", `Книги категории ${category.name}`)
    rail.tabIndex = 0
    scrollbar.hidden = true

    Array.from({ length: 6 }, () => createSkeletonBook()).forEach((item) => rail.append(item))

    titleWrap.append(title, description)
    header.append(titleWrap, count)
    scrollbar.append(scrollbarThumb)
    railWrap.append(rail)
    section.append(header, railWrap, scrollbar, hint)
    categoriesContainer.append(section)
    const syncScrollbar = bindHorizontalScrollbar(railWrap, rail, scrollbar, scrollbarThumb)
    categorySections.set(category.id, { section, railWrap, rail, count, syncScrollbar })
    syncScrollbar()

    if (Array.isArray(category.books)) {
      const normalizedBooks = category.books.map((book) =>
        normalizeBook(book, category.name, config),
      )
      booksCache.set(category.id, normalizedBooks)
      section.dataset.loaded = "true"
      renderBooks(category, normalizedBooks)
      return
    }

    if (index === 0) {
      void ensureCategoryBooks(category)
      return
    }

    if (!observer) {
      void ensureCategoryBooks(category)
      return
    }

    observer.observe(section)
  }

  const onModalClose = (event: Event) => {
    event.preventDefault()
    closeModal()
  }

  const onModalKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault()
      event.stopPropagation()
      closeModal()
    }
  }

  const onWindowScroll = () => hidePreview()
  const onWindowResize = () => {
    if (activePreviewTrigger && !preview.hidden) {
      positionPreview(activePreviewTrigger)
    }
    if (hoverMedia.matches === false) {
      hidePreview()
    }
  }

  modalCloseButtons.forEach((button) => button.addEventListener("click", onModalClose))
  document.addEventListener("keydown", onModalKeyDown)
  window.addEventListener("scroll", onWindowScroll, { passive: true })
  window.addEventListener("resize", onWindowResize)
  hoverMedia.addEventListener("change", onWindowResize)

  addCleanup(() => {
    observer?.disconnect()
    modalCloseButtons.forEach((button) => button.removeEventListener("click", onModalClose))
    document.removeEventListener("keydown", onModalKeyDown)
    window.removeEventListener("scroll", onWindowScroll)
    window.removeEventListener("resize", onWindowResize)
    hoverMedia.removeEventListener("change", onWindowResize)
    if (focusRestoreFrame) {
      window.cancelAnimationFrame(focusRestoreFrame)
    }
    if (previewRaf) {
      window.cancelAnimationFrame(previewRaf)
    }
    closeModal(false)
    hidePreview()
  })

  if ("IntersectionObserver" in window) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const categoryId = Number((entry.target as HTMLElement).dataset.categoryId)
          const category = categories.find((item) => item.id === categoryId)
          if (category) {
            void ensureCategoryBooks(category)
          }
          observer?.unobserve(entry.target)
        })
      },
      { rootMargin: "240px 0px" },
    )
  }

  let categories: Category[] = []

  const init = async () => {
    setStatus(status, "Загружаем категории...", "info")

    try {
      categories = await fetchJson<Category[]>(buildUrl(config.backendBaseUrl, "/api/categories"))

      if (!Array.isArray(categories) || categories.length === 0) {
        categoriesContainer.innerHTML = ""
        setStatus(status, "Категории пока не найдены.", "success")
        return
      }

      clearStatus(status)
      categoriesContainer.innerHTML = ""
      categories.forEach((category, index) => renderCategory(category, index))
    } catch (liveError) {
      const staticCategories = await loadStaticCategories()
      if (staticCategories) {
        categories = staticCategories

        if (!Array.isArray(categories) || categories.length === 0) {
          categoriesContainer.innerHTML = ""
          setStatus(status, "Категории пока не найдены.", "success")
          return
        }

        clearStatus(status)
        categoriesContainer.innerHTML = ""
        categories.forEach((category, index) => renderCategory(category, index))
        return
      }

      categoriesContainer.innerHTML = ""
      setStatus(status, formatLoadError(liveError, config.backendBaseUrl), "error")
    }
  }

  void init()
}

const mountLibraryPages = () => {
  document.querySelectorAll<HTMLElement>("[data-library-page-root]").forEach((root) => {
    mountLibraryPage(root)
  })
}

document.addEventListener("nav", mountLibraryPages)
mountLibraryPages()
