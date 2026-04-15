"use client";

import * as React from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = React.useState<BeforeInstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = React.useState(false);
  const [iosHint, setIosHint] = React.useState(false);
  const [passiveDismissed, setPassiveDismissed] = React.useState(false);

  React.useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);

  React.useEffect(() => {
    try {
      if (window.localStorage.getItem("pwa-install-dismissed") === "1") setPassiveDismissed(true);
    } catch {
      // ignore
    }
  }, []);

  React.useEffect(() => {
    const isStandalone =
      (window.matchMedia?.("(display-mode: standalone)")?.matches ?? false) ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (isStandalone) return;
    try {
      if (window.localStorage.getItem("pwa-install-dismissed") === "1") return;
    } catch {
      // Safari private mode/local storage restrictions.
    }
    const ua = window.navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(ua);
    const isSafari = /safari/.test(ua) && !/crios|fxios|edgios/.test(ua);
    let openTimer: number | null = null;
    if (isIos && isSafari) {
      setIosHint(true);
      setShowInstall(true);
    } else {
      openTimer = window.setTimeout(() => setShowInstall(true), 1200);
    }

    const onBeforeInstallPrompt = (event: Event) => {
      const e = event as BeforeInstallPromptEvent;
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };
    const onAppInstalled = () => {
      setDeferredPrompt(null);
      setShowInstall(false);
      try {
        window.localStorage.setItem("pwa-install-dismissed", "1");
      } catch {
        // ignore
      }
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      if (openTimer) window.clearTimeout(openTimer);
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  if (!deferredPrompt && !iosHint) {
    if (passiveDismissed) return null;
    return (
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 mx-auto w-full max-w-[430px] px-4">
        <div className="pointer-events-auto rounded-2xl border border-[#E8EAED] bg-white/95 p-3 shadow-soft backdrop-blur">
          <div className="text-sm font-semibold text-[#212529]">Установить Билайн.One</div>
          <div className="mt-1 text-xs text-[#6B7280]">
            В браузере установка может требовать меню «Установить приложение» или «Добавить на экран Домой».
          </div>
          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              className="rounded-full px-3 py-1.5 text-xs font-semibold text-[#8E8E93]"
              onClick={() => {
                try {
                  window.localStorage.setItem("pwa-install-dismissed", "1");
                } catch {
                  // ignore
                }
                setPassiveDismissed(true);
                setShowInstall(false);
              }}
            >
              Понятно
            </button>
          </div>
        </div>
      </div>
    );
  }
  if (!showInstall) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 mx-auto w-full max-w-[430px] px-4">
      <div className="pointer-events-auto rounded-2xl border border-[#E8EAED] bg-white/95 p-3 shadow-soft backdrop-blur">
        <div className="text-sm font-semibold text-[#212529]">Установить Билайн.One</div>
        <div className="mt-1 text-xs text-[#6B7280]">
          {deferredPrompt
            ? "Добавьте приложение на экран телефона для быстрого доступа."
            : "На iPhone: нажмите «Поделиться» в Safari и выберите «На экран Домой»."}
        </div>
        <div className="mt-3 flex items-center justify-end gap-2">
          <button
            type="button"
            className="rounded-full px-3 py-1.5 text-xs font-semibold text-[#8E8E93]"
            onClick={() => {
              try {
                window.localStorage.setItem("pwa-install-dismissed", "1");
              } catch {
                // ignore
              }
              setShowInstall(false);
            }}
          >
            Позже
          </button>
          {deferredPrompt ? (
            <button
              type="button"
              className="rounded-full bg-[#F9D400] px-3 py-1.5 text-xs font-semibold text-[#212529]"
              onClick={async () => {
                await deferredPrompt.prompt();
                const result = await deferredPrompt.userChoice;
                if (result.outcome === "accepted") {
                  try {
                    window.localStorage.setItem("pwa-install-dismissed", "1");
                  } catch {
                    // ignore
                  }
                  setShowInstall(false);
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
