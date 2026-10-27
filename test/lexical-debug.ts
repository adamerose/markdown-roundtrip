// node test/lexical-debug.ts [file-filter] [label-filter]: prints every failing Lexical edit with its diff.
import { files, read } from './harness.ts'
import { lexicalEdits, newEditor, runLexical } from './lexical-harness.ts'
import { loadMarkdown } from '../src/lexical/index.ts'

const [fileFilter = '', labelFilter = ''] = process.argv.slice(2)
let failures = 0
let total = 0
const kinds = new Map<string, number>()
for (const file of files.filter((f) => f.includes(fileFilter))) {
  const source = read(file)
  const editor = newEditor()
  loadMarkdown(editor, source)
  for (const edit of lexicalEdits(editor).filter((e) => e.label.includes(labelFilter))) {
    let outcome
    try { outcome = runLexical(source, edit.label) } catch (e) { console.log(`\n### ${file} — ${edit.label}: threw ${(e as Error).message}`); failures++; total++; continue }
    if (!outcome) continue
    total++
    if (outcome.readsBack && outcome.local) continue
    failures++
    const kind = edit.label.replace(/ \d+.*$/, '')
    kinds.set(kind, (kinds.get(kind) ?? 0) + 1)
    console.log(`\n### ${file} — ${edit.label}: readsBack=${outcome.readsBack} local=${outcome.local}\n${outcome.diff}`)
  }
}
console.log(`\n${[...kinds].map(([k, n]) => `${n} ${k}`).join(', ')}\n${failures} failing of ${total}`)
