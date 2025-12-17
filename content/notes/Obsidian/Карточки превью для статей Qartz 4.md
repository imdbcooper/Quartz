---
publish: true
title: Карточки превью для статей Qartz 4
description:
created: 2025-12-17
modified: 2025-12-16T10:31:15.111+03:00
tags:
  - blog
  - tutorial
  - obsidian
  - Quartz
cssclasses: ""
draft: false
preview_image: /images/1234.png
---
# Реализация компонента PagePreviewList в Quartz 4

## Введение

В рамках проекта по улучшению пользовательского интерфейса Quartz 4 была реализована новая функциональность - отображение карточек превью со списком статей, содержащих изображение, заголовок, описание, дату и теги. Эта функция значительно улучшает визуальное восприятие списков статей на страницах папок и тегов, делая навигацию более интуитивной и привлекательной.

## Цель реализации

Основная цель - создать компонент `PagePreviewList`, который будет отображать статьи в виде карточек с визуальным привлечением, позволяя пользователям быстро ознакомиться с содержимым страниц перед переходом к ним. Это улучшает пользовательский опыт при навигации по сайту с большим количеством статей.

## Архитектура компонента

Компонент `PagePreviewList` состоит из следующих частей:

1. **Интерфейс PagePreview** - определяет структуру данных для отображения превью:
   - `title` - заголовок статьи
   - `description` - описание статьи
   - `date` - дата публикации
   - `tags` - теги статьи
   - `slug` - уникальный идентификатор статьи
   - `previewImage` - изображение для превью

2. **Функция extractPreviewData** - извлекает данные для превью из `QuartzPluginData`, включая изображение превью из frontmatter статьи

3. **Компонент PagePreviewList** - основной компонент, отвечающий за отображение карточек превью

4. **CSS стили** - определяют внешний вид карточек превью, включая адаптивный дизайн

## Реализация компонента

### Извлечение данных превью

Функция `extractPreviewData` извлекает необходимые данные из `QuartzPluginData`:

```typescript
export function extractPreviewData(page: QuartzPluginData, cfg: GlobalConfiguration): PagePreview {
  const title = page.frontmatter?.title ?? "Без названия"
  const description = page.frontmatter?.description
  const tags = page.frontmatter?.tags ?? []
  const slug = page.slug!
  const date = page.dates ? getDate(cfg, page) : undefined
  
  // Извлекаем изображение для превью из frontmatter
  let previewImage = page.frontmatter?.preview_image as string
  
  return {
    title,
    description,
    date,
    tags,
    slug,
    previewImage
  }
}
```

### Основной компонент

Компонент `PagePreviewList` реализует отображение карточек превью с использованием React/Preact JSX:

```typescript
export const PagePreviewList: QuartzComponent = ({ cfg, fileData, allFiles, limit, sort }: Props) => {
  // Логика сортировки и фильтрации
  // ...
  
  const previewData = list.map(page => extractPreviewData(page, cfg))

  return (
    <div class="page-preview-list">
      {previewData.map((preview) => (
        <a href={resolveRelative(fileData.slug!, preview.slug)} class="preview-card internal">
          <div class="preview-image-container">
            {preview.previewImage ? (
              <img src={preview.previewImage} alt={preview.title} class="preview-image" />
            ) : (
              <div class="placeholder-image">
                <span>{i18n(cfg.locale).components.previewList.noImage}</span>
              </div>
            )}
          </div>
          <div class="preview-content">
            <h3 class="preview-title">{preview.title}</h3>
            {preview.description && (
              <p class="preview-description">{preview.description}</p>
            )}
            <div class="preview-meta">
              {preview.date && (
                <span class="preview-date">
                  <Date date={preview.date} locale={cfg.locale} />
                </span>
              )}
              {preview.tags.length > 0 && (
                <ul class="preview-tags">
                  {preview.tags.map((tag) => (
                    <li>
                      <a
                        class="internal tag-link"
                        href={resolveRelative(fileData.slug!, `tags/${tag}` as FullSlug)}
                      >
                        {tag}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </a>
      ))}
    </div>
  )
}
```

### Стилизация

Компонент включает встроенную CSS-стилизацию для обеспечения адаптивного и привлекательного внешнего вида:

- Сетка карточек с автоматическим подбором количества столбцов
- Адаптивные размеры для различных устройств
- Плавные переходы и эффекты при наведении
- Корректное отображение изображений с использованием `object-fit: cover`

## Интеграция с системой

### Обновление компонентов FolderContent и TagContent

Для поддержки нового режима отображения были обновлены компоненты `FolderContent` и `TagContent`:

- Добавлена опция `usePreviewList` для переключения между обычным списком и списком с превью
- Компоненты теперь могут использовать как старый, так и новый способ отображения

### Обновление плагинов

Плагины `FolderPage` и `TagPage` были обновлены для передачи опции `usePreviewList` в компоненты:

```typescript
Plugin.FolderPage({
  usePreviewList: true,
}),
Plugin.TagPage({
  usePreviewList: true,
}),
```

### Обновление системы локализации

Для поддержки многоязычности были добавлены соответствующие строки в файлы локализации:

- `en-US.ts` - английская локализация
- `ru-RU.ts` - русская локализация
- `definition.ts` - определение интерфейса локализации

## Использование изображений превью

### Настройка изображений

Для указания изображения превью для конкретной статьи используется поле `preview_image` в frontmatter:

```yaml
---
title: Пример статьи
description: Это описание будет отображаться в превью
preview_image: /images/preview.jpg
tags: [пример, кварц]
---
```

### Обработка отсутствующих изображений

При отсутствии изображения превью отображается плейсхолдер с текстом "Нет изображения" или "No image" в зависимости от языка.

## Адаптивный дизайн

Компонент реализован с учетом адаптивности:

- Используется CSS Grid для автоматического подбора количества столбцов
- Карточки корректно отображаются на различных размерах экранов
- При малых размерах экрана отображается одна колонка

## Возможности кастомизации

Пользователи могут настраивать внешний вид компонента через:

- Файл `quartz/styles/custom.scss` для переопределения стилей
- Параметры в конфигурации для включения/выключения функциональности
- Настройку размеров и поведения карточек

## Заключение

Реализация компонента `PagePreviewList` успешно завершена и интегрирована в систему Quartz 4. Компонент улучшает пользовательский опыт при навигации по спискам статей, предоставляя визуально привлекательное и информативное представление контента.

Благодаря модульной архитектуре компонент легко интегрируется с существующей системой и может быть расширен для поддержки дополнительных функций, таких как поддержка видео превью, интеграция с системами комментариев или добавление анимации при наведении.