---
title: Choose parse() or safeParse() by Who Handles the Failure
impact: CRITICAL
impactDescription: an uncaught ZodError is a blank screen; a swallowed one is silent bad data
tags: parse, safeParse, error-handling, validation
---

## Choose parse() or safeParse() by Who Handles the Failure

`parse()` throws a `ZodError`. `safeParse()` returns `{ success, data | error }`. Neither is
universally right — the question is **who is going to handle the failure**.

- Something upstream already turns a thrown error into UI → **`parse()`**
- You need to branch locally, right here → **`safeParse()`**

### `parse()` is correct at the fetch boundary

`fetchApi` uses `schema.parse(payload)` deliberately:

```ts
// src/common/lib/api/client.ts
if (!schema) return null

return schema.parse(payload)
```

The throw is not unhandled — TanStack Query catches it and surfaces it as `error`, so a response
that does not match its schema becomes a visible error state instead of malformed data flowing
into components. Returning a `safeParse` result here would force every provider, hook and
component to re-check `success`, and the first one to forget would render `undefined`.

**A schema mismatch should be loud.** It means the API changed and this app has not caught up.

### `safeParse()` is correct when you branch locally

```ts
const stored = localStorage.getItem('filters')
const result = filtersSchema.safeParse(stored ? JSON.parse(stored) : null)

const filters = result.success ? result.data : defaultFilters
```

Browser storage is untrusted and recoverable: it can be stale from an older release, edited by
hand, or absent. There is no sensible error screen for "your saved filters were from last month",
so fall back to a default and move on.

**The result object:**

```ts
// success
{ success: true, data: T }

// failure
{ success: false, error: ZodError }

// narrowing works automatically
if (result.success) {
    result.data          // T, fully typed
} else {
    result.error.issues  // the validation issues
}
```

### Rules

- **`parse()`** inside `fetchApi`, and in tests where a throw is the assertion.
- **`safeParse()`** for `localStorage`, `sessionStorage`, URL search params, a pasted value, or
  anything with a usable fallback.
- **Never `try/catch` a `safeParse`** — it does not throw, and the `catch` will quietly hide a
  real bug elsewhere in the block.
- **Never swallow a failure to carry on with partial data.** Either you have a real fallback, or
  the failure belongs upstream.
- Form input does not need either: `zodResolver(schema)` runs the schema for you and puts the
  issues on the fields.

Reference: [Zod API — safeParse](https://zod.dev/api#safeparse)
