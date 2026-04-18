import { describe, expect, it } from "vitest";
import { filterClassicInvoicesByStatus, type ClassicInvoicesStatusFilter } from "./classicInvoicesFilter";
import type { InvoiceItem } from "@shared/lib/mockData";

const sample: InvoiceItem[] = [
  { id: "a", amountRub: 1, dueLabel: "", meta: "", status: "pay", periodLabel: "" },
  { id: "b", amountRub: 2, dueLabel: "", meta: "", status: "pending", periodLabel: "" },
  { id: "c", amountRub: 3, dueLabel: "", meta: "", status: "paid", periodLabel: "" }
];

describe("filterClassicInvoicesByStatus", () => {
  it("returns all when filter is all", () => {
    expect(filterClassicInvoicesByStatus(sample, "all")).toEqual(sample);
  });

  it.each<[ClassicInvoicesStatusFilter, string[]]>([
    ["pay", ["a"]],
    ["pending", ["b"]]
  ])("filters by %s", (filter, ids) => {
    expect(filterClassicInvoicesByStatus(sample, filter).map((i) => i.id)).toEqual(ids);
  });
});
