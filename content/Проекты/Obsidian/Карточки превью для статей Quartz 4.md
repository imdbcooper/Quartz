---
publish: true
title: "Карточки превью для статей Quartz 4"
description: "Как PagePreviewList показывает статьи карточками на страницах папок и тегов: frontmatter, preview_image, resolveRelative и inline CSS."
created: 2025-12-17
modified: 2026-06-04 02:45
tags:
  - blog
  - tutorial
cssclasses: ""
draft: false
preview_image: /images/cart1.jpeg
---

# Карточки превью для статей Quartz 4

В текущем сайте Smirnoff страницы папок и тегов показывают не только список ссылок. Для них включён компонент `PagePreviewList`: карточки с картинкой, заголовком, описанием, датой, тегами и кнопкой `Preview`.

Это делает разделы вроде проектных материалов удобнее. Читатель видит не голый список файлов, а короткую витрину статей.

## Где включены карточки

Режим включается в `quartz.config.ts` у emitters:

```ts
Plugin.FolderPage({
  usePreviewList: true,
})

Plugin.TagPage({
  usePreviewList: true,
})
```

То есть карточки используются для страниц папок и тегов автоматически. Отдельно вставлять `PagePreviewList` в каждую Markdown-страницу не нужно.

## Что берётся из frontmatter

Компонент читает данные из `QuartzPluginData`:

- `title` — заголовок карточки;
- `description` — короткий текст;
- `dates` — дата через `getDate`;
- `tags` — список тегов;
- `slug` — путь страницы;
- `preview_image` — картинка превью.

Минимальный frontmatter для нормальной карточки:

```yaml
---
publish: true
title: "Название статьи"
description: "Короткое описание для карточки."
tags:
  - blog
draft: false
preview_image: /images/quartz-example.png
---
```

Если `preview_image` не указан, компонент показывает placeholder с текстом `No image` или локализованной строкой из i18n.

## Как резолвится картинка

Важная деталь текущей реализации: `preview_image` берётся из frontmatter, а потом путь проходит через `resolveRelative`:

```tsx
<img
  src={resolveRelative(fileData.slug!, preview.previewImage as FullSlug)}
  alt={preview.title}
  class="preview-image"
/>
```

Поэтому для материалов проще использовать абсолютные пути от корня сайта: `/images/name.png`. Такой формат уже принят в проектных статьях и меньше зависит от глубины текущей папки.

## Как выглядит карточка

Сейчас карточка рендерится примерно так:

```tsx
<article class="preview-card">
  <a href={href} class="preview-link">
    <div class="preview-image-container">...</div>
    <div class="preview-content">
      <h3 class="preview-title">...</h3>
      <p class="preview-description">...</p>
    </div>
  </a>
  <div class="preview-meta">...</div>
</article>
```

В meta-блоке отдельно находятся:

- ссылка-кнопка `Preview`;
- дата;
- теги со ссылками на страницы тегов.

## Стили сейчас inline

Раньше было легко написать, что для карточек нужен отдельный CSS-файл. В текущей реализации это не так: CSS лежит прямо в `PagePreviewList.css` внутри компонента.

Там описаны:

- grid-сетка `repeat(auto-fill, minmax(280px, 1fr))`;
- hover-подъём карточки;
- `aspect-ratio: 16 / 10` для изображения;
- `object-fit: cover`;
- обрезка описания до трёх строк;
- адаптация под мобильные экраны.

Если нужно поменять внешний вид только этого компонента, править придётся сам `PagePreviewList.tsx` или аккуратно переопределять классы глобальными стилями.

## Практические правила для статей

Чтобы карточки выглядели ровно:

1. Пиши нормальный `description`, не длиннее одного-двух предложений.
2. Добавляй `preview_image` почти в каждую опубликованную статью.
3. Используй изображения с широким соотношением сторон, потому что контейнер сейчас `16 / 10`.
4. Не рассчитывай, что компонент сам найдёт первую картинку в тексте: в коде оставлен комментарий про такую возможность, но сейчас логика берёт только frontmatter.
5. Проверяй теги: они становятся ссылками и видны на карточке.

## Итог

`PagePreviewList` — небольшая, но заметная часть сайта. Она превращает папки и теги в нормальные обзорные страницы. Источник данных остаётся простым: frontmatter статьи. Главное — не забывать `description` и `preview_image`, потому что именно они делают карточку полезной.
