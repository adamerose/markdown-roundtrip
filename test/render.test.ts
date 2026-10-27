import { expect, it } from 'vitest'
import { renderMath } from '../src/render/index.ts'

it('renders math, and never a javascript: link from it', () => {
  expect(renderMath('x^2', false)).toContain('katex')
  expect(renderMath('x^2', true)).toContain('katex-display')
  expect(renderMath('\\href{javascript:alert(1)}{probe}', false)).not.toContain('href="javascript:')
})
