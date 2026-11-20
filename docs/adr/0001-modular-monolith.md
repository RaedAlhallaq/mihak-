# ADR 0001: Adoption of Full-Stack Next.js Modular Monolith & Concurrent Fan-Out Architecture

* **Status:** Accepted
* **Date:** 2026-11-20
* **Deciders:** Mahak AI Core Team

## Context & Problem Statement
Developers using Mahak AI need to run evaluation datasets across multiple LLMs concurrently to compare cost, latency, and quality. We required an architectural pattern that balances high-speed I/O fan-out execution, low maintenance overhead, zero contract drift between UI and backend, and strict domain boundaries without microservices complexity.

## Decision Outcome
Chosen Option: **Modular Monolith via Next.js (App Router) & TypeScript**.

### Key Architectural Principles:
1. **Single Source of Truth:** Shared TypeScript interfaces (`types.ts`) and Zod schemas (`schemas.ts`) eliminate contract drift between frontend and backend.
2. **Resilient Non-blocking Fan-Out:** Node.js async runtime with `Promise.allSettled()` enables non-blocking parallel dispatches to LLM providers. Provider failures do not crash the evaluation run.
3. **Low Operational Complexity:** Single repo, unified build pipeline, zero inter-service network overhead.

## Consequences & Trade-offs
* **Positive:** Fast MVP iteration, strict type safety, built-in serverless route handlers.
* **Risks:** Heavy background evaluation jobs exceeding serverless timeouts (>60s) will eventually require a background job queue (e.g., BullMQ + Redis).
