# Монорепозиторий и два проекта на Vercel

Структура:

- **`packages/ai-kit`** — код только для **AI-first** (`@b2b/ai-kit`): моки, UI-кит, экраны, модалки, провайдер сессии для варианта «только AI».
- **`packages/classic-kit`** — код только для **Classic** (`@b2b/classic-kit`): отдельная копия слоя (правки Classic не затрагивают AI-first и наоборот).
- **`apps/ai-first`** — вариант **«только AI»**: приветствие → вход → главный экран **AI Assistant**, нижняя навигация с «Главная» = ассистент. Зависимость: `@b2b/ai-kit`.
- **`apps/classic`** — **классическое приложение**: приветствие на **`/welcome`** → вход → **`/`** = **дашборд (кабинет)**; вкладка **AI** отдельно; публичные маршруты `/welcome`, `/auth`. Зависимость: `@b2b/classic-kit`.

Фразы для правок в Cursor:

| Фраза | Куда править |
|--------|----------------|
| **«только AI» (логика/экраны)** | `packages/ai-kit/src/...` и `apps/ai-first/...` |
| **«только Classic»** | `packages/classic-kit/src/...` и `apps/classic/...` |

Команды с корня репозитория:

```bash
npm install
npm run dev:ai          # порт 3000
npm run dev:classic     # порт 3001
npm run build           # оба приложения
npm run build:ai
npm run build:classic
```

---

## Два проекта на Vercel (две ссылки)

Оба проекта подключают **один и тот же GitHub-репозиторий**, но с **разным корнем** (Root Directory).

### 1) Проект «AI»

1. [Vercel](https://vercel.com/) → **Add New…** → **Project** → импорт репозитория.
2. В настройках проекта (**Settings → General** или на шаге импорта): **Root Directory** → **Edit** → укажите **`apps/ai-first`**.
3. **Framework Preset:** Next.js (подхватится автоматически).
4. **Build Command:** `npm run build` (или оставьте по умолчанию — Vercel в подпапке часто сам запускает `next build` из `apps/ai-first`; при ошибке задайте явно: `cd ../.. && npm run build:ai` или из корня: `npm run build -w @b2b/ai-first`).
5. **Output Directory:** оставьте **пустым** (на Vercel статический экспорт `out/` отключается автоматически через `process.env.VERCEL`).
6. **Install Command:** из корня монорепо: `npm install` (корень репозитория; Vercel по умолчанию делает install в root при указанном Root Directory — если нет, используйте override: `cd ../.. && npm install`).

Примечание: лучше указывать **Root Directory** строго как `apps/ai-first` (для AI) / `apps/classic` (для Classic). Тогда Vercel будет использовать `apps/*/vercel.json` и не будет путать команды сборки между приложениями.

В репозитории есть `apps/ai-first/vercel.json`, поэтому Vercel возьмёт команды из этой папки.

### 2) Проект «Классика»

Повторите шаги, создав **второй** проект в Vercel:

- **Build Command:** `npm run build:classic`
- **Output Directory:** оставьте пустым
- **Install Command:** `npm install`

Если Root Directory у проекта «Классика» = `apps/classic`, то в репозитории есть `apps/classic/vercel.json` (аналогично AI), и Output Directory нужно оставлять пустым.

В итоге у вас **два URL** (`*.vercel.app`), по одному на вариант.

### Замечания

- Оба приложения поддерживают **статический экспорт для Capacitor** локально (см. `docs/MOBILE_ANDROID.md` в контексте `apps/ai-first`). Для Vercel статический экспорт `out/` отключается автоматически.
- Если Vercel ругается на lockfile / workspaces, держите **один** `package-lock.json` в **корне** и не отключайте workspaces.
- **Переменные окружения** задаются **отдельно** в каждом проекте Vercel. Файл `apps/classic/.env.local` в репозиторий не попадает и на Vercel **не читается** — для деплоя Classic скопируйте в панель проекта (Settings → Environment Variables) имена из `apps/classic/.env.example` (все ключи live-чата с префиксом `NEXT_PUBLIC_`), затем выполните **новый деплой**, иначе в прод-сборке клиента ключей не будет.
