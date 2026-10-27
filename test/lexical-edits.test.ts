import { describe, expect, it } from 'vitest'
import { loadMarkdown } from '../src/lexical/index.ts'
import { files, read } from './harness.ts'
import { lexicalEdits, newEditor, runLexical } from './lexical-harness.ts'

for (const file of files) {
  describe(`${file} through Lexical`, () => {
    const source = read(file)
    const editor = newEditor()
    loadMarkdown(editor, source)
    for (const edit of lexicalEdits(editor)) {
      it(edit.label, () => {
        const outcome = runLexical(source, edit.label)
        if (!outcome) return
        expect(outcome.readsBack, `reads back as the editor's content\n${outcome.diff}`).toBe(true)
        expect(outcome.local, `changes only the edited blocks\n${outcome.diff}`).toBe(true)
      })
    }
  })
}
