"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@shared/components/ui/cn";
import { useRuntimeInvoices } from "@shared/lib/runtimeInvoices";
import { sortInvoiceItems, type InvoiceSortKey } from "@shared/lib/invoiceListSort";
import {
  filterClassicInvoicesByStatus,
  type ClassicInvoicesStatusFilter
} from "@shared/components/invoices/classicInvoicesFilter";

export type { ClassicInvoicesStatusFilter } from "@shared/components/invoices/classicInvoicesFilter";

export function ClassicInvoicesList({
  sortBy,
  getInvoiceHref,
  statusFilter = "all"
}: {
  sortBy: InvoiceSortKey;
  getInvoiceHref: (id: string) => string;
  /** Сузить список по статусу (`pay` — к оплате, `pending` — частично / в оплате). */
  statusFilter?: ClassicInvoicesStatusFilter;
}) {
  const invoices = useRuntimeInvoices();
  const sorted = React.useMemo(() => sortInvoiceItems(invoices, sortBy), [invoices, sortBy]);
  const filtered = React.useMemo(
    () => filterClassicInvoicesByStatus(sorted, statusFilter),
    [sorted, statusFilter]
  );

  const emptyHint =
    statusFilter === "all"
      ? "Счета не найдены."
      : "Нет счетов по выбранному фильтру. Смените фильтр или сбросьте на «Все счета».";

  return (
    <div className="space-y-2" data-testid="classic-invoices-list">
      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-800/40 dark:text-slate-400">
          {emptyHint}
        </p>
      ) : (
        filtered.map((inv) => (
          <Link
            key={inv.id}
            href={getInvoiceHref(inv.id)}
            className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-softSm dark:border-slate-700 dark:bg-slate-800"
          >
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {inv.amountRub.toLocaleString("ru-RU")} ₽ — {inv.dueLabel}
              </div>
              <div className="text-xs text-slate-500">
                {inv.periodLabel} · {inv.meta}
              </div>
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
        ))
      )}
    </div>
  );
}
