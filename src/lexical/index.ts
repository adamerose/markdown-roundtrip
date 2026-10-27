import type { Root } from 'mdast'
import type { Klass, LexicalEditor, LexicalNode, LexicalNodeReplacement } from 'lexical'
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

export { $exportMdast, $importMdast } from './mdast.ts'
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

/** What a tree becomes after a trip through the editor: print()'s `view` for a Lexical app. */
export function viewThroughLexical(tree: Root): Root {
  viewer ??= createHeadlessEditor({ nodes: MARKDOWN_NODES, onError: (e) => { throw e } })
  viewer.update(() => $importMdast(tree), { discrete: true })
  return viewer.read(() => $exportMdast())
}

/** Loads Markdown into the editor. Keep the returned base to save against. */
export function loadMarkdown(editor: LexicalEditor, source: string, options: { tag?: string } = {}): Base {
  const tree = parse(source)
  editor.update(() => $importMdast(tree), { discrete: true, tag: options.tag })
  return { source, tree }
}

/** The editor's content as Markdown, keeping every byte of `base` the user did not change. */
export function saveMarkdown(editor: LexicalEditor, base: Base): string {
  const current = editor.read(() => $exportMdast())
  return print(current, base, { view: viewThroughLexical })
}
