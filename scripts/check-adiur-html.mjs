import { readdir, readFile, mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve("ADIUR");
const temp = await mkdtemp(join(tmpdir(), "adiur-syntax-"));
let checked = 0;
let failures = 0;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith(".html")) files.push(path);
  }
  return files;
}

try {
  for (const file of await walk(root)) {
    const html = await readFile(file, "utf8");
    const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)];
    let index = 0;
    for (const match of scripts) {
      const code = match[2].trim();
      if (!code) continue;
      index++;
      const isModule = /\btype\s*=\s*["']module["']/i.test(match[1]);
      const tempFile = join(temp, `script-${checked + 1}-${isModule ? "module.mjs" : "classic.cjs"}`);
      await writeFile(tempFile, code, "utf8");
      const result = spawnSync(process.execPath, ["--check", tempFile], { encoding: "utf8" });
      checked++;
      if (result.status !== 0) {
        failures++;
        console.error(`\nERROR: ${file} · script inline #${index}`);
        console.error(result.stderr || result.stdout || "node --check failed");
      }
    }
  }
} finally {
  await rm(temp, { recursive: true, force: true });
}

console.log(`ADIUR inline scripts checked: ${checked}; errors: ${failures}`);
if (failures) process.exitCode = 1;
