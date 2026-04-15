import * as React from "react";
import { invoicesJanFebApr2026, invoicesMarch2026, type InvoiceItem } from "@shared/lib/mockData";

function seededRandom(seed: number) {
  let x = seed | 0;
  return () => {
    x ^= x << 13;
    x ^= x >> 17;
    x ^= x << 5;
    return ((x >>> 0) % 1000) / 1000;
  };
}

function buildSessionInvoices(): InvoiceItem[] {
  const rnd = seededRandom(Date.now());
  const extra = invoicesJanFebApr2026.map((inv) => ({
    ...inv,
    amountRub: Math.max(4200, Math.round(inv.amountRub * (0.8 + rnd() * 0.5))),
    meta: `${inv.meta.split(" от ")[0]} от ${String(1 + Math.floor(rnd() * 27)).padStart(2, "0")}.${inv.periodLabel.includes("январь") ? "01" : inv.periodLabel.includes("февраль") ? "02" : "04"}.26`
  }));
  return [...invoicesMarch2026.map((inv) => ({ ...inv })), ...extra];
}

let runtimeInvoices: InvoiceItem[] = buildSessionInvoices();
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export function subscribeRuntimeInvoices(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getRuntimeInvoicesSnapshot() {
  return runtimeInvoices;
}

export function markInvoicePaid(id: string) {
  runtimeInvoices = runtimeInvoices.map((inv) => (inv.id === id ? { ...inv, status: "paid" } : inv));
  emit();
}

export function useRuntimeInvoices() {
  return React.useSyncExternalStore(subscribeRuntimeInvoices, getRuntimeInvoicesSnapshot, getRuntimeInvoicesSnapshot);
}
