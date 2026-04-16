# B2B Telecom Mobile Prototype

Минималистичный кликабельный mobile prototype (Next.js 14 App Router).

## Запуск

1) Установи Node.js **20+**
2) В корне проекта:

```bash
npm install
npm run dev
```

Открой `http://localhost:3000` (AI-first).
Для classic-версии: `npm run dev:classic` и открой `http://localhost:3001`.

## Live AI в чате

В ассистенте можно включить ответы реальной модели (OpenRouter), а при ошибке автоматически используется мок-ответ.

1) Добавь переменную окружения для локальной разработки:

```bash
NEXT_PUBLIC_OPENROUTER_API_KEY=your_key_here
```

2) Опционально выбери модель:

```bash
NEXT_PUBLIC_OPENROUTER_MODEL=mistralai/mistral-small-3.2-24b-instruct:free
```

Без ключа чат продолжит работать в мок-режиме.

> Важно: `NEXT_PUBLIC_*` переменные попадают в клиентский бандл. Не используй production-ключ в таком режиме. Для production подключай backend/proxy и храни ключ только на сервере.

## Pre-deploy chat gate

Перед релизом чата запусти обязательный гейт:

```bash
npm run predeploy:chat
```

Он прогоняет unit-контракты роутинга, **fuzz-варианты формулировок** (пробелы, регистр, «пожалуйста», «ну …») и полный e2e-набор известных сценариев чата (special, deterministic, live-required fallback) на desktop и Android mobile.

После e2e Playwright пишет `test-results/e2e-results.json` и HTML-отчёт в `playwright-report/`. Краткая сводка по упавшим тестам:

```bash
npm run chat:e2e:report
```

файл: `test-results/chat-failures-summary.md`.

В CI тот же гейт обязателен: ветка не зелёная, если `predeploy:chat` не прошёл. По расписанию (и вручную) запускается workflow **Chat nightly** (`.github/workflows/chat-nightly.yml`).

