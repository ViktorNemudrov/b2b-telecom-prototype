"use client";

import * as React from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppShell } from "@/components/layout/AppShell";
import { ClassicInvoicesList } from "@shared/components/invoices/ClassicInvoicesList";
import { PageBackLink } from "@shared/components/PageBackLink";
import type { InvoiceSortKey } from "@shared/lib/invoiceListSort";

export default function InvoicesListPage() {
  const [sortBy, setSortBy] = React.useState<InvoiceSortKey>("date_desc");

  return (
    <>
      <AppHeader />
      <AppShell>
        <div className="safe-px space-y-4 pb-24 pt-2">
          <PageBackLink />
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Счета 2026</h1>
          <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-2">
            <label htmlFor="invoice-sort-ai" className="text-sm text-slate-600 dark:text-slate-300">
              Сортировка:
            </label>
            <select
              id="invoice-sort-ai"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as InvoiceSortKey)}
              className="w-full max-w-[260px] rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="date_desc">Дата: новые</option>
              <option value="date_asc">Дата: старые</option>
              <option value="amount_desc">Сумма: больше</option>
              <option value="amount_asc">Сумма: меньше</option>
              <option value="status">Статус</option>
            </select>
          </div>
          <ClassicInvoicesList sortBy={sortBy} getInvoiceHref={(id) => `/invoices/${id}/`} />
        </div>
      </AppShell>
    </>
  );
}
