---
publish: true
title: "MedusaStore"
description: "E-commerce runtime и template на Medusa, Next.js, Payload CMS и staging-инфраструктуре для российских проектов."
created: 2026-06-04 04:24
updated: 2026-06-04 04:24
tags:
  - blog
  - project
cssclasses: ""
draft: false
preview_image: "/images/medusastore-cover.webp"
---

MedusaStore — входная точка в проект про e-commerce runtime, который собирает вокруг Medusa не только магазинную логику, но и всё, что обычно быстро расползается по отдельным репозиториям: витрину, контент, интеграции, staging и будущие production-задачи. Это не starter «поставил и забыл» и не демо-магазин ради скриншотов, а основа, на которой можно разбирать, как устроена рабочая storefront-система.

В центре проекта — понятное разделение ролей. Medusa backend хранит commerce-данные, Next.js storefront показывает покупателю каталог и checkout, Payload CMS даёт редакторам контентные страницы и маркетинговые сущности, а staging-контур связывает сервисы в повторяемый runtime. Российские платежи, доставка, уведомления, VK ID и optional AI Assistant не существуют отдельно от этой схемы: они показывают, где платформа соприкасается с реальными операционными сценариями.

Главная идея MedusaStore — дать агентству или продуктовой команде не голый шаблон, а рабочую стартовую точку для магазинов и сервисных storefront-витрин. Внутри уже есть каталог, карточки товаров, корзина, checkout, аккаунт, отзывы, контентные страницы, маркетинговые кампании, уведомления, российские платежные и доставочные интеграции, staging deploy и optional AI Assistant.

При этом проект не притворяется завершённым production-продуктом. Важно честно разделять уровни готовности: сейчас provisioned-окружение — staging на `studio.slavx.ru`, а production ещё не выделен отдельно. Часть возможностей реализована как baseline или opt-in: YooKassa включается через конфигурацию, live ApiShip shipment execution выключен по умолчанию, AI Assistant тоже optional/default-off.

## Из чего состоит MedusaStore

Проект удобнее читать как карту нескольких связанных поверхностей. Каждая отвечает за свою часть системы, а вместе они показывают путь от карточки товара до админских процессов и deploy:

- **root orchestration**: scripts для env, bootstrap, local dev, backend, storefront, Payload, smoke и staging deploy;
- **Medusa backend**: Medusa v2.13.6, TypeScript, PostgreSQL, Redis, кастомные modules, workflows, subscribers, Store/Admin API routes и admin widgets;
- **storefront StudioPro**: Next.js 15.3.9, React 19, Medusa SDK/UI, Tailwind, каталог, product details, cart, checkout, account, reviews и content routes;
- **Payload CMS**: Payload 3.83.0, Next.js, PostgreSQL adapter, коллекции Pages, Posts, Media, Users, MarketingCampaigns и globals для navigation/footer/settings;
- **staging runtime**: Docker Compose, Caddy как единственный public ingress, GitHub Actions deploy;
- **optional AI Assistant**: FastAPI service, backend adapter routes и storefront/widget integration, но без включения по умолчанию.

Такой состав делает MedusaStore ближе к runtime/template, чем к «магазину из README». Здесь уже заложены границы между commerce truth, контентом, публичной витриной, инфраструктурой и будущими production-задачами — поэтому материалы ниже лучше читать не как разрозненные заметки, а как разные входы в одну систему.

## Что важно в архитектуре

Архитектура держится на простом принципе: у каждой части есть своя зона ответственности, и эти границы не стоит размывать. Commerce source of truth находится в Medusa backend. Payload не должен становиться местом хранения заказов, платежных секретов или provider-credentials: он отвечает за страницы, посты, медиа, настройки сайта и маркетинговые сущности. Storefront читает Payload только при включённом `PAYLOAD_ENABLED`, а content routes имеют fallback/not-found поведение.

Для staging используется Docker-network разделение URL: server-side storefront-запросы ходят в `MEDUSA_BACKEND_URL`, а browser-запросы — в `NEXT_PUBLIC_MEDUSA_BACKEND_URL`, потому что SSR должен обращаться к backend внутри compose-сети, а браузер — через Caddy. Это маленькая, но важная деталь: без неё checkout и каталог легко начинают работать «только локально», а на staging проявляют расхождение между серверным и браузерным путём к backend.

## Подробнее

Если заходить в проект впервые, начните с обзора сценариев: он объясняет, кто пользуется системой и какие задачи видит каждая роль. После этого архитектура показывает, почему backend, storefront, Payload и staging разделены именно так. Storefront-материал раскрывает публичную витрину, статья про Payload — контентный слой, интеграции — российский operational-контур, а roadmap фиксирует, что ещё нужно усилить перед production.

- [[MedusaStore обзор и сценарии|обзор пользовательских сценариев]] — что делает покупатель, администратор, маркетолог, оператор поддержки и разработчик;
- [[MedusaStore архитектура backend storefront и staging|архитектура backend, storefront, Payload и staging]] — runtime, Caddy, Docker-network URLs, smoke и границы production;
- [[MedusaStore storefront StudioPro и UI|storefront StudioPro и UI]] — дизайн, routes, карточки, checkout/account/reviews и presets;
- [[MedusaStore Payload CMS контент и маркетинг|Payload CMS, контент и маркетинг]] — коллекции, globals, drafts, preview, revalidation и boundaries;
- [[MedusaStore российские интеграции YooKassa ApiShip VK ID и уведомления|российские интеграции]] — YooKassa, ApiShip/Gorgo, VK ID, уведомления и marketing consent;
- [[MedusaStore AI Assistant и roadmap production hardening|AI Assistant и roadmap production hardening]] — optional FastAPI assistant и список engineering gaps перед production.

По характеру проект ближе к [[BOOK-LIBRARY архитектура|BOOK-LIBRARY]] и [[Audio Scribe архитектура backend очереди и production-контур|Audio Scribe]]: это не одна страница, а система с несколькими runtime-поверхностями, интеграциями и эксплуатационными ограничениями. Индексная страница нужна как навигационная рамка: быстро понять, что уже описано, где искать детали и какие части проекта пока остаются зоной аккуратного production hardening.
