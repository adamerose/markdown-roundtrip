import { describe, expect, it } from 'vitest'
import { parse } from '../src/markdown/index.ts'
import { edits, files, read, run } from './harness.ts'

for (const file of files) {
  describe(file, () => {
    const source = read(file)
    const tree = parse(source)
    for (const edit of edits(tree, source)) {
      it(edit.label, () => {
        const outcome = run(source, tree, edit)
        if (!outcome) return
        expect(outcome.readsBack, `reads back as the edit\n${outcome.diff}`).toBe(true)
        expect(outcome.local, `changes nothing outside the edit\n${outcome.diff}`).toBe(true)
      })
    }
  })
}
