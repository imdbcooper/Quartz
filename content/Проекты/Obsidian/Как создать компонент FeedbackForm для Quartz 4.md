---
publish: true
title: Как создать компонент FeedbackForm для Quartz 4
description: Пошаговый гайд по созданию компонента FeedbackForm и подключению его на страницах Quartz.
created: 2026-01-15
modified: 2026-01-15T20:21:03.521+03:00
tags:
  - tutorial
  - Quartz
  - components
  - obsidian
cssclasses: ""
draft: false
---

Ниже — рабочая схема создания компонента на основе FeedbackForm. Вы получите:

- TSX-компонент
- Клиентский скрипт (`.inline.ts`)
- SCSS-стили
- Подключение в layout
- Использование в контенте через HTML
- Настройку через JSON

---

## 1. Создайте компонент TSX

Файл: `quartz/components/FeedbackForm.tsx`

```tsx
import { QuartzComponent, QuartzComponentConstructor } from "./types"
import style from "./styles/feedbackForm.scss"
// @ts-ignore
import script from "./scripts/feedbackForm.inline"

const FeedbackForm: QuartzComponent = () => {
  return <div class="feedback-form-resources" aria-hidden="true"></div>
}

FeedbackForm.css = style
FeedbackForm.afterDOMLoaded = script

export default (() => FeedbackForm) satisfies QuartzComponentConstructor
```

Идея простая: компонент подключает стили и клиентский скрипт, а сам DOM собирается уже в браузере.

---

## 2. Создайте клиентский скрипт

Файл: `quartz/components/scripts/feedbackForm.inline.ts`

Внутри:

- ищем элементы формы на странице
- читаем JSON-конфиг
- строим поля
- отправляем JSON на `action`

Важно: Quartz использует SPA-навигацию, поэтому нужно подписаться на событие `nav`.

```ts
document.addEventListener("nav", mountForms)
mountForms()
```

Именно так форма “перерисовывается” при переходах без перезагрузки.

---

## 3. Добавьте стили

Файл: `quartz/components/styles/feedbackForm.scss`

Здесь описываются:

- карточка формы
- поля ввода
- группы чекбоксов/радио
- кнопки и статусы

SCSS подключается через `FeedbackForm.css = style`.

---

## 4. Экспортируйте компонент

Файл: `quartz/components/index.ts`

```ts
import FeedbackForm from "./FeedbackForm"

export {
  // ...
  FeedbackForm,
}
```

---

## 5. Подключите компонент в layout

Файл: `quartz.layout.ts`

Чтобы скрипт и стили работали на всех страницах:

```ts
export const sharedPageComponents: SharedLayout = {
  // ...
  afterBody: [Component.ServicesCarousel(), Component.FeedbackForm()],
}
```

Если нужен компонент только на отдельных страницах — можно добавить его в конкретный layout или через `ConditionalRender`.

---

## 6. Используйте компонент в контенте

Quartz не всегда корректно обрабатывает кастомный HTML-тег, поэтому используем `div`:

```html
<div class="feedback-form" data-source="/static/data/feedback-form.json"></div>
```

Это надежный способ, который гарантированно не экранируется в Markdown.

---

## 7. Настройка через JSON

Конфиг лежит в `quartz/static/data/` и подтягивается через `data-source`.

Пример:

```json
{
  "title": "Форма обратной связи",
  "subtitle": "Коротко, по делу. Я свяжусь с вами.",
  "action": "https://app.slavx.ru/api/v1/f/12a7dd50d5c0",
  "method": "POST",
  "submitLabel": "Отправить",
  "privacyNote": "Без спама",
  "fields": [
    {
      "type": "text",
      "name": "name",
      "placeholder": "Имя / компания",
      "required": true,
      "layout": "two-columns"
    },
    { "type": "email", "name": "email", "placeholder": "Почта", "required": true },
    {
      "type": "textarea",
      "name": "message",
      "placeholder": "Сообщение",
      "required": true,
      "rows": 5
    }
  ]
}
```

Форма отправляет JSON-пayload и показывает статус прямо в карточке.

---

## 8. Разъяснения полей (JSON)

Ниже — расшифровка параметров для `fields[]`:

- `type` — тип поля: `text`, `email`, `tel`, `textarea`, `select`, `checkbox`, `radio`, `range`, `hidden`.
- `name` — ключ, под которым поле уйдет в JSON-payload; обязателен для всех типов, иначе значение не попадет в отправку.
- `label` — текст подписи (для `checkbox`/`radio` это заголовок группы).
- `placeholder` — подсказка внутри поля (для `text`, `email`, `tel`, `textarea`).
- `required` — делает поле обязательным; для группы чекбоксов требуется выбрать минимум один.
- `value` — значение по умолчанию; важно для `hidden` и одиночного `checkbox`.
- `rows` — высота `textarea`.
- `options` — варианты для `select`, `checkbox`, `radio` (каждый вариант: `label`, `value`, `checked`).
- `multiple` — включает множественный выбор для `select`.
- `autocomplete` — HTML-атрибут автозаполнения.
- `help` — вспомогательный текст под полем.
- `min` — минимальное значение для `range`.
- `max` — максимальное значение для `range`.
- `step` — шаг изменения для `range`.
- `unit` — подпись справа от значения (например, `₽`).
- `showValue` — показывать значение у `range` (по умолчанию `true`).
- `layout` — специальный макет, `two-columns` автоматически группирует указанные поля в два столбца (подходит для контактных данных).

---

## 9. Поддерживаемые поля

`text`, `email`, `tel`, `textarea`, `select`, `checkbox`, `radio`, `range`, `hidden`.

Пример с выпадающим списком и чекбоксами:

```json
{
  "fields": [
    {
      "type": "select",
      "name": "service",
      "label": "Услуга",
      "required": true,
      "options": [
        { "label": "Аудит", "value": "audit" },
        { "label": "Разработка", "value": "dev" }
      ]
    },
    {
      "type": "checkbox",
      "name": "channels",
      "label": "Удобный канал",
      "required": true,
      "options": [
        { "label": "Telegram", "value": "telegram" },
        { "label": "Email", "value": "email" }
      ]
    },
    {
      "type": "radio",
      "name": "budget",
      "label": "Бюджет",
      "required": true,
      "options": [
        { "label": "до 50k", "value": "50k" },
        { "label": "50–200k", "value": "200k" }
      ]
    }
  ]
}
```

Пример со слайдером бюджета:

```json
{
  "fields": [
    {
      "type": "range",
      "name": "budget",
      "label": "Бюджет, ₽",
      "min": 50000,
      "max": 500000,
      "step": 25000,
      "value": 150000,
      "unit": "₽"
    }
  ]
}
```

Пример двухколоночной раскладки для контактных данных:

```json
{
  "fields": [
    {
      "type": "text",
      "name": "name",
      "label": "Имя",
      "placeholder": "Как к вам обращаться",
      "required": true,
      "layout": "two-columns"
    },
    {
      "type": "text",
      "name": "company",
      "label": "Компания",
      "placeholder": "Название компании",
      "layout": "two-columns"
    },
    {
      "type": "tel",
      "name": "phone",
      "label": "Телефон",
      "placeholder": "+7...",
      "layout": "two-columns"
    },
    {
      "type": "email",
      "name": "email",
      "label": "Email",
      "placeholder": "you@example.com",
      "required": true,
      "layout": "two-columns"
    }
  ]
}
```

---

## 10. Кнопки и дополнительные действия

Можно добавить свои кнопки и ссылки:

```json
{
  "actions": [
    { "type": "submit", "label": "Отправить" },
    {
      "type": "link",
      "label": "Написать в Telegram",
      "href": "https://t.me/your_handle",
      "variant": "secondary"
    }
  ]
}
```

---

## 11. Что отправляется на сервер

Форма отправляет JSON:

- `select` → строка (или массив при `multiple`)
- `checkbox` → массив выбранных значений
- `radio` → выбранное значение
- `hidden` → статическое значение
- `text/email/tel/textarea` → строка

Если `action` не задан — выводится ошибка. При успехе форма очищается.

---

## Итог

Так вы получаете компонент, который можно вставить на любую страницу, а его поведение настраивать только через JSON — без изменения кода.

- `layout` — не обязательная подсказка рендереру, `two-columns` помещает поля в двухколоночный контейнер (подходит для контактных данных).
