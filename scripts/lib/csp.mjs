import { createHash } from 'node:crypto';
import { JSDOM } from 'jsdom';

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

/** Parse without executing scripts; attribute values are HTML-decoded. */
export function extractStyleAttributes(html) {
  const document = new JSDOM(html).window.document;
  return [...document.querySelectorAll('[style]')].map((element) =>
    element.getAttribute('style'),
  );
}

/** @param {{file: string, html: string}[]} pages */
export function buildHeaders(pages) {
  const scriptHashes = [
    ...new Set(
      pages.flatMap(({ html }) => extractInlineScripts(html).map(hashScript)),
    ),
  ].sort();
  const styleHashes = [
    ...new Set(
      pages.flatMap(({ html }) => extractStyleAttributes(html).map(hashScript)),
    ),
  ].sort();
  const csp = [
    "default-src 'none'",
    ["script-src 'self'", ...scriptHashes].join(' '),
    "style-src 'self'",
    ["style-src-attr 'unsafe-hashes'", ...styleHashes].join(' '),
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
  const blocks = [
    `/*
  Strict-Transport-Security: max-age=31536000
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()
  Cross-Origin-Opener-Policy: same-origin
  X-Frame-Options: DENY
  Content-Security-Policy: ${csp}`,
  ];
  if (blocks.length > 100)
    throw new Error('Cloudflare _headers exceeds 100 rules');
  const result = blocks.join('\n\n') + '\n';
  if (result.split('\n').some((line) => line.length > 2000)) {
    throw new Error('Cloudflare _headers exceeds 2000 characters per line');
  }
  return result;
}
