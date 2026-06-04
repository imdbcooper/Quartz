---
publish: true
title: "Инфраструктура Quartz-проекта: команды, preview, CI и деплой"
description: "Node 22, npm-скрипты, clean-URL preview, GitHub Actions, public, docs и осторожность с generated-файлами библиотеки."
created: 2026-06-04 02:45
tags:
  - blog
  - project
cssclasses: ""
draft: false
preview_image: /images/quartz-infrastructure.png
---

# Инфраструктура Quartz-проекта

Инфраструктура у Quartz-проекта — не отдельная «техническая полка», а способ спокойно писать и публиковать сайт: понимать, чем проверять правки, где смотреть результат и что не стоит трогать руками.

Здесь уже собран рабочий контур: Node 22, npm-скрипты, локальный preview с clean URLs, CI, деплой в GitHub Pages и отдельная generated-зона для книжной полки. Эта заметка — короткая карта по нему: она помогает быстро выбрать нужную команду, найти результат сборки и не попасть в ситуацию, когда локально всё выглядит иначе, чем после публикации.

## Node 22

В `package.json` указаны engines:

```json
{
  "npm": ">=10.9.2",
  "node": ">=22"
}
```

GitHub Actions тоже ставят Node 22. Это держит локальную разработку и автоматические проверки в одной среде. Старые версии Node лучше не использовать для проверки проекта: часть зависимостей и ESM-поведение могут отличаться.

## Команды

Команды здесь нужны не «для галочки», а чтобы каждый сценарий был понятным: написать текст, посмотреть сайт, проверить сборку, подготовить результат к публикации. Актуальные npm-скрипты:

```bash
npm run quartz
npm run docs
npm run site:dev
npm run site:preview
npm run check
npm run format
npm test
npm run profile
```

Коротко по смыслу:

- `npm run quartz` — запускает Quartz CLI через `./quartz/bootstrap-cli.mjs`;
- `npm run docs` — собирает и сервит docs: `npx quartz build --serve -d docs`;
- `npm run site:dev` — dev-preview с watch: `npx quartz build --serve --watch -d content`;
- `npm run site:preview` — отдаёт уже собранный `public` через `tools/serve-public.ts`;
- `npm run check` — typecheck и prettier check;
- `npm run format` — форматирование prettier;
- `npm test` — тесты через `tsx --test`;
- `npm run profile` — профилирование сборки.

Для правок Markdown обычно не нужно запускать всё подряд. Если задача только текстовая, достаточно проверки ссылок и frontmatter: так проще не смешать редактуру статьи с техническими побочными изменениями. Build может обновить generated-файлы библиотеки.

## Clean-URL preview

Для читателя адрес страницы должен выглядеть естественно: без лишнего `.html` на конце. Quartz генерирует страницы именно так, что URL может быть без расширения. Например, пользователь открывает `/Кoнтакты`, а физический файл может быть `Кoнтакты.html`.

Из-за этого `python -m http.server public` не подходит как основной preview. Он просто раздаёт файлы и не делает нужный rewrite для extensionless routes, поэтому локальная проверка может обмануть.

Для `public` в проекте есть специальный сервер:

```bash
npm run site:preview
```

Он запускает `tools/serve-public.ts`. Скрипт проверяет, существует ли HTML-файл для пути без расширения, и отдаёт его корректно. Также он умеет работать с `index.html` в папках и выставляет inline-заголовки для статических файлов. В итоге preview ближе к тому, как посетитель будет ходить по опубликованному сайту.

## site:dev

Для разработки используется:

```bash
npm run site:dev
```

Это Quartz build с `--serve --watch`. Он удобен, когда нужно смотреть изменения в браузере во время работы: поправил заметку, обновил страницу, сразу увидел эффект. Но для задач, где нельзя трогать generated-каталог, запускать его нужно осторожно: layout вызывает генерацию static assets для библиотеки.

## docs preview

`npm run docs` собирает Quartz в директорию `docs` и сразу поднимает serve:

```bash
npx quartz build --serve -d docs
```

Это отдельный preview-output. Он полезен, когда нужно проверить документационный вариант или сборку не в `public`, не смешивая её с production-результатом сайта.

## CI

Workflow `.github/workflows/ci.yaml` называется `Build and Test`. Он запускается на pull request, push в `main` и вручную.

Шаги такие:

1. checkout с `fetch-depth: 0`;
2. setup Node 22;
3. `npm ci`;
4. `npm run check`;
5. `npm test`;
6. `npx quartz build --bundleInfo`.

Последний шаг важен: CI не только проверяет TypeScript и тесты, но и убеждается, что Quartz вообще собирается. Для автора сайта это страховка от правок, которые выглядят безобидно в Markdown, но ломают итоговую сборку.

## Deploy

Workflow `.github/workflows/deploy.yml` называется `Deploy Quartz to GitHub Pages`. Он запускается при push в `main`.

Схема простая:

1. checkout;
2. setup Node 22;
3. `npm ci`;
4. `npx quartz build`;
5. публикация `./public` в ветку `gh-pages` через `peaceiris/actions-gh-pages`.

То есть production-output — это `public`, а ветка публикации — `gh-pages`. Эта схема отделяет исходники от того, что реально отдаётся GitHub Pages.

## public

`public` — результат production build, финальная витрина собранного сайта. Его не нужно редактировать руками: такие правки легко потерять при следующей сборке. Если нужно изменить страницу, правится `content`, конфиг, layout или компонент, а потом сайт пересобирается.

Для локальной проверки уже готового `public` используется `npm run site:preview`, а не Python-сервер.

## CustomOgImages

В `quartz.config.ts` подключён `CustomOgImages` с `smirnoffSocialImage`. Это полезно для красивых social previews, но может замедлять build. В конфиге прямо есть комментарий, что emitter можно закомментировать для ускорения сборки.

Если меняются только тексты и нужно быстро проверить Markdown, не стоит удивляться, что build занимает больше времени: OG-картинки — один из возможных факторов.

## Осторожно с quartz/static/generated

Самое важное ограничение для этого проекта — `quartz/static/generated`. Там лежит generated catalog и mirrored covers для BOOK-LIBRARY, то есть файлы, которые выглядят как часть сайта, но живут по правилам генерации.

Эти файлы могут обновляться во время сборки через `generateBookshelfStaticAssets`. Они не являются ручным источником истины и не должны смешиваться с обычными правками статей.

Если в рабочем дереве уже есть generated-изменения, их лучше не трогать в текстовой задаче. Иначе легко получить коммит, где рядом с Markdown внезапно лежат десятки обновлённых обложек.

## Итог

Инфраструктура проекта держится на простой схеме: Node 22, npm-скрипты, Quartz build, CI-проверки и deploy в `gh-pages`. Её задача — сделать путь от заметки до опубликованной страницы предсказуемым. Главное — использовать правильный preview для clean URLs, не редактировать собранный `public` вручную и помнить, что сборка может менять generated-файлы библиотеки.
