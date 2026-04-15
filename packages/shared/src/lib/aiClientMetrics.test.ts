import { describe, expect, it } from "vitest";
import { clearAiMetrics, emitAiMetric, getAiMetricSnapshot, setAiMetricSink } from "./aiClientMetrics";

describe("aiClientMetrics", () => {
  it("buffers events and invokes sink", () => {
    clearAiMetrics();
    const seen: string[] = [];
    setAiMetricSink((e) => {
      if (e.type === "live_fetch_start") seen.push("start");
    });
    emitAiMetric({ type: "live_fetch_start", at: 1 });
    expect(seen).toEqual(["start"]);
    expect(getAiMetricSnapshot().some((x) => x.type === "live_fetch_start")).toBe(true);
    setAiMetricSink(null);
    clearAiMetrics();
  });

  it("accepts user_cancel on live_aborted", () => {
    clearAiMetrics();
    emitAiMetric({ type: "live_aborted", reason: "user_cancel" });
    expect(getAiMetricSnapshot().at(-1)).toEqual({ type: "live_aborted", reason: "user_cancel" });
    clearAiMetrics();
  });
});
