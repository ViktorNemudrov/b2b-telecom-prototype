/** Горизонтальный свайп между экранами шапки Classic: Главный ↔ Виджеты (экран «Лента событий» /events скрыт). */
export const CLASSIC_NAV_SWIPE_SEGMENTS = ["/assistant", "/widgets"] as const;

export function normalizeClassicNavPath(raw: string): string {
  const trimmed = raw.replace(/\/$/, "") || "/";
  return trimmed;
}

/** Индекс вкладки навбара или null, если экран не из тройки свайпа */
export function classicAssistantNavSwipeIndex(path: string): number | null {
  const n = normalizeClassicNavPath(path);
  for (let i = 0; i < CLASSIC_NAV_SWIPE_SEGMENTS.length; i++) {
    const base = CLASSIC_NAV_SWIPE_SEGMENTS[i];
    if (n === base || n.startsWith(`${base}/`)) return i;
  }
  return null;
}

export function hrefForClassicNavSegment(index: number): string {
  return `${CLASSIC_NAV_SWIPE_SEGMENTS[index]}/`;
}
