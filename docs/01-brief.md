# 01 — Brief: Mihak (مِحَكّ)

> One page. Fill it before the spec, and re-read it whenever a new "good idea" appears.

## Project name

**Mihak** — a rubric-driven benchmark for language models: same cases, same rubric, one honest comparison of **cost, latency, and quality**.

## The problem in two sentences

People choosing an LLM compare marketing claims and anecdotes instead of doing the same work, so they cannot tell whether a higher price actually buys a better answer. An evaluator needs a repeatable comparison of at least two models on identical cases with a declared rubric, plus a way to see exactly why a score was given.

## Users and their roles

| Role | Need | In v0.1 |
|---|---|---|
| **Evaluator** | Paste or upload a case set, choose two or more models, start a run, read the comparison | Primary user; no account |
| **Reviewer** | Open any score per case and inspect output, expected answer, the three rubric dimensions, cost, and latency | Primary user; no account |
| **Provider operator** | Configure a live provider key and verify it before using it in a run | S4 only; no account |

## How do we know we succeeded? (observable result)

- One screen shows at least two models with **integer µUSD cost**, **latency in ms**, and **quality score 1–5**, ranked.
- Opening a score reveals, per case: model output, expected answer, the three rubric dimensions, cost, and latency.
- The same case set, rubric, and model list reproduce the same run.
- The interface works in **Arabic and English**, with RTL handled from the first screen.
- A five-minute demo runs from pasted input to ranked table on staging.

## What we will not build now

Retries and 429 backoff · hard budget caps per run · Server-Sent Events, cancellation, and resume · regression detection and comparability keys · CSV/JSONL export · image input · human review and manual score override · charts and dashboards · accounts, teams, and sharing.

The full closed list lives in [`docs/planning/sprint-plan.md`](planning/sprint-plan.md) §6. **If it is not in the six milestones, it is not in v0.1.**

## Trace to the next document

This brief feeds [`docs/02-spec.md`](02-spec.md): the problem becomes goals, the users become stories, the success signal becomes measurable acceptance criteria, and "what we will not build now" becomes the scope boundary.
