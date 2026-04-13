"use client";

import Link from "next/link";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppShell } from "@/components/layout/AppShell";
import { cn } from "@shared/components/ui/cn";
import { invoicesMarch2026 } from "@shared/lib/mockData";

export default function InvoicesListPage() {
  return (
    <>
      <AppHeader />
      <AppShell>
        <div className="safe-px space-y-4 pb-6 pt-2">
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Счета</h1>
          <div className="space-y-2">
            {invoicesMarch2026.map((inv) => (
              <Link
                key={inv.id}
                href={`/invoices/${inv.id}`}
                className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-softSm dark:border-slate-700 dark:bg-slate-800"
              >
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {inv.amountRub.toLocaleString("ru-RU")} ₽ — {inv.dueLabel}
                  </div>
                  <div className="text-xs text-slate-500">{inv.meta}</div>
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
