# Mihak — Sprint Plan

**Owner:** one developer · **Capacity:** 20 h/week, every day · **Start:** 2026-11-12 · **End:** 2026-12-23
**Method:** the EchoGrow system, copied literally. Only the distribution changes: sequential work by dependency, not parallel team work.

---

## 1. The commitment, in numbers

| Quantity | Value |
|---|---|
| Capacity per week | 20 h |
| Capacity per sprint (7 days) | 20 h |
| Planned work per sprint | 16 h |
| Buffer per sprint (20%) | 4 h |
| Daily average | ~2.9 h |
| Total planned effort | 96 h |
| Total calendar window | 42 days (6 × 7) |
| Issues | 30 (5 per sprint) |

The buffer is not optional and not "extra scope". It absorbs the two things that always happen to a solo developer: a migration that fights back, and a day where the day job wins.

**Rule:** if 16 h of planned issues do not fit in a 7-day sprint, the sprint is extended by whole days. Issues are never merged to make the count fit, and the buffer is never spent on new features.

---

## 2. Sprint arc

| Sprint | Dates | Theme | Goal in one sentence | Issues | Planned h | Deployable increment | Main risk |
|---|---|---|---|---|---|---|---|
| **S0** | 2026-11-12 → 11-18 | Setup and Planning | One reproducible workspace, a migrated Postgres, a live Redis worker, a frozen API contract, and green CI. | S0-1…S0-5 | 16 h | `pnpm dev` runs web + API + worker against Docker Postgres/Redis; `/health` is green; mock API answers every endpoint. | Docker/Prisma/Redis setup eats the buffer; contract drifts later. |
| **S1** | 2026-11-19 → 11-25 | Core Pipeline | Input → queued run → worker executes cases × models with the fake provider → status page polls progress. | S1-1…S1-5 | 16 h | A pasted dataset produces a finished run and a visible progress page, fully local. | Claim/heartbeat logic and partial-failure handling are subtle. |
| **S2** | 2026-11-26 → 12-02 | Core Differentiator | Judge every successful call against the rubric, persist verdicts, aggregate, and rank models on one screen. | S2-1…S2-5 | 16 h | Two models scored, ranked, and explained in a comparison table. | Judge JSON reliability and ranking edge cases. |
| **S3** | 2026-12-03 → 12-09 | Output + Polish | Make the result explainable and the app usable: per-case drawer, all states, bilingual UI, exact cost, core tests. | S3-1…S3-5 | 16 h | End-to-end usable in Arabic and English, with cost proven by tests. | Localization/RTL work is wider than it looks; parser tests need edge cases. |
| **S4** | 2026-12-10 → 12-16 | Enhancements & Business Value | Add trust and durability: encrypted keys, provider settings with a connection test, price snapshots, stale-run recovery. | S4-1…S4-5 | 16 h | A real provider can be configured from the UI and used safely. | Crypto/secret handling and provider API variance. |
| **S5** | 2026-12-17 → 12-23 | Deployment & Demo Readiness | Ship it: Docker, staging, E2E smoke, demo script, backup video, final README. | S5-1…S5-5 | 16 h | A public staging URL runs a real comparison from input to ranked table. | Deployment platform surprises; staging secrets; demo-day nerves. |

---

## 3. Critical path

What must finish first, or everything behind it stalls. The order is the dependency order, not the priority order.

| Rank | Issue | Blocks | Why it is on the critical path |
|---|---|---|---|
| 1 | **S0-1** Monorepo | S0-2, S0-3, S0-4, S0-5, everything | Nothing compiles, installs, or runs before this exists. |
| 2 | **S0-4** Shared Zod contract + mock API | S1-2, S1-4, S2-1, all frontend work | The UI is built against the mock, so screens never wait for the backend. |
| 3 | **S0-2** Prisma schema + migration | S1-1, S1-2, S4-1, S4-4 | Repositories, runs, and price snapshots all need the schema. |
| 4 | **S0-3** Redis + BullMQ worker skeleton | S1-3 | No background execution without the queue. |
| 5 | **S1-2** Create Run endpoint | S1-3, S1-5, S4-4 | The pipeline has no entry point until a run can be created. |
| 6 | **S1-3** Worker claim + execution | S2-2, S3-4, S4-5 | Produces the calls that judging, costing, and recovery consume. |
| 7 | **S2-2** Judge invocation + verdict persistence | S2-3, S5-3 | The differentiator and the results API both need verdicts. |
| 8 | **S2-3** Results aggregation API | S2-4, S2-5, S3-1 | One response feeds the table, ranking, and drawer. |
| 9 | **S2-4** Comparison table | S2-5, S3-2, S5-3 | The main screen; ranking and states build on it. |
| 10 | **S4-2** Provider settings API | S4-3, S5-1, S5-2 | Real models and the deployment both depend on it. |
| 11 | **S5-1** Dockerfiles + prod compose | S5-2 | Nothing deploys without images. |
| 12 | **S5-2** Staging deployment | S5-3, S5-4, S5-5 | The demo URL, the smoke test, and the final docs all point at it. |

**Slack rule:** if an issue on this list slips by more than one day, cut scope from the same sprint's non-critical issues first — never from the buffer, and never by starting the next sprint early.

---

## 4. Solo adaptation of the EchoGrow system

The reference system assumes a team. These are the only permitted deviations, and each one replaces a team mechanism with a personal one.

### 4.1 Sequencing

Work is ordered inside each sprint: **database/migrations → shared schemas → API → worker/AI → frontend → tests**. A frontend issue starts only when its mock or its endpoint exists.

### 4.2 WIP limit

**1 in progress, hard maximum 2** (for example, one backend issue plus one frontend issue that is already unblocked by a mock). No new issue is opened before the previous one has a PR.

### 4.3 Review replacement

There is no second reviewer, so the review is institutionalized instead:

1. CI is mandatory on every PR: typecheck, lint, test, build.
2. Self-review checklist before merging: read the diff line by line, run the manual test written in the PR, confirm README/docs are updated.
3. Branch protection on `dev`: **Require a pull request** ✅, **Require status checks** ✅, **Require approvals** ❌.
4. Merge commits only. Linear history is **disabled** — the EchoGrow instruction asks for both normal merge commits and linear history, which contradict each other. Merge commits win.

### 4.4 API contract first

`docs/planning/api-contract.md` and the mocked handlers in S0-4 are frozen before the first screen. A contract change after S0 requires a PR that updates the document, the Zod schema, and the mock in the same diff.

### 4.5 Daily sync

Pull `dev` into the feature branch every two days. If `dev` is broken by an earlier change, fix it forward with a small PR — never commit a "build fix" directly to `dev`.

### 4.6 Daily rhythm (~2.9 h)

| Block | Time | Activity |
|---|---|---|
| Open | 10 min | Read yesterday's journal, open the board, confirm today's single issue. |
| Build | 2 h | Implement, commit in small steps on the feature branch. |
| Verify | 35 min | Run the test manually, run typecheck/lint/test, update the PR. |
| Close | 15 min | Write the three-line journal entry, move the card, push. |

### 4.7 Definition of Ready

- The issue is clear and scoped to one day.
- Acceptance criteria are written and testable.
- The estimate exists in hours.
- Dependencies are closed.
- The endpoint or mock it needs already exists.

### 4.8 Definition of Done

- Code merged to `dev` through a PR.
- Tests added or updated, and CI green.
- Docs/README updated when behavior changed.
- Deployed to the staging environment, or demonstrably runnable locally if staging does not exist yet.
- The issue is closed by the PR (`Closes #N`).

---

## 5. Risks and counters

| Risk | Likelihood | Impact | Counter |
|---|---|---|---|
| Setup consumes a whole sprint | Medium | High | S0-1 and S0-2 are deliberately the first two issues; if Docker fights back, drop to a local Postgres and keep the same schema. |
| Judge output is not valid JSON | High | Medium | One retry only, then `judge_error`; the run still completes and the table shows the gap. |
| RTL/localization grows | Medium | Medium | S3-3 is a single issue with a `check-i18n` script; strings are added to resources as screens are built, not at the end. |
| Provider API differs from the fake | Medium | High | The provider adapter is small and isolated in S1-3/S4-2; the fake provider is the default in CI and demos. |
| A missed day cascades | High | Low | The 4 h buffer absorbs one lost day; two lost days extend the sprint by two days. |
| Scope creep from "one more feature" | High | High | Section 6 is a closed list. Anything else becomes a v0.1.1 issue, never a sprint addition. |
| Staging platform surprises | Medium | High | S5-1 lands a local prod compose first; S5-2 only has to point a platform at working images. |
| Demo fails live | Low | High | S5-4 records the backup video and every command in the script is copy-paste ready. |

---

## 6. Deferred to v0.1.1 or later — explicitly

Automatic retries and 429 backoff · hard budget cap per run · Server-Sent Events, cancellation, and resume · regression detection and comparability keys · CSV/JSONL export · image input · human review and manual score override · charts and dashboards · accounts, teams, and sharing.

**Acceptance rule:** if it is not in the six milestones, it is not in v0.1.

---

## 7. Sprint close ritual (end of each 7-day sprint)

1. Fill `docs/planning/sprint-retro.md` (append a section per sprint):
   - Planned vs Done table with hours planned, hours spent, and the delta.
   - Three things that worked.
   - Three things to improve.
   - Backlog reorder: move anything unfinished to the top of the next sprint and re-check the critical path.
2. Confirm the increment is demonstrable: one command, one URL, or one recorded flow.
3. Tag nothing yet. Version tags start after S5.

---

## 8. Exit criteria for the whole plan

- All 30 issues closed.
- `main` and `dev` protected, CI green, no direct pushes.
- Staging runs a real comparison from pasted input to ranked table in both locales.
- A five-minute demo exists as a script and as a video.
- README matches shipped behavior and lists the deferred items.
