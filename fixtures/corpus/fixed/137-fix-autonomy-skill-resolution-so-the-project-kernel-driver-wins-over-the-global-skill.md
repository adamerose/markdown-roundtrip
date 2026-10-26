---
status: closed
created: 2026-07-22
impact: 7
difficulty: 3
human-interaction: 4
---
# Fix autonomy skill resolution so the project kernel-driver wins over the global skill

## Why

Observed 2026-07-21: a fresh `/autonomy` in this repo resolved to the **global**
skill (`~/.claude/skills/autonomy` — the worker-orchestrator that spawns
`/implement` agents) instead of the **project** skill
(`.claude/skills/autonomy` — the Trellis kernel-driver that dispatches `trellis
loop --once`). They are *different execution models*. Running the wrong one runs
the wrong pipeline; the driver had to override it manually. Any fresh session in
this repo will keep loading the wrong skill by default — the same class of
"environment drift" as the stale-daemon problem.

## Outcome

In this repo, a plain `/autonomy` reliably resolves to the intended skill (the
project kernel-driver), OR the two variants are reconciled so there is one correct
behavior regardless of which loads.

## Work / constraints

- Determine why the global shadows the project (skill-resolution precedence in the
  harness). Fix so the project skill wins when both define `autonomy`.
- Alternatively, reconcile: if the project should not maintain a separate autonomy
  skill, converge on one; if it should, make its precedence explicit.
- Verify with a genuinely fresh session (not this one).

## Evidence required

- A fresh `/autonomy` in this repo loads the project kernel-driver skill (or the
  reconciled single behavior), confirmed in a clean session.

## Work log

- 2026-07-22 (autonomy iteration 3, session 0000000b): Passed over despite
  `ready` status: the work requires modifying `.claude/` skill configuration
  (project `.claude/skills/autonomy/` and/or the global
  `~/.claude/skills/autonomy/`), which autonomy workers' hard limits forbid —
  and changing skill-resolution behavior for the very machinery driving the
  run is unsafe from inside the run. Needs an interactive/human-driven
  session. Same constraint applies to #131.
- 2026-07-22 (autonomy iteration 7, session 0000000b): #110 shipped the
  `/flows` invocation audit, which records `/autonomy` as decided
  user-invoked but could not flip its metadata (same `.claude/` bar). This
  issue inherits the mechanical flip: add `name: autonomy`,
  `disable-model-invocation: true`, and `policy.allow_implicit_invocation:
  false` to `.claude/skills/autonomy/SKILL.md`, shorten its description to a
  human-facing label, and extend the documentation validator's frontmatter
  enforcement (`packages/trellis/src/documentation.ts`) to the Ivy-local
  surface in the same change.
- 2026-07-22 (interactive, operator-directed): Root cause established from the
  Claude Code docs (skills.md § Where skills live): **personal skills always
  override project skills** — Enterprise > Personal > Project, no
  disambiguation. The project skill cannot win by name; the "fix precedence"
  branch of this issue is impossible in the harness, so the reconciliation
  branch was taken: the global orchestrator
  (`~/.claude/skills/autonomy/SKILL.md`) now opens with a **Project override**
  section — if `.claude/skills/autonomy/SKILL.md` exists in the project, it
  reads and follows that file, passing `$ARGUMENTS` through (Cap Recovery
  turns excepted: their JSON state stays with the variant that armed the
  cron). The inherited mechanical flip also shipped: project skill frontmatter
  gains `name`/`disable-model-invocation`/`policy`, description shortened;
  validator enforcement extended to the Ivy-local surface (removed the
  carrier-only `continue` in `documentation.ts`); `/flows` router prose
  updated. Verified: trellis suite 203 passed / 2 skipped; a fresh headless
  session probe confirmed the personal skill still owns the model-facing
  listing (expected under documented precedence) — correct behavior now comes
  from the deferral, which a future live `/autonomy` run confirms end-to-end.
- 2026-07-22 (correction round, same session): Fresh-context review returned
  changes-requested with three must-fixes, all applied: (1) scoped the
  "global tool configurations" hard limit to avoid contradicting the new
  `.claude/` exception; (2) updated the stale design-doc prose
  (agent-skills-conformance.md, matt-pocock.md) per the co-maintenance
  contract; (3) live evidence — a fresh headless session invoked `/autonomy`
  and reported it was following the project driver
  (`.claude/skills/autonomy/SKILL.md`) via the global skill's deferral,
  quoting the mechanism. Nits also applied: Cap Recovery discrimination now
  keys on JSON shape (`"log_file"` key present = generic orchestrator's
  state) instead of reading a file that may be pruned; the override read is
  marked as the orchestrator's one sanctioned project-file read; the
  `.claude/` exception explicitly excludes weakening `settings.json`
  permission posture. Review also established the personal skill surface is
  a junction into `packages/trellis/assets/skills/`, so the "out-of-repo"
  edit is in fact versioned and merges with this branch, and self-retires
  when enablement re-points to `assets-next` (which has no autonomy skill).
