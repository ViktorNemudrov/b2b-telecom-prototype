import { describe, expect, it } from "vitest";
import type { CallItem, InvoiceItem } from "@shared/lib/mockData";
import { resolveAnalyticsResponse } from "./chatAnalytics";

const invoices: InvoiceItem[] = [
  { id: "i1", amountRub: 10000, dueLabel: "", meta: "", status: "pay", periodLabel: "февраль 2026" },
  { id: "i2", amountRub: 15000, dueLabel: "", meta: "", status: "paid", periodLabel: "февраль 2026" },
  { id: "i3", amountRub: 40000, dueLabel: "", meta: "", status: "pay", periodLabel: "март 2026" }
];

const calls: CallItem[] = [
  { id: "c1", time: "10:00", phone: "1", missed: true, summary: "", transcript: "" },
  { id: "c2", time: "11:00", phone: "2", missed: false, summary: "", transcript: "" }
];

describe("resolveAnalyticsResponse", () => {
  it("returns month widget for invoice month query", () => {
    const res = resolveAnalyticsResponse("Счета за февраль", invoices, calls);
    expect(res?.widget).toBe("invoices-month");
    expect(res?.invoiceMonth).toBe("февраль");
  });

  it("computes unpaid invoices summary", () => {
    const res = resolveAnalyticsResponse("Сколько неоплаченных счетов?", invoices, calls);
    expect(res?.text).toContain("2");
    expect(res?.text).toContain("50");
  });

  it("does not override explicit show-unpaid command", () => {
    const res = resolveAnalyticsResponse("Покажи неоплаченные счета", invoices, calls);
    expect(res).toBeNull();
  });

  it("counts invoices for month when query has extra spaces", () => {
    const res = resolveAnalyticsResponse("сколько  счетов  за  февраль", invoices, calls);
    expect(res?.text).toContain("За февраль найдено");
  });

  it("computes month difference", () => {
    const res = resolveAnalyticsResponse("Какая разница между суммой счетов в феврале и марте?", invoices, calls);
    expect(res?.text).toContain("февраль");
    expect(res?.text).toContain("март");
  });

  it("returns inline missed calls analytics", () => {
    const res = resolveAnalyticsResponse("сколько звонков я пропустил", invoices, calls);
    expect(res?.widget).toBe("missed-calls-inline");
  });

  it("calculates unpaid share in percent", () => {
    const res = resolveAnalyticsResponse("Какая доля неоплаченных счетов?", invoices, calls);
    expect(res?.text).toContain("66.7%");
  });

  it("calculates dynamics in percent", () => {
    const res = resolveAnalyticsResponse("Дай динамику счетов февраль к марту", invoices, calls);
    expect(res?.text).toContain("Динамика");
    expect(res?.text).toContain("%");
  });

  it("returns top 3 largest invoices", () => {
    const res = resolveAnalyticsResponse("Покажи топ-3 крупных счета", invoices, calls);
    expect(res?.text).toContain("Топ-3");
    expect(res?.text).toContain("1)");
  });

  it("returns invoice count by month", () => {
    const res = resolveAnalyticsResponse("Сколько счетов за февраль?", invoices, calls);
    expect(res?.text).toContain("2");
  });

  it("compares unpaid percent between two months", () => {
    const res = resolveAnalyticsResponse("какой процент счетов я не оплатил в феврале по сравнению с мартом", invoices, calls);
    expect(res?.text).toContain("февраль");
    expect(res?.text).toContain("март");
    expect(res?.text).toContain("%");
  });

  it("returns month with max spend", () => {
    const res = resolveAnalyticsResponse("в каком месяце я больше всего потратил на оплату счетов?", invoices, calls);
    expect(res?.text).toContain("Больше всего потратили");
    expect(res?.text).toContain("март");
  });
});
