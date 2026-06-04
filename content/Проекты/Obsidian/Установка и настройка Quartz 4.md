---
publish: true
title: "Установка и настройка Quartz 4"
description: "Как устроен рабочий процесс текущего Quartz-проекта Smirnoff: Node 22, npm-скрипты, preview, CI и деплой."
created: 2025-12-16
modified: 2026-06-04 02:45
tags:
  - blog
  - tutorial
cssclasses: ""
draft: false
preview_image: /images/setupquartz.jpeg
---

# Установка и настройка Quartz 4 в этом репозитории

Эта заметка больше не про абстрактную установку Quartz на Windows и не про Publication Center как главный способ публикации. Текущий проект — это репозиторий сайта **Smirnoff** на Quartz 4. В нём уже есть структура контента, кастомные компоненты, CI, деплой на GitHub Pages и отдельная инфраструктура для локального preview.

## Что нужно для работы

Проект рассчитан на современный Node.js:

- Node.js `>=22`;
- npm `>=10.9.2`;
- Git;
- любой редактор Markdown или Obsidian, если удобно писать заметки именно там.

Контент лежит прямо в `content`. Это не внешний Windows-путь и не отдельный обязательный vault. Obsidian можно открыть на этой папке, но репозиторий уже устроен так, что `content` является источником для сборки Quartz.

## Структура проекта

Основные места, с которыми приходится работать:

- `content` — Markdown-страницы, статьи, проектные материалы, юридические документы;
- `quartz` — компоненты, плагины, стили, клиентские inline-скрипты;
- `quartz.config.ts` — общая конфигурация сайта, тема, плагины и emitters;
- `quartz.layout.ts` — раскладка колонок, лендинговые исключения, подключение компонентов;
- `quartz/static/data` — JSON-данные для главной, контактов, библиотеки и других data-driven блоков;
- `public` — результат production-сборки;
- `docs` — отдельный output для preview-документации;
- `tools/serve-public.ts` — локальный сервер для уже собранного `public` с поддержкой clean URLs.

`content/index.md`, `content/library.md` и страница контактов в этом проекте не работают как обычные статьи один к одному. Для них в layout есть условия, которые подставляют специальные компоненты.

## Команды из package.json

Актуальные команды такие:

```bash
npm run quartz
npm run docs
npm run site:dev
npm run site:preview
npm run check
npm run format
npm test
```

На практике чаще всего нужны три сценария.

### Разработка сайта

```bash
npm run site:dev
```

Скрипт запускает Quartz build с `--serve --watch` и output-директорией `content`. Это локальный режим для быстрой проверки страниц с clean-URL поведением Quartz.

### Preview уже собранного public

```bash
npm run site:preview
```

Этот скрипт запускает `tsx tools/serve-public.ts`. Он отдаёт `public` и аккуратно обрабатывает extensionless routes: например, `/Кoнтакты` должен открываться как Quartz-страница, а не падать из-за отсутствия физической папки.

Можно передать директорию и порт напрямую:

```bash
tsx tools/serve-public.ts public 4173
```

### Проверки

```bash
npm run check
npm test
```

`npm run check` делает typecheck и prettier check. `npm test` запускает тесты через `tsx --test`.

## Почему не python -m http.server public

Обычный Python-сервер удобен для простых статических папок, но для этого Quartz-сайта он не подходит как основной preview. У Quartz есть clean URLs и extensionless routes. Файл может лежать как `public/Кoнтакты.html`, а браузер открывает `/Кoнтакты`.

`python -m http.server public` не делает нужный rewrite. В итоге часть страниц выглядит сломанной, хотя build нормальный. Для проверки `public` здесь есть `tools/serve-public.ts`, а для разработки — `npm run site:dev`.

## GitHub Actions и деплой

В репозитории есть два workflow.

`ci.yaml` запускается на pull request, push в `main` и вручную. Он:

- ставит Node 22;
- делает `npm ci`;
- запускает `npm run check`;
- запускает `npm test`;
- проверяет сборку Quartz через `npx quartz build --bundleInfo`.

`deploy.yml` отвечает за публикацию:

- запускается при push в `main`;
- ставит Node 22;
- делает `npm ci`;
- собирает сайт командой `npx quartz build`;
- публикует `./public` в ветку `gh-pages` через `peaceiris/actions-gh-pages`.

Фактическая инфраструктура такая: исходники живут в `main`, собранный сайт появляется в `public`, а GitHub Pages получает готовую статику из `gh-pages`.

## Осторожно с generated-каталогом библиотеки

В `quartz.layout.ts` вызывается `generateBookshelfStaticAssets(bookshelfData)`. Это означает, что build может обновить:

- `quartz/static/generated/bookshelf-catalog.json`;
- `quartz/static/generated/book-library-covers/*`.

Эти файлы не являются ручным источником истины. Они генерируются из BOOK-LIBRARY и нужны Quartz как static fallback. Если задача касается только Markdown-статей, не стоит запускать build без необходимости: можно случайно получить лишние изменения в generated-каталоге.

## Рабочий процесс для статей

Для обычной статьи достаточно:

1. Создать или изменить Markdown-файл в `content`.
2. Заполнить frontmatter: `publish`, `title`, `description`, `created`, `tags`, `draft`, `preview_image`.
3. Проверить внутренние ссылки в формате `[[Название страницы]]`.
4. Локально посмотреть через `npm run site:dev`, если нужно проверить внешний вид.
5. После коммита CI и deploy соберут сайт автоматически.

Obsidian здесь остаётся удобным редактором, но не обязательным звеном публикации. Главная логика проекта находится в репозитории, npm-скриптах и GitHub Actions.

## Дальше

- [[Кастомизация Quartz 4. Меню, логотип, цвета и формы страницы|Кастомизация layout и компонентов]]
- [[Инфраструктура Quartz-проекта команды preview CI и деплой|Инфраструктура команд, CI и деплоя]]
- [[Книжная полка в Quartz static catalog mirrored covers и fallback к BOOK-LIBRARY|Как устроена библиотека]]
