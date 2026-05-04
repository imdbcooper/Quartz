---
name: quartz-repo-master
description: Используй, когда агенту нужно быстро понять устройство этого репозитория Quartz v4: архитектуру Smirnoff, layout, главную, контакты, мультиконтент, локальную админку, JSON-данные и ключевые документы перед анализом или изменениями.
---

# Quartz Repo Master

Мастер-справочник для агентов, которые впервые открывают репозиторий Smirnoff на Quartz v4.

## Когда использовать

Используй этот skill, если нужно быстро разобраться:

- как устроен репозиторий Quartz v4 сайта Smirnoff;
- где лежат контент, исходники, конфигурация и layout;
- как собираются главная и страница контактов;
- как работает мультиконтент главной;
- как устроена локальная админка мультиконтента;
- какие JSON-данные и документы читать перед изменениями.

## Быстрый контекст проекта

- Текущая рабочая ветка: `refactor/landing-components`.
- Репозиторий: Quartz v4 static site generator для сайта Smirnoff.
- Основной контент: `content/`.
- Исходники Quartz и UI: `quartz/`.
- Конфигурация сайта: `quartz.config.ts`.
- Композиция layout: `quartz.layout.ts`.
- Статические JSON-данные лендингов: `quartz/static/data/`.
- Runtime-скрипты старого/публичного мультиконтента: `content/images/Prodject/`.
- Локальная админка мультиконтента: `tools/multicontent-admin/`.
- Static build output: `public/`.

## Архитектура в двух словах

- Quartz генерирует сайт из Markdown/контента и Preact-компонентов.
- `quartz.config.ts` задаёт базовые настройки сайта, тему, плагины и emitters.
- `quartz.layout.ts` собирает страницы из компонентов Quartz и custom landing-компонентов.
- Компоненты лендингов находятся в `quartz/components/`.
- Данные лендингов хранятся в `quartz/static/data/*.json` и читаются клиентским кодом/компонентами.
- Главная использует мультиконтент: источник трафика выбирает вариант данных.
- Контакты используют единый `contacts.json` без переключения по источнику.
- Админка редактирует только JSON в `quartz/static/data/`, не контент сайта целиком.

## Основные команды

Запускай из корня репозитория.

- `npm run site:dev` — локальная разработка сайта.
- `npm run multicontent-admin` — локальная админка мультиконтента.
- `npm run check` — typecheck и prettier check.
- `npm run format` — форматирование prettier.
- `npm test` — тесты через `tsx --test`.
- `npm run docs` — build + serve docs (`npx quartz build --serve -d docs`).

После любых изменений кода, layout или JSON желательно запускать `npm run check`.

## Главная и контакты в `quartz.layout.ts`

Ключевая логика страниц собрана в `quartz.layout.ts`:

- `buildHomeLandingComponents()` собирает набор компонентов главной.
- `buildContactsLandingComponents()` собирает набор компонентов контактов.
- `LandingContainer` оборачивает landing-компоненты в общий контейнер/структуру.
- `ConditionalRender` включает нужный блок только на подходящем slug/path.

Практический смысл:

- чтобы изменить состав главной — смотри `buildHomeLandingComponents()`;
- чтобы изменить состав контактов — смотри `buildContactsLandingComponents()`;
- чтобы понять, почему компонент виден только на конкретной странице — ищи `ConditionalRender`;
- чтобы понять общий wrapper лендингов — смотри `LandingContainer`.

## Ключевые компоненты главной

Главная собирается из landing-компонентов в `quartz/components/`:

- `LandingHero.tsx` — hero-блок главной.
- `FocusGrid.tsx` — блок фокусов/направлений.
- `ServicesGrid.tsx` — сетка услуг.
- `WorksSlider.tsx` — слайдер/витрина работ.
- `FaqSection.tsx` — FAQ главной.
- `ContactCta.tsx` — CTA для контакта/заявки.

При изменениях главной сначала проверь данные в `quartz/static/data/home.json` и variant JSON, затем компонент.

## Ключевые компоненты контактов

Страница контактов собирается из компонентов:

- `ContactsHero.tsx` — hero контактов.
- `ContactChannels.tsx` — каналы связи.
- `WorkflowSteps.tsx` — этапы работы.
- `StartFormats.tsx` — форматы старта.
- `ContactsFaq.tsx` — FAQ контактов.
- `ContactsCta.tsx` — CTA контактов.

Контакты редактируются через `quartz/static/data/contacts.json`.
Они не переключаются по источнику трафика.

## Мультиконтент главной

Главная поддерживает варианты контента по источнику трафика.

Ключевые файлы:

- `content/images/Prodject/home.js` — runtime-логика выбора/подстановки данных.
- `quartz/static/data/home.json` — базовые данные главной.
- `quartz/static/data/home.telegram.json` — вариант для Telegram.
- `quartz/static/data/home.google.json` — вариант для Google.
- `quartz/static/data/home.vk.json` — вариант для VK.
- `quartz/static/data/home.ad.json` — вариант для рекламы/ads.
- `quartz/static/data/multicontent-rules.json` — правила выбора варианта.
- `quartz/static/data/multicontent-meta.json` — метаданные вариантов/админки.

Механика:

- `_mc_preview` в URL позволяет принудительно preview-нуть вариант.
- `mc_first_touch` сохраняет первый источник/вариант посетителя.
- `extends` позволяет варианту наследоваться от базового или другого варианта.
- Merge объектов — глубокое объединение полей.
- Массивы не мержатся поэлементно: массив из варианта заменяет базовый массив целиком.

Следствие для правок:

- если меняешь структуру секции с массивами, проверь все variant JSON;
- если добавляешь обязательное поле в `home.json`, проверь наследников через `extends`;
- если вариант «не меняется», проверь `_mc_preview`, `mc_first_touch` и rules.

## Контакты

- Основной файл данных: `quartz/static/data/contacts.json`.
- Страница контактов не использует source-based multicontent.
- Старый `content/images/Prodject/contacts.js` не подключён текущей страницей контактов.
- Если нужно изменить текст, каналы связи, FAQ или CTA контактов — начинай с `contacts.json`.

## Локальная админка мультиконтента

Админка лежит в `tools/multicontent-admin/`.

Ключевые файлы:

- `tools/multicontent-admin/server.ts` — локальный сервер админки.
- `tools/multicontent-admin/client/multicontent-admin.js` — клиентская логика UI.

Важно:

- запускается командой `npm run multicontent-admin`;
- редактирует только файлы в `quartz/static/data/`;
- не должна менять Markdown-контент, компоненты или файлы в `content/images/Prodject/`;
- после правок JSON через админку проверь diff и запусти `npm run check`.

## Важные документы

Читать по необходимости:

- `AGENTS.md` — правила работы с репозиторием.
- `Landing_Page_Management.md` — управление landing-страницами.
- `Multicontent_Admin_User_Guide.md` — пользовательская инструкция админки.
- `Multicontent_Implementation_Guide.md` — детали реализации мультиконтента.
- `Multicontent_Landing_Plan.md` — план/история внедрения мультиконтента.
- `docs/home-central-integration.md` — интеграция центральных данных главной.

## Зоны внимания

Перед выводами и изменениями учитывай:

- `AGENTS.md` и `quartz.config.ts` могут расходиться по `baseUrl` и шрифтам; фактическую конфигурацию проверяй в `quartz.config.ts`.
- `Multicontent_Landing_Plan.md` исторический: используй как контекст, а не как единственный источник истины.
- `content/images/Prodject/data.json` выглядит legacy; не считай его актуальным без проверки подключений.
- `content/images/Prodject/contacts.json` выглядит legacy; текущие контакты идут из `quartz/static/data/contacts.json`.
- `content/images/Prodject/contacts.js` старый и не подключён текущей страницей контактов.
- При изменении JSON учитывай, что компоненты могут ожидать конкретную форму данных.

## Recommended workflow для агента

1. Прочитай этот skill.
2. Прочитай `AGENTS.md`.
3. Определи область задачи: layout, компонент, JSON-данные, runtime мультиконтента или админка.
4. Открой только нужные файлы: `quartz.layout.ts`, нужные компоненты, JSON в `quartz/static/data/`, документы.
5. Перед изменениями проверь форму JSON и TypeScript-типы/ожидания компонентов.
6. Для мультиконтента проверь base `home.json`, variant JSON, `extends`, rules и meta.
7. После изменений запусти `npm run check`.
8. Не редактируй legacy-файлы и контент сайта без явной необходимости задачи.

## Что не делать без запроса

- Не добавлять новые фичи сайта.
- Не менять контент Markdown-страниц.
- Не переписывать layout целиком ради точечной правки.
- Не менять runtime мультиконтента, если задача только про тексты/данные.
- Не считать legacy-файлы источником истины без проверки фактических импортов/подключений.
