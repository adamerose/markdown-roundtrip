import { readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { parse, print } from '../src/markdown/index.ts'

const root = new URL('../fixtures/corpus/', import.meta.url)
const files = readdirSync(root, { recursive: true })
  .map((file) => String(file).split('\\').join('/'))
  .filter((file) => file.endsWith('.md') && !file.startsWith('broken/'))
  .sort()

describe('unchanged files keep every byte', () => {
  for (const file of files) {
    it(file, () => {
      const source = readFileSync(new URL(file, root), 'utf8')
      const tree = parse(source)
      expect(print(structuredClone(tree), { source, tree })).toBe(source)
    })
  }
})
