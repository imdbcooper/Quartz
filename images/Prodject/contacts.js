const STATIC_DATA_BASE = "/static/data"
const FIRST_TOUCH_KEY = "mc_first_touch"
const PREVIEW_PARAM = "_mc_preview"

function initContacts() {
  const central = document.querySelector(".contacts-central")
  if (!central) return

  if (central.dataset.initialized) return
  central.dataset.initialized = "true"

  function byPath(obj, path) {
    if (!obj || typeof path !== "string") return undefined

    const keys = path.split(".")
    let cur = obj
    keys.forEach((key) => {
      if (cur != null) cur = cur[key]
    })
    return cur
  }

  function isPlainObject(value) {
    return value != null && typeof value === "object" && !Array.isArray(value)
  }

  function mergeContent(base, override) {
    if (Array.isArray(override)) return override.slice()

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

  function applyPageLayout(data) {
    const container = document.querySelector(".contacts-central")
    if (!container) return

    const blockNodes = Array.from(container.querySelectorAll("[data-contacts-block]"))
    if (blockNodes.length === 0) return

    const blockMap = new Map()
    blockNodes.forEach((node) => {
      const block = node.getAttribute("data-contacts-block")
      if (block && !blockMap.has(block)) {
        blockMap.set(block, node)
      }
    })

    const layout = Array.isArray(data.pageLayout)
      ? data.pageLayout.filter(
          (block, index, list) =>
            typeof block === "string" && blockMap.has(block) && list.indexOf(block) === index,
        )
      : Array.from(blockMap.keys())

    blockMap.forEach((node, block) => {
      node.hidden = !layout.includes(block)
    })

    layout.forEach((block) => {
      const node = blockMap.get(block)
      if (node) {
        container.appendChild(node)
      }
    })
  }

  function setTextByMap(data) {
    document.querySelectorAll("[data-contacts-text]").forEach((el) => {
      const path = el.getAttribute("data-contacts-text")
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

  async function loadJson(path, options = {}) {
    const res = await fetch(path)
    if (!res.ok) {
      if (options.allowNotFound && res.status === 404) {
        return null
      }
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

  async function loadContactsVariant(category, cache = new Map(), stack = new Set()) {
    if (!category || category === "default") {
      return loadJson(`${STATIC_DATA_BASE}/contacts.json`)
    }

    if (cache.has(category)) {
      return cache.get(category)
    }

    if (stack.has(category)) {
      throw new Error("Circular contacts category inheritance: " + category)
    }

    stack.add(category)

    const baseContacts = await loadJson(`${STATIC_DATA_BASE}/contacts.json`)
    const variantPath = `${STATIC_DATA_BASE}/contacts.${category}.json`
    const variant = await loadJson(variantPath, { allowNotFound: true })
    if (!variant) {
      cache.set(category, baseContacts)
      stack.delete(category)
      return baseContacts
    }

    const parentCategory =
      typeof variant.extends === "string" && variant.extends ? variant.extends : "default"
    const base =
      parentCategory === "default"
        ? baseContacts
        : await loadContactsVariant(parentCategory, cache, stack)
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

  function createSvgIcon(kind, className) {
    const svgNS = "http://www.w3.org/2000/svg"
    const svg = document.createElementNS(svgNS, "svg")
    svg.setAttribute("class", className)
    svg.setAttribute("viewBox", "0 0 24 24")
    svg.setAttribute("fill", "none")
    svg.setAttribute("aria-hidden", "true")

    const addPath = (d, extra = {}) => {
      const path = document.createElementNS(svgNS, "path")
      path.setAttribute("d", d)
      path.setAttribute("stroke", "currentColor")
      path.setAttribute("stroke-width", "1.8")
      path.setAttribute("stroke-linecap", "round")
      path.setAttribute("stroke-linejoin", "round")
      Object.entries(extra).forEach(([key, value]) => path.setAttribute(key, value))
      svg.appendChild(path)
    }

    switch (kind) {
      case "send":
        addPath("M21 4L3 11.53L10.2 13.93L12.6 21L21 4Z")
        addPath("M10.2 13.93L21 4")
        break
      case "mail":
        addPath("M4 6H20V18H4Z")
        addPath("M4 8L12 13L20 8")
        break
      case "call":
        addPath(
          "M15.8 14.8C14.7 15.9 13.5 17.1 11.9 16.8C10.3 16.4 8.8 15.1 7.5 13.8C6.2 12.5 4.9 11 4.5 9.4C4.2 7.8 5.4 6.6 6.5 5.5L7.2 4.8C7.6 4.4 8.3 4.4 8.7 4.8L11.1 7.2C11.5 7.6 11.5 8.3 11.1 8.7L9.9 9.9C10.3 10.8 11 11.7 11.9 12.6C12.8 13.5 13.7 14.2 14.6 14.6L15.8 13.4C16.2 13 16.9 13 17.3 13.4L19.7 15.8C20.1 16.2 20.1 16.9 19.7 17.3L19 18C17.9 19.1 16.7 20.3 15.1 20",
        )
        break
      case "arrow_forward":
        addPath("M5 12H19", { "stroke-linejoin": "miter" })
        addPath("M12 5L19 12L12 19")
        break
      default:
        return document.createTextNode("")
    }

    return svg
  }

  function renderHeroTags(data) {
    const heroTags = document.querySelector("[data-contacts-hero-tags]")
    if (!heroTags || !Array.isArray(data.hero?.tags)) return

    heroTags.innerHTML = ""
    data.hero.tags.forEach((tag) => {
      const span = document.createElement("span")
      span.className = "contacts-tag"
      span.textContent = tag
      heroTags.appendChild(span)
    })
  }

  function renderChannels(data) {
    const channelsGrid = document.querySelector("[data-contacts-channels-grid]")
    if (!channelsGrid || !Array.isArray(data.fastContact?.channels)) return

    channelsGrid.innerHTML = ""
    data.fastContact.channels.forEach((ch) => {
      const a = document.createElement("a")
      a.href = ch.href
      a.className =
        "contacts-channel" + (ch.type === "telegram" ? " contacts-channel--primary" : "")
      a.setAttribute("aria-label", "Связаться в " + ch.label)

      const icon = document.createElement("span")
      icon.className = "contacts-channel__icon"
      icon.setAttribute("aria-hidden", "true")
      icon.appendChild(createSvgIcon(ch.icon, "contacts-channel__icon-svg"))

      const copy = document.createElement("div")
      copy.className = "contacts-channel__copy"
      const label = document.createElement("span")
      label.className = "contacts-channel__label"
      label.textContent = ch.label
      const value = document.createElement("strong")
      value.className = "contacts-channel__value"
      value.textContent = ch.value
      copy.appendChild(label)
      copy.appendChild(value)

      const arrow = document.createElement("span")
      arrow.className = "contacts-channel__arrow"
      arrow.setAttribute("aria-hidden", "true")
      arrow.appendChild(createSvgIcon("arrow_forward", "contacts-channel__arrow-svg"))

      a.appendChild(icon)
      a.appendChild(copy)
      a.appendChild(arrow)
      channelsGrid.appendChild(a)
    })
  }

  function renderWorkflow(data) {
    const stepsGrid = document.querySelector("[data-contacts-steps-grid]")
    if (!stepsGrid || !Array.isArray(data.workflow?.steps)) return

    stepsGrid.innerHTML = ""
    data.workflow.steps.forEach((step) => {
      const art = document.createElement("article")
      art.className = "contacts-step-card"

      const top = document.createElement("div")
      top.className = "contacts-step-card__top"
      const num = document.createElement("span")
      num.className = "contacts-step-card__number"
      num.textContent = step.num
      const icon = document.createElement("span")
      icon.className = "material-symbols-outlined"
      icon.textContent = step.icon
      top.appendChild(num)
      top.appendChild(icon)

      const h3 = document.createElement("h3")
      h3.textContent = step.title
      const p = document.createElement("p")
      p.textContent = step.desc

      art.appendChild(top)
      art.appendChild(h3)
      art.appendChild(p)
      stepsGrid.appendChild(art)
    })
  }

  function renderFaq(data) {
    const faqList = document.querySelector("[data-contacts-faq-list]")
    if (!faqList || !Array.isArray(data.faq?.items)) return

    faqList.innerHTML = ""
    data.faq.items.forEach((item) => {
      const det = document.createElement("details")
      det.className = "contacts-faq-item"
      const sum = document.createElement("summary")
      sum.append(document.createTextNode(item.question))
      const icon = document.createElement("span")
      icon.className = "material-symbols-outlined"
      icon.textContent = "expand_more"
      sum.appendChild(icon)
      const p = document.createElement("p")
      p.textContent = item.answer
      det.appendChild(sum)
      det.appendChild(p)
      faqList.appendChild(det)
    })
  }

  function setContactLinks(data) {
    const tgLinks = document.querySelectorAll("[data-contacts-link-tg]")
    tgLinks.forEach((link) => {
      link.href = data.hero?.tgLink || "https://t.me/slavxRu"
    })

    const emailLinks = document.querySelectorAll("[data-contacts-link-email]")
    emailLinks.forEach((link) => {
      link.href = data.hero?.emailLink || "mailto:info@slavx.ru"
    })

    const telLinks = document.querySelectorAll("[data-contacts-link-tel]")
    telLinks.forEach((link) => {
      const telValue = typeof data.cta?.tel === "string" ? data.cta.tel : ""
      const normalized = telValue.replace(/[^\d+]/g, "")
      if (normalized) {
        link.href = `tel:${normalized}`
      }
    })

    const fastLinks = document.querySelectorAll("[data-contacts-link-fast]")
    fastLinks.forEach((link) => {
      const href = data.formats?.fast?.href
      if (typeof href === "string" && href) {
        link.href = href
      }
    })
  }

  function preservePreviewParamForInternalLinks(previewCategory) {
    if (!previewCategory || previewCategory === "default") return

    document.querySelectorAll("a[href]").forEach((anchor) => {
      const rawHref = anchor.getAttribute("href") || ""
      if (!rawHref || rawHref.startsWith("#") || /^[a-z]+:/i.test(rawHref)) return

      try {
        const url = new URL(rawHref, window.location.href)
        if (url.origin !== window.location.origin) return
        url.searchParams.set(PREVIEW_PARAM, previewCategory)
        anchor.href = url.toString()
      } catch {}
    })
  }

  function applyContactsContent(data, selection) {
    applyPageLayout(data)
    setTextByMap(data)
    renderHeroTags(data)
    renderChannels(data)
    renderWorkflow(data)
    renderFaq(data)
    setContactLinks(data)
    if (selection.isPreview) {
      preservePreviewParamForInternalLinks(selection.category)
    }
  }

  function trackVariant(selection) {
    if (selection.isPreview || typeof window.plausible !== "function") return

    window.plausible("multicontent-variant", {
      props: {
        source: selection.reason,
        variant: selection.category,
        preview: "0",
        page: "contacts",
      },
    })
  }

  async function loadContactsContent() {
    try {
      const selection = await resolveVariantSelection()
      const content =
        selection.category === "default"
          ? await loadJson(`${STATIC_DATA_BASE}/contacts.json`)
          : await loadContactsVariant(selection.category)

      document.documentElement.dataset.multicontentVariant = selection.category
      window.__multicontent = {
        category: selection.category,
        reason: selection.reason,
        isPreview: selection.isPreview,
        rule: selection.rule,
      }

      applyContactsContent(content, selection)
      trackVariant(selection)
    } catch (error) {
      console.error("Contacts load error:", error)
    }
  }

  loadContactsContent()
}

document.addEventListener("nav", initContacts)
initContacts()
