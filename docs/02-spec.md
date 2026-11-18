# 02 — Specification: Mihak

**Source of truth.** The agent asks questions; the engineer decides. Every requirement has a source (a person, a document, or a decision recorded in `docs/adr/`). Anything without a source moves to §7 Assumptions.

**Reading time target:** ten minutes for a human, every session for an agent. This is not a fifty-page document.

---

## 1. Goal and problem

The goal is an honest, repeatable comparison of language models on **cost, latency, and explainable quality**. The problem is that anecdotal comparison hides the trade-off: a model that costs more may not answer better, and a score without evidence cannot be trusted.

Success is the observable state in [`docs/01-brief.md`](01-brief.md): one ranked table with three numbers and a per-case explanation behind every score.

## 2. Users and roles

| Role | Capability in v0.1 | Not in v0.1 |
|---|---|---|
| Evaluator | Paste or upload `.txt`/`.md` cases, select ≥2 models, start and poll a run | Accounts, sharing, billing |
| Reviewer | Read the ranked table and open the per-case drawer | Manual score override |
| Provider operator | Add a live provider, encrypt its key, run a connection test | Team permissions, key rotation UI |

## 3. Scope: must / should / could / will not build now

### Must

- **The system must** accept a case set with an expected answer and judge it with a declared three-dimension rubric.
- **The system must** execute every case against every selected model in a background queue and expose progress.
- **The system must** report cost as an integer number of micro-USD from an immutable price snapshot.
- **The system must** report latency in milliseconds measured per call.
- **The system must** score each successful call 1–5 from the three rubric dimensions and keep the evidence for the drawer.
- **The system must** rank models and show a per-case explanation in Arabic and English.
- **The system must** keep a run immutable once it reaches a terminal state.

### Should

- The system should show `missing_price`, `judge_error`, and `timed_out` explicitly instead of hiding them behind an average.
- The system should exclude a model from ranking when fewer than half of its calls are complete, while keeping its numbers visible.
- The system should recover stale runs when a worker dies.

### Could

- The system could expose a provider connection test before saving a live key (S4).
- The system could render a five-minute demo script and a backup video (S5).

### Will not build now

Automatic retries and 429 backoff · hard budget caps · Server-Sent Events, cancellation, resume · regression detection · CSV/JSONL export · image input · human review · charts · accounts, teams, sharing. Any addition here requires a v0.1.1 issue, never a sprint addition.

## 4. Stories and acceptance criteria

Story form: **As a [role] I want [capability] so that [value].** The `so that` clause is mandatory — without it the story is a task, not a story.

Acceptance form: **Given [initial state], when [action], then [observable result].** Every story has one happy path and at least two unhappy paths. Test names carry the AC number (`ac_4_2_...`) so traceability is automatic.

### ST-1 — Input a case set (issues #9, S1-4)

As an **evaluator** I want to paste cases or upload a `.txt`/`.md` file **so that** every model is judged on identical input.

| AC | Given | When | Then |
|---|---|---|---|
| AC-1.1 | A valid case set with expected answers | I submit it and choose two models | A run is created with one snapshot of the cases and a `queued` status |
| AC-1.2 | A file with no cases or an invalid shape | I submit it | `validation_error` is returned and no run is created |
| AC-1.3 | A file above the size limit | I submit it | `payload_too_large` is returned with the limit stated |

### ST-2 — Execute and watch a run (issues #7, #8, #10)

As an **evaluator** I want the work to happen in a queue with visible progress **so that** I can leave the page and come back.

| AC | Given | When | Then |
|---|---|---|---|
| AC-2.1 | A queued run | The worker claims it | Status becomes `running` and `completedCalls` increases |
| AC-2.2 | A selected model returns late | Its call exceeds 30 seconds | The call is `timed_out`, no retry occurs, the run continues |
| AC-2.3 | A worker dies mid-run | I poll the run again | The run is recovered by stale-run recovery and reaches a terminal state |

### ST-3 — Judge against the rubric (issues #11, #12)

As an **evaluator** I want every successful answer judged against the declared rubric **so that** quality is comparable rather than a matter of taste.

| AC | Given | When | Then |
|---|---|---|---|
| AC-3.1 | A successful call and a rubric | The judge returns three dimensions | A `Verdict` is persisted with score 1–5 and the three dimensions |
| AC-3.2 | The judge returns invalid JSON | The judge is called a second time | A second invalid result becomes `judge_error`; no third call is made |
| AC-3.3 | A dimension is absent | The verdict is parsed | That dimension is `null`, never defaulted to 3 |

### ST-4 — Compare and rank (issues #13, #14, #15) — the most important story

As an **evaluator** I want one table with cost, latency, score, and rank **so that** I can decide which model gives the best answer per dollar.

| Scenario | Given | When | Then |
|---|---|---|---|
| Happy path | A `finished` run with two fully scored models | I open the results page | Both rows show integer µUSD cost, ms latency, score 1–5, and a rank; the higher score is rank 1 |
| Unhappy 1 — missing price | One selected model has no active price | I try to create the run | `missing_price` is returned before the run is queued; no fabricated cost appears |
| Unhappy 2 — broken judge | A model's judge result fails twice | Results are requested | That cell reads `judge_error`, the run is still `finished`, and the gap stays visible in the table |
| Unhappy 3 — insufficient data | A model has fewer than 50% complete calls | Results are requested | Its numbers stay visible but it is excluded from `ranking` and the recommendation |

### ST-5 — Explain a score (issue #16)

As a **reviewer** I want to open any score per case **so that** I can see why the model got that score.

| AC | Given | When | Then |
|---|---|---|---|
| AC-5.1 | A scored call | I open the drawer for that case | Output, expected answer, three dimensions, cost, and latency are shown |
| AC-5.2 | The `ar` locale is active | I open the drawer | Text is Arabic, layout is RTL, and no hardcoded string appears |
| AC-5.3 | The `en` locale is active | I open the same drawer | Text is English and the numbers are unchanged |

## 5. Non-functional requirements (metric, threshold, condition)

| Attribute | Metric and limit | Measurement condition |
|---|---|---|
| Responsiveness | Results API p95 < 500 ms | Local Postgres, 2 models × 20 cases, after the run is terminal |
| Cost accuracy | 100% of displayed costs equal the integer µUSD stored in the price snapshot | Unit test over every call of a finished run |
| Throughput | A 20-case × 2-model fake-provider run finishes in < 2 minutes | Local Docker, default worker concurrency |
| Bilingual completeness | 100% of user-visible strings exist in both `ar` and `en` with matching placeholders | `check-i18n` passes on the same PR that adds a string |
| Reliability | 0 unhandled errors in a 10-run smoke sequence | End-to-end smoke test on staging in S5 |

No "fast", "easy", or "appropriate" appears without a number beside it.

## 6. Constraints and business rules

**Five requirement types used here:** functional (what it does), non-functional (how it performs), constraint (what is imposed on us), business rule (what the domain says), assumption (what is not yet verified).

### Constraints

| Constraint | Source |
|---|---|
| 20 h/week, every day, 6 sprints × 7 days, 16 h planned + 4 h buffer each | Owner decision, `docs/planning/sprint-plan.md` |
| pnpm monorepo, Node 20, React + Vite + TS + Tailwind, NestJS + Prisma + Postgres 16, Redis 7 + BullMQ, Zod | Owner decision — the EchoGrow stack, copied literally |
| One developer, WIP 1 with a hard maximum of 2 | Solo adaptation |
| Public repository; no secrets in Git; token outside the repo | Owner decision, 2026-11-12 |
| No product code before issue #1; API contract frozen before the first screen | `docs/planning/api-contract.md` |
| Merge commits only, PRs to `dev`, release PRs to `main` | `docs/planning/github-setup.md` |

### Business rules

| Rule | Enforced where |
|---|---|
| At least two models per run | API validation → `no_models` |
| Costs are integer µUSD, snapshotted at run creation | Prisma schema + Zod + `missing_price` check |
| Score is the mean of available dimensions, rounded to one decimal, 1–5 | Zod schema + scoring unit test |
| A missing dimension is `null`, never 3 | Zod schema + parser test |
| A call times out after 30 seconds; no retries | Worker adapter config |
| Invalid judge JSON gets exactly one retry, then `judge_error` | Worker + test |
| Partial failure does not fail the run | Run state machine |
| A run is immutable after a terminal state | API → `run_immutable` |
| All timestamps are UTC | Shared formatter |

## 7. Assumptions and open questions

**Assumptions (not verified, treat as risks):**

- A fake provider can supply deterministic outputs and token counts for the demo.
- A judge model is reachable through the same provider interface as the models under test.
- Prices can be expressed as integer µUSD for every selected model.
- One evaluator works at a time; no concurrency between users.

**Open questions (a sign of maturity, not of weakness):**

- Tie-break rule: when two scores are equal, does cost decide rank? Needs a decision before S2-5.
- Is "latency" wall-clock per call or provider-reported? Needs a decision before S1-3.
- Which staging platform? Deferred to S5-2; the local production compose comes first.
- Should the reviewer be able to export the explanation? Currently out of scope.

## 8. Glossary

The authoritative glossary with code names is [`docs/03-domain.md`](03-domain.md). Use those names in identifiers; do not invent synonyms.

## Save checklist (before this file is considered done)

- [x] Every story explains `so that`.
- [x] The most important story has at least two unhappy paths (it has three).
- [x] No "appropriate", "easy", or "fast" without a number.
- [x] "Will not build now" is written explicitly.
- [x] Assumptions are separate from requirements.
