import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const swPaths = [
  "apps/ai-first/public/sw.js",
  "apps/classic/public/sw.js",
  "public/sw.js"
];

describe("PWA installability service workers", () => {
  it.each(swPaths)("contains fetch listener in %s", (swPath) => {
    const absolutePath = path.resolve(process.cwd(), swPath);
    const source = fs.readFileSync(absolutePath, "utf-8");

    expect(source).toContain('self.addEventListener("fetch"');
  });
});
