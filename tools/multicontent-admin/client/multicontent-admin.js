const ADMIN_THEME_KEY = "mc_admin_theme_mode"
const THEME_MODES = ["auto", "light", "dark"]

function readThemeMode() {
  try {
    const saved = window.localStorage?.getItem(ADMIN_THEME_KEY)
    return THEME_MODES.includes(saved) ? saved : "auto"
  } catch {
    return "auto"
  }
}

function persistThemeMode(mode) {
  try {
    if (mode === "auto") {
      window.localStorage?.removeItem(ADMIN_THEME_KEY)
      return
    }
    window.localStorage?.setItem(ADMIN_THEME_KEY, mode)
  } catch {}
}

function resolveTheme(mode) {
  if (mode === "light" || mode === "dark") return mode
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function applyTheme(mode) {
  const resolved = resolveTheme(mode)
  document.documentElement.dataset.adminTheme = resolved
  document.documentElement.dataset.adminThemeMode = mode
  document.documentElement.style.colorScheme = resolved
}

const state = {
  loading: true,
  data: null,
  drafts: null,
  status: null,
  ui: {
    themeMode: readThemeMode(),
    tab: "home",
    homeSubtab: "layout",
    contactsSubtab: "layout",
    selectedCategory: "default",
    formsSubtab: "homeCallback",
  },
}

const root = document.getElementById("app")

const themeMedia = window.matchMedia?.("(prefers-color-scheme: dark)")
themeMedia?.addEventListener("change", () => {
  if (state.ui.themeMode === "auto") {
    render()
  }
})

const COLOR_VARIANTS = [
  { value: "blue", label: "Blue", color: "#4f8cff", soft: "rgba(79, 140, 255, 0.16)" },
  { value: "purple", label: "Purple", color: "#8b5cf6", soft: "rgba(139, 92, 246, 0.16)" },
  { value: "orange", label: "Orange", color: "#f97316", soft: "rgba(249, 115, 22, 0.16)" },
  { value: "green", label: "Green", color: "#22c55e", soft: "rgba(34, 197, 94, 0.16)" },
]

const HOME_LAYOUT_BLOCKS = [
  { value: "hero", label: "Hero", description: "Первый экран и CTA" },
  { value: "focus", label: "Focus", description: "Карточки задач и результатов" },
  { value: "services", label: "Services", description: "Список услуг" },
  { value: "works", label: "Works", description: "Кейсы и слайдер", single: true },
  { value: "faq", label: "FAQ", description: "Частые вопросы" },
  { value: "contact", label: "Contact CTA", description: "Финальный call to action" },
]

const CONTACTS_LAYOUT_BLOCKS = [
  { value: "hero", label: "Hero", description: "Первый экран контактов" },
  { value: "channels", label: "Быстрые контакты", description: "Каналы связи" },
  { value: "workflow", label: "Workflow", description: "Как начинаем работу" },
  { value: "formats", label: "Formats", description: "Форматы старта" },
  { value: "faq", label: "FAQ", description: "Частые вопросы" },
  { value: "cta", label: "CTA", description: "Финальный контактный блок" },
]

const MATERIAL_ICON_OPTIONS = [
  "send",
  "mail",
  "call",
  "arrow_forward",
  "inbox_customize",
  "pending_actions",
  "rocket_launch",
  "account_tree",
  "trending_up",
  "schedule",
  "speed",
  "fact_check",
  "storefront",
  "hub",
  "sync_alt",
  "smartphone",
  "phone_iphone",
  "support_agent",
  "rule",
  "check_circle",
  "event",
  "paid",
  "monitoring",
  "auto_awesome",
  "schema",
  "forum",
  "design_services",
  "psychology",
  "web",
  "menu_book",
  "chat",
  "assignment",
  "flash_on",
  "description",
  "edit_note",
  "swap_horiz",
  "verified",
  "folder_open",
  "add_circle",
  "remove_circle_outline",
  "search",
  "smart_toy",
  "dashboard",
  "data_object",
  "terminal",
  "receipt_long",
  "integration_instructions",
  "settings",
  "analytics",
  "groups",
  "inventory_2",
  "inventory",
  "shopping_bag",
  "payments",
  "person",
  "group",
  "campaign",
  "bolt",
  "target",
  "lightbulb",
  "explore",
  "build",
  "token",
]

function deepClone(value) {
  if (typeof structuredClone === "function") return structuredClone(value)
  return JSON.parse(JSON.stringify(value))
}

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag)
  Object.entries(attrs).forEach(([key, value]) => {
    if (value === null || value === undefined) return
    if (key === "className") node.className = value
    else if (key === "text") node.textContent = value
    else if (key === "html") node.innerHTML = value
    else if (key === "value") node.value = value
    else if (key === "checked") node.checked = Boolean(value)
    else if (key.startsWith("on") && typeof value === "function") {
      node.addEventListener(key.slice(2).toLowerCase(), value)
    } else {
      node.setAttribute(key, value)
    }
  })
  ;(Array.isArray(children) ? children : [children]).forEach((child) => {
    if (child === null || child === undefined || child === false) return
    if (typeof child === "string") node.appendChild(document.createTextNode(child))
    else node.appendChild(child)
  })

  return node
}

function field(labelText, input) {
  return el("div", { className: "admin-field" }, [el("label", { text: labelText }), input])
}

function textInput(labelText, value, onInput, options = {}) {
  const input = el("input", {
    className: "admin-input",
    type: options.type || "text",
    value: value ?? "",
    placeholder: options.placeholder || "",
    readonly: options.readOnly ? "true" : null,
    oninput: (event) => onInput(event.target.value),
  })
  return field(labelText, input)
}

function resolvePreviewUrl(value) {
  const trimmed = typeof value === "string" ? value.trim() : ""
  if (!trimmed) return ""
  if (/^(?:https?:)?\/\//i.test(trimmed) || trimmed.startsWith("data:")) return trimmed
  if (trimmed.startsWith("/")) return trimmed
  return `/${trimmed.replace(/^\/+/, "")}`
}

async function uploadWorksImage(file) {
  if (!file) return null

  return request("/api/uploads/works-image", {
    method: "POST",
    headers: {
      "Content-Type": file.type || "application/octet-stream",
      "X-File-Name": encodeURIComponent(file.name || "works-image"),
    },
    body: file,
  })
}

function worksImageInput(labelText, value, onInput) {
  const preview = el("div", { className: "admin-image-field__preview" })
  const input = el("input", {
    className: "admin-input admin-image-field__url",
    type: "text",
    value: value ?? "",
    placeholder: "/images/Prodject/uploads/works/example.webp",
  })
  const fileInput = el("input", {
    className: "admin-image-field__file",
    type: "file",
    accept: "image/png,image/jpeg,image/webp,image/gif",
  })
  const status = el("span", { className: "admin-meta-note admin-image-field__status" })

  function syncPreview(nextValue) {
    preview.innerHTML = ""
    const src = resolvePreviewUrl(nextValue)

    if (!src) {
      preview.appendChild(
        el("span", { className: "admin-image-field__empty", text: "Нет изображения" }),
      )
      return
    }

    preview.appendChild(el("img", { src, alt: labelText, loading: "lazy" }))
  }

  input.addEventListener("input", (event) => {
    onInput(event.target.value)
    syncPreview(event.target.value)
  })

  fileInput.addEventListener("change", async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    status.textContent = "Загрузка..."
    status.className = "admin-meta-note admin-image-field__status"

    try {
      const result = await uploadWorksImage(file)
      input.value = result.url
      onInput(result.url)
      syncPreview(result.url)
      status.textContent = `Загружено: ${result.fileName}`
      status.className = "admin-meta-note admin-image-field__status is-success"
    } catch (error) {
      status.textContent = error instanceof Error ? error.message : "Не удалось загрузить файл"
      status.className = "admin-meta-note admin-image-field__status is-error"
    } finally {
      fileInput.value = ""
    }
  })

  syncPreview(value)

  return el("div", { className: "admin-field admin-image-field" }, [
    el("label", { text: labelText }),
    preview,
    input,
    el("label", { className: "admin-image-field__upload" }, [
      el("span", { className: "material-symbols-outlined", text: "folder_open" }),
      el("span", { text: "Выбрать файл" }),
      fileInput,
    ]),
    status,
  ])
}

function textArea(labelText, value, onInput, options = {}) {
  const input = el("textarea", {
    className: "admin-textarea",
    placeholder: options.placeholder || "",
    oninput: (event) => onInput(event.target.value),
  })
  input.value = value ?? ""
  return field(labelText, input)
}

function selectInput(labelText, value, options, onInput) {
  const select = el("select", {
    className: "admin-select",
    onchange: (event) => onInput(event.target.value),
  })
  options.forEach((option) => {
    const node = el("option", { value: option.value, text: option.label })
    if (option.value === value) node.selected = true
    select.appendChild(node)
  })
  return field(labelText, select)
}

function materialIconPreview(iconName) {
  return el("span", { className: "admin-icon-preview material-symbols-outlined", text: iconName })
}

function normalizeHexColor(value) {
  if (typeof value !== "string") return "#4f8cff"
  const trimmed = value.trim().toLowerCase()
  if (/^#[0-9a-f]{6}$/i.test(trimmed)) return trimmed
  if (/^#[0-9a-f]{3}$/i.test(trimmed)) {
    return (
      "#" +
      trimmed
        .slice(1)
        .split("")
        .map((char) => char + char)
        .join("")
    )
  }
  return "#4f8cff"
}

function openIconPickerModal({ labelText, value, options, onSelect }) {
  const overlay = el("div", { className: "admin-modal admin-modal--icon-picker" })
  const searchInput = el("input", {
    className: "admin-input",
    type: "search",
    placeholder: "Поиск иконки",
  })
  const grid = el("div", { className: "admin-icon-grid" })

  function close() {
    document.removeEventListener("keydown", onKeydown)
    overlay.remove()
  }

  function onKeydown(event) {
    if (event.key === "Escape") close()
  }

  function renderGrid(filter = "") {
    grid.innerHTML = ""
    const query = filter.trim().toLowerCase()
    const filtered = options.filter((iconName) => iconName.toLowerCase().includes(query))

    filtered.forEach((iconName) => {
      grid.appendChild(
        el(
          "button",
          {
            className: `admin-icon-grid__item${iconName === value ? " is-active" : ""}`,
            type: "button",
            title: iconName,
            onclick: () => {
              onSelect(iconName)
              close()
            },
          },
          [materialIconPreview(iconName), el("span", { text: iconName })],
        ),
      )
    })

    if (filtered.length === 0) {
      grid.appendChild(el("div", { className: "admin-empty", text: "Ничего не найдено." }))
    }
  }

  searchInput.addEventListener("input", (event) => {
    renderGrid(event.target.value)
  })

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) close()
  })

  overlay.appendChild(
    el("div", { className: "admin-modal__dialog", role: "dialog", "aria-modal": "true" }, [
      el("div", { className: "admin-modal__head" }, [
        el("div", { className: "admin-stack" }, [
          el("strong", { className: "admin-modal__title", text: labelText }),
          el("div", { className: "admin-icon-picker__current" }, [
            materialIconPreview(value || "help"),
            el("span", { text: value || "Иконка не выбрана" }),
          ]),
        ]),
        el("button", {
          className: "admin-button--ghost",
          type: "button",
          text: "Закрыть",
          onclick: close,
        }),
      ]),
      el("div", { className: "admin-modal__body" }, [searchInput, grid]),
    ]),
  )

  document.addEventListener("keydown", onKeydown)
  document.body.appendChild(overlay)
  renderGrid()
  window.requestAnimationFrame(() => searchInput.focus())
}

function openColorPickerModal({ labelText, value, onSelect }) {
  const overlay = el("div", { className: "admin-modal admin-modal--color-picker" })
  const colorInput = el("input", {
    className: "admin-color-modal__input",
    type: "color",
    value: normalizeHexColor(value),
  })
  const hexInput = el("input", {
    className: "admin-input",
    type: "text",
    value: normalizeHexColor(value),
    placeholder: "#4f8cff",
  })
  const preview = el("div", {
    className: "admin-color-modal__preview",
    style: `--preview-color:${normalizeHexColor(value)};`,
  })

  function close() {
    document.removeEventListener("keydown", onKeydown)
    overlay.remove()
  }

  function onKeydown(event) {
    if (event.key === "Escape") close()
  }

  function sync(nextValue) {
    const normalized = normalizeHexColor(nextValue)
    colorInput.value = normalized
    hexInput.value = normalized
    preview.style.setProperty("--preview-color", normalized)
  }

  colorInput.addEventListener("input", (event) => {
    sync(event.target.value)
  })

  hexInput.addEventListener("input", (event) => {
    const nextValue = event.target.value.trim()
    if (/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(nextValue)) {
      sync(nextValue)
    }
  })

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) close()
  })

  overlay.appendChild(
    el("div", { className: "admin-modal__dialog", role: "dialog", "aria-modal": "true" }, [
      el("div", { className: "admin-modal__head" }, [
        el("div", { className: "admin-stack" }, [
          el("strong", { className: "admin-modal__title", text: labelText }),
          el("span", { className: "admin-meta-note", text: "Выберите цвет или вставьте hex." }),
        ]),
        el("button", {
          className: "admin-button--ghost",
          type: "button",
          text: "Закрыть",
          onclick: close,
        }),
      ]),
      el("div", { className: "admin-modal__body" }, [
        el("div", { className: "admin-color-modal" }, [
          preview,
          el("div", { className: "admin-stack" }, [
            field("Системная палитра", colorInput),
            field("Hex", hexInput),
          ]),
        ]),
        el("div", { className: "admin-actions" }, [
          el("button", {
            className: "admin-button",
            type: "button",
            text: "Применить",
            onclick: () => {
              onSelect(colorInput.value)
              close()
            },
          }),
        ]),
      ]),
    ]),
  )

  document.addEventListener("keydown", onKeydown)
  document.body.appendChild(overlay)
  window.requestAnimationFrame(() => colorInput.focus())
}

function paletteInput(labelText, value, options, onInput, customValue = "") {
  return el("div", { className: "admin-field" }, [
    el("label", { text: labelText }),
    el("div", { className: "admin-palette" }, [
      ...options.map((option) =>
        el(
          "button",
          {
            className: `admin-palette__swatch${option.value === value ? " is-active" : ""}`,
            type: "button",
            title: option.label,
            "aria-label": option.label,
            onclick: () => {
              onInput({ variant: option.value, color: "" })
              render()
            },
            style: `--swatch-color:${option.color}; --swatch-soft:${option.soft};`,
          },
          [
            el("span", { className: "admin-palette__dot" }),
            el("span", { className: "admin-palette__label", text: option.label }),
          ],
        ),
      ),
      el(
        "button",
        {
          className: `admin-palette__swatch admin-palette__swatch--custom${value === "custom" ? " is-active" : ""}`,
          type: "button",
          title: "Custom",
          "aria-label": "Custom",
          onclick: () =>
            openColorPickerModal({
              labelText,
              value: customValue || "#4f8cff",
              onSelect: (nextColor) => {
                onInput({ variant: "custom", color: nextColor })
                render()
              },
            }),
          style:
            value === "custom"
              ? `--swatch-color:${customValue || "#4f8cff"}; --swatch-soft:${customValue || "#4f8cff"}22;`
              : "--swatch-color:#1f2937; --swatch-soft:rgba(17,24,39,0.08);",
        },
        [
          el("span", { className: "admin-palette__dot admin-palette__dot--custom" }),
          el("span", {
            className: "admin-palette__label",
            text: value === "custom" ? `Custom ${customValue}` : "Custom",
          }),
        ],
      ),
    ]),
  ])
}

function iconPickerInput(labelText, value, onInput, options = MATERIAL_ICON_OPTIONS) {
  const trigger = el(
    "button",
    {
      className: "admin-icon-picker",
      type: "button",
      onclick: () =>
        openIconPickerModal({
          labelText,
          value,
          options,
          onSelect: (iconName) => {
            onInput(iconName)
            render()
          },
        }),
    },
    [
      el("span", { className: "admin-icon-picker__value" }, [
        materialIconPreview(value || "help"),
        el("span", { text: value || "Выбрать иконку" }),
      ]),
      el("span", { className: "admin-meta-note", text: "Открыть picker" }),
    ],
  )

  return el("div", { className: "admin-field" }, [el("label", { text: labelText }), trigger])
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok || payload.ok === false) {
    throw new Error(payload.error || `Request failed: ${response.status}`)
  }
  return payload
}

function buildDrafts(data) {
  const drafts = {
    home: deepClone(data.home),
    contacts: deepClone(data.contacts),
    contactsVariants: {},
    forms: deepClone(data.forms),
    rules: deepClone(data.rules),
    variants: {},
    categoryMeta: {},
  }

  data.categories
    .filter((category) => category.slug !== "default")
    .forEach((category) => {
      drafts.variants[category.slug] = deepClone(data.variants[category.slug] || data.home)
      drafts.contactsVariants[category.slug] = deepClone(
        data.contactVariants?.[category.slug] || data.contacts,
      )
      drafts.categoryMeta[category.slug] = {
        label: category.label,
        extends: category.extends || "default",
      }
    })

  return drafts
}

async function loadState(preferredCategory = null) {
  state.loading = true
  render()

  try {
    const data = await request("/api/state")
    state.data = data
    state.drafts = buildDrafts(data)

    const categorySlugs = data.categories.map((item) => item.slug)
    state.ui.selectedCategory = categorySlugs.includes(preferredCategory)
      ? preferredCategory
      : "default"
    state.status = null
  } catch (error) {
    state.status = {
      type: "error",
      message: error instanceof Error ? error.message : "Не удалось загрузить состояние",
    }
  } finally {
    state.loading = false
    render()
  }
}

function setStatus(type, message) {
  state.status = { type, message }
  render()
}

async function saveHome() {
  const selectedSlug = getSelectedCategorySlug()

  try {
    if (selectedSlug === "default") {
      await request("/api/home/save", {
        method: "POST",
        body: JSON.stringify({ content: state.drafts.home }),
      })
      await loadState("default")
      setStatus("success", "Главная страница сохранена.")
      return
    }

    const meta = state.drafts.categoryMeta[selectedSlug]
    await request("/api/categories/save", {
      method: "POST",
      body: JSON.stringify({
        slug: selectedSlug,
        label: meta?.label || selectedSlug,
        extends: meta?.extends || "default",
        content: state.drafts.variants[selectedSlug],
      }),
    })
    await loadState(selectedSlug)
    setStatus("success", `Категория ${selectedSlug} сохранена.`)
  } catch (error) {
    setStatus("error", error.message)
  }
}

async function saveContacts() {
  const selectedSlug = getSelectedCategorySlug()

  try {
    if (selectedSlug === "default") {
      await request("/api/contacts/save", {
        method: "POST",
        body: JSON.stringify({ content: state.drafts.contacts }),
      })
      await loadState("default")
      setStatus("success", "Контакты сохранены.")
      return
    }

    const meta = state.drafts.categoryMeta[selectedSlug]
    await request("/api/contacts/categories/save", {
      method: "POST",
      body: JSON.stringify({
        slug: selectedSlug,
        extends: meta?.extends || "default",
        content: state.drafts.contactsVariants[selectedSlug],
      }),
    })
    await loadState(selectedSlug)
    setStatus("success", `Контакты для категории ${selectedSlug} сохранены.`)
  } catch (error) {
    setStatus("error", error.message)
  }
}

async function saveForms() {
  try {
    await request("/api/forms/save", {
      method: "POST",
      body: JSON.stringify({ content: state.drafts.forms }),
    })
    await loadState(state.ui.selectedCategory)
    setStatus("success", "Формы сохранены.")
  } catch (error) {
    setStatus("error", error.message)
  }
}

async function saveRules() {
  try {
    await request("/api/rules/save", {
      method: "POST",
      body: JSON.stringify({ content: state.drafts.rules }),
    })
    await loadState(state.ui.selectedCategory)
    setStatus("success", "Правила маршрутизации сохранены.")
  } catch (error) {
    setStatus("error", error.message)
  }
}

async function deleteCategory() {
  const slug = getSelectedCategorySlug()
  if (slug === "default") return

  if (!window.confirm(`Удалить категорию ${slug}?`)) return

  try {
    await request("/api/categories/delete", {
      method: "POST",
      body: JSON.stringify({ slug }),
    })
    await loadState("default")
    setStatus("success", `Категория ${slug} удалена.`)
  } catch (error) {
    setStatus("error", error.message)
  }
}

async function createCategoryFromValues({ slug, label, fromSlug }) {
  try {
    await request("/api/categories/create", {
      method: "POST",
      body: JSON.stringify({
        slug: slug.trim(),
        label: label.trim(),
        fromSlug: fromSlug || "default",
      }),
    })
    await loadState(slug.trim())
    setStatus("success", "Категория создана.")
  } catch (error) {
    throw error
  }
}

function openPreview(pathname) {
  openCategoryPagePreview(pathname)
}

function openCategoryPagePreview(pathname, slug = null) {
  if (!state.data?.previewBaseUrl) return
  const url = new URL(pathname, state.data.previewBaseUrl)
  if (slug && slug !== "default") {
    url.searchParams.set("_mc_preview", slug)
  }
  window.open(url.toString(), "_blank", "noopener")
}

function openCategoryPreview(slug) {
  openCategoryPagePreview("/", slug)
}

function getCategories() {
  return state.data?.categories || []
}

function getSelectedCategorySlug() {
  const categories = getCategories().map((category) => category.slug)
  return categories.includes(state.ui.selectedCategory) ? state.ui.selectedCategory : "default"
}

function getSelectedCategory() {
  return (
    getCategories().find((category) => category.slug === getSelectedCategorySlug()) || {
      slug: "default",
      label: "Основная",
      extends: "default",
    }
  )
}

function getCategoryDisplayLabel(category) {
  if (!category) return "Основная"
  return category.slug === "default" ? "Основная" : category.label
}

function getSelectedHomeDraft() {
  const slug = getSelectedCategorySlug()
  return slug === "default" ? state.drafts.home : state.drafts.variants[slug]
}

function getSelectedContactsDraft() {
  const slug = getSelectedCategorySlug()
  return slug === "default" ? state.drafts.contacts : state.drafts.contactsVariants[slug]
}

function openCreateCategoryModal() {
  const overlay = el("div", { className: "admin-modal admin-modal--category-create" })
  let slug = ""
  let label = ""
  let fromSlug = getSelectedCategorySlug()

  const slugInput = el("input", {
    className: "admin-input",
    type: "text",
    placeholder: "instagram",
    oninput: (event) => {
      slug = event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")
      event.target.value = slug
    },
  })
  const labelInput = el("input", {
    className: "admin-input",
    type: "text",
    placeholder: "Instagram Ads",
    oninput: (event) => {
      label = event.target.value
    },
  })
  const fromSelect = el("select", {
    className: "admin-select",
    onchange: (event) => {
      fromSlug = event.target.value
    },
  })
  getCategories().forEach((category) => {
    const option = el("option", {
      value: category.slug,
      text: `${getCategoryDisplayLabel(category)} (${category.slug})`,
    })
    if (category.slug === fromSlug) option.selected = true
    fromSelect.appendChild(option)
  })

  const status = el("div", { className: "admin-meta-note", text: "Slug: только a-z, 0-9 и дефис." })

  function close() {
    document.removeEventListener("keydown", onKeydown)
    overlay.remove()
  }

  function onKeydown(event) {
    if (event.key === "Escape") close()
  }

  async function submit() {
    try {
      await createCategoryFromValues({ slug, label, fromSlug })
      close()
    } catch (error) {
      status.textContent = error instanceof Error ? error.message : "Не удалось создать категорию."
      status.className = "admin-status is-error"
    }
  }

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) close()
  })

  overlay.appendChild(
    el(
      "div",
      {
        className: "admin-modal__dialog admin-modal__dialog--compact",
        role: "dialog",
        "aria-modal": "true",
      },
      [
        el("div", { className: "admin-modal__head" }, [
          el("div", { className: "admin-stack" }, [
            el("strong", { className: "admin-modal__title", text: "Новая категория" }),
            el("span", {
              className: "admin-meta-note",
              text: "Создаёт новый вариант контента главной страницы и сразу переключает редактор на него.",
            }),
          ]),
          el("button", {
            className: "admin-button--ghost",
            type: "button",
            text: "Закрыть",
            onclick: close,
          }),
        ]),
        el("div", { className: "admin-modal__body" }, [
          el("div", { className: "admin-grid admin-grid--two" }, [
            field("Slug", slugInput),
            field("Название", labelInput),
          ]),
          field("Создать на основе", fromSelect),
          status,
          el("div", { className: "admin-actions" }, [
            el("button", {
              className: "admin-button",
              type: "button",
              text: "Создать и переключить",
              onclick: submit,
            }),
          ]),
        ]),
      ],
    ),
  )

  document.addEventListener("keydown", onKeydown)
  document.body.appendChild(overlay)
  window.requestAnimationFrame(() => slugInput.focus())
}

function renderStringArrayEditor(title, items, createLabel = "Добавить") {
  const wrap = el("div", { className: "admin-array" })

  items.forEach((item, index) => {
    wrap.appendChild(
      el("div", { className: "admin-array__item" }, [
        el("div", { className: "admin-array__head" }, [
          el("div", { className: "admin-array__title", text: `${title} ${index + 1}` }),
          miniActions(items, index),
        ]),
        textInput("Значение", item, (value) => {
          items[index] = value
        }),
      ]),
    )
  })

  const button = el("button", {
    className: "admin-button--ghost",
    type: "button",
    text: createLabel,
    onclick: () => {
      items.push("")
      render()
    },
  })

  return el("div", { className: "admin-stack" }, [wrap, button])
}

function miniActions(items, index, makeBlank = null) {
  return el("div", { className: "admin-mini-actions" }, [
    el("button", {
      className: "admin-mini-button",
      type: "button",
      text: "Up",
      onclick: () => {
        if (index === 0) return
        ;[items[index - 1], items[index]] = [items[index], items[index - 1]]
        render()
      },
    }),
    el("button", {
      className: "admin-mini-button",
      type: "button",
      text: "Down",
      onclick: () => {
        if (index === items.length - 1) return
        ;[items[index + 1], items[index]] = [items[index], items[index + 1]]
        render()
      },
    }),
    el("button", {
      className: "admin-mini-button",
      type: "button",
      text: "Delete",
      onclick: () => {
        items.splice(index, 1)
        if (items.length === 0 && makeBlank) {
          items.push(makeBlank())
        }
        render()
      },
    }),
  ])
}

function renderObjectArrayEditor(config) {
  const { title, items, createItem, fields, itemTitle } = config
  const wrap = el("div", { className: "admin-array" })

  items.forEach((item, index) => {
    const body = el("div", { className: "admin-grid admin-grid--two" })
    fields.forEach((fieldConfig) => {
      const target = item
      if (fieldConfig.type === "textarea") {
        body.appendChild(
          textArea(fieldConfig.label, target[fieldConfig.key], (value) => {
            target[fieldConfig.key] = value
          }),
        )
        return
      }

      if (fieldConfig.type === "select") {
        body.appendChild(
          selectInput(fieldConfig.label, target[fieldConfig.key], fieldConfig.options, (value) => {
            target[fieldConfig.key] = value
          }),
        )
        return
      }

      if (fieldConfig.type === "palette") {
        body.appendChild(
          paletteInput(
            fieldConfig.label,
            target[fieldConfig.key],
            fieldConfig.options,
            (nextValue) => {
              target[fieldConfig.key] = nextValue.variant
              if (fieldConfig.customKey) {
                if (nextValue.variant === "custom") {
                  target[fieldConfig.customKey] = nextValue.color
                } else {
                  delete target[fieldConfig.customKey]
                }
              }
            },
            fieldConfig.customKey ? target[fieldConfig.customKey] : "",
          ),
        )
        return
      }

      if (fieldConfig.type === "icon") {
        body.appendChild(
          iconPickerInput(
            fieldConfig.label,
            target[fieldConfig.key],
            (value) => {
              target[fieldConfig.key] = value
            },
            fieldConfig.options || MATERIAL_ICON_OPTIONS,
          ),
        )
        return
      }

      if (fieldConfig.type === "worksImage") {
        body.appendChild(
          worksImageInput(fieldConfig.label, target[fieldConfig.key], (value) => {
            target[fieldConfig.key] = value
          }),
        )
        return
      }

      if (fieldConfig.type === "checkbox") {
        body.appendChild(
          checkboxInput(fieldConfig.label, Boolean(target[fieldConfig.key]), (value) => {
            target[fieldConfig.key] = value
          }),
        )
        return
      }

      if (fieldConfig.type === "number") {
        body.appendChild(
          textInput(
            fieldConfig.label,
            target[fieldConfig.key],
            (value) => {
              target[fieldConfig.key] = value === "" ? 0 : Number(value)
            },
            { type: "number" },
          ),
        )
        return
      }

      if (fieldConfig.type === "numberArray") {
        body.appendChild(
          textInput(fieldConfig.label, (target[fieldConfig.key] || []).join(", "), (value) => {
            target[fieldConfig.key] = value
              .split(",")
              .map((entry) => Number(entry.trim()))
              .filter((entry) => Number.isFinite(entry))
          }),
        )
        return
      }

      body.appendChild(
        textInput(fieldConfig.label, target[fieldConfig.key], (value) => {
          target[fieldConfig.key] = value
        }),
      )
    })

    wrap.appendChild(
      el("div", { className: "admin-array__item" }, [
        el("div", { className: "admin-array__head" }, [
          el("div", {
            className: "admin-array__title",
            text: itemTitle ? itemTitle(item, index) : `${title} ${index + 1}`,
          }),
          miniActions(items, index, createItem),
        ]),
        body,
      ]),
    )
  })

  return el("div", { className: "admin-stack" }, [
    wrap,
    el("button", {
      className: "admin-button--ghost",
      type: "button",
      text: "Добавить элемент",
      onclick: () => {
        items.push(createItem())
        render()
      },
    }),
  ])
}

function checkboxInput(labelText, checked, onInput) {
  const input = el("input", {
    type: "checkbox",
    checked,
    onchange: (event) => onInput(event.target.checked),
  })
  return el("label", { className: "admin-check" }, [input, el("span", { text: labelText })])
}

function createHeroTitlePart() {
  return { text: "Новая часть заголовка", accent: false }
}

function createHeroBenefit() {
  return { icon: "check_circle", text: "Преимущество" }
}

function createHeroMetric() {
  return {
    label: "Метрика",
    value: "+24%",
    delta: "за месяц",
    tone: "blue",
    points: [8, 14, 12, 20, 18, 28],
  }
}

function createHeroIntegration() {
  return { label: "Интеграция", icon: "extension" }
}

function createHeroAutomation() {
  return { label: "Событие → действие", value: "Live", status: "Активно", icon: "rule" }
}

function createHeroSideCard() {
  return { icon: "verified", title: "Преимущество", text: "Короткое описание" }
}

function renderHeroEditor(data) {
  data.hero ||= { title: "", subtitle: "", tags: [], primaryAction: "", secondaryAction: "" }
  data.hero.titleParts ||= [{ text: data.hero.title || "", accent: false }]
  data.hero.benefits ||= []
  data.hero.visual ||= {
    title: "",
    tabs: [],
    metrics: [],
    integrations: [],
    automations: [],
    sideCards: [],
  }
  data.hero.visual.tabs ||= []
  data.hero.visual.metrics ||= []
  data.hero.visual.integrations ||= []
  data.hero.visual.automations ||= []
  data.hero.visual.sideCards ||= []

  return sectionBody([
    el("div", { className: "admin-grid admin-grid--two" }, [
      textInput("Fallback title", data.hero.title, (value) => (data.hero.title = value)),
      textInput("Badge / pill", data.hero.badge || "", (value) => (data.hero.badge = value)),
      textInput("Подзаголовок", data.hero.subtitle, (value) => (data.hero.subtitle = value)),
      textInput("SLA строка", data.hero.sla || "", (value) => (data.hero.sla = value)),
      textInput(
        "Текст primary CTA",
        data.hero.primaryAction,
        (value) => (data.hero.primaryAction = value),
      ),
      textInput(
        "Текст secondary CTA",
        data.hero.secondaryAction,
        (value) => (data.hero.secondaryAction = value),
      ),
    ]),
    el("div", { className: "admin-nested" }, [
      el("div", { className: "admin-section__label", text: "Title parts / акценты" }),
      renderObjectArrayEditor({
        title: "Часть заголовка",
        items: data.hero.titleParts,
        createItem: createHeroTitlePart,
        fields: [
          { key: "text", label: "Текст", type: "textarea" },
          { key: "accent", label: "Синий accent", type: "checkbox" },
        ],
        itemTitle: (item, index) => item.text || `Часть ${index + 1}`,
      }),
    ]),
    el("div", { className: "admin-nested" }, [
      el("div", { className: "admin-section__label", text: "Chips" }),
      renderStringArrayEditor("Чип", data.hero.tags),
    ]),
    el("div", { className: "admin-nested" }, [
      el("div", { className: "admin-section__label", text: "Benefits" }),
      renderObjectArrayEditor({
        title: "Benefit",
        items: data.hero.benefits,
        createItem: createHeroBenefit,
        fields: [
          { key: "icon", label: "Иконка", type: "icon" },
          { key: "text", label: "Текст", type: "text" },
        ],
        itemTitle: (item, index) => item.text || `Benefit ${index + 1}`,
      }),
    ]),
    el("div", { className: "admin-nested admin-hero-visual-editor" }, [
      el("div", { className: "admin-section__label", text: "Dashboard visual" }),
      textInput(
        "Visual title",
        data.hero.visual.title || "",
        (value) => (data.hero.visual.title = value),
      ),
      renderStringArrayEditor("Tab", data.hero.visual.tabs),
      renderObjectArrayEditor({
        title: "Metric",
        items: data.hero.visual.metrics,
        createItem: createHeroMetric,
        fields: [
          { key: "label", label: "Label", type: "text" },
          { key: "value", label: "Value", type: "text" },
          { key: "delta", label: "Delta", type: "text" },
          { key: "tone", label: "Tone blue/green/orange/purple", type: "text" },
          { key: "points", label: "Sparkline points", type: "numberArray" },
        ],
        itemTitle: (item, index) => item.label || `Metric ${index + 1}`,
      }),
      renderObjectArrayEditor({
        title: "Integration",
        items: data.hero.visual.integrations,
        createItem: createHeroIntegration,
        fields: [
          { key: "icon", label: "Иконка", type: "icon" },
          { key: "label", label: "Label", type: "text" },
        ],
        itemTitle: (item, index) => item.label || `Integration ${index + 1}`,
      }),
      renderObjectArrayEditor({
        title: "Automation",
        items: data.hero.visual.automations,
        createItem: createHeroAutomation,
        fields: [
          { key: "icon", label: "Иконка", type: "icon" },
          { key: "label", label: "Label", type: "text" },
          { key: "value", label: "Value", type: "text" },
          { key: "status", label: "Status", type: "text" },
        ],
        itemTitle: (item, index) => item.label || `Automation ${index + 1}`,
      }),
      renderObjectArrayEditor({
        title: "Side card",
        items: data.hero.visual.sideCards,
        createItem: createHeroSideCard,
        fields: [
          { key: "icon", label: "Иконка", type: "icon" },
          { key: "title", label: "Title", type: "text" },
          { key: "text", label: "Text", type: "textarea" },
        ],
        itemTitle: (item, index) => item.title || `Side card ${index + 1}`,
      }),
    ]),
  ])
}

function ensureWorksData(data) {
  data.works ||= { index: "03 / Кейсы", title: "", items: [] }
  data.works.items ||= []
  return data.works
}

function createWorkSlide() {
  return {
    dark: "/images/Prodject/Audio-Scribe/1d.webp",
    light: "/images/Prodject/Audio-Scribe/1l.webp",
    alt: "Интерфейс проекта",
    width: 800,
    height: 450,
  }
}

function createWorkNavItem() {
  return { icon: "hub", label: "Audio-Scribe" }
}

function createWorkCard() {
  return {
    variant: "was",
    cornerIcon: "unfold_more",
    labelIcon: "verified",
    label: "Лейбл",
    title: "Заголовок",
    description: "Описание",
  }
}

function createWorkItem() {
  return {
    id: `work-${Date.now()}`,
    badge: "Infrastructure",
    title: "Название кейса",
    active: true,
    slides: [createWorkSlide()],
    nav: [createWorkNavItem()],
    cards: [createWorkCard()],
  }
}

function section(title, content, description = "") {
  return el("details", { className: "admin-details", open: "true" }, [
    el("summary", {}, [
      el("span", { text: title }),
      description ? el("span", { className: "admin-meta-note", text: description }) : null,
    ]),
    el("div", { className: "admin-details__body" }, content),
  ])
}

function sectionBody(content) {
  return el("div", { className: "admin-stack" }, content)
}

function renderLayoutEditor(layout, blocks) {
  const blockMap = new Map(blocks.map((block) => [block.value, block]))
  const wrap = el("div", { className: "admin-stack" })
  const list = el("div", { className: "admin-array" })

  layout.forEach((blockId, index) => {
    const block = blockMap.get(blockId) || { label: blockId, description: "Пользовательский блок" }
    list.appendChild(
      el("div", { className: "admin-array__item" }, [
        el("div", { className: "admin-array__head" }, [
          el("div", { className: "admin-stack" }, [
            el("div", { className: "admin-array__title", text: `${index + 1}. ${block.label}` }),
            el("div", { className: "admin-meta-note", text: `${blockId} · ${block.description}` }),
          ]),
          el("div", { className: "admin-mini-actions" }, [
            el("button", {
              className: "admin-mini-button",
              type: "button",
              text: "Up",
              onclick: () => {
                if (index === 0) return
                ;[layout[index - 1], layout[index]] = [layout[index], layout[index - 1]]
                render()
              },
            }),
            el("button", {
              className: "admin-mini-button",
              type: "button",
              text: "Down",
              onclick: () => {
                if (index === layout.length - 1) return
                ;[layout[index + 1], layout[index]] = [layout[index], layout[index + 1]]
                render()
              },
            }),
            el("button", {
              className: "admin-mini-button",
              type: "button",
              text: "Duplicate",
              disabled: block.single ? "true" : null,
              onclick: () => {
                if (block.single) return
                layout.splice(index + 1, 0, blockId)
                render()
              },
            }),
            el("button", {
              className: "admin-mini-button",
              type: "button",
              text: "Delete",
              onclick: () => {
                if (layout.length === 1) return
                layout.splice(index, 1)
                render()
              },
            }),
          ]),
        ]),
      ]),
    )
  })

  wrap.appendChild(list)
  wrap.appendChild(
    el("div", { className: "admin-stack" }, [
      el("div", { className: "admin-section__label", text: "Добавить блок" }),
      el(
        "div",
        { className: "admin-actions" },
        blocks.map((block) =>
          el("button", {
            className: "admin-button--ghost",
            type: "button",
            text: block.label,
            disabled: block.single && layout.includes(block.value) ? "true" : null,
            onclick: () => {
              if (block.single && layout.includes(block.value)) return
              layout.push(block.value)
              render()
            },
          }),
        ),
      ),
    ]),
  )

  return wrap
}

function renderSubtabs(activeId, tabs, onChange) {
  return el(
    "div",
    { className: "admin-subtabs" },
    tabs.map((tab) =>
      el("button", {
        className: `admin-subtab${activeId === tab.id ? " is-active" : ""}`,
        type: "button",
        text: tab.label,
        onclick: () => {
          onChange(tab.id)
          render()
        },
      }),
    ),
  )
}

function renderWorksEditor(data) {
  const works = ensureWorksData(data)

  return sectionBody([
    el("div", { className: "admin-grid admin-grid--two" }, [
      textInput("Индекс", works.index || "", (value) => {
        works.index = value
      }),
      textInput("Заголовок секции", works.title || "", (value) => {
        works.title = value
      }),
    ]),
    renderObjectArrayEditor({
      title: "Кейс",
      items: works.items,
      createItem: createWorkItem,
      fields: [
        { key: "id", label: "ID", type: "text" },
        { key: "badge", label: "Badge", type: "text" },
        { key: "title", label: "Title", type: "text" },
      ],
      itemTitle: (item, index) => item.title || `Кейс ${index + 1}`,
    }),
    ...works.items.map((item, index) =>
      section(`Кейс ${index + 1}: ${item.title || item.id || "без названия"}`, [
        checkboxInput("Активный кейс", item.active !== false, (value) => {
          item.active = value
        }),
        el("div", { className: "admin-nested" }, [
          el("div", { className: "admin-section__label", text: "Slides / изображения" }),
          renderObjectArrayEditor({
            title: "Слайд",
            items: (item.slides ||= []),
            createItem: createWorkSlide,
            fields: [
              { key: "dark", label: "Dark image", type: "worksImage" },
              { key: "light", label: "Light image", type: "worksImage" },
              { key: "alt", label: "Alt", type: "text" },
              { key: "width", label: "Width", type: "number" },
              { key: "height", label: "Height", type: "number" },
            ],
            itemTitle: (slide, slideIndex) => slide.alt || `Слайд ${slideIndex + 1}`,
          }),
        ]),
        el("div", { className: "admin-nested" }, [
          el("div", { className: "admin-section__label", text: "Nav" }),
          renderObjectArrayEditor({
            title: "Кнопка nav",
            items: (item.nav ||= []),
            createItem: createWorkNavItem,
            fields: [
              { key: "icon", label: "Иконка", type: "icon" },
              { key: "label", label: "Label / data-project", type: "text" },
            ],
            itemTitle: (navItem, navIndex) => navItem.label || `Nav ${navIndex + 1}`,
          }),
        ]),
        el("div", { className: "admin-nested" }, [
          el("div", { className: "admin-section__label", text: "Cards" }),
          renderObjectArrayEditor({
            title: "Карточка",
            items: (item.cards ||= []),
            createItem: createWorkCard,
            fields: [
              { key: "variant", label: "Variant", type: "text" },
              { key: "cornerIcon", label: "Corner icon", type: "icon" },
              { key: "labelIcon", label: "Label icon", type: "icon" },
              { key: "label", label: "Label", type: "text" },
              { key: "title", label: "Title", type: "text" },
              { key: "description", label: "Description", type: "textarea" },
            ],
            itemTitle: (card, cardIndex) => card.label || `Карточка ${cardIndex + 1}`,
          }),
        ]),
      ]),
    ),
  ])
}

function buildHomeSections(data, options = {}) {
  const includeLayout = options.includeLayout !== false
  const sections = [
    ...(includeLayout
      ? [
          {
            id: "layout",
            label: "Layout",
            content: sectionBody([
              renderLayoutEditor(
                (data.pageLayout ||= HOME_LAYOUT_BLOCKS.map((block) => block.value)),
                HOME_LAYOUT_BLOCKS,
              ),
            ]),
          },
        ]
      : []),
    {
      id: "hero",
      label: "Hero",
      content: renderHeroEditor(data),
    },
    {
      id: "focus",
      label: "Focus",
      content: sectionBody([
        el("div", { className: "admin-grid admin-grid--two" }, [
          textInput("Индекс", data.focus.index, (value) => (data.focus.index = value)),
          textInput("Заголовок секции", data.focus.title, (value) => (data.focus.title = value)),
        ]),
        renderObjectArrayEditor({
          title: "Карточка",
          items: data.focus.cards,
          createItem: () => ({
            icon: "inbox_customize",
            iconVariant: "blue",
            iconColor: "",
            title: "",
            desc: "",
            resultIcon: "trending_up",
            resultText: "",
          }),
          fields: [
            { key: "icon", label: "Иконка", type: "icon" },
            {
              key: "iconVariant",
              customKey: "iconColor",
              label: "Цвет",
              type: "palette",
              options: COLOR_VARIANTS,
            },
            { key: "title", label: "Заголовок", type: "text" },
            { key: "resultIcon", label: "Иконка результата", type: "icon" },
            { key: "desc", label: "Описание", type: "textarea" },
            { key: "resultText", label: "Результат", type: "text" },
          ],
          itemTitle: (item, index) => item.title || `Карточка ${index + 1}`,
        }),
      ]),
    },
    {
      id: "services",
      label: "Services",
      content: sectionBody([
        el("div", { className: "admin-grid admin-grid--two" }, [
          textInput("Индекс", data.services.index, (value) => (data.services.index = value)),
          textInput(
            "Заголовок секции",
            data.services.title,
            (value) => (data.services.title = value),
          ),
        ]),
        renderObjectArrayEditor({
          title: "Сервис",
          items: data.services.items,
          createItem: () => ({
            icon: "send",
            iconVariant: "blue",
            iconColor: "",
            title: "",
            backText: "",
          }),
          fields: [
            { key: "icon", label: "Иконка", type: "icon" },
            {
              key: "iconVariant",
              customKey: "iconColor",
              label: "Цвет",
              type: "palette",
              options: COLOR_VARIANTS,
            },
            { key: "title", label: "Заголовок", type: "text" },
            { key: "backText", label: "Описание", type: "textarea" },
          ],
          itemTitle: (item, index) => item.title || `Сервис ${index + 1}`,
        }),
      ]),
    },
    {
      id: "works",
      label: "Works",
      content: renderWorksEditor(data),
    },
    {
      id: "faq",
      label: "FAQ",
      content: sectionBody([
        el("div", { className: "admin-grid admin-grid--two" }, [
          textInput("Индекс", data.faq.index, (value) => (data.faq.index = value)),
          textInput("Заголовок секции", data.faq.title, (value) => (data.faq.title = value)),
        ]),
        renderObjectArrayEditor({
          title: "Вопрос",
          items: data.faq.items,
          createItem: () => ({ question: "", answer: "" }),
          fields: [
            { key: "question", label: "Вопрос", type: "text" },
            { key: "answer", label: "Ответ", type: "textarea" },
          ],
          itemTitle: (item, index) => item.question || `Вопрос ${index + 1}`,
        }),
      ]),
    },
    {
      id: "contact",
      label: "Contact CTA",
      content: sectionBody([
        el("div", { className: "admin-grid admin-grid--two" }, [
          textInput("Заголовок", data.contact.title, (value) => (data.contact.title = value)),
          textInput(
            "Подзаголовок",
            data.contact.subtitle,
            (value) => (data.contact.subtitle = value),
          ),
          textInput(
            "ARIA лейбл",
            data.contact.callbackAria || "",
            (value) => (data.contact.callbackAria = value),
          ),
          textInput(
            "Заголовок колбэка",
            data.contact.callbackTitle || "",
            (value) => (data.contact.callbackTitle = value),
          ),
          textInput(
            "Кнопка колбэка",
            data.contact.callbackButton || "",
            (value) => (data.contact.callbackButton = value),
          ),
          textInput(
            "Заголовок модалки",
            data.contact.modalTitle || "",
            (value) => (data.contact.modalTitle = value),
          ),
          textInput(
            "Подзаголовок модалки",
            data.contact.modalSubtitle || "",
            (value) => (data.contact.modalSubtitle = value),
          ),
          textInput(
            "Текст legal prefix",
            data.contact.legalPrefix || "",
            (value) => (data.contact.legalPrefix = value),
          ),
          textInput(
            "Текст legal link",
            data.contact.legalLinkText || "",
            (value) => (data.contact.legalLinkText = value),
          ),
          textInput("Примечание", data.contact.note || "", (value) => (data.contact.note = value)),
        ]),
        textArea(
          "Описание колбэка",
          data.contact.callbackDesc || "",
          (value) => (data.contact.callbackDesc = value),
        ),
      ]),
    },
  ]

  return sections
}

function renderHomeEditor(data, activeSectionId = null, options = {}) {
  const sections = buildHomeSections(data, options)
  if (!activeSectionId) {
    return el(
      "div",
      { className: "admin-stack" },
      sections.map((item) => section(item.label, [item.content])),
    )
  }

  return sections.find((item) => item.id === activeSectionId)?.content || sections[0].content
}

function buildContactsSections(data, options = {}) {
  const includeLayout = options.includeLayout !== false
  const sections = [
    ...(includeLayout
      ? [
          {
            id: "layout",
            label: "Layout",
            content: sectionBody([
              renderLayoutEditor(
                (data.pageLayout ||= CONTACTS_LAYOUT_BLOCKS.map((block) => block.value)),
                CONTACTS_LAYOUT_BLOCKS,
              ),
            ]),
          },
        ]
      : []),
    {
      id: "hero",
      label: "Hero",
      content: sectionBody([
        el("div", { className: "admin-grid admin-grid--two" }, [
          textInput("Заголовок", data.hero.title, (value) => (data.hero.title = value)),
          textInput("Подзаголовок", data.hero.subtitle, (value) => (data.hero.subtitle = value)),
          textInput("Telegram link", data.hero.tgLink, (value) => (data.hero.tgLink = value)),
          textInput("Email link", data.hero.emailLink, (value) => (data.hero.emailLink = value)),
        ]),
        renderStringArrayEditor("Тег", data.hero.tags),
      ]),
    },
    {
      id: "channels",
      label: "Быстрые контакты",
      content: sectionBody([
        el("div", { className: "admin-grid admin-grid--two" }, [
          textInput("Индекс", data.fastContact.index, (value) => (data.fastContact.index = value)),
          textInput(
            "Заголовок",
            data.fastContact.title,
            (value) => (data.fastContact.title = value),
          ),
        ]),
        renderObjectArrayEditor({
          title: "Канал",
          items: data.fastContact.channels,
          createItem: () => ({ type: "telegram", label: "", value: "", href: "", icon: "send" }),
          fields: [
            { key: "type", label: "Тип", type: "text" },
            { key: "label", label: "Лейбл", type: "text" },
            { key: "value", label: "Значение", type: "text" },
            { key: "href", label: "Ссылка", type: "text" },
            {
              key: "icon",
              label: "Иконка",
              type: "icon",
              options: ["send", "mail", "call"],
            },
          ],
          itemTitle: (item, index) => item.label || `Канал ${index + 1}`,
        }),
      ]),
    },
    {
      id: "workflow",
      label: "Workflow",
      content: sectionBody([
        el("div", { className: "admin-grid admin-grid--two" }, [
          textInput("Индекс", data.workflow.index, (value) => (data.workflow.index = value)),
          textInput("Заголовок", data.workflow.title, (value) => (data.workflow.title = value)),
        ]),
        renderObjectArrayEditor({
          title: "Шаг",
          items: data.workflow.steps,
          createItem: () => ({ num: "01", icon: "chat", title: "", desc: "" }),
          fields: [
            { key: "num", label: "Номер", type: "text" },
            { key: "icon", label: "Иконка", type: "icon" },
            { key: "title", label: "Заголовок", type: "text" },
            { key: "desc", label: "Описание", type: "textarea" },
          ],
          itemTitle: (item, index) => item.title || `Шаг ${index + 1}`,
        }),
      ]),
    },
    {
      id: "formats",
      label: "Formats",
      content: sectionBody([
        el("div", { className: "admin-grid admin-grid--two" }, [
          textInput("Индекс", data.formats.index, (value) => (data.formats.index = value)),
          textInput("Заголовок", data.formats.title, (value) => (data.formats.title = value)),
        ]),
        el("div", { className: "admin-grid admin-grid--two" }, [
          textInput(
            "Fast title",
            data.formats.fast.title,
            (value) => (data.formats.fast.title = value),
          ),
          textInput(
            "Fast href",
            data.formats.fast.href,
            (value) => (data.formats.fast.href = value),
          ),
        ]),
        textArea(
          "Fast description",
          data.formats.fast.desc,
          (value) => (data.formats.fast.desc = value),
        ),
        el("div", { className: "admin-grid admin-grid--two" }, [
          textInput(
            "Full title",
            data.formats.full.title,
            (value) => (data.formats.full.title = value),
          ),
          textInput(
            "Full summary",
            data.formats.full.summary,
            (value) => (data.formats.full.summary = value),
          ),
        ]),
        textArea(
          "Full description",
          data.formats.full.desc,
          (value) => (data.formats.full.desc = value),
        ),
      ]),
    },
    {
      id: "faq",
      label: "FAQ",
      content: sectionBody([
        el("div", { className: "admin-grid admin-grid--two" }, [
          textInput("Индекс", data.faq.index, (value) => (data.faq.index = value)),
          textInput("Заголовок", data.faq.title, (value) => (data.faq.title = value)),
        ]),
        renderObjectArrayEditor({
          title: "Вопрос",
          items: data.faq.items,
          createItem: () => ({ question: "", answer: "" }),
          fields: [
            { key: "question", label: "Вопрос", type: "text" },
            { key: "answer", label: "Ответ", type: "textarea" },
          ],
          itemTitle: (item, index) => item.question || `Вопрос ${index + 1}`,
        }),
      ]),
    },
    {
      id: "cta",
      label: "CTA",
      content: sectionBody([
        el("div", { className: "admin-grid admin-grid--two" }, [
          textInput("Заголовок", data.cta.title, (value) => (data.cta.title = value)),
          textInput("Подзаголовок", data.cta.subtitle, (value) => (data.cta.subtitle = value)),
          textInput("TG text", data.cta.tgText, (value) => (data.cta.tgText = value)),
          textInput("Email", data.cta.email, (value) => (data.cta.email = value)),
          textInput("Телефон", data.cta.tel, (value) => (data.cta.tel = value)),
          textInput("Примечание", data.cta.note || "", (value) => (data.cta.note = value)),
        ]),
      ]),
    },
  ]

  return sections
}

function renderContactsEditor(data, activeSectionId = null, options = {}) {
  const sections = buildContactsSections(data, options)
  if (!activeSectionId) {
    return el(
      "div",
      { className: "admin-stack" },
      sections.map((item) => section(item.label, [item.content])),
    )
  }

  return sections.find((item) => item.id === activeSectionId)?.content || sections[0].content
}

function renderTabbedEditor(activeId, sections, onChange, topBar = null) {
  const activeSection = sections.find((item) => item.id === activeId) || sections[0]

  return el("div", { className: "admin-editor" }, [
    topBar ? el("div", { className: "admin-editor__top" }, [topBar]) : null,
    el("div", { className: "admin-editor__nav" }, [renderSubtabs(activeId, sections, onChange)]),
    el("div", { className: "admin-editor__body" }, [
      el("div", { className: "admin-editor__section-head" }, [
        el("h3", { className: "admin-editor__section-title", text: activeSection.label }),
      ]),
      activeSection.content,
    ]),
  ])
}

function renderHomeTab() {
  const selectedCategory = getSelectedCategory()
  const selectedSlug = selectedCategory.slug
  const selectedLabel = getCategoryDisplayLabel(selectedCategory)
  const sections = buildHomeSections(getSelectedHomeDraft())
  const actions = el("div", { className: "admin-actions" }, [
    el("button", {
      className: "admin-button",
      type: "button",
      text: "Сохранить",
      onclick: saveHome,
    }),
    el("button", {
      className: "admin-button--ghost",
      type: "button",
      text: "Открыть preview",
      onclick: () => {
        if (selectedSlug === "default") {
          openPreview("/")
          return
        }
        openCategoryPreview(selectedSlug)
      },
    }),
  ])

  return panel(
    "Главная страница",
    selectedSlug === "default"
      ? "Редактируется quartz/static/data/home.json. После сохранения Quartz может пересобрать страницу автоматически в watch-режиме."
      : `Сейчас редактируется категория ${selectedLabel} (${selectedSlug}). Сохраняется вариант quartz/static/data/home.${selectedSlug}.json.`,
    [
      renderTabbedEditor(
        state.ui.homeSubtab,
        sections,
        (id) => {
          state.ui.homeSubtab = id
        },
        actions,
      ),
    ],
  )
}

function renderContactsTab() {
  const selectedCategory = getSelectedCategory()
  const selectedSlug = selectedCategory.slug
  const selectedLabel = getCategoryDisplayLabel(selectedCategory)
  const sections = buildContactsSections(getSelectedContactsDraft())
  const actions = el("div", { className: "admin-actions" }, [
    el("button", {
      className: "admin-button",
      type: "button",
      text: "Сохранить",
      onclick: saveContacts,
    }),
    el("button", {
      className: "admin-button--ghost",
      type: "button",
      text: "Открыть страницу",
      onclick: () => openCategoryPagePreview("/Кoнтакты", selectedSlug),
    }),
  ])

  return panel(
    selectedSlug === "default" ? "Страница контактов" : `Контакты · ${selectedLabel}`,
    selectedSlug === "default"
      ? "Редактируется quartz/static/data/contacts.json. Это базовый контактный лендинг для всех категорий."
      : `Редактируется quartz/static/data/contacts.${selectedSlug}.json. Этот вариант контактов применяется для выбранной категории так же, как и главная.`,
    [
      renderTabbedEditor(
        state.ui.contactsSubtab,
        sections,
        (id) => {
          state.ui.contactsSubtab = id
        },
        actions,
      ),
    ],
  )
}

function renderFormConfigEditor(formKey, title, description) {
  const form = state.drafts.forms[formKey]
  return {
    id: formKey,
    label: title,
    content: sectionBody([
      el("div", { className: "admin-meta-note", text: description }),
      el("div", { className: "admin-grid admin-grid--two" }, [
        textInput("Action / endpoint", form.action || "", (value) => {
          form.action = value
        }),
        selectInput(
          "Method",
          form.method || "POST",
          [
            { value: "POST", label: "POST" },
            { value: "GET", label: "GET" },
          ],
          (value) => {
            form.method = value
          },
        ),
        textInput("Submit label", form.submitLabel || "", (value) => {
          form.submitLabel = value
        }),
        textInput("Privacy note", form.privacyNote || "", (value) => {
          form.privacyNote = value
        }),
      ]),
      el("div", { className: "admin-grid admin-grid--two" }, [
        textInput("Title", form.title || "", (value) => {
          form.title = value
        }),
        textInput("Subtitle", form.subtitle || "", (value) => {
          form.subtitle = value
        }),
      ]),
      el("div", {
        className: "admin-empty",
        text: "Поля формы сохраняются без изменений. В этой версии редактируются endpoint, method и основные тексты.",
      }),
    ]),
  }
}

function renderFormsTab() {
  const sections = [
    renderFormConfigEditor(
      "homeCallback",
      "Home callback",
      "Редактируется quartz/static/data/home-callback-form.json.",
    ),
    renderFormConfigEditor(
      "feedback",
      "Feedback / бриф",
      "Редактируется quartz/static/data/feedback-form.json.",
    ),
  ]
  const actions = el("div", { className: "admin-actions" }, [
    el("button", {
      className: "admin-button",
      type: "button",
      text: "Сохранить формы",
      onclick: saveForms,
    }),
  ])

  return panel("Формы", "Endpoint и метод отправки форм сайта.", [
    renderTabbedEditor(
      state.ui.formsSubtab,
      sections,
      (id) => {
        state.ui.formsSubtab = id
      },
      actions,
    ),
  ])
}

function renderRulesTab() {
  const rules = state.drafts.rules.rules
  const categoryOptions = state.data.categories.map((category) => ({
    value: category.slug,
    label: `${category.label} (${category.slug})`,
  }))

  return panel(
    "Правила маршрутизации",
    "Редактируется quartz/static/data/multicontent-rules.json.",
    [
      el("details", { className: "admin-info-block admin-info-block--rules" }, [
        el("summary", {}, [
          el("span", { className: "material-symbols-outlined", text: "info" }),
          el("span", { text: "Как работают правила маршрутизации" }),
          el("span", { className: "admin-info-block__hint", text: "краткая справка" }),
        ]),
        el("div", { className: "admin-info-block__body" }, [
          el("p", {
            text: "Правила выбирают, какую контент-категорию показать посетителю по UTM-меткам или referrer. Правило с более высоким priority проверяется раньше; если ни одно правило не подошло, используется fallback category.",
          }),
          el("dl", { className: "admin-info-block__list" }, [
            el("div", {}, [
              el("dt", { text: "type" }),
              el("dd", { text: "utm — сравнивает UTM-параметр; referrer — источник перехода." }),
            ]),
            el("div", {}, [
              el("dt", { text: "match" }),
              el("dd", {
                text: "Значение для совпадения: например имя кампании, source или домен referrer.",
              }),
            ]),
            el("div", {}, [
              el("dt", { text: "category" }),
              el("dd", { text: "Категория контента, которая будет показана при совпадении." }),
            ]),
            el("div", {}, [
              el("dt", { text: "fallback" }),
              el("dd", {
                text: "Категория по умолчанию, когда правил нет или совпадений не найдено.",
              }),
            ]),
          ]),
          el("p", {
            className: "admin-info-block__note",
            text: "Preview-режим правила не использует и не пишет аналитику — он нужен только для ручной проверки выбранной категории.",
          }),
        ]),
      ]),
      el("div", { className: "admin-actions" }, [
        el("button", {
          className: "admin-button",
          type: "button",
          text: "Сохранить правила",
          onclick: saveRules,
        }),
        el("button", {
          className: "admin-button--ghost",
          type: "button",
          text: "Добавить правило",
          onclick: () => {
            rules.push({
              priority: rules.length + 1,
              type: "utm",
              param: "utm_source",
              match: "",
              category: "default",
            })
            render()
          },
        }),
      ]),
      el("div", { className: "admin-grid admin-grid--two" }, [
        selectInput(
          "Fallback category",
          state.drafts.rules.defaultCategory,
          categoryOptions,
          (value) => {
            state.drafts.rules.defaultCategory = value
          },
        ),
        el("div", {
          className: "admin-meta-note admin-meta-note--inline",
          text: "Если ни одно правило не совпало, посетитель увидит эту категорию. Preview-режим обходит правила.",
        }),
      ]),
      renderObjectArrayEditor({
        title: "Правило",
        items: rules,
        createItem: () => ({
          priority: rules.length + 1,
          type: "utm",
          param: "utm_source",
          match: "",
          category: "default",
        }),
        fields: [
          { key: "priority", label: "Priority", type: "number" },
          {
            key: "type",
            label: "Type",
            type: "select",
            options: [
              { value: "utm", label: "utm" },
              { value: "referrer", label: "referrer" },
            ],
          },
          { key: "param", label: "UTM param", type: "text" },
          { key: "match", label: "Match", type: "text" },
          { key: "category", label: "Category", type: "select", options: categoryOptions },
        ],
        itemTitle: (item, index) => item.match || `Правило ${index + 1}`,
      }),
    ],
  )
}

function panel(title, description, body) {
  return el("section", { className: "admin-panel" }, [
    el("div", { className: "admin-panel__head" }, [
      el("div", {}, [
        el("h2", { className: "admin-panel__title", text: title }),
        el("p", { className: "admin-panel__sub", text: description }),
      ]),
    ]),
    el("div", { className: "admin-panel__body" }, body),
  ])
}

function renderActiveTab() {
  if (!state.drafts) return null
  if (state.ui.tab === "home") return renderHomeTab()
  if (state.ui.tab === "contacts") return renderContactsTab()
  if (state.ui.tab === "forms") return renderFormsTab()
  return renderRulesTab()
}

function render() {
  applyTheme(state.ui.themeMode)
  root.innerHTML = ""

  if (state.loading) {
    root.appendChild(
      el("div", { className: "admin-shell" }, [
        el("section", { className: "admin-panel" }, [
          el("div", { className: "admin-panel__body" }, [
            el("p", { text: "Загрузка состояния админки..." }),
          ]),
        ]),
      ]),
    )
    return
  }

  const shell = el("div", { className: "admin-shell" })
  const resolvedTheme = resolveTheme(state.ui.themeMode)
  const isAutoTheme = state.ui.themeMode === "auto"
  const nextMode = resolvedTheme === "dark" ? "light" : "dark"
  const themeIcon = resolvedTheme === "dark" ? "dark_mode" : "light_mode"
  const themeLabel = isAutoTheme
    ? `Theme follows system. Current ${resolvedTheme}. Click to set ${nextMode}.`
    : `Theme is ${resolvedTheme}. Click to switch to ${nextMode}.`
  const selectedCategory = getSelectedCategory()
  const selectedSlug = selectedCategory.slug
  const categorySummaryTitle =
    selectedSlug === "default" ? "Основная категория" : getCategoryDisplayLabel(selectedCategory)
  const categorySummaryText =
    state.ui.tab === "contacts"
      ? selectedSlug === "default"
        ? "Базовый контент страницы контактов. Все контактные варианты могут наследоваться от него."
        : `Контактный вариант для категории ${selectedSlug}. Формы ниже всё ещё редактируются глобально.`
      : state.ui.tab === "forms"
        ? "Настройки форм глобальны для сайта и не маршрутизируются по категории."
        : selectedSlug === "default"
          ? "Базовый контент главной страницы. Все рекламные варианты могут наследоваться от него."
          : `Вариант для отдельного источника трафика. Контент главной ниже редактирует только ${selectedSlug}.`
  const categoryFileLabel =
    state.ui.tab === "contacts"
      ? selectedSlug === "default"
        ? "quartz/static/data/contacts.json"
        : `quartz/static/data/contacts.${selectedSlug}.json`
      : selectedSlug === "default"
        ? "quartz/static/data/home.json"
        : `quartz/static/data/home.${selectedSlug}.json`
  const categoryMetaLabel =
    selectedSlug === "default"
      ? "Base content"
      : `Slug: ${selectedSlug}${selectedCategory.extends ? ` · Extends: ${selectedCategory.extends}` : ""}`

  shell.appendChild(
    el("section", { className: "admin-hero" }, [
      el("div", { className: "admin-hero__top" }, [
        el("div", {}, [
          el("h1", { text: "Multicontent Admin" }),
          el("p", {
            text: "Локальная админка для home.json, contacts.json, категорий мультиконтента и правил маршрутизации. Продовый сайт о ней не знает.",
          }),
        ]),
        el("div", { className: "admin-hero__meta" }, [
          el("div", {
            className: "admin-chip",
            text: `Preview: ${state.data?.previewBaseUrl || "n/a"}`,
          }),
          el("div", { className: "admin-chip", text: "Редактируются только quartz/static/data/*" }),
          el(
            "button",
            {
              className: `admin-theme-icon-button admin-theme-icon-button--${resolvedTheme}${isAutoTheme ? " is-auto" : ""}`,
              type: "button",
              title: themeLabel,
              "aria-label": themeLabel,
              onclick: () => {
                state.ui.themeMode = nextMode
                persistThemeMode(nextMode)
                render()
              },
            },
            [
              el("span", {
                className: "admin-theme-icon-button__icon material-symbols-outlined",
                text: themeIcon,
              }),
            ],
          ),
        ]),
      ]),
      el("div", { className: "admin-category-toolbar" }, [
        el("div", { className: "admin-category-toolbar__controls" }, [
          el("div", {
            className: "admin-category-toolbar__eyebrow",
            text: "Категория для редактирования",
          }),
          el("div", { className: "admin-category-select-wrap" }, [
            el(
              "select",
              {
                className: "admin-category-select",
                value: selectedSlug,
                onchange: (event) => {
                  state.ui.selectedCategory = event.target.value
                  render()
                },
              },
              getCategories().map((category) => {
                const option = el("option", {
                  value: category.slug,
                  text:
                    category.slug === "default"
                      ? "Основная"
                      : `${getCategoryDisplayLabel(category)} · ${category.slug}`,
                })
                if (category.slug === selectedSlug) option.selected = true
                return option
              }),
            ),
            el("span", {
              className: "admin-category-select-wrap__icon material-symbols-outlined",
              text: "expand_more",
            }),
          ]),
          el("div", { className: "admin-category-toolbar__actions" }, [
            el("button", {
              className: "admin-button--ghost admin-button--toolbar",
              type: "button",
              text: "Создать категорию",
              onclick: openCreateCategoryModal,
            }),
            selectedSlug !== "default"
              ? el("button", {
                  className: "admin-button--ghost admin-button--toolbar-danger",
                  type: "button",
                  text: "Удалить категорию",
                  onclick: deleteCategory,
                })
              : null,
          ]),
        ]),
        el("div", { className: "admin-category-summary" }, [
          el("div", { className: "admin-category-summary__meta" }, [
            el("span", { className: "admin-category-summary__pill", text: categoryMetaLabel }),
            el("code", { className: "admin-category-summary__file", text: categoryFileLabel }),
          ]),
          el("h2", { className: "admin-category-summary__title", text: categorySummaryTitle }),
          el("p", { className: "admin-category-summary__text", text: categorySummaryText }),
        ]),
      ]),
    ]),
  )

  const tabs = [
    { id: "home", label: "Главная" },
    { id: "contacts", label: "Контакты" },
    { id: "forms", label: "Формы" },
    { id: "rules", label: "Правила" },
  ]

  shell.appendChild(
    el(
      "div",
      { className: "admin-tabs" },
      tabs.map((tab) =>
        el("button", {
          className: `admin-tab${state.ui.tab === tab.id ? " is-active" : ""}`,
          type: "button",
          text: tab.label,
          onclick: () => {
            state.ui.tab = tab.id
            render()
          },
        }),
      ),
    ),
  )

  shell.appendChild(el("div", { className: "admin-layout" }, [renderActiveTab()]))

  if (state.status) {
    shell.appendChild(
      el("div", { className: `admin-status is-${state.status.type}` }, [state.status.message]),
    )
  }

  root.appendChild(shell)
}

applyTheme(state.ui.themeMode)
loadState()
