// Extracts TypeScript and ESLint stylish diagnostics into GitHub Actions annotations.
// Run with: node scripts/annotate-log.mjs <logfile> <label>
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const escape = (s) => String(s).replaceAll('%', '%25').replaceAll('\r', '%0D').replaceAll('\n', '%0A');
const prop = (s) => escape(s).replaceAll(':', '%3A').replaceAll(',', '%2C');
export function toAnnotations(logText, title, cwd) {
  const relativeFile = (file) => {
    const paths = path.win32.isAbsolute(file) && !file.startsWith('/') ? path.win32 : path.posix;
    return (paths.isAbsolute(file) ? paths.relative(cwd, file) : file).replaceAll('\\', '/');
  };
  const annotations = [];
  let currentFile = '';
  for (const line of logText.split(/\r?\n/)) {
    const tsc = line.match(/^(.+?)\((\d+),(\d+)\): error TS\d+: (.+)$/);
    if (tsc) {
      annotations.push(`::error file=${prop(relativeFile(tsc[1]))},line=${tsc[2]},col=${tsc[3]},title=${prop(title)}::${escape(tsc[4])}`);
      continue;
    }
    if (/^[\w/\\: .,%()-]+\.(?:tsx?|jsx?|mjs|cjs)$/.test(line.trim())) currentFile = line.trim();
    const eslint = line.match(/^\s*(\d+):(\d+)\s+(error|warning)\s+(.+)$/);
    if (eslint && currentFile) {
      const severity = eslint[3] === 'error' ? 'error' : 'warning';
      annotations.push(`::${severity} file=${prop(relativeFile(currentFile))},line=${eslint[1]},col=${eslint[2]},title=${prop(title)}::${escape(eslint[4])}`);
    }
  }
  return annotations;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [file, title = 'quality'] = process.argv.slice(2);
  if (file) {
    for (const annotation of toAnnotations(readFileSync(file, 'utf8'), title, process.cwd())) {
      console.log(annotation);
    }
  }
}
