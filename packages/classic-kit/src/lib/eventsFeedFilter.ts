/**
 * Фильтры ленты событий (Classic): чипы «Пропущенные», «Советы от Ассистента», «Счёт на оплату».
 * По умолчанию — все события (`all`).
 */
export type EventsFeedFilter = "all" | "missed" | "tips" | "invoices";

export type EventsFeedBlockKey =
  | "dailyReport"
  | "callMissed"
  | "callRegular"
  | "assistantAdvice"
  | "tariffBalance"
  | "appealsPanel"
  | "appealsQuickLinks";

export function isBlockVisibleForFilter(filter: EventsFeedFilter, block: EventsFeedBlockKey): boolean {
  if (filter === "all") return true;
  if (filter === "missed") return block === "callMissed";
  if (filter === "tips") return block === "dailyReport" || block === "assistantAdvice";
  if (filter === "invoices") return block === "tariffBalance";
  return true;
}
