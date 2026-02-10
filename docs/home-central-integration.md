# Аудит интеграции центрального блока главной и callback-модалки

Срез изменений: `feature/central-block-integration` на **10 февраля 2026**.

## 1. Что изменено по `git status`

- Обновлён контент главной страницы: `content/index.md`
- Добавлена страница политики ПДн: `content/privacy-policy.md`
- Изменены тема/типографика: `quartz.config.ts`
- Подключены Material Symbols: `quartz/components/Head.tsx`
- Подключён новый JS-компонент: `quartz/components/HomeCallback.tsx`
- Экспорт компонента: `quartz/components/index.ts`
- Регистрация компонента в layout: `quartz.layout.ts`
- Добавлен inline-скрипт модалки: `quartz/components/scripts/homeCallback.inline.ts`
- Добавлен JSON-конфиг callback-формы: `quartz/static/data/home-callback-form.json`
- Крупно обновлены стили секций home/callback: `quartz/styles/custom.scss`
- `quartz/styles/base.scss` в основном переформатирован (структурных изменений поведения почти нет)
- Удалены служебные скриншоты из `screenshots/`

## 2. Зачем это сделано

Изменения выглядят как единая задача по продуктовой упаковке главной страницы:

- Сделать домашнюю страницу более «лендинговой» и целевой под лидогенерацию.
- Перевести CTA с перехода на страницу контактов на сценарий «обратный звонок в модалке».
- Переиспользовать уже существующий `FeedbackForm`, но с отдельным JSON-конфигом под короткий сценарий (телефон + согласие).
- Добавить обязательный юридический контур (страница политики ПДн + ссылка из формы).
- Визуально унифицировать иконки (emoji -> Material Symbols) и обновить тему/палитру.

## 3. Архитектура callback-сценария

### 3.1 Точки входа в разметке

В `content/index.md`:

- Корневой контейнер сценария: `data-home-callback-root`
- Кнопки открытия модалки: `data-home-callback-open`
- Модалка: `data-home-callback-modal`
- Диалог: `data-home-callback-dialog`
- Элементы закрытия (фон/кнопка): `data-home-callback-close`
- Контейнер формы:  
  `<div class="feedback-form home-callback-modal__form" data-source="/static/data/home-callback-form.json"></div>`

Важно: модалка работает только внутри корня с `data-home-callback-root`.

### 3.2 Инициализация в Quartz

- Компонент `HomeCallback` подключён в `afterBody`: `quartz.layout.ts`
- Компонент экспортирован в `quartz/components/index.ts`
- В `HomeCallback.tsx` назначен `afterDOMLoaded` -> `homeCallback.inline.ts`

Это означает:

- скрипт запускается после загрузки DOM;
- обработчики повторно подхватываются при SPA-навигации Quartz через событие `nav`.

### 3.3 Поведение скрипта

`quartz/components/scripts/homeCallback.inline.ts`:

- защищает от двойного монтажа через `root.dataset.homeCallbackMounted`
- открывает модалку по кнопке с `data-home-callback-open`
- закрывает модалку по:
  - клику на backdrop/кнопку закрытия
  - клавише `Escape`
- блокирует прокрутку страницы через класс `home-callback-modal-open` на `html` и `body`
- переносит фокус в модалку при открытии и возвращает его на предыдущий элемент при закрытии
- регистрирует cleanup через `window.addCleanup` для корректной работы в SPA

### 3.4 Данные формы и отправка

- JSON-конфиг: `quartz/static/data/home-callback-form.json`
- Endpoint: `https://app.slavx.ru/api/v1/f/12a7dd50d5c0`
- Поля:
  - `phone` (required)
  - `consent` checkbox (required)

Рендер и submit делает общий `FeedbackForm` (`quartz/components/scripts/feedbackForm.inline.ts`), который:

- читает `data-source`
- fetch-ит JSON
- отправляет payload на `action` из конфига

## 4. Визуальные изменения и зависимые места

- Главная секция `home-central` заметно переработана: hero/focus/services/works/faq/contact.
- В `quartz.config.ts` сменены шрифты header/body на `Inter` и обновлена палитра dark mode.
- В `Head.tsx` добавлен CDN-шрифт `Material Symbols Outlined`, так как разметка теперь использует классы `material-symbols-outlined`.

Если убрать подключение икон-шрифта из `Head.tsx`, интерфейс останется без иконок.

## 5. Как менять безопасно

1. Хотите поменять адрес отправки callback-формы: редактируйте только `quartz/static/data/home-callback-form.json`.
2. Хотите добавить ещё кнопку открытия: добавьте `data-home-callback-open` внутри блока `data-home-callback-root`.
3. Хотите поменять тексты/структуру модалки: `content/index.md`.
4. Хотите поменять поведение модалки (close/focus/lock): `quartz/components/scripts/homeCallback.inline.ts`.
5. Хотите поменять только внешний вид: `quartz/styles/custom.scss`.
6. Не удаляйте `Component.HomeCallback()` из `quartz.layout.ts`, иначе модалка перестанет открываться.
7. Не удаляйте `content/privacy-policy.md`, пока в форме есть ссылка `/privacy-policy`.

## 6. Текущие ограничения

- В скрипте нет полного focus-trap (Tab не циклируется строго внутри модалки).
- Сценарий завязан на data-атрибуты и текущую DOM-структуру `content/index.md`.
- Изменения в `base.scss` в основном форматные; для поиска регрессий ориентируйтесь в первую очередь на `custom.scss`.

## 7. Мобильные фиксы (февраль 2026)

После браузерного mobile smoke-test добавлены правки:

- Исправлен путь кнопки `Все контакты` в hero: `content/index.md` -> `/Кoнтакты` (убран 404 по `/Все-контакты`).
- Исправлено переполнение секции `home-contact-cta` на мобильных:
  - ограничена ширина контейнера в `@media (max-width: 900px)`
  - добавлены безопасные `max-width`/`box-sizing` для `home-contact-cta__callback`
- Модалка callback больше не выходит за экран:
  - ширина диалога привязана к `calc(100vw - отступ)` вместо «100% контейнера»
- Улучшены touch-target в модалке:
  - кнопка закрытия увеличена до `44x44`
  - чекбокс согласия увеличен до `20x20` (кликабельный `label` при этом выше 44px)
- Скрыты anchor-ссылки в `h2/h3` внутри `home-central`, чтобы убрать мелкие tap-target рядом с заголовками.
