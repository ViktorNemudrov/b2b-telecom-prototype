/**
 * «Назад» как в нативном приложении: сначала history.back (работает с системной кнопкой
 * телефона в WebView/браузере при цепочке push), иначе переход на fallback.
 */
export function goSmartBack(
  router: { back: () => void; push: (href: string) => void },
  fallbackHref: string
) {
  if (typeof window === "undefined") {
    router.push(fallbackHref);
    return;
  }
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push(fallbackHref);
  }
}
