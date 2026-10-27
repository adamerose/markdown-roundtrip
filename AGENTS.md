# markdown-roundtrip

The WYSIWYG Markdown editor shared by Jotis and the Lexical Markdown VS Code extension, and the Markdown printer under it.
Consumers depend on it as a git dependency pinned to a commit.

## Entry points

- `markdown-roundtrip/markdown` — no Lexical, no React. `parse` reads Markdown (CommonMark, GFM, YAML frontmatter, math) into mdast with source positions.
  `print(tree, base)` writes a tree back against the file it came from: unchanged nodes are the base's exact bytes, changed nodes keep the syntax of the node they replace, new nodes take their neighbours' or the file's style, and the output is read back and re-rendered where it would mean something else.
- `markdown-roundtrip/lexical` — the shared Lexical nodes and the Lexical ↔ mdast mapping. Every imported node keeps the source span of the mdast node it came from (Lexical node state), so an export carries positions and `saveMarkdown` keeps the bytes of what the user did not touch. `viewThroughLexical` is the `view` that tells the printer what an unedited trip through the editor looks like.
- `markdown-roundtrip/react` (planned) — the shared editing plugins and UI pieces.

Nothing here knows Jotis blocks or the extension's webview protocol; each app maps its own model to mdast.

## Development

```sh
pnpm test                          # corpus and edit tests
pnpm typecheck
node test/debug-markdown.ts [file] [label]  # print every failing Markdown-level edit with its diff
node test/lexical-debug.ts [file] [label]   # the same for edits made through a Lexical editor
```

## Roundtrip contract

- Printing an unedited tree returns the file byte for byte. `test/corpus.test.ts` checks every file in `fixtures/corpus/`.
- An edit changes only the edited part of the file, and the output reads back as the edited tree. `test/edits.test.ts` applies generated edits (text, bold, code, block insert/delete/swap, list items, task toggles) to every corpus file; `test/lexical-edits.test.ts` makes edits through a headless Lexical editor.
- Spelling choices the tree does not carry (`*` vs `-`, `*` vs `_`, reference style) are the file's, not the tree's: kept where untouched, inferred where new.

## Corpus

`fixtures/corpus/` holds Markdown files that once failed to round-trip.
A file that shows an unfixed bug goes in `fixtures/corpus/broken/` (skipped by the tests).
When it is fixed, reduce the cause to a minimal example in `fixtures/corpus/` and move the original to `fixtures/corpus/fixed/`.

## Not yet done

- Ivy onboarding: `/ivy:onboard` failed on 2026-10-26 because the Ivy server returned 503. Run it once Ivy is up.
