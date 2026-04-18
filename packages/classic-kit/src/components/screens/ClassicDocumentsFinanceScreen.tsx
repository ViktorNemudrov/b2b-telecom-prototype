"use client";

import * as React from "react";
import { Calendar, Lock, Search } from "lucide-react";
import { cn } from "@shared/components/ui/cn";
import { ClassicInvoicesList } from "@shared/components/invoices/ClassicInvoicesList";
import type { ClassicInvoicesStatusFilter } from "@shared/components/invoices/classicInvoicesFilter";
import { openDevelopmentStub } from "@shared/lib/developmentStub";

const filterChipClass =
  "shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition dark:bg-slate-800/80 dark:text-slate-200";

const chipInactive =
  "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600";

const chipActive =
  "border border-slate-900 bg-slate-50 text-slate-900 shadow-sm dark:border-slate-300 dark:bg-slate-700 dark:text-slate-100";

const iconButtonClass =
  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 active:scale-[0.98] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700";

/** Экран «Документы → Финансы»: вкладка «Счета», мок «Платежи», фильтры по статусу, список счетов как на экране «Счета 2026». */
export function ClassicDocumentsFinanceScreen() {
  const [statusFilter, setStatusFilter] = React.useState<ClassicInvoicesStatusFilter>("all");

  return (
    <div className="space-y-4" data-testid="documents-finance-screen">
      <div>
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Финансы</h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Счета и платежи (демо по макету)</p>
      </div>

      <div className="flex rounded-full bg-slate-100 p-1 dark:bg-slate-800/90">
        <span
          className="flex flex-1 items-center justify-center rounded-full bg-white px-3 py-2 text-center text-sm font-semibold text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100"
          aria-current="true"
        >
          Счета
        </span>
        <button
          type="button"
          className="flex flex-1 items-center justify-center gap-1 rounded-full px-3 py-2 text-sm text-slate-500 dark:text-slate-400"
          onClick={() => openDevelopmentStub("Раздел «Платежи» в разработке.")}
          aria-label="Платежи (в разработке)"
        >
          <Lock className="h-3.5 w-3.5" aria-hidden />
          Платежи
        </button>
      </div>

      <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          type="button"
          className={iconButtonClass}
          aria-label="Поиск по счетам"
          onClick={() =>
            openDevelopmentStub("Поиск по счетам и документам — в разработке (демо).")
          }
        >
          <Search className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          className={iconButtonClass}
          aria-label="Фильтр по периоду"
          onClick={() =>
            openDevelopmentStub("Выбор периода для отчёта — в разработке (демо).")
          }
        >
          <Calendar className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          data-testid="finance-filter-all"
          className={cn(filterChipClass, statusFilter === "all" ? chipActive : chipInactive)}
          aria-pressed={statusFilter === "all"}
          onClick={() => setStatusFilter("all")}
        >
          Все счета
        </button>
        <button
          type="button"
          data-testid="finance-filter-pay"
          className={cn(filterChipClass, statusFilter === "pay" ? chipActive : chipInactive)}
          aria-pressed={statusFilter === "pay"}
          onClick={() => setStatusFilter("pay")}
        >
          К оплате
        </button>
        <button
          type="button"
          data-testid="finance-filter-pending"
          className={cn(filterChipClass, "mr-1", statusFilter === "pending" ? chipActive : chipInactive)}
          aria-pressed={statusFilter === "pending"}
          onClick={() => setStatusFilter("pending")}
        >
          Оплачен частично
        </button>
      </div>

      <ClassicInvoicesList
        sortBy="date_desc"
        statusFilter={statusFilter}
        getInvoiceHref={(id) => `/invoices/${id}/?from=finance`}
      />
    </div>
  );
}
