---
title: Defer Non-Critical Third-Party Libraries
impact: MEDIUM
impactDescription: keeps third-party code out of the critical path
tags: bundle, third-party, analytics, defer
---

## Defer Non-Critical Third-Party Libraries

Analytics, logging and error tracking do not block user interaction, so they should not sit in the
chunk that does. Load them after the app has mounted.

This project currently ships **no** analytics, error reporter or tag manager. That is a feature,
not an omission to fix — and adding one needs dependency approval.

**Incorrect (third-party code in the entry chunk):**

```tsx
import { init } from 'some-analytics'

init({ token: import.meta.env.VITE_ANALYTICS_TOKEN })   // runs before first paint
```

**Correct (after mount, out of the critical path):**

```tsx
useEffect(() => {
    let cancelled = false

    void import('some-analytics').then(({ init }) => {
        if (!cancelled) init({ token: import.meta.env.VITE_ANALYTICS_TOKEN })
    })

    return () => { cancelled = true }
}, [])
```

For a third-party *script* rather than a module, add it to `index.html` with `async` — see
[rendering-script-defer-async.md](rendering-script-defer-async.md).

**Rules:**

- Nothing that only reports on the user's session should delay rendering for them.
- Guard the async init against unmount — under `StrictMode` the effect runs twice in development,
  and a double `init()` double-counts every event.
- Never let a third-party script see credentials or user data this app is not required to send it.
  The root `CLAUDE.md` treats that as a security review item, not a performance one.
