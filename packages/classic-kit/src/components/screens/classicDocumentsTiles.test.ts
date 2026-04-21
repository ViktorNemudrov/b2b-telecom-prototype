import { describe, expect, it } from "vitest";
import { CLASSIC_DOCUMENT_TILES } from "./classicDocumentsTiles";

describe("CLASSIC_DOCUMENT_TILES", () => {
  it("keeps expected Classic tile routes", () => {
    expect(CLASSIC_DOCUMENT_TILES.map((t) => t.href)).toEqual([
      "/documents/finance/",
      "/documents/",
      "/documents/",
      "/documents/",
      "/documents/",
      "/support/"
    ]);
  });
});
