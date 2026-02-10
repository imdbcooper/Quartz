---
publish: true
title: Кастомизация Quartz 4
description: Кастомизация Quartz 4. Меню, логотип, цвета и формы страницы
created: 2025-12-16
updated: 2025-12-17 17:08
tags:
  - tutorial
  - obsidian
  - Quartz
cssclasses: ""
draft: false
preview_image: /images/castom.jpeg
---

![[123.png]]

## Рекомендуемые размеры изображений для превью

> Подробный гайд по настройке превью: [[Карточки превью для статей Qartz 4|Карточки превью для статей Quartz 4]].

Для корректного отображения изображений в карточках превью без появления полей или искажения пропорций:

- **Рекомендуемый размер**: 400x300 пикселей (соотношение сторон 4:3)
- **Минимальный размер**: 300x200 пикселей
- **Максимальный размер**: 800x600 пикселей
- **Форматы**: PNG, JPG, WebP

Изображения будут автоматически масштабироваться и подгоняться под размеры контейнера с помощью CSS свойства `object-fit: cover`, которое сохраняет пропорции и обрезает лишнее.

---

На основе имеющейся документации и актуальной информации о Quartz 4, вот основные точки кастомизации:

---

## 1. Основные настройки в `quartz.config.ts`

Это главный файл конфигурации. Вот ключевые параметры (актуальные поля соответствуют коду в `quartz.config.ts`):

```typescript
const config: QuartzConfig = {
  configuration: {
    pageTitle: "🧠 Мой Цифровой Сад",
    pageTitleSuffix: "",
    enableSPA: true,
    enablePopovers: true,
    analytics: { provider: "plausible" },
    locale: "ru-RU",
    baseUrl: "yoursite.com",

    // В коде по умолчанию используются без подчёркиваний
    ignorePatterns: ["private", "templates", ".obsidian"],

    // Какой тип даты брать по умолчанию: "created" | "modified" | "published"
    defaultDateType: "modified",

    theme: {
      // Дополнительно доступны опции шрифтов/кеша CDN
      fontOrigin: "googleFonts",
      cdnCaching: true,

      typography: {
        header: "Merriweather",
        body: "Source Sans Pro",
        code: "IBM Plex Mono",
      },

      // Ключи цветов соответствуют реальной структуре
      colors: {
        lightMode: {
          light: "#faf8f3",
          lightgray: "#e5e5e5",
          gray: "#b8b8b8",
          darkgray: "#4e4e4e",
          dark: "#2b2b2b",
          secondary: "#7fbbb3",
          tertiary: "#d08770",
          highlight: "rgba(127, 187, 179, 0.15)",
          textHighlight: "#fff23688",
        },
        darkMode: {
          light: "#1e1e1e",
          lightgray: "#393b44",
          gray: "#646464",
          darkgray: "#d4d4d4",
          dark: "#ebebec",
          secondary: "#7b97aa",
          tertiary: "#84a59d",
          highlight: "rgba(143, 159, 169, 0.15)",
          textHighlight: "#b3aa0288",
        },
      },
    },
  },

  plugins: {
    transformers: [
      /* трансформеры */
    ],
    filters: [
      /* фильтры */
    ],
    emitters: [
      /* эмиттеры */
    ],
  },
}
```

(актуально для `defaultContentPageLayout`):

```typescript
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        { Component: Component.Search(), grow: true },
        { Component: Component.Darkmode() },
        { Component: Component.ReaderMode() },
      ],
    }),
    Component.Explorer(),
  ],
  right: [
    Component.Graph(),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}
```

> Примечание: тип `PageLayout` включает только `beforeBody`, `left` и `right`. Для общих элементов страницы (например, `afterBody` с комментариями или футером) нужно редактировать `sharedPageComponents` (тип `SharedLayout`) в `quartz.layout.ts`.

**Как добавить пользовательское меню:**

> Полное руководство: [[Custom меню для Qartz 4|Продвинутая настройка меню Quartz 4]].

1. Отредактируйте компонент `Component.Explorer()` или его опции, чтобы скрыть/отобразить нужные папки
2. Используйте `ignorePatterns` в `quartz.config.ts` для скрытия папок
3. Добавьте ссылки вручную в `index.md` (если хотите простое меню)

```markdown
---
title: Главная
---

# 🧠 Мой цифровой сад

## Главное меню

- [[Заметки]]
- [[Проекты]]
- [[О сайте]]
- [[Контакты]]
```

---

## 3. Добавление логотипа

**Вариант 1: Через эмодзи (быстро)**

```typescript
pageTitle: "🪴 My Garden" // Логотип через эмодзи
```

**Вариант 2: Через логотип-файл (сложнее)**

1. Поместите логотип в `content/static/logo.png` — `Assets` эмиттер скопирует его в выходную папку как `/static/logo.png`.
2. Отредактируйте `quartz/components/PageTitle.tsx`, добавив изображение рядом с названием (следуя существующему стилю компонентов):

```typescript
import { pathToRoot } from "../util/path"
import { QuartzComponent, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import { i18n } from "../i18n"

const PageTitle: QuartzComponent = ({ fileData, cfg, displayClass }: QuartzComponentProps) => {
  const title = cfg?.pageTitle ?? i18n(cfg.locale).propertyDefaults.title
  const baseDir = pathToRoot(fileData.slug!)
  return (
    <h2 class={classNames(displayClass, "page-title")}>
      <a href={baseDir}>
        <img src="/static/logo.png" alt="Logo" style="height: 28px; margin-right: 8px;" />
        {title}
      </a>
    </h2>
  )
}

PageTitle.css = `
.page-title img { vertical-align: middle; }
`

export default (() => PageTitle) satisfies QuartzComponentConstructor
```

Это соответствует шаблону компонентов в проекте и корректно использует `cfg`, `fileData` и встроенную систему стилей.

---

## 4. Кастомизация цветов

**Быстрый способ — через `quartz/styles/custom.scss`:**

```scss
// Общие переменные цветов
:root {
  --primary-color: #0a6ed1; // Голубой
  --secondary-color: #0f828f; // Бирюзовый
  --accent-color: #d08770; // Оранжевый
  --bg-light: #faf8f3; // Светлый фон
  --bg-dark: #1e1e1e; // Тёмный фон
  --text-primary: #2b2b2b; // Основной текст
  --text-secondary: #b8b8b8; // Вторичный текст
}

// Применение к элементам
body {
  background-color: var(--bg-light);
  color: var(--text-primary);
}

a {
  color: var(--primary-color);

  &:hover {
    color: var(--secondary-color);
  }
}

.article-title {
  color: var(--text-primary);
  border-bottom: 3px solid var(--primary-color);
}

// Для тёмного режима
@media (prefers-color-scheme: dark) {
  body {
    background-color: var(--bg-dark);
    color: white;
  }
}
```

---

## 5. Формы страницы (layout)

Quartz 4 имеет два основных макета:

**Content Layout** (для статей):

```
[Боковая панель] [Основной контент] [Граф связей]
```

**List Layout** (для списков/тегов):

```
[Хлебные крошки]
[Заголовок]
[Список статей]
```

**Чтобы создать кастомный макет:**

1. Отредактируйте `quartz.layout.ts`
2. Создайте новый `PageLayout` объект (учитывайте, что `PageLayout` содержит только `beforeBody`, `left` и `right`)
3. Назначьте его в `defaultContentPageLayout` или `defaultListPageLayout`

```typescript
export const customPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle()],
  left: [
    Component.PageTitle(),
    Component.Flex({ components: [{ Component: Component.Search(), grow: true }] }),
  ],
  right: [Component.TableOfContents()],
}
```

Чтобы добавить общие элементы страницы, например комментарии, редактируйте `sharedPageComponents.afterBody` (тип `SharedLayout`) в `quartz.layout.ts`:

```typescript
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [Component.Comments()], // <-- сюда добавляются общие секции страницы
  footer: Component.Footer({
    /* ... */
  }),
}
```

---

## 6. Быстрый чек-лист кастомизации

- [ ] Изменил `pageTitle` в `quartz.config.ts`
- [ ] Задал правильный `baseUrl`
- [ ] Настроил `ignorePatterns` для скрытия черновиков (без подчёркиваний: `private`, `templates` и т.д.)
- [ ] Выбрал шрифты в `typography` (header, body, code)
- [ ] Задал цвета в `colors.lightMode` и `colors.darkMode` (используйте `secondary`, `tertiary`, `highlight`, `textHighlight`)
- [ ] Отредактировал `quartz.layout.ts` — добавил/убрал компоненты в `beforeBody`, `left`, `right`
- [ ] Создал `index.md` с главным меню
- [ ] Добавил логотип (эмодзи или файл в `content/static`)
- [ ] Проверил локально: `npx quartz build --serve -d <output-dir>` или `npm run docs`
- [ ] Опубликовал через Publication Center

---

## 7. Полезные ссылки и команды

```bash
# Локальный запуск / просмотр (локальный preview)
npx quartz build --serve -d <output-dir>
# или (специальный скрипт для документации)
npm run docs  # запускает: npx quartz build --serve -d docs

# Сборка статического сайта (production)
npx quartz build -d <output-dir>
# Получить информацию о бандле/артефактах
npx quartz build --bundleInfo -d docs
```

**Ключевые файлы для редактирования:**

- `quartz.config.ts` — конфигурация и цвета
- `quartz.layout.ts` — структура меню и панелей
- `quartz/styles/custom.scss` — кастомные стили
- `content/index.md` — главная страница и меню

Этой информации должно хватить для быстрой кастомизации вашего Quartz 4! 🚀
