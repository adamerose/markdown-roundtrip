/**
 * What the views need from the app around the editor. Set it once with
 * configureHost(); the defaults suit a plain web page.
 */
export interface Host {
  /** Mermaid's theme for the page as it is now. */
  theme(): 'dark' | 'default'
  /** Opens a rendered diagram (PNG, base64) as an image, if the app can. */
  openImage?(pngBase64: string): void
  /** A failure the user did not cause, for the app's log. */
  reportError(message: string, stack?: string): void
  /** The URL an image's source resolves to (a path relative to the file, say). */
  resolveImageSrc(src: string): string
}

export const host: Host = {
  theme: () => (globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'default'),
  reportError: (message, stack) => console.error(message, stack ?? ''),
  resolveImageSrc: (src) => src,
}

export function configureHost(next: Partial<Host>): void {
  Object.assign(host, next)
}
