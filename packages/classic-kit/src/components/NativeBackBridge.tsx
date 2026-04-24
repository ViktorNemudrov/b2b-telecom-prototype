"use client";

import * as React from "react";
import { tryConsumeNativeBack } from "@shared/lib/nativeBackOverlayStack";

/**
 * На нативной оболочке (Capacitor): перехват back — сначала закрыть оверлей (см. useOverlayNativeBack),
 * иначе делегировать стеку браузера (как обычный history.back / goSmartBack).
 */
export function NativeBackBridge() {
  React.useEffect(() => {
    let cancelled = false;
    let listener: { remove: () => Promise<void> } | undefined;

    void import("@capacitor/core")
      .then(({ Capacitor }) => {
        if (cancelled || !Capacitor.isNativePlatform()) return;
        return import("@capacitor/app").then(({ App }) => {
          if (cancelled) return;
          return App.addListener("backButton", () => {
            if (tryConsumeNativeBack()) return;
            window.history.back();
          }).then((handle) => {
            if (cancelled) {
              void handle.remove();
              return;
            }
            listener = handle;
          });
        });
      })
      .catch(() => {
        /* нет Capacitor / dev в браузере — тихо */
      });

    return () => {
      cancelled = true;
      void listener?.remove();
    };
  }, []);

  return null;
}
