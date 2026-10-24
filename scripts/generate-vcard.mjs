import { readFile, writeFile, rm } from 'node:fs/promises';
import ts from 'typescript';
// Both modules only import types. Transpile in memory to share the pure generator.
async function loadTypeScript(path) {
  const source = await readFile(new URL(path, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  });
  return import(
    'data:text/javascript;base64,' + Buffer.from(outputText).toString('base64')
  );
}
const { content } = await loadTypeScript('../src/config/content.ts');
const { buildVCard } = await loadTypeScript('../src/lib/vcard.ts');
const destination = new URL('../public/contact.vcf', import.meta.url);
const card = buildVCard(content.contact, content.profile);
if (card === null) await rm(destination, { force: true });
else await writeFile(destination, card, 'utf8');
