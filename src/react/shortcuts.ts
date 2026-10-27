import { TRANSFORMERS, type ElementTransformer, type Transformer } from '@lexical/markdown'
import { $createHorizontalRuleNode, $isHorizontalRuleNode, HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode'

/** `---`, `***` or `___` and a space turns the line into a divider. */
const RULE: ElementTransformer = {
  dependencies: [HorizontalRuleNode],
  export: (node) => ($isHorizontalRuleNode(node) ? '---' : null),
  regExp: /^(---|\*\*\*|___)\s?$/,
  replace: (parent, _children, _match, isImport) => {
    const rule = $createHorizontalRuleNode()
    if (isImport || parent.getNextSibling() !== null) parent.replace(rule)
    else parent.insertBefore(rule)
    rule.selectNext()
  },
  type: 'element',
}

/**
 * Typing shortcuts for MarkdownShortcutPlugin: Lexical's own (headings,
 * lists, quotes, code, inline marks, links) and dividers. They only shape
 * what is typed; saving goes through print(), not these transformers.
 */
export const MARKDOWN_SHORTCUTS: Transformer[] = [RULE, ...TRANSFORMERS]
