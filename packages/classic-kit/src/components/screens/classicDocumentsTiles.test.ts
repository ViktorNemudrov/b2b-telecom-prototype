import { describe, expect, it } from "vitest";
import { CLASSIC_DOCUMENT_TILES } from "./classicDocumentsTiles";

describe("CLASSIC_DOCUMENT_TILES", () => {
  it("links tiles to real Classic routes (no stubs)", () => {
    expect(CLASSIC_DOCUMENT_TILES.map((t) => t.href)).toEqual([
      "/documents/finance/",
      "/settings/subscription/",
      "/home/",
      "/events/",
      "/settings/customization/",
      "/support/"
    ]);
  });
});
