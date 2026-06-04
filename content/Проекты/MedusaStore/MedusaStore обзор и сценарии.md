---
publish: true
title: "MedusaStore обзор и сценарии"
description: "Как MedusaStore выглядит с точки зрения покупателя, администратора, маркетолога, поддержки и разработчика."
created: 2026-06-04 04:24
updated: 2026-06-04 04:24
tags:
  - blog
cssclasses: ""
draft: false
preview_image: /images/medusastore-overview-cover.png
---

MedusaStore лучше рассматривать не как один storefront, а как набор сценариев вокруг магазина: покупатель выбирает товар и оформляет заказ, администратор управляет commerce-данными, маркетолог ведёт контент и кампании, поддержка работает с отзывами и коммуникациями, а разработчик получает повторяемую основу для следующего проекта.

Это важное отличие от обычного boilerplate. В проекте уже видны реальные продуктовые маршруты: каталог, корзина, checkout, аккаунт, отзывы, CMS-страницы, рассылочные настройки, российские интеграции и staging-деплой. Но часть функций намеренно оставлена opt-in или default-off, чтобы не выдавать подготовленную интеграцию за production-live сервис.

## Сценарий покупателя

Покупатель приходит в storefront StudioPro, видит премиальную бизнес-витрину, переходит в каталог, открывает карточку товара, добавляет позицию в корзину и проходит checkout. Storefront работает с Medusa Store API: backend остаётся source of truth для товаров, цен, корзин, заказов и checkout-состояний.

В пользовательском слое есть несколько важных деталей:

- catalog и product details routes для просмотра ассортимента;
- cart и checkout flow через прямые Store API endpoints;
- account routes для пользовательской зоны;
- reviews: публичные отзывы, rating summary, helpful votes, image uploads и moderation flow;
- static contacts и content pages, которые могут приходить из Payload при включённом CMS-слое.

VK ID onboarding предусмотрен как отдельный входной сценарий. Если у пользователя нет нормального email, используется placeholder email, а checkout gate не должен молча пропускать состояние, где для заказа не хватает обязательных данных.

## Сценарий администратора магазина

Администратор работает с commerce-частью через Medusa Admin и кастомные расширения. Backend содержит modules, workflows, subscribers, routes и admin widgets, поэтому магазин не ограничивается стандартной витриной Medusa.

Ключевые зоны администрирования:

- товары, варианты, цены и коммерческие сущности Medusa;
- moderation для отзывов;
- статусы заказов и fulfillment baseline;
- ручная доставка как базовый безопасный режим;
- opt-in интеграции YooKassa и ApiShip/Gorgo;
- transactional moderation emails и notification flows.

Live shipment execution через ApiShip выключен по умолчанию переменной `APISHIP_SHIPMENT_EXECUTION_ENABLED`. Это правильная граница: рассчитать или подготовить доставку можно безопаснее, чем автоматически создавать реальные отправления без отдельной операционной проверки.

## Сценарий маркетолога

Маркетологу важен не только каталог. В MedusaStore есть Payload CMS как отдельный content/admin слой: Pages, Posts, Media, Users, MarketingCampaigns, а также globals Navigation, Footer и SiteSettings.

Через этот слой можно вести страницы, новости, медиа, настройки навигации и маркетинговые кампании. В проекте предусмотрены drafts, preview и revalidation, но Payload не становится commerce backend. Он не хранит provider secrets, платежную правду или заказы.

Маркетинговый контур связан с preferences, campaigns, delivery journal, unsubscribe и double opt-in. Это не «просто форма подписки», а заготовка для нормальной коммуникационной дисциплины: кто согласился, на что согласился, что отправлено и как пользователь может отказаться.

## Сценарий поддержки

Поддержка соприкасается с отзывами, уведомлениями и спорными пользовательскими состояниями. В проекте есть reviews subsystem: публичные отзывы, rating summary, helpful votes, image uploads, moderation и административные widgets/routes.

Уведомления могут идти через local, SMTP, UniSender, SMS, VK или fallback/disabled semantics. Это удобно для staging и разработки: отсутствие production-провайдера не должно ломать весь checkout или moderation flow. Но для production всё равно нужен отдельный проход по SMTP/mailserver, deliverability, шаблонам и retry-поведению.

## Сценарий разработчика или агентства

Для разработчика MedusaStore ценен как повторяемая база. Root-level scripts управляют env, bootstrap, local dev, backend, storefront, Payload, smoke и staging deploy. Локально Docker Compose поднимает PostgreSQL, Redis и Medusa backend, а storefront и Payload чаще идут host processes.

На staging работает production-mode compose stack: PostgreSQL, Redis, Medusa backend, Payload CMS, Storefront, Caddy и optional AI Assistant. Canonical deploy — GitHub Actions `Deploy Staging`, secrets — только через GitHub Secrets/Variables.

В этом смысле MedusaStore хорошо ложится рядом с [[MedusaStore архитектура backend storefront и staging|архитектурным разбором проекта]] и инфраструктурными заметками вроде [[Инфраструктура Quartz-проекта команды preview CI и деплой|Quartz preview/CI/deploy]]: ценность не только в коде, но и в том, как система разворачивается и проверяется.

## Optional assistant

AI Assistant присутствует как optional слой: FastAPI service, backend adapter routes, reindex intents и storefront/widget integration. Но он выключен по умолчанию и не должен описываться как live-функция магазина. Это скорее подготовленная поверхность для будущего консультанта по каталогу, заказам, контенту и поддержке.

Подробнее этот слой вынесен отдельно в [[MedusaStore AI Assistant и roadmap production hardening|roadmap production hardening]], потому что смешивать ассистента с базовым checkout было бы нечестно: магазин может работать без него, а production-готовность ассистента требует отдельной безопасности, rate limiting и эксплуатационных правил.
