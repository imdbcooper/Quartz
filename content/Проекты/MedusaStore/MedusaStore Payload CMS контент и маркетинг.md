---
publish: true
title: "MedusaStore Payload CMS контент и маркетинг"
description: "Payload CMS как content/admin слой MedusaStore: страницы, посты, медиа, кампании, preview и границы с commerce."
created: 2026-06-04 04:24
updated: 2026-06-04 04:24
tags:
  - blog
cssclasses: ""
draft: false
preview_image: /images/medusastore-payload-cover.png
---

Payload CMS в MedusaStore — это не замена Medusa backend и не место, куда нужно складывать всю правду о магазине. Его роль точнее: content/admin слой для страниц, постов, медиа, навигации, footer, site settings и маркетинговых кампаний.

Такое разделение делает проект устойчивее. Commerce-сущности живут в Medusa, контент — в Payload, витрина собирает пользовательский опыт поверх обоих источников, а staging runtime проверяет, что эти части умеют работать вместе.

## Коллекции и globals

Payload построен на Payload 3.83.0, Next.js 15.3.9 и PostgreSQL adapter. Основные коллекции:

- Pages;
- Posts;
- Media;
- Users;
- MarketingCampaigns.

Globals:

- Navigation;
- Footer;
- SiteSettings.

Этого набора достаточно, чтобы вести обычный сайт магазина: посадочные страницы, новости, изображения, меню, подвал, настройки сайта и маркетинговые кампании. При этом каталог и заказы остаются в Medusa.

## Drafts, preview и revalidation

В CMS-слое предусмотрены drafts, preview и revalidation. Это важно для рабочих процессов маркетолога: можно подготовить страницу, посмотреть её до публикации и обновить storefront без ручного пересобирания всего проекта.

Но preview/revalidation должны быть защищены и правильно связаны с окружением. Staging и production не должны случайно использовать одни и те же secrets или endpoints. Сейчас production ещё не provisioned, поэтому эту границу нельзя считать закрытой.

## Storefront и PAYLOAD_ENABLED

Storefront читает Payload только при `PAYLOAD_ENABLED`. Это правильный feature boundary: магазин должен уметь жить без CMS-данных, особенно на раннем bootstrap или в окружении, где content layer временно выключен.

Content routes при этом должны иметь fallback/not-found поведение. Пользователь не должен видеть stack trace только потому, что маркетинговая страница ещё не опубликована или Payload временно недоступен.

## MarketingCampaigns и коммуникации

MarketingCampaigns в Payload связаны с более широким marketing backend-контуром: preferences, campaigns, delivery journal, unsubscribe и double opt-in. Такой набор нужен, чтобы маркетинг не превращался в «отправить всем письмо из админки».

Нормальная маркетинговая система должна отвечать на вопросы:

- кто дал согласие;
- на какой канал и тип коммуникации;
- какая кампания была отправлена;
- был ли delivery event;
- как пользователь может отписаться;
- как обрабатывается double opt-in.

В MedusaStore эта дисциплина заложена, но production-доведение всё равно требует проверки SMTP/mailserver, deliverability, retry, шаблонов и прав доступа.

## Граница с commerce truth

Payload не должен хранить:

- платежные секреты;
- provider credentials;
- финальную правду о заказах;
- checkout state;
- fulfillment decisions;
- товарные цены как источник истины.

Эти данные относятся к Medusa backend и интеграционному слою. CMS может показывать промо-блоки, страницы и кампании, но не должна становиться вторым commerce backend.

Такой подход хорошо сочетается с [[MedusaStore архитектура backend storefront и staging|общей архитектурой MedusaStore]] и напоминает принцип разделения источников в [[Книжная полка в Quartz static catalog mirrored covers и fallback к BOOK-LIBRARY|Quartz static catalog]]: контентный слой может помогать интерфейсу, но не должен ломать основной источник данных.
