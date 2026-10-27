import type { Root } from 'mdast'
import { $getRoot, $getSelection, type Klass, type LexicalEditor, type LexicalNode, type LexicalNodeReplacement } from 'lexical'
import { createHeadlessEditor } from '@lexical/headless'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { ListItemNode, ListNode } from '@lexical/list'
import { CodeHighlightNode, CodeNode } from '@lexical/code'
import { AutoLinkNode, LinkNode } from '@lexical/link'
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table'
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode'
import { parse } from '../markdown/parse.ts'
import { print, type Base } from '../markdown/print.ts'
import { $exportMdast, $importMdast } from './mdast.ts'
import { FrontmatterNode, ImageNode, InlineMathNode, MARKDOWN_LIST_REPLACEMENT, MarkdownListNode, MathNode, MermaidNode, RawNode } from './nodes.ts'

export { $exportMdast, $importMdast, $isHtmlTable, $setHtmlTable } from './mdast.ts'
export * from './nodes.ts'
export { chainState, extraState, softState, spanState, type Span } from './state.ts'
export { renderers, setRenderers, type Renderers } from './renderers.ts'

/** Every node the mapping creates; register them all. */
export const MARKDOWN_NODES: Array<Klass<LexicalNode> | LexicalNodeReplacement> = [
  HeadingNode, QuoteNode, ListNode, ListItemNode, CodeNode, CodeHighlightNode, LinkNode, AutoLinkNode,
  TableNode, TableRowNode, TableCellNode, HorizontalRuleNode,
  ImageNode, InlineMathNode, MathNode, MermaidNode, FrontmatterNode, RawNode, MarkdownListNode, MARKDOWN_LIST_REPLACEMENT,
]

let viewer: LexicalEditor | undefined
// A base's view is asked for on every save; the base tree does not change.
const views = new WeakMap<Root, Root>()

/** What a tree becomes after a trip through the editor: print()'s `view` for a Lexical app. */
export function viewThroughLexical(tree: Root): Root {
  const cached = views.get(tree)
  if (cached) return cached
  viewer ??= createHeadlessEditor({ nodes: MARKDOWN_NODES, onError: (e) => { throw e } })
  viewer.update(() => $importMdast(tree), { discrete: true })
  const view = viewer.read(() => $exportMdast())
  views.set(tree, view)
  return view
}

/**
 * Loads Markdown into the editor. Keep the returned base to save against.
 * The load commits like any other update (not inside the caller's React
 * render or effect); `onUpdate` runs once it has. A selection moves to the
 * start, as in Lexical's own Markdown import.
 */
export function loadMarkdown(editor: LexicalEditor, source: string, options: { tag?: string; onUpdate?: () => void } = {}): Base {
  const tree = parse(source)
  editor.update(() => {
    $importMdast(tree)
    // The old content is gone, and a selection left on it lands on the root.
    if ($getSelection() !== null) $getRoot().selectStart()
  }, { tag: options.tag, onUpdate: options.onUpdate })
  return { source, tree }
}

/** The editor's content as Markdown, keeping every byte of `base` the user did not change. */
export function saveMarkdown(editor: LexicalEditor, base: Base): string {
  const current = editor.read(() => $exportMdast())
  return print(current, base, { view: viewThroughLexical })
}
