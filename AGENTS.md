# Mahak AI Agent Rules & Constraints

1. **No Swallowed Errors:** Always preserve error context and tracebacks. Never use empty catch blocks.
2. **Contract-First & Zod Validation:** Maintain type annotations strictly (`src/domain/types.ts`) and validate payloads via Zod schemas (`src/domain/schemas.ts`).
3. **Test Integrity:** NEVER modify test expectations in `tests/` to make failing code pass. Fix the implementation code instead.
4. **Domain Terminology:** Use symbols from `docs/03-domain.md` exclusively.
