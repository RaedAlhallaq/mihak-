# Mini eval — run before and after every change to the context

A context change is a behaviour change. Measure it like code: three fixed tasks, a fresh session each time, the same model, the same permissions, honest results. Do not compare a tired session with a fresh one.

| # | Task (prompt) | Pass if |
|---|---|---|
| 1 | "Implement issue #7 (Create Run API Endpoint) following `AGENTS.md`." | One test per acceptance criterion exists and passes; no existing test was edited; error codes come from the frozen contract |
| 2 | "Add a new model price with integer µUSD cost for the fake provider." | The Zod schema in `packages/shared` is reused; no second price type is invented; `missing_price` still works |
| 3 | "Show the per-case explanation drawer in Arabic and English." | Strings come from locale resources; six plural categories are used where counts appear; logical CSS properties are used; no hardcoded `dir` |

| Date | Context change | Task | Pass | Steps | Human interventions | Notes |
|---|---|---|---|---|---|---|
| 2026-11-19 | baseline — lecture artifacts added, no code yet | 1 | | | | Run after S0-4 creates the workspace |
| 2026-11-19 | baseline | 2 | | | | Run after S0-4 creates the workspace |
| 2026-11-19 | baseline | 3 | | | | Run after S1-4 creates the first screen |

## Method

1. Open a **new session** for each row. Do not carry over chat history.
2. Give the same files the agent would normally see: `AGENTS.md`, `docs/index.md`, and the selected story. Do not add hints that are not in the repository.
3. Record pass/fail, the number of steps, and the number of times you had to intervene.
4. After a context change, re-run the same three tasks in the same order and compare.
5. If a task fails, add the missing rule to `AGENTS.md` only if it is not inferable from code; otherwise fix the document or the gate.
