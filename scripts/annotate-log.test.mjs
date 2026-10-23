import test from 'node:test';
import assert from 'node:assert/strict';
import { toAnnotations } from './annotate-log.mjs';

test('parses a tsc line and preserves a relative path', () => {
  assert.deepEqual(toAnnotations('src/app.ts(12,3): error TS2322: Invalid type', 'typecheck', '/repo'), [
    '::error file=src/app.ts,line=12,col=3,title=typecheck::Invalid type',
  ]);
});

test('converts absolute tsc paths to repository-relative paths', () => {
  for (const [file, cwd] of [['/repo/src/app.ts', '/repo'], ['C:\\repo\\src\\app.ts', 'C:\\repo']]) {
    assert.deepEqual(toAnnotations(`${file}(2,4): error TS2322: Invalid type`, 'tsc', cwd), [
      '::error file=src/app.ts,line=2,col=4,title=tsc::Invalid type',
    ]);
  }
});

test('converts POSIX and Windows absolute ESLint headers to relative paths', () => {
  for (const [file, cwd] of [['/repo/src/app.ts', '/repo'], ['C:\\repo\\src\\app.ts', 'C:\\repo']]) {
    assert.deepEqual(toAnnotations(`${file}\n  2:4  error  Unexpected value  rule`, 'lint', cwd), [
      '::error file=src/app.ts,line=2,col=4,title=lint::Unexpected value  rule',
    ]);
  }
});

test('preserves ESLint warning severity and normalises relative backslashes', () => {
  assert.deepEqual(toAnnotations('src\\app.ts\n  5:6  warning  Unused value', 'lint', '/repo'), [
    '::warning file=src/app.ts,line=5,col=6,title=lint::Unused value',
  ]);
});

test('escapes percent signs, colons and commas in annotation properties', () => {
  assert.deepEqual(toAnnotations('src/a%:,.ts(1,2): error TS1234: 50% invalid', 'lint%:,', '/repo'), [
    '::error file=src/a%25%3A%2C.ts,line=1,col=2,title=lint%25%3A%2C::50%25 invalid',
  ]);
});
