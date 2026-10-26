---
status: closed
created: 2026-07-24
sessions:
  - 00000000-0000-4000-8000-000000000009
impact: 7
difficulty: 3
human-interaction: 2
---
# Builder repeatedly edits kernel-owned issue records, failing runs — guard/prompt fix

## Why

Two build failures in one autonomy run (2026-07-23, invocation 97a9b0d3) from the
same root cause — the build worker editing issue records it does not own:

- **#120** (run 2d23ffa7's predecessor): `failure_kind: builder changed the
  kernel-owned active issue record` — the builder edited its *own* issue file
  mid-build.
- **#140** (run b3051276): `builder changed issue records outside the active
  issue` — the builder renamed `140-*.md` and edited **eleven** other issue
  files (closed #100/#110/#114/#117/#123/#137/#147, open #104/#141/#156),
  reading #140's "rename all historical cruft / greenfield" mandate as license to
  rewrite issue history.

The kernel guard correctly catches this and fails the run, but only *after* a
full build round is spent — pure waste, and it recurs. The builder does not
reliably know that `docs/issues/**` is off-limits (kernel-owned process history,
excluded from the co-maintenance contract). The guard is a backstop; the builder
should not attempt the edit in the first place.

## Outcome

The build worker reliably leaves issue records alone (except the kernel-mediated
status/work-log of its own active issue), so this class of failure stops
recurring — via a clearer builder prompt, a pre-flight scope reminder, and/or
the guard's error text teaching the boundary so a correction self-corrects.

## Open design decisions

1. **Prompt vs guard-message vs both.** Add an explicit "never edit
   `docs/issues/**`; issue records are kernel-owned" line to the builder prompt;
   and/or make the guard's failure message state the rule so the next correction
   round self-corrects. Likely both — prevention + teachable failure.
2. **The legitimate exception.** The builder *does* legitimately update its own
   active issue's work log / status through the kernel path. Make the boundary
   precise: forbidden = editing issue *files* directly; allowed = the
   kernel-mediated status/work-log of the active issue. Confirm how the current
   guard distinguishes these.
3. **Is issue scope-wording a contributing cause?** #140's broad "greenfield /
   cruft" language invited it. Worth a general note that issue mandates should
   not phrase repo-wide cleanup without excluding kernel-owned paths — but the
   durable fix is the builder respecting the boundary regardless of issue
   wording.

## Evidence required

- A build whose issue mandate mentions repo-wide cleanup does not touch any
  `docs/issues/**` file, and integrates.
- If a builder does attempt it, the guard's message names the rule and the next
  correction round succeeds without human intervention.

## Work log

- 2026-07-24 — Filed during the 2026-07-23 autonomy run after the failure mode
  recurred (#120, then #140). Postmortem: `docs/design-docs/postmortems.md`.
