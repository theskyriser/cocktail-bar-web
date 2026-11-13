# CLAUDE.md — cocktail-bar-web

## What this project is

The React front end of the cocktail calculator: **you tell it what ingredients
you have, and it shows you what you can make.** It is a standalone SPA. It owns
no data and no business rules — it renders what
[`cocktail-bar-api`](https://github.com/theskyriser/cocktail-bar-api) computes.

The product splits in two, and the halves live on opposite sides of the wire:

- **Intake** — getting ingredients in and agreeing on what they *are*. The user
  types free text ("gin", "Gordon's", "sweet vermouth", "red vermouth"); the API
  resolves it to a known ingredient or an honest "I don't recognise this". This
  app collects the text and renders the answer. It does **not** guess, normalise,
  fuzzy-match or keep its own ingredient list.
- **Interpretation** — taking the stock on hand and a body of recipes and
  deciding what is makeable, what is makeable with a substitution, and what is
  one bottle away. That is the API's interpreter service, start to finish. This
  app **never re-scores, re-ranks or re-filters** what comes back. Sorting a
  table column the server already ordered is fine; recomputing a match tier in
  TypeScript is not.

If a screen needs a different answer, the API should be sending a different
answer.

### State of play (2026-11-13)

Fresh repo, split out of the former Inertia monolith on 2026-11-13. What exists:
the full app shell (sidebar and header layouts, Classical theme, shadcn/Radix
primitives), auth screens (log in, register, forgot/reset password, verify
email), the settings area (profile, security, appearance), a typed Sanctum-aware
fetch client, TanStack Query wiring, and a React Router route tree with
auth/guest/verified guards.

There is **no cocktail domain code yet** — no `context.ingredient/`,
`context.recipe/` or `context.bar/`. The dashboard is still the starter kit's
placeholder panels. Everything in § *Where the cocktail domain goes* describes
where new code should land, not code you can go and read.

---

## Read first, and in this order

1. **This file** — the architecture, the layering and how work is done here.
2. **`../cocktail-bar-api/CLAUDE.md`** — the other half of the contract: the
   domain model, the matching rules, and what the API is responsible for. If the
   two repos are not checked out side by side, read it on GitHub. **It is the
   authority on the domain**; this file is the authority on the front end.
3. **`docs/design/cocktail-calculator/README.md` in the API repo** — the design
   handoff: product shape, data model, matching rules, wireframe options. It
   decides *what the product does*. Open `Cocktail App Wireframes.dc.html` in a
   browser (it needs `support.js` and `_ds/` beside it) to see the screens.
4. **`.claude/skills/`** — the skill set. See § *Skills*.

On a conflict: the API repo's `CLAUDE.md` wins on domain and matching rules, this
file wins on front-end architecture and process. If a skill contradicts either,
this file wins — **say so rather than quietly following the skill.**

---

## Stack

| Concern | Choice |
|---|---|
| Framework | React 19 + TypeScript 5.9 (strict), no SSR, no meta-framework |
| Routing | React Router (`react-router` v8) — `createBrowserRouter`, route objects in `src/app/router.tsx`, paths in `src/app/routes.ts` |
| Server state | TanStack Query v5. **The only cache.** No Redux, no Zustand yet |
| Forms | React Hook Form + `@hookform/resolvers/zod` |
| Validation | Zod v4 — schemas are the source of truth for both forms and API responses |
| UI | Tailwind 4, Radix primitives via shadcn (`components.json`, new-york, neutral), `lucide-react` icons, `sonner` toasts, `class-variance-authority` + `tailwind-merge` |
| Theme | The **Classical** design system — Cormorant Garamond / Lora, `#b68235` accent, 2–7px radii. Fonts load from Bunny Fonts in `index.html` |
| Build / lint / test | `vite-plus` (`vp`) — one tool for dev server, build, lint, format and Vitest |
| Auth | Laravel Sanctum **stateful cookie** auth against the API (not bearer tokens) |
| CI | GitHub Actions: `npm ci` then `npm run ci:check`, on push to `main` and on PRs |

Do not add or upgrade dependencies without asking.

---

## Commands

```bash
npm run dev          # vite dev server on :5173
npm run ci:check     # what CI runs: vp check, tsc --noEmit, vitest --run
npm run check        # vp check (lint + format check)
npm run check:fix    # vp check --fix (writes)
npm run types:check  # tsc --noEmit
npm run test         # vitest (watch)
npm run build        # production build into dist/
```

Scope test runs while iterating, and use the whole gate before calling something
done:

```bash
npx vp test --run src/context.auth
```

The app needs the API running to do anything past the welcome screen:

```bash
cd ../cocktail-bar-api && ./vendor/bin/sail up -d && composer run dev
```

### Local cookie auth, and why it works on localhost

Sanctum cookie auth needs the API and the SPA to look like the same site.
Cookies ignore the port, so `localhost:5173` and `localhost:8000` share them —
no Vite proxy needed. The API's `.env` must say:

```
SESSION_DOMAIN=localhost
SANCTUM_STATEFUL_DOMAINS=localhost:5173
FRONTEND_URL=http://localhost:5173
```

and this app's `.env` must point at the API:

```
VITE_API_URL=http://localhost:8000
```

In production they must be **sibling subdomains** of one registrable domain
(`app.example.com` + `api.example.com`, `SESSION_DOMAIN=.example.com`). Put them
on unrelated domains and the session cookie will be dropped; that is a
deployment decision, not something to patch around in the client.

---

## Layout

```
src/
├── main.tsx                  # entry: StrictMode > Providers > Suspense > RouterProvider
├── app/                      # the routing shell — thin, no domain logic
│   ├── router.tsx            # route objects; every page lazy except welcome
│   ├── routes.ts             # ROUTES: the ONLY place a path string is written
│   ├── providers.tsx         # QueryClientProvider, TooltipProvider, Toaster
│   ├── guards/               # RequireAuth, GuestOnly
│   └── pages/                # one file per route; composes a layout + context components
├── common/                   # shared across every context
│   ├── components/           # app shell, nav, breadcrumbs, headings
│   │   └── ui/               # shadcn primitives — treat as vendored, see below
│   ├── hooks/                # use-appearance, use-mobile, use-current-url, …
│   ├── layouts/              # app-layout, auth-layout, settings/layout
│   ├── lib/
│   │   ├── utils.ts          # cn()
│   │   └── api/              # fetchApi, errors, endpoints, query-client, form-errors
│   ├── styles/app.css        # Tailwind theme + Classical tokens
│   └── types/                # navigation, ui, global.d.ts
├── context.auth/             # bounded context: who the user is
│   ├── _domain/              # zod schemas, types — no React, no fetch
│   ├── data/                 # provider functions + adapters — no React
│   ├── hooks/                # one mutation per hook
│   └── components/           # forms and menus
└── context.settings/         # bounded context: profile, password, account deletion
    ├── _domain/  data/  hooks/  components/
```

### Layered architecture — this is the load-bearing rule

Each bounded context is a directory that mirrors the same four layers, and the
dependency arrow only ever points down:

```
components/ ──> hooks/ ──> _domain/
                     └──> data/ ──> _domain/
```

| Layer | Allowed | Forbidden |
|---|---|---|
| `_domain/` | zod schemas, derived types, pure functions, label/icon maps | React, `fetch`, JSX, classNames |
| `data/` | `fetchApi` calls with a zod `schema`, adapters | business rules, React, UI |
| `hooks/` | `useQuery`/`useMutation`, React state, cache invalidation | raw `fetch`, business rules, JSX |
| `components/` | JSX, hooks, theme classes | `fetchApi`, inline business logic, hardcoded colours |

`_domain/` imports from nothing above it. Ever. That is what makes the schemas
and pure functions testable with no DOM, no query client and no network, which
is the whole point.

### Generated and vendored directories

- `src/common/components/ui/` is **shadcn output**. It is excluded from lint and
  format on purpose, so that re-running the shadcn CLI does not produce a diff
  storm. Restyle through the theme tokens in `app.css` or a `className`
  override — do not reformat these files.
- `dist/` is build output. Never edit, never commit.

---

## Where the cocktail domain goes

None of this exists yet. These are the decisions to make deliberately on the
first feature rather than drift into.

### One context per bounded context

Expect three, carved the way the API carves them:

```
src/context.ingredient/   # intake: free text in, resolved ingredient or "unrecognised" out
src/context.recipe/       # recipes, their lines, roles and units
src/context.bar/          # the user's stock, servings possible, match tiers, shopping list
```

Do not create a `context.cocktail/` that owns all three. The whole reason to
split intake from interpretation is that they fail differently and change at
different rates.

### The API owns identity, units and ranking

Three traps, all of which show up first as a tempting bit of client code:

1. **Ingredient identity lives in the API's database.** Never a hardcoded list
   of ingredients, aliases or substitutions in TypeScript. A second list will
   drift from the first, and matching will quietly break.
2. **Store nothing in ml-vs-oz-vs-parts terms yourself.** The API stores
   canonical millilitres as integers and tells you what to display. The design
   deliberately rounds 1 oz to 30 ml (22 ml for ¾ oz), and `parts` is a **ratio,
   not a volume**. If a component is doing arithmetic on a measure, that
   arithmetic belongs on the server.
3. **Match tiers are the product, and the server decides them.** *makeable* ·
   *makeable with a substitution* (which one) · *one ingredient short* (which
   one). Render the tier you are given, with its reason. Do not collapse them
   into a boolean, and do not recompute "close enough" in the browser.

### Shape of a new feature's data layer

A provider function per endpoint, each with a zod schema and, where the API
shape differs from the domain shape, an adapter:

```ts
// src/context.bar/data/getBarMatches.ts
export async function getBarMatches(opts: {
    data: { barId: number };
    signal?: AbortSignal;
}): Promise<TBarMatches> {
    const response = await fetchApi(`/api/bars/${opts.data.barId}/matches`, {
        schema: barMatchesSchema,
        signal: opts.signal,
    });

    return barMatchesAdapter(response);
}
```

The adapter is the **only** place API shapes (snake_case keys, ISO date strings)
become domain shapes (camelCase, `Date`). Components and hooks never see a raw
API shape. `src/context.auth/data/user.adapter.ts` is the worked example.

### The API contract

The front end assumes these endpoints. They are listed in one place —
`src/common/lib/api/endpoints.ts` — so that a change is one edit, not a search.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/sanctum/csrf-cookie` | issues `XSRF-TOKEN`; called automatically before the first unsafe request |
| `POST` | `/login` · `/logout` · `/register` | Fortify, at the API root |
| `POST` | `/forgot-password` · `/reset-password` | Fortify password reset |
| `POST` | `/email/verification-notification` | resend verification |
| `GET` | `/api/user` | the authenticated user, **bare object, no `data` wrapper**; `401` when signed out |
| `GET` | `/api/auth/config` | `{ password_rules, can_reset_password, registration_enabled, must_verify_email }` |
| `PATCH` | `/api/settings/profile` | update name and email |
| `PUT` | `/api/settings/password` | update password |
| `DELETE` | `/api/settings/profile` | delete the account |

`/api/auth/config` replaces four props Inertia used to share on every page load.
`password_rules` is `Password::defaults()->toPasswordRulesString()` — it is a
Safari autofill hint, and hardcoding it here would be a second source of truth.
Until the API ships that endpoint the client falls back to
`fallbackAuthConfig`, so the screens still render.

Error contract, enforced in `src/common/lib/api/client.ts`:

| Status | Becomes | Handling |
|---|---|---|
| `422` | `ValidationError` with `errors` | `applyApiErrors()` maps it onto form fields |
| `401` | `UnauthenticatedError` | `getUser` returns `null`; guards redirect to log in |
| `419` | — | CSRF cookie refreshed and the request retried **once**, then it surfaces |
| other | `ApiError` with `status` | queries do not retry below 500 |

---

## Skills

Copied from the API repo into `.claude/skills/`. They are a mixed fit, and
pretending otherwise would be worse than useless — parts of the React set were
written for a Next.js App Router app with its own provider registry.

| Skill | Applies here? |
|---|---|
| `no-workarounds` | **Yes, always.** Load it for any debugging or test-failure work. |
| `testing-anti-patterns` | **Yes**, whenever tests are in scope. |
| `clean-code` | **Yes.** |
| `security-review` | **Yes** — for anything touching auth, the fetch client, CSRF, cookies or user input. |
| `react-frontend` → `SKILL.md`, `rules/coding-standards.md` | **Yes.** Shared components before new ones, no hardcoded colours, thin components, one mutation per hook, tests mirroring the component tree. |
| `react-frontend` → `rules/layered-architecture.md` | **Yes, and it is now the architecture** — this is the decoupled SPA those rules were written for. Two deliberate deviations: there is no central `fetchApi` **provider registry** (providers are imported directly; a registry buys indirection this app does not need), and modules are named `context.{domain}/` as the rule file's first option. |
| `react-frontend` → `rules/app-structure.md` | **Reasoning yes, specifics no.** It assumes Next.js App Router files (`layout.tsx`, `middleware.ts`, server prefetch). The equivalents here are `src/app/router.tsx`, `src/app/guards/` and `src/common/layouts/`. |
| `react-frontend` → `rules/icons.md` | **No.** It assumes an SVG asset folder with a generated filename union. This app uses `lucide-react` through `components/ui/icon.tsx`; the import *is* the type check. The underlying rule still binds: **never inline a raw `<svg>`** outside `components/ui/`. |
| `react-frontend` → `rules/infinite-scrolling.md`, `rules/websocket.md`, `rules/feature-flags.md` | **Not yet.** No infinite lists, no Echo/Pusher, no flag provider. Read them before introducing one. |
| `vercel-react-best-practices` | **Partly.** `rerender-*`, `js-*`, `bundle-*` and `client-*` rules are plain React and apply. `server-*` and `async-*` are React Server Components and Next data fetching — **not this stack.** |
| `zod` | **Yes, fully.** Zod is load-bearing here: every API response is parsed and every form resolves through a schema. |
| `laravel-backend` | **No.** Wrong repo — it belongs to `cocktail-bar-api`. |

There is no gate script enforcing any of this — it is discipline, not machinery.
Say in the commit or PR which skills gated the work.

---

## Comments — do not write them unless 100% necessary

**Default to no comment.** Working, readable code is the deliverable; narration
is not. Do not restate what the code says, re-describe a test's own name, or
leave notes "for context" — that belongs in the commit message or PR
description.

This repo is **all front end, so the strict rule applies everywhere**: no inline
`//` narration, and no JSDoc added merely to describe a component, hook, prop or
test. In tests the `it('…')` string *is* the explanation.

Write one only when **all** of these hold: the information cannot be carried by
naming, types or structure; getting it wrong would cause a real defect; and it
concerns something outside the file the reader cannot see. In this project that
is most likely a **units or measure trap** (ml vs oz vs parts), a **cookie or
CSRF constraint** imposed by Sanctum, or a browser quirk.

Directives the tooling consumes (`oxlint-disable*`, `@ts-expect-error`) are
code, not commentary, and are fine. `no-workarounds`' `// WORKAROUND: …` escape
valve stays sanctioned where it genuinely applies.

---

## Ways of working

- **Work on branches** and let CI run on the PR.
- **Never hardcode a colour.** Use the semantic tokens (`bg-background`,
  `text-muted-foreground`, `border-border`, `text-accent-700`). Note the trap in
  `app.css`: bare `accent` is shadcn's neutral hover **surface**, while
  `accent-100…900` is the Classical gold ramp. They are different scales on
  purpose.
- **Shared component before new component.** Check `common/components/ui/`
  first — button, input, card, checkbox, dialog, dropdown, select, sheet,
  sidebar, table, tabs, tooltip and more are already there. A second button is a
  divergence in behaviour and accessibility, not just in styling.
- **One path string, one place.** New routes go in `ROUTES`
  (`src/app/routes.ts`); new endpoints go in `API_ENDPOINTS`
  (`src/common/lib/api/endpoints.ts`). No string literals at call sites.
- **One mutation per hook.** No `useBarActions` god hook bundling create, update
  and delete. Each action gets its own hook with its own success handling.
- **Thin components.** Max ~200 lines a file, ~50 lines a function. If a view
  owns modal state *and* a mutation *and* cache invalidation, extract an
  `*Actions` component or a purpose-built hook.
- **Small diffs.** No drive-by refactors, no renaming identifiers, no behaviour
  changes that were not asked for.
- **Prefer editing an existing file** over adding a new one; delete dead code
  outright rather than leaving compatibility shims.
- **Surface assumptions.** State the call you made; do not bury it in a
  condition.
- **Verified means verified.** A feature is done when its tests pass and you
  have seen them pass. Run `npm run ci:check` before reporting work complete; if
  you did not run it, say so. "Should work" is not done.

### Project hard rules

1. **No interpretation logic in React.** No scoring, no ranking, no tier
   derivation, no substitution guessing, no unit arithmetic on measures. The API
   computes; this app renders.
2. **Ingredient identity never lives in TypeScript.** No hardcoded ingredient,
   alias or substitution lists — it is a second source of truth that will drift.
3. **Every API response is parsed by a zod schema** in the data layer, and every
   `fetch` goes through `fetchApi`. No bare `fetch` or `axios` in a hook or a
   component.
4. **`_domain/` imports nothing from `components/`, `hooks/` or `data/`.**
5. **TanStack Query is the server-state cache.** Do not mirror fetched data into
   `useState`, and do not add a second data library.
6. **No dependency changes without approval.**

---

## Adding a feature: checklist

1. Read this file and the skills that apply (§ *Skills*). Check the API repo's
   `CLAUDE.md` for the domain rules you are rendering.
2. Confirm the endpoint exists and what it returns. Add it to `API_ENDPOINTS`.
3. `_domain/`: zod schema for the API shape, a resource schema for the domain
   shape if they differ, types via `z.infer`, and any pure helpers. Unit-test the
   pure parts.
4. `data/`: a provider function per endpoint, each passing its schema; an
   adapter where the shapes differ. Test the adapter.
5. `hooks/`: one query or one mutation per hook, returning domain-friendly names
   (`barMatches`, `isLoadingBarMatches`), plus cache invalidation.
6. `components/`: thin views built from `common/components/ui/`. Forms get React
   Hook Form + `zodResolver` + `applyApiErrors`.
7. Route in `ROUTES` and `src/app/router.tsx`, lazy-loaded, behind the right
   guard. Page in `src/app/pages/` composing a layout and the context's
   components.
8. `npm run ci:check`. Then say what you ran and what it said.
