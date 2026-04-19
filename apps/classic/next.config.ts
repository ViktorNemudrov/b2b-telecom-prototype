import type { NextConfig } from "next";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

/** Проект может собираться из `apps/classic` или из корня монорепозитория — выравниваем путь к `.env.local`. */
function resolveMonorepoRoot(): string {
  const cwd = process.cwd().replace(/\\/g, "/");
  if (cwd.endsWith("/apps/classic")) return resolve(process.cwd(), "..", "..");
  return process.cwd();
}

function parseDotEnv(contents: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (let line of contents.split(/\r?\n/)) {
    const hash = line.indexOf("#");
    if (hash >= 0) line = line.slice(0, hash);
    line = line.trim();
    if (!line) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

/** Подхватывает `NEXT_PUBLIC_*` из корня монорепозитория, если в `apps/classic/.env*` ключей ещё нет. */
function loadMergedPublicEnv(): Record<string, string> {
  const root = resolveMonorepoRoot();
  const paths = [resolve(root, ".env.local"), resolve(root, ".env")];
  const merged: Record<string, string> = {};
  for (const p of paths) {
    if (!existsSync(p)) continue;
    Object.assign(merged, parseDotEnv(readFileSync(p, "utf8")));
  }
  const nextPublic: Record<string, string> = {};
  for (const [k, v] of Object.entries(merged)) {
    if (!k.startsWith("NEXT_PUBLIC_")) continue;
    if (!v) continue;
    if (process.env[k]) continue;
    nextPublic[k] = v;
  }
  return nextPublic;
}

const mergedPublicEnv = loadMergedPublicEnv();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@b2b/classic-kit"],
  env: mergedPublicEnv,
  // Static export (`out/`) only for Capacitor — иначе `app/api/**` (LLM proxy) не попадёт в артефакт.
  ...(process.env.CAPACITOR_STATIC_EXPORT === "1" ? { output: "export" as const } : {}),
  trailingSlash: true,
  images: { unoptimized: true },
  // Windows: без этого иногда получается неполный `server/app-paths-manifest.json` и падение на
  // «Cannot find module for page» при collect page data (гонка воркеров при записи манифеста).
  ...(process.platform === "win32"
    ? { experimental: { cpus: 1 } }
    : {})
};

export default nextConfig;
