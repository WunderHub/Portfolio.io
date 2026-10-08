import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { resolve } from "node:path";
import { lintHyperframeHtml } from "@hyperframes/core/lint";
const html = await readFile("index.html", "utf8");
for (const match of html.matchAll(/(?:src|href)="(\.\/[^"#]+)"/g))
  await access(match[1]);
assert.equal((html.match(/<h1\b/g) || []).length, 1);
assert(html.includes("https://wa.me/5511959300903"));
const metadata = JSON.parse(await readFile(".build-meta.json", "utf8"));
const initial = metadata.outputs["assets/dist/main.js"];
assert(
  initial.bytes < 100_000,
  "Initial application JS exceeded 100kB before compression",
);
assert(
  !Object.keys(initial.inputs).some(
    (path) =>
      path.includes("node_modules/remotion/") ||
      path.includes("@hyperframes/player/"),
  ),
  "Player included in initial JavaScript",
);
const composition = await readFile("frame.html", "utf8");
const result = await lintHyperframeHtml(composition, {
  filePath: resolve("frame.html"),
});
for (const finding of result.findings.filter((f) => f.severity !== "info"))
  console.log(finding.severity, finding.code, finding.message);
assert.equal(result.errorCount, 0, "HyperFrames composition has lint errors");
for (const match of composition.matchAll(/(?:src|href)=["'](\.[^"']+)["']/g))
  await access(resolve(match[1]));
console.log(
  `PASS public assets, initial bundle (${Math.round(initial.bytes / 1024)}kB), lazy players, HyperFrames lint (${result.errorCount} errors, ${result.warningCount} warnings).`,
);
