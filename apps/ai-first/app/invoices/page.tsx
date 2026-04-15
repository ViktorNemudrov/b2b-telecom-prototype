"use client";

import * as React from "react";
import Link from "next/link";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppShell } from "@/components/layout/AppShell";
import { PageBackLink } from "@shared/components/PageBackLink";
import { cn } from "@shared/components/ui/cn";
import { useRuntimeInvoices } from "@shared/lib/runtimeInvoices";

const statusRank: Record<string, number> = { pay: 0, pending: 1, paid: 2 };
const monthOrder: Record<string, number> = { январь: 1, февраль: 2, март: 3, апрель: 4, май: 5, июнь: 6, июль: 7, август: 8, сентябрь: 9, октябрь: 10, ноябрь: 11, декабрь: 12 };

export default function InvoicesListPage() {
  const invoices = useRuntimeInvoices();
  const [sortBy, setSortBy] = React.useState<"amount_desc" | "amount_asc" | "date_desc" | "date_asc" | "status">("date_desc");
  const sorted = React.useMemo(() => {
    const parseDue = (v: string) => {
      const match = v.match(/(\d{1,2})\.(\d{1,2})/);
      if (!match) return 0;
      const [, d, m] = match;
      return Number(m) * 100 + Number(d);
    };
    const parsePeriod = (v: string) => {
      const month = Object.keys(monthOrder).find((k) => v.toLowerCase().includes(k)) ?? "январь";
      const year = Number(v.match(/(20\d{2})/)?.[1] ?? "2026");
      return year * 100 + monthOrder[month];
    };
    return [...invoices].sort((a, b) => {
      if (sortBy === "amount_desc") return b.amountRub - a.amountRub;
      if (sortBy === "amount_asc") return a.amountRub - b.amountRub;
      if (sortBy === "status") return statusRank[a.status] - statusRank[b.status] || b.amountRub - a.amountRub;
      if (sortBy === "date_asc") return parsePeriod(a.periodLabel) - parsePeriod(b.periodLabel) || parseDue(a.dueLabel) - parseDue(b.dueLabel);
      return parsePeriod(b.periodLabel) - parsePeriod(a.periodLabel) || parseDue(b.dueLabel) - parseDue(a.dueLabel);
    });
  }, [invoices, sortBy]);

  return (
    <>
      <AppHeader />
      <AppShell>
        <div className="safe-px space-y-4 pb-6 pt-2">
          <PageBackLink />
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Счета 2026</h1>
          <div className="flex items-center gap-2">
            <label htmlFor="invoice-sort-ai" className="text-sm text-slate-600 dark:text-slate-300">
              Сортировка:
            </label>
            <select
              id="invoice-sort-ai"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="date_desc">По дате (сначала новые)</option>
              <option value="date_asc">По дате (сначала старые)</option>
              <option value="amount_desc">По сумме (сначала дорогие)</option>
              <option value="amount_asc">По сумме (сначала дешевые)</option>
              <option value="status">По статусу (к оплате → в оплате → оплаченные)</option>
            </select>
          </div>
          <div className="space-y-2">
            {sorted.map((inv) => (
              <Link
                key={inv.id}
                href={`/invoices/${inv.id}/`}
                className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-softSm dark:border-slate-700 dark:bg-slate-800"
              >
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {inv.amountRub.toLocaleString("ru-RU")} ₽ — {inv.dueLabel}
                  </div>
                  <div className="text-xs text-slate-500">{inv.periodLabel} · {inv.meta}</div>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11px] font-bold",
                    inv.status === "paid" && "bg-emerald-100 text-emerald-800",
                    inv.status === "pending" && "bg-amber-100 text-amber-900",
                    inv.status === "pay" && "bg-rose-100 text-rose-800"
                  )}
                >
                  {inv.status === "paid" ? "Оплачен" : inv.status === "pending" ? "В оплате" : "Оплатить"}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </AppShell>
    </>
  );
}
