---
publish: true
title: "MedusaStore storefront StudioPro и UI"
description: "Разбор витрины StudioPro: дизайн, маршруты, карточки, checkout, аккаунт, отзывы, presets и build-risk."
created: 2026-06-04 04:24
updated: 2026-06-04 04:24
tags:
  - blog
cssclasses: ""
draft: false
preview_image: /images/medusastore-storefront-cover.png
---

Storefront в MedusaStore называется StudioPro. Это shopper-facing приложение на Next.js 15.3.9, React 19, Medusa SDK/UI и Tailwind, которое показывает магазин не как абстрактный starter, а как готовую бизнес-витрину с каталогом, офферами, checkout, аккаунтом, отзывами и контентными страницами.

Брендовая формула StudioPro звучит спокойно: «Премиальные сайты для бизнеса. Без лишних переплат». Это задаёт тон интерфейса: не маркетплейс с шумной сеткой, а премиальная сервисная витрина для бизнеса.

## Визуальный язык

Дизайн строится вокруг premium-business подачи:

- тёплый фон вместо холодной SaaS-белизны;
- графитовая типографика;
- глубокий синий как основной акцент доверия;
- teal-акцент для действий и выделений;
- карточки предложений;
- заметные CTA;
- блоки процесса работы;
- спокойная плотность интерфейса без ощущения demo-template.

Для портфельного проекта это важнее, чем кажется. Storefront показывает не только техническую способность подключиться к Medusa, но и умение собрать коммерческую подачу: объяснить продукт, провести пользователя по маршруту и не утонуть в стандартных storefront-компонентах.

## Routes и покупательский путь

Витрина включает основные зоны:

- catalog routes;
- product details;
- cart;
- checkout;
- account;
- reviews;
- news/content pages;
- static contacts.

Catalog и product details обращаются к Medusa как commerce source of truth. Cart и checkout используют прямые Store API endpoints. Content routes могут читать Payload, но только если включён `PAYLOAD_ENABLED`; иначе они должны корректно уходить в fallback или not-found.

## Checkout и аккаунт

Checkout — центральная проверка зрелости storefront. В MedusaStore он не должен зависеть от CMS и не должен считать optional-интеграции обязательными. Базовый checkout работает через Store API, а платежи и доставка подключаются opt-in.

VK ID onboarding добавляет отдельный крайний случай: если вход через VK ID не даёт обычный email, появляется placeholder email. Поэтому checkout gate должен честно проверять, хватает ли данных для заказа, а не считать OAuth-login полноценным покупательским профилем автоматически.

Account routes нужны для post-purchase сценариев и пользовательской зоны. Их ценность становится выше, когда рядом есть отзывы, уведомления и маркетинговые preferences.

## Reviews как часть доверия

В проекте есть полноценная зона отзывов:

- публичные reviews;
- rating summary;
- helpful votes;
- image uploads;
- moderation;
- admin widgets/routes;
- transactional moderation emails.

Это хороший пример функции, которая выглядит «маленькой» в UI, но требует backend-процессов и операционной поддержки. Отзыв — не просто текст на карточке товара: его нужно принять, проверить, показать, дать пользователям голосовать за полезность и уведомить участников процесса.

## Presets atelier и market

Storefront поддерживает presets `atelier` и `market`, которые выбираются через `NEXT_PUBLIC_STOREFRONT_PRESET`. Это делает основу гибче: один и тот же runtime можно подстраивать под более сервисную или более торговую подачу.

Важно, что presets не должны превращаться в хаотичную тему «всё обо всём». Хороший preset меняет акценты и композицию, но сохраняет общий контракт routes, checkout, CMS и commerce API.

## Production-readiness gap

У storefront есть честный риск: build сейчас игнорирует ESLint и TypeScript build errors. Для staging это может быть терпимым временным решением, если нужно быстро проверить runtime, но для production это gap.

Перед production нужно вернуть строгую сборку или как минимум разделить временный staging bypass и production gate. Иначе типовая ошибка в checkout, account или API client может пройти в релиз как «зелёный build».

В этом MedusaStore похож на другие широкие проекты сайта: как и в [[Audio Scribe архитектура backend очереди и production-контур|Audio Scribe]], production-readiness определяется не только наличием экранов, но и качеством runtime-контракта, проверок и отказоустойчивости.
