import { createHash } from 'node:crypto';

/** Extract exact raw text; tokenize attributes so data-src and quoted > are safe. */
export function extractInlineScripts(html) {
  const scripts = [];
  const tags =
    /<!--[^]*?-->|<script\b((?:[^>"']|"[^"]*"|'[^']*')*)>([\s\S]*?)<\/script\s*>/gi;
  for (const match of html.matchAll(tags)) {
    if (match[1] === undefined) continue;
    const attributes = match[1].matchAll(
      /([^\s=/>]+)(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?/g,
    );
    if (
      ![...attributes].some((attribute) => attribute[1].toLowerCase() === 'src')
    ) {
      scripts.push(match[2]);
    }
  }
  return scripts;
}

export function hashScript(text) {
  return `'sha256-${createHash('sha256').update(text, 'utf8').digest('base64')}'`;
}

export function htmlPaths(file) {
  if (file === 'index.html') return ['/', '/index.html'];
  const stem = '/' + file.slice(0, -5);
  if (stem.endsWith('/index')) {
    return [stem.slice(0, -6), stem.slice(0, -5), stem, '/' + file];
  }
  return [stem, '/' + file];
}

/** @param {{file: string, html: string}[]} pages @param {string[]} assets */
export function buildHeaders(pages, assets = []) {
  const blocks = [
    `/*
  Strict-Transport-Security: max-age=31536000
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()
  Cross-Origin-Opener-Policy: same-origin
  X-Frame-Options: DENY`,
  ];
  const paths = new Set();
  for (const { file, html } of [...pages].sort((a, b) =>
    a.file.localeCompare(b.file),
  )) {
    const hashes = [...new Set(extractInlineScripts(html).map(hashScript))];
    const csp = [
      "default-src 'none'",
      ["script-src 'self'", ...hashes].join(' '),
      "style-src 'self'",
      "img-src 'self' data:",
      "font-src 'self'",
      "connect-src 'self'",
      "manifest-src 'self'",
      "base-uri 'none'",
      "form-action 'none'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      'upgrade-insecure-requests',
    ].join('; ');
    for (const path of htmlPaths(file)) {
      if (paths.has(path)) throw new Error(`Conflicting HTML path: ${path}`);
      paths.add(path);
      blocks.push(`${path}\n  Content-Security-Policy: ${csp}`);
    }
  }
  const assetPaths = new Set([
    '/_next/*',
    ...assets
      .filter((file) => !file.startsWith('_next/'))
      .map((file) => '/' + file),
  ]);
  for (const path of [...assetPaths].sort()) {
    if (paths.has(path)) throw new Error(`Conflicting asset path: ${path}`);
    blocks.push(
      `${path}\n  Content-Security-Policy: default-src 'none'; frame-ancestors 'none'`,
    );
  }
  if (blocks.length > 100)
    throw new Error('Cloudflare _headers exceeds 100 rules');
  const result = blocks.join('\n\n') + '\n';
  if (result.split('\n').some((line) => line.length > 2000)) {
    throw new Error('Cloudflare _headers exceeds 2000 characters per line');
  }
  return result;
}
