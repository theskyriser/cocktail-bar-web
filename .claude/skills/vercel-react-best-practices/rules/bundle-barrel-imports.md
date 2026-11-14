---
title: Avoid Barrel File Imports
impact: CRITICAL
impactDescription: slow dev server, larger chunks
tags: bundle, imports, tree-shaking, barrel-files, vite
---

## Avoid Barrel File Imports

A **barrel file** is an entry point that re-exports other modules (`index.ts` doing
`export * from './thing'`). Importing one named thing from a barrel can pull the whole module
graph behind it into the dev server's work and, when side effects defeat tree-shaking, into the
production chunk.

Icon and component libraries are the worst offenders — some have thousands of re-exports in their
entry file.

### In this project

Vite pre-bundles dependencies with esbuild (`optimizeDeps`), so the dev-server cost of
`import { Martini } from 'lucide-react'` is paid once per cold start rather than per request, and
the production Rollup build tree-shakes `lucide-react`'s ESM properly. **So keep writing the
normal named import** — it is correct here:

```tsx
import { Martini, ShoppingCart } from 'lucide-react'
```

**Do not deep-import to "optimize" it:**

```tsx
import Martini from 'lucide-react/dist/esm/icons/martini'   // ✗
```

`lucide-react` does not ship `.d.ts` files for those subpaths, so under `strict` this resolves to
an implicit `any` — you would be trading a type error for a bundle micro-win that Rollup already
handles.

### The actionable rule: don't write your own barrels

The real risk in this codebase is adding `index.ts` re-export files inside `src/`:

```ts
// src/context.bar/components/index.ts     ✗ don't create this
export * from './bar-view'
export * from './bar-actions'
```

```tsx
import { BarView } from '@/context.bar/components'          // ✗
import { BarView } from '@/context.bar/components/bar-view'  // ✓
```

Importing one component then drags in every sibling — and every hook, schema and provider *they*
import — which defeats route-level code splitting, since two routes that each need one component
from the barrel now share everything in it. Import the file you mean. It is also the import the
reader can follow.

Libraries commonly affected: `lucide-react`, `@mui/material`, `@tabler/icons-react`,
`react-icons`, `lodash`, `date-fns`, `rxjs`.

Reference: [Vite dep pre-bundling](https://vite.dev/guide/dep-pre-bundling.html)
