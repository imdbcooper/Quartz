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

Эта заметка — не галерея абстрактных сниппетов, а карта того, как сейчас собран сайт Smirnoff на Quartz 4. Здесь важны не только «где поменять цвет», но и зачем вообще трогать тему, меню и форму страницы: именно эти вещи решают, как читатель ориентируется, насколько сайт кажется цельным и насколько автору удобно дальше развивать материалы.

В проекте уже настроены тема, layout, меню, страницы-лендинги, списки с превью, библиотека и social images. Поэтому разбор идёт от реального состояния сайта: что отвечает за первое впечатление, что помогает не потеряться в контенте, а что превращает набор Markdown-страниц в понятный интерфейс.

> Подробный разбор карточек: [[Карточки превью для статей Quartz 4|Карточки превью для статей Quartz 4]]. Меню отдельно разобрано здесь: [[Custom меню для Quartz 4|Custom меню для Quartz 4]].

## Главный конфиг

Основные настройки лежат в `quartz.config.ts`. Это точка, где сайт получает базовую идентичность: название, домен, поведение навигации, аналитику и правила публикации. Если открыть конфиг, сейчас сайт устроен так:

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

Палитра задана отдельно для light и dark mode. В светлой теме используются мягкий почти белый фон, тёмный текст и сине-серый `secondary`. В тёмной теме фон уходит в `#111111`, а акцент — в голубой `#60a5fa`. Для читателя это не декоративная мелочь: цветовая система задаёт настроение страницы, помогает отделять акценты от обычного текста и делает переход между светлым и тёмным режимом предсказуемым.

Это лучше держать в конфиге, а не размазывать по отдельным CSS-переопределениям. Тогда компоненты Quartz продолжают пользоваться общими переменными: `var(--light)`, `var(--dark)`, `var(--secondary)`, `var(--highlight)`, а автору проще менять визуальный тон сайта без охоты за разрозненными стилями.

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

Фактическая раскладка задаётся в `quartz.layout.ts`. Именно layout превращает контент в страницу: решает, где читатель увидит навигацию, когда получит поиск, какие вспомогательные блоки будут рядом со статьёй и где сайт будет вести себя как лендинг, а не как обычная заметка.

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

Главная, контакты и библиотека не рендерятся как обычная статья. Это важное исключение: такие страницы должны не просто показывать Markdown, а быстро объяснять, куда попал человек, какие есть сценарии и куда двигаться дальше.

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

В текущих default options навигационные кнопки включены: Контакты, RSS, Архив. Меню фильтрует `tags`, сортирует папки и файлы с учётом чисел и сохраняет состояние секций в браузере. В итоге навигация работает не как технический список файлов, а как постоянная опора: читатель видит разделы, возвращается к нужным веткам и не начинает каждый переход с нуля.

## Data-driven страницы

Часть сайта управляется JSON-файлами из `quartz/static/data`:

- `home.json` — главная;
- `contacts.json` — контакты;
- `home-latest-articles.json` — блок свежих материалов;
- `bookshelf.json` — настройки библиотеки;
- `feedback-form.json` — поля формы;
- `site-geometry-background.json` — декоративный фон.

Это хороший приём для страниц, где Markdown быстро стал бы неудобным. Текст и структура остаются рядом с проектом, но компонент получает уже нормализованные данные. Такой подход особенно полезен для живых страниц: можно менять содержание блоков, не переписывая компонент и не смешивая редакторскую работу с логикой интерфейса.

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

Когда меняешь внешний вид или структуру сайта, я проверяю такие точки. Этот список помогает не увлечься одной красивой деталью и не забыть, что в Quartz кастомизация почти всегда цепляет несколько уровней сразу: конфиг, layout, данные, компоненты и сборку.

- `quartz.config.ts`: `baseUrl`, тема, plugins, emitters;
- `quartz.layout.ts`: колонки, conditional renders, landing-исключения;
- `quartz/static/data`: JSON для data-driven страниц;
- `CardMenu`: nav buttons, фильтры, сортировка, mobile drawer;
- `PagePreviewList`: наличие `preview_image` в статьях;
- `CustomOgImages`: нужен ли он в текущей сборке или мешает скорости;
- generated-каталог библиотеки: не попал ли он случайно в ручные правки после build.

Кастомизация Quartz в этом проекте уже давно вышла за рамки «поменять цвет и логотип». Это скорее сборка сайта из Markdown, JSON и Preact-компонентов, где Quartz остаётся статическим генератором, а кастомные части закрывают реальные сценарии Smirnoff. Главная мысль здесь простая: хороший Quartz-сайт начинается не с набора украшений, а с решений о том, как читатель будет входить в материалы, перемещаться между ними и узнавать авторский стиль в каждой странице.
