---
publish: true
title: Audio Scribe архитектура backend очереди и production-контур
description: Как устроены backend, очереди, хранилища, optional Temporal-слой и production-deploy Audio Scribe.
created: 2026-06-04 03:26
updated: 2026-06-04 03:26
tags:
  - blog
cssclasses: ""
draft: false
preview_image: /images/audio-scribe-architecture-cover.png
---

# Audio Scribe: архитектура backend, очереди и production-контур

Audio Scribe снаружи может выглядеть как Telegram-бот и workspace для расшифровки, но внутри это уже нормальная backend-платформа: API, очереди, база, object storage, AI routing, биллинг, admin-инструменты и production-контур с отдельным frontend.

Эта заметка — не про красивую схему «пользователь загрузил файл, AI всё сделал». Здесь важнее практические части: где лежат данные, какие процессы вынесены в очереди, что optional, как проверяется health и как проект выкатывается.

## Backend: NestJS как центр системы

Backend написан на NestJS и TypeScript. Он держит большую часть доменной логики:

- Telegram bot updates;
- backend API для workspace и admin dashboard;
- пользователей и авторизацию;
- транскрибацию и AI-анализ;
- Files/artifacts;
- notes;
- tasks и calendar-связи;
- reminders;
- billing;
- feature flags;
- agent/workflow/admin endpoints.

Такой backend не стоит описывать только как «обёртку над транскрибацией». Транскрибация — важный сценарий, но рядом уже живут задачи, файлы, напоминания, документные workflows и внутренние операторские функции.

## PostgreSQL и Prisma

Основная база — PostgreSQL через Prisma. В ней лежат пользователи, результаты анализа, рабочие сущности, настройки и связи между ними.

Это важно для продукта: результат обработки не исчезает после ответа в Telegram. Он может стать сохранённым файлом, заметкой, задачей, календарным элементом или контекстом для будущего вопроса.

Prisma здесь удобна как слой явной схемы: когда проект растёт от «расшифровать файл» к workspace-платформе, связи между сущностями становятся не менее важны, чем сам AI-вызов.

## Redis и BullMQ

Тяжёлые и фоновые операции вынесены в BullMQ-очереди на Redis. Сейчас ключевые очереди такие:

- `audio-processing` — обработка аудио и голосовых;
- `question-processing` — вопросы, conversational pipeline и часть URL-сценариев;
- `video-processing` — YouTube/Vimeo и video-specific задачи;
- `reminder-scanner` — поиск напоминаний, которые пора доставить;
- `recurring-job-scanner` — регулярные задачи и recurring-сценарии.

Очереди нужны не для красоты. Telegram update или HTTP-запрос не должен ждать тяжёлую транскрибацию, скачивание видео или длинный AI-анализ. Backend принимает входящее событие, создаёт работу, сохраняет состояние и дальше возвращает результат, когда обработка завершилась.

## MinIO и Files/artifacts

Для файлов используется MinIO/S3-compatible storage. Пользовательски это называется **Files** или **Файлы**, но backend/API/domain всё ещё часто говорит **artifacts**.

В storage попадают материалы, которые нужно обработать, скачать, показать в preview или использовать повторно. Это особенно важно для workspace: файл должен быть не одноразовым вложением, а рабочим объектом, к которому можно вернуться.

Типовые операции Files/API:

- список;
- детальная карточка;
- upload;
- download;
- preview;
- delete.

## AI routing

Audio Scribe не завязан на одного AI-провайдера. В routing-слое могут использоваться разные направления:

- AudioScribe;
- Google/Gemini;
- OpenAI;
- Anthropic;
- OpenRouter;
- SiliconFlow;
- Polza AI;
- Perplexity;
- local provider;
- OpenAI-compatible endpoint;
- AssemblyAI transcription.

Это не значит, что каждый provider всегда включён в production. Часть зависит от credentials, feature flags, настроек окружения и конкретного типа задачи. Но архитектурно проект рассчитан на маршрутизацию разных задач к разным инструментам.

## Optional и conditional modules

В кодовой базе есть несколько инженерных слоёв, которые не нужно подавать как обязательный пользовательский функционал:

- Temporal workflows;
- sandbox;
- skills registry;
- MCP registry;
- memory.

Они полезны для agent-control-plane и внутренних workflows, но могут быть optional/conditional. В production часть таких возможностей может быть выключена, скрыта feature flags или доступна только оператору.

## Health и readiness

Для production важны два endpoint:

- `GET /api/health` — базовая проверка, что backend жив;
- `GET /api/ready` — readiness-проверка, что сервис готов принимать трафик.

Это простая, но нужная граница. Health не должен обещать, что «всё идеально», а readiness помогает отличать запущенный процесс от реально готового сервиса.

## Production runtime

Текущий production-контур разделён на backend, frontend и инфраструктуру:

- backend работает через PM2 на `127.0.0.1:3000`;
- frontend собирается в Docker/nginx и слушает `127.0.0.1:3001`;
- PostgreSQL, Redis, Temporal и MinIO поднимаются через Docker;
- frontend и backend не смешиваются в один процесс.

Такой контур удобен для постепенного rollout. Backend можно перезапускать через PM2, frontend — обновлять как контейнерный nginx image, инфраструктуру — держать отдельным docker-слоем.

## Deploy workflow

Deploy построен через GitHub Actions:

- backend tests;
- frontend typecheck/tests;
- сборка GHCR frontend image;
- SSH deploy;
- rollout backend через PM2.

Отдельная важная деталь: docs-only изменения не триггерят автодеплой. Для портфолио-репозитория это удобно: можно обновлять описания проекта, не заставляя production лишний раз пересобираться.

## Где проходит граница ответственности

Backend отвечает за состояние и маршрутизацию. Очереди отвечают за долгие операции. PostgreSQL хранит доменную модель. MinIO хранит файлы. Frontend показывает workspace и admin dashboard. Telegram-бот даёт быстрый канал входа и уведомлений.

Когда эти границы размываются, проект быстро превращается в набор случайных обработчиков. В Audio Scribe важная инженерная задача как раз в обратном: не дать транскрибации, задачам, reminder-сканерам, agent workflows и admin-инструментам перемешаться в один неподдерживаемый комок.

## Что дальше

В активных планах есть targeted refactoring roadmap. Это правильное направление для такого проекта: когда продукт растёт от одной сильной функции к платформе, главная сложность — не добавить ещё один экран, а удержать доменные границы, очереди, feature flags и production-процессы в понятном состоянии.

---

_Это техническая заметка по Audio Scribe: без заявлений о нагрузке и SLA, только фактический backend/runtime-контур и ограничения, которые важно помнить при описании проекта._
