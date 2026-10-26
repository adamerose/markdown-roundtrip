---
status: closed
created: 2026-07-16
depends-on: [103]
---
# Consultation lead-reply turns in one record

## Outcome

A multi-round consultation lives in **one** append-only record: the lead
(the session driving the consultation) can append its reply as a numbered
turn to `.trellis/consults/<slug>/`, and the next `trellis consult`
invocation delivers the full turn sequence to the peer.

## Why

The consult kernel supports one immutable brief per slug and appends one
peer turn per invocation, but there is no sanctioned way for the lead's
reply to enter the record — `.trellis/` is kernel-owned, so hand-writing
turn files violates the state boundary. The 2026-07-16
`autonomy-loop-replacement` consultation had to spill round 2 into a linked
`-r2` slug with a "read the other directory" pointer in its brief: the
record survives but is fragmented, and the peer must re-derive context that
the turn mechanism exists to carry.

## Constraints

- Keep the append-only invariant: turns are never edited or renumbered; the
  brief stays immutable.
- The kernel writes the turn (e.g. `trellis consult <slug> --reply-file
  <path>` appends `NN-lead.md` without dispatching, or dispatches in the
  same invocation — the candidate decides, with rationale).
- Existing single-turn behavior and the 99-turn limit unchanged; existing
  records remain readable.
- Turn naming must distinguish lead from peer (`-lead` vs provider name) so
  `dispatchConsult`'s prior-turn framing stays honest about who said what.

## Rejected choices

- Hand-writing turn files from the lead session — breaks kernel ownership
  of `.trellis/`.
- Linked `-rN` slugs per round (the current workaround) — fragments the
  canonical record and pushes cross-referencing onto every reader.

## Workspace note (2026-07-17)

The isolated clone has no `node_modules`. Run `npm ci --ignore-scripts`
first (allowlisted via the committed `.claude/settings.json`), then execute
the declared checks — exit codes belong in `claimed_checks`.

Reviewer executability: the read-only review sandbox cannot run vitest
(it needs to write cache/temp); reviewer-executed evidence is
typecheck/lint, and unit-test evidence is the builder's executed
`claimed_checks`, validated by inspection.

Known kernel gap (run 9718fa73 finding): the reviewer is not given the
build envelope, so it cannot see the builder's executed claimed_checks —
validate test *quality* by inspection; execution exit codes are recorded
by the kernel outside the reviewer's view.

## Evidence required

- A two-round consultation against a fake adapter shows one directory with
  brief, peer turn, lead reply, second peer turn, in order; the second
  dispatch's prompt contains all three prior turns with correct attribution.
- Immutability tests: re-sending a different brief still fails; replaying
  the same reply file does not duplicate a turn (or fails loudly — the
  candidate decides and tests it).
