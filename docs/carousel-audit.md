# Аудит компонента Carousel (ServicesCarousel)

## 1. Относящиеся файлы

- **Компонент (Quartz/Preact):** `quartz/components/ServicesCarousel.tsx`
- **Логика (Client-side):** `quartz/components/scripts/servicesCarousel.inline.ts`
- **Стили (SCSS):** `quartz/components/styles/servicesCarousel.scss`
- **Данные (JSON):** `quartz/static/data/services-carousel.json`
- **Регистрация:** `quartz/components/index.ts`
- **Подключение:** `quartz.layout.ts`

## 2. Техническое описание

### Назначение

Интерактивная 3D-карусель для отображения услуг. При клике на карточку открывается модальное окно с формой обратной связи для заказа конкретной услуги.

### Устройство

- **Hybrid Rendering:** Preact-компонент на этапе сборки генерирует пустой контейнер-ресурс. Вся визуализация и логика происходят на клиенте после загрузки DOM.
- **3D Engine:** Использует CSS `perspective` и `transform-style: preserve-3d`. Позиции карточек рассчитываются тригонометрически (sin/cos) в JS и применяются через `transform: rotateY() translateZ()`.
- **Animation:** Вращение реализовано через `requestAnimationFrame` (RAF).
- **Data Fetching:** Данные подгружаются динамически через `fetch` из JSON-файла, указанного в атрибуте `data-source`.

### Публичный API (Props / Атрибуты)

Компонент настраивается через атрибуты HTML-тега `<services-carousel>` и JSON-конфиг:

- `data-source` (обязательный): URL к JSON с данными.
- `data-auto-speed`: Скорость авто-вращения.
- `data-drag-sensitivity`: Чувствительность перетаскивания.
- **JSON Schema (`CarouselData`):**
  - `title`, `subtitle`, `hint`: Тексты заголовка.
  - `cards[]`: Массив объектов `{ title, description, price, note, button: { text, href, action } }`.
  - `form`: Настройки формы (action, method, submitLabel).

### Внутреннее состояние (Client)

- `rotation`: Текущий угол поворота (градусы).
- `ringRadius`: Рассчитанный радиус кольца (зависит от ширины экрана и кол-ва карт).
- `isDragging`: Флаг активного перемещения мышью/тачем.
- `modal.isOpen`: Состояние видимости модального окна.

### Edge-cases

- **Responsive:** Радиус и ширина карточек пересчитываются при `resize` окна и `visualViewport`. Для экранов < 600px применяются мобильные оптимизации (скрытие подсказок, изменение масштаба).
- **Touch:** Полная поддержка через `PointerEvents` с `setPointerCapture`.
- **Keyboard:** В модальном окне работает `Escape` для закрытия и `Tab` (базово). В самой карусели управление стрелками отсутствует.
- **SSR:** Компонент рендерится пустым, что исключает ошибки гидратации при расчете геометрии.
- **Reduced Motion:** Если в системе включено ограничение движения, авто-вращение устанавливается в `0`.

## 3. Использование в приложении

Компонент подключается глобально в `quartz.layout.ts`, что позволяет использовать тег в любом Markdown файле.

**Пример в `content/index.md`:**

```html
<services-carousel data-source="/static/data/services-carousel.json"></services-carousel>
```

**Пример импорта в коде:**

```typescript
import ServicesCarousel from "./ServicesCarousel"
// ...
afterBody: [Component.ServicesCarousel()]
```

## 4. Потенциальные баги и улучшения

### DX (Developer Experience)

- **Discrepancy:** `ServicesCarousel.tsx` выводит класс `services-carousel-resources`, в то время как скрипт ищет `services-carousel`. Это может запутать при добавлении новых экземпляров.
- **Manual Tagging:** Компонент не создает тег `<services-carousel>` сам, его нужно прописывать в MD вручную.

### Accessibility (a11y)

- **Keyboard Navigation:** Невозможно прокручивать карусель или выбирать карточки кнопками (стрелки, Tab).
- **Focus Management:** После закрытия модалки фокус не возвращается на вызвавшую карточку.
- **ARIA:** Карусель имеет `aria-hidden="true"` в шаблоне, что делает её невидимой для скринридеров, хотя контент внутри важен.

### Performance

- **Layout Thrashing:** `updateRadius` вызывает `getBoundingClientRect`, что может приводить к пересчету лайаута при ресайзе.
- **Caching:** JSON загружается заново при каждой инициализации (например, при навигации в SPA-режиме Quartz).

### Замеченные ошибки (Bugs)

- В `services-carousel.json` (line 81) опечатка: `"title": "Разаботка сайт"` вместо "Разработка сайта".
- При ошибке `fetch` пользователь видит техническое сообщение в блоке вместо дружелюбного фоллбека.
- **Global Scope Pollution:** Вспомогательные функции (`createEl`, `resolveSource`, `renderError`) и константа `DEFAULTS` определены в глобальной области видимости скрипта. При наличии на одной странице и карусели, и формы обратной связи (FeedbackForm), возможны коллизии имен, так как оба компонента используют идентичные названия для разных данных.

### Рекомендации

1. Добавить поддержку управления стрелками (Left/Right).
2. Реализовать кэширование JSON в памяти.
3. Исправить опечатку в данных.
4. Добавить `aria-live` для уведомлений о смене карточек (опционально).
