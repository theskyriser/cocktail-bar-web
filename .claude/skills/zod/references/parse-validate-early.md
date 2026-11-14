---
title: Validate at System Boundaries
impact: CRITICAL
impactDescription: validating deep in the UI lets corrupt data propagate; validating at the boundary catches it before it spreads
tags: parse, boundaries, architecture, defense-in-depth
---

## Validate at System Boundaries

Validate external data the moment it enters the app. In this SPA there is exactly one inbound
boundary worth guarding — **the API response** — plus two smaller ones: browser storage and URL
search params.

The boundary is the `data/` layer. Everything above it (hooks, components) must be able to assume
the data is already the right shape.

**Incorrect (unvalidated data flows into the UI):**

```ts
// context.bar/data/getBarMatches.ts
export async function getBarMatches(barId: number) {
    const response = await fetch(`/api/bars/${barId}/matches`)

    return (await response.json()) as TBarMatches   // ✗ a cast is not a check
}
```

A cast tells TypeScript to stop asking. At runtime the object is whatever the server sent, so a
renamed field surfaces as `undefined` three layers up — in a component, with no indication that
the API changed.

**Correct (validated at the boundary, typed above it):**

```ts
// context.bar/data/getBarMatches.ts
export async function getBarMatches(opts: {
    data: { barId: number };
    signal?: AbortSignal;
}): Promise<TBarMatches> {
    const response = await fetchApi(API_ENDPOINTS.barMatches(opts.data.barId), {
        schema: barMatchesSchema,       // parsed here, once
        signal: opts.signal,
    });

    return barMatchesAdapter(response);
}
```

```ts
// the hook and every component above it receive TBarMatches, guaranteed
export function useBarMatches(barId: number) {
    const { data, isPending } = useQuery({ … });
    return { matches: data?.matches ?? [], isLoadingMatches: isPending };
}
```

If the API drops a field, the `parse` throws, TanStack Query surfaces an error state, and the
failure points at the boundary where the contract broke — not at the component that happened to
read the missing key.

**The boundaries in this app:**

```ts
// 1. API responses — always, via fetchApi's schema. The main one.
await fetchApi(path, { schema: recipeSchema })

// 2. Browser storage — stale or hand-edited; safeParse with a fallback
const result = filtersSchema.safeParse(JSON.parse(localStorage.getItem('filters') ?? 'null'))

// 3. URL search params — user-editable by definition
const page = pageParamSchema.safeParse(searchParams.get('page'))
```

**Where NOT to validate:**

- In a hook or component that received data from the data layer — it is already parsed, and
  re-parsing is the double-validation anti-pattern (see
  [parse-avoid-double-validation.md](parse-avoid-double-validation.md)).
- Form input — `zodResolver(schema)` is already the boundary for that path.
- Between two pure functions in `_domain/`. Types are the guarantee there; a runtime check means
  you do not believe your own boundary.

Reference: [Zod API — parse](https://zod.dev/api#parse)
