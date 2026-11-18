# Review checklist — ten questions for every diff

**Machine checks shape; a human checks meaning.** The machine runs the gate, a person is accountable for the merge. Run the gate first, then read the diff in the fixed order below, then answer these ten questions.

---

## Reading order (do not read file by file)

1. **Statistics** — file count and line count. Is the size reasonable for this story? Were files outside the scope touched?
2. **Tests** — one test per acceptance criterion? Does it test behaviour or repeat implementation? Was an existing test edited?
3. **Contracts and types** — do they match `docs/02-spec.md` and the frozen API contract? Are all expected failures declared as values?
4. **Domain logic** — are the invariants from `docs/03-domain.md` respected? Are names from the glossary?
5. **Adapters and integration** — database, network, files: where can this fail, and is that failure visible?
6. **Config and dependencies** — a new package? a changed setting? a secret in the code?

## The ten questions

| # | Question | Fail if |
|---|---|---|
| 1 | **Correctness** — does it satisfy every AC, including unhappy paths? | An unhappy path has no test or no behaviour |
| 2 | **Scope** — did it do only what was asked? | A feature or file outside the story was added |
| 3 | **Design** — does it respect module boundaries and ADR-0001? | A module imports another module's internals; domain imports a framework |
| 4 | **Readability** — are names from the glossary, and is every function understandable without explanation? | A synonym was invented for a glossary term |
| 5 | **Errors and edge cases** — is every error handled or rethrown? What about empty input, concurrency, and timeouts? | An error is swallowed; `null` becomes a default of 3 |
| 6 | **Security** — is every input validated? Parameterised queries? No secrets? Correct permissions? | String-concatenated SQL, a key in the repo, or an unvalidated upload |
| 7 | **Tests** — would they fail if the behaviour broke? Are they mocked down to nothing? | A tautological test or a test edited to pass |
| 8 | **Dependencies** — is a new package present, trusted, and necessary? | A package was added without asking |
| 9 | **Visible performance** — a query inside a loop? a whole table loaded into memory? | Results endpoint reads per-case data on every poll |
| 10 | **Internationalisation** — a literal string in code? a fixed LTR direction? a date without a zone? | User-visible text outside locale files, `text-align: left`, or local-time timestamps |

## Finding severity

| Degree | Meaning | Example |
|---|---|---|
| **Blocker** | Do not merge until fixed | AC-3.2 has no test |
| **Important** | Fix in this change where possible | Cost formula duplicated instead of using the shared helper |
| **Suggestion** | Optional improvement | A clearer name that matches the glossary |

## Independent reviewer

Open a fresh session without the authoring conversation. Give it the story, the acceptance criteria, `AGENTS.md`, this checklist, and the diff — not the chat history. Use the prompt in [`docs/prompts.md`](prompts.md) → "Independent reviewer". Treat its output as an extra colleague, not a replacement for the human decision.

## Feedback loop

```
review finding  ->  rule in AGENTS.md  ->  lint rule or test
swallowed error  ->  "Never swallow an error"  ->  gate fails
```

Repeat a mistake twice, add one line to `AGENTS.md`; if the rule can be checked by a machine, add it to `pnpm check` so the gate fails. Delete a rule once it is obvious from the code or fully enforced by the gate.

## Mihak-specific pre-merge line

Before merging, confirm: `node scripts/validate-plan.mjs` is green, `ci` is green, the PR names its issue with `Closes #N`, the branch targets `dev`, and no `src/`, `tests/`, or workspace file was added before issue #1.
