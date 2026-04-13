const STATIC_DATA_BASE = "/static/data"
const FIRST_TOUCH_KEY = "mc_first_touch"
const PREVIEW_PARAM = "_mc_preview"
const SERVICE_VARIANTS = ["blue", "purple", "orange", "green"]

function initHome() {
  const sliderRoot = document.querySelector("[data-okb-slider]")
  if (sliderRoot && !sliderRoot.dataset.ready) {
    sliderRoot.dataset.ready = "1"
  }

  let intervalId

  function getFaqModal() {
    return document.querySelector("[data-home-faq-modal]")
  }

  function openFaqModal() {
    const modal = getFaqModal()
    if (!modal) return

    modal.hidden = false
    modal.setAttribute("aria-hidden", "false")
    modal.classList.add("is-open")
    document.documentElement.classList.add("home-callback-modal-open")
    document.body.classList.add("home-callback-modal-open")
  }

  function closeFaqModal() {
    const modal = getFaqModal()
    if (!modal) return

    modal.classList.remove("is-open")
    modal.setAttribute("aria-hidden", "true")
    modal.hidden = true
    document.documentElement.classList.remove("home-callback-modal-open")
    document.body.classList.remove("home-callback-modal-open")
  }

  if (!window._homeFaqListenerAttached) {
    window._homeFaqListenerAttached = true
    document.addEventListener("click", (event) => {
      if (event.target.closest("[data-faq-more]")) {
        event.preventDefault()
        openFaqModal()
      }
      if (event.target.closest("[data-home-faq-close]")) {
        event.preventDefault()
        closeFaqModal()
      }

      const modal = getFaqModal()
      if (modal && event.target === modal) {
        closeFaqModal()
      }
    })
  }

  function byPath(obj, path) {
    if (!obj || typeof path !== "string") return undefined

    const keys = path.split(".")
    let cur = obj
    keys.forEach((key) => {
      if (cur != null) {
        cur = cur[key]
      }
    })
    return cur
  }

  function isPlainObject(value) {
    return value != null && typeof value === "object" && !Array.isArray(value)
  }

  function mergeContent(base, override) {
    if (Array.isArray(override)) {
      return override.slice()
    }

    if (!isPlainObject(base) || !isPlainObject(override)) {
      return override === undefined ? base : override
    }

    const merged = { ...base }
    Object.keys(override).forEach((key) => {
      const nextValue = override[key]
      if (nextValue === undefined) return

      if (Array.isArray(nextValue)) {
        merged[key] = nextValue.slice()
        return
      }

      if (isPlainObject(nextValue)) {
        merged[key] = mergeContent(isPlainObject(base[key]) ? base[key] : {}, nextValue)
        return
      }

      merged[key] = nextValue
    })
    return merged
  }

  function setTextByMap(data) {
    document.querySelectorAll("[data-home-text]").forEach((el) => {
      const path = el.getAttribute("data-home-text")
      const value = byPath(data, path)
      if (typeof value === "string") {
        el.textContent = value
      }
    })
  }

  function safeStorage(method, key, value) {
    try {
      if (!window.localStorage) return null
      if (method === "get") return window.localStorage.getItem(key)
      window.localStorage.setItem(key, value)
      return value
    } catch {
      return null
    }
  }

  function isValidCategorySlug(value) {
    return /^[a-z0-9-]+$/.test(value)
  }

  function getPreviewCategory() {
    const params = new URLSearchParams(window.location.search)
    const preview = params.get(PREVIEW_PARAM)
    if (!preview) return null

    const normalized = preview.trim().toLowerCase()
    return normalized === "default" || isValidCategorySlug(normalized) ? normalized : null
  }

  function sortRules(rules) {
    return [...rules].sort((a, b) => {
      const aPriority = Number.isFinite(a.priority) ? a.priority : Number.MAX_SAFE_INTEGER
      const bPriority = Number.isFinite(b.priority) ? b.priority : Number.MAX_SAFE_INTEGER
      return aPriority - bPriority
    })
  }

  function matchRule(rule, params, referrer) {
    if (!rule || typeof rule.category !== "string") return false

    if (rule.type === "utm") {
      const param = typeof rule.param === "string" ? rule.param : "utm_source"
      const actual = params.get(param)
      if (typeof actual !== "string" || typeof rule.match !== "string") return false
      return actual.trim().toLowerCase() === rule.match.trim().toLowerCase()
    }

    if (rule.type === "referrer") {
      if (typeof rule.match !== "string" || !referrer) return false
      try {
        return new RegExp(rule.match, "i").test(referrer)
      } catch {
        return referrer.toLowerCase().includes(rule.match.toLowerCase())
      }
    }

    return false
  }

  async function loadJson(path) {
    const res = await fetch(path)
    if (!res.ok) {
      throw new Error("Failed to load " + path + ": " + res.status)
    }
    return res.json()
  }

  async function loadRules() {
    try {
      const data = await loadJson(`${STATIC_DATA_BASE}/multicontent-rules.json`)
      return {
        defaultCategory:
          typeof data.defaultCategory === "string" && data.defaultCategory
            ? data.defaultCategory
            : "default",
        rules: Array.isArray(data.rules) ? sortRules(data.rules) : [],
      }
    } catch {
      return { defaultCategory: "default", rules: [] }
    }
  }

  async function loadHomeVariant(category, cache = new Map(), stack = new Set()) {
    if (!category || category === "default") {
      return loadJson(`${STATIC_DATA_BASE}/home.json`)
    }

    if (cache.has(category)) {
      return cache.get(category)
    }

    if (stack.has(category)) {
      throw new Error("Circular category inheritance: " + category)
    }

    stack.add(category)

    const variantPath = `${STATIC_DATA_BASE}/home.${category}.json`
    const variant = await loadJson(variantPath)
    const parentCategory =
      typeof variant.extends === "string" && variant.extends ? variant.extends : "default"
    const base =
      parentCategory === "default"
        ? await loadJson(`${STATIC_DATA_BASE}/home.json`)
        : await loadHomeVariant(parentCategory, cache, stack)
    const merged = mergeContent(base, variant)

    cache.set(category, merged)
    stack.delete(category)
    return merged
  }

  async function resolveVariantSelection() {
    const rulesData = await loadRules()
    const previewCategory = getPreviewCategory()
    if (previewCategory) {
      return {
        category: previewCategory,
        reason: "preview",
        isPreview: true,
        rule: null,
      }
    }

    const params = new URLSearchParams(window.location.search)
    const referrer = document.referrer || ""
    const matchedRule = rulesData.rules.find((rule) => matchRule(rule, params, referrer))

    if (matchedRule) {
      const category = matchedRule.category
      const saved = safeStorage("get", FIRST_TOUCH_KEY)
      if (!saved && category !== rulesData.defaultCategory) {
        safeStorage("set", FIRST_TOUCH_KEY, category)
      }

      return {
        category,
        reason: matchedRule.type,
        isPreview: false,
        rule: matchedRule,
      }
    }

    const savedFirstTouch = safeStorage("get", FIRST_TOUCH_KEY)
    if (
      savedFirstTouch &&
      (savedFirstTouch === "default" || isValidCategorySlug(savedFirstTouch))
    ) {
      return {
        category: savedFirstTouch,
        reason: "first-touch",
        isPreview: false,
        rule: null,
      }
    }

    return {
      category: rulesData.defaultCategory,
      reason: "default",
      isPreview: false,
      rule: null,
    }
  }

  function bindServiceChipFlip(root = document) {
    const isTouchLike = window.matchMedia("(hover: none), (pointer: coarse)").matches
    const chips = root.querySelectorAll(".service-chip--flippable")
    chips.forEach((card) => {
      if (card.dataset.flipBound === "true") return
      card.dataset.flipBound = "true"

      if (!isTouchLike) return

      card.addEventListener("click", () => {
        const next = !card.classList.contains("is-open")
        chips.forEach((other) => {
          if (other !== card) other.classList.remove("is-open")
        })
        card.classList.toggle("is-open", next)
      })

      card.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return
        event.preventDefault()
        card.click()
      })
    })
  }

  function renderFocusCards(data) {
    const dynamicFocusList = document.querySelector("[data-home-focus-list]")
    if (!dynamicFocusList || !Array.isArray(data.focus?.cards)) return

    dynamicFocusList.innerHTML = ""
    data.focus.cards.forEach((card) => {
      const article = document.createElement("article")
      article.className = "focus-card"

      const header = document.createElement("div")
      header.className = "focus-card__header"

      const iconWrap = document.createElement("div")
      const variant = typeof card.iconVariant === "string" ? card.iconVariant : "blue"
      iconWrap.className = "focus-card__icon focus-card__icon--" + variant

      const icon = document.createElement("span")
      icon.className = "material-symbols-outlined"
      icon.textContent = typeof card.icon === "string" ? card.icon : "inbox_customize"
      iconWrap.appendChild(icon)

      const title = document.createElement("h3")
      title.textContent = typeof card.title === "string" ? card.title : ""

      const desc = document.createElement("p")
      desc.textContent = typeof card.desc === "string" ? card.desc : ""

      const result = document.createElement("div")
      result.className = "focus-card__result"

      const resultIcon = document.createElement("span")
      resultIcon.className = "material-symbols-outlined"
      resultIcon.textContent = typeof card.resultIcon === "string" ? card.resultIcon : "trending_up"
      result.appendChild(resultIcon)
      result.append(" " + (typeof card.resultText === "string" ? card.resultText : ""))

      header.appendChild(iconWrap)
      header.appendChild(title)
      article.appendChild(header)
      article.appendChild(desc)
      article.appendChild(result)
      dynamicFocusList.appendChild(article)
    })
  }

  function renderServices(data) {
    const dynamicServicesList = document.querySelector("[data-home-services-list]")
    if (!dynamicServicesList || !Array.isArray(data.services?.items)) return

    dynamicServicesList.innerHTML = ""
    data.services.items.forEach((item, index) => {
      const variant =
        typeof item.iconVariant === "string"
          ? item.iconVariant
          : SERVICE_VARIANTS[index % SERVICE_VARIANTS.length]

      const article = document.createElement("article")
      article.className = "service-chip service-chip--flippable service-chip--" + variant
      article.tabIndex = 0
      article.setAttribute("role", "button")
      article.setAttribute(
        "aria-label",
        "Показать описание сервиса " + (typeof item.title === "string" ? item.title : ""),
      )

      const inner = document.createElement("div")
      inner.className = "service-chip__inner"

      const front = document.createElement("div")
      front.className = "service-chip__face service-chip__face--front"

      const back = document.createElement("div")
      back.className = "service-chip__face service-chip__face--back"

      const wrap = document.createElement("span")
      const icon = document.createElement("span")
      icon.className = "material-symbols-outlined"
      icon.textContent = typeof item.icon === "string" ? item.icon : "send"
      wrap.appendChild(icon)

      const h3 = document.createElement("h3")
      h3.textContent = typeof item.title === "string" ? item.title : ""

      const p = document.createElement("p")
      p.textContent = typeof item.backText === "string" ? item.backText : ""

      front.appendChild(wrap)
      front.appendChild(h3)
      back.appendChild(p)
      inner.appendChild(front)
      inner.appendChild(back)
      article.appendChild(inner)
      dynamicServicesList.appendChild(article)
    })

    bindServiceChipFlip(dynamicServicesList)
  }

  function renderFaq(data) {
    if (!Array.isArray(data.faq?.items) || data.faq.items.length === 0) return

    const items = data.faq.items
    const dynamicFaqList = document.querySelector("[data-home-faq-list]")
    if (!dynamicFaqList) return

    const faqTitle = dynamicFaqList.querySelector("[data-faq-title]")
    const faqAnswer = dynamicFaqList.querySelector("[data-faq-answer]")
    if (faqTitle) faqTitle.textContent = items[0].question
    if (faqAnswer) faqAnswer.textContent = items[0].answer

    const modalList = document.querySelector("[data-faq-modal-list]")
    if (modalList) {
      modalList.innerHTML = ""
      items.forEach((item) => {
        const article = document.createElement("article")
        article.className = "faq-modal-item"

        const h3 = document.createElement("h3")
        h3.textContent = item.question
        article.appendChild(h3)

        article.addEventListener("click", (event) => {
          event.preventDefault()
          event.stopPropagation()

          const currentTitle = document.querySelector("[data-faq-title]")
          const currentAnswer = document.querySelector("[data-faq-answer]")
          if (currentTitle) currentTitle.textContent = item.question
          if (currentAnswer) currentAnswer.textContent = item.answer
          closeFaqModal()
        })

        modalList.appendChild(article)
      })
    }
  }

  function renderHeroTags(data) {
    const dynamicHeroTags = document.querySelector("[data-home-hero-tags]")
    if (!dynamicHeroTags || !Array.isArray(data.hero?.tags)) return

    dynamicHeroTags.innerHTML = ""
    data.hero.tags.forEach((tagText) => {
      const span = document.createElement("span")
      span.className = "tag-capsule"
      span.textContent = String(tagText)
      dynamicHeroTags.appendChild(span)
    })
  }

  function renderFooterLinks(data) {
    const footerLinks = document.querySelector("[data-home-footer-links]")
    if (!footerLinks || !Array.isArray(data.footer?.links)) return

    footerLinks.innerHTML = ""
    data.footer.links.forEach((link) => {
      const a = document.createElement("a")
      a.href = typeof link.href === "string" ? link.href : "#"
      a.textContent = typeof link.text === "string" ? link.text : ""
      footerLinks.appendChild(a)
    })
  }

  function applyHomeContent(data) {
    setTextByMap(data)
    renderFocusCards(data)
    renderServices(data)
    renderFaq(data)
    renderHeroTags(data)
    renderFooterLinks(data)

    const callbackAria = document.querySelector("[data-home-contact-callback-aria]")
    if (callbackAria && typeof data.contact?.callbackAria === "string") {
      callbackAria.setAttribute("aria-label", data.contact.callbackAria)
    }
  }

  function trackVariant(selection) {
    if (selection.isPreview || typeof window.plausible !== "function") return

    window.plausible("multicontent-variant", {
      props: {
        source: selection.reason,
        variant: selection.category,
        preview: "0",
      },
    })
  }

  async function loadHomeContent() {
    try {
      const selection = await resolveVariantSelection()
      const content =
        selection.category === "default"
          ? await loadJson(`${STATIC_DATA_BASE}/home.json`)
          : await loadHomeVariant(selection.category)

      document.documentElement.dataset.multicontentVariant = selection.category
      window.__multicontent = {
        category: selection.category,
        reason: selection.reason,
        isPreview: selection.isPreview,
        rule: selection.rule,
      }

      applyHomeContent(content)
      trackVariant(selection)
    } catch (error) {
      console.error("Home load error:", error)
    }
  }

  function startSlider() {
    const slider = document.querySelector("[data-okb-slider]")
    if (!slider) return

    if (intervalId) clearInterval(intervalId)

    const slides = slider.querySelectorAll(".okb-slider__slide")
    const dots = slider.querySelectorAll(".okb-slider__dots .okb-slider__dot")
    let cur = 0
    const len = slides.length

    function go(nextIndex) {
      if (slides.length === 0) return
      slides[cur].classList.remove("okb-slider__slide--active")
      if (dots[cur]) dots[cur].classList.remove("okb-slider__dot--active")
      cur = ((nextIndex % len) + len) % len
      slides[cur].classList.add("okb-slider__slide--active")
      if (dots[cur]) dots[cur].classList.add("okb-slider__dot--active")
    }

    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => go(index))
    })

    intervalId = setInterval(() => go(cur + 1), 4000)
  }

  async function loadProject(projectName) {
    try {
      const res = await fetch("/images/Prodject/" + projectName + "/data.json")
      if (!res.ok) throw new Error("Failed to load project")

      const data = await res.json()
      let projectBadge = data.badge
      let projectTitle = data.title
      if (data.head) {
        if (typeof data.head.badge === "string") projectBadge = data.head.badge
        if (typeof data.head.title === "string") projectTitle = data.head.title
      }

      const headBadge = document.querySelector(".okb-head .okb-badge")
      const headTitle = document.querySelector(".okb-head h3")
      if (headBadge && typeof projectBadge === "string") headBadge.textContent = projectBadge
      if (headTitle && typeof projectTitle === "string") headTitle.textContent = projectTitle

      const wasCard = document.querySelector(".okb-card--was")
      const didCard = document.querySelector(".okb-card--did")
      const resultCard = document.querySelector(".okb-card--result")

      if (wasCard) {
        const wasLabel = wasCard.querySelector(".okb-card__label p")
        if (wasLabel && typeof data.was.label === "string") wasLabel.textContent = data.was.label
        wasCard.querySelector("h4").textContent = data.was.title
        wasCard.querySelector(".okb-card__sub").textContent = data.was.desc
      }

      if (didCard) {
        const didLabel = didCard.querySelector(".okb-card__label p")
        if (didLabel && typeof data.did.label === "string") didLabel.textContent = data.did.label
        didCard.querySelector("h4").textContent = data.did.title
        didCard.querySelector(".okb-card__sub").textContent = data.did.desc
      }

      if (resultCard) {
        const resultLabel = resultCard.querySelector(".okb-card__label p")
        if (resultLabel && typeof data.result.label === "string") {
          resultLabel.textContent = data.result.label
        }
        resultCard.querySelector("h4").textContent = data.result.title
        resultCard.querySelector(".okb-card__sub").textContent = data.result.desc
      }

      const sliderTrack = document.querySelector(".okb-slider__track")
      const dotsContainer = document.querySelector(".okb-slider__dots")
      if (sliderTrack) sliderTrack.innerHTML = ""
      if (dotsContainer) dotsContainer.innerHTML = ""

      if (sliderTrack && dotsContainer && Array.isArray(data.slides)) {
        data.slides.forEach((slide, index) => {
          const slideDiv = document.createElement("div")
          slideDiv.className =
            "okb-slider__slide" + (index === 0 ? " okb-slider__slide--active" : "")

          const imgDark = document.createElement("img")
          imgDark.className = "okb-slide-img okb-slide-img--dark"
          imgDark.src = "/images/Prodject/" + projectName + "/" + slide.dark
          imgDark.loading = "lazy"

          const imgLight = document.createElement("img")
          imgLight.className = "okb-slide-img okb-slide-img--light"
          imgLight.src = "/images/Prodject/" + projectName + "/" + slide.light
          imgLight.loading = "lazy"

          slideDiv.appendChild(imgDark)
          slideDiv.appendChild(imgLight)
          sliderTrack.appendChild(slideDiv)

          const dot = document.createElement("span")
          dot.className = "okb-slider__dot" + (index === 0 ? " okb-slider__dot--active" : "")
          dotsContainer.appendChild(dot)
        })
        startSlider()
      }
    } catch (error) {
      console.error(error)
    }
  }

  document.querySelectorAll(".okb-icon-btn[data-project]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".okb-icon-btn[data-project]")
        .forEach((button) => button.classList.remove("okb-icon-btn--active"))

      btn.classList.add("okb-icon-btn--active")
      loadProject(btn.dataset.project)
    })
  })

  const activeBtn = document.querySelector(".okb-icon-btn.okb-icon-btn--active[data-project]")
  if (activeBtn) {
    loadProject(activeBtn.dataset.project)
  } else {
    startSlider()
  }

  bindServiceChipFlip()
  loadHomeContent()
}

document.addEventListener("nav", initHome)
initHome()
