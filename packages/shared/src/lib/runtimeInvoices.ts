import * as React from "react";
import { invoicesMarch2026, type InvoiceItem } from "@shared/lib/mockData";

let runtimeInvoices: InvoiceItem[] = invoicesMarch2026.map((inv) => ({ ...inv }));
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
