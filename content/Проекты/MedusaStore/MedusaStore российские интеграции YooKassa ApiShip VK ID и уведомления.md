---
publish: true
title: "MedusaStore российские интеграции YooKassa ApiShip VK ID и уведомления"
description: "Российский интеграционный слой MedusaStore: YooKassa, ApiShip/Gorgo, VK ID, уведомления и маркетинговые согласия."
created: 2026-06-04 04:24
updated: 2026-06-04 04:24
tags:
  - blog
cssclasses: ""
draft: false
preview_image: /images/medusastore-integrations-cover.png
---

MedusaStore заметно отличается от абстрактного international starter тем, что в нём уже заложены российские интеграционные сценарии: YooKassa для платежей, ApiShip/Gorgo для доставки, VK ID для onboarding, а также несколько каналов уведомлений и маркетинговые согласия.

Но эти интеграции важно описывать аккуратно. Не всё включено по умолчанию, не всё является live execution, и не каждый staging-сценарий равен production-ready состоянию.

## YooKassa

YooKassa реализована как opt-in платежная интеграция. Это правильная модель для template/runtime: проект может стартовать без боевого платёжного провайдера, а конкретный магазин включает оплату через env, secrets и операционную настройку.

Для production одного факта «адаптер есть» недостаточно. Нужны:

- корректные credentials через secrets;
- проверка callback/webhook сценариев;
- обработка успешных и неуспешных оплат;
- сверка статусов заказа и платежа;
- понятные retry/fallback правила;
- staging/prod разделение кабинетов и ключей.

## ApiShip и Gorgo

Fulfillment baseline в проекте — manual + ApiShip/Gorgo. Это значит, что базовый путь доставки не обязан сразу создавать реальные отправления во внешнем сервисе.

Live ApiShip shipment execution выключен по умолчанию через `APISHIP_SHIPMENT_EXECUTION_ENABLED`. Такая осторожность важна: доставка — зона, где ошибка в staging может превратиться в реальную операционную проблему, если случайно уйти в боевой API.

Перед production нужно отдельно проверить:

- расчёт вариантов доставки;
- создание shipment;
- idempotency;
- отмены и изменения;
- ошибки провайдера;
- логирование и ручной recovery;
- разделение staging/prod credentials.

## VK ID onboarding

VK ID добавляет удобный вход для российских пользователей, но приносит edge cases. Главный из них — email. Если VK ID не даёт нормальный email, проект использует placeholder email, а checkout gate должен проверять, достаточно ли данных для заказа.

Это лучше, чем молча ломать checkout позже. OAuth-профиль не всегда равен полноценному покупательскому профилю: для доставки, оплаты, чеков и уведомлений могут понадобиться дополнительные поля.

## Notifications

В MedusaStore предусмотрены разные каналы уведомлений:

- local;
- SMTP;
- UniSender;
- SMS;
- VK;
- fallback/disabled semantics.

Fallback/disabled semantics особенно полезны для разработки и staging. Если SMTP или SMS ещё не настроены, backend не должен падать целиком. Но для production эта мягкость должна быть дополнена наблюдаемостью: оператор должен понимать, какие уведомления реально ушли, какие были пропущены и почему.

## Transactional emails и moderation

Reviews subsystem связан с transactional moderation emails. Это хороший пример того, где уведомления становятся частью продукта, а не декоративной функцией. Пользователь оставляет отзыв, администратор модерирует, система отправляет статусы или внутренние уведомления.

Для production здесь нужны шаблоны, deliverability, rate limits, audit trail и понятные правила повторной отправки.

## Marketing consent

Marketing-контур включает preferences, campaigns, delivery journal, unsubscribe и double opt-in. Это важная база для легитимной коммуникации: рассылка должна знать согласие пользователя, историю отправок и способ отказа.

Payload UI integration помогает управлять кампаниями, но сама дисциплина согласий живёт шире CMS. Подробнее это связано с [[MedusaStore Payload CMS контент и маркетинг|Payload и маркетингом]].

## Что ещё не стоит считать закрытым

Российские интеграции в MedusaStore — сильная сторона проекта, но production hardening всё равно нужен. Особенно вокруг SMTP/mailserver gaps, smoke-покрытия checkout/API, live delivery execution, provider secrets и разделения staging/prod.

Эта логика похожа на подход из [[RAG Content Pipeline от сырых документов к базе знаний|RAG Content Pipeline]] и [[Hybrid Retrieval на LightRAG]]: наличие интеграционного слоя ещё не означает, что весь production-контур закрыт. Нужны проверки качества, границы ответственности и понятный режим отказа.
