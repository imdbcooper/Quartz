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
preview_image: /images/medusastore-cover.png
---

MedusaStore — это не просто starter на Medusa и не демо-магазин «поставил и забыл». По факту это зрелая основа для запуска e-commerce проектов: Medusa backend держит commerce-данные, Next.js storefront показывает витрину, Payload CMS отвечает за контент и маркетинговые страницы, а staging-контур собирает всё это в повторяемый runtime.

Главная идея проекта — дать агентству или продуктовой команде не голый шаблон, а рабочую стартовую точку для магазинов и сервисных storefront-витрин. Внутри уже есть каталог, карточки товаров, корзина, checkout, аккаунт, отзывы, контентные страницы, маркетинговые кампании, уведомления, российские платежные и доставочные интеграции, staging deploy и optional AI Assistant.

При этом важно честно разделять уровни готовности. Сейчас provisioned-окружение — staging на `studio.slavx.ru`. Production ещё не выделен отдельно. Некоторые возможности реализованы как baseline или opt-in: YooKassa включается через конфигурацию, live ApiShip shipment execution выключен по умолчанию, AI Assistant тоже optional/default-off.

## Из чего состоит MedusaStore

Проект собран из нескольких поверхностей:

- **root orchestration**: scripts для env, bootstrap, local dev, backend, storefront, Payload, smoke и staging deploy;
- **Medusa backend**: Medusa v2.13.6, TypeScript, PostgreSQL, Redis, кастомные modules, workflows, subscribers, Store/Admin API routes и admin widgets;
- **storefront StudioPro**: Next.js 15.3.9, React 19, Medusa SDK/UI, Tailwind, каталог, product details, cart, checkout, account, reviews и content routes;
- **Payload CMS**: Payload 3.83.0, Next.js, PostgreSQL adapter, коллекции Pages, Posts, Media, Users, MarketingCampaigns и globals для navigation/footer/settings;
- **staging runtime**: Docker Compose, Caddy как единственный public ingress, GitHub Actions deploy;
- **optional AI Assistant**: FastAPI service, backend adapter routes и storefront/widget integration, но без включения по умолчанию.

Такой состав делает MedusaStore ближе к runtime/template, чем к «магазину из README». Здесь уже заложены границы между commerce truth, контентом, публичной витриной, инфраструктурой и будущими production-задачами.

## Что важно в архитектуре

Commerce source of truth находится в Medusa backend. Payload не должен становиться местом хранения заказов, платежных секретов или provider-credentials: он отвечает за страницы, посты, медиа, настройки сайта и маркетинговые сущности. Storefront читает Payload только при включённом `PAYLOAD_ENABLED`, а content routes имеют fallback/not-found поведение.

Для staging используется Docker-network разделение URL: server-side storefront-запросы ходят в `MEDUSA_BACKEND_URL`, а browser-запросы — в `NEXT_PUBLIC_MEDUSA_BACKEND_URL`, потому что SSR должен обращаться к backend внутри compose-сети, а браузер — через Caddy. Это маленькая, но важная деталь, без которой checkout и каталог легко начинают работать «только локально».

## Подробнее

- [[MedusaStore обзор и сценарии|обзор пользовательских сценариев]] — что делает покупатель, администратор, маркетолог, оператор поддержки и разработчик;
- [[MedusaStore архитектура backend storefront и staging|архитектура backend, storefront, Payload и staging]] — runtime, Caddy, Docker-network URLs, smoke и границы production;
- [[MedusaStore storefront StudioPro и UI|storefront StudioPro и UI]] — дизайн, routes, карточки, checkout/account/reviews и presets;
- [[MedusaStore Payload CMS контент и маркетинг|Payload CMS, контент и маркетинг]] — коллекции, globals, drafts, preview, revalidation и boundaries;
- [[MedusaStore российские интеграции YooKassa ApiShip VK ID и уведомления|российские интеграции]] — YooKassa, ApiShip/Gorgo, VK ID, уведомления и marketing consent;
- [[MedusaStore AI Assistant и roadmap production hardening|AI Assistant и roadmap production hardening]] — optional FastAPI assistant и список engineering gaps перед production.

По характеру проект ближе к [[BOOK-LIBRARY архитектура|BOOK-LIBRARY]] и [[Audio Scribe архитектура backend очереди и production-контур|Audio Scribe]]: это не одна страница, а система с несколькими runtime-поверхностями, интеграциями и эксплуатационными ограничениями.
