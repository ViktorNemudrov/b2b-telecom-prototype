import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

type DotEnvMap = Record<string, string>;

function parseDotEnv(contents: string): DotEnvMap {
  const out: DotEnvMap = {};
  for (let line of contents.split(/\r?\n/)) {
    const hash = line.indexOf("#");
    if (hash >= 0) line = line.slice(0, hash);
    line = line.trim();
    if (!line) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (key && val) out[key] = val;
  }
  return out;
}

let cachedEnv: DotEnvMap | null = null;

function loadMonorepoEnv(): DotEnvMap {
  if (cachedEnv) return cachedEnv;

  const root = process.cwd().replace(/\\/g, "/");
  const monorepoRoot = root.endsWith("/apps/classic") ? resolve(process.cwd(), "..", "..") : process.cwd();
  const candidates = [
    resolve(monorepoRoot, ".env.local"),
    resolve(monorepoRoot, ".env"),
    resolve(monorepoRoot, "apps", "classic", ".env.local"),
    resolve(monorepoRoot, "apps", "classic", ".env")
  ];

  const merged: DotEnvMap = {};
  for (const p of candidates) {
    if (!existsSync(p)) continue;
    Object.assign(merged, parseDotEnv(readFileSync(p, "utf8")));
  }

  cachedEnv = merged;
  return merged;
}

export function readEnvWithMonorepoFallback(...keys: string[]): string | null {
  for (const key of keys) {
    const runtimeValue = process.env[key];
    if (runtimeValue?.trim()) return runtimeValue.trim();
  }

  const merged = loadMonorepoEnv();
  for (const key of keys) {
    const fileValue = merged[key];
    if (fileValue?.trim()) return fileValue.trim();
  }
  return null;
}
