# List marker-width indentation

CommonMark indents a nested list by the width of its parent's marker. A bullet
parent (`- `) is 2 wide, so its children indent 2 spaces; an ordered parent
(`3. `) is 3 wide, so its children indent 3 spaces. A single document can mix
both widths, and each must round-trip at its original indent.

- Bullet parent
  - Child indented two spaces
  - Another two-space child

1. Stop coding.
2. Append a `## Replan` entry.
3. Classify:
   - **Small plan adjustment** — update the plan in place, continue.
   - **Major redesign** — set status back, exit.
   - **Cannot proceed safely** — mark blocked with rationale.
