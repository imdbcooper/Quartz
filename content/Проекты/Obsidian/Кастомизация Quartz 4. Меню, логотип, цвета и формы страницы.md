---
publish: true
title: "Кастомизация Quartz 4: меню, тема и layout сайта Smirnoff"
description: "Разбор фактической кастомизации Quartz в проекте Smirnoff: конфиг, layout, CardMenu, landing-страницы, превью и custom OG."
created: 2025-12-16
updated: 2026-06-04 02:45
tags:
  - blog
  - tutorial
cssclasses: ""
draft: false
preview_image: /images/castom.jpeg
---

# Кастомизация Quartz 4 в текущем проекте

Эта заметка про фактическое состояние сайта Smirnoff, а не про набор универсальных примеров. В проекте уже изменены тема, layout, меню, страницы-лендинги, списки с превью, библиотека и social images.

> Подробный разбор карточек: [[Карточки превью для статей Quartz 4|Карточки превью для статей Quartz 4]]. Меню отдельно разобрано здесь: [[Custom меню для Quartz 4|Custom меню для Quartz 4]].

## Главный конфиг

Основные настройки лежат в `quartz.config.ts`. Сейчас сайт настроен так:

```ts
configuration: {
  pageTitle: "Smirnoff",
  pageTitleSuffix: "",
  enableSPA: true,
  enablePopovers: true,
  analytics: { provider: "plausible" },
  locale: "en-US",
  baseUrl: "slavx.ru",
  ignorePatterns: ["private", "templates", ".obsidian"],
  defaultDateType: "modified",
}
```

Из важного:

- `enableSPA` нужен для плавной навигации без полной перезагрузки;
- `enablePopovers` включает всплывающие превью внутренних ссылок;
- `baseUrl` выставлен под основной домен `slavx.ru`;
- Plausible подключён как аналитика;
- черновики фильтруются через `RemoveDrafts` и frontmatter `draft: false` / `draft: true`.

## Тема и шрифты

Тема тоже описана в `quartz.config.ts`:

```ts
typography: {
  header: "Inter",
  body: "Inter",
  code: "IBM Plex Mono",
}
```

Палитра задана отдельно для light и dark mode. В светлой теме используются мягкий почти белый фон, тёмный текст и сине-серый `secondary`. В тёмной теме фон уходит в `#111111`, а акцент — в голубой `#60a5fa`.

Это лучше держать в конфиге, а не размазывать по отдельным CSS-переопределениям. Тогда компоненты Quartz продолжают пользоваться общими переменными: `var(--light)`, `var(--dark)`, `var(--secondary)`, `var(--highlight)`.

## Плагины и emitters

В проекте включены стандартные для Quartz вещи:

- frontmatter;
- created/modified date;
- syntax highlighting;
- Obsidian-flavored Markdown;
- GitHub-flavored Markdown;
- table of contents;
- crawl links;
- descriptions;
- KaTeX;
- RSS и sitemap.

Для страниц папок и тегов включён `usePreviewList: true`, поэтому вместо обычных списков используются карточки `PagePreviewList`.

В конце списка emitters подключён `CustomOgImages` с `smirnoffSocialImage`. Это даёт кастомные картинки для шаринга, но может замедлять сборку. Если нужно быстро проверить изменения, этот emitter — первый кандидат на временное отключение.

## Layout: что видно на страницах

Фактическая раскладка задаётся в `quartz.layout.ts`.

В `sharedPageComponents.afterBody` подключены общие ресурсы и блоки:

- `SiteGeometryBackground`;
- `ServicesCarousel`;
- `FeedbackForm`;
- `HomeCallback`;
- `CookieConsent`;
- `Footer`.

Для обычной content-страницы layout такой:

- слева: `Avatar`, мобильный блок `Search` + `Darkmode` + `ReaderMode`, затем `CardMenu`;
- справа: десктопный `Search`, `Darkmode`, `ReaderMode`, граф, latest articles на главной и библиотеке, TOC и Backlinks;
- перед body: breadcrumbs, title и meta, но только для обычных страниц.

## Landing-исключения

Главная, контакты и библиотека не рендерятся как обычная статья.

Для `index` в `beforeBody` вставляется `LandingContainer` с блоками из `home.json`: hero, focus, services, works, FAQ и contact CTA. Там же на главной появляется специальный граф и scroll sequence.

Для `Кoнтакты` используется другой `LandingContainer` с данными из `contacts.json`: hero, каналы связи, workflow, форматы старта, FAQ и CTA.

Для `library` подключается `LibraryPage`, а обычные `ArticleTitle`, `ContentMeta`, TOC и Backlinks для неё отключаются. Библиотека получает свой интерфейс с горизонтальными rails, hover preview и modal.

## CardMenu вместо Explorer

Стандартный Explorer заменён на `CardMenu`. Компонент находится в `quartz/components/CardMenu.tsx`, стили — в `cardMenu.scss`, поведение — в `cardMenu.inline.ts`.

Сейчас в `CardMenuOptions` есть:

- `folderDefaultState`;
- `folderClickBehavior`;
- `useSavedState`;
- `sortFn`, `filterFn`, `mapFn`, `order`;
- `showNavButtons`;
- `navButtons`;
- `footerText`;
- `drawerComponent`.

В текущих default options навигационные кнопки включены: Контакты, RSS, Архив. Меню фильтрует `tags`, сортирует папки и файлы с учётом чисел и сохраняет состояние секций в браузере.

## Data-driven страницы

Часть сайта управляется JSON-файлами из `quartz/static/data`:

- `home.json` — главная;
- `contacts.json` — контакты;
- `home-latest-articles.json` — блок свежих материалов;
- `bookshelf.json` — настройки библиотеки;
- `feedback-form.json` — поля формы;
- `site-geometry-background.json` — декоративный фон.

Это хороший приём для страниц, где Markdown быстро стал бы неудобным. Текст и структура остаются рядом с проектом, но компонент получает уже нормализованные данные.

## Команды

Актуальные команды из `package.json`:

```bash
npm run quartz
npm run docs
npm run site:dev
npm run site:preview
npm run check
npm run format
npm test
```

Для локальной разработки лучше использовать `npm run site:dev`. Для проверки уже собранного `public` — `npm run site:preview`, потому что он использует `tools/serve-public.ts` и поддерживает clean URLs.

## Чек-лист кастомизации

Когда меняешь внешний вид или структуру сайта, я проверяю такие точки:

- `quartz.config.ts`: `baseUrl`, тема, plugins, emitters;
- `quartz.layout.ts`: колонки, conditional renders, landing-исключения;
- `quartz/static/data`: JSON для data-driven страниц;
- `CardMenu`: nav buttons, фильтры, сортировка, mobile drawer;
- `PagePreviewList`: наличие `preview_image` в статьях;
- `CustomOgImages`: нужен ли он в текущей сборке или мешает скорости;
- generated-каталог библиотеки: не попал ли он случайно в ручные правки после build.

Кастомизация Quartz в этом проекте уже давно вышла за рамки «поменять цвет и логотип». Это скорее сборка сайта из Markdown, JSON и Preact-компонентов, где Quartz остаётся статическим генератором, а кастомные части закрывают реальные сценарии Smirnoff.
