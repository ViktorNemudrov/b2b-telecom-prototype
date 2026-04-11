# Сборка APK для Android (Capacitor) — вариант AI

APK настраивается из приложения **`apps/ai-first`** (пакет `@b2b/ai-first`).

## Подготовка

```bash
cd apps/ai-first
npm install   # при первой настройке — из корня репозитория: npm install
npm run build
npx cap add android   # один раз, если папки android ещё нет
npm run mobile:sync
npm run mobile:android
```

Из **корня** монорепозитория:

```bash
npm install
npm run mobile:sync
npm run mobile:android
```

(скрипты проксируются в workspace `@b2b/ai-first`.)

## Android Studio

**Build → Build Bundle(s) / APK(s) → Build APK(s)**  
APK: **`apps/ai-first/android/app/build/outputs/apk/debug/app-debug.apk`**

Папка **`apps/ai-first/android/`** в `.gitignore` — после `git clone` снова выполните `npx cap add android` в каталоге `apps/ai-first`.

## Конфиг

Файл **`apps/ai-first/capacitor.config.ts`**: `webDir: "out"` (результат `next build` со статическим экспортом).
