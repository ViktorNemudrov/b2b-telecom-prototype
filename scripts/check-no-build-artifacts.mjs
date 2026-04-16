import { execSync } from "node:child_process";

const blockedPathParts = ["/.next/", "/out/", "/dist/", "/coverage/"];

const trackedFilesOutput = execSync("git ls-files", { encoding: "utf8" });
const trackedFiles = trackedFilesOutput
  .split("\n")
  .map((line) => line.trim().replaceAll("\\", "/"))
  .filter(Boolean);
const violations = trackedFiles.filter((filePath) =>
  blockedPathParts.some((part) => filePath.includes(part) || filePath.startsWith(part.slice(1)))
);

if (violations.length > 0) {
  console.error("Tracked build artifacts detected:");
  for (const filePath of violations) {
    console.error(` - ${filePath}`);
  }
  process.exit(1);
}

console.log("No tracked build artifacts detected.");
