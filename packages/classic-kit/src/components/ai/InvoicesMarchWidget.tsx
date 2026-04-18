"use client";

import Link from "next/link";
import { ChevronRight, Volume2 } from "lucide-react";
import { Card, CardContent } from "@shared/components/ui/card";
import { cn } from "@shared/components/ui/cn";
import { openDevelopmentStub } from "@shared/lib/developmentStub";
import { useRuntimeInvoices } from "@shared/lib/runtimeInvoices";

const statusLabel: Record<string, string> = {
  pay: "Оплатить",
  pending: "В оплате",
  paid: "Оплачен"
};

export function InvoicesMarchWidget() {
  const allInvoices = useRuntimeInvoices();
  const invoices = allInvoices.filter((i) => i.periodLabel.includes("март"));
  const total = invoices.reduce((a, i) => a + i.amountRub, 0);
  const paidCount = invoices.filter((i) => i.status === "paid").length;

  return (
    <Card className="border-slate-200 dark:border-slate-700">
      <CardContent className="space-y-3 pb-4 pt-4">
        <div className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100">
          Счета за март 2026
        </div>
        <div className="flex gap-2">
          <p className="flex-1 text-sm leading-relaxed text-slate-800 dark:text-slate-100">
            За март 2026 года у вас:{" "}
            <span className="font-semibold">
              {paidCount} оплаченных счетов на общую сумму {total.toLocaleString("ru-RU")} ₽
            </span>
            .
          </p>
          <button
            type="button"
            className="shrink-0 rounded-full border border-slate-200 p-2 dark:border-slate-600"
            aria-label="Озвучить"
            onClick={() => {
              if (!("speechSynthesis" in window)) return;
              const u = new SpeechSynthesisUtterance(
                `За март 2026 года у вас: ${paidCount} оплаченных счетов на общую сумму ${total.toLocaleString("ru-RU")} рублей.`
              );
              u.lang = "ru-RU";
              window.speechSynthesis.cancel();
              window.speechSynthesis.speak(u);
            }}
          >
            <Volume2 className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        <div className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-2 dark:border-slate-700 dark:bg-slate-800/50">
          {invoices.map((inv) => (
            <Link
              key={inv.id}
              href={`/invoices/${inv.id}/`}
              className="flex items-start justify-between gap-2 rounded-xl bg-white p-3 shadow-softSm dark:bg-slate-800"
            >
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {inv.amountRub.toLocaleString("ru-RU")} ₽ — {inv.dueLabel}
                </div>
                <div className="text-xs text-slate-500">{inv.meta}</div>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold",
                  inv.status === "paid" && "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
                  inv.status === "pending" && "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100",
                  inv.status === "pay" && "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-100"
                )}
              >
                {statusLabel[inv.status]}
              </span>
            </Link>
          ))}
          <Link
            href="/invoices/"
            className="flex w-full items-center justify-center py-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            Счета за март <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Последующие вопросы</div>
          <ul className="mt-2 space-y-2 text-sm text-slate-800 dark:text-slate-200">
            <li>
              <button type="button" className="flex w-full justify-between" onClick={() => openDevelopmentStub("Отчёт")}>
                Финансовый отчет за Март 2026 <ChevronRight className="h-4 w-4" />
              </button>
            </li>
            <li>
              <button type="button" className="flex w-full justify-between" onClick={() => openDevelopmentStub("Платежи")}>
                Платежи за Март 2026 <ChevronRight className="h-4 w-4" />
              </button>
            </li>
            <li>
              <button type="button" className="flex w-full justify-between" onClick={() => openDevelopmentStub("Архив")}>
                Архив платежей за Март 2026 <ChevronRight className="h-4 w-4" />
              </button>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
