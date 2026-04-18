import type { InvoiceItem } from "@shared/lib/mockData";

export type ClassicInvoicesStatusFilter = "all" | "pay" | "pending";

export function filterClassicInvoicesByStatus(
  items: InvoiceItem[],
  statusFilter: ClassicInvoicesStatusFilter
): InvoiceItem[] {
  if (statusFilter === "all") return items;
  return items.filter((inv) => inv.status === statusFilter);
}
