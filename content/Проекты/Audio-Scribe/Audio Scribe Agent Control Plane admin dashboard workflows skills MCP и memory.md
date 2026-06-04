---
publish: true
title: Audio Scribe Agent Control Plane admin dashboard workflows skills MCP и memory
description: Внутренний операционный слой Audio Scribe: admin dashboard, feature flags, agent runs, workflows, skills, MCP, memory, sandbox и artifacts.
created: 2026-06-04 03:26
updated: 2026-06-04 03:26
tags:
  - blog
cssclasses: ""
draft: false
preview_image: /images/audio-scribe-agent-cover.png
---

# Audio Scribe Agent Control Plane: admin dashboard, workflows, skills, MCP и memory

В Audio Scribe есть пользовательский слой: бот, workspace, Files, заметки, задачи, календарь и напоминания. Но рядом с ним постепенно появился внутренний операционный слой — то, что я называю agent-control-plane.

Это не маркетинговая «панель управления искусственным интеллектом». Скорее, набор инженерных поверхностей для оператора и разработчика: посмотреть состояние, управлять feature flags, запускать или проверять workflows, работать с agent runs, skills, MCP registry, memory и sandbox/artifacts.

## Зачем нужен control plane

Когда проект был бы только транскрибацией, хватило бы простого admin-экрана: пользователи, файлы, ошибки, баланс. Но Audio Scribe шире:

- разные AI providers;
- очереди audio/question/video/reminder;
- Files/artifacts;
- document workflows;
- reminders и recurring jobs;
- workspace с задачами и календарём;
- optional Temporal;
- sandbox;
- skills registry;
- MCP registry;
- memory graph.

У такого продукта появляются операторские вопросы: что включено, что выключено, где упала задача, какой workflow запущен, какие permissions нужны, какой provider выбран и можно ли безопасно выполнить действие.

## Admin dashboard

Frontend содержит gated admin surface. Это не основной пользовательский workspace, а отдельный интерфейс для внутренних задач.

В dashboard есть разделы вроде:

- Overview;
- Transcribe;
- Tasks;
- Reminders;
- Users;
- Servers;
- Audit;
- Agent;
- Memory;
- Settings.

Часть разделов может зависеть от feature flags и operator-managed настроек. Поэтому правильно описывать dashboard как внутренний слой, а не как публичную универсальную консоль для каждого пользователя.

## Feature flags

Feature flags — важная часть Audio Scribe. Контракт вокруг флагов большой: примерно 73 флага, часть включена по умолчанию, часть fail-closed, часть управляется оператором.

Это нужно не только для «показать или скрыть кнопку». Флаги помогают:

- отключать рискованные flows;
- прятать экспериментальные web/inline/polling возможности;
- включать notes/reminders/admin/agent-разделы только там, где они готовы;
- разделять локальную разработку и production;
- безопаснее выкатывать новые сценарии.

Из-за этого в статьях про Audio Scribe важно избегать формулировки «всё доступно всегда». В реальном runtime видимость функции зависит от flags, guards и credentials.

## Agent runs и workflows

Agent/workflow слой нужен для операций, которые сложнее одного AI-вызова. Например, взять материал из Files, прогнать generate/transform workflow, сохранить результат, дождаться подтверждения или выполнить действие по расписанию.

В проекте встречаются:

- agent runs;
- workflow-запуски;
- approvals;
- schedules;
- document generate/transform flows;
- связи с artifacts;
- операторские экраны для просмотра и контроля.

Это не значит, что любой агент свободно делает что угодно. Наоборот, control plane нужен как раз для границ: какие действия разрешены, где требуется подтверждение, что можно запланировать, что логируется и как потом понять результат.

## Skills registry

Skills registry — инженерный слой для описания доступных способностей системы. В пользовательском интерфейсе это может быть почти невидимо, но для agent-control-plane важно знать, какие действия вообще можно вызывать и при каких условиях.

Примерная роль skills:

- дать агентному слою список доступных операций;
- отделить capability от конкретного UI;
- включать или выключать возможности через flags/permissions;
- документировать, что workflow может сделать с материалом.

## MCP registry

MCP registry — ещё один optional/conditional слой. Его не стоит описывать как обязательную публичную интеграцию. Скорее, это способ зарегистрировать внешние tools/resources для внутренних workflows, если окружение и настройки это позволяют.

Практическая ценность MCP-слоя появляется там, где agent workflow должен не просто написать текст, а обратиться к отдельному инструменту или контексту. Но в production такие вещи обычно требуют осторожности: permissions, audit, feature flags и понятные failure modes.

## Memory graph

Memory — слой для сохранения и переиспользования контекста. В dashboard он представлен отдельно, потому что память быстро становится чувствительной частью системы: важно понимать, что сохранено, откуда пришло, где используется и как это удалить или ограничить.

Memory graph полезен для agent/workflow сценариев, но его нельзя путать с обычной заметкой пользователя. Заметка — это понятный user-facing объект. Memory — внутренняя структура контекста, которая требует операторского контроля.

## Sandbox и artifacts

Sandbox нужен для изолированных операций, где workflow может что-то подготовить, преобразовать или проверить, не смешивая промежуточные результаты с основным пользовательским сценарием.

Artifacts здесь — технический домен. Для пользователя в workspace лучше говорить **Files**, но во внутреннем control plane термин artifacts нормален: он описывает промежуточные и generated-объекты, которые использует workflow или sandbox.

## Approvals и schedules

Для agent-control-plane важны approvals и schedules. Не каждое действие должно выполняться сразу и автоматически.

Есть разные режимы:

- выполнить workflow сразу;
- подготовить результат и ждать подтверждения;
- запланировать действие;
- повторять по расписанию;
- отменить или приостановить;
- сохранить audit trail.

Такой подход особенно важен для будущих интеграций вроде bridge между TelePost и Audio Scribe: письмо может породить черновик или задачу, но граница автоматического действия должна быть явной.

## Что не стоит обещать

Agent-control-plane не нужно описывать как готовую автономную систему, которая сама управляет всем продуктом. Это внутренний слой с разной степенью готовности отдельных частей.

Честнее формулировать так:

- admin dashboard существует как gated surface;
- feature flags реально управляют видимостью и доступностью функций;
- agent/workflow/memory/skills/MCP/sandbox — инженерные части платформы;
- часть модулей optional или conditional;
- production-поведение зависит от credentials, flags и operator-managed настроек.

## Почему это важно для Audio Scribe

Audio Scribe больше не помещается в описание «бот для расшифровки». Когда появляются Files, document workflows, задачи, calendar, reminders, admin и разные AI providers, нужен слой управления этим хозяйством.

Agent-control-plane — попытка держать такие возможности в явной структуре: видеть, что работает, что включено, что запущено, что требует подтверждения и какие данные были созданы.

---

_Эта заметка описывает внутренний операционный слой Audio Scribe без рекламных обещаний: admin dashboard, feature flags, workflows, skills, MCP, memory, sandbox и artifacts как инженерные части реального продукта._
