---
publish: true
title: "Obsidian и Quartz: материалы по сайту Smirnoff"
description: "Навигационный хаб по заметкам об Obsidian, Quartz 4, инфраструктуре сайта Smirnoff, кастомных компонентах и книжной полке."
created: 2025-12-17
updated: 2026-06-04 02:45
tags:
  - blog
  - project
cssclasses: ""
draft: false
preview_image: /images/Obsidian.png
---

# Obsidian и Quartz

Здесь собраны материалы про то, как устроен этот Quartz-проект: от базовой настройки до кастомных компонентов сайта Smirnoff. Часть заметок начиналась как инструкции по Quartz + Obsidian, но сейчас серия больше привязана к реальному репозиторию: `content`, `quartz.config.ts`, `quartz.layout.ts`, GitHub Actions, библиотека и data-driven страницы.

## С чего начать

- [[Quartz 4 быстрый генератор статических сайтов с интеграцией Obsidian|Quartz 4 и сайт Smirnoff]] — общий обзор роли Quartz в проекте.
- [[Установка и настройка Quartz 4|Установка и настройка Quartz 4]] — Node 22, npm-скрипты, preview, CI и деплой.
- [[Как устроен этот Quartz-сайт Smirnoff лендинги и проектные страницы|Как устроен этот Quartz-сайт Smirnoff]] — структура сайта, лендинги, проектные разделы и кастомные компоненты.

## Кастомизация интерфейса

- [[Кастомизация Quartz 4. Меню, логотип, цвета и формы страницы|Кастомизация Quartz 4]] — фактические настройки темы, layout и data-driven страниц.
- [[Custom меню для Quartz 4|Custom меню для Quartz 4]] — CardMenu, nav buttons, drawerComponent и ресурсы меню.
- [[Карточки превью для статей Quartz 4|Карточки превью для статей Quartz 4]] — PagePreviewList, `preview_image`, папки и теги.
- [[Как создать компонент FeedbackForm для Quartz 4|FeedbackForm для Quartz 4]] — форма как placeholder, inline-скрипт и JSON-конфиг.

## Библиотека и инфраструктура

- [[Книжная полка в Quartz static catalog mirrored covers и fallback к BOOK-LIBRARY|Книжная полка в Quartz]] — static catalog, mirrored covers и fallback к BOOK-LIBRARY.
- [[Инфраструктура Quartz-проекта команды preview CI и деплой|Инфраструктура Quartz-проекта]] — команды, clean-URL preview, CI, deploy и осторожность с generated-файлами.
- [[../book-library/BOOK-LIBRARY и Quartz|BOOK-LIBRARY и Quartz]] — где проходит граница между статической витриной Quartz и источником истины BOOK-LIBRARY.

## Obsidian и AI-инструменты

Эти материалы остаются полезными, если Quartz используется вместе с Obsidian как редакторской средой:

- [[Gemini CLI в Obsidian Полный гайд установки и настройки|Gemini CLI в Obsidian]]
- [[Подключение моделей от Perplexity к Obsidian через плагин Copilot|Perplexity в Obsidian Copilot]]
- [[Эмбеддинги в Obsidian Copilot для индекса заметок|Эмбеддинги в Obsidian Copilot]]

## Как читать серию

Если нужно понять именно текущий сайт, начинайте с обзора Smirnoff, потом переходите к кастомизации и инфраструктуре. Если задача связана с контентом, смотрите материалы про preview cards и frontmatter. Если меняется библиотека, сначала проверьте заметку про BOOK-LIBRARY: generated-каталог Quartz не является ручным источником истины.
