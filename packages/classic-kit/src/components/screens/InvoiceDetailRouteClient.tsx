"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { InvoiceDetailClient } from "@shared/components/screens/InvoiceDetailClient";

/** Выбор «Назад» по query `from=finance` (переход из «Документы → Финансы»). */
export function InvoiceDetailRouteClient({ id }: { id: string }) {
  const sp = useSearchParams();
  const from = sp.get("from");
  const backHref = from === "finance" ? "/documents/finance/" : from === "assistant" ? "/assistant/" : "/invoices/";
  return <InvoiceDetailClient id={id} backHref={backHref} />;
}
