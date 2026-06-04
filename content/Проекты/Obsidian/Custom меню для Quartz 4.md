---
publish: true
title: "Custom меню для Quartz 4"
description: "Как в текущем сайте Smirnoff устроено карточное меню Quartz: CardMenuOptions, nav buttons, drawerComponent, ресурсы и layout."
created: 2025-12-28 21:57
updated: 2026-06-04 02:45
tags:
  - blog
cssclasses: ""
draft: false
preview_image: /images/Isometric_3d_illustration_202512282149.jpeg
---

# Custom меню для Quartz 4

В этом проекте стандартный Explorer заменён на `CardMenu`. Это не отдельная страница с ручным списком ссылок, а компонент Quartz, который строит навигацию из файлового дерева, сворачивает папки, сохраняет состояние и живёт в левой колонке рядом с `Avatar`.

> Общий контекст layout описан в [[Кастомизация Quartz 4. Меню, логотип, цвета и формы страницы|заметке про кастомизацию Quartz 4]].

## Где лежит меню

У компонента три основные части:

- `quartz/components/CardMenu.tsx` — TSX-разметка, опции и подключение ресурсов;
- `quartz/components/styles/cardMenu.scss` — внешний вид меню;
- `quartz/components/scripts/cardMenu.inline.ts` — клиентская логика раскрытия папок и мобильного поведения.

Компонент экспортируется из `quartz/components/index.ts`, а подключается в `quartz.layout.ts` через `Component.CardMenu()`.

## Текущий layout

В content-layout слева сейчас стоят:

```ts
left: [
  Component.Avatar(),
  Component.MobileOnly(Component.Flex({ components: [...] })),
  Component.CardMenu(),
  Component.DesktopOnly(homeScrollSequenceOnIndex),
]
```

То есть меню не заменяет всю левую колонку. Над ним есть аватар, а на мобильных рядом работает компактный блок поиска, dark mode и reader mode. На главной ниже может появляться scroll sequence.

Для list-layout и preview-list layout схема похожая: `Avatar`, мобильный toolbar и `CardMenu`.

## CardMenuOptions в текущей версии

Актуальный интерфейс опций выглядит так по смыслу:

```ts
interface CardMenuOptions {
  title?: string
  folderDefaultState: "collapsed" | "open"
  folderClickBehavior: "collapse" | "link"
  useSavedState: boolean
  sortFn: (a, b) => number
  filterFn: (node) => boolean
  mapFn: (node) => void
  order: Array<"sort" | "filter" | "map">
  showNavButtons: boolean
  navButtons: Array<{ label: string; href: string }>
  footerText?: string
  drawerComponent?: QuartzComponent
}
```

Важное отличие от старого текста: навигационные кнопки **не удалены**. Сейчас в default options включён `showNavButtons: true`, а список кнопок такой:

```ts
navButtons: [
  { label: "Контакты", href: "/Кoнтакты" },
  { label: "RSS", href: "/index.xml" },
  { label: "Архив", href: "/tags" },
]
```

Меню фильтрует папку `tags`, сортирует элементы с `localeCompare` и `numeric: true`, а состояние раскрытых разделов хранит в `localStorage`, если включён `useSavedState`.

## Как строится HTML

`CardMenu.tsx` отдаёт контейнер, мобильную кнопку, слот для секций и несколько HTML-шаблонов:

- `template-card-file` для обычной страницы;
- `template-card-section` для верхних секций;
- `template-card-folder` для вложенных папок;
- `template-card-link` для навигационных кнопок.

Сами пункты меню заполняются inline-скриптом. Это нормальный паттерн для Quartz: TSX-компонент отдаёт статическую основу и ресурсы, а клиентский скрипт оживляет поведение после загрузки.

## drawerComponent и объединение ресурсов

У текущего `CardMenu` есть полезная опция `drawerComponent`. Она позволяет вставить внутрь меню дополнительный компонент:

```tsx
{DrawerComponent && (
  <div class="card-menu-drawer-slot">
    <DrawerComponent {...props} />
  </div>
)}
```

Чтобы у вложенного компонента не потерялись стили и скрипты, используется `concatenateResources`:

```ts
CardMenu.css = concatenateResources(style, opts.drawerComponent?.css)
CardMenu.beforeDOMLoaded = opts.drawerComponent?.beforeDOMLoaded
CardMenu.afterDOMLoaded = concatenateResources(script, opts.drawerComponent?.afterDOMLoaded)
```

Это важная деталь. Если просто отрендерить чужой компонент внутри меню и забыть про ресурсы, он может выглядеть правильно в HTML, но остаться без CSS или клиентского поведения.

## Поведение папок

В меню есть два отдельных решения:

- клик по названию папки может вести на страницу папки;
- клик по пустому месту или кнопке раскрывает/сворачивает секцию.

Для этого в шаблонах есть `spacer`-элементы и отдельные toggle-кнопки. Такой подход убирает вечную проблему меню, когда пользователь хочет перейти в раздел, а вместо этого случайно раскрывает папку.

## Мобильная версия

На мобильных используется кнопка-гамбургер с `aria-controls`. Контент меню открывается как drawer. Состояние и обработчики живут в `cardMenu.inline.ts`, а не в Markdown.

Практический вывод: если меню не открывается на мобильном, сначала проверять нужно не статью и не `content/index.md`, а стили `cardMenu.scss` и inline-скрипт.

## Что менять чаще всего

Для текущего проекта обычно хватает трёх точек настройки:

1. Изменить `navButtons`, если нужны другие быстрые ссылки.
2. Изменить `filterFn`, если какую-то папку надо скрыть из меню.
3. Изменить `sortFn` или `mapFn`, если нужен другой порядок или подписи.

Полностью переписывать компонент ради новой ссылки не нужно.

## Итог

`CardMenu` в сайте Smirnoff — это текущая основная навигация, а не черновая замена Explorer. Она работает вместе с `Avatar`, поиском, dark mode, reader mode и условными блоками layout. Самое полезное в ней — не карточный внешний вид, а то, что меню остаётся data-driven: оно следует структуре `content`, но даёт достаточно ручного контроля через `CardMenuOptions`.
