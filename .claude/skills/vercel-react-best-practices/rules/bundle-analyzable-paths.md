---
title: Prefer Statically Analyzable Import Paths
impact: HIGH
impactDescription: avoids accidental broad bundles
tags: bundle, vite, rollup, dynamic-import, path
---

## Prefer Statically Analyzable Import Paths

Vite and Rollup decide what goes in which chunk by reading `import()` calls at build time. Hide
the path inside a variable and the bundler either fails outright, or includes every file that
could possibly match — a chunk containing things no route needs.

**Incorrect (Rollup cannot tell what may be imported):**

```ts
const PAGE_MODULES = {
  dashboard: './pages/dashboard',
  profile: './pages/profile',
} as const

const Page = await import(PAGE_MODULES[name])   // ✗ fails: dynamic import variable
```

A bare variable in `import()` is an error in Rollup without a plugin, and even with one it
compiles to "include everything under that directory".

**Correct (an explicit map of thunks):**

```ts
const PAGE_MODULES = {
  dashboard: () => import('./pages/dashboard'),
  profile: () => import('./pages/profile'),
} as const

const Page = await PAGE_MODULES[name]()
```

Each `import()` is now a literal the bundler can see, so each gets its own chunk and the map keys
stay type-checked. This is the same shape `src/app/router.tsx` uses for its `lazy()` routes.

**When you genuinely want a directory**, say so explicitly with Vite's glob import rather than
letting a variable widen it:

```ts
const modules = import.meta.glob('./recipes/*.ts')   // explicit, and typed as a known map
```

**Rules:**

- Never pass a variable to `import()`. Map keys to thunks instead.
- Keep the alias set to one (`@/` → `src/`). Every extra alias is another resolution rule Vite and
  Vitest must agree on.
- A partially-static path (`import('./icons/' + name)`) is the same problem as a fully dynamic one.

Reference: [Vite features](https://vite.dev/guide/features.html),
[Rollup dynamic import vars](https://www.npmjs.com/package/@rollup/plugin-dynamic-import-vars)
