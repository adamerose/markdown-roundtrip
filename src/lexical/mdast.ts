import type {
  Blockquote, Code, Definition, Heading, Html, Image, ImageReference, Link, LinkReference, List, ListItem, Nodes, Paragraph,
  PhrasingContent, Root, RootContent, Table, TableCell, TableRow,
} from 'mdast'
import {
  $createLineBreakNode, $createParagraphNode, $createTextNode, $getRoot, $getState, $isDecoratorNode, $isElementNode,
  $isLineBreakNode, $isParagraphNode, $isTextNode, $setState, ElementNode, type LexicalNode, type TextFormatType,
} from 'lexical'
import { $createHeadingNode, $createQuoteNode, $isHeadingNode, $isQuoteNode } from '@lexical/rich-text'
import { $createListItemNode, $createListNode, $isListItemNode, $isListNode, type ListItemNode, type ListNode } from '@lexical/list'
import { $createCodeNode, $isCodeNode } from '@lexical/code'
import { $createLinkNode, $isLinkNode } from '@lexical/link'
import {
  $createTableCellNode, $createTableNode, $createTableRowNode, $isTableCellNode, $isTableNode, $isTableRowNode, TableCellHeaderStates,
} from '@lexical/table'
import { $createHorizontalRuleNode, $isHorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode'
import { render } from '../markdown/parse.ts'
import {
  $createFrontmatterNode, $createImageNode, $createInlineMathNode, $createMathNode, $createMermaidNode, $createRawNode,
  $isFrontmatterNode, $isImageNode, $isInlineMathNode, $isMathNode, $isMermaidNode, $isRawNode,
} from './nodes.ts'
import { chainState, extraState, softState, spanState, type Span } from './state.ts'

// ── import ────────────────────────────────────────────────────────────────────

/** Replaces the editor's content with `tree`. Definitions and footnote definitions are left out: print() keeps them. */
export function $importMdast(tree: Root): void {
  const definitions = new Map<string, Definition>()
  walk(tree, (node) => {
    if (node.type === 'definition' && !definitions.has(node.identifier)) definitions.set(node.identifier, node)
  })
  const root = $getRoot()
  root.clear()
  const importer = new Importer(definitions)
  for (const child of tree.children) {
    const block = importer.block(child)
    if (block) root.append(block)
  }
  if (root.isEmpty()) root.append($createParagraphNode())
}

function spanOf(node: Nodes): Span | null {
  const start = node.position?.start.offset
  const end = node.position?.end.offset
  return start === undefined || end === undefined ? null : { type: node.type, start, end }
}

function mark<T extends LexicalNode>(lexical: T, node: Nodes): T {
  const span = spanOf(node)
  if (span) $setState(lexical, spanState, span)
  return lexical
}

function extra<T extends LexicalNode>(lexical: T, value: Record<string, unknown>): T {
  const clean = Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined && v !== null))
  if (Object.keys(clean).length > 0) $setState(lexical, extraState, clean)
  return lexical
}

/** ElementNode.append without a subclass's own rules (a list item unwraps paragraphs). */
function appendBlock(parent: ElementNode, child: LexicalNode): void {
  ElementNode.prototype.append.call(parent, child)
}

const FORMAT: Record<string, TextFormatType> = { strong: 'bold', emphasis: 'italic', delete: 'strikethrough' }

class Importer {
  private readonly definitions: Map<string, Definition>

  constructor(definitions: Map<string, Definition>) {
    this.definitions = definitions
  }

  block(node: RootContent): LexicalNode | null {
    switch (node.type) {
      case 'paragraph': {
        const p = mark($createParagraphNode(), node)
        this.inline(p, node.children, [], [])
        return p
      }
      case 'heading': {
        const h = mark($createHeadingNode(`h${node.depth}`), node)
        this.inline(h, node.children, [], [])
        return h
      }
      case 'blockquote':
        return this.quote(node)
      case 'list':
        return this.list(node)
      case 'code':
        if (node.lang === 'mermaid') return extra(mark($createMermaidNode(node.value), node), { meta: node.meta })
        return this.code(node)
      case 'math':
        return extra(mark($createMathNode(node.value), node), { meta: node.meta })
      case 'yaml':
        return mark($createFrontmatterNode(node.value), node)
      case 'thematicBreak':
        return mark($createHorizontalRuleNode(), node)
      case 'html':
        return mark($createRawNode(node.value, false), node)
      case 'table':
        return this.table(node)
      case 'definition':
      case 'footnoteDefinition':
        return null
      default:
        return this.unknown(node, false)
    }
  }

  /** A node the editor cannot show as itself: kept as its Markdown, and as itself while that is unedited. */
  private unknown(node: Nodes, inline: boolean): LexicalNode {
    const source = render({ type: 'root', children: [node as RootContent] }).replace(/\n$/, '')
    return extra(mark($createRawNode(source, inline), node), { mdast: structuredClone(node), source })
  }

  private quote(node: Blockquote): LexicalNode {
    const q = mark($createQuoteNode(), node)
    const [first, ...rest] = node.children
    // A quote of one paragraph holds its text directly, as Lexical's own quotes do.
    if (first?.type === 'paragraph' && rest.length === 0) {
      extra(q, { paragraph: spanOf(first) })
      this.inline(q, first.children, [], [])
      return q
    }
    for (const child of node.children) {
      const block = this.block(child)
      if (block) appendBlock(q, block)
    }
    return q
  }

  private list(node: List): ListNode {
    const check = node.children.some((item) => typeof item.checked === 'boolean')
    const type = check ? 'check' : node.ordered ? 'number' : 'bullet'
    const list = extra(mark($createListNode(type, node.start ?? 1), node), { spread: node.spread || undefined, ordered: check && node.ordered ? true : undefined })
    for (const item of node.children) for (const li of this.item(item, check)) list.append(li)
    return list
  }

  /** A list item, plus one wrapper item per nested list, which is how Lexical nests lists. */
  private item(node: ListItem, check: boolean): ListItemNode[] {
    const li = extra(mark($createListItemNode(check ? (node.checked ?? undefined) : undefined), node), {
      spread: node.spread || undefined,
      box: check && typeof node.checked !== 'boolean' ? false : undefined,
    })
    const out = [li]
    let current: ListItemNode = li
    node.children.forEach((child, i) => {
      if (i === 0 && child.type === 'paragraph') {
        extra(li, { ...$getState(li, extraState), paragraph: spanOf(child) })
        this.inline(li, child.children, [], [])
        return
      }
      if (child.type === 'list') {
        current = $createListItemNode()
        current.append(this.list(child))
        out.push(current)
        return
      }
      const block = this.block(child)
      if (block) appendBlock(current, block)
    })
    return out
  }

  private code(node: Code): LexicalNode {
    const code = extra(mark($createCodeNode(node.lang ?? undefined), node), { meta: node.meta })
    node.value.split('\n').forEach((line, i) => {
      if (i > 0) code.append($createLineBreakNode())
      if (line) code.append($createTextNode(line))
    })
    return code
  }

  private table(node: Table): LexicalNode {
    const table = extra(mark($createTableNode(), node), { align: node.align })
    node.children.forEach((row: TableRow, r) => {
      const tr = mark($createTableRowNode(), row)
      for (const cell of row.children as TableCell[]) {
        const td = mark($createTableCellNode(r === 0 ? TableCellHeaderStates.ROW : TableCellHeaderStates.NO_STATUS), cell)
        const p = $createParagraphNode()
        this.inline(p, cell.children, [], [])
        td.append(p)
        tr.append(td)
      }
      table.append(tr)
    })
    return table
  }

  private inline(parent: ElementNode, nodes: PhrasingContent[], chain: Span[], formats: TextFormatType[]): void {
    const chained = <T extends LexicalNode>(lexical: T): T => {
      if (chain.length > 0) $setState(lexical, chainState, chain)
      return lexical
    }
    for (const node of nodes) {
      switch (node.type) {
        case 'text':
        case 'inlineCode': {
          const all = node.type === 'inlineCode' ? [...formats, 'code' as const] : formats
          node.value.split('\n').forEach((part, i) => {
            if (i > 0) {
              const lb = chained(mark($createLineBreakNode(), node))
              $setState(lb, softState, true)
              parent.append(lb)
            }
            if (part === '' && node.value !== '') return
            const text = chained(mark($createTextNode(part), node))
            for (const f of all) text.toggleFormat(f)
            parent.append(text)
          })
          break
        }
        case 'strong':
        case 'emphasis':
        case 'delete': {
          const span = spanOf(node)
          this.inline(parent, node.children, span ? [...chain, span] : chain, [...formats, FORMAT[node.type]!])
          break
        }
        case 'break':
          parent.append(chained(mark($createLineBreakNode(), node)))
          break
        case 'link':
        case 'linkReference': {
          const ref = node.type === 'linkReference' ? node : undefined
          const definition = ref && this.definitions.get(ref.identifier)
          const url = node.type === 'link' ? node.url : (definition?.url ?? '')
          const title = node.type === 'link' ? node.title : definition?.title
          const link = chained(mark($createLinkNode(url, { title: title ?? null }), node))
          if (ref) extra(link, { ref: { identifier: ref.identifier, label: ref.label, referenceType: ref.referenceType, url } })
          // Marks around the whole link stay outside it.
          this.inline(link, node.children, [], formats)
          parent.append(link)
          break
        }
        case 'image':
        case 'imageReference': {
          const ref = node.type === 'imageReference' ? node : undefined
          const definition = ref && this.definitions.get(ref.identifier)
          const url = node.type === 'image' ? node.url : (definition?.url ?? '')
          const title = node.type === 'image' ? node.title : definition?.title
          const image = chained(mark($createImageNode(url, node.alt ?? '', title ?? null), node))
          if (ref) extra(image, { ref: { identifier: ref.identifier, label: ref.label, referenceType: ref.referenceType, url } })
          parent.append(image)
          break
        }
        case 'inlineMath':
          parent.append(chained(mark($createInlineMathNode(node.value), node)))
          break
        case 'html':
          parent.append(chained(mark($createRawNode(node.value, true), node)))
          break
        default:
          parent.append(chained(this.unknown(node, true)))
      }
    }
  }
}

// ── export ────────────────────────────────────────────────────────────────────

/** The editor's content as mdast, each node carrying the position of the node it was imported from. */
export function $exportMdast(): Root {
  const children: RootContent[] = []
  for (const child of $getRoot().getChildren()) children.push(...exportBlock(child))
  return { type: 'root', children }
}

function position(span: Span | null | undefined, type: string): { position?: NonNullable<Nodes['position']> } {
  if (!span || span.type !== type) return {}
  return { position: { start: { line: 1, column: 1, offset: span.start }, end: { line: 1, column: 1, offset: span.end } } }
}

const at = (node: LexicalNode, type: string) => position($getState(node, spanState), type)
const extraOf = (node: LexicalNode) => $getState(node, extraState)

function isBlock(node: LexicalNode): boolean {
  if ($isElementNode(node)) return !node.isInline()
  if ($isDecoratorNode(node)) return !node.isInline()
  return false
}

/** Children that mix text and blocks: each run of text becomes a paragraph, the first taking `first`'s position. */
function flow(children: LexicalNode[], first?: Span | null): RootContent[] {
  const out: RootContent[] = []
  let run: LexicalNode[] = []
  let firstRun = true
  const flush = () => {
    if (run.length === 0) return
    out.push({ type: 'paragraph', children: exportInline(run), ...(firstRun ? position(first, 'paragraph') : {}) })
    run = []
    firstRun = false
  }
  for (const child of children) {
    if (isBlock(child)) {
      flush()
      firstRun = false
      out.push(...exportBlock(child))
    } else run.push(child)
  }
  flush()
  return out
}

function exportBlock(node: LexicalNode): RootContent[] {
  if ($isParagraphNode(node)) return [{ type: 'paragraph', children: exportInline(node.getChildren()), ...at(node, 'paragraph') } satisfies Paragraph]
  if ($isHeadingNode(node)) {
    const depth = Number(node.getTag().slice(1)) as Heading['depth']
    return [{ type: 'heading', depth, children: exportInline(node.getChildren()), ...at(node, 'heading') }]
  }
  if ($isQuoteNode(node)) {
    const children = flow(node.getChildren(), extraOf(node).paragraph as Span | undefined)
    return [{ type: 'blockquote', children: children as Blockquote['children'], ...at(node, 'blockquote') }]
  }
  if ($isListNode(node)) return [exportList(node)]
  if ($isCodeNode(node)) {
    return [{ type: 'code', lang: node.getLanguage() ?? null, meta: (extraOf(node).meta as string | undefined) ?? null, value: node.getTextContent(), ...at(node, 'code') }]
  }
  if ($isMermaidNode(node)) return [{ type: 'code', lang: 'mermaid', meta: (extraOf(node).meta as string | undefined) ?? null, value: node.getValue(), ...at(node, 'code') }]
  if ($isMathNode(node)) return [{ type: 'math', meta: (extraOf(node).meta as string | undefined) ?? null, value: node.getValue(), ...at(node, 'math') }]
  if ($isFrontmatterNode(node)) return [{ type: 'yaml', value: node.getValue(), ...at(node, 'yaml') }]
  if ($isHorizontalRuleNode(node)) return [{ type: 'thematicBreak', ...at(node, 'thematicBreak') }]
  if ($isRawNode(node)) return [exportRaw(node) as RootContent]
  if ($isTableNode(node)) {
    const rows: TableRow[] = []
    for (const row of node.getChildren()) {
      if (!$isTableRowNode(row)) continue
      const cells: TableCell[] = []
      for (const cell of row.getChildren()) {
        if (!$isTableCellNode(cell)) continue
        const inline: LexicalNode[] = []
        cell.getChildren().forEach((p, i) => {
          if (i > 0) inline.push($createLineBreakNode())
          if ($isElementNode(p)) inline.push(...p.getChildren())
          else inline.push(p)
        })
        cells.push({ type: 'tableCell', children: exportInline(inline), ...at(cell, 'tableCell') })
      }
      rows.push({ type: 'tableRow', children: cells, ...at(row, 'tableRow') })
    }
    const align = (extraOf(node).align as Table['align']) ?? null
    return [{ type: 'table', align, children: rows, ...at(node, 'table') }]
  }
  if ($isElementNode(node)) return flow(node.getChildren())
  return [{ type: 'paragraph', children: exportInline([node]) }]
}

function exportRaw(node: LexicalNode & { getValue(): string; isInline(): boolean }): Nodes {
  const x = extraOf(node)
  if (x.mdast && x.source === node.getValue()) return x.mdast as Nodes
  return { type: 'html', value: node.getValue(), ...(x.mdast ? {} : at(node, 'html')) } satisfies Html
}

function exportList(node: ListNode): List {
  const x = extraOf(node)
  const type = node.getListType()
  const ordered = type === 'number' || (type === 'check' && x.ordered === true)
  const items: ListItem[] = []
  for (const child of node.getChildren()) {
    if (!$isListItemNode(child)) continue
    const kids = child.getChildren()
    // An item holding only a nested list continues the item before it.
    const previous = items[items.length - 1]
    if (previous && kids.length > 0 && $isListNode(kids[0]!)) {
      previous.children.push(...(flow(kids) as ListItem['children']))
      continue
    }
    items.push(exportItem(child, type === 'check'))
  }
  return { type: 'list', ordered, start: ordered ? node.getStart() : null, spread: x.spread === true, children: items, ...at(node, 'list') }
}

function exportItem(node: ListItemNode, check: boolean): ListItem {
  const x = extraOf(node)
  const checked = check && x.box !== false ? (node.getChecked() ?? false) : null
  const children = flow(node.getChildren(), x.paragraph as Span | undefined) as ListItem['children']
  return { type: 'listItem', spread: x.spread === true, checked, children, ...at(node, 'listItem') }
}

// Inline content: each Lexical leaf with the mdast wrappers (strong, emphasis, delete) it sits in, outermost first.
interface Wrapper { type: 'strong' | 'emphasis' | 'delete'; span: Span | null }
interface Item { wrappers: Wrapper[]; leaf: PhrasingContent; span: Span | null }

const MARKS: Array<[TextFormatType, Wrapper['type']]> = [['strikethrough', 'delete'], ['bold', 'strong'], ['italic', 'emphasis']]

/** `outside`: marks already applied around these nodes (by the wrappers of the link they are in). */
function exportInline(nodes: LexicalNode[], outside: ReadonlySet<string> = new Set()): PhrasingContent[] {
  const items: Item[] = []
  for (const node of nodes) {
    const chain = $getState(node, chainState) as Span[]
    const span = $getState(node, spanState)
    let wrappers: Wrapper[] = chain.map((s) => ({ type: s.type as Wrapper['type'], span: s }))
    if ($isTextNode(node)) {
      // The marks a text has now: those it still has keep their place, new ones go inside.
      const has = new Set(MARKS.filter(([f, t]) => node.hasFormat(f) && !outside.has(t)).map(([, t]) => t))
      wrappers = wrappers.filter((w) => has.has(w.type))
      for (const [, t] of MARKS) if (has.has(t) && !wrappers.some((w) => w.type === t)) wrappers.push({ type: t, span: null })
      const leaf: PhrasingContent = node.hasFormat('code')
        ? { type: 'inlineCode', value: node.getTextContent() }
        : { type: 'text', value: node.getTextContent() }
      items.push({ wrappers, leaf, span: span?.type === leaf.type ? span : null })
    } else if ($isLineBreakNode(node)) {
      if ($getState(node, softState)) items.push({ wrappers, leaf: { type: 'text', value: '\n' }, span: span?.type === 'text' ? span : null })
      else items.push({ wrappers, leaf: { type: 'break' }, span: span?.type === 'break' ? span : null })
    } else if ($isLinkNode(node)) {
      const x = extraOf(node)
      const ref = x.ref as { identifier: string; label?: string; referenceType: LinkReference['referenceType']; url: string } | undefined
      const children = exportInline(node.getChildren(), new Set([...outside, ...wrappers.map((w) => w.type)]))
      const leaf: PhrasingContent = ref && ref.url === node.getURL()
        ? { type: 'linkReference', identifier: ref.identifier, label: ref.label, referenceType: ref.referenceType, children, ...at(node, 'linkReference') }
        : { type: 'link', url: node.getURL(), title: node.getTitle() ?? null, children, ...at(node, 'link') }
      items.push({ wrappers, leaf, span: null })
    } else if ($isImageNode(node)) {
      const x = extraOf(node)
      const ref = x.ref as { identifier: string; label?: string; referenceType: ImageReference['referenceType']; url: string } | undefined
      const leaf: PhrasingContent = ref && ref.url === node.getSrc()
        ? { type: 'imageReference', identifier: ref.identifier, label: ref.label, referenceType: ref.referenceType, alt: node.getAlt(), ...at(node, 'imageReference') }
        : { type: 'image', url: node.getSrc(), alt: node.getAlt(), title: node.getTitle(), ...at(node, 'image') } satisfies Image
      items.push({ wrappers, leaf, span: null })
    } else if ($isInlineMathNode(node)) {
      items.push({ wrappers, leaf: { type: 'inlineMath', value: node.getValue(), ...at(node, 'inlineMath') }, span: null })
    } else if ($isRawNode(node)) {
      const raw = exportRaw(node)
      items.push({ wrappers, leaf: raw.type === 'html' ? { ...raw, ...(extraOf(node).mdast ? {} : at(node, 'html')) } as PhrasingContent : raw as PhrasingContent, span: null })
    } else if ($isElementNode(node)) {
      for (const leaf of exportInline(node.getChildren(), outside)) items.push({ wrappers, leaf, span: null })
    } else {
      items.push({ wrappers, leaf: { type: 'text', value: node.getTextContent() }, span: null })
    }
  }
  return build(items)
}

const sameWrapper = (a: Wrapper, b: Wrapper) =>
  a.type === b.type && (a.span === null ? b.span === null : b.span !== null && a.span.start === b.span.start && a.span.end === b.span.end)

function build(items: Item[]): PhrasingContent[] {
  const out: PhrasingContent[] = []
  let i = 0
  while (i < items.length) {
    const item = items[i]!
    const wrapper = item.wrappers[0]
    if (!wrapper) {
      const leaf = { ...item.leaf, ...(item.span ? position(item.span, item.leaf.type) : {}) } as PhrasingContent
      const prev = out[out.length - 1]
      // The pieces of one text (split at its line endings) are one text again.
      if (leaf.type === 'text' && prev?.type === 'text' && item.span && items[i - 1]?.span === item.span) prev.value += leaf.value
      else if (leaf.type === 'text' && prev?.type === 'text' && item.span && prev.position?.start.offset === item.span.start && prev.position?.end.offset === item.span.end) prev.value += leaf.value
      else out.push(leaf)
      i++
      continue
    }
    let j = i + 1
    while (j < items.length && items[j]!.wrappers[0] && sameWrapper(items[j]!.wrappers[0]!, wrapper)) j++
    const inner = items.slice(i, j).map((it) => ({ ...it, wrappers: it.wrappers.slice(1) }))
    out.push({ type: wrapper.type, children: build(inner), ...position(wrapper.span, wrapper.type) } as PhrasingContent)
    i = j
  }
  return out
}

function walk(node: Nodes, visit: (node: Nodes) => void): void {
  visit(node)
  if ('children' in node) for (const child of node.children as Nodes[]) walk(child, visit)
}
