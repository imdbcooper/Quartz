# Preview List

Preview List - это расширение для Quartz v4, которое позволяет отображать списки статей в виде карточек с изображением превью, описанием, датой и тегами. Это улучшает визуальное восприятие списков статей на страницах папок и тегов, делая навигацию более интуитивной и привлекательной.

## Особенности

- Карточки превью с изображением, заголовком, описанием, датой и тегами
- Адаптивный дизайн, корректно отображающийся на различных устройствах
- Поддержка локализации (включая русский и английский языки)
- Возможность переключения между обычным списком и списком с превью
- Плейсхолдеры для отсутствующих изображений

## Установка

Все необходимые файлы уже включены в вашу установку Quartz. Никакой дополнительной установки не требуется.

## Конфигурация

### Использование в папках

Чтобы включить отображение превью для страниц папок, обновите ваш файл `quartz.layout.ts`:

```typescript
import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// Использование компонента FolderContent с опцией usePreviewList
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
        {
          Component: Component.Search(),
          grow: true,
        },
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

// Использование превью-списка для страниц с папками
export const previewListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
      ],
    }),
    Component.Explorer(),
  ],
  right: [],
}
```

Затем обновите ваш файл `quartz.config.ts`, чтобы использовать компонент `FolderContent` с опцией `usePreviewList`:

```typescript
import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

const config: QuartzConfig = {
  configuration: {
    // ... другие настройки
  },
  plugins: {
    transformers: [
      // ... другие трансформеры
    ],
    filters: [
      // ... другие фильтры
    ],
    emitters: [
      // ... другие эмиттеры
      Plugin.FolderPage({
        // Включить отображение превью для папок
        usePreviewList: true,
      }),
      Plugin.TagPage({
        // Включить отображение превью для тегов
        usePreviewList: true,
      }),
    ],
  },
}

export default config
```

### Использование на страницах тегов

Для страниц тегов функциональность включается аналогично через опцию `usePreviewList` в конфигурации компонента `TagContent`.

## Настройка изображений превью

Чтобы указать изображение превью для конкретной статьи, добавьте поле `preview_image` в frontmatter:

```markdown
---
title: Пример статьи
description: Это описание будет отображаться в превью
preview_image: /static/images/preview.jpg
tags: [пример, кварц]
---
```

Если изображение превью не указано, будет отображаться плейсхолдер с текстом "Нет изображения" или "No image" в зависимости от языка.

## Стилизация

Компонент поставляется с базовыми стилями, которые можно настроить через файл `quartz/styles/custom.scss`. Карточки превью используют следующие CSS-классы:

- `.page-preview-list` - контейнер для всех карточек
- `.preview-card` - отдельная карточка превью
- `.preview-image-container` - контейнер для изображения
- `.preview-image` - изображение превью
- `.placeholder-image` - плейсхолдер изображения
- `.preview-content` - контент карточки
- `.preview-title` - заголовок статьи
- `.preview-description` - описание статьи
- `.preview-meta` - контейнер для даты и тегов
- `.preview-date` - дата публикации
- `.preview-tags` - список тегов

## Совместимость

- Требуется Quartz v4
- Совместим с существующими конфигурациями
- Поддерживает все функции сортировки и фильтрации, доступные в стандартном списке статей
- Для корректной работы требует обновления плагинов `FolderPage` и `TagPage` (см. инструкцию выше)

## Устранение неполадок

Если превью не отображаются:

1. Проверьте, что вы обновили плагины `FolderPage` и `TagPage` в `quartz.config.ts` с опцией `usePreviewList: true`
2. Убедитесь, что в `quartz.components/index.ts` добавлен экспорт `PagePreviewList`
3. Проверьте, что в файлах локализации (`en-US.ts`, `ru-RU.ts`) и в определении (`definition.ts`) добавлены соответствующие строки
4. Убедитесь, что изображения превью находятся в правильной директории и имеют корректные пути
5. Проверьте, что в файлах `folderPage.tsx` и `tagPage.tsx` опция `usePreviewList` передается в компоненты
6. После внесения изменений обязательно пересоберите проект командой `npx quartz build`

## Развитие функциональности

Этот компонент может быть расширен для:

- Поддержки видео превью
- Добавления рейтинга или количества просмотров
- Интеграции системами комментариев
- Добавления анимации при наведении