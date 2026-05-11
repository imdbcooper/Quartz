const STATIC_DATA_BASE = "/static/data"
const FIRST_TOUCH_KEY = "mc_first_touch"
const PREVIEW_PARAM = "_mc_preview"
const SERVICE_VARIANTS = ["blue", "purple", "orange", "green"]

function isHexColor(value) {
  return typeof value === "string" && /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)
}

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

    if (
      typeof variant.hero?.title === "string" &&
      !Object.prototype.hasOwnProperty.call(variant.hero, "titleParts") &&
      isPlainObject(merged.hero)
    ) {
      delete merged.hero.titleParts
    }

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
      const isCustomFocus = variant === "custom" && isHexColor(card.iconColor)
      iconWrap.className =
        "focus-card__icon " +
        (isCustomFocus ? "focus-card__icon--custom" : "focus-card__icon--" + variant)
      if (isCustomFocus) {
        iconWrap.style.setProperty("--focus-accent", card.iconColor)
      }

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
      const isCustomService = variant === "custom" && isHexColor(item.iconColor)

      const article = document.createElement("article")
      article.className =
        "service-chip service-chip--flippable " +
        (isCustomService ? "service-chip--custom" : "service-chip--" + variant)
      if (isCustomService) {
        article.style.setProperty("--chip-accent", item.iconColor)
      }
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

  function createTextSpan(text, className) {
    const span = document.createElement("span")
    if (className) span.className = className
    span.textContent = typeof text === "string" ? text : ""
    return span
  }

  function renderHeroTitle(data) {
    const title = document.querySelector("[data-home-hero-title]")
    if (!title) return

    const parts =
      Array.isArray(data.hero?.titleParts) && data.hero.titleParts.length > 0
        ? data.hero.titleParts
        : [{ text: typeof data.hero?.title === "string" ? data.hero.title : "" }]

    title.innerHTML = ""
    parts.forEach((part) => {
      title.appendChild(
        createTextSpan(
          typeof part.text === "string" ? part.text : "",
          part.accent ? "central-hero__title-accent" : "",
        ),
      )
    })
  }

  function renderHeroBenefits(data) {
    const list = document.querySelector("[data-home-hero-benefits]")
    if (!list || !Array.isArray(data.hero?.benefits)) return

    list.innerHTML = ""
    data.hero.benefits.forEach((benefit) => {
      const item = document.createElement("div")
      item.className = "central-hero__benefit"
      item.appendChild(createHeroIcon(benefit.icon || "check_circle", "central-hero__benefit-icon"))
      item.appendChild(createTextSpan(typeof benefit.text === "string" ? benefit.text : ""))
      list.appendChild(item)
    })
  }

  function renderHeroVisualTabs(visual) {
    const list = document.querySelector("[data-home-hero-visual-tabs]")
    if (!list || !Array.isArray(visual?.tabs)) return

    list.innerHTML = ""
    visual.tabs.forEach((tab, index) => {
      list.appendChild(createTextSpan(String(tab), index === 0 ? "is-active" : ""))
    })
  }

  function getSparklinePoints(metric) {
    const points =
      Array.isArray(metric.points) && metric.points.length > 1
        ? metric.points
        : [8, 14, 12, 20, 18, 28]
    const min = Math.min(...points)
    const max = Math.max(...points)
    const range = Math.max(max - min, 1)
    const step = 120 / Math.max(points.length - 1, 1)
    return points
      .map((point, index) => {
        const x = Math.round(index * step)
        const y = Math.round(42 - ((point - min) / range) * 34)
        return x + "," + y
      })
      .join(" ")
  }

  function renderHeroVisualMetrics(visual) {
    const list = document.querySelector("[data-home-hero-visual-metrics]")
    if (!list || !Array.isArray(visual?.metrics)) return

    list.innerHTML = ""
    visual.metrics.forEach((metric) => {
      const article = document.createElement("article")
      article.className = "hero-metric hero-metric--" + (metric.tone || "blue")

      const text = document.createElement("div")
      text.appendChild(createTextSpan(metric.label))
      const value = document.createElement("strong")
      value.textContent = typeof metric.value === "string" ? metric.value : ""
      text.appendChild(value)
      if (typeof metric.delta === "string") {
        const delta = document.createElement("em")
        delta.textContent = metric.delta
        text.appendChild(delta)
      }

      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
      svg.setAttribute("viewBox", "0 0 120 48")
      svg.setAttribute("role", "img")
      svg.setAttribute("aria-label", "График: " + (metric.label || "метрика"))
      const line = document.createElementNS("http://www.w3.org/2000/svg", "polyline")
      line.setAttribute("points", getSparklinePoints(metric))
      svg.appendChild(line)

      article.appendChild(text)
      article.appendChild(svg)
      list.appendChild(article)
    })
  }

  function renderHeroVisualIntegrations(visual) {
    const list = document.querySelector("[data-home-hero-visual-integrations]")
    if (!list || !Array.isArray(visual?.integrations)) return

    list.innerHTML = ""
    visual.integrations.forEach((integration) => {
      const item = document.createElement("span")
      item.appendChild(createHeroIcon(integration.icon || "extension", "hero-integrations__icon"))
      item.appendChild(createTextSpan(integration.label))
      list.appendChild(item)
    })
  }

  function renderHeroVisualAutomations(visual) {
    const list = document.querySelector("[data-home-hero-visual-automations]")
    if (!list || !Array.isArray(visual?.automations)) return

    list.innerHTML = ""
    visual.automations.forEach((automation) => {
      const item = document.createElement("div")
      item.className = "hero-automation"
      item.appendChild(createHeroIcon(automation.icon || "rule", "hero-automation__icon"))

      const text = document.createElement("div")
      const label = document.createElement("strong")
      label.textContent = typeof automation.label === "string" ? automation.label : ""
      text.appendChild(label)
      if (typeof automation.value === "string") {
        const value = document.createElement("small")
        value.textContent = automation.value
        text.appendChild(value)
      }
      item.appendChild(text)

      const status = document.createElement("em")
      status.textContent = typeof automation.status === "string" ? automation.status : "Активно"
      item.appendChild(status)
      list.appendChild(item)
    })
  }

  function renderHeroSideCards(visual) {
    const list = document.querySelector("[data-home-hero-side-cards]")
    if (!list || !Array.isArray(visual?.sideCards)) return

    list.innerHTML = ""
    visual.sideCards.forEach((card) => {
      const article = document.createElement("article")
      article.className = "hero-side-card"
      article.appendChild(createHeroIcon(card.icon || "verified", "hero-side-card__icon"))

      const text = document.createElement("div")
      const title = document.createElement("strong")
      title.textContent = typeof card.title === "string" ? card.title : ""
      const desc = document.createElement("p")
      desc.textContent = typeof card.text === "string" ? card.text : ""
      text.appendChild(title)
      text.appendChild(desc)
      article.appendChild(text)
      list.appendChild(article)
    })
  }

  function renderHero(data) {
    renderHeroTitle(data)
    renderHeroTags(data)
    renderHeroBenefits(data)
    if (data.hero?.visual) {
      renderHeroVisualTabs(data.hero.visual)
      renderHeroVisualMetrics(data.hero.visual)
      renderHeroVisualIntegrations(data.hero.visual)
      renderHeroVisualAutomations(data.hero.visual)
      renderHeroSideCards(data.hero.visual)
    }
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

  const heroIconAliases = {
    add_circle: "plus",
    ads_click: "target",
    arrow_forward: "arrow",
    auto_awesome: "spark",
    check_circle: "check",
    dashboard_customize: "dashboard",
    data_object: "code",
    database: "database",
    hub: "nodes",
    integration_instructions: "code",
    monitoring: "chart",
    notifications: "bell",
    payments: "card",
    psychology: "spark",
    receipt_long: "receipt",
    rocket_launch: "rocket",
    rule: "check",
    schedule: "clock",
    schema: "nodes",
    send: "send",
    shield: "shield",
    shopping_bag: "bag",
    terminal: "terminal",
    trending_up: "chart",
    verified: "check",
  }

  const heroIconPaths = {
    arrow: "M5 12h12m-5-5 5 5-5 5",
    bag: "M7 9h10l-.8 9H7.8L7 9Zm3 0V7a2 2 0 0 1 4 0v2",
    bell: "M7 17h10l-1.2-2.2V11a3.8 3.8 0 0 0-7.6 0v3.8L7 17Zm3.4 1.7a2 2 0 0 0 3.2 0",
    card: "M4 8.5h16v8H4v-8Zm0 2.6h16M7 14.5h3.2",
    chart: "M4.5 17.5 9 13l3 2.4 6.5-8.1m-4.6.2h4.6v4.6",
    check: "m5 12.5 4.2 4.1L19 7",
    clock: "M12 4.5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15Zm0 3.4v4.4l3 1.8",
    code: "m9 8-4 4 4 4m6-8 4 4-4 4m-2-9-2 10",
    dashboard: "M5 6h6v5H5V6Zm8 0h6v3h-6V6ZM5 13h6v5H5v-5Zm8-2h6v7h-6v-7Z",
    database:
      "M5 7c0-1.4 3.1-2.5 7-2.5S19 5.6 19 7s-3.1 2.5-7 2.5S5 8.4 5 7Zm0 0v5c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V7M5 12v5c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-5",
    nodes:
      "M7 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm10 13a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM7 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm2.1-4.1 5.8-9.8M9.3 7.2l5.4 9.6",
    plus: "M12 5v14M5 12h14",
    receipt: "M7 4.5h10v15l-2-1.2-2 1.2-2-1.2-2 1.2-2-1.2v-15Zm3 5h4m-4 4h5",
    rocket:
      "M8.4 15.6 5 19l4.8-1.4m4.8-2 1.4-4.8L19 5l-5.8 3-4.8 1.4-3 3 4.1 2.1 2.1 4.1 3-3Zm-1.1-5.1 2 2",
    send: "m4.5 5.5 15 6.5-15 6.5 2-5.1L13 12 6.5 10.6l-2-5.1Z",
    shield: "M12 4.5 18 7v4.7c0 3.5-2.4 6.3-6 7.8-3.6-1.5-6-4.3-6-7.8V7l6-2.5Zm-3 7.4 2.1 2.1 4-4",
    spark:
      "M12 3.8 13.8 9l5.4 1.8-5.4 1.8L12 18l-1.8-5.4-5.4-1.8L10.2 9 12 3.8Zm5 10.6.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z",
    target: "M12 4.5a7.5 7.5 0 1 0 7.5 7.5M12 8a4 4 0 1 0 4 4m-4 0 7-7m-3.5 0H19v3.5",
    terminal: "M5 6.5h14v11H5v-11Zm3 3 2.5 2.5L8 14.5m4.2 0H16",
  }

  function createHeroIcon(iconName, className = "") {
    const kind = heroIconAliases[iconName] || "spark"
    const icon = document.createElement("span")
    icon.className = ["hero-icon", "hero-icon--" + kind, className].filter(Boolean).join(" ")
    icon.setAttribute("aria-hidden", "true")

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    svg.setAttribute("viewBox", "0 0 24 24")
    svg.setAttribute("focusable", "false")
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
    path.setAttribute("d", heroIconPaths[kind] || heroIconPaths.spark)
    svg.appendChild(path)
    icon.appendChild(svg)
    return icon
  }

  function createMaterialIcon(iconName) {
    const icon = document.createElement("span")
    icon.className = "material-symbols-outlined"
    icon.textContent = typeof iconName === "string" && iconName ? iconName : "verified"
    return icon
  }

  function appendWorkSlide(track, dots, slide, index) {
    const slideDiv = document.createElement("div")
    slideDiv.className = "okb-slider__slide" + (index === 0 ? " okb-slider__slide--active" : "")

    const picture = document.createElement("picture")
    const width = Number.isFinite(slide.width) ? slide.width : 800
    const height = Number.isFinite(slide.height) ? slide.height : 450
    const baseAlt =
      typeof slide.alt === "string" && slide.alt ? slide.alt : `Интерфейс проекта ${index + 1}`

    const imgDark = document.createElement("img")
    imgDark.className = "okb-slide-img okb-slide-img--dark"
    imgDark.src = typeof slide.dark === "string" ? slide.dark : ""
    imgDark.alt = `${baseAlt} (Dark)`
    imgDark.loading = "lazy"
    imgDark.width = width
    imgDark.height = height

    const imgLight = document.createElement("img")
    imgLight.className = "okb-slide-img okb-slide-img--light"
    imgLight.src = typeof slide.light === "string" ? slide.light : ""
    imgLight.alt = `${baseAlt} (Light)`
    imgLight.loading = "lazy"
    imgLight.width = width
    imgLight.height = height

    picture.appendChild(imgDark)
    picture.appendChild(imgLight)
    slideDiv.appendChild(picture)
    track.appendChild(slideDiv)

    const dot = document.createElement("span")
    dot.className = "okb-slider__dot" + (index === 0 ? " okb-slider__dot--active" : "")
    dot.dataset.dot = String(index)
    dots.appendChild(dot)
  }

  function renderWorkCard(card) {
    const node = document.createElement("div")
    node.className =
      "okb-card okb-card--" + (typeof card.variant === "string" ? card.variant : "was")

    const corner = document.createElement("div")
    corner.className = "okb-card__corner"
    corner.setAttribute("aria-hidden", "true")
    corner.appendChild(createMaterialIcon(card.cornerIcon || "unfold_more"))

    const top = document.createElement("div")
    top.className = "okb-card__top"

    const label = document.createElement("div")
    label.className = "okb-card__label"
    label.appendChild(createMaterialIcon(card.labelIcon || "verified"))
    const labelText = document.createElement("p")
    labelText.textContent = typeof card.label === "string" ? card.label : ""
    label.appendChild(labelText)

    const title = document.createElement("h4")
    title.textContent = typeof card.title === "string" ? card.title : ""
    top.appendChild(label)
    top.appendChild(title)

    const description = document.createElement("p")
    description.className = "okb-card__sub"
    description.textContent = typeof card.description === "string" ? card.description : ""

    node.appendChild(corner)
    node.appendChild(top)
    node.appendChild(description)
    return node
  }

  function renderWorkItem(item, index) {
    const article = document.createElement("article")
    article.className = "work-card okb-case"
    article.id = typeof item.id === "string" && item.id ? item.id : `work-case-${index + 1}`

    const head = document.createElement("div")
    head.className = "okb-head"
    const badge = document.createElement("span")
    badge.className = "okb-badge"
    badge.textContent = typeof item.badge === "string" ? item.badge : ""
    const title = document.createElement("h3")
    title.textContent = typeof item.title === "string" ? item.title : ""
    head.appendChild(badge)
    head.appendChild(title)

    const body = document.createElement("div")
    body.className = "okb-body"

    const slider = document.createElement("div")
    slider.className = "okb-graph okb-slider"
    slider.dataset.okbSlider = ""
    const track = document.createElement("div")
    track.className = "okb-slider__track"
    track.dataset.okbTrack = ""
    const dots = document.createElement("div")
    dots.className = "okb-slider__dots"
    dots.dataset.okbDots = ""
    const slides = Array.isArray(item.slides) ? item.slides : []
    slides.forEach((slide, slideIndex) => appendWorkSlide(track, dots, slide, slideIndex))
    slider.appendChild(track)
    slider.appendChild(dots)

    const sidebar = document.createElement("div")
    sidebar.className = "okb-sidebar"
    const nav = Array.isArray(item.nav) ? item.nav : []
    nav.forEach((navItem, navIndex) => {
      const button = document.createElement("button")
      button.className = "okb-icon-btn" + (navIndex === 0 ? " okb-icon-btn--active" : "")
      button.type = "button"
      button.dataset.project = typeof navItem.label === "string" ? navItem.label : ""
      button.setAttribute("aria-label", typeof navItem.label === "string" ? navItem.label : "Кейс")
      button.appendChild(createMaterialIcon(navItem.icon || "hub"))
      sidebar.appendChild(button)
    })

    body.appendChild(slider)
    body.appendChild(sidebar)

    const cards = document.createElement("div")
    cards.className = "okb-cards"
    ;(Array.isArray(item.cards) ? item.cards : []).forEach((card) => {
      cards.appendChild(renderWorkCard(card))
    })

    article.appendChild(head)
    article.appendChild(body)
    article.appendChild(cards)
    return article
  }

  function renderWorks(data) {
    const list = document.querySelector("[data-home-works-list]")
    if (!list || !Array.isArray(data.works?.items) || data.works.items.length === 0) return

    list.innerHTML = ""
    data.works.items.forEach((item, index) => {
      list.appendChild(renderWorkItem(item, index))
    })
    startSlider()
  }

  function applyHomeContent(data) {
    setTextByMap(data)
    renderFocusCards(data)
    renderServices(data)
    renderFaq(data)
    renderHero(data)
    renderFooterLinks(data)
    renderWorks(data)

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

      window.__homeWorksItems = Array.isArray(content.works?.items) ? content.works.items : []
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
    if (
      Array.isArray(window.__homeWorksItems) &&
      window.__homeWorksItems.length > 0 &&
      document.querySelector("[data-home-works-list]")
    ) {
      return
    }

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

  document.addEventListener("click", (event) => {
    const btn = event.target.closest(".okb-icon-btn[data-project]")
    if (!btn) return
    document
      .querySelectorAll(".okb-icon-btn[data-project]")
      .forEach((button) => button.classList.remove("okb-icon-btn--active"))

    btn.classList.add("okb-icon-btn--active")
    loadProject(btn.dataset.project)
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
