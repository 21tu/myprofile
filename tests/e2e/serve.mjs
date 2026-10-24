import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';

const root = resolve('out');
const rules = [];
for (const line of (await readFile(resolve(root, '_headers'), 'utf8')).split(
  /\r?\n/,
)) {
  if (!line.trim() || line.trimStart().startsWith('#')) continue;
  if (!/^\s/.test(line)) rules.push({ path: line.trim(), headers: {} });
  else {
    const colon = line.indexOf(':');
    if (!rules.length || colon < 0) throw new Error('Invalid _headers line');
    rules.at(-1).headers[line.slice(0, colon).trim()] = line
      .slice(colon + 1)
      .trim();
  }
}
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
  '.vcf': 'text/vcard; charset=utf-8',
};
createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(
      new URL(req.url, 'http://localhost').pathname,
    );
    for (const rule of rules) {
      if (rule.path === '/*' || rule.path === path) {
        for (const [name, value] of Object.entries(rule.headers))
          res.setHeader(name, value);
      }
    }
    const target = resolve(root, `.${path}`);
    const safe = target === root || target.startsWith(root + sep);
    const candidates = safe
      ? [target, target + '.html', resolve(target, 'index.html')]
      : [];
    let file;
    for (const candidate of candidates) {
      if (
        await stat(candidate)
          .then((s) => s.isFile())
          .catch(() => false)
      ) {
        file = candidate;
        break;
      }
    }
    res.statusCode = file ? 200 : 404;
    file ??= resolve(root, '404.html');
    res.setHeader(
      'Content-Type',
      types[extname(file)] ?? 'application/octet-stream',
    );
    const body = await readFile(file);
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch {
    res.statusCode = 500;
    res.end('Static server error');
  }
}).listen(4173, '127.0.0.1', () =>
  console.log('Static export: http://127.0.0.1:4173'),
);
