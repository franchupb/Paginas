import { readdirSync, readFileSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const folder = join(root, "TORITO");
const temp = mkdtempSync(join(tmpdir(), "torito-syntax-"));
const failures = [];
let checked = 0;

function check(source, module, label) {
  const file = join(temp, `check-${checked}.${module ? "mjs" : "js"}`);
  writeFileSync(file, source, "utf8");
  const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  checked += 1;
  if (result.status !== 0) {
    failures.push({ label, output: (result.stderr || result.stdout || "node --check failed").trim() });
  }
}

try {
  for (const name of readdirSync(folder).filter(name => /\.html$/i.test(name)).sort()) {
    const html = readFileSync(join(folder, name), "utf8");
    const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
    scripts.forEach((match, index) => {
      const attributes = match[1] || "";
      const source = match[2] || "";
      if (!source.trim() || /\bsrc\s*=/.test(attributes)) return;
      check(source, /\btype\s*=\s*["']module["']/i.test(attributes), `${name} inline script ${index + 1}`);
    });
  }

  check(readFileSync(join(folder, "TORITO-auth.js"), "utf8"), true, "TORITO-auth.js");
  check(readFileSync(join(folder, "TORITO-layout.js"), "utf8"), true, "TORITO-layout.js");
  check(readFileSync(join(folder, "TORITO-permisos.js"), "utf8"), false, "TORITO-permisos.js");
} finally {
  rmSync(temp, { recursive: true, force: true });
}

if (failures.length) {
  failures.forEach(failure => {
    console.error(`\n[ERROR] ${failure.label}\n${failure.output}`);
  });
  console.error(`\nTORITO syntax validation failed: ${failures.length} error(s), ${checked} script(s) checked.`);
  process.exitCode = 1;
} else {
  console.log(`TORITO syntax validation passed: ${checked} script(s) checked.`);
}
