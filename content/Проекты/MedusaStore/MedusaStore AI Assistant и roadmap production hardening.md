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

AI Assistant в MedusaStore — optional слой, а не обязательная часть checkout. Это важно проговорить сразу: магазин, каталог, корзина и базовый storefront не должны зависеть от ассистента. Покупатель должен иметь возможность выбрать товар, собрать корзину и дойти до оплаты даже тогда, когда AI-контур полностью выключен.

Зачем тогда он нужен? У e-commerce-проекта быстро появляются вопросы, которые не укладываются в одну кнопку: какой товар подходит под задачу, где найти нужную страницу с условиями, как объяснить разницу между вариантами, что показать оператору поддержки, когда контент или каталог обновились. Assistant layer — попытка вынести такие сценарии в отдельную управляемую поверхность, не смешивая их с критичным контуром магазина.

В проекте уже есть FastAPI service, backend adapter routes, storefront/widget integration и reindex intents через backend. По ним видно, куда может развиваться слой: консультант по товарам, контенту, поддержке и, возможно, внутренним операциям магазина. Но до production-ready assistant ещё нужен отдельный hardening: не только «чтобы отвечал», а чтобы отвечал в правильных границах и не становился новой точкой риска.

## Как устроен assistant layer

Слой ассистента состоит из нескольких частей:

- optional FastAPI service;
- backend adapter routes;
- reindex intents через backend;
- установленный adapter/widget в storefront;
- default-off конфигурация.

Такой дизайн безопаснее, чем вшивать AI прямо в checkout или product page. В живом магазине ассистент не должен быть скрытой зависимостью для покупки: если он выключен, магазин продолжает работать; если включён — у него должны быть понятные boundaries. Важно заранее ответить на простые, но неприятные вопросы: к каким данным он имеет доступ, какие действия может выполнять, что только подсказывает, а что реально меняет.

## Возможные сценарии

Потенциально assistant может закрывать не абстрактный «чат ради чата», а конкретные пользовательские и операционные сценарии:

- выбирать товар по требованиям;
- объяснять условия доставки и оплаты;
- находить контентные страницы из Payload;
- отвечать на вопросы по заказу, если есть безопасный account-bound контекст;
- помогать оператору поддержки;
- инициировать reindex после изменения контента или каталога.

Но часть этих сценариев — roadmap. Их нельзя описывать как live-функции без проверки доступа, prompt boundaries, audit trail и обработки ошибок. Особенно там, где рядом появляются заказ, аккаунт или действие в админском контуре: полезная автоматизация начинается с подсказки, а production-ответственность — с того момента, когда система может повлиять на деньги, данные или статус заказа.

## Почему default-off — правильно

AI Assistant default-off — хорошее решение для e-commerce template. В магазине есть критичные домены: деньги, доставка, персональные данные, статусы заказов. Ошибка в обычном виджете раздражает пользователя; ошибка рядом с оплатой или доставкой уже превращается в операционную проблему. Поэтому любой assistant, который получает доступ к таким данным, должен быть ограничен правами, журналированием и rate limits.

Сейчас rate limiting у assistant in-memory. Для staging этого может хватить: можно проверить интеграцию, сценарии и базовую устойчивость. Для production нужен более надёжный механизм: Redis-backed limits, account/IP policies, abuse monitoring и понятные ответы при превышении лимитов. Иначе assistant легко становится не помощником, а ещё одним публичным endpoint без достаточной защиты.

## Roadmap production hardening

Перед production стоит закрыть несколько направлений. Это не список «когда-нибудь улучшить», а граница между демонстрационной сборкой и магазином, которому можно доверять реальные заказы, платежи, уведомления и пользовательские данные.

### Storefront build gate

Сейчас storefront build игнорирует ESLint и TypeScript build errors. Это нужно исправить или как минимум сделать production gate строгим. Staging может временно терпеть bypass, чтобы не блокировать исследование интеграций, но production не должен принимать checkout/account/API ошибки как успешный build. Иначе команда узнает о проблеме не на этапе сборки, а уже из пользовательского сценария.

### Checkout и Store API smoke

Staging smoke недостаточно покрывает product/cart/checkout/API critical paths. Для магазина это самые чувствительные маршруты: если они ломаются, красивый storefront уже не спасает. Нужны проверки:

- получение каталога;
- открытие карточки товара;
- создание корзины;
- изменение line items;
- прохождение checkout до безопасной границы;
- provider fallback;
- account/auth edge cases;
- reviews flow.

### Secrets и environment boundaries

Payload secret может быть пустым, а production ещё не provisioned. Это тот тип мелочи, который легко пропустить в разработке и дорого разбирать после выката. Нужно разделить staging и production secrets, проверить обязательные env и запретить опасные default-значения в production-mode.

### Payments, delivery и notifications

YooKassa, ApiShip/Gorgo, SMTP, UniSender, SMS и VK требуют отдельного production checklist: credentials, webhooks, retries, idempotency, логирование, ручной recovery, unsubscribe/double opt-in и delivery journal. В этих интеграциях важен не только happy path, но и то, что происходит при сетевой ошибке, повторном webhook, недоставленном письме или ручном разборе заказа.

### Caddy и ingress

Public ingress сейчас — Caddy, без Nginx. Caddyfile содержит staging subdomains и S3 proxy. Перед production нужна ревизия доменов, TLS, proxy headers, лимитов, security headers, observability и разделения staging/prod маршрутов. Это скучная часть инфраструктуры, но именно она определяет, насколько предсказуемо магазин будет вести себя под реальным внешним трафиком.

### Assistant hardening

Для assistant hardening особенно важен, потому что он стоит на границе между удобным диалогом и действиями внутри магазина. Нужны:

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

Главная мысль этого roadmap простая: AI Assistant может быть полезным расширением MedusaStore, если остаётся отделённым от критичного пути покупки и получает production-ограничения раньше, чем доступ к опасным действиям. Тогда это не рекламная AI-надстройка, а аккуратный следующий слой магазина, который можно развивать без потери контроля над checkout, заказами и данными.
