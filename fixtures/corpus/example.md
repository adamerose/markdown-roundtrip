---
description: When reporting on, auditing, or setting up Trellis project structure
---

# Process vs Content

Trellis is the process layer. Project content lives inside the structure it creates. Don't conflate them.

**Process layer** (Trellis owns these): `docs/DESIGN.md`, `docs/GLOSSARY.md`, `docs/FEEDBACK.md`, `docs/design/`, `docs/milestones/`, `docs/tasks/`, `.out-of-scope/`, `CLAUDE.md`, `.claude/settings.json` — the structural scaffolding.

**Project content** (the project owns these): the actual design docs inside `docs/design/`, the actual milestones and tasks, the actual code. A design doc about authentication is project content even though it lives in a Trellis directory.

When reporting on Trellis structure (setup, migration, audits), only reference structural files. Don't list project content as if it's part of the framework.
