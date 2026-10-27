import { createState } from 'lexical'

/** Where a node came from in the file: an mdast node's type and source offsets. */
export interface Span {
  type: string
  start: number
  end: number
}

const isSpan = (v: unknown): v is Span =>
  typeof v === 'object' && v !== null && typeof (v as Span).type === 'string' &&
  typeof (v as Span).start === 'number' && typeof (v as Span).end === 'number'

/** The mdast node a Lexical node was imported from. */
export const spanState = createState('mdSpan', { parse: (v): Span | null => (isSpan(v) ? v : null) })

/**
 * On a text node, the inline mdast nodes between its block (or link) and the
 * text itself, outermost first, ending with the text or inline code it was.
 */
export const chainState = createState('mdChain', {
  parse: (v): Span[] => (Array.isArray(v) ? v.filter(isSpan) : []),
})

/**
 * Properties of the mdast node that Lexical has nowhere to keep (a code fence's
 * meta, a table's column alignment, a list's looseness), as JSON.
 */
export const extraState = createState('mdExtra', {
  parse: (v): Record<string, unknown> => (typeof v === 'object' && v !== null && !Array.isArray(v) ? (v as Record<string, unknown>) : {}),
})

/** On a line break: true when it was a line ending inside a paragraph, not a hard break. */
export const softState = createState('mdSoft', { parse: (v): boolean => v === true })
