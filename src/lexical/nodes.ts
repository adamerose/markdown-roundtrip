import type { JSX } from 'react'
import {
  $applyNodeReplacement, DecoratorNode, ElementNode, type EditorConfig, type LexicalNode, type NodeKey, type SerializedLexicalNode, type Spread,
} from 'lexical'
import { $isListItemNode, $isListNode, ListNode, type SerializedListNode } from '@lexical/list'
import { renderers } from './renderers.ts'

type Serialized<T> = Spread<T, SerializedLexicalNode>

/** A decorator that keeps one string, shown by a renderer the app may replace. */
abstract class SourceNode extends DecoratorNode<JSX.Element | null> {
  __value: string

  constructor(value = '', key?: NodeKey) {
    super(key)
    this.__value = value
  }

  getValue(): string {
    return this.getLatest().__value
  }

  setValue(value: string): this {
    const self = this.getWritable()
    self.__value = value
    return self
  }

  getTextContent(): string {
    return this.getLatest().__value
  }

  createDOM(config: EditorConfig): HTMLElement {
    const el = document.createElement(this.isInline() ? 'span' : 'div')
    const theme = (config.theme as Record<string, string | undefined>)[this.getType()]
    if (theme) el.className = theme
    return el
  }

  updateDOM(): false {
    return false
  }

  exportJSON(): Serialized<{ value: string }> {
    return { ...super.exportJSON(), value: this.getValue() }
  }
}

/** `$…$` math. */
export class InlineMathNode extends SourceNode {
  static getType(): string { return 'md-inline-math' }
  static clone(node: InlineMathNode): InlineMathNode { return new InlineMathNode(node.__value, node.__key) }
  static importJSON(json: Serialized<{ value: string }>): InlineMathNode { return $createInlineMathNode(json.value).updateFromJSON(json) }
  isInline(): true { return true }
  decorate(): JSX.Element | null { return renderers.math({ value: this.__value, inline: true, nodeKey: this.__key }) }
}

/** `$$…$$` math. */
export class MathNode extends SourceNode {
  static getType(): string { return 'md-math' }
  static clone(node: MathNode): MathNode { return new MathNode(node.__value, node.__key) }
  static importJSON(json: Serialized<{ value: string }>): MathNode { return $createMathNode(json.value).updateFromJSON(json) }
  isInline(): false { return false }
  decorate(): JSX.Element | null { return renderers.math({ value: this.__value, inline: false, nodeKey: this.__key }) }
}

/** A ```mermaid fence. */
export class MermaidNode extends SourceNode {
  static getType(): string { return 'md-mermaid' }
  static clone(node: MermaidNode): MermaidNode { return new MermaidNode(node.__value, node.__key) }
  static importJSON(json: Serialized<{ value: string }>): MermaidNode { return $createMermaidNode(json.value).updateFromJSON(json) }
  isInline(): false { return false }
  decorate(): JSX.Element | null { return renderers.mermaid({ value: this.__value, nodeKey: this.__key }) }
}

/** YAML frontmatter. */
export class FrontmatterNode extends SourceNode {
  static getType(): string { return 'md-frontmatter' }
  static clone(node: FrontmatterNode): FrontmatterNode { return new FrontmatterNode(node.__value, node.__key) }
  static importJSON(json: Serialized<{ value: string }>): FrontmatterNode { return $createFrontmatterNode(json.value).updateFromJSON(json) }
  isInline(): false { return false }
  decorate(): JSX.Element | null { return renderers.frontmatter({ value: this.__value, nodeKey: this.__key }) }
}

/**
 * Markdown the editor has no node for (raw HTML, a footnote reference),
 * shown and edited as its source.
 */
export class RawNode extends SourceNode {
  __inline: boolean

  constructor(value = '', inline = false, key?: NodeKey) {
    super(value, key)
    this.__inline = inline
  }

  static getType(): string { return 'md-raw' }
  static clone(node: RawNode): RawNode { return new RawNode(node.__value, node.__inline, node.__key) }
  static importJSON(json: Serialized<{ value: string; inline: boolean }>): RawNode { return $createRawNode(json.value, json.inline).updateFromJSON(json) }
  exportJSON(): Serialized<{ value: string; inline: boolean }> { return { ...super.exportJSON(), inline: this.__inline } }
  isInline(): boolean { return this.__inline }
  decorate(): JSX.Element | null { return renderers.raw({ value: this.__value, inline: this.__inline, nodeKey: this.__key }) }
}

/** `![alt](src "title")`. */
export class ImageNode extends DecoratorNode<JSX.Element | null> {
  __src: string
  __alt: string
  __title: string | null

  constructor(src = '', alt = '', title: string | null = null, key?: NodeKey) {
    super(key)
    this.__src = src
    this.__alt = alt
    this.__title = title
  }

  static getType(): string { return 'md-image' }
  static clone(node: ImageNode): ImageNode { return new ImageNode(node.__src, node.__alt, node.__title, node.__key) }
  static importJSON(json: Serialized<{ src: string; alt: string; title: string | null }>): ImageNode {
    return $createImageNode(json.src, json.alt, json.title).updateFromJSON(json)
  }

  exportJSON(): Serialized<{ src: string; alt: string; title: string | null }> {
    return { ...super.exportJSON(), src: this.__src, alt: this.__alt, title: this.__title }
  }

  getSrc(): string { return this.getLatest().__src }
  getAlt(): string { return this.getLatest().__alt }
  getTitle(): string | null { return this.getLatest().__title }

  setImage(src: string, alt: string, title: string | null): this {
    const self = this.getWritable()
    self.__src = src
    self.__alt = alt
    self.__title = title
    return self
  }

  getTextContent(): string { return this.getLatest().__alt }
  isInline(): true { return true }

  createDOM(config: EditorConfig): HTMLElement {
    const el = document.createElement('span')
    const theme = (config.theme as Record<string, string | undefined>).image
    if (theme) el.className = theme
    return el
  }

  updateDOM(): false { return false }
  decorate(): JSX.Element | null { return renderers.image({ src: this.__src, alt: this.__alt, title: this.__title, nodeKey: this.__key }) }
}

export const $createInlineMathNode = (value: string) => $applyNodeReplacement(new InlineMathNode(value))
export const $createMathNode = (value: string) => $applyNodeReplacement(new MathNode(value))
export const $createMermaidNode = (value: string) => $applyNodeReplacement(new MermaidNode(value))
export const $createFrontmatterNode = (value: string) => $applyNodeReplacement(new FrontmatterNode(value))
export const $createRawNode = (value: string, inline: boolean) => $applyNodeReplacement(new RawNode(value, inline))
export const $createImageNode = (src: string, alt: string, title: string | null) => $applyNodeReplacement(new ImageNode(src, alt, title))

export const $isInlineMathNode = (node: LexicalNode | null | undefined): node is InlineMathNode => node instanceof InlineMathNode
export const $isMathNode = (node: LexicalNode | null | undefined): node is MathNode => node instanceof MathNode
export const $isMermaidNode = (node: LexicalNode | null | undefined): node is MermaidNode => node instanceof MermaidNode
export const $isFrontmatterNode = (node: LexicalNode | null | undefined): node is FrontmatterNode => node instanceof FrontmatterNode
export const $isRawNode = (node: LexicalNode | null | undefined): node is RawNode => node instanceof RawNode
export const $isImageNode = (node: LexicalNode | null | undefined): node is ImageNode => node instanceof ImageNode

/**
 * A list that stays separate from a list of its type next to it. Lexical's own
 * ListNode merges them, but in Markdown they are two lists (`-` then `*`), and
 * merging would rewrite the second. Numbering is kept in step as in Lexical.
 */
export class MarkdownListNode extends ListNode {
  $config() {
    return this.config('md-list', {
      extends: ElementNode,
      $transform: (node: MarkdownListNode) => {
        let value = node.getStart()
        for (const child of node.getChildren()) {
          if (!$isListItemNode(child)) continue
          if (child.getValue() !== value) child.setValue(value)
          if (!$isListNode(child.getFirstChild())) value++
        }
      },
    })
  }

  static getType(): string { return 'md-list' }
  static clone(node: MarkdownListNode): MarkdownListNode { return new MarkdownListNode(node.getListType(), node.getStart(), node.__key) }
  static importJSON(json: SerializedListNode): MarkdownListNode { return new MarkdownListNode(json.listType, json.start).updateFromJSON(json) }
}

/** Use in an editor's `nodes` so lists Lexical's commands create are MarkdownListNodes too. */
export const MARKDOWN_LIST_REPLACEMENT = {
  replace: ListNode,
  with: (node: ListNode) => new MarkdownListNode(node.getListType(), node.getStart()),
  withKlass: MarkdownListNode,
}
