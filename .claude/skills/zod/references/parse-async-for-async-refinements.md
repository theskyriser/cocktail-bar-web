---
title: Use parseAsync for Async Refinements
impact: CRITICAL
impactDescription: Using parse() with async refinements throws an error; async validation silently fails or crashes the application
tags: parse, async, parseAsync, refinement
---

## Use parseAsync for Async Refinements

If your schema uses `refine()` or `superRefine()` with async validation (like database lookups), you must use `parseAsync()` or `safeParseAsync()`. Using synchronous `parse()` with async refinements throws an error.

**Incorrect (sync parse with async refinement):**

```typescript
import { z } from 'zod'

const userSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
}).refine(
  async (data) => {
    // Async database check
    const exists = await db.users.findByEmail(data.email)
    return !exists
  },
  { message: 'Email already registered' }
)

// This throws an error!
const user = userSchema.parse(formData)
// Error: Async refinement encountered during synchronous parse operation.
// Use .parseAsync instead.
```

**Correct (using parseAsync):**

```typescript
import { z } from 'zod'

const userSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
}).refine(
  async (data) => {
    const exists = await db.users.findByEmail(data.email)
    return !exists
  },
  { message: 'Email already registered' }
)

// Use parseAsync for async refinements
const user = await userSchema.parseAsync(formData)

// Or safeParseAsync for error handling
const result = await userSchema.safeParseAsync(formData)
if (!result.success) {
  console.log(result.error.issues)
}
```

**Async transforms also require parseAsync:**

```typescript
const enrichedUserSchema = z.object({
  userId: z.string().uuid(),
}).transform(async (data) => {
  // Async data enrichment
  const user = await db.users.findById(data.userId)
  return {
    ...data,
    email: user.email,
    name: user.name,
  }
})

// Must use parseAsync
const enrichedUser = await enrichedUserSchema.parseAsync({ userId: '123' })
```

**Async refinements belong on the server, not in this app**

An async refinement exists to ask a database something — "is this email already registered?" In
`cocktail-bar-web` there is no database and no server runtime, so a schema here never needs to be
async. That check lives in `cocktail-bar-api`, which answers a `422` with `{message, errors}`, and
this app renders it:

```ts
try {
    await registerUser(values)
} catch (error) {
    if (!applyApiErrors(error, setError)) {
        setError('root', { message: 'Could not create your account.' })
    }
}
```

Reaching for `safeParseAsync` in a client schema is a sign the validation is being duplicated on
the wrong side of the wire — and a client-side uniqueness check is advisory at best, since nothing
stops the request being made anyway. Keep client schemas synchronous: shape, required fields,
lengths, formats. Anything needing data the client does not have is the API's answer to give.

Reference: [Zod API — parseAsync](https://zod.dev/api#parseasync)
