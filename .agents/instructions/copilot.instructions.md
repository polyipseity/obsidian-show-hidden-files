---
name: Copilot Chat Guidelines
applyTo: "**/*"
description: Short, repo-specific Copilot / Chat assistant rules and response templates
---

# Copilot / Chat assistant — quick reference

- Read `AGENTS.md` first. This file is a concise quick-reference only — `AGENTS.md` is authoritative.
- **Do not** create `.github/copilot-instructions.md` (repo policy).

## Required response template (copy/paste)

Summary

- One-line summary explaining what changed and why.

Changed files

- `path/to/file`

Tests

- `tests/path/to/test.spec.ts` (unit/integration)

Commands to run

- `pnpm exec vitest run "tests/**/*.spec.{js,ts,mjs}" --run`
- `pnpm run check`

Notes

- Risk / impact (one line)
- Next step or question

## When to ask clarifying questions

- Ambiguous requirements or multiple valid approaches
- Changes that affect public API, settings, or localization
- No test provided for a behavioral change

Ask 1–2 focused questions and propose a recommended default.

## Memory & session notes

- Check `/memories/` before creating new entries.
- Use `/memories/session/` for short-lived conversation notes only.
- Keep entries short and specific.

## Example prompts & ideal answers (copyable)

Prompt: `Add a unit test for src/show-hidden-files.ts that reproduces a toggle bug, then implement the minimal fix and include the test.`
Ideal answer (short):

- Summary: Fix toggle bug in `show-hidden-files`.
- Changed files: `src/show-hidden-files.ts`, `tests/src/show-hidden-files.spec.ts`.
- Tests: add failing test, then fix; assert behavior.
- Commands: `pnpm exec vitest run "tests/**/*.spec.{js,ts,mjs}" --run`
- Risk: low; Next: ready for review.

Prompt: `Add a new i18n key showHidden.label, update UI to use language.value.t(...), and add a localization test.`
Ideal answer (short):

- Summary: Add translation + use in UI.
- Changed files: `assets/locales/en/translation.json`, `src/...`, `tests/assets/locales.spec.ts`.
- Tests: localization key exists & UI uses it.
- Commands: `pnpm exec vitest run tests/assets/locales.spec.ts --run`
- Risk: docs-only.

Prompt: `Refactor settings-data.fix() to normalize empty strings to defaults; add unit tests.`
Ideal answer (short):

- Summary: Add `.fix()` normalization and tests.
- Changed files: `src/settings-data.ts`, `tests/src/settings-data.spec.ts`.
- Tests: failing test added then fixed.
- Commands: `pnpm exec vitest run "tests/src/settings-data.spec.ts" --run`
- Risk: behavioral change (covered by tests).

## Refusals

- For disallowed/harmful requests reply exactly: `Sorry, I can't assist with that.`
- If a requested change would violate repo policy, refuse and provide the correct alternative.

## Quick checklist before editing code

1. Add a failing test reproducing the issue.
2. Run tests with `--run` (non-interactive).
3. Implement minimal fix and update tests.
4. Run `pnpm run check` and `pnpm run format`.
5. Add a changeset for API-impacting changes.
