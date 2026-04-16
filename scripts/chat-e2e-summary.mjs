import fs from "node:fs";
import path from "node:path";

const jsonPath = path.join(process.cwd(), "test-results", "e2e-results.json");
const outMd = path.join(process.cwd(), "test-results", "chat-failures-summary.md");

function collectFailures(suite, titlePath = []) {
  const failures = [];
  const nextPath = suite.title ? [...titlePath, suite.title] : titlePath;

  for (const spec of suite.specs || []) {
    for (const test of spec.tests || []) {
      for (const result of test.results || []) {
        if (result.status === "failed" || result.status === "timedOut") {
          const name = [...nextPath, spec.title, test.title].filter(Boolean).join(" › ");
          const msg = result.error?.message || result.error?.stack || String(result.error || "");
          failures.push({ name, msg });
        }
      }
    }
  }

  for (const child of suite.suites || []) {
    failures.push(...collectFailures(child, nextPath));
  }

  return failures;
}

if (!fs.existsSync(jsonPath)) {
  console.log("chat-e2e-summary: no test-results/e2e-results.json (run Playwright first).");
  process.exit(0);
}

const raw = fs.readFileSync(jsonPath, "utf8");
let data;
try {
  data = JSON.parse(raw);
} catch {
  console.error("chat-e2e-summary: invalid JSON in e2e-results.json");
  process.exit(1);
}

const failures = [];
for (const root of data.suites || []) {
  failures.push(...collectFailures(root, []));
}

fs.mkdirSync(path.dirname(outMd), { recursive: true });

const lines = [
  "# Chat E2E - failed scenarios",
  "",
  `Total failed: ${failures.length}`,
  "",
  ...failures.flatMap((f) => [`## ${f.name}`, "", "```", f.msg.slice(0, 8000), "```", ""])
];

fs.writeFileSync(outMd, lines.join("\n"), "utf8");
console.log(`chat-e2e-summary: wrote ${outMd} (${failures.length} failure(s))`);
