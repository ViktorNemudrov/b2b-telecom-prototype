"use client";

import * as React from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const PWA_INSTALL_COMPLETED_KEY = "b2b_pwa_install_completed_v1";

/** Сохраняем событие между пересозданием эффекта (React Strict Mode) и не теряем prompt. */
let capturedDeferredInstall: BeforeInstallPromptEvent | null = null;

function parseUa(ua: string) {
  const u = ua.toLowerCase();
  const isIos = /iphone|ipad|ipod/.test(u);
  const isIosSafari = isIos && /safari/.test(u) && !/crios|fxios|edgios/.test(u);
  const isAndroid = /android/.test(u);
  const isChrome =
    /chrome/.test(u) && !/edg|opr|samsungbrowser|firefox|ucbrowser|qqbrowser/i.test(u);
  const isAndroidChrome = isAndroid && isChrome;
  return { isIosSafari, isAndroidChrome, isAndroid };
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = React.useState<BeforeInstallPromptEvent | null>(() =>
    capturedDeferredInstall
  );
  const [showInstall, setShowInstall] = React.useState(false);
  /** «Позже» скрывает баннер только до перезагрузки страницы — без записи в localStorage. */
  const [dismissedSession, setDismissedSession] = React.useState(false);

  React.useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);

  React.useEffect(() => {
    const isStandalone =
      (window.matchMedia?.("(display-mode: standalone)")?.matches ?? false) ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (isStandalone) return;

    const completed = window.localStorage.getItem(PWA_INSTALL_COMPLETED_KEY) === "1";
    /** Только наследованные ключи до этой версии — для совместимости со smoke/e2e. Новый «Позже» в LS не пишется. */
    const legacyDismissed =
      window.localStorage.getItem("b2b_pwa_install_dismissed_v1") === "1" ||
      window.localStorage.getItem("pwa-install-dismissed") === "1";

    if (completed || dismissedSession || legacyDismissed) return;

    if (capturedDeferredInstall) {
      setDeferredPrompt(capturedDeferredInstall);
      setShowInstall(true);
    }

    const ua = window.navigator.userAgent;
    const { isIosSafari, isAndroid } = parseUa(ua);

    let openTimer: number | null = null;
    if (isIosSafari) {
      setShowInstall(true);
    } else if (isAndroid) {
      // Сразу показываем баннер: на Android задержка приводит к тому, что подсказку «не видно» при быстром взгляде; beforeinstallprompt придёт отдельно.
      setShowInstall(true);
    } else {
      openTimer = window.setTimeout(() => setShowInstall(true), 1200);
    }

    const onBeforeInstallPrompt = (event: Event) => {
      const e = event as BeforeInstallPromptEvent;
      e.preventDefault();
      capturedDeferredInstall = e;
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    const onAppInstalled = () => {
      capturedDeferredInstall = null;
      setDeferredPrompt(null);
      setShowInstall(false);
      window.localStorage.setItem(PWA_INSTALL_COMPLETED_KEY, "1");
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      if (openTimer) window.clearTimeout(openTimer);
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, [dismissedSession]);

  const dismiss = () => {
    setDismissedSession(true);
    setShowInstall(false);
  };

  if (!showInstall) return null;

  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const { isIosSafari, isAndroidChrome, isAndroid } = parseUa(ua);

  let body: string;
  if (deferredPrompt) {
    body = "Добавьте приложение на экран телефона для быстрого доступа.";
  } else if (isIosSafari) {
    body = "Нажмите «Поделиться» в Safari и выберите «На экран Домой».";
  } else if (isAndroidChrome) {
    body =
      "Нажмите «Установить», когда Chrome предложит, или откройте меню (⋮) → «Установить приложение» / «Добавить на главный экран».";
  } else if (isAndroid) {
    body =
      "Откройте меню браузера (⋮) и выберите «Установить приложение» или «Добавить на главный экран».";
  } else {
    body =
      "В браузере установка может быть в меню «Установить приложение» или «Добавить на экран Домой».";
  }

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-[100] mx-auto w-full max-w-[430px] px-4"
      style={{ bottom: "calc(4.5rem + env(safe-area-inset-bottom, 0px))" }}
    >
      <div className="pointer-events-auto rounded-2xl border border-[#E8EAED] bg-white/95 p-3 shadow-soft backdrop-blur dark:border-slate-600 dark:bg-slate-900/95">
        <div className="text-sm font-semibold text-[#212529] dark:text-slate-100">Установить Билайн.One</div>
        <div className="mt-1 text-xs leading-relaxed text-[#6B7280] dark:text-slate-300">{body}</div>
        <div className="mt-3 flex min-h-[44px] items-center justify-end gap-2">
          <button
            type="button"
            className="min-h-[44px] rounded-full px-4 py-2 text-xs font-semibold text-[#8E8E93] dark:text-slate-300"
            onClick={dismiss}
          >
            Позже
          </button>
          {deferredPrompt ? (
            <button
              type="button"
              className="min-h-[44px] rounded-full bg-[#F9D400] px-4 py-2 text-xs font-semibold text-[#212529]"
              onClick={async () => {
                await deferredPrompt.prompt();
                const result = await deferredPrompt.userChoice;
                if (result.outcome === "accepted") {
                  window.localStorage.setItem(PWA_INSTALL_COMPLETED_KEY, "1");
                  setShowInstall(false);
                  capturedDeferredInstall = null;
                }
                setDeferredPrompt(null);
              }}
            >
              Установить
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
