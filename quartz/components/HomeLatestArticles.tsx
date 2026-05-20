import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { Date, getDate } from "./Date"
import { byDateAndAlphabetical } from "./PageList"
import { resolveRelative } from "../util/path"
import { classNames } from "../util/lang"
import { i18n } from "../i18n"
import style from "./styles/homeLatestArticles.scss"

export interface HomeLatestArticlesConfig {
  title: string
  limit: number
  categoryPaths: string[]
}

const SECTION_ICON_MAP = new Map([
  ["blog/hi tech news", "monitoring"],
  ["docs", "description"],
  ["проекты", "dashboard"],
  ["проекты/audio-scribe", "graphic_eq"],
  ["проекты/book-library", "menu_book"],
  ["проекты/obsidian", "menu_book"],
  ["проекты/promt gen", "auto_awesome"],
  ["проекты/rag-content-pipeline", "account_tree"],
  ["проекты/tgpt", "send"],
])

function isCategoryMatch(relativePath: string, categoryPath: string) {
  return relativePath.startsWith(`${categoryPath}/`)
}

function isIndexFile(relativePath: string) {
  return relativePath === "index.md" || relativePath.endsWith("/index.md")
}

function getMatchedCategoryPath(relativePath: string, categoryPaths: string[]) {
  return [...categoryPaths]
    .sort((a, b) => b.length - a.length)
    .find((categoryPath) => isCategoryMatch(relativePath, categoryPath))
}

function getCategoryPathLabel(categoryPath: string) {
  return categoryPath.split("/").at(-1) || categoryPath
}

function normalizeSectionKey(value: string) {
  return value.trim().toLowerCase()
}

function getSectionIcon(sectionPath: string | null, label: string | null) {
  if (sectionPath) {
    const directIcon = SECTION_ICON_MAP.get(normalizeSectionKey(sectionPath))
    if (directIcon) return directIcon
  }

  const normalizedLabel = normalizeSectionKey(label || "")
  if (normalizedLabel.includes("audio")) return "graphic_eq"
  if (normalizedLabel.includes("book")) return "menu_book"
  if (normalizedLabel.includes("obsidian")) return "menu_book"
  if (normalizedLabel.includes("prompt")) return "auto_awesome"
  if (normalizedLabel.includes("rag")) return "account_tree"
  if (normalizedLabel.includes("tgpt") || normalizedLabel.includes("telepost")) return "send"
  if (normalizedLabel.includes("docs")) return "description"
  if (normalizedLabel.includes("news")) return "monitoring"
  return "folder"
}

export default ((userOpts: HomeLatestArticlesConfig) => {
  const HomeLatestArticles: QuartzComponent = ({
    allFiles,
    fileData,
    cfg,
    displayClass,
  }: QuartzComponentProps) => {
    if (!Array.isArray(userOpts.categoryPaths) || userOpts.categoryPaths.length === 0) {
      return null
    }

    const pages = allFiles
      .filter((page) => {
        const relativePath = String(page.relativePath || "")
        if (!relativePath || isIndexFile(relativePath)) return false
        return userOpts.categoryPaths.some((categoryPath) =>
          isCategoryMatch(relativePath, categoryPath),
        )
      })
      .sort(byDateAndAlphabetical(cfg))
      .slice(0, userOpts.limit)

    if (pages.length === 0) {
      return null
    }

    const sectionTitleByPath = new Map<string, string>()
    allFiles.forEach((page) => {
      const relativePath = String(page.relativePath || "")
      if (!isIndexFile(relativePath) || relativePath === "index.md") return

      const sectionPath = relativePath.split("/").slice(0, -1).join("/")
      if (!sectionPath) return

      const title =
        typeof page.frontmatter?.title === "string" && page.frontmatter.title.trim()
          ? page.frontmatter.title.trim()
          : sectionPath.split("/").at(-1) || sectionPath
      sectionTitleByPath.set(sectionPath, title)
    })

    return (
      <section
        class={classNames(displayClass, "home-latest-articles")}
        aria-labelledby="home-latest-articles-title"
      >
        <h3 id="home-latest-articles-title">{userOpts.title}</h3>
        <ul class="home-latest-articles__list">
          {pages.map((page) => {
            const relativePath = String(page.relativePath || "")
            const matchedCategoryPath = getMatchedCategoryPath(relativePath, userOpts.categoryPaths)
            const categoryLabel = matchedCategoryPath
              ? sectionTitleByPath.get(matchedCategoryPath) ||
                getCategoryPathLabel(matchedCategoryPath)
              : null
            const categoryIcon = getSectionIcon(matchedCategoryPath || null, categoryLabel)
            const title = page.frontmatter?.title ?? i18n(cfg.locale).propertyDefaults.title
            const description =
              typeof page.frontmatter?.description === "string" ? page.frontmatter.description : ""

            return (
              <li class="home-latest-articles__item">
                <a
                  href={resolveRelative(fileData.slug!, page.slug!)}
                  class="internal home-latest-articles__link"
                >
                  <div class="home-latest-articles__meta">
                    {categoryLabel && (
                      <span class="home-latest-articles__section">
                        <span
                          class="material-symbols-outlined home-latest-articles__section-icon"
                          aria-hidden="true"
                        >
                          {categoryIcon}
                        </span>
                        <span class="home-latest-articles__section-label">{categoryLabel}</span>
                      </span>
                    )}
                    {page.dates && (
                      <span class="home-latest-articles__date">
                        <Date date={getDate(cfg, page)!} locale={cfg.locale} />
                      </span>
                    )}
                  </div>
                  <span class="home-latest-articles__title">{title}</span>
                  {description && (
                    <span class="home-latest-articles__description">{description}</span>
                  )}
                </a>
              </li>
            )
          })}
        </ul>
      </section>
    )
  }

  HomeLatestArticles.css = style
  return HomeLatestArticles
}) satisfies QuartzComponentConstructor<HomeLatestArticlesConfig>
