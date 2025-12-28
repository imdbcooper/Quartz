---
publish: true
title: Gemini CLI в Obsidian Полный гайд
description: "Гайд: Gemini AI + Obsidian. Используем мощь нейросети Google через командную строку для прокачки вашего «Второго мозга». Эффективно и бесплатно."
created: 2025-12-28 21:51
updated: 2025-12-28 21:51
tags:
  - blog
cssclasses: ""
draft: false
preview_image: /images/A_futuristic_concept_202512282143.jpeg
---
## Часть 1: Установка Gemini CLI

### Шаг 1: Установите Node.js (если не установлен)

**macOS:**
```bash
brew install node
```

**Windows:**
- Скачайте LTS версию с https://nodejs.org
- Установите как обычную программу
- Перезагрузитесь

**Проверка:**
```bash
node --version
npm --version
```

### Шаг 2: Установите Gemini CLI через npm

**macOS и Windows:**
```bash
npm install -g gemini-cli
```

**Проверка установки:**

macOS/Linux:
```bash
which gemini
```

Windows (PowerShell):
```powershell
Test-Path "$env:APPDATA\Roaming\npm\gemini.cmd"
```

---

## Часть 2: Авторизация через Google (OAuth)

### Шаг 1: Авторизуйтесь в терминале

**macOS/Linux/Windows:**
```bash
gemini auth login
```

Откроется браузер — нажмите "разрешить" для вашего Google аккаунта.

### Шаг 2: Проверьте авторизацию

```bash
gemini auth status
```

Должно вывести статус типа:
```
✓ Authenticated as: youremail@gmail.com
```

**Файл OAuth будет создан автоматически:**
- **macOS/Linux:** `~/.gemini/oauth_creds.json`
- **Windows:** `C:\Users\YourName\.gemini\oauth_creds.json`

### ⭐ Преимущество OAuth авторизации

| Параметр | OAuth (Google Account) | API Key (Free) |
|----------|----------------------|----------------|
| **Requests/day** | 1,000 | 100-250 |
| **Requests/minute** | 60 | 5-15 |
| **Стоимость** | Бесплатно | Бесплатно |
| **Изменился ли?** | ❌ Нет (стабилен) | ✅ Да (снизился 50-80%) |

**Вывод:** OAuth дает **10x больше запросов** и это бесплатно. Google специально рассчитал эти лимиты для реальной разработки.

---

## Часть 3: Установка плагинов в Obsidian

### Шаг 1: Установите BRAT (для beta плагинов)

1. **Settings → Community Plugins → Browse**
2. Поищите **"BRAT"** и установите
3. Включите плагин

BRAT позволит установить Agent Client до его официального релиза.

### Шаг 2: Установите Agent Client через BRAT

1. **Settings → Community Plugins → BRAT**
2. Нажмите **"Load from repo"**
3. Вставьте:
   ```
   https://github.com/RAIT-09/obsidian-agent-client
   ```
4. **Install**
5. Включите плагин в **Community Plugins**

---

## Часть 4: Настройка Agent Client

### Шаг 1: Найдите полный путь к Gemini CLI

**macOS:**
```bash
which gemini
```
Пример вывода: `/opt/homebrew/bin/gemini`

**Windows (PowerShell):**
Путь обычно: `C:\Users\YourName\AppData\Roaming\npm\gemini.cmd`

Проверьте:
```powershell
Test-Path "$env:APPDATA\Roaming\npm\gemini.cmd"
```

### Шаг 2: Заполните настройки плагина

**Settings → Community Plugins → Agent Client**

| Поле | Заполнить |
|------|-----------|
| **Path** | Путь к gemini (из шага 1) |
| **Arguments** | `--experimental-acp` |
| **API key** | (оставить пусто) |
| **Environment variables** | (оставить пусто) |
| **Enable WSL mode** | Только если Gemini в WSL |

**Конкретные примеры:**

macOS:
```
Path: /opt/homebrew/bin/gemini
Arguments: --experimental-acp
```

Windows:
```
Path: C:\Users\SomDev\AppData\Roaming\npm\gemini.cmd
Arguments: --experimental-acp
```

### Шаг 3: Проверьте подключение

1. **Command Palette** (Ctrl/Cmd + P)
2. Введите: **"Agent Client: Start Session"**
3. Если нет ошибок — готово!

---

## Часть 5: Первый запуск

В боковой панели Obsidian появится **"Agent Client"**:

```
Напишите: Analyze the current note
Нажмите: Enter
```

### Суперспособность: Контекст ваших заметок

Используйте `@` для ссылок на заметки:

```
@[[Project Name]]  или  @note_name

Пример:
"@[[Node.js Guide]] помоги с QUIC используя @network-notes"
```

Gemini CLI будет анализировать ваши заметки и давать ответы с их контекстом!

---

## Бонус: Shell Commands плагин (опционально)

Для быстрого запуска команд через горячие клавиши:

1. **Settings → Community Plugins → Browse**
2. Установите **"Shell Commands"**
3. Создайте команду (в его настройках):
   - macOS: `gemini "your prompt"`
   - Windows: `gemini.cmd "your prompt"`
4. Назначьте hotkey

Теперь Gemini вызывается одной клавишей!

---

## Troubleshooting

**"Path to gemini not found"**
```bash
which gemini        # macOS
where gemini        # Windows
```

**"OAuth credentials not found"**
```bash
gemini auth login   # Заново авторизуйтесь
gemini auth status  # Проверьте статус
```

**Windows: gemini не находится**
- Используйте полный путь: `C:\Users\YourName\AppData\Roaming\npm\gemini.cmd`
- Проверьте что файл существует в этой папке

---

## Итого

✅ Gemini CLI установлен  
✅ OAuth авторизация (1,000 запросов/день)  
✅ Agent Client в Obsidian  
✅ Полный контроль над AI  

Теперь ваши заметки — это база знаний для AI, как в Cursor IDE, но для Obsidian. Особенно полезно для хранения конспектов по технологиям и их анализа! 🚀
