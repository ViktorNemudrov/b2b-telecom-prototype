import type { CallItem, ChatMessage, InvoiceItem } from "@shared/lib/mockData";

const monthHints = [
  { key: "январь", tokens: ["январ"] },
  { key: "февраль", tokens: ["феврал"] },
  { key: "март", tokens: ["март"] },
  { key: "апрель", tokens: ["апрел"] }
] as const;

type MonthKey = (typeof monthHints)[number]["key"];

function detectMonth(text: string): MonthKey | null {
  const q = text.toLowerCase();
  for (const m of monthHints) {
    if (m.tokens.some((t) => q.includes(t))) return m.key;
  }
  return null;
}

function detectTwoMonths(text: string): [MonthKey, MonthKey] | null {
  const q = text.toLowerCase();
  const found = monthHints.filter((m) => m.tokens.some((t) => q.includes(t))).map((m) => m.key);
  if (found.length >= 2) return [found[0], found[1]];
  return null;
}

function sumByMonth(invoices: InvoiceItem[], month: MonthKey): number {
  return invoices
    .filter((inv) => inv.periodLabel.toLowerCase().includes(month))
    .reduce((sum, inv) => sum + inv.amountRub, 0);
}

function countByMonth(invoices: InvoiceItem[], month: MonthKey): number {
  return invoices.filter((inv) => inv.periodLabel.toLowerCase().includes(month)).length;
}

function rub(value: number): string {
  return `${value.toLocaleString("ru-RU")} ₽`;
}

export function resolveAnalyticsResponse(
  prompt: string,
  invoices: InvoiceItem[],
  calls: CallItem[]
): Pick<ChatMessage, "text" | "widget" | "invoiceMonth" | "suggested"> | null {
  const q = prompt.toLowerCase().trim().replace(/\s+/g, " ");

  const twoMonths = detectTwoMonths(q);
  const asksDifference =
    q.includes("разниц") || q.includes("сравни") || q.includes("сравнение") || q.includes("больше") || q.includes("меньше");

  if (
    twoMonths &&
    (q.includes("процент") || q.includes("доля")) &&
    (q.includes("не оплат") || q.includes("неоплат") || q.includes("на оплат"))
  ) {
    const [m1, m2] = twoMonths;
    const month1 = invoices.filter((inv) => inv.periodLabel.toLowerCase().includes(m1));
    const month2 = invoices.filter((inv) => inv.periodLabel.toLowerCase().includes(m2));
    const unpaid1 = month1.filter((inv) => inv.status === "pay").length;
    const unpaid2 = month2.filter((inv) => inv.status === "pay").length;
    const pct1 = month1.length ? (unpaid1 / month1.length) * 100 : 0;
    const pct2 = month2.length ? (unpaid2 / month2.length) * 100 : 0;
    const delta = pct1 - pct2;
    return {
      text:
        `Неоплата по месяцам: ${m1} — ${pct1.toFixed(1)}% (${unpaid1} из ${month1.length}), ${m2} — ${pct2.toFixed(1)}% (${unpaid2} из ${month2.length}).\n\n` +
        `Разница: ${delta >= 0 ? "+" : ""}${delta.toFixed(1)} п.п.`,
      suggested: [`Счета за ${m1}`, `Счета за ${m2}`, "Покажи неоплаченные"]
    };
  }
  if (twoMonths && asksDifference && (q.includes("счет") || q.includes("счёт"))) {
    const [m1, m2] = twoMonths;
    const s1 = sumByMonth(invoices, m1);
    const s2 = sumByMonth(invoices, m2);
    const diff = s1 - s2;
    const trend = diff === 0 ? "одинаковая" : diff > 0 ? `на ${diff.toLocaleString("ru-RU")} ₽ больше` : `на ${Math.abs(diff).toLocaleString("ru-RU")} ₽ меньше`;
    return {
      text:
        `Сравнение счетов: ${m1} — ${rub(s1)}, ${m2} — ${rub(s2)}. ` +
        `В ${m1} сумма ${trend}, чем в ${m2}.\n\n` +
        `Формула: разница = ${rub(s1)} - ${rub(s2)} = ${rub(diff)}.`,
      suggested: [`Счета за ${m1}`, `Счета за ${m2}`, "Покажи только неоплаченные"]
    };
  }

  if ((q.includes("доля") || q.includes("процент")) && (q.includes("неоплачен") || q.includes("на оплату"))) {
    const total = invoices.length || 1;
    const unpaid = invoices.filter((inv) => inv.status === "pay").length;
    const pct = (unpaid / total) * 100;
    return {
      text:
        `Доля неоплаченных счетов: ${unpaid} из ${total} (${pct.toFixed(1)}%).\n\n` +
        `Формула: (${unpaid} / ${total}) × 100 = ${pct.toFixed(1)}%.`,
      suggested: ["Покажи неоплаченные", "Топ-3 крупных счета", "Сравни месяцы"]
    };
  }

  if ((q.includes("динамик") || q.includes("рост") || q.includes("изменени")) && q.includes("счет")) {
    const [left, right] = detectTwoMonths(q) ?? ["февраль", "март"];
    const sLeft = sumByMonth(invoices, left);
    const sRight = sumByMonth(invoices, right);
    const base = sRight === 0 ? 1 : sRight;
    const pct = ((sLeft - sRight) / base) * 100;
    const direction = pct === 0 ? "без изменений" : pct > 0 ? "рост" : "снижение";
    return {
      text:
        `Динамика ${left} к ${right}: ${direction} на ${Math.abs(pct).toFixed(1)}% (${rub(sLeft)} vs ${rub(sRight)}).\n\n` +
        `Формула: ( ${rub(sLeft)} - ${rub(sRight)} ) / ${rub(base)} × 100 = ${pct.toFixed(1)}%.`,
      suggested: ["Разница по сумме", "Топ-3 крупных счета", "Неоплаченные счета"]
    };
  }

  if ((q.includes("топ") || q.includes("крупн")) && q.includes("счет")) {
    const month = detectMonth(q);
    const pool = month ? invoices.filter((inv) => inv.periodLabel.toLowerCase().includes(month)) : invoices;
    const top = [...pool].sort((a, b) => b.amountRub - a.amountRub).slice(0, 3);
    if (top.length > 0) {
      const lines = top.map((inv, idx) => `${idx + 1}) ${rub(inv.amountRub)} — ${inv.periodLabel}`).join("\n");
      return {
        text: `Топ-3 крупных счета${month ? ` за ${month}` : ""}:\n${lines}`,
        suggested: ["Сравни месяцы", "Доля неоплаченных", "Покажи в чате по месяцу"]
      };
    }
  }

  if ((q.includes("сколько счет") || q.includes("количество счет")) && detectMonth(q)) {
    const month = detectMonth(q)!;
    const count = countByMonth(invoices, month);
    return {
      text: `За ${month} найдено ${count} счет(а).`,
      suggested: [`Счета за ${month}`, "Общая сумма", "Топ-3 крупных счета"]
    };
  }

  const month = detectMonth(q);

  if ((q.includes("в каком месяце") || q.includes("какой месяц")) && (q.includes("больше") || q.includes("максим")) && q.includes("счет")) {
    const withSum = monthHints.map((m) => ({ month: m.key, total: sumByMonth(invoices, m.key) }));
    const best = withSum.sort((a, b) => b.total - a.total)[0];
    return {
      text: `Больше всего потратили в месяце «${best.month}»: ${rub(best.total)}.`,
      suggested: [`Счета за ${best.month}`, "Сравни с мартом", "Покажи топ-3 счета"]
    };
  }

  if (month && (q.includes("счет") || q.includes("счёт"))) {
    return {
      text: "",
      widget: "invoices-month",
      invoiceMonth: month,
      suggested: ["Сколько неоплаченных?", "Общая сумма", "Сравни с мартом"]
    };
  }

  const asksUnpaidTotals = q.includes("сколько") || q.includes("сумм") || q.includes("итог") || q.includes("всего");
  if ((q.includes("неоплачен") || q.includes("на оплату") || q.includes("долг")) && q.includes("счет") && asksUnpaidTotals) {
    const unpaid = invoices.filter((inv) => inv.status === "pay");
    const amount = unpaid.reduce((sum, inv) => sum + inv.amountRub, 0);
    return {
      text: `Сейчас неоплаченных счетов: ${unpaid.length}, на сумму ${rub(amount)}.`,
      suggested: ["Покажи эти счета", "Сравни с прошлым месяцем", "Открыть оплату"]
    };
  }

  if ((q.includes("пропущ") || q.includes("пропуст")) && q.includes("звон")) {
    return {
      text: "",
      widget: "missed-calls-inline",
      suggested: ["Покажи звонки за неделю", "Причины пропусков", "Кто чаще звонит"]
    };
  }

  return null;
}
