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
│  ├─ planning/
│  │  ├─ backlog.md         # generated, 30 issues
│  │  ├─ sprint-plan.md     # 6 sprints, critical path, risks
│  │  ├─ api-contract.md    # frozen before any screen
│  │  ├─ github-setup.md    # labels, milestones, board, protection
│  │  └─ sprint-retro.md    # appended at the end of each sprint
│  └─ journal/              # three lines a day
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

Private until further notice.
