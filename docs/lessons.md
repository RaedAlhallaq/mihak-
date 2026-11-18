# Lessons — long-term memory for agents and people

Each entry says what we learned, when, and **how to check it is still true**. Delete an entry when its check fails. A stale lesson is worse than none. Promote a permanent lesson into `AGENTS.md` or an automated gate.

| Date | Lesson | Still true if |
|---|---|---|
| 2026-11-12 | Milestone `due_on` must be sent as `T12:00:00Z` and compared by date only; otherwise GitHub shifts the date one day earlier | `node scripts/setup-github.mjs --dry-run` reports 0 changes after a re-run |
| 2026-11-12 | The required CI check context is exactly `ci`; renaming the job breaks branch protection | `GET /repos/RaedAlhallaq/mihak-/branches/dev/protection` lists `ci` in `required_status_checks.contexts` |
| 2026-11-12 | Branch protection with 0 approvals still requires a PR and a green `ci`; admins are not exempt | A direct ref update to `dev` is rejected (422/403) |
| 2026-11-12 | Merge commits and required linear history contradict each other; linear history is deliberately off | Branch protection reports `required_linear_history.enabled === false` |
| 2026-11-12 | GitHub Projects v2 needs the `project` scope; the Git credential token only has `gist, repo, workflow` | `node scripts/setup-project.mjs --dry-run` succeeds with the stored token |
| 2026-11-12 | WIP limit and Project workflows have no public API mutation; they are UI-only settings | Re-running `setup-project.mjs` leaves the `0 / 2` counter and workflow states intact |
| 2026-11-12 | A token pasted in chat is compromised; store it outside the repo and rotate it | `Test-Path "$env:USERPROFILE\.mihak\github-token"` is the only place a token is referenced |
| 2026-11-19 | Lectures 3 and 4 require only planning files before code; `src/` and `tests/` stay absent until issue #1 | `git ls-files src tests` is empty |
| 2026-11-19 | A written rule is a request, not a guarantee; anything non-negotiable needs a gate | The `check` command fails when the rule is broken, once the workspace exists |
