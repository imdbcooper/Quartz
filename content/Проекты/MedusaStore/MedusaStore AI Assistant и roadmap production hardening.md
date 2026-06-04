---
publish: true
title: "MedusaStore AI Assistant и roadmap production hardening"
description: "Optional AI Assistant в MedusaStore и честный roadmap до production-ready магазина."
created: 2026-06-04 04:24
updated: 2026-06-04 04:24
tags:
  - blog
cssclasses: ""
draft: false
preview_image: /images/medusastore-ai-roadmap-cover.png
---

AI Assistant в MedusaStore — optional слой, а не обязательная часть checkout. Это важно проговорить сразу: магазин, каталог, корзина и базовый storefront не должны зависеть от ассистента. Ассистент установлен как возможность для будущего развития, но выключен по умолчанию.

В проекте есть FastAPI service, backend adapter routes, storefront/widget integration и reindex intents через backend. Этого достаточно, чтобы видеть направление: консультант по товарам, контенту, поддержке и, возможно, внутренним операциям магазина. Но до production-ready assistant ещё нужен отдельный hardening.

## Как устроен assistant layer

Слой ассистента состоит из нескольких частей:

- optional FastAPI service;
- backend adapter routes;
- reindex intents через backend;
- установленный adapter/widget в storefront;
- default-off конфигурация.

Такой дизайн лучше, чем вшивать AI прямо в checkout или product page. Если ассистент выключен, магазин должен продолжать работать. Если ассистент включён, он должен иметь понятные boundaries: к каким данным имеет доступ, какие действия может выполнять, что только подсказывает, а что реально меняет.

## Возможные сценарии

Потенциально assistant может помогать:

- выбирать товар по требованиям;
- объяснять условия доставки и оплаты;
- находить контентные страницы из Payload;
- отвечать на вопросы по заказу, если есть безопасный account-bound контекст;
- помогать оператору поддержки;
- инициировать reindex после изменения контента или каталога.

Но часть этих сценариев — roadmap. Их нельзя описывать как live-функции без проверки доступа, prompt boundaries, audit trail и обработки ошибок.

## Почему default-off — правильно

AI Assistant default-off — хорошее решение для e-commerce template. В магазине есть критичные домены: деньги, доставка, персональные данные, статусы заказов. Любой assistant, который получает доступ к этим данным, должен быть ограничен правами, журналированием и rate limits.

Сейчас rate limiting у assistant in-memory. Для staging этого может хватить, но для production нужен более устойчивый механизм: Redis-backed limits, account/IP policies, abuse monitoring и понятные ответы при превышении лимитов.

## Roadmap production hardening

Перед production стоит закрыть несколько направлений.

### Storefront build gate

Сейчас storefront build игнорирует ESLint и TypeScript build errors. Это нужно исправить или как минимум сделать production gate строгим. Staging может временно терпеть bypass, но production не должен принимать checkout/account/API ошибки как успешный build.

### Checkout и Store API smoke

Staging smoke недостаточно покрывает product/cart/checkout/API critical paths. Нужны проверки:

- получение каталога;
- открытие карточки товара;
- создание корзины;
- изменение line items;
- прохождение checkout до безопасной границы;
- provider fallback;
- account/auth edge cases;
- reviews flow.

### Secrets и environment boundaries

Payload secret может быть пустым, а production ещё не provisioned. Нужно разделить staging и production secrets, проверить обязательные env и запретить опасные default-значения в production-mode.

### Payments, delivery и notifications

YooKassa, ApiShip/Gorgo, SMTP, UniSender, SMS и VK требуют отдельного production checklist: credentials, webhooks, retries, idempotency, логирование, ручной recovery, unsubscribe/double opt-in и delivery journal.

### Caddy и ingress

Public ingress сейчас — Caddy, без Nginx. Caddyfile содержит staging subdomains и S3 proxy. Перед production нужна ревизия доменов, TLS, proxy headers, лимитов, security headers, observability и разделения staging/prod маршрутов.

### Assistant hardening

Для assistant нужны:

- persistent/distributed rate limiting;
- строгие tool/action permissions;
- audit log;
- prompt/data boundaries;
- безопасный account context;
- fallback при недоступности FastAPI service;
- выключатель на уровне env/feature flag;
- отдельные smoke и abuse tests.

## Как это связано с другими проектами

AI-направление MedusaStore логично сравнивать не с обычным чат-виджетом, а с более широкими agent/control-plane темами вроде [[Audio Scribe Agent Control Plane admin dashboard workflows skills MCP и memory|Audio Scribe Agent Control Plane]]. Разница в том, что в e-commerce домене assistant должен быть ещё осторожнее: он находится рядом с оплатой, доставкой и персональными данными.

Для retrieval и индексации полезны параллели с [[RAG Content Pipeline от сырых документов к базе знаний|RAG Content Pipeline]] и [[Hybrid Retrieval на LightRAG]], но MedusaStore пока не стоит описывать как полноценный RAG-продукт. Здесь правильнее говорить о подготовленной optional AI-поверхности и roadmap до безопасного production.
