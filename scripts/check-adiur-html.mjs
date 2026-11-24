import { readdir, readFile, mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve("ADIUR");
const temp = await mkdtemp(join(tmpdir(), "adiur-syntax-"));
let checked = 0;
let failures = 0;

async function walkFiles(dir, extension) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walkFiles(path, extension));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith(extension)) files.push(path);
  }
  return files;
}

async function checkCode(file, code, isModule, label) {
  const tempFile = join(temp, `script-${checked + 1}-${isModule ? "module.mjs" : "classic.cjs"}`);
  await writeFile(tempFile, code, "utf8");
  const result = spawnSync(process.execPath, ["--check", tempFile], { encoding: "utf8" });
  checked++;
  if (result.status !== 0) {
    failures++;
    console.error(`\nERROR: ${file} · ${label}`);
    console.error(result.stderr || result.stdout || "node --check failed");
  }
}

try {
  for (const file of await walkFiles(root, ".html")) {
    const html = await readFile(file, "utf8");
    const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)];
    let index = 0;
    for (const match of scripts) {
      const code = match[2].trim();
      if (!code) continue;
      index++;
      const isModule = /\btype\s*=\s*["']module["']/i.test(match[1]);
      await checkCode(file, code, isModule, `script inline #${index}`);
    }
  }

  for (const file of await walkFiles(root, ".js")) {
    const code = await readFile(file, "utf8");
    const isModule = /^\s*(?:import|export)\s/m.test(code);
    await checkCode(file, code, isModule, "archivo JavaScript externo");
  }
} finally {
  await rm(temp, { recursive: true, force: true });
}

console.log(`ADIUR JavaScript checked: ${checked}; errors: ${failures}`);
if (failures) process.exitCode = 1;
