---
publish: true
title: TelePost / TGPT
description: Почтовый сервис в Telegram Mini App с ботом, AI-summary входящих писем и публичными формами для заявок.
created: 2026-05-04 17:39
updated: 2026-05-04 18:05
tags:
  - blog
  - project
cssclasses: ""
draft: false
preview_image: /images/tgpt-telepost-cover.png
---

TelePost / TGPT — почтовый сервис внутри Telegram: бот выдаёт почтовые ящики и invite-коды, а Mini App открывает webmail-интерфейс без отдельного почтового клиента. Пользователь читает и отправляет письма, работает с папками, контактами, черновиками и запланированной отправкой прямо из Telegram.

Технически проект собран вокруг Mox как почтового сервера, Node/Express API и PostgreSQL. Отправка писем идёт через SMTP Mox, данные синхронизируются с базой, а доступ к приватной части Mini App проверяется через Telegram Web App `initData`.

Входящие письма могут приходить в Telegram-уведомлениях с AI-summary, чтобы быстро понять смысл письма без открытия полного текста. Публичные формы принимают заявки по `hash_id`, проверяют `Origin`, сохраняют payload и уведомляют владельца в Telegram.

Ключевые возможности:

- создание и активация почтовых ящиков через Telegram-бота;
- webmail в Telegram Mini App: ящики, папки, письма, контакты и черновики;
- отправка писем, автосохранение черновиков и запланированная отправка;
- AI-summary входящих писем и Telegram-уведомления;
- публичные формы для заявок с привязкой к владельцу ящика.

Подробнее: [[Проекты/TGPT/Telegram Bot and Invite Codes|бот и invite-коды]], [[Проекты/TGPT/Telegram Mini App Mail|почта в Mini App]], [[Проекты/TGPT/TelePost Forms|Forms]] и [[Проекты/TGPT/TelePost Audio Scribe Integration|будущая интеграция с Audio Scribe]].
