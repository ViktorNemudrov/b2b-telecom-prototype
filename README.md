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
NEXT_PUBLIC_OPENROUTER_MODEL=openrouter/auto
# или список fallback-моделей через запятую
# NEXT_PUBLIC_OPENROUTER_MODEL=google/gemma-2-9b-it:free,meta-llama/llama-3.2-3b-instruct:free,mistralai/mistral-7b-instruct:free,openrouter/auto
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

## Документация по диагностике Classic

- Сценарий `Профиль -> Проверка устройства (QA)` и API-проверки AI-провайдеров описаны в `docs/QA_AI_DIAGNOSTICS_CLASSIC.md`.
- Для релизной проверки перед деплоем используй `npm run verify`, затем `npm run build:ai` и/или `npm run build:classic` для целевого проекта.

