import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));

function norm(s: string) {
  return s.replace(/\r\n/g, "\n").trimEnd();
}

describe("shared UI parity (classic-kit vs ai-kit)", () => {
  it("PageBackLink.tsx is identical", () => {
    const classic = norm(readFileSync(join(here, "../components/PageBackLink.tsx"), "utf8"));
    const ai = norm(readFileSync(join(here, "../../../ai-kit/src/components/PageBackLink.tsx"), "utf8"));
    expect(classic).toBe(ai);
  });

  it("smartBack.ts is identical", () => {
    const classic = norm(readFileSync(join(here, "smartBack.ts"), "utf8"));
    const ai = norm(readFileSync(join(here, "../../../ai-kit/src/lib/smartBack.ts"), "utf8"));
    expect(classic).toBe(ai);
  });
});
