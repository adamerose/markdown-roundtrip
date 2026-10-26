# List Item Continuation Lines

Tests the edge cases where list items have continuation lines — text that
"hangs" under a list item without its own bullet. CommonMark calls these
"lazy continuation" lines.

## Nested Bullets with 2-Space Indent and Marker-Aligned Continuation

The user typed nested items at 2-space indent and continuation lines
aligned to the nested item's content column (4 spaces).

- Top level item
- Another top item
  - Nested at 2 spaces
    continuation aligned to nested content column
  - Sibling nested item
    continuation here too
    spans multiple lines
- Back to top level

## Checklist with Lazy 2-Space Continuation

Continuation lines indented to 2 spaces even though the marker `- [ ] ` is
6 wide. CommonMark accepts this as "lazy" continuation; the round-trip
must preserve the chosen 2-space indent rather than normalizing to 6.

- [ ] 1. First task with a long description that
  wraps onto a second line at two spaces
- [ ] 2. Second task spanning
  multiple
  lines
- [x] 3. Done item with
  trailing continuation

## Ordered List with Marker-Width Continuation

Single-digit ordered markers (`1. `) are 3 wide; continuation lines
aligned to that content column.

1. First numbered item
   continuation aligned to 3 spaces
2. Second numbered item
   another aligned continuation

## Nested Ordered Inside Bullets with Continuation

Mixed nesting where a numbered list lives inside a bullet item and has
its own continuation lines at the deeper content column.

- Outer bullet
   1. Nested ordered item
      continuation under ordered, at 6 spaces
   2. Sibling ordered item
- Next outer bullet
  with its own 2-space continuation

## List Followed by Indented Code Block

A blank line breaks continuation, so the indented block below is a true
code block — not part of the prior list item.

- Item one
- Item two

    indented code after blank line
    second line of code

## Continuation After Hard Break

`  ` at end of line is a hard break; continuation line follows.

- Line one  
  line two after hard break
- Plain item

## Deeply Nested Continuation

Three levels of nesting with continuation at the deepest level.

- Level one
  - Level two
    - Level three
      continuation at level three content column
    - Sibling level three
  - Back to level two
