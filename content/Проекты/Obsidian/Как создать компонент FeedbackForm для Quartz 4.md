---
publish: true
title: "Как устроен компонент FeedbackForm для Quartz 4"
description: "Текущий подход к FeedbackForm в сайте Smirnoff: ресурсный placeholder, inline-скрипт, JSON-конфиг и связь с HomeCallback."
created: 2026-01-15
modified: 2026-06-04 02:45
tags:
  - blog
  - tutorial
cssclasses: ""
draft: false
preview_image: /images/quartz-feedback-form.png
---

# Как устроен FeedbackForm для Quartz 4

`FeedbackForm` в этом проекте не рендерит готовую форму прямо в TSX. Это важная деталь. Компонент работает как ресурсный placeholder: подключает стили и inline-скрипт, а реальный DOM формы создаётся уже в браузере по JSON-конфигу.

Такой подход удобен для Quartz со SPA-навигацией. Страница может меняться без полной перезагрузки, поэтому форма должна уметь монтироваться повторно после события `nav`.

## Компонент как placeholder

`quartz/components/FeedbackForm.tsx` устроен минимально:

```tsx
const FeedbackForm: QuartzComponent = () => {
  return <div class="feedback-form-resources" aria-hidden="true"></div>
}

FeedbackForm.css = style
FeedbackForm.afterDOMLoaded = script
```

На странице этот `div` сам по себе ничего не показывает. Его задача — протащить CSS и `feedbackForm.inline.ts` в ресурсы Quartz.

## Где создаётся настоящая форма

Настоящая форма создаётся в `quartz/components/scripts/feedbackForm.inline.ts`. Скрипт ищет элементы вида:

```html
<div class="feedback-form" data-source="/static/data/feedback-form.json"></div>
```

После этого он:

- загружает JSON из `data-source`;
- создаёт поля;
- валидирует обязательные значения;
- собирает JSON-payload;
- отправляет его на `action`;
- показывает статус отправки прямо в карточке.

Скрипт подписывается на SPA-событие `nav`, чтобы форма продолжала работать после внутренних переходов Quartz.

## Конфиг формы

Данные лежат в `quartz/static/data/feedback-form.json`. Сейчас это не абстрактная форма «напишите нам», а бриф на разработку:

- имя;
- компания;
- телефон;
- email;
- Telegram;
- тип услуги;
- scope работ;
- бюджет через range;
- сроки;
- материалы;
- описание задачи;
- согласие на обработку персональных данных.

`action` указывает на endpoint `https://app.slavx.ru/api/v1/f/12a7dd50d5c0`, метод — `POST`.

## Почему JSON, а не Markdown

Форма быстро становится неудобной, если описывать её в Markdown или HTML-вставках. JSON даёт нормальную структуру:

```json
{
  "type": "email",
  "name": "email",
  "label": "Email",
  "placeholder": "you@example.com",
  "required": true,
  "autocomplete": "email"
}
```

Так проще менять поля, порядок, варианты select/checkbox и обязательность. Код компонента при этом остаётся тем же.

## Подключение в layout

`FeedbackForm` подключён глобально в `sharedPageComponents.afterBody`:

```ts
afterBody: [
  Component.SiteGeometryBackground(siteGeometryBackgroundData),
  Component.ServicesCarousel(),
  Component.FeedbackForm(),
  Component.HomeCallback(),
  Component.CookieConsent(),
]
```

Это не значит, что форма видна на каждой странице. Глобально подключаются ресурсы. Конкретное место формы определяется HTML-placeholder в контенте или компоненте.

## Связь с HomeCallback

Рядом подключён `HomeCallback`. Он тоже выглядит как ресурсный компонент: отдаёт скрытый placeholder и подключает `homeCallback.inline.ts`. По смыслу это соседняя часть того же пользовательского сценария: CTA на главной или в лендинговых блоках открывает callback/brief-механику, а `FeedbackForm` отвечает за полноценную форму.

Поэтому при изменении формы нужно проверять не только `FeedbackForm`, но и кнопки, которые открывают или ведут к ней на главной и странице контактов.

## Юридические документы

В форме есть обязательное согласие на обработку персональных данных. Это не декоративный checkbox: он связан с юридической частью сайта. На лендинговых блоках также есть тексты и ссылки на legal-документы, например в contact CTA главной.

Если меняется текст согласия, privacy note или сценарий отправки, нужно сверять это с юридическими страницами сайта. Форма собирает персональные данные, значит текст должен быть не только красивым, но и аккуратным.

## Что менять на практике

Чаще всего правятся только данные:

- `title` и `subtitle` формы;
- набор `fields`;
- варианты `options`;
- `privacyNote`;
- `submitLabel`;
- endpoint `action`, если меняется backend.

Код компонента трогать стоит только если нужен новый тип поля или другая логика отправки.

## Итог

`FeedbackForm` в текущем Quartz-проекте — это не «форма в TSX», а связка из placeholder-компонента, inline-скрипта и JSON-конфига. Такой вариант хорошо подходит для статического сайта: Markdown остаётся чистым, форма настраивается данными, а клиентское поведение переживает SPA-переходы.
