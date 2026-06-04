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

MedusaStore устроен вокруг простой, но важной идеи: у магазина должно быть понятное место, где живёт commerce truth, отдельная витрина для покупателя, отдельный слой для контента и безопасная площадка, где всё это можно проверить до production. Поэтому Medusa backend отвечает за товары, корзины и заказы, storefront показывает покупательский интерфейс, Payload CMS управляет контентом, PostgreSQL и Redis хранят состояние, а Caddy открывает наружу только нужные публичные endpoints staging-окружения.

Это не monolith «всё в одном Next.js», где storefront, админка, контент и commerce-логика смешаны в один большой runtime. Проект собран как несколько сервисов и процессов: каждый контур можно запускать локально, проверять smoke-сценариями и отдельно доводить до staging через GitHub Actions. Такое разделение делает архитектуру чуть сложнее на старте, зато помогает понимать, где искать ошибку и какую часть магазина безопасно менять.

## Root orchestration

В корне репозитория orchestration scripts управляют env, bootstrap, local dev, backend, storefront, Payload, smoke и staging deploy. Это не второстепенная обвязка, а способ удержать проект в одном рабочем ритме: без неё Medusa backend, Payload и storefront быстро превращаются в три отдельных приложения с разными привычками запуска.

Локальная модель такая:

- Docker Compose поднимает PostgreSQL, Redis и Medusa backend;
- storefront и Payload обычно работают как host processes;
- env-скрипты помогают не собирать конфигурацию вручную;
- smoke-скрипты проверяют только часть критичных поверхностей, а не весь production-contract.

## Medusa backend

Medusa backend построен на Medusa v2.13.6 и TypeScript. Это место, где магазин принимает решения о commerce-части: какие товары существуют, какие цены применяются, что лежит в корзине, как проходит checkout, как создаются заказы и какие workflows запускаются вокруг fulfillment. Эти данные должны жить здесь, а не в CMS, чтобы витрина и контентный слой не спорили между собой о состоянии магазина.

В backend есть кастомные modules, workflows, subscribers, Store/Admin routes и admin widgets. Это видно по функциональным зонам:

- product reviews: публичные отзывы, rating summary, helpful votes, image uploads, moderation, admin widgets/routes;
- marketing: preferences, campaigns, delivery journal, unsubscribe и double opt-in;
- notifications: local, SMTP, UniSender, SMS, VK и fallback/disabled semantics;
- fulfillment baseline: manual + ApiShip/Gorgo;
- YooKassa opt-in;
- VK ID onboarding;
- assistant adapter routes и reindex intents.

Такой backend уже ближе к проектному runtime, чем к чистому starter: вокруг него есть реальные доменные зоны, расширения и точки входа для админки. При этом часть интеграций включается только через env и feature-флаги, поэтому их нельзя описывать как безусловно live.

## Storefront

Storefront — shopper-facing приложение на Next.js 15.3.9 и React 19. Для читателя и покупателя это «сам магазин»: каталог, карточка товара, корзина, checkout, account, reviews, news/content pages и static contacts. Технически витрина использует Medusa SDK/UI, Tailwind и routes вокруг этого покупательского пути, но не становится источником commerce-правды.

Критичная деталь runtime — разные URL для server-side и browser calls:

- `MEDUSA_BACKEND_URL` используется server-side storefront-кодом;
- `NEXT_PUBLIC_MEDUSA_BACKEND_URL` используется браузером;
- на staging SSR должен ходить в backend по Docker-network адресу;
- браузер должен ходить через Caddy public ingress.

Эта граница кажется мелкой, пока всё запускается на одной машине. Но на staging она становится критичной: если смешать эти адреса, можно получить витрину, которая работает локально, но ломается из-за недоступного internal hostname или неправильного public origin.

## Payload CMS

Payload CMS — отдельный content/admin слой на Payload 3.83.0, Next.js 15.3.9 и PostgreSQL adapter. В нём живут Pages, Posts, Media, Users, MarketingCampaigns и globals Navigation, Footer, SiteSettings.

Payload нужен для того, что должно редактироваться как контент: страницы, публикации, preview, drafts, revalidation и маркетинговые сущности. Он не должен хранить commerce truth или provider/payment secrets. Storefront читает Payload только при `PAYLOAD_ENABLED`; если CMS выключен или данных нет, content routes должны уходить в fallback/not-found поведение.

Подробнее эта граница разобрана в [[MedusaStore Payload CMS контент и маркетинг|заметке про Payload CMS]].

## Staging runtime

Сейчас у проекта есть single staging environment на `studio.slavx.ru`. Его роль — быть репетицией магазина перед настоящим production-контуром: проверить, как backend, storefront, CMS, база, Redis и публичный ingress ведут себя вместе, не выдавая staging за production. Production ещё не provisioned, и это нужно проговаривать отдельно. Staging — не синоним production, даже если compose stack запущен в production mode.

Staging services:

- PostgreSQL;
- Redis;
- Medusa backend;
- Payload CMS;
- Storefront;
- Caddy;
- optional AI Assistant.

Public ingress — только Caddy, без Nginx. Это важная граница безопасности и сопровождения: наружу должен смотреть один понятный вход, а не набор случайно опубликованных сервисов. Caddyfile содержит staging subdomains и S3 proxy, поэтому его стоит считать частью staging surface, а не универсальным production ingress без ревизии.

Canonical deploy — GitHub Actions `Deploy Staging`. Secrets и variables должны приходить через GitHub Secrets/Variables, а не через коммит в репозиторий. Так staging остаётся проверочным контуром, а не местом, где конфигурацию собирают вручную и потом пытаются вспомнить, что именно изменилось.

## Health, smoke и границы проверки

В проекте есть smoke-проверки, и они полезны как ранний сигнал: сервис поднялся, основные endpoints отвечают, staging не развалился сразу после deploy. Но текущего покрытия недостаточно для уверенного production-readiness. Особенно важно отдельно пройти product/cart/checkout/API critical paths, потому что именно они определяют работоспособность магазина.

Риски, которые нельзя замалчивать:

- production не provisioned;
- Payload secret может быть пустым;
- staging smoke не покрывает весь критичный checkout и API-контракт;
- storefront build сейчас игнорирует ESLint и TypeScript build errors;
- AI Assistant optional/default-off;
- assistant rate limiting in-memory.

Похожая честная граница между runtime и production-контуром есть в [[Audio Scribe архитектура backend очереди и production-контур|Audio Scribe]], только там домен другой: очереди, транскрибация и agent/control-plane, а здесь commerce, storefront и CMS.

Главная мысль этой архитектуры — не в количестве сервисов, а в ясных границах ответственности. Backend хранит commerce-правду, storefront превращает её в покупательский путь, Payload даёт управляемый контент, а staging позволяет проверить связку до того, как магазин станет production-системой.
