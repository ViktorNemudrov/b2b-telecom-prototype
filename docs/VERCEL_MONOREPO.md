# Монорепозиторий и два проекта на Vercel

Структура:

- **`packages/shared`** — общий код (`@b2b/shared`): моки, UI-кит, экраны, модалки, провайдер сессии.
- **`apps/ai-first`** — вариант **«только AI»**: приветствие → вход → главный экран **AI Assistant**, нижняя навигация с «Главная» = ассистент.
- **`apps/classic`** — **классическое приложение**: приветствие на **`/welcome`** → вход → **`/`** = **дашборд (кабинет)**; вкладка **AI** отдельно; публичные маршруты `/welcome`, `/auth`.

Фразы для правок в Cursor:

| Фраза | Куда править |
|--------|----------------|
| **«в оба» / «в shared»** | `packages/shared/src/...` |
| **«только AI»** | `apps/ai-first/...` (чаще `app/`, `components/layout/`) |
| **«только классика»** | `apps/classic/...` |

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
5. **Output Directory:** для `output: 'export'` задайте **`out`** (относительно `apps/ai-first`, т.е. в UI Vercel часто **`out`** уже относительно root directory).
6. **Install Command:** из корня монорепо: `npm install` (корень репозитория; Vercel по умолчанию делает install в root при указанном Root Directory — если нет, используйте override: `cd ../.. && npm install`).

Практичный вариант **без путаницы с `cd`**:

- **Root Directory:** оставьте **корень репозитория** (пусто / `.`).
- **Build Command:** `npm run build:ai`
- **Output Directory:** `apps/ai-first/out`
- **Install Command:** `npm install`

Так один проект Vercel всегда ставит зависимости из корневого `package-lock.json` и собирает только AI-приложение.

Альтернатива (если вы хотите/вынуждены ставить **Root Directory = `apps/ai-first`**):

- В репозитории есть `apps/ai-first/vercel.json`, поэтому Vercel возьмёт команды и `Output Directory` **из этой папки**.
- В UI Vercel тогда достаточно:
  - **Root Directory:** `apps/ai-first`
  - **Output Directory:** `out` (или оставить пустым, если Vercel сам подхватит из `vercel.json`)
  - Если в логах видно `Build Completed in /vercel/output` и на сайте 404, значит Vercel всё ещё включает Next.js builder. В этом случае `apps/ai-first/vercel.json` принудительно переключает сборку на статический билд и публикацию `out/`.

Дополнительно (для стабильности, если Vercel «теряет» `index.html` в статическом экспорте из-за auto-настроек):

- В корне репозитория можно держать `vercel.json` с:
  - `buildCommand`: `npm run build:ai`
  - `outputDirectory`: `apps/ai-first/out`
  - `installCommand`: `npm install`

### 2) Проект «Классика»

Повторите шаги, создав **второй** проект в Vercel:

- **Build Command:** `npm run build:classic`
- **Output Directory:** `apps/classic/out`
- **Install Command:** `npm install`

Если Root Directory у проекта «Классика» = `apps/classic`, то в репозитории есть `apps/classic/vercel.json` (аналогично AI), и Output Directory должен быть `out`.

В итоге у вас **два URL** (`*.vercel.app`), по одному на вариант.

### Замечания

- Оба приложения используют **`output: 'export'`** (статический сайт). Подходит для CDN и для Capacitor (см. `docs/MOBILE_ANDROID.md` в контексте `apps/ai-first`).
- Если Vercel ругается на lockfile / workspaces, держите **один** `package-lock.json` в **корне** и не отключайте workspaces.
- **Переменные окружения** задаются **отдельно** в каждом проекте Vercel.
