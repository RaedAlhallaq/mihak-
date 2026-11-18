# Prompts — the lecture prompts, adapted to Mihak

These are **instructions to an agent**, not product code. Each prompt names the files the agent may read and the point where it must stop. Copy the prompt, replace the bracketed story number, and keep the stop condition. The engineer approves the plan; the agent does not decide architecture.

---

## 1. Interviewer — use before writing the spec (Lecture 2)

```text
You are an expert requirements analyst. I will describe my project idea in one paragraph.
Do not propose solutions, technologies, or requirements.
Ask me ten questions that reveal: users and roles, the main path, edge cases,
what happens on failure, implicit business rules, and what is out of scope.
Ask three questions at a time and wait for my answers.
At the end, summarise what you understood and label every point you inferred
that I did not say explicitly.

Idea: [paste docs/01-brief.md]
```

Record the most revealing question and every inferred assumption in `docs/02-spec.md` §7.

## 2. Spec reviewer — use after drafting the spec (Lecture 2)

```text
Review this specification as a skeptical test engineer.
1. Mark every acceptance criterion that cannot be tested automatically and propose testable wording.
2. List every vague word.
3. List five uncovered edge cases or failure paths.
4. List any contradiction between two requirements.
Do not praise and do not rewrite the document; give me the findings only.

Specification: [docs/02-spec.md]
```

Record one finding you accepted, and one you rejected with the reason, in the PR description.

## 3. Domain draft (Lecture 2)

```text
Read the specification and the glossary.
Write the entity-relationship diagram in Mermaid using only the code names from the glossary.
Under the diagram, list every domain invariant and where it is enforced:
database constraint, code validation, or both.
Do not add an entity that no story in the spec needs, and name any entity you did add and why.

Specification: docs/02-spec.md
Glossary: docs/03-domain.md
```

Reject any generated diagram containing UI state or a redundant relation. See the checklist in `docs/03-domain.md` §8.

## 4. ADR skeptic (Lecture 2)

```text
This is an architecture decision record I wrote for my project, with its non-functional requirements.
You are a skeptical architect. Do not agree with me.
1. What are the three strongest arguments against my decision?
2. Which alternative did I not study that I should have?
3. Under what circumstance would my decision be wrong within a year?
4. Which negative consequence did I fail to write down?

ADR: docs/adr/0001-modular-monolith-and-frozen-contract.md
NFRs: docs/02-spec.md section 5
```

Write the answers into the ADR's **Skeptic pass** section before accepting it.

## 5. Plan — use at the start of every story (Lecture 2)

```text
Read AGENTS.md and every document in docs/ before anything else.
Task: the walking skeleton and story [N]. Do not write code yet.
Give me a plan: the files you will create, the commands you will run,
and one test per acceptance criterion named with its AC number.
List every assumption and every dependency you would add, with the reason.
Stop after the plan and wait for my approval.
```

The plan is reviewed against `docs/04-architecture.md` and `AGENTS.md` before execution begins.

## 6. Contract — use after the plan is approved (Lecture 3)

```text
Read AGENTS.md, docs/02-spec.md and docs/03-domain.md.
Work on story [N] only.
Write the contract only: types, function signatures, every possible result including
errors, and the dependencies passed in from outside.
Do not write the implementation. Make the function body throw "not implemented".
Then stop and tell me which acceptance criterion the contract does not cover.

Contract to update: docs/planning/api-contract.md
Shared schemas: packages/shared
```

Review twenty lines of types before allowing two hundred lines of implementation.

## 7. Tests — use before implementation (Lecture 3)

```text
Read story [N] and its acceptance criteria in docs/02-spec.md.
Write one test per criterion, named ac_N_M, in Given/When/Then form.
Derive the tests from the criteria, not from any implementation.
Run them now and confirm they fail for the right reason.
Do not edit any existing test. If you think a test is wrong, stop and explain why.
```

A test that passes before implementation tests nothing. The red test is good news.

## 8. Implementation (Lecture 2 and 3)

```text
Execute the approved plan step by step.
Run the tests after each step. Do not modify documentation files or decision records.
If you need to deviate from the plan, stop and ask me.
At the end, summarise what you did, which criteria are met, and which are not.
```

Commit in small steps: `feat(scope): contract (story N)`, `test(scope): failing tests for AC N.M`, `feat(scope): rule via injected clock (AC N.M)`.

## 9. Independent reviewer (Lecture 3)

```text
You are a skeptical code reviewer who did not write this change.
You have: the story and its acceptance criteria, AGENTS.md, the review checklist, and the diff.
Review with the attached checklist and give me a table: file and line, finding, severity —
blocker, important, or suggestion.
Start with the tests: is there a test per criterion that fails when the behaviour breaks?
Do not praise and do not rewrite the code. If a section has no problem, say so explicitly.

Checklist: docs/review-checklist.md
```

Use a fresh session or a different model. Do not hand it the authoring conversation.

## 10. i18n extraction (Lecture 3)

```text
Extract every user-visible string in this slice into the locale resources.
Keys follow module -> screen -> purpose, never the English text.
Use named placeholders and complete sentences, not concatenations.
Produce all six Arabic plural categories for any count message.
Then run the completeness check and report missing keys or differing placeholders.
Do not write a string literal in a component.
```

Targets: `locales/ar.json`, `locales/en.json`, and the `i18n` step of `pnpm check` (created in S0-1 / S3-3).

## 11. Rules-file audit (Lecture 4)

```text
Read AGENTS.md line by line. For each line, decide whether an agent could infer it
from the code, the configuration, or the framework documentation.
Produce a table: the line, inferable or not, and the evidence.
Do not edit the file — I will decide.
```

Only what the agent cannot infer earns a place in `AGENTS.md`. Delete lines that become gates or obvious conventions.
