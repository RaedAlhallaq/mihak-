# ADR-0001: Start as a modular monolith with a frozen shared contract

**Status:** Accepted · 2026-11-12 · **Decision owner:** Raed Alhallaq

Do not edit this record after acceptance. A change requires a new `0002-….md` that supersedes it.

---

## Context

One developer working 20 h/week, six 7-day sprints, 96 planned hours total. Two or more models must be compared on identical cases with a three-dimension rubric; every number (µUSD cost, ms latency, 1–5 score) must be explainable. The UI is Arabic and English from the first screen. There are no accounts, no multi-tenancy, and no requirement for independent scaling. The stack was fixed by the owner: pnpm monorepo, React + Vite, NestJS + Prisma + Postgres, Redis + BullMQ, Zod.

The main risk is not load — it is **contract drift** between web and API while one person moves between them, and **judge/provider variance** making results unreproducible.

## Options

1. **Microservices** — a separate service per provider, judge, and results. Clear ownership, independent deploys.
2. **Modular monolith with a frozen shared contract** — one NestJS API plus a worker, modules bounded by public entry points, Zod schemas in `packages/shared`, fake provider by default.
3. **Serverless functions** — one function per endpoint, managed queue. No servers to run locally.

## Decision

**Option 2.** One deployable API, one worker process, one Postgres database, one Redis queue. All request/response types and error codes live in `packages/shared` and are frozen in [`docs/planning/api-contract.md`](../planning/api-contract.md). A contract change requires one PR touching the document, the Zod schemas, and the mock together. The provider sits behind a port; the fake adapter is the default in tests and demos.

## Consequences

**Positive**

- `pnpm dev` runs the whole system locally; setup fits the first sprint.
- One contract source prevents web/API drift; the mock lets the UI be built before the backend exists.
- Deterministic fake adapter makes cost and scoring tests stable.
- One database makes the price snapshot and run immutability straightforward to enforce.

**Negative**

- Worker and API share a deployment; a bad release takes both down.
- Module boundaries are conventions, not enforced by a network boundary — they need an architecture test or review discipline.
- Pre-aggregated results mean a new column requires a migration plus a contract PR.
- Horizontal scaling of judging alone is not possible without splitting the worker later.

## Skeptic pass

Prompt used: [`docs/prompts.md`](../prompts.md) → "ADR skeptic". Answers recorded before acceptance:

1. **Three arguments against:** the worker can starve the API under load; a shared database couples migrations; the frozen contract slows changes late in the project.
2. **Alternative not studied:** a single NestJS app with the worker as an in-process interval and no Redis. Rejected because stale-run recovery and back-pressure need a real queue, and Redis is already in the fixed stack.
3. **When this becomes wrong within a year:** if the demo turns into a public service with concurrent users and provider calls dominate latency — then split the worker first.
4. **Negative consequence not originally written:** reviewing the frozen contract in one PR adds a coordination cost to every schema change. Accepted deliberately: it is cheaper than silent drift.

## Follow-ups

- S0-1 creates the workspace that makes this decision real.
- S0-4 freezes the Zod schemas and mock handlers.
- S2-3 adds pre-aggregation with the results API; any new field goes through the contract PR first.
- If the system is split, write ADR-0002 before moving code.
