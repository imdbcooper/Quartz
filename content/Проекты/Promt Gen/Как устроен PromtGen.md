---
publish: true
title: "Как устроен PromtGen"
description: "Клиентское React-приложение для сборки промтов под товарные карточки, видео-промо и AI-описания."
created: 2026-05-04 19:18
updated: 2026-06-04 05:10
tags:
  - blog
cssclasses: ""
draft: false
preview_image: "/images/promptgen-architecture-cases.png"
---

# Как устроен PromtGen

**PromtGen** — это рабочий генератор промтов для e-commerce и продуктового контента. Его задача — превратить данные о товаре в структурированный output: prompt для изображения, prompt для видео, текстовое описание или короткую инструкцию для редактирования уже готового визуала.

Проект сейчас реализован как клиентское SPA-приложение на React: пользователь заполняет форму, интерфейс собирает промт на стороне браузера, а AI-функции вызываются через Google Gemini при наличии ключа `VITE_GEMINI_API_KEY`.

## Для чего нужен проект

Главная проблема, которую закрывает PromtGen: промт для товарной карточки или продуктового ролика обычно состоит из множества мелких решений — категория, ракурс, фон, свет, текст, характеристики, преимущества, стиль, длительность, кадры, движение камеры. Если собирать это вручную, результат легко становится хаотичным.

PromtGen делает этот процесс управляемым:

- разделяет ввод на понятные шаги;
- подставляет category-specific контекст;
- не заставляет заранее заполнять лишние поля;
- показывает готовый output в review-зоне;
- даёт копируемый prompt или JSON payload;
- поддерживает русский и английский интерфейс.

Это не просто textarea для промта, а workspace, где пользователь постепенно собирает коммерческий визуальный сценарий.

## Текущий UI workflow

В image-режиме PromtGen ведёт пользователя через step header: сначала задаётся продукт и категория, затем визуальная сцена, benefits/specs, дополнительные инструкции и review результата. Правая панель работает как review-зона: там видно итоговый prompt, пустые поля не раздувают output, а copy action остаётся под рукой.

Video Promo стал отдельным guided workspace. В нём есть два темпа работы: **Guided** для последовательного прохождения Setup, Style, Storyboard и Preview, и **Fast** для быстрого редактирования ключевых полей без длинного мастера.

Внутри video-flow логика разделена так:

- **Setup** — продукт, категория, длительность, aspect ratio и reference;
- **Specs и elements** — характеристики товара и отдельные product elements, которые должны попасть в кадр;
- **Style** — visual style, фон, свет, палитра и custom override;
- **Storyboard** — сцены и shots с длительностью, камерой, эффектами, behavior patterns и overlay text;
- **Preview** — review rail, Summary, Prompt, JSON payload и prompt export по отдельным сценам.

За счёт этого Video Promo уже выглядит не как дополнительная форма, а как рабочее место для подготовки VEO 3 brief.

## Основные режимы

### Image Cards (Gen 2)

Режим для генерации промтов под товарные карточки и рекламные изображения. В нём пользователь выбирает категорию товара, настраивает сцену, добавляет текст, преимущества и характеристики.

Поддерживаемые категории:

- электроника и гаджеты;
- одежда;
- обувь;
- еда и продукты;
- FMCG / косметика / бытовые товары;
- инструменты;
- посуда.

Для каждой категории в `constants.ts` заданы свои presets: ракурсы камеры, схемы освещения, фоны и prompt context. Например, для электроники система просит сохранять порты, экраны и кнопки, а для одежды — фокусироваться на фактуре ткани, крое и посадке.

Финальный image prompt собирается в `App.tsx` через derived-state: берутся выбранные options, фильтруются пустые benefit/spec строки, затем формируется русская или английская prompt-структура.

### Video Promo (VEO 3)

Видео-модуль нужен для подготовки промтов под продуктовые ролики. Он вынесен в отдельный компонент `VeoPanel.tsx` и загружается лениво, потому что содержит основную часть сложной логики проекта.

Внутри пользователь собирает:

- базовые параметры продукта;
- длительность ролика;
- визуальный стиль;
- фон, свет и палитру;
- product specs и product elements;
- visual style, включая custom style override/generation;
- storyboard из сцен и кадров;
- движения камеры;
- эффекты и product behavior patterns;
- overlay text и иконки;
- review/export rail;
- итоговый full prompt, prompt по сценам и JSON payload.

Структура storyboard устроена как `VeoFormState -> scenes -> shots`: сцены держат крупную структуру ролика, а кадры описывают конкретные действия, длительность, движение камеры, эффекты и текст.

### AI Description Generator

Отдельный инструмент для коротких маркетинговых описаний товара. Он работает через `@google/genai` и модель Gemini 2.5 Flash. Пользователь может указать название, признаки товара и при необходимости подтянуть данные из benefits/specs основной формы.

Этот модуль полезен, когда для карточки нужен не только визуальный prompt, но и короткий продающий текст.

### Edit / Inpainting Helper

Вспомогательный режим для ситуаций, когда изображение уже создано, но его нужно точечно поправить:

- повернуть товар;
- добавить объект;
- сформировать аккуратный prompt для inpainting / vary region.

Он не пересобирает всю карточку заново, а генерирует короткую инструкцию для локального редактирования выбранной области.

## Архитектура текущей версии

Высокоуровневая структура проекта:

```text
index.tsx
  -> App.tsx
     -> Image Cards workspace
        -> SettingsPanel
        -> BenefitsPanel
        -> SpecsPanel
        -> OutputPanel
        -> EditPanel
        -> DescriptionPanel (lazy)
     -> Video Promo workspace
        -> VeoPanel (lazy)
           -> Setup / Style / Storyboard / Preview
           -> Product specs / product elements
           -> Custom visual style override
           -> Review rail / Summary / Prompt / JSON
           -> URL state for video UI
```

Ключевые файлы:

- `App.tsx` — главный orchestration-компонент: режим image/video, язык, тема, image prompt builder, query-state для image `view`;
- `components/VeoPanel.tsx` — видео-workspace: Guided/Fast UI state, product specs, product elements, custom style override, storyboard, validation, review rail, URL state, preview и JSON export;
- `constants.ts` — UI-строки, category presets, VEO options, behavior patterns;
- `types.ts` — доменные типы: `FormState`, `VeoFormState`, `VeoScene`, `VeoShot`, `CategoryKey`, `Language`;
- `components/DescriptionPanel.tsx` — клиентская Gemini-интеграция для описаний;
- `components/EditPanel.tsx` — edit prompt helper;
- `components/OutputPanel.tsx` — вывод и копирование готового image prompt.

Технологический стек:

- React 19;
- TypeScript;
- Vite 6;
- Tailwind CSS 3;
- lucide-react;
- `@google/genai`.

## Поток данных

### Image Cards

1. Пользователь выбирает категорию.
2. Интерфейс подтягивает presets из `CATEGORY_PRESETS`.
3. Пользователь задаёт ракурс, свет, фон, заголовок, слоган, преимущества, характеристики и extra style.
4. `App.tsx` хранит `FormState` и пересчитывает итоговый prompt через `useMemo`.
5. `OutputPanel` показывает результат и даёт кнопку копирования.

Важная деталь: benefits и specs добавляются вручную по кнопке, а не создаются пустыми заранее. Это делает интерфейс компактнее и уменьшает шум в финальном prompt.

### Video Promo

1. Пользователь выбирает режим `Video Promo (VEO 3)`.
2. `VeoPanel` ведёт собственный `VeoFormState`.
3. Пользователь выбирает Guided или Fast workflow.
4. В Guided режиме проходит setup, visual direction, specs/elements, storyboard и preview; в Fast режиме быстрее редактирует ключевые поля.
5. Derived-state рассчитывает blockers и advisories.
6. Если заполнены обязательные поля, preview показывает summary, full prompt, prompt по сценам и JSON payload.

Валидация сейчас проверяет минимум: тип товара, описание продукта, наличие хотя бы одного описания кадра и совпадение суммы длительностей кадров с общей длительностью ролика. Отсутствие референса отмечается как advisory, а не как блокер. Storyboard ограничен 5 сценами и 5 shots на сцену; product specs и product elements тоже ограничены пятью пунктами, чтобы brief не превращался в бесконечный список.

## Где проект уже полезен

### Карточки для маркетплейсов

PromtGen помогает быстро собрать prompt для product card: заголовок, УТП, specs, читаемый текст, чистый фон и коммерческая предметная подача.

### Продуктовая визуализация

Можно взять один товар и быстро перебрать разные visual directions: студия, dark tech, luxury, pop art, macro, industrial, holographic или cyberpunk-подача.

### Видео-промо для товара

Видео-модуль полезен для подготовки роликов под VEO-пайплайн: сначала описывается продукт, затем собирается storyboard из кадров с длительностями, камерой, эффектами и текстом.

### Работа контент-команды

Маркетолог, дизайнер и e-commerce менеджер могут говорить на одном языке: не «сделай красиво», а «вот категория, фон, свет, преимущества, specs, структура кадра и expected output».

### Быстрые AI-описания

Когда нужно описание для карточки, лендинга или тестовой витрины, можно сгенерировать короткий текст на основе тех же данных, которые уже внесены в форму.

## Ограничения текущего состояния

Текущая версия — сильный frontend-прототип / внутренний инструмент, но ещё не полноценная платформа:

- нет backend API, базы, очередей, авторизации и persistent sessions;
- нет server-side AI proxy: Gemini key остаётся client-side через Vite-переменную;
- нет серверного хранения drafts и истории сессий;
- формального test-suite нет, в package scripts есть только dev/build/preview;
- `VeoPanel.tsx` содержит много логики в одном крупном компоненте;
- prompt builders частично распределены по компонентам.

Эти ограничения не мешают использовать PromtGen как рабочий генератор промтов, но определяют следующий этап развития: серверный слой, сохранение сессий, безопасные AI-вызовы и генерация прямо внутри продукта.

## Связанные материалы

- [[PromtGen VEO 3 guided workflow|VEO 3 guided workflow в текущем Video Promo]]
- [[PromtGen Audio Video|Аудио и видео направление PromtGen]]
- [[PromtGen Backend Roadmap|Роадмап: backend и генерация внутри проекта]]
