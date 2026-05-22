import { mkdirSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

export interface BookshelfCatalogConfig {
  backendBaseUrl: string
  catalogPath: string
}

export interface BookshelfCatalogBook {
  id: number
  title: string
  author: string
  description?: string | null
  file_extension?: string | null
  coverUrl: string
  coverSrc?: string
  number: number
}

export interface BookshelfCatalogCategory {
  id: number
  name: string
  description?: string | null
  emoji?: string | null
  books: BookshelfCatalogBook[]
}

export interface BookshelfCatalogPayload {
  schemaVersion: 1
  generatedAt: string
  source: string
  categories: BookshelfCatalogCategory[]
}

type RemoteCategory = {
  id: number
  name: string
  description?: string | null
  emoji?: string | null
}

type RemoteBook = {
  id: number
  title: string
  author: string
  description?: string | null
  file_extension?: string | null
  coverUrl: string
  number: number
}

const generatedStaticDir = fileURLToPath(new URL("../static/generated", import.meta.url))
const mirroredCoverDir = path.join(generatedStaticDir, "book-library-covers")
const defaultCatalogFile = path.join(generatedStaticDir, "bookshelf-catalog.json")
const mirroredCoverBasePath = "/static/generated/book-library-covers"

function normalizeBaseUrl(value: string) {
  return value.trim().replace(/\/+$/, "")
}

function resolveCatalogOutputFile(catalogPath: string) {
  const normalized = catalogPath.trim()
  if (!normalized.startsWith("/static/generated/")) {
    return defaultCatalogFile
  }

  const relativePath = normalized.replace(/^\/static\/generated\//, "")
  return path.join(generatedStaticDir, relativePath)
}

function resolveFileExtension(remotePath: string, contentType: string | null) {
  const pathname = new URL(remotePath, "https://placeholder.local").pathname
  const ext = path.extname(pathname)
  if (ext) return ext

  if (contentType?.includes("image/webp")) return ".webp"
  if (contentType?.includes("image/png")) return ".png"
  if (contentType?.includes("image/jpeg")) return ".jpg"
  if (contentType?.includes("image/avif")) return ".avif"
  return ".img"
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`)
  }

  return (await response.json()) as T
}

async function mirrorCover(baseUrl: string, book: RemoteBook) {
  const normalizedCoverUrl = typeof book.coverUrl === "string" ? book.coverUrl.trim() : ""
  if (!normalizedCoverUrl) return ""

  const absoluteUrl = new URL(normalizedCoverUrl, `${baseUrl}/`).toString()
  const response = await fetch(absoluteUrl, {
    headers: {
      Accept: "image/avif,image/webp,image/png,image/jpeg,image/*;q=0.8,*/*;q=0.5",
    },
  })

  if (!response.ok) {
    throw new Error(`Cover request failed: ${response.status} ${response.statusText}`)
  }

  const ext = resolveFileExtension(normalizedCoverUrl, response.headers.get("content-type"))
  const fileName = `${book.id}${ext}`
  const outputFile = path.join(mirroredCoverDir, fileName)
  const bytes = new Uint8Array(await response.arrayBuffer())

  mkdirSync(mirroredCoverDir, { recursive: true })
  writeFileSync(outputFile, bytes)

  return `${mirroredCoverBasePath}/${fileName}`
}

export async function generateBookshelfStaticAssets(config: BookshelfCatalogConfig) {
  const baseUrl = normalizeBaseUrl(config.backendBaseUrl)
  if (!baseUrl) return

  try {
    const categories = await fetchJson<RemoteCategory[]>(`${baseUrl}/api/categories`)
    const catalogCategories: BookshelfCatalogCategory[] = []

    for (const category of categories) {
      const books = await fetchJson<RemoteBook[]>(`${baseUrl}/api/categories/${category.id}/books`)
      const catalogBooks: BookshelfCatalogBook[] = []

      for (const book of books) {
        let coverSrc = ""

        try {
          coverSrc = await mirrorCover(baseUrl, book)
        } catch (error) {
          console.warn(
            `[library] failed to mirror cover for book ${book.id}:`,
            error instanceof Error ? error.message : error,
          )
        }

        catalogBooks.push({
          ...book,
          coverSrc,
        })
      }

      catalogCategories.push({
        ...category,
        books: catalogBooks,
      })
    }

    const payload: BookshelfCatalogPayload = {
      schemaVersion: 1,
      generatedAt: new Date().toISOString(),
      source: baseUrl,
      categories: catalogCategories,
    }

    const catalogFile = resolveCatalogOutputFile(config.catalogPath)
    mkdirSync(path.dirname(catalogFile), { recursive: true })
    writeFileSync(catalogFile, `${JSON.stringify(payload, null, 2)}\n`)
  } catch (error) {
    console.warn(
      "[library] failed to generate static catalog:",
      error instanceof Error ? error.message : error,
    )
  }
}
