import type { InvoiceItem } from "@shared/lib/mockData";

const statusRank: Record<string, number> = { pay: 0, pending: 1, paid: 2 };
const monthOrder: Record<string, number> = {
  январь: 1,
  февраль: 2,
  март: 3,
  апрель: 4,
  май: 5,
  июнь: 6,
  июль: 7,
  август: 8,
  сентябрь: 9,
  октябрь: 10,
  ноябрь: 11,
  декабрь: 12
};

export type InvoiceSortKey = "amount_desc" | "amount_asc" | "date_desc" | "date_asc" | "status";

function parseDue(v: string) {
  const match = v.match(/(\d{1,2})\.(\d{1,2})/);
  if (!match) return 0;
  const [, d, m] = match;
  return Number(m) * 100 + Number(d);
}

function parsePeriod(v: string) {
  const month = Object.keys(monthOrder).find((k) => v.toLowerCase().includes(k)) ?? "январь";
  const year = Number(v.match(/(20\d{2})/)?.[1] ?? "2026");
  return year * 100 + monthOrder[month];
}

/** Сортировка списка счетов — та же логика, что на экране «Счета 2026» в приложениях. */
export function sortInvoiceItems(items: InvoiceItem[], sortBy: InvoiceSortKey): InvoiceItem[] {
  return [...items].sort((a, b) => {
    if (sortBy === "amount_desc") return b.amountRub - a.amountRub;
    if (sortBy === "amount_asc") return a.amountRub - b.amountRub;
    if (sortBy === "status") return statusRank[a.status] - statusRank[b.status] || b.amountRub - a.amountRub;
    if (sortBy === "date_asc")
      return parsePeriod(a.periodLabel) - parsePeriod(b.periodLabel) || parseDue(a.dueLabel) - parseDue(b.dueLabel);
    return parsePeriod(b.periodLabel) - parsePeriod(a.periodLabel) || parseDue(b.dueLabel) - parseDue(a.dueLabel);
  });
}
