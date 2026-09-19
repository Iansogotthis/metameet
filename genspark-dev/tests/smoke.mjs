import fs from "node:fs";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../styles.css", import.meta.url), "utf8");
const js = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");

const checks = [
  ["spark visualization", html.includes('id="spark"')],
  ["task form", html.includes('id="taskForm"')],
  ["trace panel", html.includes('id="traceTarget"') && html.includes('id="tracePlus"')],
  ["host bridge requests", js.includes("genspark:tool-request")],
  ["host bridge results", js.includes("genspark:tool-result")],
  ["persistent project memory", js.includes("localStorage") && js.includes("projectMap")],
  ["developer state machine", ["scan","build","debug","test","audit","ship"].every((mode) => js.includes(mode + ":"))],
  ["responsive styling", css.includes("@media")],
  ["credential-free bridge language", html.includes("instead of storing GitHub or shell credentials")]
];

let failures = 0;
for (const [name, pass] of checks) {
  console.log((pass ? "PASS" : "FAIL") + " " + name);
  if (!pass) failures += 1;
}
if (failures) {
  console.error("\n" + failures + " smoke check(s) failed.");
  process.exit(1);
}
console.log("\nAll " + checks.length + " smoke checks passed.");
