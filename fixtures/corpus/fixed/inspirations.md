# Inspirations

The projects Trellis studies at file level. Clones live in `inspiration/` (gitignored — restore any of them with the clone URLs below). This doc deliberately stays thin: what each project is, why it's here, and its load-bearing decisions — *their* stances, which stale slowly. Trellis-side positioning lives in [competition.md](competition.md); idea-by-idea adoption status lives in [load-bearing-ideas.md](load-bearing-ideas.md); point-in-time comparative analyses live in the issues that produced them (#012, #084, #089).

## Matt Pocock's skills

`git clone https://github.com/mattpocock/skills matt-pocock-skills` — ~160k stars. Trellis's direct ancestor: `/grill`, `/diagnose`, `/prototype`, `/improve-codebase-architecture`, and the Domain Terms system all descend from it. Load-bearing decisions: tracker-abstracted tickets (adapter config seeded by setup; the local adapter is one markdown file per ticket with `Status:`/`Blocked by:` text lines); tracer-bullet vertical slices sized to one context window; human-in-the-loop planning vs AFK implementation as the primary cut; Wayfinder maps work too big for one session as typed, blocking-edged child tickets on a shared map; TDD as reference material rather than procedure; descriptive tone that leans on agent priors (e.g. invoking Fowler smells by name).

## Superpowers

`git clone https://github.com/obra/superpowers` — Jesse Vincent's skills framework, distributed via the official Claude Code plugin marketplace with per-harness packages. Load-bearing decisions: one fresh subagent per task with artifacts handed off as files, never pasted text; dated specs/plans with 2–5-minute fully-specified task steps (no issue tracker); absolutist TDD and verification rules pressure-tested against observed agent rationalizations (the rationalization tables are engineering, not rhetoric); a single ~60-line bootstrap skill injected per session, everything else pull-loaded; explicit model tiering per subagent seat.

## Parable

`git clone https://github.com/SamBWarren/parable` — small (15 stars) but studied for substance: Fable's working discipline distilled into skills + hooks for Opus/Sonnet, with an experimental harness (seeded bugs, firewalled agents, adjudicated ensembles) behind every claim. Load-bearing decisions: rules decay within long runs, so a ~300-word rule card is re-injected at every prompt and every 5 minutes of tool activity; "naming a check is not running it" — every claim needs pasted command output; deliberation goes to a thoughts file outside the repo, the transcript carries only conclusions; director/worker/coordinator seats with cheap models in well-briefed implementation seats behind a stronger-model review gate; disagreement between firewalled agents is signal (ensembles found 6/6 seeded defects vs 4/6 solo); no work tracking at all.

## spec-kit

`git clone https://github.com/github/spec-kit` — ~119k stars, GitHub's Spec-Driven Development toolkit and the field-defining spec-first pipeline. Load-bearing decisions: the unit of work is a feature directory (`specs/NNN-slug/`) accumulating spec → plan → tasks documents through a fixed command sequence; tasks are strict-format checkboxes (`T001 [P] [US1] …`) traceable to requirement IDs; verification gates the *documents*, not the code (requirements checklists, cross-artifact consistency analysis, a constitution whose violations are non-negotiable); a registry-driven CLI emits each of 30+ agents' native command format; hard template mandates softened by numeric quotas.

## get-shit-done (GSD)

`git clone https://github.com/gsd-build/get-shit-done` — ~64k stars at clone time; after a governance break the project continues as open-gsd/gsd-core. The closest project to Trellis in medium: a pure-markdown process layer for Claude Code with explicit context-economics focus. Load-bearing decisions: the unit of work is a phase (`.planning/phases/NN-slug/`) with one plan file per task and a `STATE.md` resume point for fresh sessions; layered blocking gates (plan-checker loop, decision-coverage, dependency `slopcheck`); wave-model parallel execution with fresh context per agent; *tested* context budgets (workflows fail CI if they exceed line caps) and install profiles that cut push overhead ~94%; installer targets 15 runtimes.

## ponytail

`git clone https://github.com/DietrichGebert/ponytail.git` — ~80k stars (2026-07-11), MIT, distributed to ~20 agent harnesses from one repo. A "lazy senior dev" persona: a seven-rung ladder (does it need to exist → reuse what's in the codebase → stdlib → native platform → installed dependency → one line → minimum that works) enforced on every response, with five sibling skills (`/ponytail-review`, `/ponytail-audit`, `/ponytail-debt`, `/ponytail-gain`, `/ponytail-help`). Studied as the review-time enforcement of the simplicity stance Trellis pushes at write time (deep-modules and refactoring rules). Load-bearing decisions: closed finding grammars — tagged one-liners with named replacements and a single `net: -N lines` score — instead of prose review; contrastive ❌/✅ examples that quote and ban the hedged LLM-review sentence; an explicit never-cut floor (trust-boundary validation, data-loss handling, security, accessibility, one runnable self-check) so laziness stays safe; agentic benchmarks on a real repo with published corrections of its own earlier inflated numbers.

## Design docs vs ADRs

The one per-project divergence recorded here because another doc links it: Matt's ADRs gate on being (1) hard to reverse, (2) surprising, and (3) a real trade-off — easily-reversible-but-subtle decisions fall through and their rationale is lost. Trellis design docs have no reversibility gate (any decision with meaningful alternatives gets a file) and are updated in place rather than append-only numbered records.
