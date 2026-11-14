---
name: react-frontend
description: Conventions for this React single-page app (React 19, TypeScript strict, React Router, TanStack Query, React Hook Form, Zod, Tailwind 4, shadcn/Radix, Vitest). Use when working on components, hooks, data providers, domain schemas, routes or styles in cocktail-bar-web.
---

# React Frontend

## Scope

Applies to **`cocktail-bar-web`**: a standalone React 19 single-page app in TypeScript strict
mode, built and tested by `vite-plus`, talking to the `cocktail-bar-api` Laravel backend over
REST with Sanctum **stateful cookie** auth.

There is **no SSR, no meta-framework and no server runtime of any kind** in this project. If a
rule anywhere mentions Server Components, server actions, route handlers, `middleware.ts`,
`next/*`, prefetching into a `HydrationBoundary` or hydration mismatch, it is describing a
different architecture and does not apply here. The app ships a static `dist/` bundle; every
byte of logic runs in the browser.

**Read the project's own code before applying anything below.** These rules describe conventions
and the reasons behind them; `src/context.auth/` and `src/context.settings/` are the worked
examples, and where they differ from this document, they win. The root `CLAUDE.md` outranks this
file on architecture and process.

## Stack

| Concern | Choice |
|---|---|
| Framework | React 19 + TypeScript 5.9 strict — SPA, no SSR |
| Routing | React Router v8 (`createBrowserRouter`), route objects in `src/app/router.tsx`, paths in `src/app/routes.ts` |
| Server state | TanStack Query v5 — **the only cache** |
| Forms | React Hook Form + `@hookform/resolvers/zod` |
| Validation | Hand-written parsers at the wire; Zod v4 for form input only |
| UI | Tailwind 4, Radix primitives via shadcn, `lucide-react`, `sonner`, `cva` + `tailwind-merge` |
| Build / lint / format / test | `vite-plus` (`vp`) — one tool for all four |
| Tests | **Vitest** + React Testing Library, `*.test.ts(x)` beside the code |
| Auth | Sanctum stateful cookies — no bearer tokens, no client-side token storage |

There is no Zustand, no Redux, no Jest, no ESLint, no Prettier, no Playwright and no Husky in this
project. Do not reach for one; the root `CLAUDE.md` forbids dependency changes without approval.

## Commands

```bash
npm run dev          # vite dev server on :5173
npm run ci:check     # what CI runs: vp check && tsc --noEmit && vp test --run
npm run check        # lint + format check
npm run check:fix    # lint + format, writing
npm run types:check  # tsc --noEmit
npm run test         # vitest, watch
```

Scope test runs while iterating (`npx vp test --run src/context.auth`), then run the whole gate
before calling anything done. **Always run typecheck, lint and tests before considering a task
complete** — `npm run ci:check` is all three.

The app needs the API running to do anything past the welcome screen:
`cd ../cocktail-bar-api && ./vendor/bin/sail up -d && composer run dev`.

## Rules

- **Use the shared UI components.** Before writing a new component, check
  `src/common/components/ui/` — button, input, card, checkbox, dialog, dropdown-menu, select,
  sheet, sidebar, table, tabs, tooltip, avatar, spinner and more are already there. A second
  parallel implementation of a button is a divergence in behaviour and accessibility, not just in
  styling.
- **`src/common/components/ui/` is vendored shadcn output.** It is deliberately excluded from
  lint and format so re-running the shadcn CLI does not produce a diff storm. Restyle through the
  theme tokens in `src/common/styles/app.css` or a `className` override; do not reformat these
  files.
- **Never hardcode a colour.** Use the semantic tokens (`bg-background`, `text-muted-foreground`,
  `border-border`, `text-accent-700`). Note the trap: bare `accent` is shadcn's neutral hover
  *surface*, while `accent-100…900` is the Classical gold ramp — different scales on purpose.
- **Never inline a raw `<svg>`** outside `components/ui/`. Icons come from `lucide-react` — see
  [rules/icons.md](rules/icons.md).
- **Build forms with React Hook Form + `zodResolver`** and never an untyped form. Server `422`s
  map onto fields with `applyApiErrors(error, setError)`; fall back to `setError('root', …)` for
  anything else. `src/context.auth/components/login-form.tsx` is the worked example.
- **Dialog state is local `useState` plus a Radix `Dialog`.** There is no shared modal-state hook
  in this project; do not invent one for a single dialog.
- **Overriding component variants:** pass `className` and let `tailwind-merge` resolve the
  conflict — components are built as `cn(variants(…), className)`, so later classes win. Never
  reach for Tailwind's `!important` modifier to force a style; it wins the specificity fight by
  making the class unoverridable downstream.
- **One path string, one place.** Routes go in `ROUTES` (`src/app/routes.ts`); API paths go in
  `API_ENDPOINTS` (`src/common/lib/api/endpoints.ts`). No string literals at call sites.
- **Never edit generated or vendored output.** `dist/` is build output. `components/ui/` is CLI
  output. Change the source or the theme, not the artefact.
- **Reference Vitest mocks by full relative path**, not a path alias — alias resolution in the
  test runner can differ from the bundler's, and a mock that fails to apply yields a green test
  of the real implementation.
- **Do not write comments unless 100% necessary.** No inline `//` narration, and no JSDoc added
  merely to describe a component, hook, prop or test — naming, types and structure carry that. In
  test files the `it('…')` string IS the explanation; a comment above it is duplication.
  Reasoning and trade-offs belong in the commit message or PR description. Write one only when
  the information cannot be expressed in code, getting it wrong would cause a real defect, and it
  concerns something outside the file — in this project most likely a **units or measure trap**
  (ml vs oz vs parts), a **cookie or CSRF constraint** imposed by Sanctum, or a browser quirk.
  Exempt because they are code, not commentary: `oxlint-disable*`, `@ts-expect-error`, and
  `no-workarounds`' `// WORKAROUND: …` escape valve. See the root `CLAUDE.md` § *Comments*, which
  this defers to.

## Project hard rules worth repeating here

The root `CLAUDE.md` is the authority, but these two decide most code review outcomes:

1. **No interpretation logic in React.** No scoring, ranking, tier derivation, substitution
   guessing or unit arithmetic on measures. The API computes; this app renders.
2. **Every API response is parsed by a hand-written parser** from the owning context's
   `_domain/`, and every request goes through `fetchApi`. No bare `fetch` or `axios` in a hook or
   component, and no Zod at the wire — it is for form input only.

## Rule files

Detailed rules live under `rules/` and auto-attach via `paths:` frontmatter when editing matching
files:

- [rules/app-structure.md](rules/app-structure.md) — the SPA shell *above* the contexts: entry,
  router, guards, providers, pages, `common/`
- [rules/layered-architecture.md](rules/layered-architecture.md) — the four layers *inside* a
  context, and the dependency rule that makes them worth having
- [rules/coding-standards.md](rules/coding-standards.md) — decomposition, hook design, test
  alignment
- [rules/icons.md](rules/icons.md) — `lucide-react` through `components/ui/icon.tsx`
- [rules/rem-size-guidelines.md](rules/rem-size-guidelines.md) — the type scale and when px is
  acceptable
- [rules/infinite-scrolling.md](rules/infinite-scrolling.md) — not used yet; read before adding
  the first paginated list
- [rules/feature-flags.md](rules/feature-flags.md) — not used yet; read before adding the first
  flag
- [rules/websocket.md](rules/websocket.md) — not used yet; read before adding realtime
