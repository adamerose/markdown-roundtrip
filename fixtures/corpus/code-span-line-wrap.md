An inline code span can be manually word-wrapped across a physical line: the
kernel writes the turn (e.g. `trellis consult <slug> --reply-file
<path>` appends `NN-lead.md` without dispatching, or dispatches in the
same invocation — the candidate decides, with rationale).

Boundary whitespace in a later code span remains inside its backticks after a
wrapped span: `[Request interrupted by
user` covers both `]` and ` for tool use]` variants.

The same wrapped span can use a longer backtick fence when its content needs
a literal backtick: one SQLite file, append-only events ``{id, ts, source,
type, severity, payload}`` + `schema_version`, all derived state rebuildable
by replay — the event log's shape, kept.
