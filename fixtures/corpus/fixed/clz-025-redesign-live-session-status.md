---
status: ready-for-implementation
created: 2026-06-08
---

# Redesign live session status: structural-first determination

The live-session status enum mixes two unrelated questions into one value —
*whose turn is it?* (structural) and *is it healthy?* (time-based) — and resolves
the time half from JSONL file mtime, which is unreliable. The result is fragile
status detection with several false positives.

## Current state

5 statuses: `active` · `waiting_for_human` · `possibly_stalled` · `stalled` · `ended`.

Determined in [src/lib/claude-data/live.ts](../../../src/lib/claude-data/live.ts)
(~L805-831): dead→`ended`; no messages→skipped; assistant-last-and-no-in-flight-tool
→`waiting_for_human`; otherwise bucket by file mtime (≥5m→`stalled`, ≥2m→`possibly_stalled`,
else→`active`).

## Problems

1. **Interrupts read as stalled.** `[Request interrupted by user]` (and `...for tool
   use`) are stored as *user* messages, so `lastMessageRole === 'user'` → treated as
   "agent should be working" → goes silent → `stalled`. But it's actually the human's
   turn. Confirmed: 184 + 27 occurrences of the two markers in real session data.
2. **Slow tools read as stalled.** A long-running `Bash`/`Agent` writes nothing to JSONL
   for minutes → mtime goes stale → `stalled`, even though the tool is legitimately
   running. The card shows "Running: Bash" spinner *and* a "Stalled" warning
   simultaneously. Worst failure — it cries wolf on healthy work.
3. **Two stall levels** (`possibly_stalled` amber at 2m, `stalled` red at 5m) is fuzzy
   complexity for marginal signal.

## Decision

Determine **turn ownership structurally (no clock)**, then apply time only to decide
healthy-vs-stuck, and only when there is no legitimate reason for silence (no in-flight
tool). Collapse 5 statuses → 4.

New enum: **`working` · `waiting` · `stuck` · `ended`**
(labels: "Working" / "Waiting for you" / "Stuck" / "Ended").

Determination — strict priority, first match wins:

| # | Condition | Status |
|---|-----------|--------|
| 1 | PID dead (`!isAlive`) | `ended` |
| 2 | no JSONL / no messages yet | *(skip — `continue`, unchanged)* |
| 3 | **Human's turn**: assistant spoke last with no in-flight tool, **OR** last message is an interrupt marker | `waiting` |
| 4 | **Agent's turn + a tool is in-flight** | `working` |
| 5 | **Agent's turn + no in-flight tool + idle ≥ STUCK_THRESHOLD (3 min)** | `stuck` |
| 6 | **Agent's turn + no in-flight tool** (responding normally) | `working` |

mtime is consulted in exactly one place (rule 5), where it is actually meaningful: the
agent received the turn and produced nothing, with nothing running.

**Interrupt detection.** A user message whose text starts with `[Request interrupted by
user` (covers both `]` and ` for tool use]` variants). Detect during JSONL parse and
expose a `lastUserIsInterrupt` boolean on `LiveSessionJsonlData` (don't re-derive from
the truncated `lastUserText` downstream).

**Single stuck level** chosen over two-level (amber+red) or advisory-only — confirmed
with user. One red alarm, one threshold.

## Implementation checklist

- [x] 1. Added `lastUserIsInterrupt` to `LiveSessionJsonlData` + `LiveSession`; set in
      `parseLiveSessionJsonl` via `isInterruptMarker` (`[Request interrupted by user` prefix).
- [x] 2. Extracted the decision into a **pure exported `deriveLiveStatus(input)`** (the
      6-rule ladder) instead of inlining in `getLiveSessions` — makes it independently
      testable and a deeper module. Added `STUCK_THRESHOLD_MS = 3*60*1000`; renamed
      `stallDuration` → `stuckDuration` (set only on `stuck`).
- [x] 3. `LiveSession['status']` union → `'working' | 'waiting' | 'stuck' | 'ended'`.
- [x] 4. Updated consumers: `session-card.tsx` (`StatusDot`, `LastMessagePreview`,
      stuck-warning), `page.tsx` (`sortAliveSessions` → stuck/working/waiting, `StatusLegend`),
      and `about/page.tsx` glossary.
- [x] 5. Updated CLAUDE.md (domain term renamed Stall → **Live Status**; Live Monitor
      page-spec wording).
- [x] 6. Tests: 8 new cases in `live.test.ts` covering the full ladder (ended / skip /
      waiting-assistant / waiting-interrupt-even-when-idle / working-tool-even-when-idle /
      stuck / working-short-idle / boundary).

## Outcome

Done and verified. `tsc --noEmit` clean, `eslint` clean, full vitest suite 187 passed.
Browser-verified against a fresh prod build on live data: legend shows Working/Waiting/Stuck;
this dashboard session (with an in-flight Bash) correctly read `working`, **not** stuck —
the false-stall fix demonstrated live. No console errors.

## Optional polish (not required)

If a tool stays in-flight absurdly long (e.g. >15m), render an amber "Running: Bash (15m)"
hint on the card — *without* flipping status to `stuck`. Status stays bulletproof; the
hint is advisory.

## Notes

The earlier fix [80a6ec6] ("Derive live session status from conversation state, not
mtime") solved the assistant-last case but left user-last (interrupts, post-tool-result
turns) and in-flight-tool cases on the fragile mtime path. This issue finishes that work.
