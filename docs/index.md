# Docs index — read this first, open only what the task needs

This file is the pointer from `AGENTS.md` to the rest of the repository's memory. Do not load every document into a session; open the row that matches the task.

| File | Read it when |
|---|---|
| [`01-brief.md`](01-brief.md) | You need the problem, the users, the success signal, or the scope boundary |
| [`02-spec.md`](02-spec.md) | You implement or change a story — acceptance criteria live here |
| [`03-domain.md`](03-domain.md) | You name anything, or touch states, invariants, or business rules |
| [`04-architecture.md`](04-architecture.md) | You add a module, cross a module boundary, or change a container |
| [`adr/`](adr/) | You want to change structure, storage, a provider port, or a dependency. ADR-0001 is accepted; supersede, never edit |
| [`prompts.md`](prompts.md) | You start a new agent session or need one of the lecture prompts |
| [`context-order.md`](context-order.md) | You assemble what to send to an agent and in what order |
| [`progress.md`](progress.md) | You start or finish a session on the current story — read first, update last |
| [`lessons.md`](lessons.md) | A mistake repeats, or you need to know whether an old lesson is still true |
| [`review-checklist.md`](review-checklist.md) | You review a diff, before reading the code |
| [`evals/tasks.md`](../evals/tasks.md) | You change the context and need to measure the effect |
| [`planning/api-contract.md`](planning/api-contract.md) | You touch an endpoint, a schema, an error code, or the mock |
| [`planning/sprint-plan.md`](planning/sprint-plan.md) | You plan work, check capacity, DoR/DoD, risks, or the critical path |
| [`planning/backlog.md`](planning/backlog.md) | You need the exact issue text, hours, labels, or dependencies |
| [`planning/github-setup.md`](planning/github-setup.md) | You change labels, milestones, branch protection, or the board |
| [`journal/`](journal/) | You need the three-line daily record or the sprint recap |
| `docs/repo-map.md` | You need to find where something lives. **Generated**, not hand-edited; created after source files exist |

## The three-link chain

```
AGENTS.md  →  docs/index.md  →  the one document this task needs
```

A rules file that lists every document defeats the purpose: it floods the window. Keep the index short, keep documents specific, and regenerate the repo map instead of describing the folder tree by hand.

## Lecture origin

| Lecture | Artifacts it prescribed | Where they are |
|---|---|---|
| 1 — From Understanding AI to Modern Software Engineering | No repository files; concepts and worksheets in the trainee guide | Principles folded into `AGENTS.md` and `review-checklist.md` |
| 2 — From Idea to Structure | `01-brief.md`, `02-spec.md`, `03-domain.md`, `04-architecture.md`, `adr/0001-….md`, `AGENTS.md` | This repository |
| 3 — Code Engineering with AI | `AGENTS.md` rules, contract-first workflow, review checklist, i18n conventions | `AGENTS.md`, `review-checklist.md`, `prompts.md` |
| 4 — Context Engineering | `index.md`, `context-order.md`, `progress.md`, `lessons.md`, `evals/tasks.md`, `CLAUDE.md` | This repository |

`src/` and `tests/` are Workshop 4 outputs and are deliberately absent: product code starts with issue #1.
