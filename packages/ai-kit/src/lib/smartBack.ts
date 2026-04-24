type AppRouterBack = { back: () => void; push: (href: string) => void };

type NavigationWithCanGoBack = {
  canGoBack?: () => boolean;
};

/**
 * Есть ли у вкладки предыдущая запись в истории навигации (без ручного стека).
 * Предпочитаем Navigation API (Chromium / современные WebView): он ближе к «реальному» back,
 * чем history.length (включает внешние переходы и даёт ложные срабатывания в WebView).
 */
export function shouldDelegateBackToHistory(): boolean {
  if (typeof window === "undefined") return false;
  const navigation = (window as unknown as { navigation?: NavigationWithCanGoBack }).navigation;
  if (navigation && typeof navigation.canGoBack === "function") {
    try {
      return navigation.canGoBack();
    } catch {
      /* ignore */
    }
  }
  return window.history.length > 1;
}

/**
 * «Назад»: делегируем `router.back()` стеку браузера/WebView (как системная кнопка),
 * иначе — явный fallback (прямой заход, только replace и т.п.).
 */
export function goSmartBack(router: AppRouterBack, fallbackHref: string) {
  if (typeof window === "undefined") {
    router.push(fallbackHref);
    return;
  }
  if (shouldDelegateBackToHistory()) {
    router.back();
    return;
  }
  router.push(fallbackHref);
}
