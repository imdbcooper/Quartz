import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/cardMenu.scss"

// @ts-ignore
import script from "./scripts/cardMenu.inline"
import { classNames } from "../util/lang"
import { i18n } from "../i18n"
import { FileTrieNode } from "../util/fileTrie"
import { concatenateResources } from "../util/resources"

type OrderEntries = "sort" | "filter" | "map"

export interface CardMenuOptions {
  title?: string
  folderDefaultState: "collapsed" | "open"
  folderClickBehavior: "collapse" | "link"
  useSavedState: boolean
  sortFn: (a: FileTrieNode, b: FileTrieNode) => number
  filterFn: (node: FileTrieNode) => boolean
  mapFn: (node: FileTrieNode) => void
  order: OrderEntries[]
  showNavButtons: boolean
  navButtons: Array<{ label: string; href: string }>
  footerText?: string
}

const defaultOptions: CardMenuOptions = {
  folderDefaultState: "collapsed",
  folderClickBehavior: "link",
  useSavedState: true,
  mapFn: (node) => {
    return node
  },
  sortFn: (a, b) => {
    if ((!a.isFolder && !b.isFolder) || (a.isFolder && b.isFolder)) {
      return a.displayName.localeCompare(b.displayName, undefined, {
        numeric: true,
        sensitivity: "base",
      })
    }
    if (!a.isFolder && b.isFolder) {
      return 1
    } else {
      return -1
    }
  },
  filterFn: (node) => node.slugSegment !== "tags",
  order: ["filter", "map", "sort"],
  showNavButtons: true,
  navButtons: [
    { label: "Контакты", href: "/Кoнтакты" },
    { label: "About", href: "/about" },
    { label: "RSS", href: "/index.xml" },
    { label: "Архив", href: "/tags" },
  ],
  footerText: "This is my digital garden powered by Quartz.",
}

// SVG Icons from Lucide
const icons = {
  // Book icon for Blog
  blog: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/></svg>`,
  // Folder icon for Projects
  folder: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>`,
  // Box icon for Resources
  resources: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`,
  // Globe icon for Web
  globe: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>`,
  // File icon for generic items
  file: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>`,
  // Chevron down for accordion
  chevronDown: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`,
}

// Helper to get icon based on folder name
function getIconForFolder(name: string): string {
  const nameLower = name.toLowerCase()
  if (nameLower.includes("блог") || nameLower.includes("blog")) return icons.blog
  if (nameLower.includes("проект") || nameLower.includes("project")) return icons.folder
  if (nameLower.includes("ресурс") || nameLower.includes("resource")) return icons.resources
  return icons.folder
}

export type FolderState = {
  path: string
  collapsed: boolean
}

let numMenus = 0
export default ((userOpts?: Partial<CardMenuOptions>) => {
  const opts: CardMenuOptions = { ...defaultOptions, ...userOpts }

  const CardMenu: QuartzComponent = ({ cfg, fileData, displayClass }: QuartzComponentProps) => {
    const id = `card-menu-${numMenus++}`
    const title = opts.title ?? fileData.frontmatter?.title ?? i18n(cfg.locale).components.explorer.title

    return (
      <div
        class={classNames(displayClass, "card-menu")}
        data-behavior={opts.folderClickBehavior}
        data-collapsed={opts.folderDefaultState}
        data-savestate={opts.useSavedState}
        data-data-fns={JSON.stringify({
          order: opts.order,
          sortFn: opts.sortFn.toString(),
          filterFn: opts.filterFn.toString(),
          mapFn: opts.mapFn.toString(),
        })}
      >
        {/* Mobile menu toggle button */}
        <button
          type="button"
          class="card-menu-toggle mobile-menu hide-until-loaded"
          data-mobile={true}
          aria-controls={id}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            fill="none"
            stroke="currentColor"
            class="lucide-menu"
          >
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        </button>

        {/* Desktop toggle - hidden, menu always visible on desktop */}

        {/* Menu content container */}
        <div id={id} class="card-menu-content" aria-expanded={false} role="group">
          {/* Header with title and date */}
          <div class="card-menu-header">
            <h1 class="card-menu-title">{title}</h1>
            <div class="card-menu-meta">
              {fileData.dates && (
                <span class="card-menu-date">
                  {new Date(fileData.dates.modified || fileData.dates.created || Date.now()).toLocaleDateString(cfg.locale, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              )}
              <span class="card-menu-reading-time">· 1 min read</span>
            </div>
          </div>

          {/* Menu sections - populated by script */}
          <ul class="card-menu-sections"></ul>

          {/* Footer text */}
          {opts.footerText && (
            <p class="card-menu-footer">
              {opts.footerText.split('Quartz').map((part, i, arr) => 
                i < arr.length - 1 
                  ? <>{part}<a href="https://quartz.jzhao.xyz/">Quartz</a></>
                  : part
              )}
            </p>
          )}
        </div>

        {/* Templates for dynamic content */}
        <template id="template-card-file">
          <li class="card-menu-item">
            <a href="#" class="card-item-link"></a>
          </li>
        </template>

        <template id="template-card-section">
          <li class="card-section">
            <div class="card-section-header-container">
              <span class="card-section-icon"></span>
              <a href="#" class="card-section-title"></a>
              <div class="card-section-spacer" data-toggle="true"></div>
              <button type="button" class="card-section-toggle" aria-expanded="false">
                <span class="card-section-chevron" dangerouslySetInnerHTML={{ __html: icons.chevronDown }} />
              </button>
            </div>
            <div class="card-section-content">
              <ul class="card-section-items"></ul>
            </div>
          </li>
        </template>

        <template id="template-card-folder">
          <li class="card-folder">
            <div class="card-folder-header-container">
              <a href="#" class="card-folder-title"></a>
              <div class="card-folder-spacer" data-toggle="true"></div>
              <button type="button" class="card-folder-toggle" aria-expanded="false">
                <span class="card-folder-chevron" dangerouslySetInnerHTML={{ __html: icons.chevronDown }} />
              </button>
            </div>
            <div class="card-folder-content">
              <ul class="card-folder-items"></ul>
            </div>
          </li>
        </template>

        <template id="template-card-link">
          <li class="card-link-item">
            <a href="#" class="card-link">
              <span class="card-link-icon"></span>
              <span class="card-link-text"></span>
            </a>
          </li>
        </template>
      </div>
    )
  }

  CardMenu.css = style
  CardMenu.afterDOMLoaded = script
  return CardMenu
}) satisfies QuartzComponentConstructor

