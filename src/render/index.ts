import katex from 'katex'
import type { MermaidConfig } from 'mermaid'

/**
 * Markdown's diagrams and math as HTML, for the editor's views and for
 * read-only renderers (react-markdown and the like) alike.
 */

export interface MermaidOptions {
  theme: MermaidConfig['theme']
  /** Mermaid's own setting; `strict` unless the host trusts the documents. */
  securityLevel?: MermaidConfig['securityLevel']
  themeVariables?: MermaidConfig['themeVariables']
}

type Mermaid = typeof import('mermaid').default

// Mermaid touches `window` when it loads, so it loads on first use.
let loading: Promise<Mermaid> | null = null
let configured: string | null = null
let counter = 0

/** A Mermaid diagram's SVG; rejects with Mermaid's message when it does not parse. */
export async function renderMermaid(source: string, options: MermaidOptions): Promise<string> {
  const mermaid = await (loading ??= import('mermaid').then((m) => m.default))
  const config: MermaidConfig = {
    startOnLoad: false,
    theme: options.theme,
    securityLevel: options.securityLevel ?? 'strict',
    themeVariables: options.themeVariables,
  }
  const key = JSON.stringify(config)
  if (key !== configured) {
    mermaid.initialize(config)
    configured = key
  }
  const id = `md-mermaid-${counter++}`
  try {
    return (await mermaid.render(id, source)).svg
  } finally {
    // On a parse error Mermaid leaves its scratch container in the page.
    if (typeof document !== 'undefined') document.getElementById(`d${id}`)?.remove()
  }
}

/** `$…$` (inline) or `$$…$$` (display) as KaTeX HTML; null when KaTeX cannot render it. */
export function renderMath(expression: string, display: boolean): string | null {
  try {
    return katex.renderToString(expression, { throwOnError: false, displayMode: display, trust: false })
  } catch {
    return null
  }
}
