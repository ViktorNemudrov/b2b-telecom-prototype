# AI Assistant (client-side OpenRouter) — аудит A–F

Контекст: `output: "export"`, запросы только с клиента (`packages/ai-kit/src/lib/liveAi.ts`). Стриминг SSE не используется — JSON `chat/completions` + `cache: "no-store"`.

---

## Обновление 25.04.2026

- Для fallback-сценариев чата закреплён единый короткий текст ответа: `В демо-версии ИИ не подключены.`
- Техническая диагностика источника не дублируется в основном пузыре fallback-ответа (остаётся в диагностическом блоке/подписи).
- Для карточки подписки в профиле зафиксировано отображение даты списания в одну строку: `списание 25.04`.

---

## Обновление 27.04.2026

- Для Classic-ветки переработана нижняя строка ассистента по макету: двухрядный layout, переключение `карандаш+`/`отправить`, визуально согласованные круглые кнопки.
- Кнопка `карандаш+` в чате переведена на reset-навигацию (`/assistant/?reset=1`) — возврат в главный экран ассистента без автовосстановления переписки в том же действии.
- Добавлена сессионная защита повторного показа PWA-баннера установки (`b2b_pwa_install_prompt_shown_session_v1`) для сценариев с переходами и перезагрузкой маршрута внутри вкладки.
- Кнопка отправки в нижней строке Classic больше не «мигает» при выборе предзаполненных подсказок: переключение в режим отправки остаётся только для ручного ввода.

---

## A. Failure Analysis & Root Causes

| Trigger | Observed Bad Behavior | Root Cause | Fix | Test to Reproduce | Metric to Monitor |
|--------|------------------------|------------|-----|-------------------|-------------------|
| Быстрые повторные отправки | Два ответа AI, «перепутанный» порядок | Асинхронный `setTimeout` без seq-guard | `sendSeqRef` + ранний `return` если `mySeq !== sendSeqRef.current` | Vitest: нет; ручной: двойной Enter | `live_fetch_end` с расхождением seq (опционально расширить) |
| Новое сообщение до ответа | Старый ответ приходит после нового | Нет отмены in-flight | `AbortController` + `abort()` при новом `send` | E2E rapid input | `live_aborted` reason `new_message` |
| Таймаут сети | Вечное ожидание / зависание UI | Таймаут 2.5s без согласования с моделью | `LIVE_FETCH_TIMEOUT_MS` (25s) + `controller.abort()` | Обрезать сеть в DevTools | `live_aborted` reason `timeout` |
| Повторяющийся вывод модели | «Бессмыслица», зацикленные строки | Нет пост-обработки | `shouldRejectModelOutput` в `getLiveAiText` | `liveAiGuards.test.ts` | `live_output_rejected` |
| `localStorage` битый JSON | Краш при логировании | `JSON.parse` без try/catch | `appendChatLog` с fallback `[]` | Ручной: испортить `b2b_chat_logs_v1` | ошибки в консоли (dev) |
| SW кэширует fetch | Устаревшие ответы (теория) | Поведение SW по умолчанию | `cache: "no-store"` на fetch | Проверить `sw.js` — не перехватывать openrouter | TTFB аномалии |
| Пустой/инъекционный ввод | Утечка роли / мусор в API | Нет валидации | `safeParseLiveUserPrompt` перед отправкой | `liveUserPromptSchema.test.ts` | отказы валидации (toast) |
| Ошибка сети / 4xx | Сообщение «нужен ключ» при наличии ключа | `liveText === null` не обрабатывался | `intentUsed: live-unavailable` + fallback | Отключить API key / offline | `live_fetch_end` ok: false |

---

## B. Тест-матрица (сжатая)

| ID | Сценарий | Входные данные | Ожидаемое поведение | Как детектить баг | Приоритет |
|----|-----------|----------------|---------------------|-------------------|-----------|
| T1 | Happy live | валидный вопрос + ключ | ответ ≤512 токенов, русский | нет ответа / 500 | P0 |
| T2 | Повторы модели | (mock) повторяющийся текст | `null` + fallback | текст повторов в UI | P0 |
| T3 | Rapid send | 2 сообщения <350ms | только последний ответ | два AI подряд | P0 |
| T4 | Отмена (новое сообщение) | отправить до конца prev | нет «позднего» ответа | порядок сообщений | P1 |
| T5 | Таймаут | throttling | abort, нет зависания | зависание спиннера | P1 |
| T6 | Пустая строка | ` ` | toast / no-op | сообщение в чате | P1 |
| T7 | Injection | «ignore previous» | уходит на API, но system prompt игнорирует | утечка системного текста | P2 |
| T8 | Offline | `navigator.offline` | fallback / ошибка без краша | необработанный throw | P2 |
| T9 | Long history | >6 реплик | только последние 6 в history | раздувание запроса | P2 |

---

## C. Автоматизированные тесты

### Vitest

| Файл | Что покрывает |
|------|----------------|
| `packages/ai-kit/src/lib/liveAi.test.ts` | `extractAssistantText`, `buildLiveAiMessages` |
| `packages/ai-kit/src/lib/liveAiGuards.test.ts` | repetition / reject |
| `packages/ai-kit/src/lib/liveUserPromptSchema.test.ts` | Zod + injection refine |
| `packages/ai-kit/src/lib/assistantResponse.test.ts` | детерминированные ответы |
| `packages/ai-kit/src/lib/aiClientMetrics.test.ts` | буфер метрик, `setAiMetricSink` |

- **Куда класть:** новые unit-тесты рядом с `*.ts` в `packages/ai-kit/src/lib/`.
- **Как запускать:** `npm run test:chat:unit` или `npx vitest run --config vitest.config.ts packages/ai-kit/src/lib/liveAiGuards.test.ts`.
- **Что мокать:** `fetch` — в тестах `liveAi` при необходимости через `vi.stubGlobal("fetch", ...)` (сейчас не требуется для чистых функций).

### Playwright

| Файл | Назначение |
|------|------------|
| `e2e/assistant-routing.spec.ts` | маршруты / PWA |
| `e2e/assistant-ai.spec.ts` | pending-полоса, rapid-send (второй ответ побеждает), отмена (`__E2E_SLOW__` + `window.__E2E_ASSISTANT_DELAY_MS`) |
| `e2e/chat-scenarios-gate.spec.ts` | гейт сценариев чата |

- **Как запускать:** `npm run test:e2e:chat`, гейт: `npm run test:e2e:chat:gate`, полный predeploy: `npm run predeploy:chat`.
- **E2E-хук задержки:** только для Playwright — `addInitScript` задаёт `window.__E2E_ASSISTANT_DELAY_MS` и сообщение `__E2E_SLOW__` (см. `AiAssistantScreen.tsx`).

---

## D. System Prompt & Guardrails

- **Текст:** `LIVE_AI_SYSTEM_PROMPT` в `packages/ai-kit/src/lib/aiLiveConfig.ts`.
- **Параметры API:** `OPENROUTER_COMPLETION_DEFAULTS` — `temperature`, `top_p`, `max_tokens`, `frequency_penalty`, `presence_penalty`.
- **Клиент:** `fetch` + `cache: "no-store"`; тело включает `...OPENROUTER_COMPLETION_DEFAULTS`.
- **Пост-гейт:** `shouldRejectModelOutput` → `null` → экран даёт `buildSafeLiveFallbackResponse()`.
- **Текст fallback (AI-first и Classic):** в основном пузыре — короткая фраза `DEMO_CHAT_NO_AI_MESSAGE` («В демо-версии ИИ не подключены.»); длинная техническая сводка в подписи источника к этому пузырю не выводится (E2E `assistant-routing` ожидает эту фразу).

---

## E. Клиентские фиксы (файлы)

| Область | Путь |
|---------|------|
| Запрос OpenRouter, метрики, гейт вывода | `packages/ai-kit/src/lib/liveAi.ts` |
| System prompt + таймаут + defaults | `packages/ai-kit/src/lib/aiLiveConfig.ts` |
| Валидация ввода | `packages/ai-kit/src/lib/liveUserPromptSchema.ts` |
| Детектор повторов | `packages/ai-kit/src/lib/liveAiGuards.ts` |
| Метрики (ring buffer) | `packages/ai-kit/src/lib/aiClientMetrics.ts` |
| UI: seq, abort, валидация, `appendChatLog`, таймаут, pending + «Отмена» | `packages/ai-kit/src/components/screens/AiAssistantScreen.tsx` |
| Пассивный PWA-баннер скрывается после «Понятно» | `apps/ai-first/app/PwaInstallPrompt.tsx` |

Псевдо-хуки (логика уже встроена в экран + lib):

- **useAIStream** — не выделен; non-stream JSON; при переходе на SSE — вынести в `packages/ai-kit/src/lib/useAIStream.ts`.
- **repetitionDetector** — `liveAiGuards.ts`.
- **historyManager** — `buildLiveAiMessages` + `.slice(-6)`; контекст данных — `buildDataContextSummary` в экране.
- **sw-bypass** — для текущего JSON: `cache: "no-store"`; для будущего стрима — исключить `openrouter.ai` в `public/sw.js`.

---

## F. Мониторинг & Observability

| Событие | Где |
|---------|-----|
| `live_fetch_start` / `live_fetch_end` | `liveAi.ts` |
| `live_output_rejected` | `liveAi.ts` / экран (`reliability`) |
| `live_aborted` (`timeout` \| `new_message` \| `user_cancel` \| `unmount`) | `AiAssistantScreen.tsx` |
| Снимок буфера | `getAiMetricSnapshot()` в `aiClientMetrics.ts` |
| Подписка на события | `setAiMetricSink()` в `aiClientMetrics.ts` |

**Circuit breaker / внешняя аналитика:** вызвать `setAiMetricSink(handler)` при старте приложения; события дублируются в ring buffer и в sink.

**PWA:** при появлении SW-перехвата `fetch` для API — не кэшировать `POST` на `openrouter.ai`; сейчас запрос идёт напрямую с `no-store`.

---

## Запуск первым (рекомендация)

1. `npm run test:chat:unit`
2. `npm run test:e2e:chat` (при изменениях UI)
3. `npm run predeploy:chat` перед релизом

**Scripts:** см. корневой `package.json` — `test:chat:unit`, `predeploy:chat`, `chat:e2e:report`.
