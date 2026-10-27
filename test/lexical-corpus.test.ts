import { describe, expect, it } from 'vitest'
import { createHeadlessEditor } from '@lexical/headless'
import { MARKDOWN_NODES, loadMarkdown, saveMarkdown } from '../src/lexical/index.ts'
import { files, read } from './harness.ts'

describe('through a Lexical editor', () => {
  for (const file of files) {
    it(file, () => {
      const source = read(file)
      const editor = createHeadlessEditor({ nodes: MARKDOWN_NODES, onError: (e) => { throw e } })
      const base = loadMarkdown(editor, source)
      expect(saveMarkdown(editor, base)).toBe(source)
    })
  }
})
