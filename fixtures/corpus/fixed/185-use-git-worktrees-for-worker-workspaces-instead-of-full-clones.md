---
status: ready
created: 2026-07-26T06:34:29Z
impact: 7
difficulty: 5
human-interaction: 8
sessions:
  - 00000000-0000-4000-8000-000000000010
---
# Use git worktrees for worker workspaces instead of full clones

**What this is:** kernel build and review workers get a full
`git clone --no-local` of the repository into `%TEMP%`. This issue replaces
that with a `git worktree`, because the clone's extra isolation defends
against a threat the project's decided worker-execution posture explicitly
declines to defend against, and because it collapses the kernel's two
workspace primitives into one. The measured savings are modest and honest —
about 1.5 s and ~21 MB per run (git creation 2.202 s → 0.729 s); the dominant
provisioning cost is `npm ci`, which is unchanged here and owned by #188.

## Why

Operator, 2026-07-26:

> "Why are we so scared of workers that we avoid worktrees? don't the workers
> already have dangerous permissions to the point they could `cd` into the
> original repo and damage things in all the ways you said clone protects
> from? We need to make this whole flow elegant as much as possible."

He is right, and the security record already agrees with him.

**What the clone actually does.** `addIsolatedClone`
(`packages/trellis/src/git.ts:249-271`) runs `git clone --no-local
--no-checkout`, checks out a branch at the base commit, and removes the
`origin` remote. `--no-local` forces the transport path instead of hardlinking
`.git/objects`, so the copy is genuinely independent; dropping `origin` means
the worker cannot fetch or push back.

**What that buys, precisely.** A worktree shares the parent's object database
and ref namespace, so a worker running `git gc --prune=now`, `git reset`,
`git branch -D`, or `git push` inside a worktree reaches the parent's git
state. A clone contains those. That is **accident containment**, not attack
prevention: nothing stops a worker at `danger-full-access` from simply `cd`-ing
into the primary checkout and doing all of it directly.

**The posture already says this is not the boundary.**
`docs/design-docs/trellis/security/worker-execution-posture.md` (decided
2026-07-20, operator) records:

- The clone's claim is deliberately narrow — workers run in a throwaway
  workspace *"so `main` and the primary checkout are not the working
  directory"* (`:108-109`). It never claims they are protected.
- *"The real defense is agent behavior, not an OS jail. The intended security
  model is that agents follow good development practices and exercise judgment
  — treat the agent like a competent, careful human developer, not like
  untrusted code to be caged."* (`:72-77`)
- Prompt injection executing with full host privileges is an **accepted,
  unmitigated risk** (`:92-95`).
- *"Cross-family review + exact-candidate integration: the strongest surviving
  control."* (`:110-115`)

So the clone is a caging instrument aimed at a threat class this posture
declines to cage, and the controls that actually protect `main` — independent
cross-family review bound to immutable base and candidate SHAs, rejection of
reviewer commits and tracked writes, and integration of the archived candidate
SHA — are entirely unaffected by which workspace mechanism is used.

**What it costs — corrected 2026-07-26 (operator, option c).** This issue's first
draft claimed ~315 MB and 16–18 s per clone, citing `provisioning_ms`. Run
`a698d3d2`'s exact-candidate A/B measurement corrected that: `provisioning_ms`
measures `npm ci` *after* workspace creation, not cloning.

| workspace | setup time | disk |
|---|---|---|
| isolated clone | 17.932 s | 466.9 MB |
| worktree | 16.987 s | 445.9 MB |

The honest benefit is **~1.5 s and ~21 MB per run** (git creation 2.202 s →
0.729 s). The dominant cost — ~16 s and nearly all the disk — is dependency
provisioning, unchanged by the workspace mechanism and owned by **#188**. The
25.23 GB leak (#178) was likewise mostly `node_modules`. This issue proceeds
on the posture and consistency arguments above, which never depended on the
cost figures; the cost-motivated framing is rejected as a premise.

**Consistency argument.** The kernel already uses worktrees for its own git
operations — the integration squash (`git.ts:443`) and the blocked-status
write (`runner.ts:194`). The split is currently "worktree when the kernel runs
git, clone when a model does." Under a posture that treats the model as a
careful developer rather than untrusted code, that distinction stops earning
its cost, and collapsing to one workspace primitive is simpler to reason about
and to document.

## Outcome

Build and review workers are provisioned with `git worktree add` into a path
outside the repository (keep `%TEMP%`, so worker file operations stay away
from the primary checkout), replacing `addIsolatedClone`.

Two cheap knobs come with it, both worktree-local so they cannot affect the
operator's own git behavior:

1. **`gc.auto=0`** in the worker workspace. This is the one genuine technical
   hazard rather than a security one: automatic garbage collection triggered by
   a worker, concurrent with kernel or operator git activity on the same object
   store, is a real corruption risk — and it becomes materially more likely
   once #129 runs several workers at once.
2. **Push disabled** in the worker workspace (`extensions.worktreeConfig` plus
   a worktree-scoped `remote.origin.pushurl` that cannot resolve), preserving
   the one property dropping `origin` gave us. This is hygiene, not a control —
   a worker can still `cd` elsewhere and push — so it should be documented as
   such rather than described as containment.

## Constraints

- **Do not weaken any integration control.** The review binding, the
  exact-candidate check, the tree-equality verification, and fast-forward-only
  advancement of `main` are untouched by this change and must stay untouched.
- Worktrees must be created **outside** the repository directory. Putting them
  under `.trellis/worktrees/` (where kernel-owned worktrees live) would place
  agent-written files inside the primary checkout.
- Worktree bookkeeping must be cleaned up on every path — `git worktree
  remove` plus `git worktree prune` — under the same lifetime binding #178
  established for clones. A leaked worktree is cheaper than a leaked clone but
  still leaves stale administrative entries.
- Git refuses to check out a branch already checked out in another worktree.
  The kernel creates a fresh issue branch per run, so this does not bite —
  but it must be verified, not assumed, particularly for the combined
  build+review path that reuses the builder's workspace.
- The worker-execution-posture doc must be updated in the same change: its
  "throwaway-clone isolation" mitigation becomes a worktree, and the wording
  should state plainly that this is accident containment, not attack
  prevention. That correction is worth making regardless of this issue.

## Evidence required

- Workspace creation time and disk are recorded against the measured A/B
  baseline (2.202 s → 0.729 s git creation; ~21 MB delta). No claim of
  material end-to-end savings is made or required — that is #188's outcome.
- A full run — build, cross-family review, integration — completes through a
  worktree workspace with the landed tree identical to the reviewed candidate.
- The correction/`--parent-run` path and the standalone `--stage review` path
  both work.
- `gc.auto=0` and the push block are set in the worker workspace and **not**
  in the operator's repository config.
- Every terminal path removes the worktree and prunes its administrative
  entry, including failure and recovery paths (the #178 regression pattern).
- `npm test --workspace @ivy/trellis`, `npm run typecheck`.

## Relations

- `docs/design-docs/trellis/security/worker-execution-posture.md` — the decided
  posture this argues from; updated by this issue.
- #178 — bound clone lifetimes after the 25 GB leak; this reduces what leaking
  costs in the first place.
- #129 — parallel execution; worktree-per-worker is the standard mechanism and
  this makes it affordable.
- #184 — the adjacent integration-drift relaxation; both concern how workspaces
  and `main` relate, and both should land before #129.
- #104 — the server migration is the posture's planned point to reclaim real
  containment at the OS layer, which is where genuine attack prevention comes
  from. This change is aligned with that end state rather than against it:
  inside a container, the workspace mechanism is a pure cost question.

## Work log

- 2026-07-26 — Filed from chat (session 00000010) after the operator challenged the
  clone choice directly. The driving session had defended clones on
  threat-model grounds in the preceding message; re-reading the posture doc
  showed that defense was an overstatement the doc itself does not make. Left
  at `idea`: this changes a security-adjacent mechanism recorded in a decided
  posture doc, so it wants the operator's explicit approval even though the reasoning
  follows from what he already decided.
- 2026-07-26 — **The operator approved in chat** ("Yes all good, do that"), admitted to
  `ready`. His approval covers the worktree switch, the two worktree-local
  settings (`gc.auto=0` and the push block), and the posture-doc wording
  correction, which rides in this change rather than being done separately.
- 2026-07-26 — Two review rounds have already found real defects. A fresh
  builder must treat both as regressions to cover, not as a to-do list:
  1. Run `ce0c8f20`: the push block overrode only `remote.origin.pushurl`.
     Worktrees inherit `remote.pushDefault` and any other remotes from shared
     config — reproduced in a scratch repo with `remote.pushDefault=upstream`
     and `push.default=current`, where the candidate's exact config sequence
     left origin disabled but `git push --dry-run` selected `upstream` and
     succeeded. Override default push *selection*, or disable every inherited
     push target, and add a non-origin `pushDefault` regression test.
  2. Run `8d82980b`: `git.ts:288` called `addWorktree` **before** entering its
     cleanup `try`. A reproduced checkout-time failure (a required failing
     smudge filter) made `git worktree add` exit 128; git removed the workspace
     and its registration but left the newly created issue branch behind, and
     `WorkerWorkspaceLifetime` is only constructed after
     `addWorkerWorktree` succeeds, so terminal cleanup could not remove it.
     Put creation under cleanup coverage — or delete the branch when worktree
     creation fails — with a regression test. This is the same leak class #178
     fixed for clones, so do not reintroduce it while replacing them.

  Everything else was independently checked and passed both rounds: lifecycle,
  archival, cleanup, the correction path, standalone review, and integration.
- 2026-07-26 — Dispatched fresh rather than as a correction. The correction
  path could not replay: the rejected candidate edits the build-stage text in
  `docs/design-docs/trellis/engine/pipeline.md`, which now conflicts with the
  LIFO tie-break paragraph committed in `0518b4f`. A fresh build reads the
  current file and edits around it. #184's outcome 3 (resolve conflicts instead
  of rebuilding) is the durable fix for exactly this.
- 2026-07-26 — Round 3 (`95bd9ac0`) rejected for one stale doc line (the flow
  map still said "isolated clone"); round 4 (`a698d3d2`) implemented everything
  correctly and was rejected because the issue's own cost premise was false —
  the reviewer's A/B measurement is now folded into Why. the operator chose option
  **(c)**: correct the premise, keep the change on the posture/consistency
  rationale, and file #188 for the real cost (`npm ci`). Re-admitted; the next
  round is a correction of `a698d3d2`, whose implementation already passes —
  it needs the flow-map line and re-review against the corrected premise, not
  new code.
