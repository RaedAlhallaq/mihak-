# Mihak — API Contract (v0.1, frozen before UI)

**Status:** frozen at Sprint 0. Any change requires one PR that updates this document, the Zod schema in `packages/shared`, and the mock handler together.
**Base URL:** `http://localhost:3000` in development; `https://<api-host>` in staging.
**Auth:** none in v0.1. The app is single-user. Provider API keys are stored server-side and never returned.

---

## 1. Conventions

| Topic | Rule |
|---|---|
| Content type | `application/json; charset=utf-8` for every request and response except `GET /health` (also JSON). |
| Field names | `camelCase` on the wire, `snake_case` in the database. Mapping happens in the infrastructure layer only. |
| IDs | UUID v4 strings. |
| Timestamps | ISO 8601 UTC with milliseconds, e.g. `2026-11-19T09:14:22.031Z`. |
| Money | Integer **micro-USD** (1 USD = 1,000,000). No floats anywhere in the cost path. |
| Prices | Integer micro-USD **per 1,000,000 tokens**. |
| Locale | `"ar"` or `"en"`. Affects generated judge prose only; scores are locale-independent. |
| Case index | Zero-based in the database and API. The UI displays `index + 1`. |
| Null vs absent | A field that cannot be computed is `null` and is always present. Absent means "not applicable to this response". |
| Idempotency | Only `POST /api/runs` is non-idempotent. A retried create produces a new run. |
| Pagination | Cursor-based, `limit` + `nextCursor`. |
| Rate limiting | None in v0.1. |

### 1.1 Error envelope

Every non-2xx response has exactly this shape:

```json
{
  "error": {
    "code": "validation_error",
    "message": "cases must contain between 1 and 10 items",
    "details": [{ "path": "cases", "message": "too many items" }]
  }
}
```

`details` is optional and only present for validation errors. `message` is safe to display. Internal stack traces and provider responses are logged, never returned.

### 1.2 Error codes

| Code | HTTP | Meaning |
|---|---|---|
| `bad_json` | 400 | Body is not valid JSON. |
| `validation_error` | 400 | Body is JSON but violates the schema. |
| `no_models` | 400 | Fewer than two models were selected. |
| `too_many_models` | 400 | More than six models were selected. |
| `not_found` | 404 | Run, provider, or model does not exist. |
| `results_not_ready` | 409 | Results requested before the run reached a terminal state. |
| `run_immutable` | 409 | Attempted write to a finished or failed run. |
| `missing_price` | 422 | A selected model has no active price. |
| `invalid_provider` | 422 | Provider configuration is structurally invalid (bad URL, non-integer price, missing key). |
| `provider_unreachable` | 502 | A live provider test or call failed at the network or auth layer. |
| `payload_too_large` | 413 | Request body exceeds 1 MB. |
| `internal_error` | 500 | Anything unexpected. |

---

## 2. Endpoint index

| # | Method | Path | Purpose | Sprint | Errors |
|---|---|---|---|---|---|
| 1 | GET | `/health` | Liveness plus dependency status | S0 | — |
| 2 | GET | `/api/catalog` | Providers, models, rubrics, default judge | S0 | `internal_error` |
| 3 | GET | `/api/runs` | Run history, newest first | S1 | `validation_error` |
| 4 | POST | `/api/runs` | Create and queue a run | S1 | `bad_json` `validation_error` `no_models` `too_many_models` `missing_price` `payload_too_large` |
| 5 | GET | `/api/runs/:id` | Poll run status and progress | S1 | `not_found` |
| 6 | GET | `/api/runs/:id/results` | Aggregates, ranking, per-case outputs | S2 | `not_found` `results_not_ready` |
| 7 | GET | `/api/providers` | List providers with masked keys | S4 | `internal_error` |
| 8 | POST | `/api/providers` | Create a provider with models and prices | S4 | `bad_json` `validation_error` `invalid_provider` |
| 9 | PATCH | `/api/providers/:id` | Update provider, models, prices, active state | S4 | `bad_json` `validation_error` `not_found` `invalid_provider` |
| 10 | POST | `/api/providers/:id/test` | One small live request to verify credentials | S4 | `not_found` `validation_error` |

**Not in v0.1:** `POST /api/runs/:id/cancel`, `POST /api/runs/:id/retry`, SSE, export, delete provider, accounts, sharing.

---

## 3. Shared schemas

These are the exact shapes the Zod package must export (`packages/shared`). Names are stable because issues reference them.

```ts
type Locale = 'ar' | 'en';

type ModelRef = { provider: string; model: string };

type Case = { index: number; input: string; expected: string | null };

type Rubric = {
  id: 'general' | 'code' | 'custom';
  title: string;
  text: string;
  hash: string; // sha256 of normalized text
};

type Dimensions = {
  correctness: number | null;
  format: number | null;
  completeness: number | null;
};

type CostBreakdown = {
  generationMicro: number;
  judgingMicro: number;
  totalMicro: number;
} | null;

type CallStatus =
  | 'pending'
  | 'in_flight'
  | 'ok'
  | 'judging'
  | 'scored'
  | 'failed'
  | 'timed_out'
  | 'judge_error';
```

Rules baked into the types:

- A dimension is `null` when the judge did not return it. It is never replaced by a default of 3.
- `score` is the mean of available dimensions rounded to one decimal. All three null means `score: null` and `n: 0`.
- `cost` is `null` when input or output tokens are unavailable; the response then sets `priced: false`.
- `totalMicro` is always computed from integers, one rounding step at the call level.

---

## 4. Endpoint details

### 4.1 `GET /health`

Liveness and dependency status. Used by Docker health checks, CI, and the staging smoke test.

**Request:** none.

**Response 200**

```json
{
  "status": "ok",
  "postgres": "up",
  "redis": "up",
  "version": "0.1.0",
  "time": "2026-11-19T09:14:22.031Z"
}
```

**Response 503** — same body with `"status": "degraded"` and at least one dependency `"down"`.

**Errors:** none beyond the degraded response.

---

### 4.2 `GET /api/catalog`

Everything the input page needs in one request: selectable models, their prices, the rubric presets, and the default judge.

**Request:** none.

**Response 200**

```json
{
  "providers": [
    {
      "slug": "fake",
      "name": "Fake Provider",
      "active": true,
      "models": [
        {
          "name": "fake-fast",
          "displayName": "Fake Fast",
          "inputMicroPerMillion": 150000,
          "outputMicroPerMillion": 600000,
          "maxOutTokens": 512,
          "active": true,
          "priced": true
        }
      ]
    }
  ],
  "models": [
    { "provider": "fake", "model": "fake-fast", "displayName": "Fake Fast", "priced": true }
  ],
  "rubrics": [
    { "id": "general", "title": "General answer", "text": "Score correctness, format, and completeness from 1 to 5. ...", "hash": "9f2c..." },
    { "id": "code", "title": "Code", "text": "Score correctness, format, and completeness for code answers ...", "hash": "41ab..." }
  ],
  "defaultJudge": { "provider": "fake", "model": "fake-judge" }
}
```

**Rules**

- Only `active` providers and models appear.
- `priced: false` marks a model that cannot be selected until a price is set.
- API keys never appear here.

**Errors:** `internal_error`.

---

### 4.3 `GET /api/runs`

Run history for the home screen, newest first.

**Query**

| Param | Type | Default | Rules |
|---|---|---|---|
| `limit` | integer | 20 | 1–50 |
| `cursor` | string | — | Opaque value from `nextCursor` |
| `status` | string | — | `queued` `running` `finished` `failed` |

**Response 200**

```json
{
  "runs": [
    {
      "id": "3f1a...",
      "status": "finished",
      "createdAt": "2026-11-19T09:14:22.031Z",
      "finishedAt": "2026-11-19T09:15:40.112Z",
      "caseCount": 5,
      "modelCount": 2,
      "bestModel": { "provider": "fake", "model": "fake-quality" }
    }
  ],
  "nextCursor": null
}
```

**Errors:** `validation_error` for a bad `limit`, `cursor`, or `status`.

---

### 4.4 `POST /api/runs`

Validate the request, snapshot the dataset, rubric, model list, prices, and judge model, write a `queued` run, enqueue a job, and return immediately. **This handler never calls a model.**

**Request**

```json
{
  "cases": [
    { "input": "What is 17 × 23?", "expected": "391" },
    { "input": "Explain idempotency in one sentence." }
  ],
  "models": [
    { "provider": "fake", "model": "fake-fast" },
    { "provider": "fake", "model": "fake-quality" }
  ],
  "rubric": { "presetId": "general" },
  "judge": { "provider": "fake", "model": "fake-judge" },
  "locale": "en"
}
```

| Field | Type | Required | Rules |
|---|---|---|---|
| `cases` | array | yes | 1–10 items. Each `input` 1–4000 characters after trim. `expected` optional, ≤ 4000 characters, `null` when absent. |
| `models` | array | yes | 2–6 unique `ModelRef`s. Each must exist and be active. Duplicates collapse or fail validation — the API fails with `validation_error`. |
| `rubric` | object | yes | Either `{ "presetId": "general" \| "code" }` or `{ "title": string, "text": string }` with 20–4000 characters of text. |
| `judge` | `ModelRef` | yes | Must be an active, priced model. May also be one of the competitors; this is recorded as `judgeIsCompetitor: true` and is not blocked. |
| `locale` | string | no | `ar` or `en`, default `en`. |
| Total body | — | — | ≤ 1 MB. |

**Response 202**

```json
{
  "runId": "3f1a2b3c-...",
  "status": "queued",
  "createdAt": "2026-11-19T09:14:22.031Z",
  "location": "/api/runs/3f1a2b3c-..."
}
```

Header: `Location: /api/runs/3f1a2b3c-...`

**Server-side side effects, in one transaction**

1. Normalize cases (trim, drop trailing whitespace, compute `datasetHash = sha256`).
2. Resolve and freeze the rubric text and `rubricHash`.
3. Snapshot the price rows for every selected model and the judge.
4. Insert the run (`queued`), its calls (`pending`), and the job.
5. Enqueue the job only after the transaction commits.

**Errors**

| Code | HTTP | Trigger |
|---|---|---|
| `bad_json` | 400 | Malformed JSON body. |
| `validation_error` | 400 | Any schema violation, including 0 or 11 cases and duplicate models. |
| `no_models` | 400 | Fewer than two models. |
| `too_many_models` | 400 | More than six models. |
| `missing_price` | 422 | A selected model or the judge has no active price. |
| `payload_too_large` | 413 | Body over 1 MB. |

**Worked example**

500 input tokens and 500 output tokens at `$0.15` and `$0.60` per million →
`generationMicro = round(500 × 150000 / 1e6) + round(500 × 600000 / 1e6) = 75 + 300 = 375`.

---

### 4.5 `GET /api/runs/:id`

Poll target for the status page. Must be cheap: one run row plus grouped call counts, no per-case outputs.

**Request:** path param `id` (UUID).

**Response 200 — queued**

```json
{
  "id": "3f1a...",
  "status": "queued",
  "createdAt": "2026-11-19T09:14:22.031Z",
  "startedAt": null,
  "finishedAt": null,
  "progress": { "completedCalls": 0, "totalCalls": 10 },
  "models": [
    { "provider": "fake", "model": "fake-fast", "completed": 0, "total": 5, "status": "pending" },
    { "provider": "fake", "model": "fake-quality", "completed": 0, "total": 5, "status": "pending" }
  ],
  "error": null
}
```

**Response 200 — running**

```json
{
  "id": "3f1a...",
  "status": "running",
  "createdAt": "2026-11-19T09:14:22.031Z",
  "startedAt": "2026-11-19T09:14:25.400Z",
  "finishedAt": null,
  "progress": { "completedCalls": 6, "totalCalls": 10 },
  "models": [
    { "provider": "fake", "model": "fake-fast", "completed": 3, "total": 5, "status": "running" },
    { "provider": "fake", "model": "fake-quality", "completed": 3, "total": 5, "status": "running" }
  ],
  "error": null
}
```

**Response 200 — failed**

```json
{
  "id": "3f1a...",
  "status": "failed",
  "createdAt": "2026-11-19T09:14:22.031Z",
  "startedAt": "2026-11-19T09:14:25.400Z",
  "finishedAt": "2026-11-19T09:15:02.000Z",
  "progress": { "completedCalls": 2, "totalCalls": 10 },
  "models": [],
  "error": { "code": "internal_error", "message": "Worker stopped before completing the run." }
}
```

`status` is one of `queued` `running` `finished` `failed`. A run is `finished` when every call reached a terminal state, including `failed`, `timed_out`, and `judge_error`. Partial failure never fails the whole run.

**Errors:** `not_found` (unknown or malformed id).

---

### 4.6 `GET /api/runs/:id/results`

Everything the table, ranking, and drawer need, in one request. Repeated reads never mutate data.

**Request:** path param `id`, optional query `locale`.

**Response 200 — finished**

```json
{
  "runId": "3f1a...",
  "status": "finished",
  "finishedAt": "2026-11-19T09:15:40.112Z",
  "locale": "en",
  "rankingRule": "score desc, cost asc, latency asc, name asc",
  "ranking": ["fake-quality", "fake-fast"],
  "models": [
    {
      "provider": "fake",
      "model": "fake-fast",
      "displayName": "Fake Fast",
      "score": 4.2,
      "n": 5,
      "avgCostMicro": 375,
      "totalCostMicro": 1875,
      "avgLatencyMs": 812,
      "completed": 5,
      "total": 5,
      "priced": true,
      "sufficient": true,
      "rank": 2
    },
    {
      "provider": "fake",
      "model": "fake-quality",
      "displayName": "Fake Quality",
      "score": 4.8,
      "n": 4,
      "avgCostMicro": 1900,
      "totalCostMicro": 7600,
      "avgLatencyMs": 2310,
      "completed": 5,
      "total": 5,
      "priced": true,
      "sufficient": true,
      "rank": 1
    }
  ],
  "cases": [
    {
      "caseIndex": 0,
      "input": "What is 17 × 23?",
      "expected": "391",
      "outputs": [
        {
          "provider": "fake",
          "model": "fake-fast",
          "status": "ok",
          "output": "391",
          "latencyMs": 640,
          "cost": { "generationMicro": 300, "judgingMicro": 75, "totalMicro": 375 },
          "priced": true,
          "dimensions": { "correctness": 5, "format": 4, "completeness": 4 },
          "score": 4.3,
          "n": 3,
          "judgeModel": "fake-judge",
          "error": null
        }
      ]
    }
  ]
}
```

**Aggregation rules**

- Model aggregates are computed from **calls**, never as an average of per-case averages.
- `score` is the mean of all available dimension values across the model's scored calls, rounded to one decimal.
- `n` counts scored calls, not dimensions.
- `avgCostMicro` and `totalCostMicro` are `null` when no call is priced; `priced` is then `false`.
- `avgLatencyMs` excludes `timed_out` calls.
- `sufficient` is `false` when `completed / total < 0.5`. Insufficient models keep their numbers but are excluded from `ranking` and the recommendation.
- `rank` is `null` for insufficient models and for `score: null`.
- Ties break by score, then cost, then latency, then model name.
- `ranking` contains only model names, in rank order.

**Response 409 — run still in progress**

```json
{ "error": { "code": "results_not_ready", "message": "Run is still running." } }
```

**Errors:** `not_found`, `results_not_ready`.

---

### 4.7 `GET /api/providers`

Settings list. The key is returned as a mask only.

**Response 200**

```json
{
  "providers": [
    {
      "id": "8c21...",
      "slug": "openai",
      "name": "OpenAI",
      "baseUrl": "https://api.openai.com/v1",
      "active": true,
      "keyMask": "sk-...abcd",
      "hasKey": true,
      "models": [
        {
          "name": "gpt-4o-mini",
          "displayName": "GPT-4o mini",
          "inputMicroPerMillion": 150000,
          "outputMicroPerMillion": 600000,
          "maxOutTokens": 1024,
          "active": true,
          "priced": true
        }
      ],
      "createdAt": "2026-12-10T10:00:00.000Z",
      "updatedAt": "2026-12-11T12:30:00.000Z"
    }
  ]
}
```

**Rules:** never returns `apiKey`, ciphertext, nonce, or a full key. `keyMask` is `null` and `hasKey` is `false` when no key is stored.

**Errors:** `internal_error`.

---

### 4.8 `POST /api/providers`

**Request**

```json
{
  "name": "OpenAI",
  "slug": "openai",
  "baseUrl": "https://api.openai.com/v1",
  "apiKey": "sk-...",
  "models": [
    {
      "name": "gpt-4o-mini",
      "displayName": "GPT-4o mini",
      "inputMicroPerMillion": 150000,
      "outputMicroPerMillion": 600000,
      "maxOutTokens": 1024
    }
  ],
  "active": true
}
```

| Field | Rules |
|---|---|
| `name` | 1–80 characters. |
| `slug` | Optional, lowercase `[a-z0-9-]{2,40}`, unique. Derived from `name` when absent. |
| `baseUrl` | Absolute `https` URL ( `http` allowed only for `localhost` ). |
| `apiKey` | 1–500 characters. Encrypted with AES-256-GCM before insert. |
| `models` | 1–20 items. Unique `name`. Prices are integers ≥ 0. `maxOutTokens` 1–32000. |
| `active` | Boolean, default `true`. Activation fails when any model is unpriced. |

**Response 201** — the same provider object as `GET /api/providers`, with `keyMask` and without the key.

**Errors:** `bad_json`, `validation_error`, `invalid_provider` (duplicate slug, unpriced active model, bad URL).

---

### 4.9 `PATCH /api/providers/:id`

Partial update. Present fields replace the stored value; absent fields are untouched.

**Request**

```json
{
  "name": "OpenAI (prod)",
  "baseUrl": "https://api.openai.com/v1",
  "apiKey": "sk-...rotated",
  "active": true,
  "models": [
    {
      "name": "gpt-4o-mini",
      "displayName": "GPT-4o mini",
      "inputMicroPerMillion": 150000,
      "outputMicroPerMillion": 600000,
      "maxOutTokens": 1024,
      "active": true
    }
  ]
}
```

**Rules**

- `models` is the **desired full set**. Models omitted from the list are deactivated, never deleted, because historical runs reference their price snapshots.
- Changing a price affects only **future** runs. Existing runs keep their snapshot (S4-4).
- Sending `apiKey: null` clears the key; sending it as a string replaces it.
- Setting `active: true` fails with `invalid_provider` when any model is unpriced.

**Response 200** — updated provider object.

**Errors:** `bad_json`, `validation_error`, `not_found`, `invalid_provider`.

---

### 4.10 `POST /api/providers/:id/test`

One small request against the provider to verify credentials and reachability. Never returns the provider's raw error body or the key.

**Request**

```json
{ "model": "gpt-4o-mini" }
```

**Response 200 — success**

```json
{ "ok": true, "model": "gpt-4o-mini", "latencyMs": 412, "error": null }
```

**Response 200 — failure (sanitized)**

```json
{
  "ok": false,
  "model": "gpt-4o-mini",
  "latencyMs": 10000,
  "error": { "code": "provider_unreachable", "message": "Authentication failed (401)." }
}
```

**Rules**

- Request uses `max_tokens: 8` and a 10-second timeout.
- Response is `200` in both cases so the UI has one code path. The result is not persisted.
- Never logs or returns headers, request bodies, or the key.

**Errors:** `not_found`, `validation_error` (unknown or inactive model).

---

## 5. Contract tests

The contract is enforced in three places:

1. **Schema tests** (`packages/shared`): every response fixture from the mock API parses against its Zod schema; a deliberately broken fixture fails.
2. **Route tests** (`apps/api`): each endpoint's happy path and every error code in the table above have a test.
3. **Documentation test**: a small test walks the endpoint table in this file and asserts that a schema and a mock handler exist for each path and method. Adding an endpoint only to this document fails CI.

---

## 6. What changes are allowed after the freeze

Allowed in the same PR: renaming an internal field that does not appear in a response, adding an optional response field, adding a new error `details` entry.

Not allowed without a contract PR that touches the document, the schema, and the mock: adding/removing an endpoint, changing a method or path, changing a required request field, changing the meaning of a status or error code.

The rule that prevented "the UI is blocked on the backend" in the reference project: **the mock is updated first, the screen is built against it, and the real handler must satisfy the same fixtures.**
