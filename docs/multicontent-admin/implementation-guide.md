# Multicontent Implementation Guide

> Актуально для ветки `refactor/landing-components`
> Статус: реализовано

## Что реализовано

В проекте реализованы две связанные части:

1. Мультиконтент главной страницы по источнику трафика
2. Локальная админка для редактирования JSON-контента

Система работает только локально на этапе редактирования. Продовый сайт продолжает жить как обычный статический Quartz-сайт: данные меняются в репозитории, затем коммитятся, пушатся и попадают в прод через обычную сборку.

---

## Общая архитектура

### Главная идея

Quartz рендерит главную страницу статически из `quartz/static/data/home.json`.

После загрузки страницы клиентский скрипт:

1. определяет нужную категорию контента
2. загружает JSON-вариант из `quartz/static/data/`
3. при необходимости объединяет его с `default` через `extends`
4. подменяет тексты и списки в DOM

### Что это даёт

- SEO-контент остаётся в дефолтной SSG-версии
- для разных источников трафика можно показывать разные тексты
- контент редактируется без правки компонентов
- новые категории можно добавлять без изменения кода компонентов

---

## Какие файлы участвуют

### Данные главной страницы

- `quartz/static/data/home.json`
- `quartz/static/data/home.telegram.json`
- `quartz/static/data/home.google.json`
- `quartz/static/data/home.vk.json`
- `quartz/static/data/home.ad.json`

### Маршрутизация и метаданные

- `quartz/static/data/multicontent-rules.json`
- `quartz/static/data/multicontent-meta.json`

### Данные страницы контактов

- `quartz/static/data/contacts.json`

### Runtime-скрипт главной

- `content/images/Prodject/home.js`

### Компоненты главной с `data-*` привязками

- `quartz/components/LandingHero.tsx`
- `quartz/components/FocusGrid.tsx`
- `quartz/components/ServicesGrid.tsx`
- `quartz/components/FaqSection.tsx`
- `quartz/components/ContactCta.tsx`

### Локальная админка

- `tools/multicontent-admin/server.ts`
- `tools/multicontent-admin/client/index.html`
- `tools/multicontent-admin/client/multicontent-admin.js`
- `tools/multicontent-admin/client/multicontent-admin.css`

---

## Как работает мультиконтент главной

## Источник данных

Теперь runtime главной берёт данные из `/static/data/`, а не из старого `content/images/Prodject/data.json`.

Базовый контент:

- `/static/data/home.json`

Варианты:

- `/static/data/home.telegram.json`
- `/static/data/home.google.json`
- `/static/data/home.vk.json`
- `/static/data/home.ad.json`

## Как определяется категория

Логика находится в `content/images/Prodject/home.js`.

Порядок выбора:

1. `_mc_preview`
2. правила из `multicontent-rules.json`
3. сохранённый first touch в `localStorage`
4. `defaultCategory`

### Preview

Параметр:

```text
/?_mc_preview=telegram
```

Preview:

- принудительно показывает нужную категорию
- не пишет `localStorage`
- не должен использоваться для аналитики

### First Touch

Ключ:

```text
mc_first_touch
```

Сохраняется только вне preview-режима.

## Как работают rules

Файл:

`quartz/static/data/multicontent-rules.json`

Поддерживаются правила двух типов:

- `utm`
- `referrer`

Пример:

```json
{
  "defaultCategory": "default",
  "rules": [
    {
      "priority": 1,
      "type": "utm",
      "param": "utm_source",
      "match": "telegram",
      "category": "telegram"
    },
    { "priority": 2, "type": "referrer", "match": "google\\.", "category": "google" }
  ]
}
```

Правила сортируются по `priority`.

---

## Как работает `extends`

Каждый variant JSON может быть полным или частичным.

Пример:

```json
{
  "schemaVersion": 1,
  "extends": "default",
  "hero": {
    "title": "Telegram Mini Apps и боты под задачи вашего бизнеса"
  }
}
```

### Правила merge

- базовая категория обычно `default`
- `extends` может ссылаться на другую категорию
- объекты merge'ятся по ключам
- массивы заменяются целиком
- поэлементного merge массивов нет

Это значит:

- `hero.tags` заменяются полностью
- `focus.cards` заменяются полностью
- `services.items` заменяются полностью
- `faq.items` заменяются полностью

---

## Что именно подменяется на главной

Runtime меняет:

- Hero badge
- Hero title, включая `titleParts` и `accent`
- Hero subtitle
- Hero tags
- Hero benefits
- Hero SLA
- Hero dashboard visual: tabs, metrics, integrations, automations, sideCards
- Hero CTA texts
- Focus index/title/cards
- Services index/title/items
- FAQ index/title/items
- Contact CTA title/subtitle/button/note

Подмена идёт через:

- `data-home-text`
- `data-home-hero-title`
- `data-home-hero-tags`
- `data-home-hero-benefits`
- `data-home-hero-visual`
- `data-home-hero-visual-tabs`
- `data-home-hero-visual-metrics`
- `data-home-hero-visual-integrations`
- `data-home-hero-visual-automations`
- `data-home-hero-side-cards`
- `data-home-focus-list`
- `data-home-services-list`
- `data-home-faq-list`
- `data-home-contact-callback-aria`

---

## Компоненты и их роль

## `LandingHero.tsx`

Рендерит Hero и отдаёт в DOM:

- `data-home-text="hero.title"`
- `data-home-text="hero.subtitle"`
- `data-home-text="hero.primaryAction"`
- `data-home-text="hero.secondaryAction"`
- `data-home-hero-tags`

## `FocusGrid.tsx`

Рендерит:

- `data-home-text="focus.index"`
- `data-home-text="focus.title"`
- `data-home-focus-list`

## `ServicesGrid.tsx`

Рендерит:

- `data-home-text="services.index"`
- `data-home-text="services.title"`
- `data-home-services-list`

## `FaqSection.tsx`

Рендерит:

- `data-home-text="faq.index"`
- `data-home-text="faq.title"`
- `data-home-faq-list`

## `ContactCta.tsx`

Рендерит:

- `data-home-text="contact.title"`
- `data-home-text="contact.subtitle"`
- `data-home-text="contact.callbackTitle"`
- `data-home-text="contact.callbackDesc"`
- `data-home-text="contact.callbackButton"`
- `data-home-text="contact.note"`
- `data-home-contact-callback-aria`

---

## Локальная админка

## Зачем она нужна

Админка нужна, чтобы редактировать JSON-файлы без ручного открытия каждого файла.

Она работает только локально и не публикуется на прод.

## Почему есть Node helper

Браузерный JS не может просто так перезаписывать файлы репозитория.

Поэтому используется локальный сервер `tools/multicontent-admin/server.ts`, который:

- читает JSON-файлы
- валидирует данные
- пишет JSON обратно на диск
- не даёт писать вне `quartz/static/data/`

Это не продовый backend, а локальный инструмент.

## Что редактирует админка

### Главная

- `home.json`

### Контакты

- `contacts.json`

### Категории

- `home.<slug>.json`

### Правила

- `multicontent-rules.json`

### Метаданные категорий

- `multicontent-meta.json`

---

## Вкладки админки

## 1. Главная

Редактор `home.json`.

Можно менять:

- Hero: badge, titleParts/accent, subtitle, tags, benefits, SLA, dashboard visual и CTA
- Focus
- Services
- Works / Кейсы
- FAQ
- Contact CTA

## 2. Контакты

Редактор `contacts.json`.

Можно менять:

- Hero
- быстрые контакты
- workflow
- formats
- FAQ
- CTA

## 3. Категории

Работа с вариантами контента.

Можно:

- создать новую категорию
- выбрать базу для копирования
- редактировать category label
- менять `extends`
- редактировать контент категории
- открыть preview
- удалить категорию

## 4. Правила

Редактор `multicontent-rules.json`.

Можно:

- менять `defaultCategory`
- добавлять правила
- менять `priority`
- менять `type`
- менять `param`
- менять `match`
- выбирать target category

---

## Как создаётся новая категория

При создании категории:

1. вводится `slug`
2. вводится label
3. выбирается источник для копирования
4. сервер создаёт `home.<slug>.json`
5. сервер обновляет `multicontent-meta.json`

### Ограничения

- `slug` только `a-z`, `0-9`, `-`
- `default` создавать нельзя
- `default` удалять нельзя
- категория не может `extends` саму себя
- категорию нельзя удалить, если на неё ссылаются rules

---

## Валидация

Валидация находится в `tools/multicontent-admin/server.ts`.

Проверяется:

- структура `home.json`
- структура `contacts.json`
- структура частичных variant JSON
- корректность `multicontent-rules.json`
- существование категорий, на которые ссылаются rules
- существование `defaultCategory`
- корректность `slug`

### Важное различие

`home.json` валидируется как полный документ.

`home.<slug>.json` валидируется как partial override:

- секция может отсутствовать
- если секция есть, её поля должны быть валидными

---

## API локальной админки

## Чтение

- `GET /api/state`

Возвращает:

- `home`
- `contacts`
- `rules`
- `meta`
- `categories`
- `variants`
- `previewBaseUrl`

## Сохранение

- `POST /api/home/save`
- `POST /api/contacts/save`
- `POST /api/rules/save`
- `POST /api/categories/create`
- `POST /api/categories/save`
- `POST /api/categories/delete`

---

## Локальный workflow

## Запуск

### Сайт

```bash
npm run site:dev
```

Поднимает Quartz preview на `http://localhost:8080`.

### Админка

```bash
npm run multicontent-admin
```

Поднимает локальную админку на `http://localhost:3100`.

## Рабочий процесс

1. Запустить `npm run site:dev`
2. Запустить `npm run multicontent-admin`
3. Открыть `http://localhost:3100`
4. Изменить контент
5. Нажать `Сохранить`
6. Проверить локальный preview
7. Закоммитить изменения
8. Запушить в GitHub
9. Прод соберётся как обычно

---

## Preview сценарии

### Дефолтная главная

```text
http://localhost:8080/
```

### Принудительный preview категории

```text
http://localhost:8080/?_mc_preview=telegram
http://localhost:8080/?_mc_preview=google
http://localhost:8080/?_mc_preview=vk
http://localhost:8080/?_mc_preview=ad
```

### Страница контактов

```text
http://localhost:8080/Кoнтакты
```

---

## Текущее ограничение системы

### 1. Мультиконтент сейчас реализован только для главной

Контакты редактируются через админку, но не переключаются по источнику трафика.

### 2. Админка локальная

В проде нет публичного UI для редактирования.

### 3. Аналитика пока базовая

В runtime есть вызов `plausible('multicontent-variant', ...)`, но полноценная схема событий под Яндекс Метрику ещё не подключена.

### 4. Preview рассчитан на локальную разработку

Базовый URL preview берётся из:

```text
MULTICONTENT_PREVIEW_BASE_URL
```

По умолчанию:

```text
http://localhost:8080
```

---

## Что можно развивать дальше

### Ближайшие улучшения

- добавить события Яндекс Метрики
- добавить явные CTA events
- добавить кнопку дублирования категории в UI
- добавить экспорт/import JSON из админки
- добавить просмотр raw JSON в админке
- добавить клиентские предупреждения о несохранённых изменениях

### Более поздние улучшения

- поддержка мультиконтента и для страницы контактов
- визуальное сравнение `default` и category override
- history/log последних изменений
- JSON schema как отдельный слой валидации

---

## Краткая карта файлов

### Runtime

- `content/images/Prodject/home.js`

### Главная

- `quartz/static/data/home.json`
- `quartz/static/data/home.*.json`

### Контакты

- `quartz/static/data/contacts.json`

### Rules и meta

- `quartz/static/data/multicontent-rules.json`
- `quartz/static/data/multicontent-meta.json`

### Админка

- `tools/multicontent-admin/server.ts`
- `tools/multicontent-admin/client/index.html`
- `tools/multicontent-admin/client/multicontent-admin.js`
- `tools/multicontent-admin/client/multicontent-admin.css`

### Команды

- `npm run site:dev`
- `npm run multicontent-admin`
- `npm run check`
