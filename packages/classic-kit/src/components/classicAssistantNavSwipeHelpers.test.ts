import { describe, expect, it } from "vitest";
import {
  CLASSIC_NAV_SWIPE_SEGMENTS,
  classicAssistantNavSwipeIndex,
  normalizeClassicNavPath
} from "./classicAssistantNavSwipeHelpers";

describe("classicAssistantNavSwipe helpers", () => {
  it("normalizes trailing slashes", () => {
    expect(normalizeClassicNavPath("/assistant/")).toBe("/assistant");
    expect(normalizeClassicNavPath("/")).toBe("/");
  });

  it("maps paths to navbar segment index", () => {
    expect(classicAssistantNavSwipeIndex("/events")).toBe(0);
    expect(classicAssistantNavSwipeIndex("/events/")).toBe(0);
    expect(classicAssistantNavSwipeIndex("/assistant")).toBe(1);
    expect(classicAssistantNavSwipeIndex("/widgets")).toBe(2);
    expect(classicAssistantNavSwipeIndex("/widgets/custom")).toBe(2);
    expect(classicAssistantNavSwipeIndex("/settings")).toBeNull();
  });

  it("uses fixed segment order", () => {
    expect(CLASSIC_NAV_SWIPE_SEGMENTS).toEqual(["/events", "/assistant", "/widgets"]);
  });
});
