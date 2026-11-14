---
paths:
  - "**/src/main.tsx"
  - "**/src/app/**"
  - "**/src/common/**"
---

# App Structure (the shell above the contexts)

How this SPA is assembled *above* the `context.<domain>/` folders: the entry point, the router,
the route guards, the providers and the shared `common/` layer. The rules *inside* a context are
in [layered-architecture.md](layered-architecture.md); component and hook conventions are in
[coding-standards.md](coding-standards.md).

> **This describes `cocktail-bar-web` as it actually is**, not a generic shape. Read
> `src/main.tsx`, `src/app/router.tsx` and `src/app/providers.tsx` before changing anything here;
> where they differ from this document, they win.

**There is no server.** No SSR, no server components, no route handlers, no edge middleware, no
BFF. `vp build` emits a static `dist/` that a CDN serves, and the browser talks straight to
`cocktail-bar-api`. Every "put this on the server" instinct from a meta-framework becomes, here,
either *an API endpoint in the other repo* or *nothing at all*.

---

## 1. Top-level layout of `src/`

```
src/
├── main.tsx                  # entry: the only ReactDOM render
├── app/                      # the routing shell — thin, no domain logic
│   ├── router.tsx            # route objects
│   ├── routes.ts             # ROUTES: the ONLY place a path string is written
│   ├── providers.tsx         # QueryClientProvider, TooltipProvider, Toaster
│   ├── guards/               # RequireAuth, GuestOnly
│   └── pages/                # one file per route; composes a layout + context components
├── common/                   # shared across every context (see §6)
└── context.<domain>/         # bounded contexts, one folder per context
```

Path alias: `@/*` → `src/*`. Keep the alias set at exactly one; every extra alias is another
thing the bundler and Vitest must agree on (see the mock-path rule in
[layered-architecture.md](layered-architecture.md) §9).

### The split between `app/` and the contexts

**`app/` is thin.** A page imports components from the owning context and arranges them in a
layout. Nothing else — no fetching, no business rules, no schemas:

```tsx
// src/app/pages/auth/login.tsx — the shape every page follows
export default function Login() {
    return (
        <AuthLayout title="Log in" description="…">
            <LoginForm />      {/* from context.auth */}
        </AuthLayout>
    );
}
```

This keeps routing — a framework concern — separate from the contexts, so a context can be
tested, moved or renamed without touching the route tree. Pages are the **only** place a
`default export` is correct, because `React.lazy` requires one.

---

## 2. Entry point (`src/main.tsx`)

Order is load-bearing, outside → in:

```
StrictMode
  Providers                    # QueryClientProvider > TooltipProvider > children + Toaster
    Suspense fallback={Spinner}  # catches every lazy() route chunk
      RouterProvider
```

then `initializeTheme()` after the render call, and `@/common/styles/app.css` imported here —
this is the one module that pulls in the stylesheet.

Consequences worth knowing before changing any of it:

- **`Suspense` sits above the router, so it is app-wide.** Every lazy route shares one fallback.
  If you want a route to show skeleton UI shaped like its own content instead of a centred
  spinner, add a nearer `Suspense` inside that page — do not move this one.
- **`StrictMode` double-invokes renders, effects and `useState` initialisers in development.** A
  component that breaks only in dev is usually one that mutates during render or runs a
  non-idempotent effect. That is the bug being surfaced, not a reason to remove StrictMode.
- **`initializeTheme()` runs outside React** because the theme must be on `<html>` before first
  paint. Do not move it into a component or an effect; that reintroduces a flash of the wrong
  theme.

---

## 3. The router (`src/app/router.tsx`)

`createBrowserRouter` with a flat array of route objects. Three things make it work:

```tsx
const Dashboard = lazy(() => import('@/app/pages/dashboard'));   // every page…
import Welcome from '@/app/pages/welcome';                       // …except the first paint
```

- **Every page is `lazy()` except `Welcome`.** Code-splitting per route is the main bundle win in
  an SPA; the landing page is eager because splitting the very first thing a visitor sees only
  adds a round trip.
- **Guards are pathless layout routes**, not per-page checks:

```tsx
{ element: <GuestOnly />,                 children: [ login, register, … ] },
{ element: <RequireAuth />,               children: [ verifyEmail, settings.profile ] },
{ element: <RequireAuth requireVerified />, children: [ dashboard, settings.security, … ] },
```

  A route object with no `path` contributes no URL segment — it just wraps its children in an
  element that renders `<Outlet />` or redirects. So the policy is written **once per tier**
  instead of once per page, and adding a page to the wrong tier is the whole of the mistake you
  can make.
- **`{ path: '*' }` last** catches everything unmatched → `NotFound`.

### The three tiers, and the trap between them

| Tier | Who gets in | Holds |
|---|---|---|
| ungated | anyone | `home`, and the `*` fallback |
| `GuestOnly` | signed-out only | login, register, forgot-password, reset-password |
| `RequireAuth` | signed in, **verified or not** | `verify-email`, `settings.profile` |
| `RequireAuth requireVerified` | signed in **and** verified | dashboard, settings security + appearance |

**`verify-email` must sit in the unverified tier.** Put it behind `requireVerified` and an
unverified user is redirected to `verify-email`, which redirects them to `verify-email`, forever.
The same reasoning puts `settings.profile` there: changing your email address is exactly what an
unverified user may need to do. This is the one ordering decision in the file that fails as an
infinite loop rather than as a wrong page.

### Adding a page: checklist

1. Add the path to `ROUTES` in `src/app/routes.ts`. If it takes a param, add a helper beside it
   that interpolates — `resetPasswordUrl(token)` is the pattern; never build the string at a call
   site.
2. Create `src/app/pages/<area>/<name>.tsx` with a **`default export`**, keeping it thin: a
   layout plus components from the owning context.
3. Register it in `src/app/router.tsx` as `lazy()`, inside the correct guard tier.
4. Decide the tier deliberately — ungated, guest-only, authenticated, or authenticated **and**
   verified — and say which in the PR.
5. `npm run ci:check`, then click the route both cold (full reload on that URL) and warm
   (in-app navigation). Cold load exercises the guard's loading branch and the lazy chunk;
   warm navigation does not.

---

## 4. Guards (`src/app/guards/`)

A guard is a component that reads auth state and returns one of three things: a loading state, a
`<Navigate>`, or `<Outlet />`. `RequireAuth` is the worked example:

```tsx
if (isLoadingUser) return <Spinner … />;                                  // 1. don't decide yet
if (!isAuthenticated) return <Navigate to={ROUTES.login} replace
                                       state={{ from: location }} />;     // 2. bounce
if (requireVerified && authConfig.mustVerifyEmail && !isVerified)
    return <Navigate to={ROUTES.verifyEmail} replace />;                  // 3. bounce further
return <Outlet />;                                                        // 4. let them through
```

Each line earns its place:

- **The loading branch is not optional.** `useAuth` starts out `isPending`, so without it the
  guard would read `isAuthenticated === false` on first render and bounce a signed-in user to the
  login screen before their session had been checked.
- **`replace`** keeps the bounced URL out of history, so Back does not land the user on the page
  they were just refused.
- **`state={{ from: location }}`** carries the intended destination so a post-login redirect can
  honour it.
- **`authConfig.mustVerifyEmail`** is read from the API, not hardcoded. Whether verification is
  enforced is the server's decision; the client asks.

Guards are the **only** place a route-level auth decision is made. A component that re-checks
`isAuthenticated` to decide whether to render is duplicating a decision already made above it —
by the time it renders, the guard has let it through.

---

## 5. Providers (`src/app/providers.tsx`)

```tsx
const [queryClient] = useState(createQueryClient);   // note: the function, not a call
```

- **The query client is created once, in `useState`** — not at module scope. A module-level
  singleton is shared between tests in the same process, so cached data leaks from one test into
  the next; creating it inside the component gives each mount (and each test) a clean cache.
  Passing `createQueryClient` *as a reference* rather than calling it means React does not
  construct a throwaway client on every render.
- **Defaults live in `createQueryClient`** (`src/common/lib/api/query-client.ts`), not sprinkled
  per `useQuery`: `staleTime: 30s`, no refetch on window focus, and **no retry below HTTP 500**.
  Retrying a 422 or a 404 just delays the error the user needs to see; a 500 might be transient.
  Mutations never retry — replaying a non-idempotent write is worse than failing.
- Add a provider here only when the whole app needs it. A context used by one page belongs in
  that page.

---

## 6. `src/common/` — the shared layer

| Folder | Holds |
|---|---|
| `components/` | App shell and shared pieces: `app-shell`, `app-header`, `app-sidebar`, `app-content`, `nav-main`, `nav-footer`, `breadcrumbs`, `heading`, `input-error`, `alert-error`, `password-input`, `text-link`, `user-info` |
| `components/ui/` | **Vendored shadcn primitives** (31 of them). Excluded from lint/format on purpose — treat as generated |
| `hooks/` | `use-appearance` (theme), `use-mobile`, `use-mobile-navigation`, `use-current-url`, `use-document-title`, `use-initials`, `use-clipboard` |
| `layouts/` | `app-layout`, `app/app-sidebar-layout`, `app/app-header-layout`, `auth-layout`, `auth/auth-simple-layout`, `settings/layout` |
| `lib/api/` | `client.ts` (**the single fetch choke point**), `endpoints.ts`, `errors.ts`, `form-errors.ts`, `query-client.ts` |
| `lib/` | `utils.ts` (`cn()`), `app-name.ts` |
| `styles/app.css` | Tailwind 4 theme + Classical design tokens — the theme is **CSS-first**, there is no `tailwind.config.ts` |
| `types/` | `navigation.ts`, `ui.ts`, `index.ts`, ambient `global.d.ts` / `vite-env.d.ts` |

`common/` is a **shell, not a dumping ground**: something belongs here only when two or more
contexts use it, or the shell itself does. Anything used by exactly one context belongs in that
context. There is deliberately no `common/data/` and no `common/store/` — cross-context fetchers
and global client state have not been needed, and adding either is an architectural decision to
argue for in a PR, not a convenience.

---

## 7. The API edge

```
context.<domain>/data/getFoo.ts
   └─ fetchApi(path, { method, body, parse, signal })       # common/lib/api/client.ts
        └─ cocktail-bar-api  (cookie session + XSRF header)
```

`fetchApi` is the single choke point, and it owns four things no caller should reimplement:

1. **CSRF.** Before any unsafe method it ensures the `XSRF-TOKEN` cookie exists, then mirrors it
   into the `X-XSRF-TOKEN` header. Concurrent callers share one in-flight cookie request.
2. **The 419 retry.** A stale CSRF token gets the cookie refreshed and the request replayed
   **once**, then surfaces. This is at the fetch layer, not in TanStack Query's `retry`, because
   it is a precondition repair rather than a flaky-network retry.
3. **Error shaping.** `422` → `ValidationError` with `errors`; `401` → `UnauthenticatedError`;
   anything else → `ApiError` with `status`. Components never branch on a raw status code.
4. **Parsing.** With a `parse` function, the response body is run through it and the return type
   is inferred from what it returns. Without one, the call resolves to `null` — which is correct
   for the API's many `204`s, and a silent type lie on anything that returns data. Parsers are
   hand-written and live in the owning context's `_domain/`; Zod is for form input only (root
   `CLAUDE.md` § *Schemas at the wire, Zod for forms*).

**`credentials: 'include'` plus cookie auth is why there is no token anywhere in this app.**
Nothing is read from or written to `localStorage` for auth; the browser holds the session. In
production the SPA and API must be sibling subdomains of one registrable domain — a deployment
constraint, not something to patch around in the client.

### The one place a 401 is not an error

`getUser` catches `UnauthenticatedError` and returns `null`:

```ts
catch (error) {
    if (isUnauthenticatedError(error)) return null;
    throw error;
}
```

"Nobody is signed in" is a legitimate *answer* to "who is signed in?", so the auth query resolves
with `null` instead of entering an error state — which is what lets a guard render a redirect
rather than an error boundary. Do not copy this into other providers: everywhere else, a `401`
means something went wrong and should propagate.

---

## 8. Contexts (orientation only)

Each `src/context.<name>/` is a bounded context with the same internal shape — `_domain/`,
`data/`, `hooks/`, `components/`. The rules for working inside one are in
[layered-architecture.md](layered-architecture.md).

`context.auth/` is the one the **shell itself** imports: the guards call its `useAuth` and
`useAuthConfig`. That is the single sanctioned dependency from `app/` into a context's hooks, and
it is why auth is the context to read first.
