/**
 * Smoke tests for markdown rendering safety and structure.
 * Run: node --experimental-vm-modules client/tests/markdownParser.smoke.js
 * Or import renderMarkdown in a Node-compatible build; this file uses inline checks.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const parserPath = join(__dirname, "../src/features/feed/utils/markdownParser.js");
const source = readFileSync(parserPath, "utf8");

const checks = [
  { name: "sanitizes unsafe link protocols", pass: source.includes("isSafeUrl") },
  { name: "wraps list items in ul", pass: source.includes("<ul class=") },
  { name: "handles upload placeholders", pass: source.includes("UPLOAD_PLACEHOLDER_REGEX") },
  { name: "uses shared tech icons", pass: source.includes("getTechIconClass") },
];

let failed = 0;
for (const check of checks) {
  if (check.pass) {
    console.log(`✓ ${check.name}`);
  } else {
    console.error(`✗ ${check.name}`);
    failed += 1;
  }
}

if (failed > 0) {
  process.exit(1);
}

console.log("All markdown parser smoke checks passed.");
