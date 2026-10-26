import type { Root } from 'mdast'
import { fromMarkdown } from 'mdast-util-from-markdown'
import { frontmatterFromMarkdown, frontmatterToMarkdown } from 'mdast-util-frontmatter'
import { gfmFromMarkdown, gfmToMarkdown } from 'mdast-util-gfm'
import { mathFromMarkdown, mathToMarkdown } from 'mdast-util-math'
import { toMarkdown, type Options as ToMarkdownOptions } from 'mdast-util-to-markdown'
import { frontmatter } from 'micromark-extension-frontmatter'
import { gfm } from 'micromark-extension-gfm'
import { math } from 'micromark-extension-math'

/**
 * The dialect: CommonMark, GFM (tables, task lists, strikethrough, autolinks,
 * footnotes), YAML front matter and `$`/`$$` math. Everything else is read as
 * CommonMark reads it, so a file shows what GitHub shows.
 */
export function parse(source: string): Root {
  return fromMarkdown(source, {
    extensions: [gfm(), frontmatter(['yaml']), math()],
    mdastExtensions: [gfmFromMarkdown(), frontmatterFromMarkdown(['yaml']), mathFromMarkdown()],
  })
}

/** Markdown for a tree with no source to keep, in the given style. */
export function render(tree: Root, style: ToMarkdownOptions = {}): string {
  return toMarkdown(tree, {
    ...style,
    extensions: [gfmToMarkdown(), frontmatterToMarkdown(['yaml']), mathToMarkdown()],
  })
}
