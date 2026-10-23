import { describe, expect, it } from 'vitest';
import {
  buildHeaders,
  extractInlineScripts,
  hashScript,
  htmlPaths,
} from '../../scripts/lib/csp.mjs';

describe('SEC-002 / SEC-003 CSP generation', () => {
  it('preserves exact text, multiple scripts, attributes and empty scripts', () => {
    expect(
      extractInlineScripts(
        `<script id="a" type="application/json">\n {"a":1} </script><script></script><SCRIPT data-label=">" defer> hello </SCRIPT>`,
      ),
    ).toEqual(['\n {"a":1} ', '', ' hello ']);
  });
  it('excludes src with any spacing, casing, quoting or empty/boolean value', () => {
    expect(
      extractInlineScripts(
        `<script src="x">a</script><script SRC = 'x'>b</script><script src=x>c</script><script src="">d</script><script src>e</script>`,
      ),
    ).toEqual([]);
  });
  it('does not confuse data-src, attribute values or comments with src', () => {
    expect(
      extractInlineScripts(
        `<!-- <script>ignored</script> --><script data-src="x" title="src='x' >">yes</script>`,
      ),
    ).toEqual(['yes']);
  });
  it('uses SHA-256 base64 without trimming or HTML decoding', () => {
    expect(hashScript('')).toBe(
      "'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='",
    );
    expect(hashScript('a')).not.toBe(hashScript(' a'));
    expect(hashScript('&amp;')).not.toBe(hashScript('&'));
  });
  it('covers root, extensionless, nested and directory index aliases', () => {
    expect(htmlPaths('index.html')).toEqual(['/', '/index.html']);
    expect(htmlPaths('404.html')).toEqual(['/404', '/404.html']);
    expect(htmlPaths('a/b.html')).toEqual(['/a/b', '/a/b.html']);
    expect(htmlPaths('x/index.html')).toEqual([
      '/x',
      '/x/',
      '/x/index',
      '/x/index.html',
    ]);
  });
  it('deduplicates page hashes and keeps page and asset CSP disjoint', () => {
    const headers = buildHeaders(
      [
        { file: 'index.html', html: '<script>a</script><script>a</script>' },
        { file: '404.html', html: '<script>b</script>' },
      ],
      ['_next/a.js', 'favicon.ico'],
    );
    expect(headers.split('\n\n')[0]).not.toContain('Content-Security-Policy');
    expect(headers).toContain(
      `script-src 'self' ${hashScript('a')}; style-src 'self'`,
    );
    expect(headers).toContain(
      `script-src 'self' ${hashScript('b')}; style-src 'self'`,
    );
    expect(headers).toContain(
      "/_next/*\n  Content-Security-Policy: default-src 'none'; frame-ancestors 'none'",
    );
    expect(headers).toContain('/favicon.ico\n');
    expect(headers).not.toMatch(/unsafe-inline|unsafe-eval/);
    for (const block of headers.split('\n\n').slice(1))
      expect(block.match(/Content-Security-Policy:/g)).toHaveLength(1);
  });
  it('fails rather than emitting rules Cloudflare would discard', () => {
    expect(() =>
      buildHeaders(
        Array.from({ length: 50 }, (_, i) => ({ file: `${i}.html`, html: '' })),
      ),
    ).toThrow('100 rules');
    expect(() =>
      buildHeaders([
        {
          file: 'index.html',
          html: Array.from(
            { length: 40 },
            (_, i) => `<script>${i}</script>`,
          ).join(''),
        },
      ]),
    ).toThrow('2000 characters');
    expect(() =>
      buildHeaders([
        { file: 'x.html', html: '' },
        { file: 'x/index.html', html: '' },
      ]),
    ).toThrow('Conflicting HTML path');
  });
});
