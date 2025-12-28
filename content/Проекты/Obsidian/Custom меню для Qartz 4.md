---
publish: true
title: Создание карточного меню (Card Menu) в Quartz 4
description: Руководство описывает создание кастомного карточного меню для Quartz 4, которое заменяет стандартный компонент Explorer. Меню автоматически строится из файловой структуры проекта, поддерживает сворачивание/разворачивание секций и адаптивно для мобильных устройств.
created: 2025-12-28 21:57
updated: 2025-12-28 21:57
tags:
  - blog
cssclasses: ""
draft: false
preview_image: /images/Isometric_3d_illustration_202512282149.jpeg
---
# Создание карточного меню (Card Menu) в Quartz 4

## Обзор

Это руководство описывает создание кастомного карточного меню для Quartz 4, которое заменяет стандартный компонент Explorer. Меню автоматически строится из файловой структуры проекта, поддерживает сворачивание/разворачивание секций и адаптивно для мобильных устройств.

## Структура компонента

Компонент состоит из трех основных файлов:

1. **CardMenu.tsx** - React компонент, определяющий структуру меню
2. **cardMenu.scss** - Стили для меню
3. **cardMenu.inline.ts** - JavaScript логика для интерактивности

## Шаг 1: Создание структуры файлов

Создайте следующие файлы в структуре Quartz:

```
quartz/
  components/
    CardMenu.tsx
    styles/
      cardMenu.scss
    scripts/
      cardMenu.inline.ts
```

## Шаг 2: Создание компонента CardMenu.tsx

### 2.1. Базовый импорт и типы

```typescript
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/cardMenu.scss"
import script from "./scripts/cardMenu.inline"
import { classNames } from "../util/lang"
import { i18n } from "../i18n"
import { FileTrieNode } from "../util/fileTrie"

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
  footerText?: string
}
```

### 2.2. SVG иконки из Lucide

**Важно**: Используйте inline SVG иконки из библиотеки Lucide. Обязательные атрибуты для сохранения стиля:

- `width="20" height="20"`
- `viewBox="0 0 24 24"`
- `fill="none"`
- `stroke="currentColor"`
- `stroke-width="2"`
- `stroke-linecap="round" stroke-linejoin="round"`

```typescript
const icons = {
  blog: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/></svg>`,
  folder: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>`,
  resources: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`,
  file: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>`,
  chevronDown: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`,
}
```

### 2.3. Структура JSX компонента

Ключевые элементы структуры:

```tsx
<div class="card-menu">
  {/* Мобильная кнопка-гамбургер */}
  <button class="card-menu-toggle mobile-menu">
    {/* SVG иконка меню */}
  </button>

  {/* Контейнер меню */}
  <div id={id} class="card-menu-content">
    {/* Заголовок */}
    <div class="card-menu-header">
      <h1 class="card-menu-title">{title}</h1>
      <div class="card-menu-meta">
        {/* Дата и время чтения */}
      </div>
    </div>

    {/* Контейнер для секций (заполняется скриптом) */}
    <ul class="card-menu-sections"></ul>

    {/* Футер */}
    {opts.footerText && <p class="card-menu-footer">{opts.footerText}</p>}
  </div>

  {/* HTML шаблоны для динамического контента */}
  <template id="template-card-file">...</template>
  <template id="template-card-section">...</template>
  <template id="template-card-folder">...</template>
</div>
```

### 2.4. Важные детали шаблонов

**Шаблон секции (template-card-section)**:

```tsx
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
```

**Критические моменты**:

1. **Spacer элемент**: `<div class="card-section-spacer">` - необходим для обработки кликов на пустое место между текстом и кнопкой. Это позволяет разделить клик по ссылке (навигация) и клик на пустое место (сворачивание/разворачивание).

2. **Структура header-container**: Должна содержать в порядке:
   - Иконку
   - Ссылку с текстом
   - Spacer (flex-grow: 1)
   - Кнопку toggle

## Шаг 3: Создание стилей cardMenu.scss

### 3.1. Базовые стили

```scss
.card-menu {
  width: 100%;
  position: relative;

  &.collapsed {
    .card-menu-content {
      display: none;
    }
  }
}
```

### 3.2. Мобильные стили

**Важно**: На мобильных устройствах меню должно быть скрыто по умолчанию и открываться по клику на гамбургер.

```scss
.mobile-menu {
  display: none;
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1000;
  background: var(--highlight);
  border: 1px solid var(--lightgray);
  border-radius: 8px;
  padding: 0.5rem;
  cursor: pointer;

  @media (max-width: 768px) {
    display: block;
  }
}

.card-menu-content {
  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background: var(--light);
    z-index: 999;
    overflow-y: auto;
    padding: 1rem;
  }
}
```

### 3.3. Десктопные стили

На десктопе меню всегда видимо, гамбургер скрыт:

```scss
@media (min-width: 769px) {
  .mobile-menu {
    display: none !important;
  }

  .card-menu-header {
    display: none; // Скрываем на десктопе (заголовок и метаданные)
  }

  .card-menu-content {
    display: block !important;
    max-height: calc(100vh - 2rem);
    overflow-y: auto;
  }
}
```

### 3.4. Стили для контейнеров заголовков

**Критически важно**: Использовать flexbox для правильного позиционирования элементов:

```scss
.card-folder-header-container,
.card-section-header-container {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--highlight);
  border: 1px solid var(--lightgray);
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    background-color: var(--lightgray);
  }
}

.card-folder-title,
.card-section-title {
  flex-grow: 0; // Ссылка занимает только необходимое место
  color: var(--dark);
  text-decoration: none;
  cursor: pointer;

  &:hover {
    color: var(--secondary);
  }
}

.card-folder-spacer,
.card-section-spacer {
  flex-grow: 1; // Заполняет оставшееся пространство
  height: 100%;
  cursor: pointer;
}
```

### 3.5. Стили для контента секций

Используйте CSS transitions для плавного сворачивания/разворачивания:

```scss
.card-folder-content,
.card-section-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-out;

  &.open {
    max-height: 1000px; // Достаточно большое значение для секций
    transition: max-height 0.5s ease-in;
  }
}
```

## Шаг 4: Создание скрипта cardMenu.inline.ts

### 4.1. Импорты и типы

```typescript
import { FileTrieNode } from "../../util/fileTrie"
import { FullSlug, resolveRelative, simplifySlug } from "../../util/path"
import { ContentDetails } from "../../plugins/emitters/contentIndex"

type MaybeHTMLElement = HTMLElement | undefined
```

### 4.2. Функция переключения секций

**Ключевой момент**: Используйте делегирование событий и проверяйте целевой элемент:

```typescript
function toggleSection(evt: MouseEvent) {
  const target = evt.target as HTMLElement
  if (!target) return

  // Находим контейнер заголовка
  const container = target.closest(".card-folder-header-container, .card-section-header-container") as MaybeHTMLElement
  if (!container) return

  // Если кликнули на ссылку, позволяем навигацию
  const titleLink = container.querySelector(".card-folder-title, .card-section-title") as HTMLAnchorElement
  if (titleLink && target === titleLink) {
    return // Разрешаем навигацию
  }

  // Для всех остальных кликов - переключаем состояние
  evt.preventDefault()
  evt.stopPropagation()

  const toggleButton = container.querySelector(".card-folder-toggle, .card-section-toggle") as MaybeHTMLElement
  if (!toggleButton) return

  const li = container.parentElement as MaybeHTMLElement
  if (!li) return

  const content = li.querySelector(".card-folder-content, .card-section-content") as MaybeHTMLElement
  if (!content) return

  // Переключаем состояние
  const isExpanded = toggleButton.getAttribute("aria-expanded") === "true"
  const newExpandedState = !isExpanded

  toggleButton.setAttribute("aria-expanded", newExpandedState ? "true" : "false")
  if (newExpandedState) {
    content.classList.add("open")
  } else {
    content.classList.remove("open")
  }

  // Сохраняем состояние в localStorage
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
```

### 4.3. Логика инициализации состояния

**Важно**: Меню должно открываться только для папок, содержащих текущую страницу:

```typescript
// Проверяем сохраненное состояние или если текущий путь находится в этой папке
const savedState = currentMenuState.find((item) => item.path === folderPath)
const simpleFolderPath = simplifySlug(folderPath)
const folderIsPrefixOfCurrentSlug = simpleFolderPath === currentSlug.slice(0, simpleFolderPath.length)

// Открываем только если сохраненное состояние говорит об этом, ИЛИ если текущий путь в этой папке
const isOpen = savedState
  ? !savedState.collapsed
  : folderIsPrefixOfCurrentSlug // НЕ используем folderDefaultState === "open"!
```

### 4.4. Делегирование событий

Используйте делегирование событий на контейнере вместо привязки обработчиков к каждому элементу:

```typescript
// В setupCardMenu после создания контента
const handleMenuClick = (evt: MouseEvent) => {
  toggleSection(evt)
}
sectionsContainer.addEventListener("click", handleMenuClick)
window.addCleanup(() => sectionsContainer.removeEventListener("click", handleMenuClick))
```

## Шаг 5: Интеграция в layout

### 5.1. Регистрация компонента

В `quartz/components/index.ts`:

```typescript
export * from "./CardMenu"
```

### 5.2. Использование в layout

В `quartz.layout.ts` замените `Component.Explorer()` на `Component.CardMenu()`:

```typescript
const defaultContentPageLayout = {
  beforeBody: [
    Component.PageTitle(),
    Component.ContentMeta(),
    Component.ArticleTitle(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.CardMenu(), // Заменяем Explorer
    Component.DesktopOnly(Component.TableOfContents()),
  ],
  right: [
    Component.Graph(),
    Component.BackLinks(),
  ],
}
```

### 5.3. Откуда берется заголовок "Главное меню"

Заголовок "Главное меню" отображается на главной странице через компонент `ArticleTitle()`, который находится в секции `beforeBody` layout.

**Источник заголовка**: Заголовок берется из frontmatter файла `content/index.md`:

```markdown
---
title: Главное меню
description: My personal notes and thoughts
publish: true
---

<!-- Остальное содержимое страницы -->
```

Компонент `ArticleTitle` извлекает значение `title` из `fileData.frontmatter?.title` и отображает его как `<h1>` заголовок страницы.

**Важно**: 
- Если вы хотите изменить заголовок на главной странице, отредактируйте поле `title` в frontmatter файла `content/index.md`
- Если вы хотите убрать отображение тегов на странице, убедитесь, что компонент `TagList()` не используется в layout (он должен быть удален из `beforeBody`)
- **Навигационные кнопки (Контакты, About, RSS, Архив) были удалены из меню** - теперь меню начинается сразу с заголовка, метаданных и секций

## Шаг 6: Настройка опций

Вы можете настроить поведение меню через опции:

```typescript
const defaultOptions: CardMenuOptions = {
  folderDefaultState: "collapsed", // По умолчанию папки свернуты
  folderClickBehavior: "link", // Клик по названию папки ведет на страницу
  useSavedState: true, // Сохранять состояние папок в localStorage
  sortFn: (a, b) => {
    // Кастомная сортировка
    if ((!a.isFolder && !b.isFolder) || (a.isFolder && b.isFolder)) {
      return a.displayName.localeCompare(b.displayName)
    }
    return a.isFolder ? -1 : 1
  },
  filterFn: (node) => node.slugSegment !== "tags", // Исключаем теги
  order: ["filter", "map", "sort"],
}
```

**Примечание**: Навигационные кнопки (showNavButtons, navButtons) были удалены из компонента, так как они не используются в финальной версии меню. Меню теперь начинается сразу с заголовка и метаданных, за которыми следуют секции меню.

## Решение типичных проблем

### Проблема 1: Меню не сворачивается/разворачивается

**Решение**:
- Убедитесь, что используется делегирование событий
- Проверьте, что spacer элемент присутствует в шаблоне
- Убедитесь, что функция `toggleSection` правильно определяет целевой элемент

### Проблема 2: Все папки открыты при загрузке

**Решение**:
- Убедитесь, что в логике инициализации НЕ используется `opts.folderDefaultState === "open"`
- Используйте только проверку `folderIsPrefixOfCurrentSlug`

### Проблема 3: Клик по тексту не работает как ссылка

**Решение**:
- Убедитесь, что в функции `toggleSection` есть проверка `target === titleLink` и возврат без preventDefault
- Проверьте, что ссылка имеет правильные атрибуты `href` и `data-for`

### Проблема 4: Мобильное меню не открывается

**Решение**:
- Проверьте, что мобильная кнопка имеет `position: fixed` и правильный z-index
- Убедитесь, что обработчик `toggleMenu` правильно привязан
- Проверьте, что класс `collapsed` правильно добавляется/удаляется

### Проблема 5: Меню не скроллится на десктопе

**Решение**:
- Добавьте `overflow-y: auto` и `max-height` к `.card-menu-content` для десктопа
- Убедитесь, что `max-height` достаточно большой, но не превышает высоту экрана

## Лучшие практики

1. **Используйте делегирование событий** - это более производительно и надежно
2. **Сохраняйте состояние в localStorage** - улучшает UX
3. **Используйте CSS transitions** - делают анимации плавными
4. **Правильно обрабатывайте клики** - разделяйте навигацию и переключение состояния
5. **Тестируйте на мобильных устройствах** - мобильная версия имеет свои особенности
6. **Используйте семантические HTML элементы** - button для кнопок, a для ссылок
7. **Добавляйте aria-атрибуты** - улучшают доступность
8. **Убирайте ненужные компоненты** - например, `TagList()` если теги не нужны на странице

## Удаление компонента TagList (теги)

Если вы не хотите отображать теги на страницах, убедитесь, что компонент `TagList()` удален из layout:

```typescript
// В quartz.layout.ts
const defaultContentPageLayout = {
  beforeBody: [
    Component.ArticleTitle(),
    Component.ContentMeta(),
    // Component.TagList(), // УДАЛЕНО - теги не отображаются
  ],
  // ...
}
```

Это предотвратит отображение плиток с тегами как на десктопе, так и на мобильных устройствах.

## Откуда берется заголовок "Главное меню"

Заголовок "Главное меню", который отображается на главной странице, берется из frontmatter файла `content/index.md`:

```markdown
---
title: Главное меню
description: My personal notes and thoughts
publish: true
---

<!-- Остальное содержимое страницы -->
```

Компонент `ArticleTitle()` (который находится в секции `beforeBody` layout) извлекает значение `title` из `fileData.frontmatter?.title` и отображает его как `<h1>` заголовок страницы.

**Как изменить заголовок**: Отредактируйте поле `title` в frontmatter файла `content/index.md`. Например, если вы хотите изменить заголовок на "Добро пожаловать", просто измените:

```markdown
---
title: Добро пожаловать
---
```

## Заключение

Создание кастомного меню в Quartz требует понимания структуры компонентов, правильной обработки событий и адаптивного дизайна. Следуя этому руководству, вы сможете создать функциональное и красивое меню, которое автоматически строится из структуры файлов вашего проекта.

**Ключевые моменты для запоминания**:
- Заголовок страницы берется из frontmatter (`title: Главное меню` в `content/index.md`)
- Меню автоматически строится из файловой структуры проекта
- Используйте делегирование событий для обработки кликов
- Меню открывается только для папок, содержащих текущую страницу
- Теги можно отключить, удалив `Component.TagList()` из layout
- Навигационные кнопки (navButtons) удалены из компонента - меню содержит только заголовок, метаданные и секции файловой структуры

