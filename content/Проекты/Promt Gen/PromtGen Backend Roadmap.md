---
publish: true
title: "PromtGen: backend roadmap"
description: "План развития PromtGen от клиентского генератора промтов к платформе с backend, сессиями и генерацией внутри проекта."
created: 2026-05-04 19:22
updated: 2026-06-04 05:10
tags:
  - blog
cssclasses: ""
draft: false
preview_image: "/images/promptgen-backend-roadmap-cover.png"
---

# PromtGen: backend roadmap

Текущая версия PromtGen — это клиентское React/Vite-приложение. Оно уже полезно как генератор промтов: собирает image prompts, video prompts, JSON payload для VEO-сценариев и AI-описания через Gemini. Но архитектурно это всё ещё static SPA без backend API, авторизации, базы данных, persistent sessions, очередей и безопасного серверного слоя для AI-вызовов.

Этот roadmap пока не реализован. Его смысл — описать путь от режима «собрали prompt и скопировали наружу» к режиму «собрали задачу, сгенерировали результат внутри проекта, сохранили историю и вернулись к ней позже», не приписывая текущему продукту backend-возможности.

## Текущее состояние

Сейчас PromtGen работает так:

1. пользователь открывает SPA;
2. выбирает image или video режим;
3. заполняет форму;
4. prompt собирается в браузере;
5. AI-assisted функции вызываются с клиента через `@google/genai`;
6. результат копируется вручную;
7. история и draft не сохраняются на сервере; часть UI state доступна через URL state, но это не persistent session.

Сильные стороны текущей версии:

- быстрый локальный запуск;
- нет серверной инфраструктуры;
- простая разработка UI;
- уже есть понятные доменные модели `FormState` и `VeoFormState`;
- есть category presets, VEO options и behavior patterns;
- есть review/validation логика для видео.

Ограничения:

- API-ключ Gemini живёт на клиенте через Vite-переменную;
- нет user/session model;
- нельзя хранить проекты и версии промтов;
- нет очередей для тяжёлой генерации;
- нельзя безопасно подключать платные image/video/audio модели;
- нет биллинга, rate limits и аудита запросов;
- невозможно полноценно продолжать работу с генерациями между устройствами;
- формального test-suite нет: package scripts ограничены dev/build/preview.

## Цель backend-этапа

Backend нужен не ради «ещё одного слоя», а ради конкретных возможностей:

- безопасно хранить ключи AI-провайдеров;
- выполнять генерацию изображений, видео и текстов на сервере;
- сохранять drafts, prompt sessions и результаты;
- управлять пользователями, лимитами и квотами;
- подключать очереди для долгих задач;
- возвращать статус генерации в интерфейс;
- хранить assets: reference images, generated images, video previews, JSON payloads;
- сделать PromtGen не только prompt builder, а production workspace.

## Предлагаемая архитектура

Минимальная целевая схема:

```text
Frontend (React/Vite)
  -> Backend API
     -> Auth / users
     -> Prompt sessions
     -> AI provider adapters
     -> Generation jobs
     -> Asset storage
     -> Database
     -> Queue / workers
```

### Backend API

Серверный API должен принять на себя операции, которые нельзя оставлять на клиенте:

- вызовы Gemini / image / video / audio providers;
- хранение provider keys;
- создание generation jobs;
- сохранение результатов;
- валидация и нормализация prompt payload;
- rate limiting;
- user access control.

На первом этапе backend может быть простым Node.js API. Для текущего стека логично выбирать TypeScript, чтобы переиспользовать доменные типы и prompt builders.

### Database

База нужна для хранения рабочих сущностей:

- пользователи;
- prompt sessions;
- image card drafts;
- video promo drafts;
- generation jobs;
- generated assets;
- provider responses;
- usage/cost events;
- project folders или collections.

Для старта достаточно PostgreSQL. Она хорошо подходит для структурированных данных, JSON payloads и истории операций.

### Queue / workers

Генерация видео и изображений может занимать время. Поэтому прямой request-response подход быстро станет неудобным. Нужна очередь:

1. frontend отправляет generation request;
2. backend создаёт job;
3. worker вызывает AI provider;
4. статус обновляется в базе;
5. frontend получает progress/status;
6. результат сохраняется и показывается пользователю.

Для MVP можно начать с простой таблицы jobs и polling. Следующий шаг — Redis/BullMQ или другой queue-layer.

### Asset storage

PromtGen должен хранить не только текст, но и файлы:

- reference images;
- загруженные product images;
- generated images;
- video previews;
- thumbnails;
- JSON payload exports;
- будущие audio drafts.

Локально это может быть файловое хранилище, в production — S3-compatible storage.

## Что вынести из frontend в backend

### AI-вызовы

Сейчас `DescriptionPanel.tsx` и `VeoPanel.tsx` вызывают Gemini с клиента. Это нормально для прототипа, но плохо для production:

- ключ виден клиентскому приложению;
- невозможно централизованно контролировать стоимость;
- сложно вести историю запросов;
- нет нормального rate limiting;
- нельзя скрыть provider-specific детали.

Нужны backend endpoints:

```text
POST /api/ai/description
POST /api/ai/analyze-image
POST /api/ai/video-shot-description
POST /api/ai/visual-style
```

Frontend должен отправлять нормализованный контекст, а backend — выбирать provider, модель и системные инструкции.

### Prompt builders

Сейчас prompt-building logic частично живёт в `App.tsx` и `VeoPanel.tsx`. Для масштабирования её лучше вынести в pure-модули:

```text
src/prompt-builders/imageCardPrompt.ts
src/prompt-builders/videoPrompt.ts
src/prompt-builders/audioPrompt.ts
```

Преимущества:

- можно тестировать сборку prompt отдельно от UI;
- backend и frontend смогут использовать одну логику;
- проще версионировать prompt templates;
- можно хранить template version в session/job.

### Validation

Валидация видео уже есть в `VeoPanel.tsx`, но backend должен повторять критичные проверки. Клиентская проверка помогает UX, серверная защищает данные и provider calls.

Backend должен валидировать:

- обязательные поля;
- длительности;
- ограничения provider API;
- формат reference assets;
- максимальные размеры prompt;
- поддерживаемые aspect ratio и resolution;
- права пользователя на session/assets.

## Роадмап по этапам

### Этап 1. Подготовка доменной модели

Цель: отделить бизнес-логику от UI и подготовить минимальную базу для backend без изменения пользовательского сценария.

Задачи:

- вынести image prompt builder из `App.tsx`;
- вынести video prompt builder из `VeoPanel.tsx`;
- вынести validation для `VeoFormState`;
- покрыть prompt builders и validation unit-тестами, потому что формального test-suite сейчас нет;
- описать версии prompt templates;
- унифицировать типы для будущего API;
- подготовить server-side Gemini proxy как первый реальный backend endpoint, чтобы убрать ключ из client-side кода.

Результат: frontend работает как раньше, но логика готова к переиспользованию на сервере.

### Этап 2. Backend MVP

Цель: добавить серверный слой без полной перестройки интерфейса.

Задачи:

- поднять Node.js/TypeScript backend;
- добавить health endpoint;
- добавить endpoints для Gemini-assisted функций;
- перенести Gemini key на сервер;
- добавить базовый logging;
- добавить server-side validation;
- настроить env-переменные backend.

Результат: AI-assisted действия больше не требуют exposing ключа в браузере.

### Этап 3. Drafts и prompt sessions

Цель: дать пользователю возможность сохранять работу.

Сущности:

```text
PromptSession
  id
  userId
  mode: image | video | audio_video
  title
  formState
  promptOutput
  templateVersion
  createdAt
  updatedAt
```

Задачи:

- добавить PostgreSQL;
- сохранять image drafts;
- сохранять video drafts;
- открывать session по id;
- добавить autosave;
- добавить список последних проектов;
- хранить query-state не как единственный способ восстановления, а как UI convenience.

Результат: PromtGen становится workspace, а не одноразовой формой.

### Этап 4. Генерация изображений внутри проекта

Цель: перестать ограничиваться копированием prompt наружу.

Задачи:

- добавить endpoint `POST /api/generations/image`;
- подключить provider adapter для image generation;
- поддержать reference image upload;
- создать generation job;
- показывать статус в UI;
- сохранять результат в assets;
- дать возможность повторить генерацию с изменённым prompt;
- хранить provider metadata.

Результат: пользователь собирает карточку и получает generated image прямо внутри PromtGen.

### Этап 5. Генерация видео внутри проекта

Цель: связать `VeoFormState`, storyboard и provider API.

Задачи:

- добавить endpoint `POST /api/generations/video`;
- передавать full prompt или scene prompt;
- сохранять JSON payload;
- подключить long-running jobs;
- добавить polling или realtime status;
- хранить preview video / result URL;
- отображать историю попыток по одной session;
- добавить provider-specific ограничения по длительности, aspect ratio и resolution.

Результат: Video Promo становится не только prompt-конструктором, но и точкой запуска generation pipeline.

### Этап 6. Audio layer

Цель: добавить звук как часть video workflow.

Задачи:

- добавить audio direction fields в video session;
- генерировать voiceover script;
- генерировать SFX prompts по кадрам;
- генерировать music mood prompt;
- поддержать отдельный audio prompt export;
- позже подключить TTS/music/SFX provider через backend jobs.

Результат: PromtGen сможет готовить не только визуальный prompt, но и звуковой brief для ролика.

### Этап 7. Пользователи, лимиты и production-контроль

Цель: подготовить продукт к реальному использованию.

Задачи:

- авторизация;
- user projects/collections;
- лимиты генераций;
- usage accounting;
- cost tracking;
- audit log;
- rate limits;
- роли admin/user;
- экспорт результатов.

Результат: можно контролировать стоимость и доступ, а не раздавать генерацию всем без ограничений.

## Приоритеты MVP

Если идти прагматично, первые реальные шаги должны быть уже, чем полноценный product backend:

1. extraction of prompt builders из крупных UI-компонентов;
2. unit-тесты на prompt builders и validation;
3. server-side Gemini proxy для текущих AI-assisted функций;
4. prompt sessions с сохранением drafts;
5. image generation job;
6. asset storage для результатов;
7. минимальный экран истории генераций.

Видео generation можно подключать после того, как будет готова очередь и понятная модель jobs, потому что видео дороже и дольше по времени.

## Что не стоит делать сразу

- Не переносить весь UI на новый фреймворк.
- Не переписывать `VeoPanel.tsx` целиком до выделения prompt builders.
- Не добавлять много providers без adapter interface.
- Не запускать video generation без очередей и хранения статусов.
- Не смешивать billing, auth и generation в одном неразделённом сервисе.
- Не менять главное изображение карточки проекта: текущий `preview_image` должен остаться `/images/prmt.jpeg`.

## Целевая пользовательская история

Будущий flow должен выглядеть так:

1. пользователь создаёт проект «Новый товар»;
2. загружает reference image;
3. выбирает категорию и visual direction;
4. собирает image card prompt;
5. запускает генерацию изображения внутри PromtGen;
6. сохраняет удачный результат;
7. переходит в Video Promo;
8. на основе того же товара собирает storyboard;
9. генерирует video prompt и запускает video job;
10. добавляет audio direction;
11. получает историю всех попыток, prompt versions, assets и итоговые файлы в одном project workspace.

Это переводит PromtGen из «генератора текста для копирования» в систему управления AI-контентом для товара.

## Визуал roadmap

Для roadmap используется отдельная обложка `/images/promptgen-backend-roadmap-cover.png`: неоновая карта архитектуры с frontend, backend API, базой данных, очередями и generation nodes. Главное изображение проекта `/images/prmt.jpeg` сохранено для основной карточки PromtGen.

## Связанные материалы

- [[PromtGen VEO 3 guided workflow|VEO 3 guided workflow в текущем Video Promo]]
- [[Как устроен PromtGen|Как устроен проект и кейсы использования]]
- [[PromtGen Audio Video|Аудио и видео направление PromtGen]]
