import { setRenderers } from '../lexical/renderers.ts'
import { FrontmatterView } from './Frontmatter.tsx'
import { MermaidView } from './Mermaid.tsx'
import { ImageView, MathView, RawView } from './views.tsx'

export { configureHost, host, type Host } from './host.ts'
export { FrontmatterView } from './Frontmatter.tsx'
export { MermaidView } from './Mermaid.tsx'
export { ImageView, MathView, RawView } from './views.tsx'

// Importing this entry gives the shared nodes their views.
setRenderers({
  math: (props) => <MathView {...props} />,
  mermaid: (props) => <MermaidView {...props} />,
  frontmatter: (props) => <FrontmatterView {...props} />,
  image: (props) => <ImageView {...props} />,
  raw: (props) => <RawView {...props} />,
})
