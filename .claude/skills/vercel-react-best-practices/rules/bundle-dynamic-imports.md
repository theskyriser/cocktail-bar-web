---
title: Lazy-Load Heavy Components
impact: CRITICAL
impactDescription: directly affects TTI and LCP
tags: bundle, dynamic-import, code-splitting, react-lazy
---

## Lazy-Load Heavy Components

Use `React.lazy` with a `Suspense` boundary to keep large components out of the initial chunk.
Vite splits a `import()` into its own chunk automatically.

This app already does it per route in `src/app/router.tsx` — every page is lazy except `Welcome`,
and one app-wide `Suspense` in `main.tsx` catches them. The rule below is for heavy components
*within* a page.

**Incorrect (a heavy editor/chart/map ships in the main chunk):**

```tsx
import { RecipeChart } from './recipe-chart'

function RecipePanel({ recipeId }: { recipeId: number }) {
  return <RecipeChart recipeId={recipeId} />
}
```

**Correct (loads on demand):**

```tsx
import { lazy, Suspense } from 'react'

const RecipeChart = lazy(() => import('./recipe-chart').then(m => ({ default: m.RecipeChart })))

function RecipePanel({ recipeId }: { recipeId: number }) {
  return (
    <Suspense fallback={<Skeleton className="h-64" />}>
      <RecipeChart recipeId={recipeId} />
    </Suspense>
  )
}
```

Two details that bite:

- **`React.lazy` requires a default export.** A named export needs the
  `.then(m => ({ default: m.Thing }))` shim above. This is why `src/app/pages/` is the one place a
  `default export` is correct in this codebase.
- **Give it a nearer `Suspense` with a fallback shaped like the content.** Without one it falls
  through to the app-wide spinner in `main.tsx`, which blanks the whole page to load one panel.

**When not to bother:** a component that is visible on first paint, or one small enough that the
extra request costs more than the bytes saved. Lazy-loading something above the fold trades a
bundle win for a visible loading state, which is usually the wrong trade.
