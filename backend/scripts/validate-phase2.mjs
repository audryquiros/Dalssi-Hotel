import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = new URL('..', import.meta.url).pathname;
const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (full.endsWith('.js') || full.endsWith('.mjs')) files.push(full);
  }
}
walk(path.join(root, 'src'));
walk(path.join(root, 'migrations'));
for (const file of files) execFileSync(process.execPath, ['--check', file], { stdio: 'ignore' });
console.log(`Validación de sintaxis backend OK: ${files.length} archivos.`);
