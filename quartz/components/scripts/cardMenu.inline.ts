import { FileTrieNode } from "../../util/fileTrie"
import { FullSlug, resolveRelative, simplifySlug } from "../../util/path"
import { ContentDetails } from "../../plugins/emitters/contentIndex"

type MaybeHTMLElement = HTMLElement | undefined

interface ParsedOptions {
  folderDefaultState: "collapsed" | "open"
  folderClickBehavior: "collapse" | "link"
  useSavedState: boolean
  sortFn: (a: FileTrieNode, b: FileTrieNode) => number
  filterFn: (node: FileTrieNode) => boolean
  mapFn: (node: FileTrieNode) => void
  order: ("sort" | "filter" | "map")[]
}

type FolderState = {
  path: string
  collapsed: boolean
}

// Lucide SVG icons
const icons = {
  blog: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/></svg>`,
  folder: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>`,
  resources: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`,
  file: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>`,
  chevronDown: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`,
}

function getIconForFolder(name: string): string {
  const nameLower = name.toLowerCase()
  if (nameLower.includes("блог") || nameLower.includes("blog")) return icons.blog
  if (nameLower.includes("проект") || nameLower.includes("project")) return icons.folder
  if (nameLower.includes("ресурс") || nameLower.includes("resource")) return icons.resources
  return icons.folder
}

let currentMenuState: Array<FolderState> = []

function toggleMenu(this: HTMLElement) {
  const nearestMenu = this.closest(".card-menu") as HTMLElement
  if (!nearestMenu) return
  
  const menuCollapsed = nearestMenu.classList.toggle("collapsed")
  nearestMenu.setAttribute(
    "aria-expanded",
    nearestMenu.getAttribute("aria-expanded") === "true" ? "false" : "true",
  )

  if (!menuCollapsed) {
    document.documentElement.classList.add("mobile-no-scroll")
    document.body.classList.add("mobile-no-scroll")
  } else {
    document.documentElement.classList.remove("mobile-no-scroll")
    document.body.classList.remove("mobile-no-scroll")
  }
}

function toggleSection(evt: MouseEvent) {
  const target = evt.target as HTMLElement
  if (!target) return
  
  // Find the header container that was clicked
  let container = target.closest(".card-folder-header-container, .card-section-header-container") as MaybeHTMLElement
  
  // If target is the container itself, use it directly
  if (!container && (target.classList.contains("card-folder-header-container") || target.classList.contains("card-section-header-container"))) {
    container = target as HTMLElement
  }
  
  if (!container) return
  
  // Check if we clicked on the link itself (not its children)
  const titleLink = container.querySelector(".card-folder-title, .card-section-title") as HTMLAnchorElement
  if (titleLink && (target === titleLink || target.closest("a.card-folder-title, a.card-section-title") === titleLink)) {
    // Only prevent toggle if we clicked directly on the link text, not on the container
    if (target === titleLink) {
      return // Allow navigation
    }
  }
  
  // For all other clicks on the container (spacer, button, empty space, SVG), toggle
  evt.preventDefault()
  evt.stopPropagation()
  
  // Get the toggle button from the container
  const toggleButton = container.querySelector(".card-folder-toggle, .card-section-toggle") as MaybeHTMLElement
  if (!toggleButton) {
    return
  }
  
  // Find the parent li element
  const li = container.parentElement as MaybeHTMLElement
  if (!li) return
  
  // Find the content element
  const content = li.querySelector(".card-folder-content, .card-section-content") as MaybeHTMLElement
  if (!content) return

  // Toggle the expanded state
  const isExpanded = toggleButton.getAttribute("aria-expanded") === "true"
  const newExpandedState = !isExpanded
  
  // Update aria-expanded attribute
  toggleButton.setAttribute("aria-expanded", newExpandedState ? "true" : "false")
  
  // Update content visibility
  if (newExpandedState) {
    content.classList.add("open")
  } else {
    content.classList.remove("open")
  }

  // Save state to localStorage
  if (titleLink) {
    const folderPath = titleLink.getAttribute("data-for") || titleLink.href
    if (folderPath) {
      const path = typeof folderPath === "string" && folderPath.startsWith("/") 
        ? folderPath.replace(/\/$/, "") as FullSlug
        : folderPath as FullSlug
      const existingState = currentMenuState.find((item) => item.path === path)
      if (existingState) {
        existingState.collapsed = !newExpandedState
      } else {
        currentMenuState.push({ path: path, collapsed: !newExpandedState })
      }
      localStorage.setItem("cardMenuState", JSON.stringify(currentMenuState))
    }
  }
}

function createFileLink(currentSlug: FullSlug, node: FileTrieNode): HTMLLIElement {
  const li = document.createElement("li")
  li.className = "card-link-item"
  
  const a = document.createElement("a")
  a.href = resolveRelative(currentSlug, node.slug)
  a.dataset.for = node.slug
  a.className = "card-link"
  
  const iconSpan = document.createElement("span")
  iconSpan.className = "card-link-icon"
  iconSpan.innerHTML = icons.file
  
  const textSpan = document.createElement("span")
  textSpan.className = "card-link-text"
  textSpan.textContent = node.displayName
  
  a.appendChild(iconSpan)
  a.appendChild(textSpan)
  li.appendChild(a)

  if (currentSlug === node.slug) {
    a.classList.add("active")
  }

  return li
}

function createNestedFolder(
  currentSlug: FullSlug,
  node: FileTrieNode,
  opts: ParsedOptions,
): HTMLLIElement {
  const template = document.getElementById("template-card-folder") as HTMLTemplateElement
  const clone = template.content.cloneNode(true) as DocumentFragment
  const li = clone.querySelector("li") as HTMLLIElement
  const headerContainer = li.querySelector(".card-folder-header-container") as HTMLElement
  const titleLink = li.querySelector(".card-folder-title") as HTMLAnchorElement
  const spacer = li.querySelector(".card-folder-spacer") as HTMLElement
  const toggleButton = li.querySelector(".card-folder-toggle") as HTMLButtonElement
  const content = li.querySelector(".card-folder-content") as HTMLElement
  const ul = content.querySelector(".card-folder-items") as HTMLUListElement
  
  const folderPath = node.slug
  
  // Set up title link
  if (opts.folderClickBehavior === "link") {
    titleLink.href = resolveRelative(currentSlug, folderPath)
    titleLink.dataset.for = folderPath
    titleLink.textContent = node.displayName
    // Stop propagation so click on link doesn't bubble to container
    const linkClickHandler = (e: MouseEvent) => {
      e.stopPropagation()
    }
    titleLink.addEventListener("click", linkClickHandler)
    window.addCleanup(() => titleLink.removeEventListener("click", linkClickHandler))
  } else {
    // Fallback to span if behavior is collapse
    const span = document.createElement("span")
    span.className = "card-folder-title"
    span.textContent = node.displayName
    titleLink.replaceWith(span)
  }

  // Check saved state or if current path is within this folder
  const savedState = currentMenuState.find((item) => item.path === folderPath)
  const simpleFolderPath = simplifySlug(folderPath)
  const folderIsPrefixOfCurrentSlug = simpleFolderPath === currentSlug.slice(0, simpleFolderPath.length)
  
  // Only open if saved state says so, OR if current path is within this folder
  const isOpen = savedState 
    ? !savedState.collapsed 
    : folderIsPrefixOfCurrentSlug
  
  toggleButton.setAttribute("aria-expanded", isOpen ? "true" : "false")
  if (isOpen) {
    content.classList.add("open")
  }

  // Add children
  for (const child of node.children) {
    if (child.isFolder) {
      ul.appendChild(createNestedFolder(currentSlug, child, opts))
    } else {
      ul.appendChild(createFileLink(currentSlug, child))
    }
  }
  
  return li
}

function createSection(
  currentSlug: FullSlug,
  node: FileTrieNode,
  opts: ParsedOptions,
): HTMLLIElement {
  const template = document.getElementById("template-card-section") as HTMLTemplateElement
  const clone = template.content.cloneNode(true) as DocumentFragment
  const li = clone.querySelector("li") as HTMLLIElement
  const headerContainer = li.querySelector(".card-section-header-container") as HTMLElement
  const iconSpan = li.querySelector(".card-section-icon") as HTMLElement
  const titleLink = li.querySelector(".card-section-title") as HTMLAnchorElement
  const spacer = li.querySelector(".card-section-spacer") as HTMLElement
  const toggleButton = li.querySelector(".card-section-toggle") as HTMLButtonElement
  const content = li.querySelector(".card-section-content") as HTMLElement
  const ul = content.querySelector(".card-section-items") as HTMLUListElement
  
  const folderPath = node.slug
  
  // Set up icon
  iconSpan.innerHTML = getIconForFolder(node.displayName)
  
  // Set up title link
  if (opts.folderClickBehavior === "link") {
    titleLink.href = resolveRelative(currentSlug, folderPath)
    titleLink.dataset.for = folderPath
    titleLink.textContent = node.displayName
    // Stop propagation so click on link doesn't bubble to container
    const linkClickHandler = (e: MouseEvent) => {
      e.stopPropagation()
    }
    titleLink.addEventListener("click", linkClickHandler)
    window.addCleanup(() => titleLink.removeEventListener("click", linkClickHandler))
  } else {
    // Fallback to span if behavior is collapse
    const span = document.createElement("span")
    span.className = "card-section-title"
    span.textContent = node.displayName
    titleLink.replaceWith(span)
  }

  // Check saved state or if current path is within this folder
  const savedState = currentMenuState.find((item) => item.path === folderPath)
  const simpleFolderPath = simplifySlug(folderPath)
  const folderIsPrefixOfCurrentSlug = simpleFolderPath === currentSlug.slice(0, simpleFolderPath.length)
  
  // Only open if saved state says so, OR if current path is within this folder
  const isOpen = savedState 
    ? !savedState.collapsed 
    : folderIsPrefixOfCurrentSlug
  
  toggleButton.setAttribute("aria-expanded", isOpen ? "true" : "false")
  if (isOpen) {
    content.classList.add("open")
  }

  // Add children
  for (const child of node.children) {
    if (child.isFolder) {
      ul.appendChild(createNestedFolder(currentSlug, child, opts))
    } else {
      ul.appendChild(createFileLink(currentSlug, child))
    }
  }

  return li
}

function createTopLevelFile(currentSlug: FullSlug, node: FileTrieNode): HTMLLIElement {
  const li = document.createElement("li")
  li.className = "card-menu-item"
  
  const a = document.createElement("a")
  a.href = resolveRelative(currentSlug, node.slug)
  a.dataset.for = node.slug
  a.className = "card-item-link"
  a.textContent = node.displayName

  if (currentSlug === node.slug) {
    a.classList.add("active")
  }

  li.appendChild(a)
  return li
}

async function setupCardMenu(currentSlug: FullSlug) {
  const allMenus = document.querySelectorAll("div.card-menu") as NodeListOf<HTMLElement>

  for (const menu of allMenus) {
    const dataFns = JSON.parse(menu.dataset.dataFns || "{}")
    const opts: ParsedOptions = {
      folderDefaultState: (menu.dataset.collapsed || "collapsed") as "collapsed" | "open",
      folderClickBehavior: (menu.dataset.behavior || "link") as "collapse" | "link",
      useSavedState: menu.dataset.savestate === "true",
      order: dataFns.order || ["filter", "map", "sort"],
      sortFn: new Function("return " + (dataFns.sortFn || "undefined"))(),
      filterFn: new Function("return " + (dataFns.filterFn || "undefined"))(),
      mapFn: new Function("return " + (dataFns.mapFn || "undefined"))(),
    }

    // Get folder state from local storage
    const storageState = localStorage.getItem("cardMenuState")
    const serializedState = storageState && opts.useSavedState ? JSON.parse(storageState) : []
    currentMenuState = serializedState

    const data = await fetchData
    const entries = [...Object.entries(data)] as [FullSlug, ContentDetails][]
    const trie = FileTrieNode.fromEntries(entries)

    // Apply functions in order
    for (const fn of opts.order) {
      switch (fn) {
        case "filter":
          if (opts.filterFn) trie.filter(opts.filterFn)
          break
        case "map":
          if (opts.mapFn) trie.map(opts.mapFn)
          break
        case "sort":
          if (opts.sortFn) trie.sort(opts.sortFn)
          break
      }
    }

    const sectionsContainer = menu.querySelector(".card-menu-sections")
    if (!sectionsContainer) continue

    // Clear existing content
    sectionsContainer.innerHTML = ""

    // Create and insert content
    const fragment = document.createDocumentFragment()
    for (const child of trie.children) {
      if (child.isFolder) {
        fragment.appendChild(createSection(currentSlug, child, opts))
      } else {
        fragment.appendChild(createTopLevelFile(currentSlug, child))
      }
    }
    sectionsContainer.appendChild(fragment)

    // Set up toggle button handlers (for mobile menu toggle)
    const toggleButtons = menu.getElementsByClassName("card-menu-toggle") as HTMLCollectionOf<HTMLElement>
    for (const button of toggleButtons) {
      button.addEventListener("click", toggleMenu)
      window.addCleanup(() => button.removeEventListener("click", toggleMenu))
    }
    
    // Set up event delegation for folder/section toggles
    // Use event delegation on the sections container to handle all clicks
    const handleMenuClick = (evt: MouseEvent) => {
      toggleSection(evt)
    }
    sectionsContainer.addEventListener("click", handleMenuClick)
    window.addCleanup(() => sectionsContainer.removeEventListener("click", handleMenuClick))
  }
}

document.addEventListener("prenav", async () => {
  // Save scroll position if needed
  const menu = document.querySelector(".card-menu-content")
  if (!menu) return
  sessionStorage.setItem("cardMenuScrollTop", menu.scrollTop.toString())
})

document.addEventListener("nav", async (e: CustomEventMap["nav"]) => {
  const currentSlug = e.detail.url
  await setupCardMenu(currentSlug)

  // Handle mobile state on navigation
  for (const menu of document.getElementsByClassName("card-menu")) {
    const mobileToggle = menu.querySelector(".mobile-menu")
    if (!mobileToggle) continue

    // Check if we're on mobile (hamburger visible)
    const isMobile = mobileToggle.checkVisibility()
    
    if (isMobile) {
      // Mobile: start collapsed
      menu.classList.add("collapsed")
      menu.setAttribute("aria-expanded", "false")
      document.documentElement.classList.remove("mobile-no-scroll")
      document.body.classList.remove("mobile-no-scroll")
    } else {
      // Desktop: always expanded
      menu.classList.remove("collapsed")
      menu.setAttribute("aria-expanded", "true")
    }

    mobileToggle.classList.remove("hide-until-loaded")
  }

  // Restore scroll position
  const scrollTop = sessionStorage.getItem("cardMenuScrollTop")
  const menuContent = document.querySelector(".card-menu-content")
  if (scrollTop && menuContent) {
    menuContent.scrollTop = parseInt(scrollTop)
  }
})

window.addEventListener("resize", function () {
  const menu = document.querySelector(".card-menu")
  if (!menu) return
  
  const mobileToggle = menu.querySelector(".mobile-menu")
  if (!mobileToggle) return
  
  const isMobile = mobileToggle.checkVisibility()
  
  if (isMobile) {
    // Switched to mobile - collapse menu if not already
    if (!menu.classList.contains("collapsed")) {
      document.documentElement.classList.add("mobile-no-scroll")
      document.body.classList.add("mobile-no-scroll")
    }
  } else {
    // Switched to desktop - always show menu, remove scroll locks
    menu.classList.remove("collapsed")
    menu.setAttribute("aria-expanded", "true")
    document.documentElement.classList.remove("mobile-no-scroll")
    document.body.classList.remove("mobile-no-scroll")
  }
})

