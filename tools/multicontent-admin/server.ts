import http from "node:http"
import path from "node:path"
import fs from "node:fs/promises"
import { existsSync } from "node:fs"
import { fileURLToPath } from "node:url"

type JsonObject = Record<string, any>

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = path.resolve(__dirname, "../..")
const CLIENT_DIR = path.join(__dirname, "client")
const DATA_DIR = path.join(ROOT_DIR, "quartz", "static", "data")

const HOME_PATH = path.join(DATA_DIR, "home.json")
const CONTACTS_PATH = path.join(DATA_DIR, "contacts.json")
const RULES_PATH = path.join(DATA_DIR, "multicontent-rules.json")
const META_PATH = path.join(DATA_DIR, "multicontent-meta.json")

const PORT = Number(process.env.MULTICONTENT_ADMIN_PORT || 3100)
const PREVIEW_BASE_URL = process.env.MULTICONTENT_PREVIEW_BASE_URL || "http://localhost:8080"

function fail(message: string): never {
  throw new Error(message)
}

function ensure(condition: unknown, message: string): asserts condition {
  if (!condition) fail(message)
}

function isPlainObject(value: unknown): value is JsonObject {
  return value != null && typeof value === "object" && !Array.isArray(value)
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

function mergeContent(base: any, override: any): any {
  if (Array.isArray(override)) return override.slice()

  if (!isPlainObject(base) || !isPlainObject(override)) {
    return override === undefined ? base : override
  }

  const merged: JsonObject = { ...base }
  for (const [key, value] of Object.entries(override)) {
    if (value === undefined) continue
    if (Array.isArray(value)) {
      merged[key] = value.slice()
      continue
    }
    if (isPlainObject(value)) {
      merged[key] = mergeContent(isPlainObject(base[key]) ? base[key] : {}, value)
      continue
    }
    merged[key] = value
  }

  return merged
}

function ensureSlug(value: unknown, fieldName = "slug"): string {
  ensure(typeof value === "string" && value.length > 0, `${fieldName} is required`)
  ensure(/^[a-z0-9-]+$/.test(value), `${fieldName} must match ^[a-z0-9-]+$`)
  return value
}

function ensureString(value: unknown, fieldName: string) {
  ensure(typeof value === "string", `${fieldName} must be a string`)
}

function ensureStringArray(value: unknown, fieldName: string) {
  ensure(Array.isArray(value), `${fieldName} must be an array`)
  value.forEach((entry, index) => ensureString(entry, `${fieldName}[${index}]`))
}

function ensureObjectArray(value: unknown, fieldName: string) {
  ensure(Array.isArray(value), `${fieldName} must be an array`)
  value.forEach((entry, index) =>
    ensure(isPlainObject(entry), `${fieldName}[${index}] must be an object`),
  )
}

function optionalString(value: unknown, fieldName: string) {
  if (value === undefined) return
  ensureString(value, fieldName)
}

function homeVariantPath(slug: string) {
  return path.join(DATA_DIR, `home.${slug}.json`)
}

async function readJson(filePath: string) {
  return JSON.parse(await fs.readFile(filePath, "utf8"))
}

async function writeJson(filePath: string, data: unknown) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2) + "\n", "utf8")
}

function todayStamp() {
  return new Date().toISOString().slice(0, 10)
}

function validateHomeContent(
  data: unknown,
  options?: { requireExtends?: boolean; slug?: string; partial?: boolean },
) {
  ensure(isPlainObject(data), "home content must be an object")
  ensure(typeof data.schemaVersion === "number", "home.schemaVersion must be a number")
  const partial = Boolean(options?.partial)

  if (options?.requireExtends) {
    ensureString(data.extends, "home.extends")
    if (options.slug) {
      ensure(data.extends !== options.slug, "home.extends cannot reference itself")
    }
  } else if (data.extends !== undefined) {
    optionalString(data.extends, "home.extends")
  }

  if (!partial || data.hero !== undefined) {
    ensure(isPlainObject(data.hero), "home.hero must be an object")
    if (!partial || data.hero.title !== undefined) ensureString(data.hero.title, "home.hero.title")
    if (!partial || data.hero.subtitle !== undefined) {
      ensureString(data.hero.subtitle, "home.hero.subtitle")
    }
    if (!partial || data.hero.tags !== undefined)
      ensureStringArray(data.hero.tags, "home.hero.tags")
    if (!partial || data.hero.primaryAction !== undefined) {
      ensureString(data.hero.primaryAction, "home.hero.primaryAction")
    }
    if (!partial || data.hero.secondaryAction !== undefined) {
      ensureString(data.hero.secondaryAction, "home.hero.secondaryAction")
    }
  }

  if (!partial || data.focus !== undefined) {
    ensure(isPlainObject(data.focus), "home.focus must be an object")
    if (!partial || data.focus.index !== undefined)
      ensureString(data.focus.index, "home.focus.index")
    if (!partial || data.focus.title !== undefined)
      ensureString(data.focus.title, "home.focus.title")
    if (!partial || data.focus.cards !== undefined) {
      ensureObjectArray(data.focus.cards, "home.focus.cards")
      data.focus.cards.forEach((card: JsonObject, index: number) => {
        ensureString(card.icon, `home.focus.cards[${index}].icon`)
        ensureString(card.iconVariant, `home.focus.cards[${index}].iconVariant`)
        ensureString(card.title, `home.focus.cards[${index}].title`)
        ensureString(card.desc, `home.focus.cards[${index}].desc`)
        ensureString(card.resultIcon, `home.focus.cards[${index}].resultIcon`)
        ensureString(card.resultText, `home.focus.cards[${index}].resultText`)
      })
    }
  }

  if (!partial || data.services !== undefined) {
    ensure(isPlainObject(data.services), "home.services must be an object")
    if (!partial || data.services.index !== undefined) {
      ensureString(data.services.index, "home.services.index")
    }
    if (!partial || data.services.title !== undefined) {
      ensureString(data.services.title, "home.services.title")
    }
    if (!partial || data.services.items !== undefined) {
      ensureObjectArray(data.services.items, "home.services.items")
      data.services.items.forEach((item: JsonObject, index: number) => {
        ensureString(item.icon, `home.services.items[${index}].icon`)
        ensureString(item.title, `home.services.items[${index}].title`)
        ensureString(item.backText, `home.services.items[${index}].backText`)
        optionalString(item.iconVariant, `home.services.items[${index}].iconVariant`)
      })
    }
  }

  if (!partial || data.faq !== undefined) {
    ensure(isPlainObject(data.faq), "home.faq must be an object")
    if (!partial || data.faq.index !== undefined) ensureString(data.faq.index, "home.faq.index")
    if (!partial || data.faq.title !== undefined) ensureString(data.faq.title, "home.faq.title")
    if (!partial || data.faq.items !== undefined) {
      ensureObjectArray(data.faq.items, "home.faq.items")
      data.faq.items.forEach((item: JsonObject, index: number) => {
        ensureString(item.question, `home.faq.items[${index}].question`)
        ensureString(item.answer, `home.faq.items[${index}].answer`)
      })
    }
  }

  if (!partial || data.contact !== undefined) {
    ensure(isPlainObject(data.contact), "home.contact must be an object")
    if (!partial || data.contact.title !== undefined) {
      ensureString(data.contact.title, "home.contact.title")
    }
    if (!partial || data.contact.subtitle !== undefined) {
      ensureString(data.contact.subtitle, "home.contact.subtitle")
    }
    optionalString(data.contact.callbackAria, "home.contact.callbackAria")
    optionalString(data.contact.callbackTitle, "home.contact.callbackTitle")
    optionalString(data.contact.callbackDesc, "home.contact.callbackDesc")
    optionalString(data.contact.callbackButton, "home.contact.callbackButton")
    optionalString(data.contact.modalTitle, "home.contact.modalTitle")
    optionalString(data.contact.modalSubtitle, "home.contact.modalSubtitle")
    optionalString(data.contact.legalPrefix, "home.contact.legalPrefix")
    optionalString(data.contact.legalLinkText, "home.contact.legalLinkText")
    optionalString(data.contact.note, "home.contact.note")
  }
}

function validateContactsContent(data: unknown) {
  ensure(isPlainObject(data), "contacts content must be an object")

  ensure(isPlainObject(data.hero), "contacts.hero must be an object")
  ensureString(data.hero.title, "contacts.hero.title")
  ensureString(data.hero.subtitle, "contacts.hero.subtitle")
  ensureStringArray(data.hero.tags, "contacts.hero.tags")
  ensureString(data.hero.tgLink, "contacts.hero.tgLink")
  ensureString(data.hero.emailLink, "contacts.hero.emailLink")

  ensure(isPlainObject(data.fastContact), "contacts.fastContact must be an object")
  ensureString(data.fastContact.index, "contacts.fastContact.index")
  ensureString(data.fastContact.title, "contacts.fastContact.title")
  ensureObjectArray(data.fastContact.channels, "contacts.fastContact.channels")
  data.fastContact.channels.forEach((item: JsonObject, index: number) => {
    ensureString(item.type, `contacts.fastContact.channels[${index}].type`)
    ensureString(item.label, `contacts.fastContact.channels[${index}].label`)
    ensureString(item.value, `contacts.fastContact.channels[${index}].value`)
    ensureString(item.href, `contacts.fastContact.channels[${index}].href`)
    ensureString(item.icon, `contacts.fastContact.channels[${index}].icon`)
  })

  ensure(isPlainObject(data.workflow), "contacts.workflow must be an object")
  ensureString(data.workflow.index, "contacts.workflow.index")
  ensureString(data.workflow.title, "contacts.workflow.title")
  ensureObjectArray(data.workflow.steps, "contacts.workflow.steps")
  data.workflow.steps.forEach((step: JsonObject, index: number) => {
    ensureString(step.num, `contacts.workflow.steps[${index}].num`)
    ensureString(step.icon, `contacts.workflow.steps[${index}].icon`)
    ensureString(step.title, `contacts.workflow.steps[${index}].title`)
    ensureString(step.desc, `contacts.workflow.steps[${index}].desc`)
  })

  ensure(isPlainObject(data.formats), "contacts.formats must be an object")
  ensureString(data.formats.index, "contacts.formats.index")
  ensureString(data.formats.title, "contacts.formats.title")
  ensure(isPlainObject(data.formats.fast), "contacts.formats.fast must be an object")
  ensureString(data.formats.fast.title, "contacts.formats.fast.title")
  ensureString(data.formats.fast.desc, "contacts.formats.fast.desc")
  ensureString(data.formats.fast.href, "contacts.formats.fast.href")
  ensure(isPlainObject(data.formats.full), "contacts.formats.full must be an object")
  ensureString(data.formats.full.title, "contacts.formats.full.title")
  ensureString(data.formats.full.desc, "contacts.formats.full.desc")
  ensureString(data.formats.full.summary, "contacts.formats.full.summary")

  ensure(isPlainObject(data.faq), "contacts.faq must be an object")
  ensureString(data.faq.index, "contacts.faq.index")
  ensureString(data.faq.title, "contacts.faq.title")
  ensureObjectArray(data.faq.items, "contacts.faq.items")
  data.faq.items.forEach((item: JsonObject, index: number) => {
    ensureString(item.question, `contacts.faq.items[${index}].question`)
    ensureString(item.answer, `contacts.faq.items[${index}].answer`)
  })

  ensure(isPlainObject(data.cta), "contacts.cta must be an object")
  ensureString(data.cta.title, "contacts.cta.title")
  ensureString(data.cta.subtitle, "contacts.cta.subtitle")
  ensureString(data.cta.tgText, "contacts.cta.tgText")
  ensureString(data.cta.email, "contacts.cta.email")
  ensureString(data.cta.tel, "contacts.cta.tel")
  optionalString(data.cta.note, "contacts.cta.note")
}

function validateMeta(data: unknown) {
  ensure(isPlainObject(data), "meta must be an object")
  ensure(isPlainObject(data.categories), "meta.categories must be an object")

  for (const [slug, meta] of Object.entries(data.categories)) {
    ensureSlug(slug, `meta.categories.${slug}`)
    ensure(isPlainObject(meta), `meta.categories.${slug} must be an object`)
    ensureString(meta.created, `meta.categories.${slug}.created`)
    ensureString(meta.modified, `meta.categories.${slug}.modified`)
    ensureString(meta.label, `meta.categories.${slug}.label`)
    optionalString(meta.extends, `meta.categories.${slug}.extends`)
    if (meta.system !== undefined) {
      ensure(typeof meta.system === "boolean", `meta.categories.${slug}.system must be a boolean`)
    }
  }

  ensure(isPlainObject(data.categories.default), "meta.categories.default must exist")
}

function validateRules(data: unknown, categories: Set<string>) {
  ensure(isPlainObject(data), "rules must be an object")
  ensureString(data.defaultCategory, "rules.defaultCategory")
  ensure(categories.has(data.defaultCategory), "rules.defaultCategory must exist")
  ensureObjectArray(data.rules, "rules.rules")

  data.rules.forEach((rule: JsonObject, index: number) => {
    ensure(typeof rule.priority === "number", `rules.rules[${index}].priority must be a number`)
    ensure(rule.type === "utm" || rule.type === "referrer", `rules.rules[${index}].type is invalid`)
    optionalString(rule.param, `rules.rules[${index}].param`)
    ensureString(rule.match, `rules.rules[${index}].match`)
    ensureString(rule.category, `rules.rules[${index}].category`)
    ensure(categories.has(rule.category), `rules.rules[${index}].category must exist`)
  })
}

async function scanVariantSlugs() {
  const entries = await fs.readdir(DATA_DIR)
  return entries
    .map((entry) => entry.match(/^home\.([a-z0-9-]+)\.json$/)?.[1] ?? null)
    .filter((entry): entry is string => Boolean(entry))
    .sort()
}

async function readMetaAndSync() {
  const raw = await readJson(META_PATH)
  validateMeta(raw)

  const meta = clone(raw)
  const scannedSlugs = await scanVariantSlugs()
  const today = todayStamp()

  for (const slug of scannedSlugs) {
    if (!meta.categories[slug]) {
      meta.categories[slug] = {
        created: today,
        modified: today,
        label: slug,
        extends: "default",
      }
    }
  }

  return meta
}

async function readVariantContent(slug: string, cache = new Map<string, JsonObject>()) {
  if (slug === "default") {
    const home = await readJson(HOME_PATH)
    validateHomeContent(home)
    return home
  }

  if (cache.has(slug)) {
    return cache.get(slug)!
  }

  const variant = await readJson(homeVariantPath(slug))
  validateHomeContent(variant, { requireExtends: true, slug, partial: true })

  const parentSlug = variant.extends || "default"
  const base = await readVariantContent(parentSlug, cache)
  const merged = mergeContent(base, variant)
  cache.set(slug, merged)
  return merged
}

async function readState() {
  const home = await readJson(HOME_PATH)
  const contacts = await readJson(CONTACTS_PATH)
  const meta = await readMetaAndSync()
  const rules = await readJson(RULES_PATH)

  validateHomeContent(home)
  validateContactsContent(contacts)

  const categorySlugs = new Set<string>([
    "default",
    ...Object.keys(meta.categories),
    ...(await scanVariantSlugs()),
  ])
  validateRules(rules, categorySlugs)

  const variants: Record<string, JsonObject> = {}
  const cache = new Map<string, JsonObject>()
  for (const slug of [...categorySlugs].sort()) {
    if (slug === "default") continue
    if (!existsSync(homeVariantPath(slug))) continue
    variants[slug] = await readVariantContent(slug, cache)
  }

  const categories = [...categorySlugs]
    .sort((a, b) => {
      if (a === "default") return -1
      if (b === "default") return 1
      return a.localeCompare(b)
    })
    .map((slug) => {
      const categoryMeta = meta.categories[slug] || {
        created: todayStamp(),
        modified: todayStamp(),
        label: slug,
      }
      return {
        slug,
        label: categoryMeta.label,
        created: categoryMeta.created,
        modified: categoryMeta.modified,
        extends: categoryMeta.extends || "default",
        system: Boolean(categoryMeta.system),
      }
    })

  return {
    previewBaseUrl: PREVIEW_BASE_URL,
    home,
    contacts,
    rules,
    meta,
    categories,
    variants,
  }
}

async function readBody(req: http.IncomingMessage) {
  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }

  if (chunks.length === 0) return {}
  return JSON.parse(Buffer.concat(chunks).toString("utf8"))
}

function sendJson(res: http.ServerResponse, statusCode: number, payload: unknown) {
  const body = JSON.stringify(payload)
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  })
  res.end(body)
}

function sendFile(res: http.ServerResponse, filePath: string) {
  const ext = path.extname(filePath)
  const type =
    ext === ".html"
      ? "text/html; charset=utf-8"
      : ext === ".js"
        ? "application/javascript; charset=utf-8"
        : ext === ".css"
          ? "text/css; charset=utf-8"
          : "text/plain; charset=utf-8"

  return fs
    .readFile(filePath)
    .then((content) => {
      res.writeHead(200, {
        "Content-Type": type,
        "Cache-Control": "no-store",
      })
      res.end(content)
    })
    .catch(() => {
      res.writeHead(404)
      res.end("Not found")
    })
}

async function saveHome(payload: JsonObject) {
  validateHomeContent(payload.content)
  await writeJson(HOME_PATH, payload.content)
}

async function saveContacts(payload: JsonObject) {
  validateContactsContent(payload.content)
  await writeJson(CONTACTS_PATH, payload.content)
}

async function saveRules(payload: JsonObject) {
  const meta = await readMetaAndSync()
  const categories = new Set<string>([
    "default",
    ...Object.keys(meta.categories),
    ...(await scanVariantSlugs()),
  ])
  validateRules(payload.content, categories)
  await writeJson(RULES_PATH, payload.content)
}

async function createCategory(payload: JsonObject) {
  const slug = ensureSlug(payload.slug)
  ensure(slug !== "default", "default category already exists")

  const meta = await readMetaAndSync()
  ensure(!meta.categories[slug], `category ${slug} already exists`)

  const fromSlug = payload.fromSlug ? ensureSlug(payload.fromSlug, "fromSlug") : "default"
  const source =
    fromSlug === "default" ? await readJson(HOME_PATH) : await readVariantContent(fromSlug)
  validateHomeContent(source)

  const label =
    typeof payload.label === "string" && payload.label.trim() ? payload.label.trim() : slug
  const today = todayStamp()
  const nextContent = {
    ...clone(source),
    schemaVersion: 1,
    extends: "default",
  }

  meta.categories[slug] = {
    created: today,
    modified: today,
    label,
    extends: "default",
  }

  await writeJson(homeVariantPath(slug), nextContent)
  await writeJson(META_PATH, meta)
}

async function saveCategory(payload: JsonObject) {
  const slug = ensureSlug(payload.slug)
  ensure(slug !== "default", "default category is edited via home.json")
  ensure(isPlainObject(payload.content), "category content is required")

  const meta = await readMetaAndSync()
  ensure(meta.categories[slug], `category ${slug} does not exist`)

  const label =
    typeof payload.label === "string" && payload.label.trim()
      ? payload.label.trim()
      : meta.categories[slug].label
  const extendsSlug =
    typeof payload.extends === "string" && payload.extends.trim()
      ? payload.extends.trim()
      : "default"
  ensure(
    extendsSlug === "default" || Boolean(meta.categories[extendsSlug]),
    "category extends must exist",
  )
  ensure(extendsSlug !== slug, "category cannot extend itself")

  const nextContent = clone(payload.content)
  nextContent.schemaVersion = 1
  nextContent.extends = extendsSlug
  validateHomeContent(nextContent, { requireExtends: true, slug })

  meta.categories[slug] = {
    ...meta.categories[slug],
    label,
    extends: extendsSlug,
    modified: todayStamp(),
  }

  await writeJson(homeVariantPath(slug), nextContent)
  await writeJson(META_PATH, meta)
}

async function deleteCategory(payload: JsonObject) {
  const slug = ensureSlug(payload.slug)
  ensure(slug !== "default", "default category cannot be deleted")

  const meta = await readMetaAndSync()
  ensure(meta.categories[slug], `category ${slug} does not exist`)

  const rules = await readJson(RULES_PATH)
  const categories = new Set<string>([
    "default",
    ...Object.keys(meta.categories),
    ...(await scanVariantSlugs()),
  ])
  validateRules(rules, categories)

  ensure(rules.defaultCategory !== slug, "default category cannot point to the deleted category")
  ensure(
    !rules.rules.some((rule: JsonObject) => rule.category === slug),
    "category is still referenced by traffic rules",
  )

  delete meta.categories[slug]
  await fs.rm(homeVariantPath(slug))
  await writeJson(META_PATH, meta)
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`)

    if (req.method === "GET" && url.pathname === "/api/state") {
      return sendJson(res, 200, await readState())
    }

    if (req.method === "POST" && url.pathname === "/api/home/save") {
      await saveHome(await readBody(req))
      return sendJson(res, 200, { ok: true })
    }

    if (req.method === "POST" && url.pathname === "/api/contacts/save") {
      await saveContacts(await readBody(req))
      return sendJson(res, 200, { ok: true })
    }

    if (req.method === "POST" && url.pathname === "/api/rules/save") {
      await saveRules(await readBody(req))
      return sendJson(res, 200, { ok: true })
    }

    if (req.method === "POST" && url.pathname === "/api/categories/create") {
      await createCategory(await readBody(req))
      return sendJson(res, 200, { ok: true })
    }

    if (req.method === "POST" && url.pathname === "/api/categories/save") {
      await saveCategory(await readBody(req))
      return sendJson(res, 200, { ok: true })
    }

    if (req.method === "POST" && url.pathname === "/api/categories/delete") {
      await deleteCategory(await readBody(req))
      return sendJson(res, 200, { ok: true })
    }

    if (req.method === "GET" && url.pathname === "/") {
      return sendFile(res, path.join(CLIENT_DIR, "index.html"))
    }

    if (req.method === "GET") {
      const safePath = path.normalize(url.pathname.replace(/^\/+/, ""))
      const target = path.join(CLIENT_DIR, safePath)
      if (target.startsWith(CLIENT_DIR)) {
        return sendFile(res, target)
      }
    }

    res.writeHead(404)
    res.end("Not found")
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    sendJson(res, 400, { ok: false, error: message })
  }
})

server.listen(PORT, () => {
  console.log(`Multicontent admin: http://localhost:${PORT}`)
  console.log(`Preview base URL: ${PREVIEW_BASE_URL}`)
  console.log(`Editable data directory: ${DATA_DIR}`)
})
