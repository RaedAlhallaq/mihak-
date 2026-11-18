# How we order what we send to an agent (stable first, changing last)

1. Tools and their descriptions — rarely change
2. Rules: `AGENTS.md` (+ folder rules, when one exists) — change weekly at most
3. Docs index, repo map — change when structure changes
4. The story and its acceptance criteria — change per task
5. Progress file, recent errors, the ask — change every turn

Why: providers cache the longest identical prefix of a request. Anything that changes near the top (a date, a random ID, a reordered list, a rules file edited hourly) breaks the cache for everything after it, so it costs more and runs slower.

For this repository specifically:

- Keep `docs/01-brief.md`, `docs/02-spec.md`, `docs/03-domain.md`, `docs/04-architecture.md`, `docs/adr/`, and `docs/prompts.md` before the story text; they are stable.
- Put `docs/progress.md` and the issue number last. Do not paste today's date at the top of a rules file.
- Read `docs/index.md` first, then open only the documents the task needs. A long document that is not needed is a distractor.
- Tool output is context too: read the lines you need, not the whole file; report the error plus its surroundings, not a thousand lines of log.
- Between phases, write the handoff into `docs/progress.md` and start a new session. Do not carry a polluted session into implementation.

Measurement: `node scripts/context-size.mjs` (when such a script exists) reports the always-loaded context. Until then, count the lines of `AGENTS.md` and `CLAUDE.md` manually and keep them small.
