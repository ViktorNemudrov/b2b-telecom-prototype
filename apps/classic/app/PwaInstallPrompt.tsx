"use client";

import * as React from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const PWA_INSTALL_DISMISSED_KEY = "b2b_pwa_install_dismissed_v1";
const PWA_INSTALL_COMPLETED_KEY = "b2b_pwa_install_completed_v1";

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = React.useState<BeforeInstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = React.useState(false);
  const [iosHint, setIosHint] = React.useState(false);

  React.useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);

  React.useEffect(() => {
    const isStandalone =
      (window.matchMedia?.("(display-mode: standalone)")?.matches ?? false) ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (isStandalone) return;
    const dismissed = window.localStorage.getItem(PWA_INSTALL_DISMISSED_KEY) === "1";
    const completed = window.localStorage.getItem(PWA_INSTALL_COMPLETED_KEY) === "1";
    if (dismissed || completed) return;
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
      window.localStorage.setItem(PWA_INSTALL_COMPLETED_KEY, "1");
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      if (openTimer) window.clearTimeout(openTimer);
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  if (!showInstall) return null;
  if (!deferredPrompt && !iosHint) {
    return (
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 mx-auto w-full max-w-[430px] px-4">
        <div className="pointer-events-auto rounded-2xl border border-[#E8EAED] bg-white/95 p-3 shadow-soft backdrop-blur dark:border-slate-600 dark:bg-slate-900/95">
          <div className="text-sm font-semibold text-[#212529] dark:text-slate-100">Установить Билайн.One</div>
          <div className="mt-1 text-xs text-[#6B7280] dark:text-slate-300">
            В браузере установка может требовать меню «Установить приложение» или «Добавить на экран Домой».
          </div>
          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              className="rounded-full px-3 py-1.5 text-xs font-semibold text-[#8E8E93] dark:text-slate-300"
              onClick={() => {
                window.localStorage.setItem(PWA_INSTALL_DISMISSED_KEY, "1");
                setShowInstall(false);
              }}
            >
              Позже
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 mx-auto w-full max-w-[430px] px-4">
      <div className="pointer-events-auto rounded-2xl border border-[#E8EAED] bg-white/95 p-3 shadow-soft backdrop-blur dark:border-slate-600 dark:bg-slate-900/95">
        <div className="text-sm font-semibold text-[#212529] dark:text-slate-100">Установить Билайн.One</div>
        <div className="mt-1 text-xs text-[#6B7280] dark:text-slate-300">
          {deferredPrompt
            ? "Добавьте приложение на экран телефона для быстрого доступа."
            : "На iPhone: нажмите «Поделиться» в Safari и выберите «На экран Домой»."}
        </div>
        <div className="mt-3 flex items-center justify-end gap-2">
          <button
            type="button"
            className="rounded-full px-3 py-1.5 text-xs font-semibold text-[#8E8E93] dark:text-slate-300"
            onClick={() => {
              window.localStorage.setItem(PWA_INSTALL_DISMISSED_KEY, "1");
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
                  window.localStorage.setItem(PWA_INSTALL_COMPLETED_KEY, "1");
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
