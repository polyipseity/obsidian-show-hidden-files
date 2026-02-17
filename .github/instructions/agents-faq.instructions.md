---
name: Agents FAQ
applyTo: "**/*"
description: Short FAQ for AI coding agents working in this repository
---

# Agents — FAQ (short)

Q: I changed behavior but forgot tests — what now?
A: Add a **failing** unit or integration test that reproduces the issue, then implement the minimal fix in the same PR.

Q: Vitest behaved differently locally than CI — why?
A: Ensure you run Vitest non-interactively: `pnpm exec vitest run "tests/**/*.spec.{js,ts,mjs}" --run`. CI runs tests with the same flags.

Q: I need to add user-facing text — where do I put it?
A: Add the key to `assets/locales/en/translation.json` first and add a localization test that calls `language.value.t(...)`.

Q: Can I use `any` or `as` in TypeScript?
A: No. Use `unknown` + type guards or document and test any unavoidable casts.

Q: Where do I put Copilot/Chat-specific instructions?
A: Add them to `AGENTS.md` or `.github/instructions/` and reference `AGENTS.md`; do **not** create `.github/copilot-instructions.md`.

Q: What if a requested change violates repo policy?
A: Refuse and provide the correct alternative with implementation notes and tests.

Q: Quick checklist before creating a PR?
A: Tests → `vitest run` → code fix → `pnpm run check` → `pnpm run format` → changeset (if public API).

Q: Tests pass locally but fail in CI — what should I check?
A: Run tests non-interactively (`pnpm exec vitest run ... --run`), ensure `pnpm install --frozen-lockfile` reproduces CI deps, check Node/pnpm versions, look for environment-dependent code (timezone, locale, network), and inspect flaky tests (use `vi.useFakeTimers()` or isolate). If needed, add a deterministic test or skip with a TODO + issue.

Q: How do I add a changeset?
A: Run `pnpm changeset`, follow prompts to record type (patch/minor/major), include a short summary, commit the changeset file. Add migration notes to `README.md` if API changed.

Q: When should I open an issue instead of a PR?
A: Open an issue for ambiguous requirements, design discussions, or large-scope changes. For small, well-scoped fixes with tests, open a PR directly.

Q: How should I mark or handle flaky tests?
A: Prefer fixing flakiness first. If that's not possible, use `test.skip()` with a linked issue and add a reproducible example. Avoid permanently skipping tests—track them in an issue and remove skips when fixed.

Q: Where do I add localization tests?
A: Add assertions that `language.value.t('your.key')` returns the expected string in `tests/assets/locales.spec.ts` or a new spec under `tests/` mirroring the feature file.

Q: How to test scripts (like `obsidian-install.mjs`) safely?
A: Add integration tests under `tests/scripts/` that spawn the script in a temp dir or mock filesystem/child_process as the existing tests do (`tests/scripts/obsidian-install.test.mjs`). Assert exit code and stdout/stderr messages.

Q: What to do for breaking / public API changes?
A: Add a changeset, update README/migration notes, add unit/integration tests for new behavior, and document compatibility impact in the PR description.

Q: Security-sensitive changes — any extra steps?
A: Add tests, update `SECURITY.md` if applicable, include a short risk assessment in PR, and request a maintainer review.
