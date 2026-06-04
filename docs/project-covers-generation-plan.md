# План генерации обложек для проектных статей

## Цель

Этот документ фиксирует подготовку недостающих обложек для проектного раздела [`content/Проекты`](../content/Проекты): найденный формат, список материалов, рабочие имена файлов, промты, итоговые пути и результат оптимизации.

## Обнаруженный формат обложек

В проектных карточках используется поле [`preview_image`](../quartz/components/PagePreviewList.tsx:26) во frontmatter Markdown-файлов. Компонент [`PagePreviewList`](../quartz/components/PagePreviewList.tsx:17) берёт это поле из данных страницы и рендерит изображение карточки через [`resolveRelative`](../quartz/components/PagePreviewList.tsx:86). Если поле отсутствует, показывается placeholder с текстом из локализации [`noImage`](../quartz/i18n/locales/ru-RU.ts:64).

Дополнительно transformer frontmatter Quartz нормализует social preview aliases [`socialImage`](../quartz/plugins/transformers/frontmatter.ts:101), [`image`](../quartz/plugins/transformers/frontmatter.ts:101) и [`cover`](../quartz/plugins/transformers/frontmatter.ts:101), но для карточек разделов и тегов фактически используется именно [`preview_image`](../quartz/components/PagePreviewList.tsx:26).

Рекомендуемый формат для новых файлов:

```yaml
preview_image: /images/example-cover.webp
```

Рекомендуемое место хранения: [`content/images`](../content/images). Путь во frontmatter должен оставаться абсолютным от корня сайта: `/images/<file-name>.webp`.

## Рекомендации по размеру и формату

- Основной размер для генерации: 1600×1000 px, потому что карточки используют соотношение сторон 16:10 в [`PagePreviewList`](../quartz/components/PagePreviewList.tsx:171).
- Допустимый универсальный вариант для social preview: 1600×900 px или 1200×675 px, но для текущих карточек лучше сразу готовить 16:10.
- Финальный формат: WebP для всех 20 обложек после проверки поддержки в Quartz и сравнения размеров; исходные PNG удалены там, где WebP оказался меньше.
- Без мелкого текста внутри изображения; допустимы только короткие крупные текстовые акценты на 1–3 слова, если они спокойно отражают основную суть материала.
- После генерации файлы сохранены в [`content/images`](../content/images), соответствующие [`preview_image`](../quartz/components/PagePreviewList.tsx:26) обновлены, а финальные изображения оптимизированы в WebP.

## Общие правила визуального стиля

Единая серия должна быть сдержанной и минималистичной:

- спокойная premium tech-эстетика без перегруженного интерфейса;
- 1–3 смысловых объекта в кадре, не больше;
- много воздуха, аккуратная композиция, мягкий контраст;
- глубокие нейтральные фоны: graphite, slate, warm gray, dark navy;
- один мягкий акцентный цвет на серию или проект;
- никаких логотипов брендов, товарных знаков и узнаваемых UI конкретных сервисов;
- без мелкого текста, псевдотекста, случайных букв, водяных знаков;
- без людей крупным планом, если это не требуется смыслом;
- не делать «коллаж из всего сразу»: каждый cover должен передавать одну идею;
- если в кадре есть календарь, уведомления или элементы рабочей области, они должны выглядеть естественно и быть встроены в реальную рабочую сцену;
- избегать искусственно плавающих иконок, перегруженных overlay-плашек, хаотичных значков и неестественной UI-композиции;
- показывать календарь и уведомления как часть экрана ноутбука/планшета, спокойной панели интерфейса, блокнота, доски задач или аккуратного фрагмента приложения;
- уведомления делать тонкими и правдоподобными: 1–2 ненавязчивых индикатора без кучности и без мелкого текста.

## Общий negative prompt

Использовать для всех генераций:

```text
No text, no readable words, no logos, no brand marks, no watermarks, no busy collage, no cluttered dashboard, no tiny UI labels, no random letters, no photorealistic screenshots, no over-saturated neon, no comic style, no cartoon mascots, no distorted hands, no faces close-up, no excessive icons, no low resolution, no blurry artifacts, no duplicated objects, no chaotic composition.
```

## Найденные материалы без фактической обложки

Исходная проверка показала 20 проблемных материалов: у 19 статей поле [`preview_image`](../quartz/components/PagePreviewList.tsx:26) было задано, но соответствующий файл отсутствовал в [`content/images`](../content/images); у индексной страницы проектов поле указывало только на папку `/images/`. Сейчас все 20 позиций закрыты и переведены на финальные WebP-файлы.

## Промты по недостающим обложкам

### 1. Audio Scribe Agent Control Plane

- Статус: ✅ выполнено
- Статья: [`content/Проекты/Audio-Scribe/Audio Scribe Agent Control Plane admin dashboard workflows skills MCP и memory.md`](../content/Проекты/Audio-Scribe/Audio%20Scribe%20Agent%20Control%20Plane%20admin%20dashboard%20workflows%20skills%20MCP%20и%20memory.md)
- Рабочий файл: [`audio-scribe-agent-cover.webp`](../content/images/audio-scribe-agent-cover.webp)
- Целевой путь: `/images/audio-scribe-agent-cover.webp`
- Сохранено: [`content/images/audio-scribe-agent-cover.webp`](../content/images/audio-scribe-agent-cover.webp)
- Заметка: сгенерирована одна PNG-обложка через локальный OpenAI-compatible API; файл проверен как PNG 1536×1024, 1 782 404 байта. Финальный файл оптимизирован в WebP quality 86 через ImageMagick: PNG 1782404 байт → WebP 15146 байт, экономия 1767258 байт, 1536×1024; PNG-дубликат удалён.
- Идея: спокойный control plane для агентских workflow, memory и sandbox без перегруженного dashboard.
- Prompt:

```text
Minimal premium tech editorial cover, abstract agent control plane for an audio transcription product, a dark graphite workspace with three clean floating panels representing workflows, memory, and sandboxed tools, subtle node connections, one small waveform accent, soft cyan highlights, lots of negative space, restrained composition, no readable UI text, no logos, 16:10 aspect ratio, high quality, crisp edges, modern matte lighting.
```

### 2. Audio Scribe Workspace

- Статус: ✅ выполнено
- Статья: [`content/Проекты/Audio-Scribe/Audio Scribe Workspace задачи календарь и напоминания после расшифровки.md`](../content/Проекты/Audio-Scribe/Audio%20Scribe%20Workspace%20задачи%20календарь%20и%20напоминания%20после%20расшифровки.md)
- Рабочий файл: [`audio-scribe-workspace-cover.webp`](../content/images/audio-scribe-workspace-cover.webp)
- Целевой путь: `/images/audio-scribe-workspace-cover.webp`
- Сохранено: [`content/images/audio-scribe-workspace-cover.webp`](../content/images/audio-scribe-workspace-cover.webp)
- Заметка: сгенерирована одна PNG-обложка через локальный OpenAI-compatible API; по фидбэку усилена реалистичность материалов, света, интерфейсных элементов и рабочей сцены; файл проверен как PNG 1536×1024, 2 062 599 байт. Новый фидбэк про более естественные календарь, уведомления и рабочую область зафиксирован для следующих генераций; текущий PNG оставлен без изменений. Финальный файл оптимизирован в WebP quality 86 через ImageMagick: PNG 2062599 байт → WebP 51190 байт, экономия 2011409 байт, 1536×1024; PNG-дубликат удалён.
- Идея: расшифровка превращается в задачи, календарь и reminders.
- Prompt:

```text
Minimal editorial cover for a productivity workspace after audio transcription, one clean audio waveform transforming into three calm objects: a task card, a calendar block, and a reminder marker, soft dark slate background, muted blue and warm amber accents, balanced spacing, elegant shadows, no readable text, no clutter, no logos, 16:10 aspect ratio, premium SaaS illustration style.
```

### 3. Audio Scribe backend architecture

- Статус: ✅ выполнено
- Статья: [`content/Проекты/Audio-Scribe/Audio Scribe архитектура backend очереди и production-контур.md`](../content/Проекты/Audio-Scribe/Audio%20Scribe%20архитектура%20backend%20очереди%20и%20production-контур.md)
- Рабочий файл: [`audio-scribe-architecture-cover.webp`](../content/images/audio-scribe-architecture-cover.webp)
- Целевой путь: `/images/audio-scribe-architecture-cover.webp`
- Сохранено: [`content/images/audio-scribe-architecture-cover.webp`](../content/images/audio-scribe-architecture-cover.webp)
- Заметка: сгенерирована одна PNG-обложка через OpenAI-compatible image API; усилена реалистичность материалов, мягкого света, аккуратного интерфейса на экране и естественной рабочей композиции без плавающих иконок, перегруженных overlay-плашек и хаотичных значков; файл проверен как PNG 1536×1024, 1 807 513 байт. Финальный файл оптимизирован в WebP quality 86 через ImageMagick: PNG 1807513 байт → WebP 24954 байт, экономия 1782559 байт, 1536×1024; PNG-дубликат удалён.
- Идея: backend, очереди, storage и production-контур.
- Prompt:

```text
Restrained technical architecture cover for an audio processing backend, abstract pipeline with a waveform input, a queue module, storage cylinder, and deployment boundary, arranged as four simple geometric blocks on a dark neutral background, thin connection lines, soft cyan and violet accents, clean and calm, no readable labels, no brand logos, no crowded diagrams, 16:10 aspect ratio.
```

### 4. MedusaStore AI Assistant roadmap

- Статус: ✅ выполнено
- Статья: [`content/Проекты/MedusaStore/MedusaStore AI Assistant и roadmap production hardening.md`](../content/Проекты/MedusaStore/MedusaStore%20AI%20Assistant%20и%20roadmap%20production%20hardening.md)
- Рабочий файл: [`medusastore-ai-roadmap-cover.webp`](../content/images/medusastore-ai-roadmap-cover.webp)
- Целевой путь: `/images/medusastore-ai-roadmap-cover.webp`
- Сохранено: [`content/images/medusastore-ai-roadmap-cover.webp`](../content/images/medusastore-ai-roadmap-cover.webp)
- Заметка: сгенерирована одна PNG-обложка через OpenAI-compatible image API; усилена реалистичность материалов, мягкого света, аккуратного интерфейса на экране и естественной рабочей композиции без плавающих иконок, перегруженных overlay-плашек и хаотичных значков; файл проверен как PNG 1536×1024, 1 904 718 байт. Финальный файл оптимизирован в WebP quality 86 через ImageMagick: PNG 1904718 байт → WebP 34454 байт, экономия 1870264 байт, 1536×1024; PNG-дубликат удалён.
- Идея: optional AI assistant рядом с e-commerce, но отделённый от checkout.
- Prompt:

```text
Minimal premium e-commerce architecture cover, a refined storefront card on the left and a small protected AI assistant orb on the right, separated by a subtle safety boundary line, roadmap dots fading into the background, dark graphite and warm neutral palette, one restrained teal accent, calm production-ready mood, no readable text, no logos, no busy shopping icons, 16:10 aspect ratio.
```

### 5. MedusaStore Payload CMS

- Статус: ✅ выполнено
- Статья: [`content/Проекты/MedusaStore/MedusaStore Payload CMS контент и маркетинг.md`](../content/Проекты/MedusaStore/MedusaStore%20Payload%20CMS%20контент%20и%20маркетинг.md)
- Рабочий файл: [`medusastore-payload-cover.webp`](../content/images/medusastore-payload-cover.webp)
- Целевой путь: `/images/medusastore-payload-cover.webp`
- Сохранено: [`content/images/medusastore-payload-cover.webp`](../content/images/medusastore-payload-cover.webp)
- Заметка: сгенерирована одна PNG-обложка через OpenAI-compatible image API; добавлен лаконичный текстовый акцент `CONTENT LAYER`, отражающий основную суть статьи; файл проверен как PNG 1536×1024, 1 952 054 байта. Финальный файл оптимизирован в WebP quality 86 через ImageMagick: PNG 1952054 байт → WebP 55052 байт, экономия 1897002 байт, 1536×1024; PNG-дубликат удалён.
- Идея: CMS как отдельный content/admin слой для страниц, медиа и кампаний.
- Prompt:

```text
Minimal premium editorial cover for an e-commerce CMS and marketing layer, realistic quiet desk scene with a dark tablet or monitor showing a clean content admin surface, three large natural cards for page, media, and campaign arranged above a subtle storefront base, separated from commerce core by a calm horizontal layer. Add one short, large, readable text accent only: "CONTENT LAYER", integrated naturally as a title on the main content card. Matte dark navy and graphite background, soft beige and teal accents, realistic materials, soft studio light, generous negative space, premium SaaS product photography mixed with refined illustration, 16:10 aspect ratio. Avoid clutter, avoid floating random icons, avoid overloaded overlays, no logos, no brand marks, no watermarks, no small text, no pseudo UI strings, no random letters, no busy dashboard.
```

### 6. MedusaStore storefront StudioPro UI

- Статус: ✅ выполнено
- Статья: [`content/Проекты/MedusaStore/MedusaStore storefront StudioPro и UI.md`](../content/Проекты/MedusaStore/MedusaStore%20storefront%20StudioPro%20и%20UI.md)
- Рабочий файл: [`medusastore-storefront-cover.webp`](../content/images/medusastore-storefront-cover.webp)
- Целевой путь: `/images/medusastore-storefront-cover.webp`
- Сохранено: [`content/images/medusastore-storefront-cover.webp`](../content/images/medusastore-storefront-cover.webp)
- Заметка: сгенерирована одна PNG-обложка через OpenAI-compatible image API; добавлен лаконичный текстовый акцент `SHOPPER UI`, отражающий основную суть статьи; файл проверен как PNG 1536×1024, 1 756 441 байт. Финальный файл оптимизирован в WebP quality 86 через ImageMagick: PNG 1756441 байт → WebP 36850 байт, экономия 1719591 байт, 1536×1024; PNG-дубликат удалён.
- Идея: витрина, карточка товара, checkout/account/reviews без конкретного бренда.
- Prompt:

```text
Minimal premium storefront UI cover, realistic studio desk with one elegant laptop or tablet screen displaying a refined abstract product card and a calm checkout path represented by three clean panels, no specific brand and no real product. Add one short, large, readable text accent only: "SHOPPER UI", integrated naturally as a quiet heading on the screen or product card. Soft studio lighting, neutral graphite background, warm sand and muted blue accents, subtle grid only, elegant e-commerce atmosphere, realistic materials, lots of negative space, 16:10 aspect ratio. Avoid clutter, avoid floating icons, avoid chaotic badges, avoid overloaded overlays, no logos, no brand marks, no watermarks, no small UI labels, no pseudo text, no random letters, no busy shopping icons.
```

### 7. MedusaStore backend storefront staging

- Статус: ✅ выполнено
- Статья: [`content/Проекты/MedusaStore/MedusaStore архитектура backend storefront и staging.md`](../content/Проекты/MedusaStore/MedusaStore%20архитектура%20backend%20storefront%20и%20staging.md)
- Рабочий файл: [`medusastore-architecture-cover.webp`](../content/images/medusastore-architecture-cover.webp)
- Целевой путь: `/images/medusastore-architecture-cover.webp`
- Сохранено: [`content/images/medusastore-architecture-cover.webp`](../content/images/medusastore-architecture-cover.webp)
- Заметка: сгенерирована одна PNG-обложка через OpenAI-compatible image API; добавлен лаконичный текстовый акцент `STACK BOUNDARY`; стиль — сдержанная реалистичная technical-board композиция с мягким светом, staging boundary и без перегруженных overlay-элементов. Финальный файл оптимизирован в WebP quality 86 через ImageMagick: PNG 2382318 байт → WebP 63538 байт, экономия 2318780 байт, 1536×1024; PNG-дубликат удалён.
- Идея: Medusa backend, storefront, CMS, PostgreSQL, Redis, Caddy и staging boundary как спокойная схема.
- Prompt:

```text
Restrained system architecture cover for a production e-commerce stack, six abstract modules arranged in two clean layers: backend, storefront, CMS, database, cache, ingress boundary, thin connection lines, dark slate background, muted teal and copper accents, no readable labels, no logos, no complex diagram overload, premium technical illustration, 16:10 aspect ratio.
```

### 8. MedusaStore overview

- Статус: ✅ выполнено
- Статья: [`content/Проекты/MedusaStore/MedusaStore обзор и сценарии.md`](../content/Проекты/MedusaStore/MedusaStore%20обзор%20и%20сценарии.md)
- Рабочий файл: [`medusastore-overview-cover.webp`](../content/images/medusastore-overview-cover.webp)
- Целевой путь: `/images/medusastore-overview-cover.webp`
- Сохранено: [`content/images/medusastore-overview-cover.webp`](../content/images/medusastore-overview-cover.webp)
- Заметка: сгенерирована одна PNG-обложка через OpenAI-compatible image API; добавлен лаконичный текстовый акцент `STORE RUNTIME`; стиль — спокойная карта e-commerce-сценариев на реалистичной тёмной рабочей поверхности с большим количеством воздуха и без хаотичных иконок. Финальный файл оптимизирован в WebP quality 86 через ImageMagick: PNG 2182890 байт → WebP 39172 байт, экономия 2143718 байт, 1536×1024; PNG-дубликат удалён.
- Идея: общий e-commerce runtime для покупателя, администратора, маркетолога и поддержки.
- Prompt:

```text
Calm premium overview cover for an e-commerce platform, one central abstract storefront cube surrounded by four minimal orbiting cards for buyer, admin, marketing, and support scenarios, large negative space, dark graphite background, soft warm gray and teal highlights, no readable text, no icons overload, no logos, modern editorial SaaS style, 16:10 aspect ratio.
```

### 9. MedusaStore Russian integrations

- Статус: ✅ выполнено
- Статья: [`content/Проекты/MedusaStore/MedusaStore российские интеграции YooKassa ApiShip VK ID и уведомления.md`](../content/Проекты/MedusaStore/MedusaStore%20российские%20интеграции%20YooKassa%20ApiShip%20VK%20ID%20и%20уведомления.md)
- Рабочий файл: [`medusastore-integrations-cover.webp`](../content/images/medusastore-integrations-cover.webp)
- Целевой путь: `/images/medusastore-integrations-cover.webp`
- Сохранено: [`content/images/medusastore-integrations-cover.webp`](../content/images/medusastore-integrations-cover.webp)
- Заметка: сгенерирована одна PNG-обложка через OpenAI-compatible image API; добавлен лаконичный текстовый акцент `SAFE CHANNELS`; стиль — минималистичный integration-board с естественными тонкими индикаторами уведомлений, без брендов, логотипов и перегруза. Финальный файл оптимизирован в WebP quality 86 через ImageMagick: PNG 1874311 байт → WebP 33774 байт, экономия 1840537 байт, 1536×1024; PNG-дубликат удалён.
- Идея: платежи, доставка, auth и уведомления как безопасные интеграционные каналы без логотипов.
- Prompt:

```text
Minimal integration layer cover for an e-commerce system, a central storefront node connected to four abstract secure channels: payment, delivery, identity, notifications, no brand logos, no country symbols, calm dark background, thin guarded connection lines, muted teal and amber accents, clean production infrastructure mood, no readable text, 16:10 aspect ratio.
```

### 10. MedusaStore project index

- Статус: ✅ выполнено
- Статья: [`content/Проекты/MedusaStore/index.md`](../content/Проекты/MedusaStore/index.md)
- Рабочий файл: [`medusastore-cover.webp`](../content/images/medusastore-cover.webp)
- Целевой путь: `/images/medusastore-cover.webp`
- Сохранено: [`content/images/medusastore-cover.webp`](../content/images/medusastore-cover.webp)
- Заметка: сгенерирована одна PNG-обложка через OpenAI-compatible image API; добавлен лаконичный текстовый акцент `COMMERCE CORE`; стиль — сдержанная реалистичная e-commerce runtime композиция с мягким светом, стабильным backend core и без перегруженных overlay-элементов. Финальный файл оптимизирован в WebP quality 86 через ImageMagick: PNG 1963985 байт → WebP 55420 байт, экономия 1908565 байт, 1536×1024; PNG-дубликат удалён.
- Идея: главная обложка проекта MedusaStore как e-commerce runtime/template.
- Prompt:

```text
Premium minimal project cover for a modern e-commerce runtime and template, abstract storefront structure with a stable backend core underneath, clean layered blocks, subtle cart path curve, dark graphite background, refined teal and warm beige accents, elegant technical-product mood, no readable text, no logos, no clutter, 16:10 aspect ratio.
```

### 11. Quartz 4 and Smirnoff site

- Статус: ✅ выполнено
- Статья: [`content/Проекты/Obsidian/Quartz 4 быстрый генератор статических сайтов с интеграцией Obsidian.md`](../content/Проекты/Obsidian/Quartz%204%20быстрый%20генератор%20статических%20сайтов%20с%20интеграцией%20Obsidian.md)
- Рабочий файл: [`quartz-smirnoff.webp`](../content/images/quartz-smirnoff.webp)
- Целевой путь: `/images/quartz-smirnoff.webp`
- Сохранено: [`content/images/quartz-smirnoff.webp`](../content/images/quartz-smirnoff.webp)
- Заметка: сгенерирована одна PNG-обложка через OpenAI-compatible image API; добавлен лаконичный текстовый акцент `PUBLISH LAYER`; стиль — спокойная реалистичная публикационная сцена Quartz/knowledge-base с мягким светом, аккуратным website surface и без хаотичных значков. Финальный файл оптимизирован в WebP quality 86 через ImageMagick: PNG 1980215 байт → WebP 39614 байт, экономия 1940601 байт, 1536×1024; PNG-дубликат удалён.
- Идея: Quartz как слой публикации для заметок, лендингов, меню и карточек.
- Prompt:

```text
Minimal editorial cover for a static site generator connected to a personal knowledge base, abstract markdown pages flowing into a polished website frame, small graph nodes in the background, calm dark navy and graphite palette, subtle purple accent, clean composition, no readable text, no app logos, no browser screenshot, 16:10 aspect ratio.
```

### 12. Quartz infrastructure

- Статус: ✅ выполнено
- Статья: [`content/Проекты/Obsidian/Инфраструктура Quartz-проекта команды preview CI и деплой.md`](../content/Проекты/Obsidian/Инфраструктура%20Quartz-проекта%20команды%20preview%20CI%20и%20деплой.md)
- Рабочий файл: [`quartz-infrastructure.webp`](../content/images/quartz-infrastructure.webp)
- Целевой путь: `/images/quartz-infrastructure.webp`
- Сохранено: [`content/images/quartz-infrastructure.webp`](../content/images/quartz-infrastructure.webp)
- Заметка: сгенерирована одна PNG-обложка через OpenAI-compatible image API; добавлен лаконичный текстовый акцент `SITE PIPELINE`; стиль — сдержанная реалистичная pipeline-board композиция для markdown, preview, CI и deploy без busy terminal screens и лишних элементов. Финальный файл оптимизирован в WebP quality 86 через ImageMagick: PNG 2114056 байт → WebP 19606 байт, экономия 2094450 байт, 1536×1024; PNG-дубликат удалён.
- Идея: команды, preview, CI, deploy и generated-зона без шума.
- Prompt:

```text
Restrained infrastructure cover for a static website project, a clean pipeline from markdown source to preview, CI check, and deployed static output, represented by four simple geometric stations, one protected generated assets zone, dark slate background, muted blue and green accents, no readable code, no logos, no busy terminal screens, 16:10 aspect ratio.
```

### 13. Quartz FeedbackForm component

- Статус: ✅ выполнено
- Статья: [`content/Проекты/Obsidian/Как создать компонент FeedbackForm для Quartz 4.md`](../content/Проекты/Obsidian/Как%20создать%20компонент%20FeedbackForm%20для%20Quartz%204.md)
- Рабочий файл: [`quartz-feedback-form.webp`](../content/images/quartz-feedback-form.webp)
- Целевой путь: `/images/quartz-feedback-form.webp`
- Сохранено: [`content/images/quartz-feedback-form.webp`](../content/images/quartz-feedback-form.webp)
- Заметка: сгенерирована одна PNG-обложка через OpenAI-compatible image API; добавлен лаконичный текстовый акцент `FEEDBACK FORM`; стиль — сдержанная реалистичная карточка формы на тёмной рабочей поверхности с мягким светом, аккуратным интерфейсом и без перегруженных overlay-элементов; файл проверен как PNG 1536×1024, 2 346 965 байт. Финальный файл оптимизирован в WebP quality 86 через ImageMagick: PNG 2346965 байт → WebP 37548 байт, экономия 2309417 байт, 1536×1024; PNG-дубликат удалён.
- Идея: форма обратной связи как аккуратный компонент, связанный с конфигом и inline-скриптом.
- Prompt:

```text
Minimal component cover for a website feedback form, one elegant floating form card with three abstract input rows and a small submit block, connected to a tiny configuration node, dark warm gray background, soft teal accent, calm product design mood, no readable labels, no logos, no cluttered UI, 16:10 aspect ratio.
```

### 14. Quartz site architecture

- Статус: ✅ выполнено
- Статья: [`content/Проекты/Obsidian/Как устроен этот Quartz-сайт Smirnoff лендинги и проектные страницы.md`](../content/Проекты/Obsidian/Как%20устроен%20этот%20Quartz-сайт%20Smirnoff%20лендинги%20и%20проектные%20страницы.md)
- Рабочий файл: [`quartz-smirnoff-site.webp`](../content/images/quartz-smirnoff-site.webp)
- Целевой путь: `/images/quartz-smirnoff-site.webp`
- Сохранено: [`content/images/quartz-smirnoff-site.webp`](../content/images/quartz-smirnoff-site.webp)
- Заметка: сгенерирована одна PNG-обложка через OpenAI-compatible image API; добавлен лаконичный текстовый акцент `SITE SYSTEM`; стиль — спокойная реалистичная layered-architecture композиция content/config/layout/website с мягким светом, большим количеством воздуха и без псевдоскриншотов; файл проверен как PNG 1536×1024, 2 234 670 байт. Финальный файл оптимизирован в WebP quality 86 через ImageMagick: PNG 2234670 байт → WebP 43544 байт, экономия 2191126 байт, 1536×1024; PNG-дубликат удалён.
- Идея: структура сайта: content, config, layout, landing, projects, custom components.
- Prompt:

```text
Premium minimal architecture cover for a custom Quartz website, layered composition with content folder, configuration layer, layout layer, and final website surface, a few clean component tiles around it, dark graphite background, subtle violet and blue highlights, balanced negative space, no readable text, no logos, no screenshots, 16:10 aspect ratio.
```

### 15. Quartz bookshelf integration

- Статус: ✅ выполнено
- Статья: [`content/Проекты/Obsidian/Книжная полка в Quartz static catalog mirrored covers и fallback к BOOK-LIBRARY.md`](../content/Проекты/Obsidian/Книжная%20полка%20в%20Quartz%20static%20catalog%20mirrored%20covers%20и%20fallback%20к%20BOOK-LIBRARY.md)
- Рабочий файл: [`quartz-bookshelf.webp`](../content/images/quartz-bookshelf.webp)
- Целевой путь: `/images/quartz-bookshelf.webp`
- Сохранено: [`content/images/quartz-bookshelf.webp`](../content/images/quartz-bookshelf.webp)
- Заметка: сгенерирована одна PNG-обложка через OpenAI-compatible image API; добавлен лаконичный текстовый акцент `STATIC SHELF`; стиль — минималистичная реалистичная книжная полка/static-catalog на тёмной поверхности с бумажными и teal-акцентами, без читаемых названий и хаотичных значков; файл проверен как PNG 1536×1024, 2 335 540 байт. Финальный файл оптимизирован в WebP quality 86 через ImageMagick: PNG 2335540 байт → WebP 65214 байт, экономия 2270326 байт, 1536×1024; PNG-дубликат удалён.
- Идея: static catalog, mirrored covers и fallback как аккуратная книжная полка.
- Prompt:

```text
Minimal editorial cover for a static bookshelf integration, a calm horizontal rail of abstract book covers mirrored into a static website layer, one fallback card subtly visible, dark navy background, muted paper and teal accents, elegant spacing, no readable book titles, no logos, no clutter, 16:10 aspect ratio, premium knowledge library mood.
```

### 16. PromtGen VEO 3 guided workflow

- Статус: ✅ выполнено
- Статья: [`content/Проекты/Promt Gen/PromtGen VEO 3 guided workflow.md`](../content/Проекты/Promt%20Gen/PromtGen%20VEO%203%20guided%20workflow.md)
- Рабочий файл: [`promtgen-veo-workflow-cover.webp`](../content/images/promtgen-veo-workflow-cover.webp)
- Целевой путь: `/images/promtgen-veo-workflow-cover.webp`
- Сохранено: [`content/images/promtgen-veo-workflow-cover.webp`](../content/images/promtgen-veo-workflow-cover.webp)
- Заметка: сгенерирована одна PNG-обложка через OpenAI-compatible image API; добавлен лаконичный текстовый акцент `VIDEO BRIEF`; стиль — сдержанный реалистичный storyboard/workflow board для setup, storyboard и review с мягким светом, 1–2 тонкими индикаторами и без перегруженного editing-интерфейса; файл проверен как PNG 1536×1024, 1 746 921 байт. Финальный файл оптимизирован в WebP quality 86 через ImageMagick: PNG 1746921 байт → WebP 19488 байт, экономия 1727433 байт, 1536×1024; PNG-дубликат удалён.
- Идея: guided workflow для видео: setup, visual direction, storyboard, review/export.
- Prompt:

```text
Minimal premium cover for a guided video prompt workflow, a clean storyboard timeline with three large empty frame cards, one setup node and one review panel, cinematic dark background, subtle purple and cyan accents, no readable overlay text, no logos, no cluttered editing interface, refined generative media workspace mood, 16:10 aspect ratio.
```

### 17. BOOK-LIBRARY LLM translations

- Статус: ✅ выполнено
- Статья: [`content/Проекты/book-library/BOOK-LIBRARY LLM-переводы книг.md`](../content/Проекты/book-library/BOOK-LIBRARY%20LLM-переводы%20книг.md)
- Рабочий файл: [`book-library-translations.webp`](../content/images/book-library-translations.webp)
- Целевой путь: `/images/book-library-translations.webp`
- Сохранено: [`content/images/book-library-translations.webp`](../content/images/book-library-translations.webp)
- Заметка: сгенерирована одна PNG-обложка через OpenAI-compatible image API; добавлен лаконичный текстовый акцент `TRANSLATION FLOW`; стиль — сдержанный реалистичный translation pipeline с книгой, сегментами, review gate и artifacts без перегруза. Финальный файл оптимизирован в WebP quality 86 через ImageMagick: PNG 2450066 байт → WebP 74400 байт, экономия 2375666 байт, 1536×1024; PNG-дубликат удалён.
- Идея: pipeline переводов: книга, сегменты, проверка, artifacts и публикация.
- Prompt:

```text
Restrained knowledge pipeline cover for LLM book translation, an abstract open book transformed into clean segmented cards flowing through a quiet review gate, soft paper texture on dark graphite background, muted gold and teal accents, no readable text, no real book titles, no logos, no clutter, 16:10 aspect ratio, premium library technology style.
```

### 18. BOOK-LIBRARY React admin

- Статус: ✅ выполнено
- Статья: [`content/Проекты/book-library/BOOK-LIBRARY React-админка и операционный центр.md`](../content/Проекты/book-library/BOOK-LIBRARY%20React-админка%20и%20операционный%20центр.md)
- Рабочий файл: [`book-library-admin.webp`](../content/images/book-library-admin.webp)
- Целевой путь: `/images/book-library-admin.webp`
- Сохранено: [`content/images/book-library-admin.webp`](../content/images/book-library-admin.webp)
- Заметка: сгенерирована одна PNG-обложка через OpenAI-compatible image API; добавлен лаконичный текстовый акцент `LIBRARY OPS`; стиль — спокойный реалистичный admin operations workspace с тремя крупными панелями и рядом силуэтов книг без busy dashboard. Финальный файл оптимизирован в WebP quality 86 через ImageMagick: PNG 1981498 байт → WebP 41886 байт, экономия 1939612 байт, 1536×1024; PNG-дубликат удалён.
- Идея: операционный центр для импорта, переводов, очередей и настроек.
- Prompt:

```text
Minimal admin operations cover for a private digital library, three calm dashboard panels represented as abstract cards: import queue, translation jobs, settings, with a small row of book-cover silhouettes, dark slate background, muted amber and teal accents, no readable UI text, no logos, no busy tables, 16:10 aspect ratio, clean premium SaaS illustration.
```

### 19. BOOK-LIBRARY and Quartz integration

- Статус: ✅ выполнено
- Статья: [`content/Проекты/book-library/BOOK-LIBRARY и Quartz.md`](../content/Проекты/book-library/BOOK-LIBRARY%20и%20Quartz.md)
- Рабочий файл: [`book-library-quartz.webp`](../content/images/book-library-quartz.webp)
- Целевой путь: `/images/book-library-quartz.webp`
- Сохранено: [`content/images/book-library-quartz.webp`](../content/images/book-library-quartz.webp)
- Заметка: сгенерирована одна PNG-обложка через OpenAI-compatible image API; добавлен лаконичный текстовый акцент `STATIC MIRROR`; стиль — минималистичная интеграционная сцена library source ↔ static website с естественным bridge и без хаотичных overlay. Финальный файл оптимизирован в WebP quality 86 через ImageMagick: PNG 1941711 байт → WebP 24662 байт, экономия 1917049 байт, 1536×1024; PNG-дубликат удалён.
- Идея: граница между BOOK-LIBRARY как источником истины и Quartz как статической витриной.
- Prompt:

```text
Minimal integration cover for a digital library connected to a static website, left side abstract library database with book cards, right side clean static site frame, a thin bridge carrying mirrored cover thumbnails, dark neutral background, soft teal and paper-white accents, no readable text, no logos, no clutter, 16:10 aspect ratio.
```

### 20. Projects index

- Статус: ✅ выполнено
- Статья: [`content/Проекты/index.md`](../content/Проекты/index.md)
- Рабочий файл: [`projects-cover.webp`](../content/images/projects-cover.webp)
- Целевой путь: `/images/projects-cover.webp`
- Сохранено: [`content/images/projects-cover.webp`](../content/images/projects-cover.webp)
- Заметка: сгенерирована одна PNG-обложка через OpenAI-compatible image API; добавлен лаконичный текстовый акцент `PROJECT MAP`; стиль — спокойная карта проектных направлений с шестью абстрактными карточками, большим количеством воздуха и без логотипов. Финальный файл оптимизирован в WebP quality 86 через ImageMagick: PNG 2167509 байт → WebP 22458 байт, экономия 2145051 байт, 1536×1024; PNG-дубликат удалён.
- Идея: общая обложка раздела проектов как спокойная карта направлений сайта.
- Prompt:

```text
Minimal premium cover for a projects index page, a calm constellation of six abstract project cards arranged around a central navigation point, each card represented by a simple geometric surface, no readable labels, dark graphite background, subtle blue, teal, amber and violet accents used sparingly, lots of negative space, clean editorial composition, no logos, no clutter, 16:10 aspect ratio.
```

## Итог оптимизации

- Оптимизировано: 20 из 20 cover-файлов.
- Формат: WebP, quality 86, без изменения размера 1536×1024.
- Суммарный размер PNG до оптимизации: 40968384 байт.
- Суммарный размер WebP после оптимизации: 797970 байт.
- Экономия: 40170414 байт.
- Проверка безопасности: Quartz уже использует WebP, а emitter [`Assets`](../quartz/plugins/emitters/assets.ts:28) копирует все не-Markdown файлы из [`content`](../content), поэтому файлы из [`content/images`](../content/images) будут отданы как статические ассеты.

## Итоговый чеклист после генерации

1. ✅ Изображения сгенерированы по промтам в единой визуальной серии.
2. ✅ Финальные файлы сохранены в [`content/images`](../content/images) с указанными рабочими именами и форматом WebP.
3. ✅ Размер всех 20 финальных файлов проверен: 1536×1024.
4. ✅ [`preview_image`](../quartz/components/PagePreviewList.tsx:26) обновлён во всех 20 соответствующих статьях.
5. ✅ Generated assets в [`quartz/static/generated`](../quartz/static/generated) не изменялись; долгая сборка не запускалась.
