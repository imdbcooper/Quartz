# Мультиконтент главной страницы по источнику трафика

> **Статус:** Реализовано и актуализировано после hero dashboard / runtime multicontent
> **Ветка:** `refactor/landing-components`
> **Дата:** 2026-04-13
> **Актуализация:** 2026-05-05

---

## Проблема

Сейчас главная страница (`index`) показывает **один и тот же контент** всем посетителям, независимо от того, откуда они пришли.

## Цель

Показывать **разный контент** (Hero, Focus Cards, Services, FAQ, CTA) в зависимости от источника трафика: Telegram, Google, VK, рекламные кампании, прямой заход.

---

## Текущая архитектура (ветка refactor/landing-components)

### Источники данных

- `quartz/static/data/home.json` — импортируется на этапе SSG в `quartz.layout.ts`
- `content/images/Prodject/data.json` — загружается клиентски через `content/images/Prodject/home.js`

### Ключевые компоненты

| Компонент    | Файл                                 | data-\* атрибуты                                                                                                        |
| ------------ | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| LandingHero  | `quartz/components/LandingHero.tsx`  | `data-home-text`, `data-home-hero-title`, `data-home-hero-tags`, `data-home-hero-benefits`, `data-home-hero-visual*` ✅ |
| FocusGrid    | `quartz/components/FocusGrid.tsx`    | `data-home-focus-list` ✅                                                                                               |
| ServicesGrid | `quartz/components/ServicesGrid.tsx` | `data-home-services-list` ✅                                                                                            |
| FaqSection   | `quartz/components/FaqSection.tsx`   | `data-home-faq-list`, `data-faq-title`, `data-faq-answer` ✅                                                            |
| ContactCta   | `quartz/components/ContactCta.tsx`   | `data-home-text`, `data-home-contact-callback-aria` ✅                                                                  |

### Условный рендеринг

`ConditionalRender.tsx` + `LandingContainer.tsx` — лендинг показывается только для slug `index`.

---

## Как определяется источник трафика

| Метод                         | Что определяет                          | Пример                                 |
| ----------------------------- | --------------------------------------- | -------------------------------------- |
| UTM-метки (`?utm_source=...`) | Рекламные кампании, партнёрки           | `?utm_source=telegram&utm_medium=post` |
| `document.referrer`           | Откуда пришёл пользователь              | `google.com`, `t.me`, `vk.com`         |
| `localStorage`                | Запомнить первый источник (First Touch) | —                                      |

---

## Выбранный вариант: A — Клиентский

### Почему именно A

- **Quartz = статический генератор** — нет сервера, нельзя делать серверный редирект без Edge Worker
- **`home.js` уже существует** — клиентская загрузка данных из JSON уже реализована (`loadHomeContent()`)
- **Часть `data-*` атрибутов уже есть** — подмена DOM через ServicesGrid и FaqSection уже работает
- **Минимум изменений** — расширяем то, что есть, вместо создания новой инфраструктуры

### Как это работает

1. SSG генерирует **одну** HTML-страницу с дефолтным контентом (SEO-контент)
2. Клиентский скрипт при загрузке определяет источник трафика
3. Если источник ≠ default → подгружает **альтернативный JSON** и заменяет контент через DOM API
4. Источник сохраняется в `localStorage` (First Touch Attribution)

### Что безопасно менять клиентски (без вреда для SEO)

- ✅ Заголовок Hero (H2), включая `titleParts` и `accent`
- ✅ Badge, подзаголовок и описательный текст
- ✅ Теги-капсулы и benefits
- ✅ SLA-строку
- ✅ Hero dashboard visual: tabs, metrics, integrations, automations, sideCards
- ✅ Focus Cards (набор и содержание)
- ✅ Services Chips
- ✅ FAQ вопросы/ответы
- ✅ CTA-текст

### Что НЕ менять клиентски (cloaking risk)

- ❌ `<title>` и `<meta description>`
- ❌ `<h1>` (если есть)
- ❌ Структурные данные (Schema.org)

---

## Структура файлов

### Новые JSON-варианты

```
quartz/static/data/
  home.json              ← дефолтный (для прямого захода + SEO-краулеры)
  home.telegram.json     ← акцент на Telegram Mini Apps и ботов
  home.google.json       ← акцент на автоматизацию, структурность, SEO-ключевики
  home.vk.json           ← акцент на MVP и быстрый старт
  home.ad.json           ← акцент на ROI, результаты, фиксированные сроки
```

Каждый JSON имеет **ту же структуру**, что и `home.json`, но с другими текстами.

Допустимы частичные переопределения, но они работают по явным правилам:

- базовый источник для всех категорий по умолчанию: `default`
- каждая категория может иметь `extends`
- отсутствующие поля берутся из базовой категории
- массивы (`tags`, `cards`, `items`, `faq.items`) **не merge'ятся поэлементно**, а заменяются целиком
- объекты merge'ятся по ключам

Это важно зафиксировать заранее, чтобы поведение редактора и рантайма совпадало.

### Пример структуры варианта

```json
{
  "schemaVersion": 1,
  "extends": "default",
  "hero": {
    "title": "Telegram Mini Apps и боты под задачи вашего бизнеса",
    "badge": "Telegram-продукты для продаж",
    "titleParts": [
      { "text": "Запускаю Telegram Mini Apps, которые " },
      { "text": "принимают заявки", "accent": true },
      { "text": " и автоматизируют продажи" }
    ],
    "subtitle": "Каталоги, кабинеты, заявки — всё внутри Telegram",
    "tags": ["Mini Apps", "Telegram-боты", "Автоматизация в TG"],
    "benefits": [{ "icon": "send", "text": "Заявки внутри Telegram" }],
    "sla": "Ответ в течение дня",
    "visual": {
      "title": "Панель Telegram-продаж",
      "tabs": ["Leads", "Orders", "CRM"],
      "metrics": [{ "label": "Заявки", "value": "+24%", "tone": "green" }],
      "integrations": [{ "label": "Telegram", "icon": "send" }],
      "automations": [{ "label": "Заявка → CRM", "value": "Live", "status": "Активно" }],
      "sideCards": [{ "title": "Быстрый старт", "text": "MVP без лишних экранов" }]
    }
  },
  "focus": {
    "index": "01 / Какие задачи решаю в Telegram",
    "cards": [...]
  },
  "services": { ... },
  "faq": { ... },
  "contact": {
    "title": "Обсудим бота для вашего бизнеса?",
    "subtitle": "..."
  }
}
```

---

## Логика определения источника

```javascript
function detectTrafficSource() {
  // 1. Проверяем localStorage (First Touch)
  const saved = localStorage.getItem("traffic_source")
  if (saved) return saved

  const params = new URLSearchParams(location.search)
  const utm = params.get("utm_source")
  const ref = document.referrer
  let source = "default"

  // 2. UTM-метки (приоритет)
  if (utm === "telegram") source = "telegram"
  else if (utm === "vk") source = "vk"
  else if (utm === "google_ads" || utm === "yandex_ads") source = "ad"
  // 3. Referrer
  else if (ref.includes("t.me") || ref.includes("telegram")) source = "telegram"
  else if (ref.includes("google.")) source = "google"
  else if (ref.includes("vk.com")) source = "vk"
  else if (ref.includes("yandex.")) source = "google" // yandex → тот же вариант

  // 4. Сохраняем First Touch
  if (source !== "default") {
    localStorage.setItem("traffic_source", source)
  }

  return source
}
```

---

## Файлы для изменения

| Файл                                    | Действие | Что делать                                                                 |
| --------------------------------------- | -------- | -------------------------------------------------------------------------- |
| `quartz/static/data/home.telegram.json` | **NEW**  | Вариант для Telegram-трафика                                               |
| `quartz/static/data/home.google.json`   | **NEW**  | Вариант для поискового трафика                                             |
| `quartz/static/data/home.vk.json`       | **NEW**  | Вариант для VK-трафика                                                     |
| `quartz/static/data/home.ad.json`       | **NEW**  | Вариант для рекламного трафика                                             |
| `content/images/Prodject/home.js`       | **DONE** | Определение категории, preview, inheritance/merge и runtime-подмена блоков |
| `quartz/components/LandingHero.tsx`     | **DONE** | `data-*` атрибуты для titleParts, tags, benefits, CTA и dashboard visual   |
| `quartz/components/FocusGrid.tsx`       | **DONE** | `data-home-focus-list` для замены карточек                                 |
| `quartz/components/ContactCta.tsx`      | **DONE** | `data-*` для замены текста CTA                                             |

---

## Аналитика

```javascript
// Plausible custom event для отслеживания эффективности вариантов
if (window.plausible) {
  plausible("multicontent-variant", {
    props: {
      source: detectedSource,
      variant: variantFile,
    },
  })
}
```

Позволит увидеть в Plausible:

- Какой вариант показывается чаще
- Конверсии (клик по CTA) по вариантам
- Bounce rate по источникам

---

## Локальная панель управления мультиконтентом

### Концепция

Отдельная **локальная** страница-панель для управления контентом главной страницы, страницы контактов и вариантами мультиконтента.

Панель **не публикуется в прод** и используется только на локальной машине. Она работает через небольшой Node helper, который:

- читает JSON-файлы из репозитория
- валидирует изменения
- записывает JSON обратно на диск

После локального редактирования workflow остаётся обычным:

1. Изменить контент через админку
2. Проверить локально через Quartz
3. Закоммитить и запушить изменения
4. Прод собирается как обычно через git-based deploy

### Базовые принципы модели данных

Нужно разделить две независимые сущности:

1. **Категория контента**
   Это контентный вариант: `default`, `telegram`, `google`, `vk`, `ad`, `instagram` и т.д.

2. **Правило маршрутизации трафика**
   Это правило, которое говорит какой источник трафика маппится на какую категорию.

Пример:

- категория `instagram` может существовать без активных правил
- несколько разных правил могут вести в одну категорию `ad`
- создание категории не обязано автоматически создавать правило

Так админка остаётся предсказуемой и не смешивает контент и аналитику.

### Где живёт панель

```
tools/multicontent-admin/
  server.ts                       ← локальный Node helper для чтения/записи JSON
  client/
    index.html                    ← локальная админка
    multicontent-admin.js         ← логика панели
    multicontent-admin.css        ← стили панели
```

Доступ: локально, например `http://localhost:3100`.

В прод админка отсутствует полностью.

### Функциональность

#### 1. Редактирование контента страниц

Панель редактирует только JSON-контент, который уже используется компонентами:

| Страница                | Файл                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------- |
| Главная                 | `quartz/static/data/home.json`                                                              |
| Контакты                | `quartz/static/data/contacts.json`                                                          |
| Варианты мультиконтента | `quartz/static/data/home.telegram.json`, `home.google.json`, `home.vk.json`, `home.ad.json` |

UI панели должен быть разделён минимум на вкладки:

- `Главная`
- `Контакты`
- `Правила`

Отдельная вкладка `Категории` в текущей реализации заменена выбором категории в шапке админки: там же создаются, переключаются и удаляются варианты.

Это удобнее, чем один общий экран, потому что `home.json` и `contacts.json` относятся к разным страницам и не должны смешиваться в одном редакторе.

#### 2. Управление категориями трафика

| Действие                  | Описание                                                                             |
| ------------------------- | ------------------------------------------------------------------------------------ |
| **Список категорий**      | Таблица всех активных категорий: `telegram`, `google`, `vk`, `ad`, `default`         |
| **Создать категорию**     | Ввести имя (например `instagram`), создаётся новый JSON-вариант на основе дефолтного |
| **Удалить категорию**     | Удаление JSON-варианта (с подтверждением)                                            |
| **Дублировать категорию** | Копирование существующего варианта как основу для нового                             |

Правила для категорий:

- `default` нельзя удалить
- `default` нельзя переименовать
- имя категории хранится как `slug`
- допустимый формат `slug`: только `a-z`, `0-9`, `-`
- категории с одинаковым `slug` запрещены
- при создании новой категории по умолчанию ставится `extends: "default"`

#### 3. Правила маппинга трафика

Редактор правил «источник → категория»:

```
┌─────────────────────────────────────────────────────────┐
│  Правила определения источника трафика                  │
├──────────┬──────────────┬───────────────────────────────┤
│ Приоритет│ Тип          │ Правило → Категория           │
├──────────┼──────────────┼───────────────────────────────┤
│ 1        │ UTM          │ utm_source=telegram → telegram│
│ 2        │ UTM          │ utm_source=vk → vk            │
│ 3        │ UTM          │ utm_source=google_ads → ad    │
│ 4        │ Referrer     │ t.me, telegram.org → telegram │
│ 5        │ Referrer     │ google.* → google             │
│ 6        │ Referrer     │ vk.com → vk                   │
│ 7        │ Referrer     │ yandex.* → google             │
│ 8        │ Fallback     │ (всё остальное) → default     │
│          │              │                    [+ Правило] │
└──────────────────────────────────────────────────────────┘
```

Правила сохраняются в отдельный JSON:

```
quartz/static/data/multicontent-rules.json
```

```json
{
  "rules": [
    {
      "priority": 1,
      "type": "utm",
      "param": "utm_source",
      "match": "telegram",
      "category": "telegram"
    },
    { "priority": 2, "type": "utm", "param": "utm_source", "match": "vk", "category": "vk" },
    {
      "priority": 3,
      "type": "utm",
      "param": "utm_source",
      "match": "google_ads",
      "category": "ad"
    },
    { "priority": 4, "type": "referrer", "match": "t.me|telegram", "category": "telegram" },
    { "priority": 5, "type": "referrer", "match": "google\\.", "category": "google" },
    { "priority": 6, "type": "referrer", "match": "vk\\.com", "category": "vk" },
    { "priority": 7, "type": "referrer", "match": "yandex\\.", "category": "google" }
  ],
  "defaultCategory": "default"
}
```

Важно:

- правило и категория не одно и то же
- одна категория может использоваться несколькими правилами
- удаление категории должно быть запрещено, если на неё всё ещё ссылаются правила
- `defaultCategory` обязана всегда существовать

#### 4. Редактор контента варианта

Посекционный редактор для каждой категории:

```
┌─────────────────────────────────────────────────────────┐
│  Редактирование: telegram                    [Сохранить]│
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ▼ Hero                                                 │
│  ┌───────────────────────────────────────────────┐      │
│  │ Badge: [Telegram-продукты для продаж]          │      │
│  │ Title parts: [Запускаю...] [принимают заявки] │      │
│  │ Подзаголовок: [Каталоги, кабинеты, заявки...] │      │
│  │ Tags / Benefits / SLA / Dashboard visual      │      │
│  └───────────────────────────────────────────────┘      │
│                                                         │
│  ▼ Focus Cards                                          │
│  ┌───────────────────────────────────────────────┐      │
│  │ Карточка 1: [Нужен бот для приёма заявок]     │      │
│  │   Иконка: [send]  Вариант: [blue ▼]          │      │
│  │   Описание: [Запускаю Telegram-ботов...]      │      │
│  │   Результат: [Бот работает 24/7...]           │      │
│  │ [+ Добавить карточку]                         │      │
│  └───────────────────────────────────────────────┘      │
│                                                         │
│  ▼ Services                                             │
│  ▼ FAQ                                                  │
│  ▼ Contact CTA                                          │
│                                                         │
│  ☐ Наследовать отсутствующие секции из default          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

Дополнительно:

- редактор должен показывать, какая категория является базовой (`extends`)
- для массивов должно быть явно видно, что они заменяются целиком
- перед сохранением запускается локальная валидация структуры
- если обязательные поля пустые, сохранение блокируется

#### 5. Предпросмотр

Кнопка **«Предпросмотр»** открывает главную страницу с принудительным вариантом:

```
slavx.ru/?_mc_preview=telegram
```

Параметр `_mc_preview` обходит `localStorage` и `referrer` — всегда показывает указанный вариант. Работает только для предпросмотра, не сохраняет First Touch.

Дополнительные правила preview:

- preview не должен менять `localStorage`
- preview не должен отправлять события аналитики
- preview должен быть явно помечен в UI панели как тестовый режим

#### 6. Статистика (если Plausible API доступен)

Мини-дашборд с данными из Plausible:

- Сколько показов каждого варианта
- CTR по вариантам (клик на CTA)
- Топ источников трафика

> **Опционально** — зависит от доступности Plausible API. Если API недоступен, секция скрыта.

### Технические решения

#### Почему нужен Node helper

Браузерная админка сама по себе не может надёжно перезаписывать JSON-файлы репозитория. Поэтому сохранение делает локальный Node helper.

Его задачи:

- `GET` читать текущие JSON-файлы
- `POST` сохранять изменения в нужный файл
- проверять допустимые пути записи
- валидировать JSON-структуру перед сохранением
- при желании прогонять форматирование после записи

Минимальная валидация на сохранении:

- `schemaVersion` обязателен
- `extends` должен ссылаться на существующую категорию
- обязательные секции страницы должны существовать
- запрещены неизвестные пути записи вне `quartz/static/data/`
- запрещено удаление `default`
- запрещено сохранение правил, которые ссылаются на несуществующую категорию

Это **не отдельный продовый backend**, а только локальный инструмент для удобного редактирования.

#### Хранение данных

Поскольку Quartz — статический генератор, панель управления работает только локально:

- панель читает и редактирует JSON из репозитория
- Node helper записывает файлы обратно в `quartz/static/data/`
- после этого Quartz локально показывает обновлённый контент
- затем изменения коммитятся и пушатся в git

Продовый сайт продолжает получать контент только через сборку.

#### Формат файлов панели

```
quartz/static/data/
  home.json                   ← дефолтный (не редактируется через панель)
  home.telegram.json          ← варианты (редактируются через панель)
  home.google.json
  home.vk.json
  home.ad.json
  multicontent-rules.json     ← правила маппинга
  multicontent-meta.json      ← метаданные (когда создан, кем изменён)
```

`multicontent-meta.json`:

```json
{
  "categories": {
    "default": {
      "created": "2026-04-13",
      "modified": "2026-04-13",
      "label": "Дефолтный контент",
      "system": true
    },
    "telegram": {
      "created": "2026-04-13",
      "modified": "2026-04-13",
      "label": "Трафик из Telegram",
      "extends": "default"
    },
    "google": {
      "created": "2026-04-13",
      "modified": "2026-04-13",
      "label": "Поисковый трафик",
      "extends": "default"
    },
    "vk": {
      "created": "2026-04-13",
      "modified": "2026-04-13",
      "label": "Трафик из VK",
      "extends": "default"
    },
    "ad": {
      "created": "2026-04-13",
      "modified": "2026-04-13",
      "label": "Рекламный трафик",
      "extends": "default"
    }
  }
}
```

### Файлы для панели управления

| Файл                                                     | Действие | Описание                                                 |
| -------------------------------------------------------- | -------- | -------------------------------------------------------- |
| `tools/multicontent-admin/server.ts`                     | **DONE** | Локальный Node helper для чтения/записи JSON             |
| `tools/multicontent-admin/client/index.html`             | **DONE** | HTML локальной админки                                   |
| `tools/multicontent-admin/client/multicontent-admin.js`  | **DONE** | Логика панели: категории в шапке, редактор, предпросмотр |
| `tools/multicontent-admin/client/multicontent-admin.css` | **DONE** | Стили панели                                             |
| `quartz/static/data/multicontent-rules.json`             | **DONE** | Правила маппинга источник → категория                    |
| `quartz/static/data/multicontent-meta.json`              | **DONE** | Метаданные категорий                                     |

---

## Порядок реализации

### Этап 1: Ядро мультиконтента

1. Создать JSON-варианты (`home.telegram.json`, `home.google.json`, `home.vk.json`, `home.ad.json`)
2. Создать `multicontent-rules.json` с правилами маппинга
3. Зафиксировать merge-правила для `extends` и partial override
4. Добавить `data-*` атрибуты в `LandingHero.tsx`, `FocusGrid.tsx`, `ContactCta.tsx`
5. Расширить `home.js`: загрузка правил из `multicontent-rules.json`, определение источника, загрузка альтернативного JSON, подмена DOM
6. Добавить поддержку `?_mc_preview=` параметра для предпросмотра
7. Добавить First Touch сохранение в `localStorage`
8. Исключить preview-режим из аналитики
9. Добавить Plausible tracking event

### Этап 2: Панель управления

10. Создать локальный Node helper `tools/multicontent-admin/server.ts`
11. Реализовать API чтения/записи JSON для `home`, `contacts`, вариантов и правил
12. Добавить серверную валидацию и защиту допустимых путей записи
13. Создать локальную админку `tools/multicontent-admin/client/*`
14. Реализовать вкладки `Главная`, `Контакты`, `Правила` и управление категориями в шапке
15. Реализовать список категорий + CRUD с защитой `default`
16. Реализовать редактор правил маппинга
17. Реализовать посекционный редактор контента для главной и контактов
18. Реализовать предпросмотр (ссылка с `?_mc_preview=`)

### Этап 3: Тестирование и аналитика

19. Протестировать с `?utm_source=telegram`, `?utm_source=vk` и т.д.
20. Проверить preview: не пишет `localStorage`, не шлёт аналитику
21. Проверить блокировки: нельзя удалить `default`, нельзя сохранить битые rules
22. Проверить локальный workflow: сохранить → проверить → commit/push
23. Проверить Lighthouse SEO-оценку
24. Подключить мини-дашборд Plausible (опционально)

---

## Открытые вопросы

1. **Какие источники трафика сейчас основные?** (из Plausible) — определяет приоритет создания вариантов
2. **Какой контент менять между вариантами?** Только Hero? Или также Focus, Services, FAQ?
3. **Нужен ли вариант для Yandex отдельно от Google?** Сейчас предлагаю объединить
4. **Сколько вариантов нужно на старте?** Можно начать с 2 (telegram + default) и расширять
5. **Какие файлы доступны для редактирования в v1?** Предлагаю только `home.json`, `contacts.json`, варианты `home.*.json` и `multicontent-rules.json`
6. **Нужен ли редактор `contacts.json` сразу в первой версии?** Или сначала только главная + варианты
7. **Как запускать локальную админку?** Отдельной командой (`npm run multicontent-admin`) или вместе с Quartz dev-процессом
