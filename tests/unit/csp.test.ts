import { describe, expect, it } from 'vitest';
import {
  buildHeaders,
  extractInlineScripts,
  hashScript,
  extractStyleAttributes,
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
  it('extracts double, single, unquoted, empty and uppercase style attributes', () => {
    expect(
      extractStyleAttributes(
        `<div style="--i:0"></div><p STYLE='opacity:1'></p><b style=transform:none></b><i style=""></i>`,
      ),
    ).toEqual(['--i:0', 'opacity:1', 'transform:none', '']);
  });
  it('decodes named and numeric entities exactly once', () => {
    expect(
      extractStyleAttributes(
        `<div style="content:&quot;&#x27;&amp;&lt;&gt;&#65;&#x42;&amp;quot;"></div>`,
      ),
    ).toEqual([`content:"'&<>AB&quot;`]);
  });
  it('ignores data-style, comments, script text and other attribute values', () => {
    expect(
      extractStyleAttributes(
        `<!-- <div style="bad"> --><script>const x = '<p style="bad">';</script><div data-style="bad" title="style='bad' >" style="color:red"></div>`,
      ),
    ).toEqual(['color:red']);
  });
  it('emits one global CSP with deterministic deduplicated unions', () => {
    const pages = [
      {
        file: 'index.html',
        html: '<script>a</script><script>a</script><div style="--i:0"></div>',
      },
      {
        file: '404.html',
        html: '<script>b</script><p style="opacity:1"></p><p style="--i:0"></p>',
      },
    ];
    const headers = buildHeaders(pages);
    expect(headers.match(/Content-Security-Policy:/g)).toHaveLength(1);
    expect(
      headers.split('\n').filter((line) => line && !line.startsWith(' ')),
    ).toEqual(['/*']);
    expect(headers).toContain(
      `script-src 'self' ${[hashScript('a'), hashScript('b')].sort().join(' ')}; style-src 'self';`,
    );
    expect(headers).toContain(
      `style-src-attr 'unsafe-hashes' ${[hashScript('--i:0'), hashScript('opacity:1')].sort().join(' ')};`,
    );
    expect(headers).toBe(buildHeaders([...pages].reverse()));
    expect(headers).not.toMatch(/unsafe-inline|unsafe-eval/);
  });
  it('hashes decoded styles rather than their HTML spelling', () => {
    const headers = buildHeaders([
      { file: 'index.html', html: '<div style="content:&quot;x&quot;"></div>' },
    ]);
    expect(headers).toContain(hashScript('content:"x"'));
    expect(headers).not.toContain(hashScript('content:&quot;x&quot;'));
  });
  it('uses one rule even for more than 100 pages', () => {
    expect(
      buildHeaders(
        Array.from({ length: 101 }, (_, i) => ({
          file: `${i}.html`,
          html: '',
        })),
      ),
    ).toMatch(/^\/\*\n/);
  });
  it.each(['script', 'style'])(
    'fails if %s hashes exceed the line limit',
    (kind) => {
      expect(() =>
        buildHeaders([
          {
            file: 'index.html',
            html: Array.from({ length: 40 }, (_, i) =>
              kind === 'script'
                ? `<script>${i}</script>`
                : `<div style="--i:${i}"></div>`,
            ).join(''),
          },
        ]),
      ).toThrow('2000 characters');
    },
  );
});
