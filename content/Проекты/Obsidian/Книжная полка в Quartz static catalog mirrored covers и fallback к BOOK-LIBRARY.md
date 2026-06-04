---
publish: true
title: "Книжная полка в Quartz: static catalog, mirrored covers и fallback к BOOK-LIBRARY"
description: "Как Quartz показывает библиотеку через LibraryPage, bookshelf.json, generated catalog, mirrored covers и live API fallback."
created: 2026-06-04 02:45
tags:
  - blog
  - project
cssclasses: ""
draft: false
preview_image: /images/quartz-bookshelf.png
---

# Книжная полка в Quartz

Книжная полка на сайте Smirnoff — это не попытка перенести BOOK-LIBRARY внутрь Quartz. Quartz остаётся статическим сайтом и показывает витрину. BOOK-LIBRARY остаётся источником истины: там живут книги, категории, обложки, админка, импорт, переводы и скачивание через backend.

Такое разделение специально сделано, чтобы сайт не превращался в файловый склад.

## Страница content/library.md

В `content/library.md` почти нет тела страницы:

```yaml
---
title: "Библиотека"
description: "Категории и книги из BOOK-LIBRARY..."
publish: true
---
```

Этого достаточно, потому что slug `library` перехватывается в `quartz.layout.ts`. Для него подключается `LibraryPage`, а обычные заголовок, meta, TOC и Backlinks отключаются.

Markdown-файл здесь нужен как точка входа: он даёт title, description, publish-флаг и URL страницы.

## LibraryPage

`quartz/components/LibraryPage.tsx` создаёт каркас интерфейса:

- hero-блок библиотеки;
- status-сообщение загрузки;
- контейнер категорий;
- hover preview;
- modal для подробной карточки книги.

Компонент получает настройки из `bookshelf.json` и прокидывает их в data-атрибуты:

- `data-library-backend-base-url`;
- `data-library-catalog-path`;
- `data-library-preview-description-length`.

Дальше всё оживляет `libraryPage.inline.ts`.

## bookshelf.json

Настройки библиотеки лежат в `quartz/static/data/bookshelf.json`:

```json
{
  "schemaVersion": 1,
  "backendBaseUrl": "https://book.slavx.ru",
  "catalogPath": "/static/generated/bookshelf-catalog.json",
  "previewDescriptionLength": 260
}
```

`backendBaseUrl` говорит, где искать live API BOOK-LIBRARY. `catalogPath` указывает на статический fallback-каталог. `previewDescriptionLength` ограничивает длину описания в hover preview.

## Live API

На клиенте библиотека сначала пытается загрузить данные из BOOK-LIBRARY:

- категории: `/api/categories`;
- книги категории: `/api/categories/:id/books?limit=24&offset=0`.

Книги грузятся лениво. Первая категория запрашивается сразу, остальные — при приближении к viewport через `IntersectionObserver`. Это снижает количество запросов на первом экране.

## Static fallback

Если live API не ответил, скрипт пробует загрузить static catalog по `catalogPath`. Это файл `quartz/static/generated/bookshelf-catalog.json`.

Fallback важен по нескольким причинам:

- сайт остаётся рабочим, даже если backend временно недоступен;
- GitHub Pages продолжает отдавать статическую витрину;
- можно показать curated-снимок библиотеки без запроса к API;
- часть проблем CORS не ломает страницу полностью.

Static catalog не заменяет backend. Это запасной слой для публичной витрины.

## Build-time generation

`generateBookshelfStaticAssets` находится в `quartz/util/bookshelfCatalog.ts`. Он вызывается из `quartz.layout.ts` и может во время сборки:

1. сходить в `backendBaseUrl`;
2. получить категории;
3. получить книги по каждой категории;
4. скачать обложки;
5. записать JSON-каталог;
6. сохранить mirrored covers в `quartz/static/generated/book-library-covers`.

Путь к каталогу вычисляется из `catalogPath`. Если он начинается с `/static/generated/`, файл пишется внутрь generated-директории Quartz.

## Mirrored covers

У каждой книги может быть `coverUrl` из BOOK-LIBRARY. Генератор пытается скачать обложку, определить расширение по URL или content-type и сохранить файл как статический asset.

После этого в catalog у книги появляется `coverSrc`, например:

```json
{
  "coverSrc": "/static/generated/book-library-covers/10.webp"
}
```

На странице это даёт быстрые локальные обложки. Если картинка не загрузилась, `LibraryPage` показывает fallback с первой буквой названия.

## Rails, preview и modal

Интерфейс библиотеки сделан как набор горизонтальных rails. У каждой категории есть строка обложек и собственный scrollbar. На десктопе hover или focus показывает preview: категория, формат, название, автор и короткое описание.

Клик открывает modal. В модальном окне больше места, поэтому туда выводятся обложка, номер книги, формат, автор и полное описание. Escape и кнопка закрытия возвращают пользователя назад.

## Почему Quartz — витрина

Quartz хорош как публичный слой:

- его легко деплоить как статику;
- он связывает библиотеку с заметками и проектами;
- он умеет показывать curated-контент;
- он не требует backend для каждой страницы.

Но Quartz не должен решать задачи BOOK-LIBRARY:

- хранение файлов книг;
- временные ссылки на скачивание;
- импорт;
- переводы;
- админские операции;
- контроль публикации.

Если смешать эти роли, сайт станет сложнее и небезопаснее. Поэтому BOOK-LIBRARY остаётся источником истины, а Quartz показывает аккуратную публичную полку.

## generated — не ручной источник

`quartz/static/generated` нельзя воспринимать как место для ручного редактирования каталога. Это результат генерации. Если нужно поменять книгу, категорию или обложку, править нужно BOOK-LIBRARY или конфигурацию интеграции, а не generated JSON.

Для Markdown-задач особенно важно не запускать build без необходимости: он может обновить generated catalog и covers, даже если вы меняли только статьи.

## Итог

Книжная полка в Quartz — это статическая витрина с live API и fallback. Она показывает читателю категории, обложки и описания, но не забирает на себя роль библиотеки. Такая граница делает проект проще: Quartz отвечает за сайт и связи, BOOK-LIBRARY — за книги и данные.
