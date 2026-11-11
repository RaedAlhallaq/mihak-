# Mihak — Full Backlog

> Generated from `scripts/github-data.mjs`. Do not edit by hand — edit the data file and run `node scripts/render-backlog.mjs`.

**Issues:** 30 · **Sprints:** 6 · **Planned effort:** 96 h

Every issue is assigned to one person. Order is sequential by dependency, not by team parallelism.

## 1. Issue index

| # | Title | Labels | Sprint | Hours | Depends on |
|---|---|---|---|---|---|
| 1 | [Setup] Initialize Monorepo and Workspace Tooling | `setup` `priority: high` | S0 | 3.5 | — |
| 2 | [Database] Configure Prisma with Postgres and Initial Schema | `database` `priority: high` | S0 | 3.5 | S0-1 |
| 3 | [Setup] Configure Redis and BullMQ Worker Skeleton | `setup` `backend` `priority: high` | S0 | 3 | S0-1 |
| 4 | [AI] Define Shared Zod Schemas, API Contract, and Mock API | `ai` `backend` `priority: high` | S0 | 3.5 | S0-1 |
| 5 | [DevOps] Add CI Pipeline, PR Template, and Branch Protection Guide | `devops` `documentation` `priority: high` | S0 | 2.5 | S0-1 |
| 6 | [Backend] Implement Provider, Price, and Run Repositories | `backend` `database` `priority: high` | S1 | 3.5 | S0-2 |
| 7 | [Backend] Create Run API Endpoint | `backend` `priority: high` | S1 | 3 | S1-1, S0-4 |
| 8 | [Backend] Implement Worker Claim and Execution with Fake Provider | `backend` `ai` `priority: high` | S1 | 3.5 | S1-2, S0-3 |
| 9 | [Frontend] Build Run Input Page | `frontend` `priority: high` | S1 | 3.5 | S0-4 |
| 10 | [Frontend] Build Run Status Page with Polling | `frontend` `priority: high` | S1 | 2.5 | S1-4, S1-2 |
| 11 | [AI] Implement Rubric Presets and Judge Prompt | `ai` `priority: high` | S2 | 3 | S0-4 |
| 12 | [Backend] Implement Judge Invocation and Verdict Persistence | `backend` `ai` `priority: high` | S2 | 3.5 | S1-3, S2-1 |
| 13 | [Backend] Implement Results Aggregation API | `backend` `priority: high` | S2 | 3 | S2-2 |
| 14 | [Frontend] Build Comparison Table | `frontend` `priority: high` | S2 | 3.5 | S2-3, S1-4 |
| 15 | [Frontend] Implement Ranking, Ties, and Insufficient-Data States | `frontend` `priority: high` | S2 | 3 | S2-4 |
| 16 | [Frontend] Build Per-Case Output Drawer | `frontend` `priority: medium` | S3 | 3.5 | S2-3 |
| 17 | [Frontend] Add Loading, Empty, and Error States | `frontend` `priority: medium` | S3 | 3.5 | S2-4 |
| 18 | [Frontend] Complete Arabic and English Localization | `frontend` `documentation` `priority: medium` | S3 | 3.5 | S1-4 |
| 19 | [Backend] Implement Cost Breakdown and Missing-Token Handling | `backend` `priority: high` | S3 | 3 | S1-3 |
| 20 | [Testing] Add Unit Tests for Parser, Scoring, and Cost | `backend` `priority: high` | S3 | 2.5 | S1-4, S2-2, S3-4 |
| 21 | [Backend] Encrypt Provider Keys with AES-256-GCM | `backend` `priority: high` | S4 | 3.5 | S0-2 |
| 22 | [Backend] Implement Provider Settings and Connection Test API | `backend` `database` `priority: high` | S4 | 3.5 | S4-1 |
| 23 | [Frontend] Build Provider Settings Screen | `frontend` `priority: high` | S4 | 3.5 | S4-2 |
| 24 | [Backend] Implement Price Snapshot and Run Immutability | `backend` `database` `priority: high` | S4 | 3 | S1-2, S3-4 |
| 25 | [Backend] Add Stale-Run Recovery and Worker Concurrency | `backend` `priority: medium` | S4 | 2.5 | S1-3 |
| 26 | [DevOps] Add Dockerfiles and Production Compose | `devops` `priority: high` | S5 | 3.5 | S4-2 |
| 27 | [DevOps] Deploy Web, API, and Worker to Staging | `devops` `priority: high` | S5 | 4 | S5-1 |
| 28 | [Testing] Add End-to-End Smoke Test | `frontend` `backend` `priority: high` | S5 | 3 | S2-4, S4-2 |
| 29 | [Documentation] Write Demo Script and Record Backup Video | `documentation` `priority: medium` | S5 | 3 | S5-2 |
| 30 | [Documentation] Finalize README and Sprint Status | `documentation` `priority: medium` | S5 | 2.5 | S5-2 |

## 2. Sprint allocation

### Sprint 0: Setup and Planning

Due: 2026-11-18 · 5 issues · 16 h planned

| Key | Title | Hours | Depends on |
|---|---|---|---|
| S0-1 | [Setup] Initialize Monorepo and Workspace Tooling | 3.5 | — |
| S0-2 | [Database] Configure Prisma with Postgres and Initial Schema | 3.5 | S0-1 |
| S0-3 | [Setup] Configure Redis and BullMQ Worker Skeleton | 3 | S0-1 |
| S0-4 | [AI] Define Shared Zod Schemas, API Contract, and Mock API | 3.5 | S0-1 |
| S0-5 | [DevOps] Add CI Pipeline, PR Template, and Branch Protection Guide | 2.5 | S0-1 |

### Sprint 1: Core Pipeline

Due: 2026-11-25 · 5 issues · 16 h planned

| Key | Title | Hours | Depends on |
|---|---|---|---|
| S1-1 | [Backend] Implement Provider, Price, and Run Repositories | 3.5 | S0-2 |
| S1-2 | [Backend] Create Run API Endpoint | 3 | S1-1, S0-4 |
| S1-3 | [Backend] Implement Worker Claim and Execution with Fake Provider | 3.5 | S1-2, S0-3 |
| S1-4 | [Frontend] Build Run Input Page | 3.5 | S0-4 |
| S1-5 | [Frontend] Build Run Status Page with Polling | 2.5 | S1-4, S1-2 |

### Sprint 2: Core Differentiator

Due: 2026-12-02 · 5 issues · 16 h planned

| Key | Title | Hours | Depends on |
|---|---|---|---|
| S2-1 | [AI] Implement Rubric Presets and Judge Prompt | 3 | S0-4 |
| S2-2 | [Backend] Implement Judge Invocation and Verdict Persistence | 3.5 | S1-3, S2-1 |
| S2-3 | [Backend] Implement Results Aggregation API | 3 | S2-2 |
| S2-4 | [Frontend] Build Comparison Table | 3.5 | S2-3, S1-4 |
| S2-5 | [Frontend] Implement Ranking, Ties, and Insufficient-Data States | 3 | S2-4 |

### Sprint 3: Output + Polish

Due: 2026-12-09 · 5 issues · 16 h planned

| Key | Title | Hours | Depends on |
|---|---|---|---|
| S3-1 | [Frontend] Build Per-Case Output Drawer | 3.5 | S2-3 |
| S3-2 | [Frontend] Add Loading, Empty, and Error States | 3.5 | S2-4 |
| S3-3 | [Frontend] Complete Arabic and English Localization | 3.5 | S1-4 |
| S3-4 | [Backend] Implement Cost Breakdown and Missing-Token Handling | 3 | S1-3 |
| S3-5 | [Testing] Add Unit Tests for Parser, Scoring, and Cost | 2.5 | S1-4, S2-2, S3-4 |

### Sprint 4: Enhancements & Business Value

Due: 2026-12-16 · 5 issues · 16 h planned

| Key | Title | Hours | Depends on |
|---|---|---|---|
| S4-1 | [Backend] Encrypt Provider Keys with AES-256-GCM | 3.5 | S0-2 |
| S4-2 | [Backend] Implement Provider Settings and Connection Test API | 3.5 | S4-1 |
| S4-3 | [Frontend] Build Provider Settings Screen | 3.5 | S4-2 |
| S4-4 | [Backend] Implement Price Snapshot and Run Immutability | 3 | S1-2, S3-4 |
| S4-5 | [Backend] Add Stale-Run Recovery and Worker Concurrency | 2.5 | S1-3 |

### Sprint 5: Deployment & Demo Readiness

Due: 2026-12-23 · 5 issues · 16 h planned

| Key | Title | Hours | Depends on |
|---|---|---|---|
| S5-1 | [DevOps] Add Dockerfiles and Production Compose | 3.5 | S4-2 |
| S5-2 | [DevOps] Deploy Web, API, and Worker to Staging | 4 | S5-1 |
| S5-3 | [Testing] Add End-to-End Smoke Test | 3 | S2-4, S4-2 |
| S5-4 | [Documentation] Write Demo Script and Record Backup Video | 3 | S5-2 |
| S5-5 | [Documentation] Finalize README and Sprint Status | 2.5 | S5-2 |

## 3. Labels

These are the exact EchoGrow labels, colors, and descriptions. The setup script syncs them idempotently.

| Label | Color | Description |
|---|---|---|
| `setup` | `#cfdd68` | Setup Tasks (DB, Redis, SDK, Config) |
| `frontend` | `#efc2f9` | React Tasks، Interfaces & Tabs needed |
| `backend` | `#76dc5c` | Logic Tasks NestJS، API |
| `database` | `#326c40` | Prisma Schema، Migrations، Seed Data Tasks |
| `ai` | `#20beab` | Prompt، LLM، Zod Schemas، Rubric Tasks |
| `devops` | `#28b60b` | Docker، CI/CD، Environment (Deploy Tasks) |
| `documentation` | `#0075ca` | Improvements or additions to documentation |
| `accessibility` | `#f143ab` | Barrier affecting people with disabilities |
| `bug` | `#d73a4a` | Something isn't working |
| `enhancement` | `#a2eeef` | New feature or request |
| `blocked` | `#c2e0c6` | Tasks Depends On Others |
| `priority: high` | `#b60205` | P0 (Must) |
| `priority: medium` | `#fbca04` | P1 (Important) |
| `priority: low` | `#0e8a16` | P2 (Nice to Have) |
| `good first issue` | `#7057ff` | Good for newcomers |
| `help wanted` | `#008672` | Extra attention is needed |
| `question` | `#d876e3` | Further information is requested |
| `duplicate` | `#cfd3d7` | This issue or pull request already exists |
| `invalid` | `#e4e669` | This doesn't seem right |
| `wontfix` | `#ffffff` | This will not be worked on |

## 4. Issue bodies

Copy-ready as-is. On GitHub the `## Dependencies` section is appended automatically with real issue numbers.

---

### S0-1 — [Setup] Initialize Monorepo and Workspace Tooling

**Milestone:** Sprint 0: Setup and Planning · **Estimate:** 3.5 h · **Order in sprint:** 1/5

**Labels:** `setup` `priority: high`

## What

Create a pnpm workspace with apps/web, apps/api, and packages/shared, plus shared TypeScript, ESLint, and Prettier configuration and root scripts.

## Why

Every later issue depends on one reproducible workspace and one quality command.

## Acceptance Criteria

- [ ] pnpm install succeeds from a clean clone.
- [ ] pnpm typecheck, pnpm lint, pnpm test, and pnpm build exist and run.
- [ ] apps/web starts with Vite on port 5173.
- [ ] apps/api starts with NestJS on port 3000 and exposes GET /health.
- [ ] packages/shared is importable from both apps.
- [ ] README documents every command.

---

### S0-2 — [Database] Configure Prisma with Postgres and Initial Schema

**Milestone:** Sprint 0: Setup and Planning · **Estimate:** 3.5 h · **Order in sprint:** 2/5

**Labels:** `database` `priority: high` `blocked`

## What

Add Postgres 16 to docker-compose, define the Prisma schema for providers, prices, runs, calls, attempts, and verdicts, and create the first migration and seed.

## Why

Run data and costs must persist before the pipeline exists.

## Acceptance Criteria

- [ ] docker compose up -d postgres starts Postgres with a health check.
- [ ] pnpm --filter @mihak/api prisma migrate dev creates every table.
- [ ] UNIQUE(run_id, case_index, provider, model) exists on calls.
- [ ] UNIQUE(call_id) exists on verdicts.
- [ ] The seed inserts one fake provider with two models and prices, and running it twice does not duplicate rows.
- [ ] Prisma Studio shows the seeded rows.

## Dependencies

- Depends on S0-1.

---

### S0-3 — [Setup] Configure Redis and BullMQ Worker Skeleton

**Milestone:** Sprint 0: Setup and Planning · **Estimate:** 3 h · **Order in sprint:** 3/5

**Labels:** `setup` `backend` `priority: high` `blocked`

## What

Add Redis 7 to docker-compose, connect a BullMQ queue and worker, add graceful shutdown, and report both dependencies from the health endpoint.

## Why

Long runs must never execute inside an HTTP request.

## Acceptance Criteria

- [ ] docker compose up -d redis starts Redis with a health check.
- [ ] pnpm --filter @mihak/api worker connects to Redis and logs "worker ready".
- [ ] SIGTERM closes the worker and its connections gracefully.
- [ ] GET /health reports Postgres and Redis status separately.

## Dependencies

- Depends on S0-1.

---

### S0-4 — [AI] Define Shared Zod Schemas, API Contract, and Mock API

**Milestone:** Sprint 0: Setup and Planning · **Estimate:** 3.5 h · **Order in sprint:** 4/5

**Labels:** `ai` `backend` `priority: high` `blocked`

## What

Define Zod schemas and inferred types for every request and response, publish docs/planning/api-contract.md, and add mock handlers for every endpoint.

## Why

The UI must not wait for the backend, and the contract must be frozen before any screen is built.

## Acceptance Criteria

- [ ] Every endpoint in docs/planning/api-contract.md has a request and response schema.
- [ ] packages/shared exports the schemas and inferred TypeScript types.
- [ ] Mock handlers return valid fixtures for every endpoint.
- [ ] The web app can run against the mock API with one environment flag.
- [ ] A contract test fails when a schema and the contract document diverge.

## Dependencies

- Depends on S0-1.

---

### S0-5 — [DevOps] Add CI Pipeline, PR Template, and Branch Protection Guide

**Milestone:** Sprint 0: Setup and Planning · **Estimate:** 2.5 h · **Order in sprint:** 5/5

**Labels:** `devops` `documentation` `priority: high` `blocked`

## What

Add GitHub Actions for typecheck, lint, test, and build; add the PR template; document the manual Project Board and branch protection steps.

## Why

With no second reviewer, CI and a strict PR ritual are the review.

## Acceptance Criteria

- [ ] CI runs on every pull request targeting dev and main.
- [ ] CI starts Postgres and Redis services and applies migrations.
- [ ] A failing typecheck, lint, test, or build blocks the pull request.
- [ ] .github/PULL_REQUEST_TEMPLATE.md matches the agreed format.
- [ ] docs/planning/github-setup.md documents the manual branch protection and board steps.

## Dependencies

- Depends on S0-1.

---

### S1-1 — [Backend] Implement Provider, Price, and Run Repositories

**Milestone:** Sprint 1: Core Pipeline · **Estimate:** 3.5 h · **Order in sprint:** 1/5

**Labels:** `backend` `database` `priority: high` `blocked`

## What

Define repository interfaces for providers, prices, runs, calls, and verdicts in the domain layer, and implement them with Prisma in the infrastructure layer.

## Why

Use cases must not depend on Prisma directly.

## Acceptance Criteria

- [ ] Repository interfaces live in apps/api/src/domain and import no Prisma code.
- [ ] Prisma implementations live in apps/api/src/infra.
- [ ] Unit tests use in-memory fakes.
- [ ] A test proves UNIQUE(run_id, case_index, provider, model) rejects a duplicate call.
- [ ] A test proves call creation is atomic with its run.

## Dependencies

- Depends on S0-2.

---

### S1-2 — [Backend] Create Run API Endpoint

**Milestone:** Sprint 1: Core Pipeline · **Estimate:** 3 h · **Order in sprint:** 2/5

**Labels:** `backend` `priority: high` `blocked`

## What

Implement POST /api/runs: validate the payload, snapshot the dataset and rubric, write a queued run, and return 202 with the location.

## Why

The run must start immediately and execute outside the request cycle.

## Acceptance Criteria

- [ ] A valid request returns 202 with runId, status=queued, and a Location header.
- [ ] bad_json returns 400.
- [ ] validation_error returns 400 for zero cases or more than ten cases.
- [ ] no_models returns 400 when fewer than two models are selected.
- [ ] missing_price returns 422 when a selected model has no price.
- [ ] The handler makes no model call.
- [ ] Unit and e2e tests cover the happy path and every error code.

## Dependencies

- Depends on S1-1, S0-4.

---

### S1-3 — [Backend] Implement Worker Claim and Execution with Fake Provider

**Milestone:** Sprint 1: Core Pipeline · **Estimate:** 3.5 h · **Order in sprint:** 3/5

**Labels:** `backend` `ai` `priority: high` `blocked`

## What

Implement atomic run claiming, a five-second heartbeat, stale detection after sixty seconds, and execution of every case × model through the fake provider with incremental writes.

## Why

This is the end-to-end pipeline that makes the product real.

## Acceptance Criteria

- [ ] Two workers polling at the same time never claim the same run.
- [ ] The heartbeat updates every five seconds.
- [ ] A run with no heartbeat for sixty seconds becomes claimable again.
- [ ] Each call stores output, latency, tokens in/out, and status.
- [ ] A poll during execution sees partial calls.
- [ ] One failing model does not stop the other models.
- [ ] A missing response after thirty seconds is recorded as timed_out.

## Dependencies

- Depends on S1-2, S0-3.

---

### S1-4 — [Frontend] Build Run Input Page

**Milestone:** Sprint 1: Core Pipeline · **Estimate:** 3.5 h · **Order in sprint:** 4/5

**Labels:** `frontend` `priority: high` `blocked`

## What

Build a page to paste text or upload a .txt or .md file, parse cases, select two or more models and one rubric, and create a run.

## Why

Without input there is no run.

## Acceptance Criteria

- [ ] The page shows a live case count and the ---, ==>, and \--- hints.
- [ ] A file up to 1 MB is parsed in the browser; any other type is rejected.
- [ ] Parse errors name the case index.
- [ ] The Run button is disabled with fewer than two models or invalid input.
- [ ] The page works against the mock API.

## Dependencies

- Depends on S0-4.

---

### S1-5 — [Frontend] Build Run Status Page with Polling

**Milestone:** Sprint 1: Core Pipeline · **Estimate:** 2.5 h · **Order in sprint:** 5/5

**Labels:** `frontend` `priority: high` `blocked`

## What

Build the run page that polls GET /api/runs/:id every second and shows status, per-model progress, and terminal states.

## Why

Progress must be visible without SSE.

## Acceptance Criteria

- [ ] Polling starts on page load and stops at a terminal state.
- [ ] The page shows queued, running, finished, and failed.
- [ ] The page shows completed/total per model.
- [ ] A temporary network error keeps the last known state and retries.
- [ ] The page is usable in both locales.

## Dependencies

- Depends on S1-4, S1-2.

---

### S2-1 — [AI] Implement Rubric Presets and Judge Prompt

**Milestone:** Sprint 2: Core Differentiator · **Estimate:** 3 h · **Order in sprint:** 1/5

**Labels:** `ai` `priority: high` `blocked`

## What

Add the General answer and Code rubric presets with 1/3/5 anchors, and a judge prompt that returns JSON dimensions only.

## Why

A declared rubric is what makes the score defensible.

## Acceptance Criteria

- [ ] Both presets exist and are editable before a run.
- [ ] The prompt requests correctness, format, and completeness only.
- [ ] The prompt includes the case input, model output, expected answer, and rubric text.
- [ ] Invalid JSON is detected before persistence.
- [ ] Every rubric change produces a new hash.

## Dependencies

- Depends on S0-4.

---

### S2-2 — [Backend] Implement Judge Invocation and Verdict Persistence

**Milestone:** Sprint 2: Core Differentiator · **Estimate:** 3.5 h · **Order in sprint:** 2/5

**Labels:** `backend` `ai` `priority: high` `blocked`

## What

Call the judge after each successful call, validate the JSON, retry once on invalid JSON, compute the final score, and persist the verdict.

## Why

The score is the product differentiator.

## Acceptance Criteria

- [ ] Every successful call produces at most one verdict.
- [ ] Invalid JSON triggers one retry, then judge_error.
- [ ] A judge failure does not fail the run.
- [ ] The verdict stores judge model, rubric hash, rubric text, dimensions, final, and n.
- [ ] final = mean of available dimensions, rounded to one decimal.
- [ ] A missing dimension becomes null, never 3.

## Dependencies

- Depends on S1-3, S2-1.

---

### S2-3 — [Backend] Implement Results Aggregation API

**Milestone:** Sprint 2: Core Differentiator · **Estimate:** 3 h · **Order in sprint:** 3/5

**Labels:** `backend` `priority: high` `blocked`

## What

Implement GET /api/runs/:id/results with per-model aggregates and per-case results in one response.

## Why

The table needs one request, not N+1.

## Acceptance Criteria

- [ ] Each model returns average cost, average latency, score, completed/total, and n.
- [ ] Aggregates are computed from calls, not from averages of averages.
- [ ] Each case returns input, expected, output, dimensions, score, cost, latency, and status.
- [ ] Repeated reads do not mutate data.
- [ ] The response matches the shared Zod schema.

## Dependencies

- Depends on S2-2.

---

### S2-4 — [Frontend] Build Comparison Table

**Milestone:** Sprint 2: Core Differentiator · **Estimate:** 3.5 h · **Order in sprint:** 4/5

**Labels:** `frontend` `priority: high` `blocked`

## What

Build the comparison table with cost, latency, score, and progress per model, updating during the run.

## Why

This is the main screen of the product.

## Acceptance Criteria

- [ ] Columns match the specification.
- [ ] The first row appears within five seconds with the fake provider.
- [ ] Values update while polling.
- [ ] Empty and error states are handled.
- [ ] The table renders correctly in Arabic RTL and English LTR.

## Dependencies

- Depends on S2-3, S1-4.

---

### S2-5 — [Frontend] Implement Ranking, Ties, and Insufficient-Data States

**Milestone:** Sprint 2: Core Differentiator · **Estimate:** 3 h · **Order in sprint:** 5/5

**Labels:** `frontend` `priority: high` `blocked`

## What

Sort by score, then cost, then latency, then name; mark models below fifty percent complete; show n and the ranking rule.

## Why

A ranking without rules is an opinion.

## Acceptance Criteria

- [ ] Tie-breakers follow score, cost, latency, then name.
- [ ] The active rule is stated under the table.
- [ ] A model below fifty percent complete is marked insufficient and excluded from the recommendation.
- [ ] n=0 shows a dash; n=1 shows the value with n=1.

## Dependencies

- Depends on S2-4.

---

### S3-1 — [Frontend] Build Per-Case Output Drawer

**Milestone:** Sprint 3: Output + Polish · **Estimate:** 3.5 h · **Order in sprint:** 1/5

**Labels:** `frontend` `priority: medium` `blocked`

## What

Clicking a model row opens every case for that model with its output, expected answer, score, cost, and latency.

## Why

The score must be explainable.

## Acceptance Criteria

- [ ] The drawer lists every case for the selected model.
- [ ] It shows output, expected, dimensions, score, cost, and latency.
- [ ] Open and close are keyboard accessible.
- [ ] It renders in both locales.

## Dependencies

- Depends on S2-3.

---

### S3-2 — [Frontend] Add Loading, Empty, and Error States

**Milestone:** Sprint 3: Output + Polish · **Estimate:** 3.5 h · **Order in sprint:** 2/5

**Labels:** `frontend` `priority: medium` `blocked`

## What

Add consistent loading, empty, and recoverable error states to every screen.

## Why

A demo with blank screens looks broken.

## Acceptance Criteria

- [ ] Every screen has a loading, empty, and error state.
- [ ] Errors include a retry action.
- [ ] Data arrival does not cause layout shift.
- [ ] All states are translated.

## Dependencies

- Depends on S2-4.

---

### S3-3 — [Frontend] Complete Arabic and English Localization

**Milestone:** Sprint 3: Output + Polish · **Estimate:** 3.5 h · **Order in sprint:** 3/5

**Labels:** `frontend` `documentation` `priority: medium` `blocked`

## What

Finish the bilingual layer: resource files, locale switch, RTL/LTR, six Arabic plural categories, and Intl number and date formatting.

## Why

Bilingual support is a v0.1 requirement.

## Acceptance Criteria

- [ ] No visible hardcoded string remains.
- [ ] Arabic routes render RTL and English routes render LTR.
- [ ] check-i18n fails when a key is missing from either locale.
- [ ] Numbers, dates, and technical values render correctly in both.

## Dependencies

- Depends on S1-4.

---

### S3-4 — [Backend] Implement Cost Breakdown and Missing-Token Handling

**Milestone:** Sprint 3: Output + Polish · **Estimate:** 3 h · **Order in sprint:** 4/5

**Labels:** `backend` `priority: high` `blocked`

## What

Compute integer micro-USD cost, expose generation, judging, and total, and return null with an unpriced tag when tokens are missing.

## Why

Cost accuracy is a success criterion.

## Acceptance Criteria

- [ ] The cost formula uses integer arithmetic only.
- [ ] 500 input and 500 output at 0.15 and 0.60 per million returns 375 micro-USD.
- [ ] Missing tokens produce cost=null and an unpriced tag.
- [ ] The breakdown sums to the total.
- [ ] No float appears in the cost path.

## Dependencies

- Depends on S1-3.

---

### S3-5 — [Testing] Add Unit Tests for Parser, Scoring, and Cost

**Milestone:** Sprint 3: Output + Polish · **Estimate:** 2.5 h · **Order in sprint:** 5/5

**Labels:** `backend` `priority: high` `blocked`

## What

Add table-driven unit tests for the case parser, dimension availability and score, and cost computation.

## Why

These rules are the contract of the product.

## Acceptance Criteria

- [ ] Parser cases cover split, reference, escape, zero cases, eleven cases, and hash stability.
- [ ] Scoring cases cover reference, no reference, all null, rounding, and n.
- [ ] Cost cases cover the worked example, rounding, and missing tokens.
- [ ] The three modules have at least ninety percent line coverage.

## Dependencies

- Depends on S1-4, S2-2, S3-4.

---

### S4-1 — [Backend] Encrypt Provider Keys with AES-256-GCM

**Milestone:** Sprint 4: Enhancements & Business Value · **Estimate:** 3.5 h · **Order in sprint:** 1/5

**Labels:** `backend` `priority: high` `blocked`

## What

Encrypt provider keys at rest with AES-256-GCM, decrypt only inside the worker, and return only a mask from the API.

## Why

A leaked database must not leak credentials.

## Acceptance Criteria

- [ ] The database stores ciphertext and nonce only.
- [ ] A missing encryption key in the environment refuses startup with a clear message.
- [ ] The API returns the mask only, never the key or ciphertext.
- [ ] Logs redact any key as sk-...abcd.

## Dependencies

- Depends on S0-2.

---

### S4-2 — [Backend] Implement Provider Settings and Connection Test API

**Milestone:** Sprint 4: Enhancements & Business Value · **Estimate:** 3.5 h · **Order in sprint:** 2/5

**Labels:** `backend` `database` `priority: high` `blocked`

## What

Implement create, update, list, and test for providers, including prices, max out tokens, and active state.

## Why

Real models need a configuration surface.

## Acceptance Criteria

- [ ] Create and update validate the base URL, integer prices, and max out tokens.
- [ ] A missing price blocks activation.
- [ ] Test performs one small request and returns latency or a sanitized error.
- [ ] The key never appears in any response.
- [ ] The API matches the shared Zod schema.

## Dependencies

- Depends on S4-1.

---

### S4-3 — [Frontend] Build Provider Settings Screen

**Milestone:** Sprint 4: Enhancements & Business Value · **Estimate:** 3.5 h · **Order in sprint:** 3/5

**Labels:** `frontend` `priority: high` `blocked`

## What

Build the settings screen for provider name, base URL, key, prices, max out tokens, active state, and connection test.

## Why

The user must configure a real provider without editing files.

## Acceptance Criteria

- [ ] Fields validate inline.
- [ ] A saved key is shown as a mask.
- [ ] Test shows success with latency or a sanitized failure.
- [ ] The screen is translated and RTL-safe.
- [ ] The screen works against the mock API.

## Dependencies

- Depends on S4-2.

---

### S4-4 — [Backend] Implement Price Snapshot and Run Immutability

**Milestone:** Sprint 4: Enhancements & Business Value · **Estimate:** 3 h · **Order in sprint:** 4/5

**Labels:** `backend` `database` `priority: high` `blocked`

## What

Snapshot the prices used when a run is created, and reject any write to a finished or failed run.

## Why

Old runs must never change cost when a price changes.

## Acceptance Criteria

- [ ] The run stores its price snapshot.
- [ ] Changing a provider price does not change an existing run cost.
- [ ] A finished run rejects new calls or models.
- [ ] Tests cover both rules.

## Dependencies

- Depends on S1-2, S3-4.

---

### S4-5 — [Backend] Add Stale-Run Recovery and Worker Concurrency

**Milestone:** Sprint 4: Enhancements & Business Value · **Estimate:** 2.5 h · **Order in sprint:** 5/5

**Labels:** `backend` `priority: medium` `blocked`

## What

Reclaim runs without a heartbeat for sixty seconds and allow a configurable number of runs to execute concurrently.

## Why

A crash must not stall the queue.

## Acceptance Criteria

- [ ] A stale run is reclaimed by another worker.
- [ ] Completed calls are not re-executed.
- [ ] The unique constraint prevents duplicate calls after recovery.
- [ ] Worker concurrency is configurable by environment variable.

## Dependencies

- Depends on S1-3.

---

### S5-1 — [DevOps] Add Dockerfiles and Production Compose

**Milestone:** Sprint 5: Deployment & Demo Readiness · **Estimate:** 3.5 h · **Order in sprint:** 1/5

**Labels:** `devops` `priority: high` `blocked`

## What

Add multi-stage Dockerfiles for web and API, a production compose with Postgres and Redis, and an environment example.

## Why

Deployment must be reproducible.

## Acceptance Criteria

- [ ] docker compose -f docker-compose.prod.yml up starts web, api, worker, Postgres, and Redis.
- [ ] Images build from a clean clone.
- [ ] Environment values come from .env and are never committed.
- [ ] Every service has a health check.

## Dependencies

- Depends on S4-2.

---

### S5-2 — [DevOps] Deploy Web, API, and Worker to Staging

**Milestone:** Sprint 5: Deployment & Demo Readiness · **Estimate:** 4 h · **Order in sprint:** 2/5

**Labels:** `devops` `priority: high` `blocked`

## What

Deploy the web app, API, worker, Postgres, and Redis to a staging environment with a public URL.

## Why

A deployable increment must be real, not theoretical.

## Acceptance Criteria

- [ ] The public web URL loads.
- [ ] The API health check is green.
- [ ] A real run completes on staging from input to table.
- [ ] Secrets are stored in the platform, not the repository.
- [ ] Rollback steps are documented.

## Dependencies

- Depends on S5-1.

---

### S5-3 — [Testing] Add End-to-End Smoke Test

**Milestone:** Sprint 5: Deployment & Demo Readiness · **Estimate:** 3 h · **Order in sprint:** 3/5

**Labels:** `frontend` `backend` `priority: high` `blocked`

## What

Add one automated path from input to ranked table in both locales, including one failing model.

## Why

The release must be proven, not assumed.

## Acceptance Criteria

- [ ] The happy path passes in Arabic and English.
- [ ] A failing model still renders the table.
- [ ] The test runs in CI against the fake provider.
- [ ] Screenshots and logs are uploaded on failure.

## Dependencies

- Depends on S2-4, S4-2.

---

### S5-4 — [Documentation] Write Demo Script and Record Backup Video

**Milestone:** Sprint 5: Deployment & Demo Readiness · **Estimate:** 3 h · **Order in sprint:** 4/5

**Labels:** `documentation` `priority: medium` `blocked`

## What

Write a five-minute demo script and record a backup video of the full comparison flow.

## Why

The demo must survive a live failure.

## Acceptance Criteria

- [ ] The script covers the problem, input, run, table, cost, and persistence.
- [ ] The video is under five minutes and linked from the README.
- [ ] Every command in the script is copy-paste ready.

## Dependencies

- Depends on S5-2.

---

### S5-5 — [Documentation] Finalize README and Sprint Status

**Milestone:** Sprint 5: Deployment & Demo Readiness · **Estimate:** 2.5 h · **Order in sprint:** 5/5

**Labels:** `documentation` `priority: medium` `blocked`

## What

Finalize the README with setup, architecture, screenshots, sprint status, and known limitations.

## Why

Handover must not depend on memory.

## Acceptance Criteria

- [ ] The README matches the shipped behavior.
- [ ] The sprint status table is complete.
- [ ] Known limitations and deferred items are listed.
- [ ] Links to the API contract and journal are valid.

## Dependencies

- Depends on S5-2.

---

## 5. What is deliberately not here

Deferred to v0.1.1 or later. They are not in the backlog and must not be pulled into a sprint:

- Automatic retries and 429 backoff.
- A hard budget cap per run.
- Server-Sent Events, cancellation, and resume.
- Regression detection between runs and comparability keys.
- CSV/JSONL export and image input.
- Human review / manual override of judge scores.
- Charts and dashboards.
- Accounts, teams, and sharing.

Acceptance rule: if a feature is not on this list and not in the six milestones, it is out of scope for v0.1.

