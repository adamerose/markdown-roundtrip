---
name: issue-report
origin: trellis
role: driver
description: Read all open issues and publish an HTML report showing recommended work order and a value-vs-risk chart. [Trellis]
disable-model-invocation: true
policy:
  allow_implicit_invocation: false
---

# Issue report

Publish one self-contained HTML snapshot of the current Trellis backlog. The
user supplies no arguments. This is a read-only, on-demand lens: it does not
score issues, edit frontmatter, schedule recurrence, notify anyone, or replace
the standing roadmap.

Base directory: resolve `generate.mjs` relative to this `SKILL.md`.

## Procedure

1. Resolve the current repository root with `git rev-parse --show-toplevel`.
   Stop with the failing path when `docs/issues/open/` is absent or the issue
   store cannot be parsed. Node 22 or newer is a hard dependency.
2. Read every open issue before classifying markers. Use the intended change
   described by the title, opening description, Outcome, Constraints, and
   Evidence required; incidental references in Relations or Work log do not
   make an issue a restart or stop point.
   - A **daemon restart** issue is expected to change a path under `apps/`.
   - An **orchestrator stop** issue changes the `/autonomy` skill, the accepted
     Trellis CLI surface, or carrier context loaded into a running session.
   An issue may carry both markers. Do not infer either marker merely because
   its prose explains these definitions.
3. Run the generator's self-checking entry point:

   `node "<base>/generate.mjs" --check --repo "<repository-root>" --restart-ids "<comma-separated ids or none>" --stop-ids "<comma-separated ids or none>"`

   These are invocation-derived judgments, not maintained inputs. The
   generator rereads `docs/issues/`, `.trellis/roadmap.json`, and
   `.trellis/run.json` itself. It joins the active run to its issue by ID; the
   issue remains in the `ready` stored status while its run stage is shown as a
   separate annotation. Never create a scores file, ordering file, or marker
   registry.
4. Read the JSON validation summary printed by the generator. Success requires
   `check.status` to be `passed`; the check rereads the published file, parses
   its embedded report data, proves every open issue occurs once in the flow
   and scatter, and verifies both **Execution flow** and
   **Value × risk** are present. Do not write a separate parser. A
   missing or stale roadmap is not failure: the artifact must label its
   dependency/priority fallback. Missing value or risk is shown in the
   artifact's unscored band rather than silently invented.
5. Publish or attach the reported HTML path with the runtime's file/artifact
   presentation primitive. When none is available, return the clickable local
   path as the result. Do not split the two views into separate artifacts.

If generation fails, publish no partial artifact. Report the exact parse or
filesystem error and the source path that must be corrected.
