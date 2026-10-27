import { createHeadlessEditor } from '@lexical/headless'
import { $createParagraphNode, $createTextNode, $getRoot, $getState, $isElementNode, $isTextNode, type LexicalEditor, type LexicalNode, type TextNode } from 'lexical'
import { $createListItemNode, $isListItemNode, $isListNode } from '@lexical/list'
import { $isCodeNode } from '@lexical/code'
import { parse } from '../src/markdown/index.ts'
import { $exportMdast, MARKDOWN_NODES, loadMarkdown, saveMarkdown, spanState, viewThroughLexical } from '../src/lexical/index.ts'
import { plain } from './harness.ts'

/** An edit made through Lexical, and the top-level blocks (by index) it may change. */
export interface LexicalEdit {
  label: string
  apply: () => { blocks: [number, number] } | undefined
}

const LIMIT = 15

function sample(count: number, limit: number): number[] {
  if (count <= limit) return [...Array(count).keys()]
  return [...Array(limit).keys()].map((i) => Math.floor((i * (count - 1)) / (limit - 1)))
}

function descendants(node: LexicalNode): LexicalNode[] {
  const out: LexicalNode[] = [node]
  if ($isElementNode(node)) for (const child of node.getChildren()) out.push(...descendants(child))
  return out
}

function topIndex(node: LexicalNode): number {
  let n: LexicalNode = node
  while (n.getParent() && n.getParent() !== $getRoot()) n = n.getParent()!
  return n.getIndexWithinParent()
}

const texts = () => descendants($getRoot()).filter((n): n is TextNode => $isTextNode(n) && / \S/.test(n.getTextContent()) && !$isCodeNode(n.getParent()))

export function lexicalEdits(editor: LexicalEditor): LexicalEdit[] {
  const counts = editor.read(() => ({
    texts: texts().length,
    blocks: $getRoot().getChildrenSize(),
    lists: descendants($getRoot()).filter($isListNode).length,
    codes: descendants($getRoot()).filter($isCodeNode).length,
  }))
  const out: LexicalEdit[] = []
  for (const i of sample(counts.texts, LIMIT)) {
    out.push({
      label: `type into text ${i}`,
      apply: () => {
        const text = texts()[i]!
        const at = text.getTextContent().indexOf(' ') + 1
        text.spliceText(at, 0, 'edited ')
        const b = topIndex(text)
        return { blocks: [b, b] }
      },
    })
    out.push({
      label: `bold a word ${i}`,
      apply: () => {
        const text = texts()[i]!
        const value = text.getTextContent()
        const at = value.indexOf(' ') + 1
        const word = /^\S+/.exec(value.slice(at))![0]
        const parts = text.splitText(at, at + word.length)
        const middle = parts[at === 0 ? 0 : 1]!
        middle.toggleFormat('bold')
        const b = topIndex(middle)
        return { blocks: [b, b] }
      },
    })
  }
  for (const i of sample(counts.blocks, LIMIT)) {
    out.push({
      label: `insert paragraph after block ${i}`,
      apply: () => {
        const block = $getRoot().getChildAtIndex(i)!
        if ($getRoot().getChildAtIndex(i + 1) === null && block.getType() === 'md-frontmatter') return undefined
        block.insertAfter($createParagraphNode().append($createTextNode('Inserted paragraph.')))
        return { blocks: [i, i + 2] }
      },
    })
    out.push({
      label: `delete block ${i}`,
      apply: () => {
        if ($getRoot().getChildrenSize() < 2) return undefined
        $getRoot().getChildAtIndex(i)!.remove()
        // The block after may need to change: it may read differently where the deleted one stood.
        return { blocks: [i, i + 1] }
      },
    })
  }
  for (const i of sample(counts.lists, LIMIT)) {
    out.push({
      label: `add item to list ${i}`,
      apply: () => {
        const list = descendants($getRoot()).filter($isListNode)[i]!
        const last = list.getLastChild()
        const item = $createListItemNode($isListItemNode(last) && list.getListType() === 'check' ? false : undefined)
        item.append($createTextNode('Added item'))
        list.append(item)
        const b = topIndex(list)
        return { blocks: [b, b] }
      },
    })
  }
  for (const i of sample(counts.codes, LIMIT)) {
    out.push({
      label: `edit code ${i}`,
      apply: () => {
        const code = descendants($getRoot()).filter($isCodeNode)[i]!
        code.append($createTextNode(' // edited'))
        const b = topIndex(code)
        return { blocks: [b, b] }
      },
    })
  }
  return out
}

export interface LexicalOutcome {
  output: string
  readsBack: boolean
  local: boolean
  diff: string
}

export function newEditor(): LexicalEditor {
  return createHeadlessEditor({ nodes: MARKDOWN_NODES, onError: (e) => { throw e } })
}

/** Loads `source`, applies `edit`, saves, and checks the save means the editor's content and changes only the edited blocks. */
export function runLexical(source: string, label: string): LexicalOutcome | undefined {
  const editor = newEditor()
  const base = loadMarkdown(editor, source)
  const edit = lexicalEdits(editor).find((e) => e.label === label)!
  // The source range of the top-level blocks from..to as they were before the edit.
  const spans = editor.read(() => $getRoot().getChildren().map((n) => $getState(n, spanState)))
  let range: [number, number] | undefined
  editor.update(() => { range = edit.apply()?.blocks }, { discrete: true })
  if (!range) return undefined
  const output = saveMarkdown(editor, base)
  const current = editor.read(() => $exportMdast())
  const from = range[0] < 0 ? 0 : (spanStart(spans, range[0], 'start') ?? 0)
  const to = spanStart(spans, range[1], 'end') ?? source.length
  const before = source.slice(0, from)
  const after = source.slice(to)
  return {
    output,
    readsBack: plain(viewThroughLexical(parse(output))) === plain(current),
    local: output.startsWith(before) && output.endsWith(after) && output.length >= before.length + after.length,
    diff: diff(source, output),
  }
}

function spanStart(spans: Array<{ start: number; end: number } | null>, index: number, side: 'start' | 'end'): number | undefined {
  // The edit may change the gaps around the blocks, so the range runs from the end of the block before to the start of the block after.
  if (side === 'start') {
    for (let i = index - 1; i >= 0; i--) if (spans[i]) return spans[i]!.end
    return 0
  }
  for (let i = index + 1; i < spans.length; i++) if (spans[i]) return spans[i]!.start
  return undefined
}

function diff(a: string, b: string): string {
  let prefix = 0
  while (prefix < a.length && prefix < b.length && a[prefix] === b[prefix]) prefix++
  let suffix = 0
  while (suffix < a.length - prefix && suffix < b.length - prefix && a[a.length - 1 - suffix] === b[b.length - 1 - suffix]) suffix++
  const from = Math.max(0, prefix - 60)
  return `source: ${JSON.stringify(a.slice(from, a.length - suffix + 60))}\noutput: ${JSON.stringify(b.slice(from, b.length - suffix + 60))}`
}
