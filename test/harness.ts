import { readFileSync, readdirSync } from 'node:fs'
import type { List, ListItem, Nodes, Root, Text } from 'mdast'
import { parse, print } from '../src/markdown/index.ts'

const corpus = new URL('../fixtures/corpus/', import.meta.url)

export const files = readdirSync(corpus, { recursive: true })
  .map((file) => String(file).split('\\').join('/'))
  .filter((file) => file.endsWith('.md') && !file.startsWith('broken/'))
  .sort()

export function read(file: string): string {
  return readFileSync(new URL(file, corpus), 'utf8')
}

/** An edit to a parsed file and the source range it may change. */
export interface Edit {
  label: string
  apply: (tree: Root) => { start: number; end: number } | undefined
}

function walk(node: Nodes, visit: (node: Nodes, parent?: Nodes) => void, parent?: Nodes) {
  visit(node, parent)
  if ('children' in node) for (const child of node.children as Nodes[]) walk(child, visit, node)
}

function all<T extends Nodes>(tree: Root, test: (node: Nodes, parent?: Nodes) => boolean): T[] {
  const out: T[] = []
  walk(tree, (node, parent) => { if (test(node, parent)) out.push(node as T) })
  return out
}

const offsets = (node: Nodes) => ({ start: node.position!.start.offset!, end: node.position!.end.offset! })

/** At most `limit` indexes spread evenly over 0..count-1. */
function sample(count: number, limit: number): number[] {
  if (count <= limit) return [...Array(count).keys()]
  return [...Array(limit).keys()].map((i) => Math.floor((i * (count - 1)) / (limit - 1)))
}

// Words inside text, not next to the text's edges, so the edit does not change how neighbouring syntax reads.
const editableText = (node: Nodes, parent?: Nodes) =>
  node.type === 'text' && / \S/.test(node.value) && !(parent?.type === 'link' && parent.url === node.value)

const LIMIT = 25

export function edits(tree: Root, source: string): Edit[] {
  const out: Edit[] = []
  const texts = all<Text>(tree, editableText).length
  for (const i of sample(texts, LIMIT)) {
    out.push({
      label: `edit text ${i}`,
      apply: (t) => {
        const text = all<Text>(t, editableText)[i]!
        const at = text.value.indexOf(' ') + 1
        text.value = text.value.slice(0, at) + 'edited ' + text.value.slice(at)
        return offsets(text)
      },
    })
  }
  const blocks = tree.children.length
  for (const i of sample(blocks, LIMIT)) {
    out.push({
      label: `delete block ${i}`,
      apply: (t) => {
        const block = t.children[i]!
        // Deleting a definition someone references leaves a tree Markdown cannot say.
        if (block.type === 'definition' || block.type === 'footnoteDefinition') return undefined
        const prev = t.children[i - 1]
        const next = t.children[i + 1]
        t.children.splice(i, 1)
        const start = prev ? offsets(prev).end : 0
        const end = next ? offsets(next).start : source.length
        // When the neighbours would join once the block is gone (two lists of one kind), the next block may change too.
        const spliced = source.slice(0, start) + (prev && next ? source.slice(offsets(block).end, end) : '') + source.slice(end)
        const joins = plain(parse(spliced)) !== plain(t)
        return { start, end: joins && next ? offsets(next).end : end }
      },
    })
    out.push({
      label: `insert after block ${i}`,
      apply: (t) => {
        const block = t.children[i]!
        if (block.type === 'yaml' || block.type === 'definition' || block.type === 'footnoteDefinition') return undefined
        const next = t.children[i + 1]
        t.children.splice(i + 1, 0, { type: 'paragraph', children: [{ type: 'text', value: 'Inserted paragraph.' }] })
        return { start: offsets(block).end, end: next ? offsets(next).start : source.length }
      },
    })
  }
  const lists = all<List>(tree, (n) => n.type === 'list').length
  for (const i of sample(lists, LIMIT)) {
    out.push({
      label: `add item to list ${i}`,
      apply: (t) => {
        const list = all<List>(t, (n) => n.type === 'list')[i]!
        const last = list.children[list.children.length - 1]!
        const item: ListItem = {
          type: 'listItem', spread: false, checked: last.checked === null || last.checked === undefined ? undefined : false,
          children: [{ type: 'paragraph', children: [{ type: 'text', value: 'Added item' }] }],
        }
        list.children.push(item)
        const { end } = offsets(last)
        return { start: end, end }
      },
    })
  }
  const items = all<ListItem>(tree, (n) => n.type === 'listItem').length
  for (const i of sample(items, LIMIT)) {
    const item = all<ListItem>(tree, (n) => n.type === 'listItem')[i]!
    if (typeof item.checked === 'boolean') {
      out.push({
        label: `toggle task ${i}`,
        apply: (t) => {
          const it = all<ListItem>(t, (n) => n.type === 'listItem')[i]!
          it.checked = !it.checked
          // GFM starts the item's paragraph at its checkbox.
          const box = source.indexOf(']', offsets(it).start) + 1
          return { start: offsets(it).start, end: box }
        },
      })
    }
    out.push({
      label: `delete list item ${i}`,
      apply: (t) => {
        let found: { list: List; index: number } | undefined
        walk(t, (n) => {
          if (n.type !== 'list') return
          const index = n.children.indexOf(all<ListItem>(t, (x) => x.type === 'listItem')[i]!)
          if (index >= 0) found = { list: n, index }
        })
        if (!found || found.list.children.length < 2) return undefined
        const { list, index } = found
        const item = list.children[index]!
        const prev = list.children[index - 1]
        const next = list.children[index + 1]
        list.children.splice(index, 1)
        // A single item cannot be loose by being apart from its siblings.
        if (list.children.length === 1) list.spread = false
        // Deleting the first item of an ordered list renumbers the new first item.
        const marker = index === 0 && list.ordered && next ? /^\d+/.exec(source.slice(offsets(next).start))![0].length : 0
        return { start: prev ? offsets(prev).end : offsets(item).start, end: next ? offsets(next).start + marker : offsets(item).end }
      },
    })
  }
  const codes = all<Nodes>(tree, (n) => n.type === 'code').length
  for (const i of sample(codes, LIMIT)) {
    out.push({
      label: `edit code ${i}`,
      apply: (t) => {
        const code = all<Nodes & { value: string }>(t, (n) => n.type === 'code')[i]!
        code.value += '\nadded line'
        return offsets(code)
      },
    })
  }
  for (const i of sample(texts, LIMIT)) {
    out.push({
      label: `bold a word ${i}`,
      apply: (t) => {
        const text = all<Text>(t, editableText)[i]!
        const parent = all<Nodes & { children: Nodes[] }>(t, (n) => 'children' in n && (n.children as Nodes[]).includes(text))[0]
        if (!parent || parent.type === 'link' || parent.type === 'linkReference' || parent.type === 'strong') return undefined
        const at = text.value.indexOf(' ') + 1
        const word = /^\S+/.exec(text.value.slice(at))![0]
        const index = parent.children.indexOf(text)
        parent.children.splice(index, 1,
          { type: 'text', value: text.value.slice(0, at) },
          { type: 'strong', children: [{ type: 'text', value: word }] },
          { type: 'text', value: text.value.slice(at + word.length) })
        return offsets(text)
      },
    })
  }
  for (const i of sample(Math.max(0, blocks - 1), LIMIT)) {
    out.push({
      label: `swap blocks ${i} and ${i + 1}`,
      apply: (t) => {
        const a = t.children[i]!
        const b = t.children[i + 1]!
        if ([a, b].some((n) => n.type === 'yaml' || n.type === 'definition' || n.type === 'footnoteDefinition')) return undefined
        t.children.splice(i, 2, b, a)
        const next = t.children[i + 2]
        const end = next ? offsets(next).start : source.length
        // When the swap puts two lists of one kind side by side, the next block changes too.
        const spliced = source.slice(0, offsets(a).start) + source.slice(offsets(b).start, offsets(b).end) + source.slice(offsets(a).end, offsets(b).start) + source.slice(offsets(a).start, offsets(a).end) + source.slice(offsets(b).end)
        const joins = plain(parse(spliced)) !== plain(t)
        // The gaps around the swapped blocks move with them.
        const prev = t.children[i - 1]
        return { start: prev ? offsets(prev).end : offsets(a).start, end: joins && next ? offsets(next).end : end }
      },
    })
  }
  return out
}

/** A node as plain data: no positions, adjacent text merged, empty fields dropped. */
export function plain(node: Nodes): string {
  const data = JSON.parse(JSON.stringify(node, (key, value) => (key === 'position' || key === 'referenceType' || key === 'label' || value === null ? undefined : value)), (key, value) => {
    if (key !== 'children' || !Array.isArray(value)) return value
    const out: Array<Record<string, unknown>> = []
    for (const child of value as Array<Record<string, unknown>>) {
      const prev = out[out.length - 1]
      if (child.type === 'text' && child.value === '') continue
      if (child.type === 'text' && prev?.type === 'text') prev.value = String(prev.value) + String(child.value)
      else out.push(child)
    }
    return out
  })
  return JSON.stringify(data)
}

export interface Outcome {
  output: string
  readsBack: boolean
  local: boolean
  diff: string
}

/** Prints `edited` against `source` and checks it reads back as `edited` and changes nothing outside [start, end). */
export function run(source: string, tree: Root, edit: Edit): Outcome | undefined {
  const edited = structuredClone(tree)
  const range = edit.apply(edited)
  if (!range) return undefined
  const output = print(edited, { source, tree })
  const before = source.slice(0, range.start)
  const after = source.slice(range.end)
  return {
    output,
    readsBack: plain(parse(output)) === plain(edited),
    local: output.startsWith(before) && output.endsWith(after) && output.length >= before.length + after.length,
    diff: diff(source, output),
  }
}

function diff(a: string, b: string): string {
  let prefix = 0
  while (prefix < a.length && prefix < b.length && a[prefix] === b[prefix]) prefix++
  let suffix = 0
  while (suffix < a.length - prefix && suffix < b.length - prefix && a[a.length - 1 - suffix] === b[b.length - 1 - suffix]) suffix++
  const from = Math.max(0, prefix - 60)
  return `source: ${JSON.stringify(a.slice(from, a.length - suffix + 60))}\noutput: ${JSON.stringify(b.slice(from, b.length - suffix + 60))}`
}
