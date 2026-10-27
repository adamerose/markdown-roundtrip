// node test/debug-markdown.ts [file-filter] [label-filter]: prints every failing edit with its diff.
import { parse } from '../src/markdown/index.ts'
import { edits, files, read, run } from './harness.ts'

const [fileFilter = '', labelFilter = ''] = process.argv.slice(2)
let failures = 0
let total = 0
for (const file of files.filter((f) => f.includes(fileFilter))) {
  const source = read(file)
  const tree = parse(source)
  for (const edit of edits(tree, source).filter((e) => e.label.includes(labelFilter))) {
    const outcome = run(source, tree, edit)
    if (!outcome) continue
    total++
    if (outcome.readsBack && outcome.local) continue
    failures++
    console.log(`\n### ${file} — ${edit.label}: readsBack=${outcome.readsBack} local=${outcome.local}\n${outcome.diff}`)
  }
}
console.log(`\n${failures} failing of ${total}`)
