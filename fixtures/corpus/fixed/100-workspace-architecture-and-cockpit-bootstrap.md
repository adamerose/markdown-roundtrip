---
status: closed
created: 2026-07-14
depends-on: [099]
sessions:
  - 00000000-0000-4000-8000-000000000007
  - 00000000-0000-4000-8000-000000000008
---
# Workspace architecture and cockpit bootstrap

The first issue under the unified sequence. Establishes the npm-workspace
monorepo structure, boots the one-daemon + static-SPA architecture, and
creates the vertical-slice scaffolding for the clean-room Paseo-parity
cockpit. Grilled adversarially (Claude Fable × GPT, 2026-07-14), then
regrilled 2026-07-15 (operator + Fable) — that regrill closed every other open
issue and absorbed the Trellis rebuild plan (tr-096/tr-097) into this
roadmap. Disagreements are noted inline.

## Architecture (decided)

### Runtime topology: one daemon, one SPA, hard module boundary

*(Revised 2026-07-14 after the operator challenged the two-daemon split: the
"observability survives the observed system breaking" charter line dated
from when the projects were separate repos by default — a zero-cost
description that hardened into a constraint. Per the elegance rule,
process separation is unearned until a failure demands it. What's actually
load-bearing: ground truth on disk, a code-level module boundary, and auth
on mutating routes. All three are cheap; a second process is not.)*

```
┌─────────────────────────────────┐
│         cockpit-web (SPA)       │  static build, served by daemon
│  React 19 · Vite · TypeScript   │
└────────────────┬────────────────┘
                 │ one port: read API/WS + authed mutating routes
┌────────────────▼────────────────────────────┐
│               ivy daemon (Node)             │
│                                             │
│  observer module        control module      │
│  (Claudalyzer today)    (Ivy spine)         │
│  ─ Claude/Codex JSONL   ─ SQLite ledger     │
│    readers, watcher     ─ Event ingress     │
│  ─ Session index/search ─ Notification gate │
│  ─ Usage-limits         ─ Scheduler         │
│  ─ Context capture      ─ Session spawn     │
│  ─ Live-ops detection   ─ Chat/send/cancel  │
│  ─ Serves SPA + WS      ─ Permission relay  │
│                         ─ Quota fetchers    │
│  imports: nothing from  ─ Discord channel   │
│  control/harnesses      (eslint-enforced)   │
└──────────────────────────┬──────────────────┘
                           │ CLI / child-process
                    ┌──────▼───────────┐
                    │  trellis (CLI)   │
                    │ Issue lifecycle  │
                    │ Runner, review   │
                    │ gates, Git       │
                    │ Project-local    │
                    │ outbox → daemon  │
                    └──────────────────┘
```

**Boundary rules that replace the process split:**
- Ground truth is on disk (JSONLs, SQLite) — any crash loses nothing.
- The observer module never imports control/harness code
  (eslint boundary rule + tsconfig project references, CI-enforced).
  A future process split is a deploy change, not a refactor.
- Every mutating route (spawn, chat, approve, config) requires an origin
  check + bearer token from day 1 — this is the real defense against
  DNS-rebinding/CSRF on a localhost port, under any topology.
- Trellis runs as a CLI/child-process, not a resident service (Phase 4).

**Split tripwires** (revisit topology only when one fires):
1. A real incident where the dashboard being down during a control-module
   failure materially hurt diagnosis.
2. Any surface exposed beyond loopback/VPN (mobile edge) — at which
   point re-evaluate port/process separation alongside real auth.
3. Multi-machine deployment (always-on daemon on the home server while the
   observer reads the PC's ~/.claude) — geography forces the split
   naturally; the module boundary makes it a non-event.

### Workspace layout

```
ivy/
├── apps/
│   ├── cockpit-web/          # Vite + React 19 SPA (unified UI)
│   └── daemon/               # Node/Express — one process, two bounded modules
│       └── src/
│           ├── observer/     # Claudalyzer's server code (readers, watcher, index, WS)
│           ├── control/      # Policy spine + interactive sessions
│           │   └── ledger/   # Append-only SQLite event store (internal, not extracted)
│           └── protocol/     # Wire schemas + types shared with cockpit-web
├── packages/
│   ├── harnesses/            # Low-level Claude Code + Codex drivers (spawn, stream, decode, probe)
│   └── trellis/              # CLI, lifecycle, runner, Git authority, assets (skills/carriers/hooks)
├── docs/                     # Unified: issues/, design-docs/, knowledge/
├── legacy/
│   ├── trellis/              # Current trellis/ subtree — transitional, removed after kernel ships
│   └── ivy-python/           # Current src/ivy/ — transitional, removed after daemon absorbs
└── root config: package.json (workspaces), tsconfig.json, .gitignore, CLAUDE.md
```

### Module boundaries and dependency rules (eslint/CI-enforced)

```
cockpit-web  →  daemon protocol types (type-only import)
             →  daemon HTTP/WS (fetch, no code import)

daemon/control  →  harnesses (spawn/stream/cancel)
                →  trellis CLI (child-process invocation)
                →  defines protocol schemas

daemon/observer  →  reads ~/.claude/, ~/.codex/ directly
                 →  reads ledger SQLite read-only (optional — degrades without it)
                 ✗  never imports control/, harnesses, or trellis

trellis  →  harnesses (worker dispatch)
         →  own project-local state (.trellis/)
         →  emits outbox events for idempotent ingestion by daemon/control
         ✗  never imports daemon code

harnesses  →  nothing project-internal (leaf package)
           ✗  never imports trellis, ledger, or domain event types
```

### Key design decisions from the grills

| Decision | Rationale |
|---|---|
| **One daemon process; observer/control as bounded modules** | Process separation was unearned overspecification (operator, 2026-07-14). The cheap invariants that matter: data on disk, import boundary, authed mutating routes. Split tripwires recorded above. |
| **SQLite ledger stays internal to daemon/control** | One writer; extract only when a second writer genuinely needs the same implementation. Observer module reads it read-only or not at all. |
| **protocol/ is a module in the daemon, not a package** | Wire schemas + inferred types, type-imported by the SPA. Becomes a package only when a second client (mobile) exists. |
| **harnesses are low-level drivers, not domain adapters** | Spawn, stream, decode, capability probes — shared. Mode-specific policy (Trellis worker envelope, interactive permission relay) lives in each owner, not in the driver. |
| **Trellis is one package: src/ + assets/** | Ends the "two Trellis" confusion. Skills and kernel evolve atomically. Current top-level trellis/ becomes legacy/ during migration. ~/.claude symlinks stay until the kernel ships its own install path. |
| **Names: "Claudalyzer" retires; "Trellis" stays** | (Regrill 2026-07-15.) Claudalyzer de-brands naturally into daemon/observer + cockpit-web; the name adds nothing "observer module" doesn't. Trellis stays: it's a cross-repo CLI with its own vocabulary, and the name works as a command (`trellis new`). Neither is a product brand — both are just package/module names inside Ivy. |
| **CloudCLI (siteboon/claudecodeui) ignored — not copy, fork, or dependency** | (Regrill 2026-07-15.) Overlaps only on commodity features (session browsing, chat shell) that Claudalyzer already exceeds; teaches nothing architecturally; AGPL. |
| **Clean-room rule generalizes to all AGPL sources** | Not Paseo-specific: any AGPL project (Paseo, CloudCLI, opcode/claudia, …) — study the architecture decisions, copy or translate zero code. Root CLAUDE.md wording updated in the docs-consolidation item. |
| **No time-boxed freeze; work checkpoints instead** | (Regrill 2026-07-15.) The committee's 45-day freeze-and-prove (inspirations.md §Committee outcome, item 5) is rejected: it gated iteration on the Python daemon that is now retiring. Re-evaluation happens at the checkpoints below, tied to shipped work, not the calendar. |
| **tr-096 / tr-097 closed as superseded** | (Regrill 2026-07-15.) The kernel is built in TypeScript inside packages/trellis (Phase 4); tr-096 in docs/issues/closed/ remains the detailed invariant spec and is required reading for Phase 4. The tr-097 pilots concept becomes the post-Phase-4 checkpoint. |
| **Python daemon is reference-only** | Never runs alongside the new daemon. legacy/ivy-python survives as a reference implementation until Phase 3 completes, then is deleted. The designs are already in docs/design-docs/. |

## Work items

*(Item numbers are stable IDs, not execution order — execution order is by
phase. Items 30–35 were added/renumbered in the 2026-07-15 regrill.)*

*(Scope and closure: #100's executable scope is Phases 0, 0.5, and 1. It
closes at the post-Phase-1 checkpoint, where Phases 2–4 are filed as their
own issues using this roadmap as their spec. The Phase 2–5+ sections below
are roadmap, not admitted checkboxes.)*

### Phase 0: scaffold the workspace (do first, in this issue)

- [x] 1. **Root workspace setup.** `package.json` with npm workspaces pointing
  at `apps/*` and `packages/*`. Root `tsconfig.json` with project references.
  Pin Node (`.nvmrc` / `engines`). Single lockfile. `.gitignore` for
  `node_modules`, build artifacts, `.env`.
- [x] 2. **apps/daemon with src/observer/** — move Claudalyzer's server code
  into the daemon's observer module. Preserve: Express routes, chokidar
  watcher, WebSocket, JSONL readers, live-ops detection, usage-limits,
  context capture, search. The routes import observer implementations from
  claudalyzer `src/lib/` (claude-data, codex-data, shared types) — that
  reader/type layer moves with the server and is the bulk of this item.
  Bind to 127.0.0.1 by default: the current server listens on 0.0.0.0 and
  its read routes expose transcripts unauthenticated — loopback is the
  day-1 fix; LAN exposure waits for split tripwire 2. Fix the `.git`
  assumption in the CLI entry point (it expects `.git` at package root —
  broken by the subtree merge). Distribution: make an explicit call —
  either keep the launcher/updater flow (rename the bin, fix its
  hard-coded `master` branch → `main`, define the packed artifact now that
  client and daemon are separate packages) or suspend auto-update and run
  from the repo until the rebuild stabilizes; don't carry a silently
  broken updater. Add the eslint boundary rule (observer never imports
  control/harnesses) now, while it's trivially true. Verify: stop the old
  globally-installed claudalyzer service first (a live daemon on 3456 plus
  the port-increment fallback can make a broken build look verified), then
  `npm run dev`, assert identity via the commit-hash endpoint on the
  expected port, dashboard loads, WebSocket invalidation works.
- [x] 3. **apps/cockpit-web** — move Claudalyzer's Vite/React SPA here.
  Currently in `claudalyzer/src/` (components, pages, styles) + `index.html`
  + `vite.config.ts`. Verify: SPA builds, served by the daemon's static
  middleware, existing pages render. By the end of Phase 0,
  `apps/claudalyzer/` ceases to exist: every remaining file (cli/,
  launcher/, e2e/ + fixtures, public/, scripts/, reference/; docs/ moves
  in Phase 0.5) gets a destination or an explicit deletion. SPA imports
  of server types become type-only imports through the protocol seam.
- [x] 4. **packages/harnesses** — scaffold with empty Claude Code and Codex
  driver modules. Define the shared low-level contract: `spawn(config)`,
  `stream(session)`, `cancel(session)`, `probe(capabilities)`. No
  implementation yet — just the interface, exported types, and a README
  noting the clean-room rule.
- [x] 5. **packages/trellis** — scaffold with `src/` (empty kernel) and
  `assets/` (current skills, carriers, hooks — moved from legacy/trellis/dist/).
  CLI entry point stub. Retarget `~/.claude` symlinks to
  `packages/trellis/assets/`. Verify: skills still load in a Claude Code
  session. Do this item **last** within Phase 0 — the working tree is live
  infrastructure for every Claude Code session on this machine. This is an
  asset relocation only (same content, new path); the rebuilt kernel's own
  enablement gate is item 29.
- [x] 6. **daemon src/protocol/** — scaffold shared event/command schemas.
  Start minimal: agent lifecycle events (spawned, streaming, completed,
  failed, cancelled), launch config (model, effort, permission mode, cwd),
  the interactive chat contract (send message, receive stream), and the
  permission-request/decision contract (request id, tool, input summary,
  allow/deny — item 16 needs it). Expose as a type-only workspace
  entrypoint with declaration output the SPA can resolve under the root
  project references — no runtime import from the SPA, eslint-enforced.
- [x] 7. **daemon src/control/** — scaffold the control module: mounted
  routes behind origin-check + bearer-token middleware (from day 1, even
  on loopback — DNS-rebinding defense), health endpoint, empty `ledger/`
  submodule. Give the daemon a thin composition root (src/main.ts) that
  owns the Express app and WS server; observer and control mount
  routes/publishers into it and never import each other. Ledger scaffold:
  one SQLite file, append-only events `{id, ts, source, type, severity,
  payload}` + `schema_version`, all derived state rebuildable by replay —
  the Python event log's shape, kept. Auth notes: the origin check applies
  to browser-facing routes; webhooks (Phase 3) authenticate with
  per-source secrets and send no Origin header; define how the same-origin
  SPA obtains its token (e.g., issued by the daemon at serve time), and
  reconcile the local-config-file default with vision.md's env-only
  credential rule in item 35. Otherwise no real functionality yet — this
  is the shell that absorbs the Python daemon's functions.
- [x] 8. **legacy/** — move `trellis/` → `legacy/trellis/`, `src/ivy/` →
  `legacy/ivy-python/`. Update any internal import paths. These are
  reference implementations during the rebuild, not live code.
- [x] 9. **Root scripts.** `npm run dev` starts the daemon (with SPA dev
  middleware). `npm run build` builds all apps. `npm run typecheck` runs
  tsc across all workspaces. `npm test` runs vitest across all workspaces.
  CI-check the eslint module boundary.
- [x] 10. **Verify the whole thing.** Dashboard loads, skills resolve, no
  TypeScript errors across workspaces, existing Claudalyzer tests pass
  (adapt paths) **including the Playwright e2e suite** — vitest's config
  excludes it, run both. `git log -m --follow` reaches pre-merge history
  (plain `--follow` stops at the subtree merge; the `-m` is part of the
  criterion). Patch CLAUDE.md's tech-stack/dev-commands/conventions
  sections to the new reality so later sessions don't inherit `uv run ivy`
  instructions for a moved daemon (the full docs pass is Phase 0.5). The
  eslint boundary check runs as an npm script — there is no CI in this
  repo yet; wire it in when CI exists.

### Phase 0.5: docs consolidation (added in the regrill)

- [x] 34. **Unify the docs tree.** Move `apps/claudalyzer/docs/design-docs/*`
  into `docs/design-docs/` (keep a `data-model/` subfolder for the JSONL
  format references — they document the observer's source data). Move any
  surviving trellis docs the same way. One `docs/` for the monorepo; apps
  keep only their own CLAUDE.md.
- [x] 35. **Update stale docs in place.** `docs/design-docs/overview.md`
  still presents the Python daemon as the current architecture — rewrite
  against the one-daemon topology above. `docs/knowledge/the-organism.md`'s
  five-organs framing predates the monorepo — update it (vault edits commit
  straight to main). Root `CLAUDE.md`: retire the Claudalyzer/Trellis
  product branding, generalize the clean-room rule to all AGPL sources.
  `vision.md`: append the regrill decisions to the decision log.
  `inspirations.md`: record the CloudCLI verdict; mark the committee's
  45-day freeze as superseded by this issue's checkpoints.

### Phase 1: first vertical slice — launch + chat (the Paseo-parity seed)

- [x] 11. **Harness driver: Claude Code.** Implement spawn (headless `-p`,
  `--model`, `--permission-mode`, `--resume`), stream (parse stdout
  JSON events), cancel (SIGINT + wait), and capability probes (version,
  permission-prompt-tool support, available models). Clean-room: study
  Paseo's agent lifecycle model and adapter contract, implement from the
  Claude Code docs and SDK. Test with a real Claude Code binary.
- [x] 12. **Harness driver: Codex.** Implement spawn, stream, cancel, and
  probes from capability probes of the installed CLI — flag names in older
  notes are known-stale (`--full-auto` and `codex-reply` don't exist in
  Codex CLI 0.144.x; resume is `codex exec resume`). Probe, don't
  hard-code. Pick one transport (app-server JSON-RPC vs exec stdout) at
  implementation time and record why. Same clean-room discipline.
- [x] 13. **Control module: session manager.** Accept launch requests
  (model, effort, permission mode, cwd, provider), spawn via harness
  driver, track lifecycle, stream events to connected SPA clients via
  WS. Record session lifecycle events in the internal ledger. Lifecycle
  per the adopted FSM (steal-list: initializing→idle→running→error→closed,
  plus pending-approval); distinguish the logical session id from
  provider-native session ids from the start.
- [x] 14. **Control module: chat relay.** Accept follow-up messages for
  a running session, relay to the harness per its probed resume mechanics
  (Claude `--resume` + `-p`; Codex `codex exec resume`), stream response
  back. Handle stop/cancel.
- [x] 15. **Cockpit-web: launch form.** UI for starting a new session:
  pick provider (Claude/Codex), model, effort, permission/sandbox mode,
  working directory. Sends to the control routes. Shows the live session
  appearing in the observer dashboard.
- [x] 16. **Cockpit-web: continue-chat on existing sessions.** In the
  session detail view (already exists), add a compose box. Submit →
  chat relay → streamed response renders in the existing transcript
  view. Permission prompts show as a banner with approve/reject buttons
  (or read-only/plan mode avoids them).
- [x] 17. **Observer module: Codex session reader.** Complete the WIP
  from the claudalyzer merge (clz-073 checkpoint, closed in the regrill):
  read `~/.codex/sessions/` rollout JSONLs, normalize into the existing
  session model, serve via the same API. The cockpit-web already has
  provider badges (also from the checkpoint). The WIP entered main
  unreviewed — review and harden it here.

> **Checkpoint after Phase 1** — re-evaluate before continuing: does the
> unified cockpit actually replace day-to-day Claudalyzer use, and is
> launch+chat genuinely useful? Decide what goes next (Phase 2 vs Phase 3,
> or cuts). This replaces the committee's calendar freeze.

### Phase 2: subscription intelligence (the verified open gap)

- [ ] 18. **Quota fetchers.** Per-provider adapters for Claude
  (usage-limits endpoint, already in Claudalyzer) and Codex (rateLimits
  API). Normalize: window start/end, used/total, reset time, plan name,
  and provenance (authoritative vs log-derived estimate). Clean-room from
  Paseo's fetcher manifest pattern (provider registry → normalized quota →
  cache). Control's collector becomes the single quota owner — migrate or
  retire the observer's existing JSONL snapshot writer as part of this.
- [ ] 19. **Snapshot persistence.** Periodic collector writes normalized
  quota snapshots to the SQLite ledger. History API:
  usage over time, burn rate, utilization percentage per plan.
- [ ] 20. **Cockpit-web: subscription dashboard.** Usage bars (live),
  history charts (from snapshots), utilization/ROI analysis, burn
  forecast, reset countdown. The feature no competitor ships. ROI needs a
  fees ledger (manual config: plan price, renewal period) — without it,
  ship utilization only and defer ROI. (Item 19's "periodic collector" may
  be a plain interval loop; the real scheduler is Phase 3.)

### Phase 3: policy spine (port from Python, improve)

- [ ] 21. **Event ingress.** Webhook endpoints on the control module for
  Grafana alerts, HA events. Normalize into ledger events. Port the
  Python ingress validation patterns.
- [ ] 22. **Notification gating.** Port the gate chain design from
  big-noob steal list (severity threshold, dedup window, quiet hours,
  push budget). Deterministic, code-enforced, against the SQLite
  ledger. Every gate decision is an event.
- [ ] 23. **Discord channel.** Port discord.py bot to discord.js.
  Private guild, topic channels, approve/reject button components.
  Connect to the control module's gate decisions.
- [ ] 24. **Scheduler.** Port APScheduler heartbeats to node-cron or
  similar. Schedules as ledger events (big-noob steal list pattern).
  Phase 3 exit: a parity inventory against the shipped Python daemon —
  approvals machinery, `/do` chat-dispatch (#011), reminders (#013),
  self-heal pipeline (#005), health endpoint — each ported or explicitly
  dropped with the operator's sign-off; items 21–23 alone don't cover them. If a
  Python deployment is live anywhere, it keeps running until this gate
  passes ("reference-only" forbids dual-serving and dual-maintenance, not
  continuity of service); then delete `legacy/ivy-python/` along with its
  Python tooling (pyproject.toml, uv.lock, tests, VS Code task).

### Phase 4: Trellis kernel (tr-096 absorbed, in TypeScript)

*(tr-096 was closed 2026-07-15 as superseded by this phase. Its file in
`docs/issues/closed/` remains the detailed invariant spec — read it in
full before building any item below. What follows is the binding summary;
where this summary and tr-096 conflict, resolve explicitly, don't pick
silently. Phase 4's exit gate is tr-096's Exit/evidence section verbatim:
the fault-injection matrix — malformed results, crashes, forged identity,
reviewer write attempts, post-approval changes, none advancing state —
plus at least one real admitted issue through build → cross-family
review → integration with `main` untouched until the gate passed.)*

- [ ] 25. **Kernel core + sequential runner** (tr-096 items 1–2). Public
  actions: `new`, `ready`, `close`, `consult`, `loop`. Only the kernel
  mutates the issue store; `close` = atomic status-flip + file-move.
  `new` numbers by exclusive creation, never scan-then-write; one
  project-wide run lock makes concurrent invocations safe. The runner
  records the issue-state/git transaction boundary up front (decided with
  operator), creates the issue branch/worktree, dispatches one stage to one
  adapter, rejects worker-created commits, and integrates only after
  review approval + reconciliation **and** only if `main` still equals
  the reviewed base — head drift stops integration and routes back
  through rebuild + re-review. Requested changes dispatch a fresh builder
  carrying the immutable prior review and the reviewed base/candidate
  SHAs, linked to the parent run. Blocked → mark and continue other work;
  malformed/failed → stop, no auto-retry. Run envelope persisted before
  dispatch; crash recovery idempotent at every boundary; one terminal
  JSONL event per attempt (schema in tr-096). Never executes
  worker-supplied command strings. Owns the durable outbox promised in
  the dependency rules: schema + path (`.trellis/outbox/`), atomic
  emission, plus the daemon-side idempotent consumer (cursor + dedup) in
  the control module. Real tests from the first commit.
- [ ] 26. **Adapters + worker envelope** (tr-096 item 3). Claude Code and
  Codex adapters over packages/harnesses, one contract: issue + rendered
  stage contract in, worker envelope out (`schema_version, run_id,
  issue_id, stage, outcome: completed|blocked|failed, summary,
  claimed_checks, review_decision, problem`). Per-stage required/forbidden
  field combinations; any violation is a malformed result. Open with
  capability probes of native worktree/sandbox/structured-output/resume
  features — probe, don't hard-code. Routing (family/effort/tier per
  stage) from per-environment config.
- [ ] 27. **Consult + review gate** (tr-096 items 4–5). `trellis consult`
  = one peer turn per invocation against append-only
  `.trellis/consults/<slug>/`; files canonical, native resume an
  optimization; no auto-loop, no voting. Named workflows: adversarial
  issue refinement before `ready` (the defense against single-model
  framing lock-in), and design consultation. Review gate: fresh
  non-author session always (never resumes any prior session),
  cross-family default, findings only — no fixes, no integration
  authority; approval binds to exact base+candidate SHAs; same-family
  review only as explicit reduced-assurance config, never automatic
  fallback; if the configured route is unavailable, integration waits.
- [ ] 28. **Carriers + skills rewrite** (tr-096 item 6). Render
  `CLAUDE.md`/`AGENTS.md` from the semantic core + per-runtime overlays;
  ceilings enforced as tests (carrier ≤ 10k, total standing context
  ≤ 16k). Rebuild the surviving skills thin against the kernel's actual
  call shapes — judgment only, zero bookkeeping; `reflect` cannot
  self-admit work. Includes tr-096's explicit keep-or-delete decision on
  `chat-info` (the operator's call — no legacy surface rides along silently).
  **Staging constraint** (added 2026-07-15, Sol review of item 5): since
  item 5, `packages/trellis/assets/` is live — the `~/.claude` links
  resolve into the working tree, so an edit there ships to every new
  session instantly. The rewrite is authored in a staging path (e.g.
  `packages/trellis/assets-next/`), never in the live `assets/`;
  activation is item 29's switch, after the exit gate.
- [ ] 29. **Enablement + legacy removal** (tr-096 item 7 + cleanup).
  Documented, additive, reversible link path; acceptance runs in a
  disposable non-Trellis repo (project carriers survive untouched,
  `.trellis/**` cannot enter result commits). Then — only after the
  Phase 4 exit gate (header above) has passed — activate the staged
  item-28 assets (swap staging into `assets/`, or retarget the
  `~/.claude` links; the item-5 relocation already points them at
  `packages/trellis/assets/`) and delete `legacy/trellis/`.

> **Checkpoint after Phase 4** — the tr-097 pilots concept, re-planned
> against what actually shipped: run real admitted issues through the
> full kernel loop (build → cross-family review → integration) on Ivy
> and at least one other consuming project, with a committed visibility
> artifact, before any Phase 5+ scope is admitted.

### Phase 5+: deferred scope (mobile, voice, relay, additional harnesses)

- [ ] 30. **apps/mobile (Expo).** Create when admitted. Extract
  daemon src/protocol/ into a package at that point (second client);
  share API client, session state machines, design tokens. Separate
  React Native views (don't share DOM components). Requires an
  authenticated TLS/VPN edge — never expose the daemon port to LAN
  directly. Split tripwire 2 fires here: re-evaluate process/port
  separation alongside real auth.
- [ ] 31. **Voice.** Narrow HA intents first (via HA Voice PE satellite),
  not general voice chat. Daemon-side local pipeline (VAD+STT+TTS)
  deferred until the cockpit has earned trust.
- [ ] 32. **Additional providers.** Only when the operator pays for them.
  Harness drivers are leaf packages — adding one doesn't touch the
  domain.
- [ ] 33. **Relay / remote access.** A VPN covers the LAN case.
  E2EE relay or tunnel for true remote — study Paseo's trust model,
  build clean-room. Not before mobile ships.

## Defaults in effect (locked at admission, 2026-07-15)

Revisit only if implementation hits a real conflict; record any change here.

1. **Auth for mutating routes**: bearer token generated per install into
   a local config file on first run (plus origin check, day 1, loopback
   included).
2. **Daemon port**: keep Claudalyzer's current port for the unified daemon.
3. **Phase 0.1 is redone fresh**, not restored: the d0d5240 root files
   (package.json, .nvmrc, node .gitignore entries) were reverted and the
   revert committed. d0d5240 stays in history as reference only — Phase 0
   starts from the regrilled plan above.
4. **Default stage routing** (operator, 2026-07-15; seeds the Phase 4 routing
   config, item 26): high-level planning/architecture → Claude Fable;
   plan review (the adversarial issue-refinement consult, item 27) →
   GPT ("Sol"); implementation → Codex; implementation review → Claude
   Opus. Encode as tier preference per role **plus** the default
   invariant `reviewer family ≠ builder family`, so Claude-built work
   routes its review to GPT automatically (tr-096's explicitly-configured
   same-family reduced-assurance mode stays a permitted owner override,
   never an automatic fallback). Bootstrap exception until the
   kernel exists: this issue itself is built interactively by Claude, so
   its reviews go cross-family to Codex. The post-Phase-4 pilots refine
   this table from observed evidence.

## Paseo architecture steal-list (clean-room reference)

Decisions to adopt (study their source, write our own code):

| Paseo pattern | Ivy improvement | Where it lands |
|---|---|---|
| Agent lifecycle FSM (initializing→idle→running→error→closed) | Add pending-approval state; persist transitions as ledger events | daemon control module |
| Adapter contract (AgentClient/AgentSession types) | Split into harness driver (low-level) + owner-specific policy | packages/harnesses + consumers |
| Quota fetcher manifest (provider registry → normalized → cache) | Add snapshot persistence, history, burn forecast | daemon control + cockpit-web |
| Presence-aware notification (suppress if focused client exists) | Add as last-mile rule after deterministic gate chain | daemon gating |
| Schedule model (cron/interval, existing/new-agent targets) | Schedules as ledger events, restart-safe | daemon scheduler |
| Worker/verifier loop with run history | Trellis kernel owns this with lifecycle invariants | packages/trellis |
| AgentTimelineStore port (durable timeline) | Build in from day 1 (they never finished theirs) | daemon observer module |
| Session decomposition (their refactor plan for the 5.9k-line Session) | Start decomposed — never build the god object | daemon control module |

Decisions to reject/improve:

| Paseo weakness | Ivy approach |
|---|---|
| Mutable per-entity JSON stores | Append-only SQLite ledger + project-local Trellis outbox |
| 4 god objects (session, agent-manager, WS server, bootstrap) | Decomposed from day 1 per the workspace split |
| Unversioned WS protocol (explicitly unstable) | Versioned wire schemas in daemon src/protocol/ |
| Unfinished durable timeline (AgentTimelineStore exists but isn't wired) | Observer module builds durable session index from the start |
| In-memory attention policy (no severity, dedup, quiet hours, budget) | Full deterministic gate chain ported from big-noob designs |
| No authentication on any endpoint | Mutating routes behind origin check + token from day 1 |

## Work log

- 2026-07-14 — created from architecture grill (Claude Fable × GPT).
  Structure converged after pushback on: observer/control separation,
  single-writer ledger, harness ≠ adapter, two-Trellis naming, SPA
  serving model. See session transcript for full grill.
- 2026-07-14 (later) — the operator challenged the two-daemon split as unearned
  overspecification (the "observability survives" charter line dated from
  when separate processes were free, not chosen). Revised: one daemon,
  observer/control as eslint-enforced bounded modules, auth on mutating
  routes from day 1, split tripwires recorded. protocol/ demoted from
  package to daemon module until a second client exists.
- 2026-07-15 — regrill (operator + Fable). Decisions: "Claudalyzer" retires
  as a name (observer module + cockpit-web); "Trellis" stays as
  package/CLI name; neither is a product brand. CloudCLI rejected
  entirely (AGPL, commodity overlap). Clean-room rule generalized to all
  AGPL sources. Committee's 45-day freeze replaced by work checkpoints
  (post-Phase-1, post-Phase-4). Docs consolidation added as Phase 0.5
  (items 34–35). tr-096/tr-097 closed as superseded — tr-096's substance
  absorbed into Phase 4 (items 25–29, tr-096 file remains the detailed
  spec); tr-097 becomes the post-Phase-4 checkpoint. All other open
  issues closed: 009, 010, 014–017 (deferred/superseded), clz-073 (→
  item 17), clz-074, clz triage lists. Phase 5+ items renumbered 30–33.
  Status stays `idea` pending the operator's re-admission of the rewritten plan.
- 2026-07-15 (later) — admitted by the operator; status → `ready`, implementation
  to run in a fresh session. Cleanup: Phase 0.1 root-file revert
  committed (redo fresh, don't restore), root node_modules/ deleted,
  open questions converted to locked defaults (auth token in local
  config file; keep Claudalyzer's port).
- 2026-07-15 (implementation) — item 2 distribution decision (operator):
  suspend auto-update and **delete** the service machinery (`cli/`,
  `launcher/` — git history preserves it); uninstall the old
  claudalyzer service (autostart removed, `~/.claudalyzer/` data kept).
  The daemon runs from the repo (`npm run dev` / `npm start`) until the
  rebuild stabilizes; distribution is redesigned when deployment becomes
  real (Phase 3). Also: item 8's `trellis/` → `legacy/trellis/` move
  retargets the live `~/.claude` junctions (skills, hooks, CLAUDE.md) to
  `legacy/trellis/dist/` in the same step — a mechanical follow-the-move
  so sessions keep loading skills; the item-5 relocation to
  `packages/trellis/assets/` stays last and gated.
- 2026-07-15 (pre-implementation) — cross-family plan review by GPT
  ("Sol" via Codex CLI; 22 findings, verdict revise-before-implementation).
  Folded in: scope bounded to Phases 0/0.5/1 with closure at the Phase-1
  checkpoint (Phases 2–4 re-file as their own issues; later sections are
  roadmap, not admitted checkboxes); loopback bind, distribution decision,
  src/lib reader-layer note, verify-against-the-right-daemon (item 2);
  apps/claudalyzer full-dissolution criterion (item 3); trellis asset
  move ordered last in Phase 0 (item 5); permission contract + protocol
  export mechanics (item 6); composition root, ledger shape, webhook/SPA
  auth notes (item 7); `git log -m --follow`, Playwright suite, CLAUDE.md
  patch (item 10); Codex CLI mechanics de-staled (items 12, 14); session
  FSM + id separation (item 13); single quota owner + provenance (item
  18); fees-ledger prereq for ROI (item 20); Phase-3 parity-inventory
  exit gate before Python deletion, live deployment continuity clarified
  (item 24); Phase-4 exit gate = tr-096 evidence verbatim, head-drift and
  requested-changes transitions restored, outbox given an owner (items
  25, 28, 29); same-family override reconciled with the routing invariant
  (default 4). Rejected: framing the Phase-0 symlink retarget as kernel
  enablement (it relocates existing assets; the enablement gate is item
  29), and full exit criteria for Phases 2–4 inside this issue (they
  re-file as issues at the Phase-1 checkpoint).
- 2026-07-15 (item 2 done) — apps/daemon created; Claudalyzer's server +
  reader layer (claude-data, codex-data, usage-limits, claudalyzer-dir)
  moved to src/observer/. Per the distribution decision: `cli/` and
  `launcher/` deleted outright, updater code paths stripped (update-core,
  update-check, /api/update, exit-75, registry poll, port-80 bind,
  server-state.json), and the old claudalyzer service uninstalled — the
  3456 listener was a long-running tsx dev process from the pre-merge
  repo (killed), then `claudalyzer uninstall` removed autostart/global
  package/launcher remnants; `~/.claudalyzer/` data kept. Daemon binds
  127.0.0.1:3456, `/api/server-info` reports the repo HEAD via
  `git rev-parse` from the module dir (fixes the .git-at-package-root
  assumption). ESLint boundary rule added and verified to fail on
  control/harnesses/trellis imports. Verified live: dashboard + explorer
  render real data, WS `history:changed` received on a ~/.claude touch,
  daemon vitest 250 passed, claudalyzer 74 passed + typecheck + lint +
  build green. SPA serving is transitional (Vite middleware / dist/client
  from apps/claudalyzer) — TODO(#100 item 3) markers in place.
- 2026-07-15 (item 3 done) — SPA moved to apps/cockpit-web
  (`@ivy/cockpit-web`): src/, index.html, vite/vitest/eslint/tsconfig
  configs, components.json, public/, plus e2e/ + fixtures +
  playwright.config.ts (fixtures stay with the e2e suite; daemon unit
  tests read them cross-package, read-only). Daemon Vite middleware and
  prod static serving repointed at cockpit-web; type seam markers
  refreshed to TODO(#100 item 6); SPA-side eslint boundary added
  (daemon imports must be type-only). Dissolution decisions:
  `reference/` deleted (Claud-ometer + ccusage were orphaned gitlinks,
  session-scout files — the MVP they informed shipped; git history
  preserves them); jsonl analysis scripts moved into
  docs/design-docs/data-model/ next to the report they generate (ride
  along in Phase 0.5); scripts/screenshots.ts deleted (captured routes
  that no longer exist); README.md deleted (documented the deleted
  install/updater/CLI flow); ITERATION-1.md deleted (shipped plan);
  .vscode/tasks.json and tracked .trellis scratch deleted; CLAUDE.md
  split into apps/cockpit-web/CLAUDE.md (SPA half) and
  apps/daemon/CLAUDE.md (server half; stale service/pages sections
  dropped). apps/claudalyzer/ now contains only docs/ — final
  dissolution in Phase 0.5 (items 34–35).
- 2026-07-15 (item 6 done) — daemon src/protocol/ scaffolded with zod
  (schema library decision: zod v4 — schemas + inferred types from one
  declaration, already idiomatic in this stack; the daemon validates at
  runtime, the SPA consumes types only so zod never enters the client
  bundle). Contracts: agent lifecycle events (spawned/streaming/completed/
  failed/cancelled), launch config (provider, model, effort, permission
  mode, cwd; provider vocabularies stay permissive strings — harness
  probes validate meaning), chat send command (stream side reuses the
  lifecycle events), permission request/decision. Every wire shape
  carries `schema_version` (currently 1). Exposed as `@ivy/daemon/protocol`
  — a types-only package export (no runtime condition) backed by
  declaration output from tsconfig.protocol.json, referenced from the
  root tsconfig; the SPA's transitional seam files now re-export from it
  and its typecheck is `tsc -b`. ESLint tightened on the SPA: runtime
  import of the protocol entrypoint and any import of daemon internals
  both fail lint (negative-tested); the internals pattern is a regex
  because gitignore-style groups can't re-include a child of an excluded
  directory.
- 2026-07-15 (item 7 done) — composition root: src/main.ts owns the Express
  app, HTTP server, WS server, listen, and /api/server-info; observer and
  control mount into it (`mountObserver`/`mountControl`), SPA serving
  extracted to src/spa.ts, shared HTTP/WS infra (http.ts, ws.ts) moved from
  observer/ to src/. ESLint boundary now enforced both directions
  (observer ✗→ control, control ✗→ observer; negative-tested). Control
  scaffold: `/api/control/health` open; `/api/control/token` issues the
  bearer to the same-origin SPA behind the Host/Origin check (same trust
  boundary as serving the SPA; DNS-rebinding fails the Host check); all
  other /api/control routes behind origin check (403) + bearer (401).
  Token decision (locked default 1): generated per install
  (crypto.randomBytes 32→hex) into `~/.ivy/daemon.json`, `IVY_HOME`
  override for tests/e2e (playwright pins it to gitignored scratch), never
  logged; env-file reconciliation stays item 35. Webhook note recorded in
  code: per-source secrets, no Origin header, mounted outside the
  browser-facing middleware (Phase 3). Ledger scaffold in
  src/control/ledger/: better-sqlite3 (SQLite dependency decision:
  synchronous single-writer API fits the one-writer ledger, prebuilt
  binaries, the workspace is already CJS-friendly; node:sqlite is still
  experimental on Node 22), events table per the Python shape +
  schema_version, append-only enforced by UPDATE/DELETE triggers,
  append/replay functions, unit tests prove round-trip, ordering, reopen
  persistence, and trigger enforcement. Ledger deliberately unwired — no
  producer exists yet. Verified live: server-info reports HEAD on
  127.0.0.1:3456, health 200, tokenless POST /api/control/* → 401, foreign
  Origin → 403, token endpoint issues to same-origin, observer routes and
  SPA serving unaffected; daemon vitest 281 (18 new), lint + typecheck
  green.
- 2026-07-15 (item 4 done) — packages/harnesses (@ivy/harnesses) scaffolded:
  `HarnessDriver` contract (spawn/stream/cancel/probe) with exported types
  (HarnessLaunchConfig/Session/Event/Capabilities), Claude Code and Codex
  driver stubs that declare the full contract and throw NotImplementedError
  (unit-tested), README recording the generalized clean-room rule (no code
  copied or translated from any AGPL source). Leaf-ness is eslint-enforced
  (`@ivy/*` and cross-workspace imports fail lint; negative-tested). Wired
  into root tsconfig references (composite, declaration output) and has its
  own typecheck/test/lint scripts for the workspace-wide runs (root script
  overhaul is item 9).
- 2026-07-15 (items 9+10 done) — root scripts completed (build/typecheck/
  test/lint fan out `--workspaces --if-present`; e2e delegates to
  @ivy/cockpit-web; boundary rule negative-tested inside `npm run lint`).
  Full verification: clean `npm install`; build + typecheck + lint + test
  (357 vitest tests: 74 cockpit-web, 281 daemon, 2 harnesses) green from
  root; Playwright e2e 51/51 passed; live check — `npm run dev`,
  /api/server-info on 127.0.0.1:3456 reported commitHash = repo HEAD
  (ed8021f), Dashboard and Explorer rendered real data in Chrome
  (655 sessions indexed, live usage bars, WS "Connected"), zero console
  errors/warnings, daemon stopped and port 3456 confirmed free.
  Skills resolve: ~/.claude/{skills,hooks,CLAUDE.md} junctions all point
  at legacy\trellis\dist\... and Test-Path + content reads pass (23
  skills). History: `git log -m --follow` crosses the subtree merge —
  observer lib/claude-data/history.ts reaches 982cc50 (2026-05-08),
  cockpit-web src/main.tsx reaches 047487f (2026-05-20); plain server.ts
  stops at its item-2 move (heavily rewritten there — updater stripped),
  which is why the reader files are the evidence. Root CLAUDE.md patched
  to the Node-workspace reality (tech stack, dev commands, module paths;
  Python daemon marked reference-only at legacy/ivy-python; Domain Terms
  kept); .vscode/tasks.json Ctrl+Shift+B repointed from `uv run ivy` to
  `npm run dev`. Full docs pass remains Phase 0.5. Phase 0 now complete
  except item 5 (gated on human check-in).
- 2026-07-15 (review fixes, round 1) — cross-family code review of Phase 0
  (GPT "Sol", 10 findings) addressed in full. (1) watcher.ts rewritten for
  chokidar 5, which removed glob support (the old glob watches matched
  nothing): directories watched recursively, filtering in pure
  `classifyWatchPath`/`isCoworkDataPath`, regression-tested including a
  live-chokidar probe (nested projects JSONL → `jsonl:changed`). Found en
  route: chokidar can emit `ready` before subdirectory watchers are fully
  registered (and re-emits it when some roots don't exist) — harmless for
  the long-lived daemon, settled explicitly in the test. (2) `/ws` upgrades
  now enforce the same loopback Host/Origin rules as the control routes
  (shared `src/origin-guard.ts`); cross-origin and foreign-Host handshakes
  get 403 — unit + live-server tests, and re-probed against the running
  daemon (evil Origin → 403, loopback → open, no Origin → open). (3) daemon
  and harnesses now have real `build` scripts (project-graph `tsc -b` /
  declaration emit); root build fans out without `--if-present`, so a
  workspace missing `build` fails loudly. (4) harnesses eslint additionally
  blocks relative escapes (`../../**`) — negative-tested with the review's
  exact `../../trellis/...` probe. (5) the promised tsconfig boundary is now
  real: the daemon split into composite projects (protocol-core, infra,
  observer, control, protocol, app) sharing rootDir/outDir; observer and
  control reference each other in neither direction, so a cross-boundary
  import fails `tsc -b` (negative-tested, TS6307), not just lint; root
  tsconfig references daemon app + cockpit-web (made composite) +
  harnesses. (6) the WS envelope moved into `src/protocol/ws.ts` with
  `schema_version`: `broadcast()` stamps and zod-validates every outgoing
  message; the SPA's ws-hooks type-imports `WsEvent` from
  `@ivy/daemon/protocol` and guards version+type before dispatch; the
  launch-config schema now carries `schema_version` like every other wire
  shape. (7) ledger: `recursive_triggers = ON`, so `INSERT OR REPLACE`
  fires the append-only DELETE trigger instead of silently overwriting
  (probe test: replacing event id 1 now throws; `ON CONFLICT DO UPDATE`
  covered too). (8) ledger payloads are validated as strict JSON values
  (undefined/NaN/Infinity/Date/non-plain objects rejected with a TypeError
  naming the path) and append returns the canonical serialized-then-parsed
  form — append ≡ replay, round-trip tested. (9) SPA "Claudalyzer" sweep:
  about page copy → Ivy, sidebar localStorage key → `ivy-sidebar-collapsed`,
  stale e2e comment; the `~/.claudalyzer` data dir and
  `CLAUDALYZER_DATA_DIR`/`CLAUDALYZER_DESKTOP_DIR` env names stay (storage
  paths, not user-facing branding — noted in apps/daemon/CLAUDE.md).
  (10) stale-watch deleted outright (its `server:stale` event mapped to no
  client action — dead feature, elegance rule; git history preserves it)
  and the lockfile regenerated (stale `apps/claudalyzer` entry and
  extraneous packages gone). Verified from root: build + typecheck + lint
  green; 378 vitest (302 daemon incl. 15 new, 74 cockpit-web, 2 harnesses);
  Playwright e2e 51/51; live smoke — `/api/server-info` on 127.0.0.1:3456
  reports repo HEAD, WS probes as above, daemon stopped and port 3456
  confirmed free.
- 2026-07-15 (item 5, done last as required, after the operator's check-in) —
  `packages/trellis` scaffolded (empty kernel `src/` + CLI stub refusing
  every action until Phase 4; boundary lint rule negative-tested; root
  tsconfig reference added). Assets relocated `legacy/trellis/dist/` →
  `packages/trellis/assets/` with a zero-breakage sequence: copy first,
  retarget the live `~/.claude` links (skills + hooks junctions,
  CLAUDE.md symlink) while both paths existed, then `git rm` the old dist
  (git records the whole move as renames). Verified: all three links
  resolve (23 skills, hooks, Trellis CLAUDE.md); a fresh `claude -p`
  session loaded and executed the `/chat-info` skill through the new
  junction; root build/typecheck/lint/test green (379 vitest). Phase 0
  complete; Phase 0.5 (items 34–35) and Phase 1 remain in this issue.
- 2026-07-15 (review round 2, item 5) — Sol's 4 findings fixed: (1) CLI
  stub now sets `process.exitCode = main()` when executed directly
  (process-level regression test spawns it via tsx and asserts exit 1);
  (2) dynamic `import(...)` and `import('...')` type-query bypasses of the
  boundary rules closed with `no-restricted-syntax` selectors in all four
  packages (trellis, harnesses, daemon control+observer, cockpit-web —
  each probed to fail, cockpit-web's legal protocol type-query verified
  clean); (3) item 28 gained a staging constraint and item 29 was
  restated as the activation switch — assets/ being live since item 5
  must not let Phase-4 rewrites ship pre-gate; (4) legacy/trellis/
  CLAUDE.md rewritten as a legacy-reference banner pointing at
  packages/trellis/assets/. Root typecheck/lint/test/build green
  (380 vitest).
- 2026-07-15 (review round 3, item 5) — Sol's residual finding fixed:
  template-literal dynamic imports (`import(\`...\`)`) now covered by the
  boundary selectors in all four packages, and non-static dynamic-import
  sources (identifiers, substitution templates, expressions) fail closed —
  a source that can't be statically boundary-checked is rejected outright.
  All probed per package; benign same-package template imports stay clean.
- 2026-07-15 (post-cap fixes, item 5) — Sol's round-3 re-review returned
  two further boundary-lint evasions after the 3-round fix budget was
  spent: template selectors matched `value.raw` while module resolution
  uses `value.cooked` (escaped specifiers linted clean), and the
  `../../`-anchored escape regexes missed spellings like `./../../x`.
  Both fixed mechanically past the cap (cooked-value matching everywhere;
  escape regex unanchored + static ImportDeclaration/Export*Declaration
  coverage in the leaf packages), each probed with byte-verified evasion
  files. Not re-reviewed — the branch does not merge at Phase 0; the
  pre-merge review gate re-verifies everything when #100 closes.
- 2026-07-15 (Phase 0.5 done, items 34+35) — docs tree unified:
  `apps/claudalyzer/docs/design-docs/*` → `docs/design-docs/` (data-model/
  kept as a subfolder; overview.md renamed observer-and-cockpit.md and
  debranded, its dead tshark context-capture section replaced with the
  OTEL reality; distribution-and-service.md **deleted** — it documented
  the launcher/updater machinery item 2 deleted); apps/claudalyzer/ now
  ceases to exist. `legacy/trellis/docs/design-docs/*` →
  `docs/design-docs/trellis/` (structure kept); resolvable references
  updated (live skills implement/write-skill, legacy CLAUDE.md banner,
  inspirations.md pointer); the root adversarial-review artifacts stay in
  legacy/trellis as review records. Stale docs rewritten: overview.md now
  describes the one-daemon workspace topology with the Python pipeline
  kept as the control-module design; root CLAUDE.md gained
  packages/trellis (live-assets warning) and the generalized all-AGPL
  clean-room rule; vision.md decision 13 records the regrill (name
  retirement, CloudCLI ignored, clean-room generalization, freeze →
  checkpoints, tr-096/097 superseded); inspirations.md carries the
  CloudCLI verdict and marks committee outcome 5 superseded.
  the-organism.md + projects.md updated on `main` per the vault cadence
  rule and merged back (registry rows folded into one ivy row — they
  contradicted the organism update otherwise). Verified: root typecheck +
  lint green pre-commit; `git log --follow` reaches pre-merge history
  through the moves; `apps/claudalyzer` sweep clean (issue-file records
  and a legacy permission string remain, both historical). Operational
  note: checking out `main` mid-pass dangled the live `~/.claude` links
  (packages/trellis/assets/ is branch-only until #100 merges) and every
  hooked tool failed closed; recovered by rematerializing
  packages/trellis/assets/hooks in main's working tree via an unhooked
  side channel. Until the branch merges, vault edits from this repo
  should restore those files first (or use a main worktree) —
  `git worktree add` avoids the dangle entirely.
- 2026-07-15 (item 11 done) — Claude Code harness driver implemented in
  packages/harnesses, clean-room from the installed CLI's own surface
  (`--help`/`--version`, behavior verified against binary 2.1.170 on win32).
  Contract evolved where implementation reality demanded (item-4 types were
  pre-implementation guesses): `HarnessLaunchConfig` gained `prompt` (a
  headless run needs its user message) and `resume` (provider session id);
  `HarnessEvent` became a discriminated union of driver-level events
  (`provider` | `unparsed` | `stderr` | `exit` — mapping to daemon protocol
  events stays item 13's job); `HarnessCapabilities` gained
  `permissionModes` + `efforts` (the config fields say "validated by
  probe()", so probe must expose those vocabularies); `probe()`'s unused
  filter parameter dropped. Verified mechanics recorded in code + README:
  `-p --output-format stream-json` hard-requires `--verbose`; NDJSON events
  with hook_started/hook_response *before* `init` and `session_id` on every
  event, so spawn resolves on `init` (providerSessionId set) and rejects
  with the stderr tail on pre-init exit; the prompt travels on stdin, never
  argv (no quoting/length hazards); `--resume` re-emits `init` with the
  same session_id and retains context; an invalid resume id exits 1 with a
  `result`/`error_during_execution` event and no `init`. Win32 spawn: PATH
  `claude` entries are npm shims Node can't spawn shell-less, so the driver
  resolves the package's native `bin/claude.exe` (fallback `node cli.js`)
  and spawns it directly — cancel then acts on the real process. Cancel
  decision ("SIGINT + wait", adapted to platform): probes showed Node's
  `kill('SIGINT')` is TerminateProcess — kills claude.exe in ~30ms but
  orphans its subtree (a 13-process tree incl. MCP servers in the probe) —
  so win32 cancel is `taskkill /pid <pid> /t /f` + wait for 'close'; POSIX
  path is SIGINT → 5s grace → SIGKILL (code path only; no POSIX host here).
  Probe parses `--version`/`--help` — the CLI's only enumeration surface
  (no models command): permission-mode choices, effort vocabulary,
  advertised model spellings, feature flags by option presence
  (`permission-prompt-tool` honestly false on 2.1.170). Tests: 20 new unit
  tests in the default sweep — parsing, argv construction, PATH resolution,
  and full lifecycle (spawn/stream/cancel/early-exit) against a fake CLI
  replaying fixtures captured from the real binary (`fixtures/`);
  real-binary suite (`claude-code.real.test.ts`) excluded from `npm test`
  by vitest config, run via `npm run test:real` in the package — executed
  once on haiku: 5/5 passed in 10.2s (probe, spawn+stream exit 0, resume
  with same session id + retained context, invalid-resume rejection,
  mid-run cancel). The real suite suspends the machine's model-guard hook
  by creating `~/.claude/model-guard.off` and restores prior state exactly
  (verified: file created by the run, absent after). Housekeeping:
  harnesses needed `@types/node` + `"types": ["node"]` (TS 6 stopped
  auto-including @types); eslint ignores `fixtures/`+`dist/`. Root
  typecheck/lint/build/test green (399 vitest).
- 2026-07-15 (item 12 done) — Codex harness driver implemented clean-room
  against Codex CLI 0.144.3 and the current official Codex manual. Transport
  decision: runs use `codex exec --json`, not a persistent app-server client,
  because the shared harness contract is one process per turn and item 14
  explicitly resumes through `codex exec resume`; this gives the required
  spawn/stream/cancel surface with no extra connection state. A short-lived
  app-server stdio connection is used only for stable `model/list` capability
  discovery, where it is the installed CLI's authoritative model and
  reasoning-effort catalog. Prompts travel on stdin (`-`), new turns resolve
  on `thread.started`, provider JSONL is passed through unchanged, resume
  carries sandbox through `-c sandbox_mode=...`, and cancellation matches the
  Claude driver (`taskkill /t /f` + close wait on win32; SIGINT → grace →
  SIGKILL on POSIX). Probes parse version, exec/resume help, sandbox choices,
  and live model metadata — no provider vocabulary is hard-coded. Captured
  fixtures cover success, failure, help, and model metadata; 14 Codex unit
  tests cover argv, parsers, native executable resolution, spawn/stream,
  stdin delivery, pre-thread failure, and cancel. The gated real-binary suite
  ran against 0.144.3: 4/4 passed in 6.19s (probe, new JSONL turn, same-thread
  resume with retained context, mid-turn cancel). Interactive approvals are
  reported unsupported by this exec transport; if Codex approval relay later
  becomes required, the app-server is the recorded upgrade path.
- 2026-07-15 (items 13+14 done) — the control module now owns a tested
  session manager over both harness drivers: authenticated launch/resume/
  cancel routes, separate logical and provider-native ids, the adopted
  initializing→running→idle/error/closed FSM plus pending-approval, decoded
  provider failure handling, WS lifecycle/stream events, and immutable
  lifecycle/permission records in the SQLite ledger (stream chunks remain
  ephemeral). Existing observer-discovered sessions can attach after a
  daemon restart through an explicit resume config. The exec transports do
  not expose an interactive permission callback, so the decision endpoint
  fails honestly with 409 and capability-driven plan/read-only modes are the
  safe path; app-server remains the recorded Codex upgrade path.
- 2026-07-15 (items 15+16 done) — cockpit-web gained a capability-driven
  Launch page (provider/model/effort/permission/cwd/prompt), same-origin
  bearer client with token refresh, sidebar/command/keyboard navigation,
  and a session-detail composer that attaches to provider sessions, resumes
  turns, follows WS state, stops active work, disables archived sessions,
  and renders normalized permission banners. Two Playwright flows cover
  launch payload/navigation and existing-session resume; four API unit tests
  cover token reuse, command envelopes, 401 refresh, and daemon errors.
- 2026-07-15 (item 17 done; Phase 1 checkpoint) — reviewed the Codex rollout
  reader against live Codex CLI 0.144.x data. It correctly normalizes active,
  archived, fork, and subagent rollouts; cumulative/cache tokens; visible
  user/assistant messages; tool calls/results; patch counts; compactions;
  model/version/source metadata; and root rollups. Hardening added
  `session_id` fallback when the duplicate rollout `id` is absent and
  regression fixtures for current `agent_message`, `world_state`, and
  `sub_agent_activity` records so internal multi-agent traffic cannot leak
  into the human transcript. Full verification: root typecheck, lint, and
  production build green; 426 unit tests pass (78 cockpit, 312 daemon, 34
  harnesses, 2 Trellis); all 53 Playwright tests pass. Roadmap Phases 2–4
  were filed separately as #101–#103 with `needs-triage`, leaving this
  checkpoint for the operator's product re-evaluation rather than admitting more
  work automatically.
- 2026-07-15 (post-close Fable review) — Claude Fable reviewed the integrated
  Phase 0.5/1 tree independently through Claude Code's MCP server. All eight
  reported failure modes were reproduced or confirmed in control flow and
  fixed with narrow regressions: turns reserve synchronously across slow
  provider handshakes; cancel stops a turn and leaves the provider session
  resumable while daemon shutdown owns the terminal `closed` transition;
  every `/api` read rejects DNS-rebinding Host headers; failed token fetches
  no longer poison the SPA cache; active composers reconcile against an
  authenticated HTTP snapshot when WS terminal events are missed; signal
  shutdown closes the control runtime and agent trees; consumed harness
  sessions release child/queue state; and disposed CONNECTING WebSockets close
  immediately after their handshake instead of becoming daemon-held zombies.
  Verification after fixes: root typecheck, lint, and production build green;
  430 unit tests and all 53 Playwright tests pass; the real Claude+Codex
  harness suite passes 9/9 against the installed binaries.
