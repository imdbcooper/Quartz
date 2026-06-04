---
publish: true
title: "PromtGen: VEO 3 guided workflow"
description: "Текущий Video Promo workspace в PromtGen: Setup, specs, product elements, visual direction, storyboard, review и export для VEO 3."
created: 2026-06-04 05:10
updated: 2026-06-04 05:10
tags:
  - blog
cssclasses: ""
draft: false
preview_image: "/images/promtgen-veo-workflow-cover.png"
---

# PromtGen: VEO 3 guided workflow

Video Promo в PromtGen — это текущий workspace для подготовки промтов под VEO 3. Он не генерирует видео внутри продукта и не заменяет видеоредактор. Его задача практичнее: собрать аккуратный video brief из данных о товаре, визуального направления, storyboard и export-форматов.

На выходе пользователь получает Summary, полный prompt, prompt по отдельным сценам и JSON payload. Такой результат можно передать дальше в VEO 3 workflow или использовать как production brief для дизайнера, motion-специалиста и контент-команды.

## Что такое Video Promo workspace

Video Promo работает отдельно от Image Cards. Пользователь переключается в режим `Video Promo (VEO 3)`, после чего попадает в интерфейс с двумя темпами работы:

- **Guided** — последовательный workflow через Setup, Style, Storyboard и Preview;
- **Fast** — более быстрый режим, где ключевые поля можно редактировать без длинного пошагового мастера.

Это важно для реальной работы. Иногда нужно внимательно собрать новый ролик с нуля, а иногда — быстро поправить стиль, длительность, пару кадров или JSON payload перед экспортом.

## Setup: база ролика

Setup отвечает за исходные параметры продукта и ролика. Здесь задаются:

- тип и категория товара;
- product description;
- длительность;
- aspect ratio;
- reference image URL/path или текстовое описание референса;
- базовый контекст, который дальше используется в storyboard и prompt builder.

PromtGen проверяет обязательные поля и показывает blockers/advisories в review rail. Например, отсутствие описания продукта или описания кадра мешает собрать нормальный prompt, а отсутствие reference image остаётся advisory: это желательно, но не всегда блокирует работу.

## Specs и product elements

Отдельный слой Video Promo — характеристики и элементы товара.

**Product specs** помогают зафиксировать конкретные свойства: материал, размер, мощность, ёмкость, состав, комплектацию, особенности конструкции. Это снижает риск получить красивый, но неточный ролик.

**Product elements** описывают части товара, которые важно показать в кадре: экран, кнопки, упаковку, насадку, текстуру, застёжку, порт, логотип, крышку, аксессуар или другой узнаваемый элемент.

В текущей реализации списки ограничены пятью пунктами. Это нормальное ограничение для prompt workflow: brief остаётся управляемым, а VEO prompt не превращается в перегруженную спецификацию.

## Visual direction

Visual direction задаёт то, как ролик должен выглядеть: стиль, фон, свет, палитра, качество и общее настроение. В проекте есть presets, но можно использовать и custom visual style override.

Custom override полезен, когда задача уже имеет брендовый или производственный контекст:

- clean marketplace aesthetic;
- dark tech product reveal;
- luxury macro;
- lifestyle social ad;
- neon studio;
- industrial demo;
- calm premium minimalism.

Gemini-assisted действия могут помочь сгенерировать style direction или описание кадра, но они не создают финальный ролик. Они только ускоряют заполнение качественных текстовых полей.

## Storyboard: scenes и shots

Storyboard — ядро Video Promo. Он устроен как вложенная структура:

```text
VeoFormState
  -> scenes
     -> shots
```

**Scene** задаёт крупный смысловой блок ролика. **Shot** описывает конкретный кадр: длительность, действие, движение камеры, эффект, свет, overlay text, иконку и product behavior pattern.

Практический сценарий может выглядеть так:

1. hero-shot показывает товар на чистом фоне;
2. macro shot раскрывает материал или деталь;
3. demo shot показывает функцию или product behavior;
4. benefit shot выводит короткий overlay;
5. финальный кадр возвращает продукт в центр и закрепляет ключевое сообщение.

Ограничения текущего storyboard: до 5 scenes и до 5 shots на scene. Этого достаточно для короткого product promo и помогает контролировать суммарную длительность.

## Review и export

Preview-зона собирает результат в несколько представлений:

- **Summary** — короткая сводка по ролику;
- **Prompt** — полный VEO prompt;
- **JSON** — структурированный payload для API-ориентированного workflow;
- **per-scene prompt export** — отдельные prompts по сценам.

Review rail показывает blockers и advisories. Это не формальная проверка ради галочки: для видео особенно важно, чтобы длительности shots совпадали с общей длительностью ролика, а storyboard был заполнен не только декоративными словами, но и конкретными действиями.

## Что важно помнить об ограничениях

Текущий PromtGen остаётся client-only React/Vite SPA. У него нет backend API, базы данных, auth, очередей, persistent sessions или server-side AI proxy.

Gemini key читается из Vite-переменной и используется на клиенте. Для внутреннего прототипа это допустимое ограничение, но для production такой подход нужно заменить серверным proxy.

Видео внутри PromtGen не генерируется. Приложение готовит prompt, Summary и JSON payload, а не запускает VEO job и не хранит результат.

Audio layer тоже пока отсутствует в коде. Нет audio fields, audio providers и отдельного audio UI. Поэтому аудио корректно рассматривать как будущий слой поверх уже существующего storyboard, а не как реализованную часть продукта.

## Связанные материалы

- [[Как устроен PromtGen|Как устроен проект и кейсы использования]]
- [[PromtGen Audio Video|Аудио и видео направление PromtGen]]
- [[PromtGen Backend Roadmap|Роадмап: backend и генерация внутри проекта]]
