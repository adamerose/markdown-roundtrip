import type { JSX } from 'react'

/**
 * How the decorator nodes draw themselves. The defaults draw nothing, so the
 * nodes work in a headless editor; `markdown-roundtrip/react` installs the
 * real renderers, and an app may install its own.
 */
export interface Renderers {
  math(props: { value: string; inline: boolean; nodeKey: string }): JSX.Element | null
  mermaid(props: { value: string; nodeKey: string }): JSX.Element | null
  frontmatter(props: { value: string; nodeKey: string }): JSX.Element | null
  raw(props: { value: string; inline: boolean; nodeKey: string }): JSX.Element | null
  image(props: { src: string; alt: string; title: string | null; nodeKey: string }): JSX.Element | null
}

export const renderers: Renderers = {
  math: () => null,
  mermaid: () => null,
  frontmatter: () => null,
  raw: () => null,
  image: () => null,
}

export function setRenderers(next: Partial<Renderers>): void {
  Object.assign(renderers, next)
}
