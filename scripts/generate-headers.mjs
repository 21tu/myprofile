import { readdir, readFile, writeFile } from 'node:fs/promises';
import { buildHeaders, extractStyleAttributes } from './lib/csp.mjs';

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
  const styles = extractStyleAttributes(html);
  console.info(
    `${file}: ${styles.length} inline style attributes, ${new Set(styles).size} unique values allowed by style-src-attr hashes`,
  );
}
if (!pages.length) throw new Error('No exported HTML found in out/');
await writeFile(
  new URL('_headers', root),
  buildHeaders(pages, { robotsNoindex: process.env.DEPLOY_ENV === 'staging' }),
  'utf8',
);
console.log(`Generated out/_headers for ${pages.length} HTML pages`);
