# Mihak — مِحَكّ

> A rubric-driven benchmark for language models: same cases, same rubric, one honest comparison of **cost, latency, and quality**.

**Status:** planning complete. Product code starts on 2026-11-12 with Sprint 0. This repository currently holds the execution plan, the full backlog, the API contract, and the GitHub setup automation.

---

## What it does

Mihak runs a small dataset of cases against two or more models, judges every answer against a declared rubric, and shows the trade-off the way a buyer actually makes it:

| Model | Avg cost / call | Avg latency | Score (1–5) | Rank |
|---|---|---|---|---|
| Fake Fast | 375 µUSD | 812 ms | 4.2 | 2 |
| Fake Quality | 1,900 µUSD | 2,310 ms | 4.8 | 1 |

No accounts, no dashboards, no charts. One screen that answers: *which model gives me the best answer per dollar, and why?*

The score is explainable: every model's score can be opened per case, with the output, the expected answer, the three rubric dimensions, the cost, and the latency.

## Scope of v0.1

**In:** Arabic/English UI, paste or `.txt`/`.md` upload, fake provider first and real providers later, rubric-based LLM judge, integer micro-USD costs, price snapshots, 30-second call timeout, queued background execution.

**Out, deliberately:** retries, 429 backoff, budget caps, SSE, cancellation, regression detection, CSV/JSONL export, image input, human review, charts, exports, accounts, sharing. See `docs/planning/sprint-plan.md` §6.

## Stack

| Layer | Technology |
|---|---|
| Web | React + Vite + TypeScript + Tailwind CSS |
| API | NestJS + Prisma |
| Data | PostgreSQL 16 |
| Queue | Redis 7 + BullMQ |
| Contract | Zod schemas shared by both apps |
| Workspace | pnpm monorepo, Node 20 |

```
mihak/
├─ apps/
│  ├─ web/                  # React + Vite + TS + Tailwind
│  └─ api/                  # NestJS + Prisma + BullMQ worker
├─ packages/
│  └─ shared/               # Zod schemas and inferred types
├─ docs/
│  ├─ 01-brief.md           # the idea on one page
│  ├─ 02-spec.md            # stories, acceptance criteria, NFRs, constraints
│  ├─ 03-domain.md          # glossary, diagrams, invariants
│  ├─ 04-architecture.md    # context + containers
│  ├─ adr/                  # architecture decision records
│  ├─ index.md              # which doc for which task
│  ├─ context-order.md      # stable first, changing last
│  ├─ progress.md           # short-term memory
│  ├─ lessons.md            # long-term memory with survival checks
│  ├─ review-checklist.md   # ten questions per diff
│  ├─ prompts.md            # lecture prompts adapted to Mihak
│  ├─ planning/
│  │  ├─ backlog.md         # generated, 30 issues
│  │  ├─ sprint-plan.md     # 6 sprints, critical path, risks
│  │  ├─ api-contract.md    # frozen before any screen
│  │  ├─ github-setup.md    # labels, milestones, board, protection
│  │  └─ sprint-retro.md    # appended at the end of each sprint
│  └─ journal/              # three lines a day
├─ evals/tasks.md           # three fixed context eval tasks
├─ AGENTS.md                # canonical agent rules
├─ CLAUDE.md                # one line: @AGENTS.md
├─ scripts/
│  ├─ github-data.mjs       # single source of truth: labels, milestones, issues
│  ├─ setup-github.mjs      # idempotent GitHub setup
│  └─ render-backlog.mjs    # regenerates docs/planning/backlog.md
├─ .github/
│  ├─ workflows/ci.yml
│  └─ PULL_REQUEST_TEMPLATE.md
└─ docker-compose.yml       # added in Sprint 0
```

## Getting started

> The workspace does not exist yet. S0-1 creates it, and every command below becomes real at that point. Until then only the planning scripts run.

```powershell
# Node 20 and pnpm 9
node --version
pnpm --version

pnpm install
docker compose up -d postgres redis
pnpm --filter @mihak/api exec prisma migrate dev
pnpm dev          # web :5173, api :3000, worker in the same process group
```

Planned root scripts: `dev`, `build`, `typecheck`, `lint`, `test`, `format`.

## Planning artifacts

| Document | Purpose |
|---|---|
| [`docs/planning/backlog.md`](docs/planning/backlog.md) | All 30 issues with labels, hours, dependencies, and full bodies. |
| [`docs/planning/sprint-plan.md`](docs/planning/sprint-plan.md) | Six sprints, dates, critical path, hour math, risks, deferred scope. |
| [`docs/planning/api-contract.md`](docs/planning/api-contract.md) | Every endpoint, request, response, and error code. |
| [`docs/planning/github-setup.md`](docs/planning/github-setup.md) | Repository, token, script, board, and branch-protection steps. |
| [`docs/planning/sprint-retro.md`](docs/planning/sprint-retro.md) | One section per sprint: planned vs done, wins, fixes. |
| [`docs/journal/`](docs/journal/) | Three lines a day: done / next / stuck. |

## Repository memory (lecture artifacts)

Planning files required by the lectures. No product code exists yet; `src/` and `tests/` start with issue #1.

| File | Role |
|---|---|
| [`AGENTS.md`](AGENTS.md) | Canonical rules read at the start of every agent session; `CLAUDE.md` imports it with one line. |
| [`docs/01-brief.md`](docs/01-brief.md) | The idea on one page: problem, users, success signal, what we will not build. |
| [`docs/02-spec.md`](docs/02-spec.md) | Specification: stories, Given/When/Then acceptance criteria, measurable NFRs, constraints, business rules, assumptions. |
| [`docs/03-domain.md`](docs/03-domain.md) | Glossary with code names, Mermaid ER/state/sequence diagrams, invariants, consistency matrix. |
| [`docs/04-architecture.md`](docs/04-architecture.md) | System context and containers, module boundaries, pattern choices. |
| [`docs/adr/`](docs/adr/) | Accepted decisions with options and consequences; never edited in place. |
| [`docs/index.md`](docs/index.md) | Which document to open for which task. |
| [`docs/context-order.md`](docs/context-order.md) | Stable context first, changing context last. |
| [`docs/progress.md`](docs/progress.md) | Short-term memory for the current story. |
| [`docs/lessons.md`](docs/lessons.md) | Long-term memory: each lesson has a check that can delete it. |
| [`docs/review-checklist.md`](docs/review-checklist.md) | Ten review questions and the fixed diff reading order. |
| [`docs/prompts.md`](docs/prompts.md) | The lecture prompts adapted to Mihak, with stop conditions. |
| [`evals/tasks.md`](evals/tasks.md) | Three fixed tasks to measure a context change before and after. |

## Sprint status

| Sprint | Dates | Theme | State |
|---|---|---|---|
| S0 | 2026-11-12 → 11-18 | Setup and Planning | Planned |
| S1 | 2026-11-19 → 11-25 | Core Pipeline | Planned |
| S2 | 2026-11-26 → 12-02 | Core Differentiator | Planned |
| S3 | 2026-12-03 → 12-09 | Output + Polish | Planned |
| S4 | 2026-12-10 → 12-16 | Enhancements & Business Value | Planned |
| S5 | 2026-12-17 → 12-23 | Deployment & Demo Readiness | Planned |

Each sprint ends with something demonstrable. Capacity is 20 h/week, every day, with 16 h planned and a 4 h buffer per sprint.

## Working rules

- `main` is production, `dev` is integration. No direct pushes to either, even solo.
- One issue in progress at a time, hard maximum two.
- Every PR targets `dev`, passes CI, and includes a manual test in its notes.
- No work exists outside an issue. An idea becomes an issue, not a branch.
- No PR above 400 lines of diff.

## Scripts

```powershell
# Validate the plan: labels, milestones, dependencies, hours, body format
node scripts/validate-plan.mjs

# Regenerate the readable backlog after editing scripts/github-data.mjs
node scripts/render-backlog.mjs

# Preview GitHub setup without writing
node scripts/setup-github.mjs --repo owner/mihak --dry-run

# Apply labels, milestones, and issues
node scripts/setup-github.mjs --repo owner/mihak

# Create the Project board (needs a token with the `project` scope)
node scripts/setup-project.mjs --dry-run
node scripts/setup-project.mjs
```

## License

This repository is public so the planning work and the build can be reviewed openly.

No license is granted yet, so all rights are reserved. If you want others to reuse the code, add a license (for example MIT) in a dedicated issue.
