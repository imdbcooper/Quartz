---
publish: true
title: "MedusaStore архитектура backend storefront и staging"
description: "Как связаны Medusa backend, Next.js storefront, Payload CMS, PostgreSQL, Redis, Caddy и staging deploy."
created: 2026-06-04 04:24
updated: 2026-06-04 04:24
tags:
  - blog
cssclasses: ""
draft: false
preview_image: /images/medusastore-architecture-cover.png
---

Архитектура MedusaStore держится на простом разделении: Medusa backend отвечает за commerce truth, storefront показывает покупательский интерфейс, Payload CMS управляет контентом, PostgreSQL и Redis дают состояние, а Caddy открывает наружу только нужные публичные endpoints staging-окружения.

Это не monolith «всё в одном Next.js». Проект собран как несколько сервисов и процессов, которые можно поднимать локально, проверять smoke-сценариями и деплоить на staging через GitHub Actions.

## Root orchestration

В корне репозитория orchestration scripts управляют env, bootstrap, local dev, backend, storefront, Payload, smoke и staging deploy. Это важная часть проекта: без неё Medusa backend, Payload и storefront быстро превращаются в три отдельных приложения с разными привычками запуска.

Локальная модель такая:

- Docker Compose поднимает PostgreSQL, Redis и Medusa backend;
- storefront и Payload обычно работают как host processes;
- env-скрипты помогают не собирать конфигурацию вручную;
- smoke-скрипты проверяют только часть критичных поверхностей, а не весь production-contract.

## Medusa backend

Medusa backend построен на Medusa v2.13.6 и TypeScript. Он является commerce source of truth: товары, цены, корзины, checkout, заказы, fulfillment и связанные workflows должны жить здесь, а не в CMS.

В backend есть кастомные modules, workflows, subscribers, Store/Admin routes и admin widgets. Это видно по функциональным зонам:

- product reviews: публичные отзывы, rating summary, helpful votes, image uploads, moderation, admin widgets/routes;
- marketing: preferences, campaigns, delivery journal, unsubscribe и double opt-in;
- notifications: local, SMTP, UniSender, SMS, VK и fallback/disabled semantics;
- fulfillment baseline: manual + ApiShip/Gorgo;
- YooKassa opt-in;
- VK ID onboarding;
- assistant adapter routes и reindex intents.

Такой backend уже ближе к проектному runtime, чем к чистому starter. Но часть интеграций включается только через env и feature-флаги, поэтому их нельзя описывать как безусловно live.

## Storefront

Storefront — shopper-facing приложение на Next.js 15.3.9 и React 19. Оно использует Medusa SDK/UI, Tailwind и набор routes вокруг покупательского пути: catalog, product details, cart, checkout, account, reviews, news/content pages и static contacts.

Критичная деталь runtime — разные URL для server-side и browser calls:

- `MEDUSA_BACKEND_URL` используется server-side storefront-кодом;
- `NEXT_PUBLIC_MEDUSA_BACKEND_URL` используется браузером;
- на staging SSR должен ходить в backend по Docker-network адресу;
- браузер должен ходить через Caddy public ingress.

Если смешать эти адреса, можно получить витрину, которая работает локально, но ломается на staging из-за недоступного internal hostname или неправильного public origin.

## Payload CMS

Payload CMS — отдельный content/admin слой на Payload 3.83.0, Next.js 15.3.9 и PostgreSQL adapter. В нём живут Pages, Posts, Media, Users, MarketingCampaigns и globals Navigation, Footer, SiteSettings.

Payload нужен для контента, preview, drafts, revalidation и маркетинговых сущностей. Он не должен хранить commerce truth или provider/payment secrets. Storefront читает Payload только при `PAYLOAD_ENABLED`; если CMS выключен или данных нет, content routes должны уходить в fallback/not-found поведение.

Подробнее эта граница разобрана в [[MedusaStore Payload CMS контент и маркетинг|заметке про Payload CMS]].

## Staging runtime

Сейчас у проекта есть single staging environment на `studio.slavx.ru`. Production ещё не provisioned, и это нужно проговаривать отдельно. Staging — не синоним production, даже если compose stack запущен в production mode.

Staging services:

- PostgreSQL;
- Redis;
- Medusa backend;
- Payload CMS;
- Storefront;
- Caddy;
- optional AI Assistant.

Public ingress — только Caddy, без Nginx. Caddyfile содержит staging subdomains и S3 proxy, поэтому его стоит считать частью staging surface, а не универсальным production ingress без ревизии.

Canonical deploy — GitHub Actions `Deploy Staging`. Secrets и variables должны приходить через GitHub Secrets/Variables, а не через коммит в репозиторий.

## Health, smoke и границы проверки

В проекте есть smoke-проверки, но текущего покрытия недостаточно для уверенного production-readiness. Особенно важно отдельно пройти product/cart/checkout/API critical paths, потому что именно они определяют работоспособность магазина.

Риски, которые нельзя замалчивать:

- production не provisioned;
- Payload secret может быть пустым;
- staging smoke не покрывает весь критичный checkout и API-контракт;
- storefront build сейчас игнорирует ESLint и TypeScript build errors;
- AI Assistant optional/default-off;
- assistant rate limiting in-memory.

Похожая честная граница между runtime и production-контуром есть в [[Audio Scribe архитектура backend очереди и production-контур|Audio Scribe]], только там домен другой: очереди, транскрибация и agent/control-plane, а здесь commerce, storefront и CMS.
