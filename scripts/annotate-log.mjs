// Extracts TypeScript and ESLint stylish diagnostics into GitHub Actions annotations.
// Run with: node scripts/annotate-log.mjs <logfile> <label>
import { readFileSync } from 'node:fs';
const [file, title = 'quality'] = process.argv.slice(2);
if (!file) process.exit(0);
const escape = (s) => String(s).replaceAll('%', '%25').replaceAll('\r', '%0D').replaceAll('\n', '%0A');
const prop = (s) => escape(s).replaceAll(':', '%3A').replaceAll(',', '%2C');
let currentFile = '';
for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
  const tsc = line.match(/^(.+?)\((\d+),(\d+)\): error TS\d+: (.+)$/);
  if (tsc) {
    console.log(`::error file=${prop(tsc[1])},line=${tsc[2]},col=${tsc[3]},title=${prop(title)}::${escape(tsc[4])}`);
    continue;
  }
  if (/^[/\w.-]+\.(?:tsx?|jsx?|mjs|cjs)$/.test(line.trim())) currentFile = line.trim();
  const eslint = line.match(/^\s*(\d+):(\d+)\s+(error|warning)\s+(.+)$/);
  if (eslint && currentFile) {
    const severity = eslint[3] === 'error' ? 'error' : 'warning';
    console.log(`::${severity} file=${prop(currentFile)},line=${eslint[1]},col=${eslint[2]},title=${prop(title)}::${escape(eslint[4])}`);
  }
}
