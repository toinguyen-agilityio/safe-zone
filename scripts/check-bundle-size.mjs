// Fails when the built JavaScript is over 1 MB gzip. Run it after `npm run build`.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const LIMIT_BYTES = 1024 * 1024;
const dist = process.argv[2] ?? 'dist';

/** Every .js file under a folder, however deep. */
function scripts(dir) {
  const found = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) found.push(...scripts(path));
    else if (name.endsWith('.js')) found.push(path);
  }
  return found;
}

let files;
try {
  files = scripts(dist);
} catch {
  console.error(`No build found in ${dist}. Run "npm run build" first.`);
  process.exit(2);
}
if (files.length === 0) {
  console.error(`No JavaScript found in ${dist}.`);
  process.exit(2);
}

let total = 0;
for (const file of files) {
  const gzipped = gzipSync(readFileSync(file)).length;
  total += gzipped;
  console.log(`${file}: ${(gzipped / 1024).toFixed(1)} KB gzip`);
}
console.log(
  `JavaScript total: ${(total / 1024).toFixed(1)} KB gzip (limit ${LIMIT_BYTES / 1024} KB)`,
);

if (total > LIMIT_BYTES) {
  console.error('The bundle is over the limit.');
  process.exit(1);
}
