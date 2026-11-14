---
title: Scope Loading Boundaries to the Slow Part
impact: HIGH
impactDescription: faster perceived paint, no whole-page blanking
tags: async, suspense, loading-state, skeleton
---

## Scope Loading Boundaries to the Slow Part

Don't make the whole screen wait for the slowest thing on it. Render the shell immediately and
show a loading state only where the data is actually missing.

(Upstream this rule is about streaming async Server Components. There is no server render here, so
the SPA form is about where loading state lives — same goal, different mechanism.)

**Incorrect (one flag blanks the page):**

```tsx
function BarPage() {
    const { bar, isLoadingBar } = useBar()
    const { matches, isLoadingMatches } = useBarMatches()

    if (isLoadingBar || isLoadingMatches) return <Spinner />   // ✗ header and nav vanish too

    return (
        <AppLayout>
            <Heading title={bar.name} />
            <MatchList matches={matches} />
        </AppLayout>
    )
}
```

The layout, heading and navigation are all withheld for data only the list needs — and every
refetch flashes the page back to a spinner.

**Correct (the shell renders, the slow region has its own state):**

```tsx
function BarPage() {
    const { bar, isLoadingBar } = useBar()

    return (
        <AppLayout>
            {isLoadingBar ? <Skeleton className="h-8 w-48" /> : <Heading title={bar.name} />}

            <MatchListSection />      {/* owns its own query and its own skeleton */}
        </AppLayout>
    )
}
```

**Rules:**

- **Put the loading state next to the data that is missing**, which usually means the component
  that calls the hook owns the skeleton. A page that destructures four `isLoading` flags is a page
  that should have been four components.
- **A skeleton shaped like the content beats a spinner.** It reserves the right space, so content
  arriving does not shove the page around.
- **Do not reuse the app-wide `Suspense` in `main.tsx` as a data boundary.** It exists for lazy
  route chunks; anything that falls through to it blanks the viewport.
- **Independent queries run in parallel already.** Two hooks in one component fire together —
  TanStack Query does not serialise them. A waterfall only appears when one query's `enabled` or
  key depends on another's result, and that is worth avoiding: ask the API for one payload that
  answers both instead. The root `CLAUDE.md` makes this the API's job anyway.
- `useSuspenseQuery` is available if you prefer a `Suspense` boundary to an `isPending` branch.
  Pick one per feature and be consistent; mixing both in one tree makes the loading behaviour hard
  to reason about.

**When a single blocking state is right:** a route guard deciding whether the user may be here at
all (`RequireAuth` renders a spinner, deliberately — rendering the page first would flash content
to someone about to be redirected).
