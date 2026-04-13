function initContacts() {
  const central = document.querySelector(".contacts-central")
  if (!central) return

  if (central.dataset.initialized) return
  central.dataset.initialized = "true"

  function byPath(obj, path) {
    if (!obj) return undefined
    const keys = path.split(".")
    let cur = obj
    keys.forEach((key) => {
      if (cur != null) cur = cur[key]
    })
    return cur
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

  async function loadContactsContent() {
    try {
      const res = await fetch("/images/Prodject/contacts.json")
      if (!res.ok) return
      const data = await res.json()

      setTextByMap(data)

      const heroTags = document.querySelector("[data-contacts-hero-tags]")
      if (heroTags && data.hero && Array.isArray(data.hero.tags)) {
        heroTags.innerHTML = ""
        data.hero.tags.forEach((tag) => {
          const span = document.createElement("span")
          span.className = "contacts-tag"
          span.textContent = tag
          heroTags.appendChild(span)
        })
      }

      const channelsGrid = document.querySelector("[data-contacts-channels-grid]")
      if (channelsGrid && data.fastContact && Array.isArray(data.fastContact.channels)) {
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

      const stepsGrid = document.querySelector("[data-contacts-steps-grid]")
      if (stepsGrid && data.workflow && Array.isArray(data.workflow.steps)) {
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

      const faqList = document.querySelector("[data-contacts-faq-list]")
      if (faqList && data.faq && Array.isArray(data.faq.items)) {
        faqList.innerHTML = ""
        data.faq.items.forEach((item) => {
          const det = document.createElement("details")
          det.className = "contacts-faq-item"
          const sum = document.createElement("summary")
          sum.textContent = item.question
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

      const tgLinks = document.querySelectorAll("[data-contacts-link-tg]")
      tgLinks.forEach((l) => (l.href = data.hero.tgLink))
      const emailLinks = document.querySelectorAll("[data-contacts-link-email]")
      emailLinks.forEach((l) => (l.href = data.hero.emailLink))
    } catch (e) {
      console.error("Contacts load error:", e)
    }
  }

  loadContactsContent()
}

document.addEventListener("nav", initContacts)
initContacts()
