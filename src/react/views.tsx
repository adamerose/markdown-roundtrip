import type { JSX } from 'react'
import { host } from './host.ts'
import { renderMath } from '../render/index.ts'

/** `$…$` or `$$…$$`, rendered by KaTeX; the source when it cannot be. */
export function MathView({ value, inline }: { value: string; inline: boolean; nodeKey: string }): JSX.Element {
  const html = renderMath(value, !inline)
  if (inline) {
    return html !== null
      ? <span className="editor-math-inline__content editor-math-inline__rendered" dangerouslySetInnerHTML={{ __html: html }} />
      : (
        <span className="editor-math-inline__content">
          <span className="editor-math-inline__dollar">$</span>{value}<span className="editor-math-inline__dollar">$</span>
        </span>
      )
  }
  return (
    <div className="editor-math-block__wrapper">
      <div className="editor-math-block__label">Math</div>
      {html !== null
        ? <div className="editor-math-block__rendered" dangerouslySetInnerHTML={{ __html: html }} />
        : <pre className="editor-math-block__content">{value}</pre>}
    </div>
  )
}

export function ImageView({ src, alt, title }: { src: string; alt: string; title: string | null; nodeKey: string }): JSX.Element {
  return <img src={host.resolveImageSrc(src)} alt={alt} title={title ?? undefined} className="editor-image" draggable={false} />
}

/** Markdown the editor has no view for (raw HTML, a footnote reference), shown as its source. */
export function RawView({ value, inline }: { value: string; inline: boolean; nodeKey: string }): JSX.Element {
  return inline
    ? <code className="editor-raw-inline">{value}</code>
    : <pre className="editor-raw-block">{value}</pre>
}
