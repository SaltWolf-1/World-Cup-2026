---
name: Orval codegen gotcha — schemas dir
description: Do not use the schemas directory option in orval zod config; causes duplicate export conflicts.
---

# Orval Codegen — Schemas Directory Conflict

## Problem
Setting `schemas: { path: "generated/types", type: "typescript" }` in the `zod` output config causes Orval to generate BOTH:
1. `generated/api.ts` — Zod schemas with const names like `CreateSweepstakeBody`
2. `generated/types/index.ts` — TypeScript type aliases with the same names

The auto-generated `src/index.ts` does `export * from "./generated/api"` AND `export * from "./generated/types"` — causing TS2308 duplicate export errors.

## Fix
Remove `schemas: { path: ..., type: "typescript" }` from the zod output config in `lib/api-spec/orval.config.ts`.

The `src/index.ts` should only contain:
```ts
export * from "./generated/api";
```

## Why it's safe
Zod schemas (`z.object(...)`) already carry TypeScript types via `z.infer<typeof Schema>`. The separate types directory is redundant.

## Important
Orval REGENERATES `src/index.ts` on every codegen run. Any manual edits to it will be overwritten. The fix must be in the orval config, not in index.ts.

**Why:** Discovered during auth integration when new schemas caused naming conflicts.
