import type {} from "./util"

type FeedbackFormOption = {
  label: string
  value: string
  checked?: boolean
}

type FeedbackFormField = {
  type: "text" | "email" | "tel" | "textarea" | "select" | "checkbox" | "radio" | "range" | "hidden"
  name?: string
  label?: string
  placeholder?: string
  required?: boolean
  value?: string
  rows?: number
  options?: FeedbackFormOption[]
  multiple?: boolean
  autocomplete?: AutoFill
  help?: string
  min?: number
  max?: number
  step?: number
  unit?: string
  showValue?: boolean
  layout?: "two-columns"
}

type FeedbackFormAction = {
  type?: "submit" | "button" | "link"
  label: string
  href?: string
  target?: string
  variant?: "primary" | "secondary"
}

type FeedbackFormConfig = {
  title?: string
  subtitle?: string
  action?: string
  method?: string
  submitLabel?: string
  privacyNote?: string
  fields?: FeedbackFormField[]
  actions?: FeedbackFormAction[]
}

const DEFAULTS: Required<
  Pick<FeedbackFormConfig, "title" | "subtitle" | "submitLabel" | "privacyNote">
> = {
  title: "Форма обратной связи",
  subtitle: "Коротко, по делу. Я свяжусь с вами.",
  submitLabel: "Отправить",
  privacyNote: "Без спама",
}

const DEFAULT_FIELDS: FeedbackFormField[] = [
  {
    type: "text",
    name: "name",
    label: "Имя / компания",
    placeholder: "Имя / компания",
    required: true,
    autocomplete: "name",
  },
  {
    type: "tel",
    name: "phone",
    label: "Телефон",
    placeholder: "Телефон",
    autocomplete: "tel",
  },
  {
    type: "email",
    name: "email",
    label: "Почта",
    placeholder: "Почта",
    required: true,
    autocomplete: "email",
  },
  {
    type: "text",
    name: "telegram",
    label: "Telegram",
    placeholder: "Telegram",
    autocomplete: "off",
  },
  {
    type: "textarea",
    name: "message",
    label: "Сообщение",
    placeholder: "Сообщение",
    required: true,
    rows: 5,
  },
]

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
  root.classList.add("feedback-form", "is-error")
  root.innerHTML = ""
  root.textContent = message
}

function readConfig(root: HTMLElement): FeedbackFormConfig {
  const dataset = root.dataset
  return {
    title: dataset.title,
    subtitle: dataset.subtitle,
    action: dataset.formAction ?? dataset.action,
    method: dataset.formMethod ?? dataset.method,
    submitLabel: dataset.submitLabel,
    privacyNote: dataset.privacyNote,
  }
}

function mergeConfig(base: FeedbackFormConfig, override?: FeedbackFormConfig) {
  if (!override) return base
  const next: FeedbackFormConfig = { ...base }
  ;(
    Object.entries(override) as Array<
      [keyof FeedbackFormConfig, FeedbackFormConfig[keyof FeedbackFormConfig]]
    >
  ).forEach(([key, value]) => {
    if (value !== undefined) {
      next[key] = value as never
    }
  })
  return next
}

async function readSourceConfig(root: HTMLElement): Promise<FeedbackFormConfig | null> {
  const rawSource = root.dataset.source ?? root.getAttribute("data-source") ?? ""
  const trimmed = rawSource.trim()
  if (!trimmed) return null
  const source = resolveSource(trimmed)

  try {
    const response = await fetch(source, {
      headers: {
        Accept: "application/json",
      },
    })
    if (!response.ok) {
      renderError(root, `feedback-form: failed to load ${source}`)
      return null
    }
    const data = (await response.json()) as unknown
    if (!data || typeof data !== "object") {
      renderError(root, "feedback-form: invalid JSON")
      return null
    }
    return data as FeedbackFormConfig
  } catch {
    renderError(root, `feedback-form: failed to load ${source}`)
    return null
  }
}

function cssEscape(value: string) {
  if (typeof window.CSS?.escape === "function") {
    return window.CSS.escape(value)
  }
  return value.replace(/"/g, '\\"')
}

function normalizeFields(fields?: FeedbackFormField[]) {
  if (!fields || !Array.isArray(fields) || fields.length === 0) {
    return DEFAULT_FIELDS
  }
  return fields
}

function buildActions(config: FeedbackFormConfig) {
  const actions = config.actions
  if (!actions || actions.length === 0) {
    return [
      {
        type: "submit" as const,
        label: config.submitLabel ?? DEFAULTS.submitLabel,
      },
    ]
  }
  return actions
}

function buildPayload(fields: FeedbackFormField[], form: HTMLFormElement) {
  const payload: Record<string, unknown> = {}
  fields.forEach((field) => {
    if (!field.name) return
    const name = field.name
    const selector = cssEscape(name)

    if (field.type === "checkbox") {
      const inputs = Array.from(
        form.querySelectorAll<HTMLInputElement>(`input[name="${selector}"]`),
      )
      if (inputs.length > 1) {
        payload[name] = inputs.filter((input) => input.checked).map((input) => input.value)
      } else {
        const input = inputs[0]
        if (!input) return
        payload[name] = input.checked ? input.value || true : false
      }
      return
    }

    if (field.type === "radio") {
      const input = form.querySelector<HTMLInputElement>(`input[name="${selector}"]:checked`)
      payload[name] = input?.value ?? ""
      return
    }

    if (field.type === "select") {
      const select = form.querySelector<HTMLSelectElement>(`select[name="${selector}"]`)
      if (!select) return
      if (select.multiple) {
        payload[name] = Array.from(select.selectedOptions).map((option) => option.value)
      } else {
        payload[name] = select.value
      }
      return
    }

    if (field.type === "textarea") {
      const textarea = form.querySelector<HTMLTextAreaElement>(`textarea[name="${selector}"]`)
      payload[name] = textarea?.value ?? ""
      return
    }

    if (field.type === "hidden") {
      const input = form.querySelector<HTMLInputElement>(`input[name="${selector}"]`)
      payload[name] = input?.value ?? field.value ?? ""
      return
    }

    const input = form.querySelector<HTMLInputElement>(`input[name="${selector}"]`)
    payload[name] = input?.value ?? ""
  })

  Object.entries(payload).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      payload[key] = value.join(", ")
    }
  })

  return payload
}

function renderField(
  field: FeedbackFormField,
  form: HTMLFormElement,
  requiredGroups: Array<{ name: string; label?: string }>,
  index: number,
  appendRow: (row: HTMLElement, field: FeedbackFormField) => void,
) {
  if (field.type === "hidden") {
    if (!field.name) return
    const hidden = createEl("input") as HTMLInputElement
    hidden.type = "hidden"
    hidden.name = field.name
    if (field.value !== undefined) {
      hidden.value = String(field.value)
    }
    form.append(hidden)
    return
  }

  const row = createEl("div", "feedback-form__field-row")
  if (field.layout === "two-columns") {
    row.classList.add("two-columns")
  }
  const labelText = field.label?.trim()
  const fieldId = field.name ? `feedback-${field.name}-${index}` : `feedback-field-${index}`

  const addLabel = (id?: string) => {
    if (!labelText) return
    const label = createEl("label", "feedback-form__label") as HTMLLabelElement
    label.textContent = labelText
    if (id) label.htmlFor = id
    row.append(label)
  }

  if (field.type === "textarea") {
    addLabel(fieldId)
    const textarea = createEl("textarea", "feedback-form__field") as HTMLTextAreaElement
    textarea.name = field.name ?? ""
    textarea.placeholder = field.placeholder ?? ""
    textarea.rows = field.rows ?? 4
    if (field.required) textarea.required = true
    if (fieldId) textarea.id = fieldId
    if (field.autocomplete) textarea.autocomplete = field.autocomplete
    row.append(textarea)
  } else if (field.type === "range") {
    addLabel(fieldId)
    const rangeWrap = createEl("div", "feedback-form__range")
    const range = createEl("input", "feedback-form__range-input") as HTMLInputElement
    const valueChip = createEl("span", "feedback-form__range-value")

    range.type = "range"
    range.name = field.name ?? ""
    if (field.min !== undefined) range.min = String(field.min)
    if (field.max !== undefined) range.max = String(field.max)
    if (field.step !== undefined) range.step = String(field.step)
    if (field.value !== undefined) range.value = String(field.value)
    if (field.required) range.required = true
    if (fieldId) range.id = fieldId

    const formatValue = (raw: string) => {
      const num = Number(raw)
      const formatted = Number.isFinite(num) ? new Intl.NumberFormat("ru-RU").format(num) : raw
      return field.unit ? `${formatted} ${field.unit}` : formatted
    }

    const setValue = (raw: string) => {
      valueChip.textContent = formatValue(raw)
    }

    const initialValue = range.value || range.min || "0"
    setValue(initialValue)

    const onInput = () => setValue(range.value)
    range.addEventListener("input", onInput)
    window.addCleanup(() => {
      range.removeEventListener("input", onInput)
    })

    rangeWrap.append(range)
    if (field.showValue !== false) {
      rangeWrap.append(valueChip)
    }
    row.append(rangeWrap)
  } else if (field.type === "select") {
    addLabel(fieldId)
    const select = createEl("select", "feedback-form__field") as HTMLSelectElement
    select.name = field.name ?? ""
    if (field.required) select.required = true
    if (field.multiple) select.multiple = true
    if (fieldId) select.id = fieldId
    ;(field.options ?? []).forEach((option) => {
      const opt = createEl("option") as HTMLOptionElement
      opt.value = option.value
      opt.textContent = option.label
      if (option.checked) opt.selected = true
      select.append(opt)
    })
    row.append(select)
  } else if (field.type === "checkbox" || field.type === "radio") {
    if (labelText) {
      const groupLabel = createEl("div", "feedback-form__label")
      groupLabel.textContent = labelText
      row.append(groupLabel)
    }

    const optionsWrap = createEl("div", "feedback-form__options")
    const options = field.options && field.options.length > 0 ? field.options : null

    if (options) {
      if (field.type === "checkbox" && field.required && field.name) {
        requiredGroups.push({ name: field.name, label: labelText })
      }

      options.forEach((option, optionIndex) => {
        const optionLabel = createEl("label", "feedback-form__option") as HTMLLabelElement
        const input = createEl("input") as HTMLInputElement
        input.type = field.type
        input.name = field.name ?? `option-${index}`
        input.value = option.value
        input.checked = Boolean(option.checked)
        if (field.type === "radio" && field.required && optionIndex === 0) {
          input.required = true
        }
        optionLabel.append(input, option.label)
        optionsWrap.append(optionLabel)
      })
    } else {
      const optionLabel = createEl("label", "feedback-form__option") as HTMLLabelElement
      const input = createEl("input") as HTMLInputElement
      input.type = field.type
      input.name = field.name ?? `option-${index}`
      if (field.value !== undefined) {
        input.value = String(field.value)
      }
      if (field.required) {
        input.required = true
      }
      optionLabel.append(input, labelText ?? "")
      optionsWrap.append(optionLabel)
    }

    row.append(optionsWrap)
  } else {
    addLabel(fieldId)
    const input = createEl("input", "feedback-form__field") as HTMLInputElement
    input.type = field.type
    input.name = field.name ?? ""
    input.placeholder = field.placeholder ?? ""
    if (field.required) input.required = true
    if (field.value !== undefined) input.value = String(field.value)
    if (field.autocomplete) input.autocomplete = field.autocomplete
    if (fieldId) input.id = fieldId
    row.append(input)
  }

  if (field.help) {
    const help = createEl("div", "feedback-form__help")
    help.textContent = field.help
    row.append(help)
  }

  appendRow(row, field)
}

async function mountForm(root: HTMLElement) {
  if (root.dataset.feedbackFormMounted === "true") {
    return
  }

  root.dataset.feedbackFormMounted = "true"
  root.classList.add("feedback-form")
  root.innerHTML = ""

  const [sourceConfig, datasetConfig] = await Promise.all([
    readSourceConfig(root),
    Promise.resolve(readConfig(root)),
  ])
  if (root.classList.contains("is-error")) return

  const baseConfig = mergeConfig({ ...DEFAULTS }, sourceConfig ?? undefined)
  const config = mergeConfig(baseConfig, datasetConfig)

  const fields = normalizeFields(sourceConfig?.fields ?? config.fields)
  const actionsConfig = buildActions(config)

  const rawAction = config.action ?? ""
  const rawMethod = config.method ?? "POST"
  const trimmedAction = rawAction.trim()
  const resolvedAction = trimmedAction ? resolveSource(trimmedAction) : ""
  const methodUpper = rawMethod.trim().toUpperCase()
  const method = methodUpper === "GET" || methodUpper === "POST" ? methodUpper : "POST"
  const hasValidAction =
    resolvedAction !== "" &&
    resolvedAction !== "null" &&
    resolvedAction !== "undefined" &&
    !/\/null(?:[/?#]|$)/.test(resolvedAction)

  const card = createEl("div", "feedback-form__card")
  const title = createEl("div", "feedback-form__title")
  const subtitle = createEl("div", "feedback-form__subtitle")
  const form = createEl("form", "feedback-form__form") as HTMLFormElement
  const actions = createEl("div", "feedback-form__actions")
  const privacyNote = createEl("div", "feedback-form__privacy")
  const status = createEl("div", "feedback-form__status")

  title.textContent = config.title ?? DEFAULTS.title
  subtitle.textContent = config.subtitle ?? DEFAULTS.subtitle
  privacyNote.textContent = config.privacyNote ?? DEFAULTS.privacyNote
  status.setAttribute("role", "status")
  status.setAttribute("aria-live", "polite")

  if (hasValidAction) {
    form.action = resolvedAction
  }
  form.method = method

  const twoColumnWrapper = createEl("div", "feedback-form__two-column")
  let hasTwoColumn = false
  const appendRow = (row: HTMLElement, field: FeedbackFormField) => {
    if (field.layout === "two-columns") {
      if (!hasTwoColumn) {
        form.append(twoColumnWrapper)
        hasTwoColumn = true
      }
      twoColumnWrapper.append(row)
      return
    }
    form.append(row)
  }

  const requiredGroups: Array<{ name: string; label?: string }> = []
  fields.forEach((field, index) => renderField(field, form, requiredGroups, index, appendRow))

  actionsConfig.forEach((action) => {
    const type = action.type ?? "submit"
    const label = action.label
    if (type === "link" && action.href) {
      const link = createEl("a", "feedback-form__button") as HTMLAnchorElement
      link.href = action.href
      link.textContent = label
      link.target = action.target ?? "_self"
      if (action.variant === "secondary") {
        link.classList.add("is-secondary")
      }
      actions.append(link)
      return
    }

    const buttonClass = type === "submit" ? "feedback-form__submit" : "feedback-form__button"
    const button = createEl("button", buttonClass) as HTMLButtonElement
    button.type = type === "submit" ? "submit" : "button"
    button.textContent = label
    if (action.variant === "secondary") {
      button.classList.add("is-secondary")
    }
    actions.append(button)
  })

  if (privacyNote.textContent?.trim()) {
    actions.append(privacyNote)
  }

  form.append(actions, status)
  card.append(title, subtitle, form)
  root.append(card)

  let isSubmitting = false
  const onSubmit = async (event: Event) => {
    event.preventDefault()
    if (!hasValidAction) {
      status.textContent = "Не задан корректный URL формы. Проверьте data-form-action."
      return
    }

    for (const group of requiredGroups) {
      const selector = cssEscape(group.name)
      const inputs = Array.from(
        form.querySelectorAll<HTMLInputElement>(`input[name="${selector}"]`),
      )
      if (!inputs.some((input) => input.checked)) {
        status.textContent = group.label
          ? `Заполните поле: ${group.label}`
          : "Заполните обязательные поля."
        return
      }
    }

    if (!form.reportValidity()) {
      return
    }

    if (isSubmitting) return
    isSubmitting = true
    const submitButton = form.querySelector<HTMLButtonElement>('button[type="submit"]')
    if (submitButton) submitButton.disabled = true
    status.textContent = "Отправляем..."

    try {
      const payload = buildPayload(fields, form)
      const response = await fetch(resolvedAction, {
        method,
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
      if (submitButton) submitButton.disabled = false
      isSubmitting = false
    }
  }

  form.addEventListener("submit", onSubmit)
  window.addCleanup(() => {
    form.removeEventListener("submit", onSubmit)
  })
}

const mountForms = () => {
  document.querySelectorAll<HTMLElement>("feedback-form, .feedback-form").forEach((root) => {
    void mountForm(root)
  })
}

document.addEventListener("nav", mountForms)
mountForms()
