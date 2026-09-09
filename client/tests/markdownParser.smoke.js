/**
 * Smoke tests for safe Markdown rendering architecture and components.
 * Run: node client/tests/markdownParser.smoke.js
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rendererPath = join(__dirname, "../src/features/feed/components/MarkdownRenderer.jsx");
const source = readFileSync(rendererPath, "utf8");

const checks = [
  { name: "uses ReactMarkdown AST engine", pass: source.includes("ReactMarkdown") },
  { name: "includes GitHub-flavored markdown plugin (remarkGfm)", pass: source.includes("remarkGfm") },
  { name: "uses rehypeSanitize for XSS prevention", pass: source.includes("rehypeSanitize") },
  { name: "supports @[Tech] badge renderer with tech icons", pass: source.includes("renderWithTechBadges") && source.includes("getTechIconClass") },
  { name: "handles temporary upload placeholder replacement", pass: source.includes("__UPLOAD_") },
  { name: "customizes code block syntax rendering safely", pass: source.includes("code:") && source.includes("inline") },
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

console.log("All markdown renderer smoke checks passed.");
