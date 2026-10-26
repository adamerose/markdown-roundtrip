import type { List, ListItem, Nodes, Parents, Root, RootContent } from 'mdast'
import type { Options as Style } from 'mdast-util-to-markdown'
import { parse, render } from './parse.ts'

/** The file a tree was read from, kept so untouched parts can be written back as they were. */
export interface Base {
  source: string
  /** `parse(source)`; passed when the caller already has it. */
  tree?: Root
}

export interface PrintOptions {
  /**
   * What the app gets back after importing a tree and exporting it unchanged,
   * keeping `position` on every node it took from the tree. Nodes the app
   * drops (a reference definition an editor cannot show, say) are written back
   * as they were; properties it drops do not count as edits. Default: identity.
   */
  view?: (tree: Root) => Root
}

/**
 * Markdown for `current`. Without a base it is rendered in a default style.
 * With one, every node that carries the `position` of a base node and is
 * unchanged is written as the base's exact bytes; a changed node keeps the
 * syntax of the node it replaces (markers, fences, prefixes) and only its
 * changed parts are rendered, in the style of its neighbours or the file.
 * The output is read back to check it means `current`; any part that reads
 * back differently is rendered afresh.
 */
export function print(current: Root, base?: Base, options: PrintOptions = {}): string {
  const view = options.view ?? ((tree: Root) => tree)
  if (!base) return render(current, defaultStyle)
  const baseTree = base.tree ?? parse(base.source)
  const baseView = view(baseTree)
  if (same(current, baseView)) return base.source

  const printer = new Printer(base.source, baseTree, baseView)
  const target = comparable(current)
  let first: string | undefined
  for (let attempt = 0; attempt < 64; attempt++) {
    const output = printer.print(current)
    first ??= output
    const diverging = divergence(current, target, comparable(view(parse(output))))
    if (!diverging) return output
    if (!printer.forceFresh(diverging, current)) break
  }
  // Nothing short of rendering everything reads back right. If that does not
  // either, the tree has no Markdown form (a footnote reference without its
  // definition, say): keep the output that kept the most of the file.
  const fresh = render(current, printer.style)
  return divergence(current, target, comparable(view(parse(fresh)))) ? first! : fresh
}

const defaultStyle: Style = {
  bullet: '-', bulletOther: '*', bulletOrdered: '.', emphasis: '*', strong: '*',
  fence: '`', rule: '-', listItemIndent: 'one', incrementListMarker: true,
}

type Span = { start: number; end: number }

function span(node: Nodes): Span | undefined {
  const start = node.position?.start.offset
  const end = node.position?.end.offset
  return start === undefined || end === undefined ? undefined : { start, end }
}

function keyOf(node: Nodes): string | undefined {
  const s = span(node)
  return s && `${node.type}@${s.start}-${s.end}`
}

const FLOW_PARENTS = new Set(['root', 'blockquote', 'listItem', 'footnoteDefinition'])

class Printer {
  readonly style: Style
  private readonly baseByKey = new Map<string, Nodes>()
  private readonly baseParent = new Map<Nodes, Parents>()
  private readonly inView = new Set<string>()
  private readonly viewByKey = new Map<string, Nodes>()
  private readonly forced = new Set<Nodes>()
  private used = new Set<string>()
  private readonly source: string

  constructor(source: string, baseTree: Root, baseView: Root) {
    this.source = source
    walk(baseTree, (node, parent) => {
      const key = keyOf(node)
      if (key && !this.baseByKey.has(key)) this.baseByKey.set(key, node)
      if (parent) this.baseParent.set(node, parent)
    })
    walk(baseView, (node) => {
      const key = keyOf(node)
      if (key && !this.viewByKey.has(key)) this.viewByKey.set(key, node)
      if (key) this.inView.add(key)
    })
    this.style = inferStyle(source, baseTree)
  }

  print(root: Root): string {
    this.used = new Set()
    return this.node(root, '', undefined)
  }

  /** Render `node` afresh next time; false when there is nothing coarser left to try. */
  forceFresh(node: Nodes, root: Root): boolean {
    // A node that still reads back wrong when rendered afresh is disturbed by a
    // neighbour: render the neighbours afresh, then the parent.
    let target: Nodes | undefined = node
    while (target && this.forced.has(target)) {
      const parent = parentIn(root, target)
      const siblings = parent && 'children' in parent ? (parent.children as Nodes[]) : []
      const i = siblings.indexOf(target)
      const neighbour = [siblings[i - 1], siblings[i + 1]].find((n) => n && !this.forced.has(n))
      target = neighbour ?? parent
    }
    if (!target) return false
    this.forced.add(target)
    return true
  }

  private slice(node: Nodes): string {
    const s = span(node)!
    return this.source.slice(s.start, s.end)
  }

  private node(node: Nodes, prefix: string, expectedParent: Nodes | undefined, style: Style = {}): string {
    const key = keyOf(node)
    const base = key && !this.used.has(key) ? this.baseByKey.get(key) : undefined
    if (base && !this.forced.has(node)) {
      this.used.add(key!)
      const moved = node.type !== 'root' && this.baseParent.get(base) !== expectedParent
      const kept = this.viewByKey.get(key!) ?? base
      if (same(node, kept) && !(moved && this.slice(base).includes('\n'))) return this.slice(base)
      if (!moved) {
        const edited = this.edited(node, base, prefix)
        if (edited !== undefined) return edited
      }
    }
    return this.fresh(node, prefix, style)
  }

  /** A changed node written with the syntax of the base node it replaces, or undefined to render it afresh. */
  private edited(node: Nodes, base: Nodes, prefix: string): string | undefined {
    if (node.type !== base.type) return undefined
    const text = this.slice(base)
    if ('children' in node && 'children' in base) {
      const first = base.children[0]
      const last = base.children[base.children.length - 1]
      if (!first || !last) return undefined
      let opening = this.source.slice(span(base)!.start, span(first)!.start)
      let closing = this.source.slice(span(last)!.end, span(base)!.end)
      if (!ownPropsEqual(node, base, ['spread', 'checked', 'depth'])) return undefined
      if (node.type === 'heading' && base.type === 'heading' && node.depth !== base.depth) {
        if (/^#{1,6}/.test(opening)) opening = opening.replace(/^#{1,6}/, '#'.repeat(node.depth))
        else if (node.depth <= 2 && closing.includes('\n')) closing = closing.replace(/[=-]+(\s*)$/, (m, ws: string) => (node.depth === 1 ? '=' : '-').repeat(m.length - ws.length) + ws)
        else return undefined
      }
      if (node.type === 'listItem' && base.type === 'listItem' && (node.checked ?? null) !== (base.checked ?? null)) {
        const box = /\[[ xX]\] ?/
        if (node.checked === null || node.checked === undefined) opening = opening.replace(box, '')
        else if (box.test(opening)) opening = opening.replace(/\[[ xX]\]/, node.checked ? '[x]' : '[ ]')
        else opening = opening.replace(/^(\s*(?:[-*+]|\d+[.)]) +)/, `$1[${node.checked ? 'x' : ' '}] `)
      }
      if (node.type === 'linkReference' && base.type === 'linkReference' && base.referenceType !== 'full' && !same(node, base)) {
        // A shortcut or collapsed reference is only a link while its text is its label.
        closing = closing.replace(/\](\[\])?$/, `][${base.label ?? base.identifier}]`)
      }
      const childPrefix = this.childPrefix(node.type, opening, prefix, base)
      return opening + this.children(node, base, childPrefix) + closing
    }
    if (!ownPropsEqual(node, base, ['value'])) return undefined
    const value = 'value' in node ? node.value : undefined
    if (value === undefined) return undefined
    const lines = (v: string) => v.split('\n').map((line, i) => (i === 0 ? line : indent(prefix, line))).join('\n')
    switch (node.type) {
      case 'text':
      case 'html':
        return lines(value)
      case 'inlineCode':
      case 'inlineMath': {
        const fence = /^(`+|\$+)/.exec(text)?.[1] ?? ''
        const pad = text[fence.length] === ' ' && text[text.length - fence.length - 1] === ' ' ? ' ' : ''
        return fence + pad + value + pad + fence
      }
      case 'code':
      case 'math':
      case 'yaml': {
        const open = text.indexOf('\n')
        const close = text.lastIndexOf('\n')
        if (open < 0 || close <= open) return undefined
        const fence = text.slice(0, open)
        const end = text.slice(close)
        if (!/^(`{3,}|~{3,}|\${2,}|-{3})/.test(fence) || !/^\n\s*(>\s*)*(`{3,}|~{3,}|\${2,}|-{3})\s*$/.test(end)) return undefined
        return fence + (value === '' ? '' : '\n' + indent(prefix, '') + lines(value)) + end
      }
    }
    return undefined
  }

  private childPrefix(type: string, opening: string, prefix: string, base: Nodes): string {
    if (type === 'list') {
      // Items start where the list's first item starts, however deep it was indented.
      const start = span(base)!.start
      const line = this.source.slice(this.source.lastIndexOf('\n', start - 1) + 1, start)
      return line.replace(/[^ \t>]/g, ' ')
    }
    if (type === 'blockquote') return prefix + (opening.startsWith('> ') ? '> ' : '>')
    if (type === 'listItem') {
      const marker = /^([-*+]|\d{1,9}[.)])( *)/.exec(opening)
      const spaces = marker?.[2]?.length ?? 1
      return prefix + ' '.repeat((marker?.[1]?.length ?? 1) + (spaces >= 1 && spaces <= 4 ? spaces : 1))
    }
    if (type === 'footnoteDefinition') return prefix + '    '
    return prefix
  }

  private children(node: Parents, base: Parents, prefix: string): string {
    const baseChildren = base.children as Nodes[]
    const indexOf = new Map<string, number>()
    baseChildren.forEach((child, i) => {
      const key = keyOf(child)
      if (key) indexOf.set(key, i)
    })
    // Base children the app never saw are written back after the sibling they followed.
    const kept = new Map<number, number[]>()
    let anchor = -1
    baseChildren.forEach((child, i) => {
      const key = keyOf(child)
      if (key && !this.inView.has(key)) kept.set(anchor, [...(kept.get(anchor) ?? []), i])
      else anchor = i
    })
    const items: Array<{ text: string; at?: number; node?: Nodes }> = []
    const keep = (after: number) => {
      for (const i of kept.get(after) ?? []) items.push({ text: this.slice(baseChildren[i]!), at: i })
      kept.delete(after)
    }
    keep(-1)
    const children = node.children as Nodes[]
    children.forEach((child, i) => {
      const at = indexOf.get(keyOf(child) ?? '')
      const isItem = node.type === 'list' && child.type === 'listItem'
      let text = isItem && (at === undefined || this.forced.has(child))
        ? this.freshItem(child as ListItem, node as List, base as List, i, prefix)
        : this.node(child, prefix, base, child.type === 'list' ? unlike(items[items.length - 1], child) : {})
      // An ordered list's number is its first item's: renumber only that one.
      if (isItem && i === 0 && (node as List).ordered) text = text.replace(/^\d{1,9}(?=[.)])/, String((node as List).start ?? 1))
      items.push({ text, at, node: child })
      if (at !== undefined) keep(at)
    })
    for (const after of [...kept.keys()]) keep(after)

    let out = ''
    items.forEach((item, i) => {
      if (i > 0) out += this.separator(node, base, items[i - 1]!.at, item.at, prefix)
      out += item.text
    })
    return out
  }

  private separator(node: Parents, base: Parents, before: number | undefined, after: number | undefined, prefix: string): string {
    const kids = base.children as Nodes[]
    const gap = (i: number) => this.source.slice(span(kids[i - 1]!)!.end, span(kids[i]!)!.start)
    if (before !== undefined && after === before + 1) return gap(after)
    // Between blocks that were not neighbours, borrow a gap only if it is a blank line:
    // without one, a new paragraph would continue the block before it.
    // In a list, a borrowed gap must also keep the list as loose or tight as it is.
    const hasBlank = (g: string) => /\n[ \t>]*\n/.test(g)
    const blank = (g: string) => (node.type === 'list' ? hasBlank(g) === Boolean((node as List).spread) : !FLOW_PARENTS.has(node.type) || hasBlank(g))
    if (node.type === 'list' && after !== undefined && after > 0 && blank(gap(after))) return gap(after)
    if (node.type !== 'list' && after !== undefined && after > 0) {
      // Without a blank line, still keep the indentation the next block's first line had.
      const g = gap(after)
      return blank(g) ? g : '\n' + prefix.trimEnd() + '\n' + g.slice(g.lastIndexOf('\n') + 1)
    }
    if (before !== undefined && before < kids.length - 1 && blank(gap(before + 1))) return gap(before + 1)
    if (node.type === 'list') return '\n' + ((node as List).spread ? prefix.trimEnd() + '\n' : '') + prefix
    if (FLOW_PARENTS.has(node.type)) return '\n' + prefix.trimEnd() + '\n' + prefix
    if (node.type === 'table') return '\n' + prefix
    return ''
  }

  /** A new list item, marked like the item before it (or after it), so it joins the same list. */
  private freshItem(item: ListItem, list: List, base: List, index: number, prefix: string): string {
    const items = base.children
    const near = (n: Nodes | undefined) => (n ? (this.baseByKey.get(keyOf(n) ?? '') as ListItem | undefined) : undefined)
    const previous = near(list.children[index - 1])
    const neighbour = previous ?? near(list.children[index + 1]) ?? items[Math.min(index, items.length - 1)]
    const marker = neighbour ? /^([-*+]|(\d{1,9})([.)]))/.exec(this.slice(neighbour)) : null
    const style: Style = { ...this.style }
    let start = list.start ?? 1
    if (marker?.[2]) {
      style.bulletOrdered = marker[3] as '.' | ')'
      const numbers = items.map((it) => Number(/^\d+/.exec(this.slice(it))?.[0] ?? 0))
      const counting = numbers.length < 2 || numbers.some((n, i) => i > 0 && n !== numbers[0])
      start = Number(marker[2]) + (counting && neighbour === previous ? 1 : 0)
    } else if (marker?.[1]) {
      style.bullet = marker[1] as '-' | '*' | '+'
      style.bulletOther = style.bullet === '-' ? '*' : '-'
    }
    const single: List = { type: 'list', ordered: list.ordered, start, spread: false, children: [item] }
    return this.fresh(single, prefix, style)
  }

  private fresh(node: Nodes, prefix: string, override: Style): string {
    const style = { ...this.style, ...override }
    if (node.type === 'text') {
      // Text sits between siblings, not at a paragraph's edges, where spaces would be encoded.
      // If its neighbours make it read differently, the read-back check renders them afresh too.
      const text = render({ type: 'root', children: [{ type: 'paragraph', children: [{ type: 'text', value: `x${node.value}x` }] }] }, style)
      return text.replace(/\n$/, '').slice(1, -1).split('\n').map((line, i) => (i === 0 ? line : indent(prefix, line))).join('\n')
    }
    const phrasing = !isFlow(node)
    const root: Root = phrasing
      ? { type: 'root', children: [{ type: 'paragraph', children: [node as never] }] }
      : node.type === 'root' ? node : { type: 'root', children: [node as RootContent] }
    const text = render(root, style).replace(/\n$/, '')
    return text.split('\n').map((line, i) => (i === 0 ? line : indent(prefix, line))).join('\n')
  }
}

/** For a list rendered right after another list of its kind: the other marker, so the two stay two lists. */
function unlike(previous: { text: string; node?: Nodes } | undefined, list: List): Style {
  if (previous?.node?.type !== 'list' || previous.node.ordered !== list.ordered) return {}
  if (list.ordered) return { bulletOrdered: /^\d+\./.test(previous.text) ? ')' : '.' }
  const bullet = previous.text[0] === '-' ? '*' : '-'
  return { bullet, bulletOther: bullet === '-' ? '*' : '-' }
}

const FLOW_TYPES = new Set([
  'root', 'blockquote', 'code', 'definition', 'footnoteDefinition', 'heading', 'html', 'list', 'listItem',
  'math', 'paragraph', 'table', 'tableRow', 'tableCell', 'thematicBreak', 'yaml',
])

function isFlow(node: Nodes): boolean {
  return FLOW_TYPES.has(node.type)
}

function indent(prefix: string, line: string): string {
  return line === '' ? prefix.trimEnd() : prefix + line
}

function walk(node: Nodes, visit: (node: Nodes, parent?: Parents) => void, parent?: Parents) {
  visit(node, parent)
  if ('children' in node) for (const child of node.children as Nodes[]) walk(child, visit, node)
}

function parentIn(root: Root, target: Nodes): Nodes | undefined {
  let found: Nodes | undefined
  walk(root, (node, parent) => {
    if (node === target) found = parent
  })
  return found
}

function inferStyle(source: string, tree: Root): Style {
  const style: Style = { ...defaultStyle }
  const text = (node: Nodes) => {
    const s = span(node)
    return s ? source.slice(s.start, s.end) : ''
  }
  let bullet = false, ordered = false, emphasis = false, strong = false, fence = false, rule = false
  walk(tree, (node) => {
    if (node.type === 'list' && node.children[0]) {
      const marker = /^([-*+])|^\d+([.)])/.exec(text(node.children[0]))
      if (!node.ordered && marker?.[1] && !bullet) {
        bullet = true
        style.bullet = marker[1] as '-' | '*' | '+'
        style.bulletOther = style.bullet === '-' ? '*' : '-'
      }
      if (node.ordered && marker?.[2] && !ordered) {
        ordered = true
        style.bulletOrdered = marker[2] as '.' | ')'
      }
    } else if (node.type === 'emphasis' && !emphasis) {
      const c = text(node)[0]
      if (c === '*' || c === '_') (emphasis = true), (style.emphasis = c)
    } else if (node.type === 'strong' && !strong) {
      const c = text(node)[0]
      if (c === '*' || c === '_') (strong = true), (style.strong = c)
    } else if (node.type === 'code' && !fence) {
      const c = text(node)[0]
      if (c === '`' || c === '~') (fence = true), (style.fence = c)
    } else if (node.type === 'thematicBreak' && !rule) {
      const c = text(node)[0]
      if (c === '-' || c === '*' || c === '_') (rule = true), (style.rule = c)
    }
  })
  if (style.rule === style.bullet) style.rule = style.bullet === '-' ? '*' : '-'
  return style
}

const IGNORED = new Set(['position', 'data'])
// How a reference was spelled ([text], [text][], [text][label]) is syntax, not meaning: the identifier is what it points at.
const SPELLING = new Set(['referenceType', 'label'])

/** A node as plain data for comparison: no positions or app data, no empty fields, adjacent text merged. */
function comparable(node: Nodes): unknown {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(node)) {
    if (IGNORED.has(key) || SPELLING.has(key) || value === null || value === undefined) continue
    if (key === 'children') {
      const kids: unknown[] = []
      for (const child of value as Nodes[]) {
        // An empty text node says nothing.
        if (child.type === 'text' && child.value === '') continue
        const c = comparable(child) as Record<string, unknown>
        const prev = kids[kids.length - 1] as Record<string, unknown> | undefined
        if (c.type === 'text' && prev?.type === 'text') prev.value = String(prev.value) + String(c.value)
        else kids.push(c)
      }
      out.children = kids
    } else out[key] = value
  }
  return out
}

function same(a: Nodes, b: Nodes): boolean {
  return JSON.stringify(comparable(a)) === JSON.stringify(comparable(b))
}

function ownPropsEqual(a: Nodes, b: Nodes, except: string[]): boolean {
  const own = (n: Nodes) => {
    const out: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(n)) {
      if (key === 'children' || IGNORED.has(key) || SPELLING.has(key) || except.includes(key) || value === null || value === undefined) continue
      out[key] = value
    }
    return JSON.stringify(out)
  }
  return own(a) === own(b)
}

/** The deepest node of `current` whose read-back differs, or undefined when the output means `current`. */
function divergence(current: Nodes, target: unknown, readBack: unknown): Nodes | undefined {
  const t = target as Record<string, unknown>
  const r = readBack as Record<string, unknown>
  if (JSON.stringify(t) === JSON.stringify(r)) return undefined
  const kids = 'children' in current ? (current.children as Nodes[]) : []
  const tk = t.children as unknown[] | undefined
  const rk = r.children as unknown[] | undefined
  if (tk && rk && tk.length === rk.length && tk.length === kids.length && JSON.stringify({ ...t, children: 0 }) === JSON.stringify({ ...r, children: 0 })) {
    for (let i = 0; i < kids.length; i++) {
      const found = divergence(kids[i]!, tk[i], rk[i])
      if (found) return found
    }
  }
  if (tk && rk && kids.length === tk.length) {
    // Children differ in number: the first child that reads back differently, else this node.
    // Fewer children read back: the first differing one swallowed its next sibling (two lists of one kind
    // joining, say), so that sibling is the one to render afresh.
    for (let i = 0; i < Math.min(tk.length, rk.length); i++) {
      if (JSON.stringify(tk[i]) !== JSON.stringify(rk[i])) return rk.length < tk.length ? (kids[i + 1] ?? kids[i]) : kids[i]
    }
  }
  return current
}
