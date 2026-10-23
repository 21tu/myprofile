import { readdir, readFile, writeFile } from 'node:fs/promises';
import { buildHeaders } from './lib/csp.mjs';

const root = new URL('../out/', import.meta.url);
async function walk(directory, prefix = '') {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = prefix + entry.name;
    if (entry.isDirectory())
      files.push(
        ...(await walk(new URL(entry.name + '/', directory), file + '/')),
      );
    else if (entry.isFile() && entry.name !== '_headers') files.push(file);
  }
  return files.sort();
}
const files = await walk(root);
const pages = [];
for (const file of files.filter((file) => file.endsWith('.html'))) {
  const html = await readFile(new URL(file, root), 'utf8');
  pages.push({ file, html });
  const styles =
    html.match(/\sstyle\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi) ?? [];
  if (styles.length)
    console.warn(
      `${file}: ${styles.length} inline style attributes blocked by style-src 'self': ${styles.join(', ')}`,
    );
}
if (!pages.length) throw new Error('No exported HTML found in out/');
await writeFile(
  new URL('_headers', root),
  buildHeaders(
    pages,
    files.filter((file) => !file.endsWith('.html')),
  ),
  'utf8',
);
console.log(`Generated out/_headers for ${pages.length} HTML pages`);
