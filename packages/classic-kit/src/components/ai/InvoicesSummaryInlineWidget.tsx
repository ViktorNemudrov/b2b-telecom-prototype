"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@shared/components/ui/card";
import type { InvoiceItem } from "@shared/lib/mockData";

function statusLabel(status: InvoiceItem["status"]) {
  if (status === "paid") return "Оплачен";
  if (status === "pending") return "В оплате";
  return "К оплате";
}

function statusClass(status: InvoiceItem["status"]) {
  if (status === "paid") return "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100";
  if (status === "pending") return "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100";
  return "bg-rose-100 text-rose-900 dark:bg-rose-900/40 dark:text-rose-100";
}

export function InvoicesSummaryInlineWidget({ invoices }: { invoices: InvoiceItem[] }) {
  const router = useRouter();
  const total = invoices.length;
  const paid = invoices.filter((i) => i.status === "paid").length;
  const pending = invoices.filter((i) => i.status === "pending").length;
  const unpaid = invoices.filter((i) => i.status === "pay").length;
  const sumTotal = invoices.reduce((s, i) => s + i.amountRub, 0);
  const sumUnpaid = invoices.filter((i) => i.status === "pay").reduce((s, i) => s + i.amountRub, 0);
  const paidPct = total ? Math.round((paid / total) * 100) : 0;
  const pendingPct = total ? Math.round((pending / total) * 100) : 0;
  const unpaidPct = total ? Math.max(0, 100 - paidPct - pendingPct) : 0;

  return (
    <Card className="border-slate-200 dark:border-slate-700" data-testid="invoices-summary-widget">
      <CardContent className="space-y-3 pb-4 pt-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Счета</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">Все статусы</span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: "Всего", value: String(total) },
            { label: "Оплачено", value: String(paid) },
            { label: "В оплате", value: String(pending) },
            { label: "К оплате", value: String(unpaid) }
          ].map((cell) => (
            <div
              key={cell.label}
              className="rounded-xl border border-slate-100 bg-slate-50/90 px-2 py-2 text-center dark:border-slate-600 dark:bg-slate-800/60"
            >
              <div className="text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{cell.label}</div>
              <div className="text-lg font-semibold tabular-nums text-slate-900 dark:text-slate-100">{cell.value}</div>
            </div>
          ))}
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Сумма по всем счетам</span>
            <span className="font-semibold tabular-nums text-slate-800 dark:text-slate-100">
              {sumTotal.toLocaleString("ru-RU")} ₽
            </span>
          </div>
          <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Сумма к оплате (неоплаченные)</span>
            <span className="font-semibold tabular-nums text-rose-700 dark:text-rose-300">
              {sumUnpaid.toLocaleString("ru-RU")} ₽
            </span>
          </div>
          <div className="mt-2 flex h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
            <div className="h-full bg-emerald-500" style={{ width: `${paidPct}%` }} title="Оплачено" />
            <div className="h-full bg-amber-400" style={{ width: `${pendingPct}%` }} title="В оплате" />
            <div className="h-full bg-rose-500" style={{ width: `${unpaidPct}%` }} title="К оплате" />
          </div>
        </div>
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Список счетов</div>
        <ul className="divide-y divide-slate-100 dark:divide-slate-600">
          {invoices.map((inv) => (
            <li key={inv.id}>
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-xl px-1 py-2.5 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/80"
                onClick={() => router.push(`/invoices/${inv.id}/`)}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {inv.amountRub.toLocaleString("ru-RU")} ₽
                  </div>
                  <div className="truncate text-xs text-slate-500 dark:text-slate-400">{inv.meta}</div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500">{inv.periodLabel}</div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusClass(inv.status)}`}>
                    {statusLabel(inv.status)}
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-500" />
                </div>
              </button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
