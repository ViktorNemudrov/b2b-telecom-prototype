import { describe, expect, it } from "vitest";
import { sortInvoiceItems, type InvoiceSortKey } from "./invoiceListSort";
import type { InvoiceItem } from "./mockData";

const sample: InvoiceItem[] = [
  {
    id: "a",
    amountRub: 1000,
    dueLabel: "до 10.01.26",
    meta: "УПД 1",
    status: "paid",
    periodLabel: "январь 2026"
  },
  {
    id: "b",
    amountRub: 5000,
    dueLabel: "до 15.02.26",
    meta: "УПД 2",
    status: "pay",
    periodLabel: "февраль 2026"
  },
  {
    id: "c",
    amountRub: 3000,
    dueLabel: "до 20.03.26",
    meta: "УПД 3",
    status: "pending",
    periodLabel: "март 2026"
  }
];

describe("sortInvoiceItems", () => {
  it("sorts by amount_desc", () => {
    const s = sortInvoiceItems(sample, "amount_desc");
    expect(s.map((x) => x.id)).toEqual(["b", "c", "a"]);
  });

  it("sorts by amount_asc", () => {
    const s = sortInvoiceItems(sample, "amount_asc");
    expect(s.map((x) => x.id)).toEqual(["a", "c", "b"]);
  });

  it("sorts by status (pay before pending before paid)", () => {
    const s = sortInvoiceItems(sample, "status");
    expect(s.map((x) => x.id)).toEqual(["b", "c", "a"]);
  });

  it("date_desc orders by period then due", () => {
    const s = sortInvoiceItems(sample, "date_desc");
    expect(s[0]?.periodLabel).toContain("март");
  });

  it("accepts all InvoiceSortKey values", () => {
    const keys: InvoiceSortKey[] = ["amount_desc", "amount_asc", "date_desc", "date_asc", "status"];
    for (const k of keys) {
      expect(sortInvoiceItems(sample, k).length).toBe(3);
    }
  });
});
