const state = {
  loading: true,
  data: null,
  drafts: null,
  status: null,
  ui: {
    tab: "home",
    selectedCategory: null,
    createSlug: "",
    createLabel: "",
    createFrom: "default",
  },
}

const root = document.getElementById("app")

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
    rules: deepClone(data.rules),
    variants: {},
    categoryMeta: {},
  }

  data.categories
    .filter((category) => category.slug !== "default")
    .forEach((category) => {
      drafts.variants[category.slug] = deepClone(data.variants[category.slug] || data.home)
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

    const categorySlugs = data.categories
      .filter((item) => item.slug !== "default")
      .map((item) => item.slug)
    state.ui.selectedCategory = categorySlugs.includes(preferredCategory)
      ? preferredCategory
      : categorySlugs[0] || null
    state.ui.createFrom = state.ui.selectedCategory || "default"
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
  try {
    await request("/api/home/save", {
      method: "POST",
      body: JSON.stringify({ content: state.drafts.home }),
    })
    await loadState(state.ui.selectedCategory)
    setStatus("success", "Главная страница сохранена.")
  } catch (error) {
    setStatus("error", error.message)
  }
}

async function saveContacts() {
  try {
    await request("/api/contacts/save", {
      method: "POST",
      body: JSON.stringify({ content: state.drafts.contacts }),
    })
    await loadState(state.ui.selectedCategory)
    setStatus("success", "Контакты сохранены.")
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

async function saveCategory() {
  const slug = state.ui.selectedCategory
  if (!slug) return

  const meta = state.drafts.categoryMeta[slug]
  const content = state.drafts.variants[slug]

  try {
    await request("/api/categories/save", {
      method: "POST",
      body: JSON.stringify({
        slug,
        label: meta.label,
        extends: meta.extends,
        content,
      }),
    })
    await loadState(slug)
    setStatus("success", `Категория ${slug} сохранена.`)
  } catch (error) {
    setStatus("error", error.message)
  }
}

async function createCategory() {
  const createdSlug = state.ui.createSlug.trim()

  try {
    await request("/api/categories/create", {
      method: "POST",
      body: JSON.stringify({
        slug: createdSlug,
        label: state.ui.createLabel.trim(),
        fromSlug: state.ui.createFrom || "default",
      }),
    })
    state.ui.createSlug = ""
    state.ui.createLabel = ""
    await loadState(createdSlug)
    setStatus("success", "Категория создана.")
  } catch (error) {
    setStatus("error", error.message)
  }
}

async function deleteCategory() {
  const slug = state.ui.selectedCategory
  if (!slug) return

  if (!window.confirm(`Удалить категорию ${slug}?`)) return

  try {
    await request("/api/categories/delete", {
      method: "POST",
      body: JSON.stringify({ slug }),
    })
    await loadState()
    setStatus("success", `Категория ${slug} удалена.`)
  } catch (error) {
    setStatus("error", error.message)
  }
}

function openPreview(pathname) {
  if (!state.data?.previewBaseUrl) return
  const url = new URL(pathname, state.data.previewBaseUrl)
  window.open(url.toString(), "_blank", "noopener")
}

function openCategoryPreview(slug) {
  if (!state.data?.previewBaseUrl) return
  const url = new URL("/", state.data.previewBaseUrl)
  url.searchParams.set("_mc_preview", slug)
  window.open(url.toString(), "_blank", "noopener")
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

function section(title, content, description = "") {
  return el("details", { className: "admin-details", open: "true" }, [
    el("summary", {}, [
      el("span", { text: title }),
      description ? el("span", { className: "admin-meta-note", text: description }) : null,
    ]),
    el("div", { className: "admin-details__body" }, content),
  ])
}

function renderHomeEditor(data) {
  const iconVariantOptions = [
    { value: "blue", label: "blue" },
    { value: "purple", label: "purple" },
    { value: "orange", label: "orange" },
    { value: "green", label: "green" },
  ]

  return el("div", { className: "admin-stack" }, [
    section("Hero", [
      el("div", { className: "admin-grid admin-grid--two" }, [
        textInput("Заголовок", data.hero.title, (value) => (data.hero.title = value)),
        textInput("Подзаголовок", data.hero.subtitle, (value) => (data.hero.subtitle = value)),
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
      renderStringArrayEditor("Тег", data.hero.tags),
    ]),
    section("Focus", [
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
          title: "",
          desc: "",
          resultIcon: "trending_up",
          resultText: "",
        }),
        fields: [
          { key: "icon", label: "Иконка", type: "text" },
          { key: "iconVariant", label: "Цвет", type: "select", options: iconVariantOptions },
          { key: "title", label: "Заголовок", type: "text" },
          { key: "resultIcon", label: "Иконка результата", type: "text" },
          { key: "desc", label: "Описание", type: "textarea" },
          { key: "resultText", label: "Результат", type: "text" },
        ],
        itemTitle: (item, index) => item.title || `Карточка ${index + 1}`,
      }),
    ]),
    section("Services", [
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
          title: "",
          backText: "",
        }),
        fields: [
          { key: "icon", label: "Иконка", type: "text" },
          { key: "iconVariant", label: "Цвет", type: "select", options: iconVariantOptions },
          { key: "title", label: "Заголовок", type: "text" },
          { key: "backText", label: "Описание", type: "textarea" },
        ],
        itemTitle: (item, index) => item.title || `Сервис ${index + 1}`,
      }),
    ]),
    section("FAQ", [
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
    section("Contact CTA", [
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
  ])
}

function renderContactsEditor(data) {
  return el("div", { className: "admin-stack" }, [
    section("Hero", [
      el("div", { className: "admin-grid admin-grid--two" }, [
        textInput("Заголовок", data.hero.title, (value) => (data.hero.title = value)),
        textInput("Подзаголовок", data.hero.subtitle, (value) => (data.hero.subtitle = value)),
        textInput("Telegram link", data.hero.tgLink, (value) => (data.hero.tgLink = value)),
        textInput("Email link", data.hero.emailLink, (value) => (data.hero.emailLink = value)),
      ]),
      renderStringArrayEditor("Тег", data.hero.tags),
    ]),
    section("Быстрые контакты", [
      el("div", { className: "admin-grid admin-grid--two" }, [
        textInput("Индекс", data.fastContact.index, (value) => (data.fastContact.index = value)),
        textInput("Заголовок", data.fastContact.title, (value) => (data.fastContact.title = value)),
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
          { key: "icon", label: "Иконка", type: "text" },
        ],
        itemTitle: (item, index) => item.label || `Канал ${index + 1}`,
      }),
    ]),
    section("Workflow", [
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
          { key: "icon", label: "Иконка", type: "text" },
          { key: "title", label: "Заголовок", type: "text" },
          { key: "desc", label: "Описание", type: "textarea" },
        ],
        itemTitle: (item, index) => item.title || `Шаг ${index + 1}`,
      }),
    ]),
    section("Formats", [
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
        textInput("Fast href", data.formats.fast.href, (value) => (data.formats.fast.href = value)),
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
    section("FAQ", [
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
    section("CTA", [
      el("div", { className: "admin-grid admin-grid--two" }, [
        textInput("Заголовок", data.cta.title, (value) => (data.cta.title = value)),
        textInput("Подзаголовок", data.cta.subtitle, (value) => (data.cta.subtitle = value)),
        textInput("TG text", data.cta.tgText, (value) => (data.cta.tgText = value)),
        textInput("Email", data.cta.email, (value) => (data.cta.email = value)),
        textInput("Телефон", data.cta.tel, (value) => (data.cta.tel = value)),
        textInput("Примечание", data.cta.note || "", (value) => (data.cta.note = value)),
      ]),
    ]),
  ])
}

function renderHomeTab() {
  return panel(
    "Главная страница",
    "Редактируется quartz/static/data/home.json. После сохранения Quartz может пересобрать страницу автоматически в watch-режиме.",
    [
      el("div", { className: "admin-actions" }, [
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
          onclick: () => openPreview("/"),
        }),
      ]),
      renderHomeEditor(state.drafts.home),
    ],
  )
}

function renderContactsTab() {
  return panel("Страница контактов", "Редактируется quartz/static/data/contacts.json.", [
    el("div", { className: "admin-actions" }, [
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
        onclick: () => openPreview(encodeURI("/Кoнтакты")),
      }),
    ]),
    renderContactsEditor(state.drafts.contacts),
  ])
}

function renderCategoryTab() {
  const categories = state.data.categories.filter((category) => category.slug !== "default")
  const selectedSlug = state.ui.selectedCategory
  const selectedMeta = selectedSlug ? state.drafts.categoryMeta[selectedSlug] : null
  const selectedContent = selectedSlug ? state.drafts.variants[selectedSlug] : null

  const sidebar = el("aside", { className: "admin-sidebar" }, [
    el("div", { className: "admin-stack" }, [
      el("h3", { text: "Новая категория" }),
      textInput(
        "Slug",
        state.ui.createSlug,
        (value) => (state.ui.createSlug = value.toLowerCase()),
        {
          placeholder: "instagram",
        },
      ),
      textInput("Label", state.ui.createLabel, (value) => (state.ui.createLabel = value), {
        placeholder: "Трафик из Instagram",
      }),
      selectInput(
        "Скопировать из",
        state.ui.createFrom,
        state.data.categories.map((category) => ({ value: category.slug, label: category.label })),
        (value) => (state.ui.createFrom = value),
      ),
      el("button", {
        className: "admin-button",
        type: "button",
        text: "Создать категорию",
        onclick: createCategory,
      }),
      el("p", {
        className: "admin-meta-note",
        text: "Slug допускает только a-z, 0-9 и дефис.",
      }),
    ]),
    el("div", { className: "admin-category-list" }, [
      ...categories.map((category) =>
        el(
          "button",
          {
            className: `admin-category-card${category.slug === selectedSlug ? " is-active" : ""}`,
            type: "button",
            onclick: () => {
              state.ui.selectedCategory = category.slug
              render()
            },
          },
          [
            el("strong", { text: category.label }),
            el("div", { className: "admin-code", text: category.slug }),
          ],
        ),
      ),
    ]),
  ])

  const main = selectedSlug
    ? panel(
        `Категория: ${selectedSlug}`,
        "Редактируется отдельный вариант home.<slug>.json. Preview открывается с параметром _mc_preview.",
        [
          el("div", { className: "admin-actions" }, [
            el("button", {
              className: "admin-button",
              type: "button",
              text: "Сохранить категорию",
              onclick: saveCategory,
            }),
            el("button", {
              className: "admin-button--ghost",
              type: "button",
              text: "Открыть preview",
              onclick: () => openCategoryPreview(selectedSlug),
            }),
            el("button", {
              className: "admin-button--danger",
              type: "button",
              text: "Удалить категорию",
              onclick: deleteCategory,
            }),
          ]),
          section("Метаданные категории", [
            el("div", { className: "admin-grid admin-grid--three" }, [
              textInput("Slug", selectedSlug, () => {}, { type: "text", readOnly: true }),
              textInput("Label", selectedMeta.label, (value) => (selectedMeta.label = value)),
              selectInput(
                "Extends",
                selectedMeta.extends,
                state.data.categories
                  .filter(
                    (category) => category.slug === "default" || category.slug !== selectedSlug,
                  )
                  .map((category) => ({ value: category.slug, label: category.label })),
                (value) => {
                  selectedMeta.extends = value
                  selectedContent.extends = value
                },
              ),
            ]),
          ]),
          renderHomeEditor(selectedContent),
        ],
      )
    : panel("Категории", "Создайте первую категорию, чтобы редактировать вариант контента.", [
        el("div", { className: "admin-empty", text: "Категории пока не созданы." }),
      ])

  return el("div", { className: "admin-split" }, [sidebar, main])
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
          className: "admin-meta-note",
          text: "Preview-режим не использует эти правила и не пишет аналитику.",
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
  if (state.ui.tab === "categories") return renderCategoryTab()
  return renderRulesTab()
}

function render() {
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
        ]),
      ]),
    ]),
  )

  const tabs = [
    { id: "home", label: "Главная" },
    { id: "contacts", label: "Контакты" },
    { id: "categories", label: "Категории" },
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

loadState()
