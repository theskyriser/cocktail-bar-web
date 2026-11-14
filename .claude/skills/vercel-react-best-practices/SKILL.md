---
name: vercel-react-best-practices
description: React performance guidelines from Vercel Engineering, pruned and retargeted for this client-rendered React SPA (Vite, React Router, TanStack Query). Use when writing, reviewing or refactoring React code — components, data fetching, bundle size, re-renders or hot-path JavaScript.
license: MIT
metadata:
  author: vercel
  version: "1.0.0-spa"
---

# Vercel React Best Practices

Performance optimization rules for React applications, originally maintained by Vercel. **58 rules
across 7 categories**, prioritized by impact.

## This is a tailored fork

Upstream, this skill covers React *and* Next.js. `cocktail-bar-web` is a client-rendered SPA on
Vite with no server runtime, so this copy has been pruned and retargeted:

- **Removed** — the whole `server-*` category (React Server Components, server actions,
  `React.cache`, `after()`, RSC prop serialization), `async-api-routes`, and
  `rendering-hydration-suppress-warning`. None of them have a meaning in an app with no server
  render.
- **Retargeted** — `next/dynamic` → `React.lazy`, SWR → TanStack Query, Next bundler notes → Vite
  and Rollup, hydration flicker → applying client-only state in `index.html`. Where a rule's
  upstream form differed, the file says so in a parenthetical.
- **Removed** — the compiled `AGENTS.md`. It was generated output whose build script is not
  vendored here, so it could not be regenerated and would have contradicted the pruned rules.
  `rules/` is now the only source.

If you find Next.js guidance anywhere in here, it is a leftover — treat the SPA as the truth and
fix the rule.

## When to Apply

- Writing new React components
- Implementing client-side data fetching
- Reviewing code for performance problems
- Reducing bundle size or improving load time
- Chasing an unnecessary re-render

These rules are about **performance**. They do not override the project's architecture rules — the
root `CLAUDE.md` and the `react-frontend` skill win on layering, data flow and conventions. In
particular, no performance argument justifies moving interpretation logic into the client.

## Rule Categories by Priority

| Priority | Category | Impact | Prefix | Rules |
|---|---|---|---|---|
| 1 | Eliminating Waterfalls | CRITICAL | `async-` | 5 |
| 2 | Bundle Size Optimization | CRITICAL | `bundle-` | 6 |
| 3 | Client-Side Data Fetching | MEDIUM-HIGH | `client-` | 4 |
| 4 | Re-render Optimization | MEDIUM | `rerender-` | 15 |
| 5 | Rendering Performance | MEDIUM | `rendering-` | 10 |
| 6 | JavaScript Performance | LOW-MEDIUM | `js-` | 14 |
| 7 | Advanced Patterns | LOW | `advanced-` | 4 |

## Quick Reference

### 1. Eliminating Waterfalls (CRITICAL)

- `async-cheap-condition-before-await` — check cheap sync conditions before awaiting
- `async-defer-await` — move `await` into the branch that actually uses it
- `async-parallel` — `Promise.all()` for independent operations
- `async-dependencies` — parallelize around partial dependencies
- `async-suspense-boundaries` — scope loading boundaries to the slow region

### 2. Bundle Size Optimization (CRITICAL)

- `bundle-barrel-imports` — import the file you mean; don't write your own barrels
- `bundle-analyzable-paths` — keep `import()` paths literal so Rollup can chunk them
- `bundle-dynamic-imports` — `React.lazy` for heavy components
- `bundle-defer-third-party` — load analytics and logging after mount
- `bundle-conditional` — load a module only when the feature is used
- `bundle-preload` — preload on hover/focus for perceived speed

### 3. Client-Side Data Fetching (MEDIUM-HIGH)

- `client-query-dedup` — one query key, one request, shared by every consumer
- `client-event-listeners` — one global listener shared via a registry
- `client-passive-event-listeners` — passive listeners for scroll and touch
- `client-localstorage-schema` — version and minimize what you store

### 4. Re-render Optimization (MEDIUM)

- `rerender-defer-reads` — don't subscribe to state only used in callbacks
- `rerender-memo` — extract expensive work into memoized components
- `rerender-memo-with-default-value` — hoist default non-primitive props
- `rerender-dependencies` — prefer primitive effect dependencies
- `rerender-derived-state` — subscribe to derived booleans, not raw values
- `rerender-derived-state-no-effect` — derive during render, not in an effect
- `rerender-functional-setstate` — functional `setState` for stable callbacks
- `rerender-lazy-state-init` — pass a function to `useState` for expensive values
- `rerender-simple-expression-in-memo` — don't memo a primitive expression
- `rerender-split-combined-hooks` — split hooks with independent dependencies
- `rerender-move-effect-to-event` — interaction logic belongs in the handler
- `rerender-transitions` — `startTransition` for non-urgent updates
- `rerender-use-deferred-value` — keep input responsive during expensive renders
- `rerender-use-ref-transient-values` — refs for frequent transient values
- `rerender-no-inline-components` — never define a component inside a component

### 5. Rendering Performance (MEDIUM)

- `rendering-hydration-no-flicker` — apply client-only visual state before first paint
- `rendering-script-defer-async` — `defer`/`async` on script tags
- `rendering-resource-hints` — `preconnect`/`preload` in `index.html`
- `rendering-conditional-render` — ternary, not `&&`
- `rendering-usetransition-loading` — prefer `useTransition` for loading state
- `rendering-activity` — the `Activity` component for show/hide
- `rendering-content-visibility` — `content-visibility` for long lists
- `rendering-hoist-jsx` — extract static JSX out of the component
- `rendering-animate-svg-wrapper` — animate a wrapper, not the SVG element
- `rendering-svg-precision` — reduce SVG coordinate precision

### 6. JavaScript Performance (LOW-MEDIUM)

- `js-index-maps`, `js-set-map-lookups` — build a `Map`/`Set` for repeated lookups
- `js-cache-property-access`, `js-cache-function-results`, `js-cache-storage` — cache in hot paths
- `js-combine-iterations`, `js-flatmap-filter` — one pass instead of several
- `js-early-exit`, `js-length-check-first` — cheapest check first
- `js-hoist-regexp` — hoist `RegExp` out of loops
- `js-min-max-loop` — a loop, not a sort, for min/max
- `js-tosorted-immutable` — `toSorted()` instead of mutating
- `js-batch-dom-css` — group CSS changes
- `js-request-idle-callback` — defer non-critical work to idle time

### 7. Advanced Patterns (LOW)

- `advanced-effect-event-deps` — don't put `useEffectEvent` results in effect deps
- `advanced-event-handler-refs` — store event handlers in refs
- `advanced-init-once` — initialize once per app load
- `advanced-use-latest` — `useLatest` for stable callback refs

## How to Use

Read the individual rule file for the explanation and examples:

```
rules/async-parallel.md
rules/bundle-barrel-imports.md
```

Each file contains why it matters, an incorrect example, a correct example, and context. Measure
before optimizing: most of §6 is only worth applying in a demonstrated hot path, and a `useMemo`
added on suspicion is a dependency array to maintain for nothing.
