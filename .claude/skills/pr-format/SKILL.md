---
name: pr-format
description: Write or update a pull request title and description in the team's standard format (Why changes, What changes, Evidence, How to test). Use when opening a PR, when the user says "create PR", "open PR", "write PR description", or asks to fix a PR body that lacks these sections.
---

# PR format

Every PR in this repository uses the same four sections, in this order. Write everything in English.

## Template

```markdown
## Why changes
<10-20 words: the reason for the change, not a description of the code>

## What changes
- <main change 1>
- <main change 2>

## Evidence
<screenshot or GIF showing the result>

## How to test
1. <step>
2. <step>
3. <expected result>
```

## Rules

- **Why changes**: one sentence, 10-20 words. Say the problem or goal ("Players could walk through buildings, so collision needs a spatial grid"), never restate the diff.
- **What changes**: bullet list of the main parts changed, grouped by area or file. Only what a reviewer must know; skip trivial edits.
- **Evidence**: a screenshot or GIF that shows the change working. Drag it into the PR description on GitHub, or commit it under `docs/evidence/` and link it with a relative image. For changes with no visible effect (refactor, config, tests), paste the command output (test run, build) in a fenced block and say so in one line. Never leave the section empty.
- **How to test**: numbered steps, in order, that a teammate can follow from a clean checkout (install, run, what to click or run, expected result). Use the commands in `.squad/config.yml` (`commands:`).

## Steps

1. Read the diff (`git diff origin/main...HEAD`) and the commits to understand the change.
2. Fill the four sections from the template. If the Evidence image or GIF is not available, ask the user for it or capture one; do not invent a link.
3. Title: short imperative, Conventional Commits style (`feat: ...`, `fix: ...`, `chore: ...`).
4. If a task or issue exists, add `Closes #<n>` on its own line under the template.
5. Create or update with `gh pr create --title "..." --body-file <file>` or `gh pr edit <n> --body-file <file>`.

## Never

- Skip or rename a section, or reorder them.
- Exceed 20 words in Why changes.
- Merge the PR; `main` is protected and merging is the team lead's or stakeholder's call.
