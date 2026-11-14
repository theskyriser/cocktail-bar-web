---
paths:
  - "**/*.{ts,tsx}"
---

# Layered Architecture

## Overview

Each bounded context is a directory under `src/` that mirrors the same four layers, and the
dependency arrow only ever points down:

```
components/  (View)      React components — render UI, handle interaction
     │
     ├──> hooks/  (Hook) useQuery / useMutation, React state, cache invalidation
     │         │
     │         └──> data/  (Data)   fetchApi + Zod schema + adapters — no React
     │                  │
     └──> _domain/ <────┘ (Domain)  Zod schemas, types, pure functions — no React, no fetch
```

```
src/context.<domain>/
  _domain/        <- schemas, derived types, enums, pure functions
  data/           <- provider functions, adapters
  hooks/          <- one query or one mutation per hook
  components/     <- thin views
```

`context.auth/` and `context.settings/` are the worked examples. The cocktail contexts
(`context.ingredient/`, `context.recipe/`, `context.bar/`) do not exist yet and should be carved
the same way the API carves them — **not** as one `context.cocktail/`.

This project has no `store/` layer: TanStack Query is the only cache, and there is no Zustand.
A context grows `util/` or `constants/` only when it actually has something that fits neither
`_domain/` nor a component.

---

## 1. Layer responsibilities

### Data layer (`data/`)

The data layer is the **anti-corruption layer** between the API and the domain.

| Allowed | Forbidden |
|---|---|
| `fetchApi` calls with a Zod `schema` | Business rules |
| Adapter transformations (API shape → domain shape) | React imports |
| Reading paths from `API_ENDPOINTS` | UI, JSX, classNames |

One provider function per endpoint, named for what it does:

```ts
// src/context.bar/data/getBarMatches.ts
export async function getBarMatches(opts: {
    data: { barId: number };
    signal?: AbortSignal;
}): Promise<TBarMatches> {
    const response = await fetchApi(API_ENDPOINTS.barMatches(opts.data.barId), {
        schema: barMatchesSchema,
        signal: opts.signal,
    });

    return barMatchesAdapter(response);
}
```

**Rules:**

- Every provider that expects a body MUST pass a Zod `schema`. Without one `fetchApi` resolves to
  `null`, which is correct for the API's `204`s and wrong for anything else.
- Accept `signal` and pass it through, so TanStack Query can abort the request on unmount.
- Take arguments as a single `opts` object with a `data` key, matching `getUser` / `login`.
- The adapter is the **only** place API shapes become domain shapes. Components and hooks never
  see a raw API shape.
- Never call `fetch` or `axios` directly — always `fetchApi`, so CSRF, the 419 retry, error
  shaping and parsing all apply (see [app-structure.md](app-structure.md) §7).
- Read paths from `API_ENDPOINTS`, never a string literal.

### Domain layer (`_domain/`)

Defines the **shape of the data** and **pure logic**. Zero React, zero network.

| Allowed | Forbidden |
|---|---|
| Zod schemas (`model.schemas.*.ts`) | React (`useState`, `useEffect`, JSX) |
| Types derived via `z.infer` | `fetch`, `fetchApi`, any I/O |
| Enum constants + label / icon / class maps | classNames beyond semantic token strings in a map |
| Pure functions | Side effects of any kind |

The file-naming convention in this project is `model.schemas.<thing>.ts`, holding **both** shapes
when they differ — `src/context.auth/_domain/model.schemas.user.ts` is the example:

```ts
export const userSchema = z.object({            // the API shape: snake_case, ISO strings
    id: z.number(),
    email_verified_at: z.string().nullable(),
    created_at: z.string(),
});

export const userResourceSchema = z.object({    // the domain shape: camelCase, Date
    id: z.number(),
    emailVerifiedAt: z.date().nullable(),
    createdAt: z.date(),
});

export type TUserType = z.infer<typeof userSchema>;      // API
export type TUser = z.infer<typeof userResourceSchema>;   // domain
```

**Rules:**

- Zod schemas are the **single source of truth**. Types are always derived via
  `z.infer<typeof schema>`, never hand-written alongside.
- The `TFooType` / `TFoo` pair names the API shape and the domain shape. Keep the suffix
  convention — it is how a reader knows which side of the adapter they are on.
- Never `interface`. Always `type`.
- `_domain/` MUST NOT import from `components/`, `hooks/` or `data/`. Ever.
- Pure functions must be testable with no DOM, no query client and no network. That is the entire
  reason this layer exists.

### Hook layer (`hooks/`)

Hooks **bridge** React to the domain and data layers.

| Allowed | Forbidden |
|---|---|
| `useQuery` / `useMutation` | Direct `fetch` / `axios` |
| React state, `useMemo` | Business rules that belong in `_domain/` |
| `useQueryClient().invalidateQueries` | JSX |
| Composing a provider with a query key | Transformation that belongs in an adapter |

One file per hook, kebab-cased, returning **domain-friendly names**:

```ts
// src/context.auth/hooks/use-login.ts
export function useLogin({ onSuccess }: { onSuccess?: () => void } = {}) {
    const queryClient = useQueryClient();

    const { mutateAsync, isPending, error } = useMutation({
        mutationFn: (data: TLoginCredentials) => login({ data }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
            onSuccess?.();
        },
    });

    return { logIn: mutateAsync, isLoggingIn: isPending, logInError: error };
}
```

**Rules:**

- **One query or one mutation per hook.** No `useBarActions` god hook bundling create, update and
  delete — each action has its own success handling, its own error handling and its own
  invalidation, and bundling them means every caller takes a dependency on all three.
- Return renamed fields (`logIn`, `isLoggingIn`, `logInError`), not raw `mutate` / `isPending` /
  `error`. The call site should read as domain language, and a component that destructures
  `isPending` from two hooks has to rename them anyway.
- **Export the query key as a `const` from the hook that owns it** —
  `export const AUTH_QUERY_KEY = ['auth', 'user'] as const` — and import it wherever it is
  invalidated. A key written as a literal in two places is a cache bug waiting to happen: the
  invalidation silently matches nothing.
- Hooks MUST NOT contain inline business logic; delegate to `_domain/` pure functions.
- Hooks MUST NOT render JSX.
- **Extract cross-cutting concerns into a hook from the start.** When a feature needs a query plus
  a rule evaluation plus UI state (a dialog, a pending flag), that belongs in one purpose-built
  hook, and the component only wires the result to JSX. Do not start with it inline "to refactor
  later".

### View layer (`components/`)

| Allowed | Forbidden |
|---|---|
| JSX | `fetchApi`, or any direct data-layer import |
| Hooks from `hooks/`, domain types from `_domain/` | Inline business logic |
| Semantic theme classes | Hardcoded colours, `style={{}}` |
| `lucide-react` icons via `components/ui/icon.tsx` | Raw `<svg>` |
| React Hook Form + `zodResolver` | Untyped forms |

**Rules:**

- Components are pure functions of their props wherever possible.
- **Max ~200 lines per file, ~50 lines per function.** Decompose past that.
- Named exports everywhere except `src/app/pages/`, where `React.lazy` requires a default.
- **A component MUST NOT fetch in order to decide a rule.** If it needs server data to make a
  decision, the fetch *and* the decision go in a hook.
- Build forms with `useForm({ resolver: zodResolver(schema) })` directly. There is no shared
  `<Form>` wrapper and no `useFormContext` split in this project; `login-form.tsx` is the shape
  to copy.

---

## 2. Dependency direction (strict)

- `components/` MAY import `hooks/`, `_domain/`, `common/`.
- `hooks/` MAY import `data/`, `_domain/`.
- `data/` MAY import `_domain/`, `common/lib/api/`.
- `_domain/` MUST NOT import from `components/`, `hooks/` or `data/`.

**Never reverse an arrow.** The concrete payoff: `_domain/` tests need no query client, no router
and no network stub, so the schemas and pure functions — the parts most likely to be subtly wrong
— are also the cheapest parts to test. Import `data/` into `_domain/` and that property is gone
for the whole context, not just for the one file that did it.

Across contexts, import another context's `_domain/` types if you must, never its `data/`. Two
contexts that need the same provider are telling you the provider belongs in neither.

---

## 3. Strategy maps (replace scattered conditionals)

When a value varies by enum, encapsulate it in `_domain/` as a map rather than branching at each
call site.

### BAD — shotgun surgery

```tsx
// three files, each branching on the same enum
const label = tier === 'MAKEABLE' ? 'Ready' : tier === 'SUBSTITUTION' ? 'With a swap' : 'One short';
const icon  = tier === 'MAKEABLE' ? Check  : tier === 'SUBSTITUTION' ? Replace     : ShoppingCart;
const cls   = tier === 'MAKEABLE' ? 'text-accent-700' : '…';
```

Adding a fourth tier means finding three files, and missing one is a silent wrong label.

### GOOD — encapsulated in the domain

```ts
// src/context.bar/_domain/model.enum.match-tier.ts
export const MATCH_TIER = {
    MAKEABLE: 'MAKEABLE',
    SUBSTITUTION: 'SUBSTITUTION',
    ONE_SHORT: 'ONE_SHORT',
} as const;

export const matchTierEnum = z.enum(MATCH_TIER);
export type TMatchTier = z.infer<typeof matchTierEnum>;

export const MATCH_TIER_LABEL_MAP = {
    [MATCH_TIER.MAKEABLE]: 'Ready to make',
    [MATCH_TIER.SUBSTITUTION]: 'Makeable with a substitution',
    [MATCH_TIER.ONE_SHORT]: 'One ingredient short',
} as const satisfies Record<TMatchTier, string>;
```

```tsx
export function MatchTierBadge({ tier }: { tier: TMatchTier }) {
    return <Badge className={MATCH_TIER_CLASS_MAP[tier]}>{MATCH_TIER_LABEL_MAP[tier]}</Badge>;
}
```

Adding a tier is one change in `_domain/` and zero in components — and the `satisfies` makes the
omission a compile error instead of an `undefined` on screen.

**Rules:**

- **Always `as const satisfies Record<TEnumType, ValueType>`** on a map keyed by an enum. `as
  const` preserves the literal types; `satisfies` enforces exhaustiveness. Neither alone does
  both.
- Components read from maps; they never branch on a raw enum value.
- **Zod v4 note:** this project is on Zod 4, where `z.enum()` accepts a const object directly.
  Older examples (and plenty of blog posts) use `z.nativeEnum()`, which is deprecated — and
  `.merge()` on object schemas is likewise superseded by `.extend()`.
- Important: a map keyed by match tier renders a decision the **API** made. Deriving the tier
  itself in TypeScript is forbidden by the root `CLAUDE.md`. The map turns a server answer into
  pixels; it does not compute the answer.

---

## 4. Data flow

### Reading

```
Component
  └─ useBarMatches(barId)                       hooks/use-bar-matches.ts
       └─ useQuery({ queryKey: BAR_MATCHES_QUERY_KEY(barId), queryFn })
            └─ getBarMatches({ data: { barId }, signal })   data/getBarMatches.ts
                 └─ fetchApi(path, { schema })              → Zod parses
                      └─ barMatchesAdapter(response)        → domain shape
```

### Writing

```
Component
  └─ const { addStock } = useAddStock({ onSuccess })
       └─ useMutation({ mutationFn: addStock })
            └─ onSuccess: invalidateQueries({ queryKey: BAR_QUERY_KEY })
```

Invalidate, do not hand-patch. A mutation that writes the server's new state into the cache by
hand is asserting it knows what the server decided — and in this app the server decides
everything that matters.

### Forms

```
useForm({ resolver: zodResolver(schema), defaultValues })
  └─ handleSubmit(async values => {
         try { await mutateAsync(values) }
         catch (error) {
             if (!applyApiErrors(error, setError))   // 422 → field errors
                 setError('root', { message: … })    // anything else → form-level
         }
     })
```

**Rules:**

- Forms receive server data via props; they do not fetch it themselves.
- Always `zodResolver(schema)` with the schema from `_domain/`. Never an inline schema in a
  component — it is untestable and duplicated the moment a second form touches the same fields.
- Type the form from the schema: `useForm<TLoginCredentials>`. Never React Hook Form's
  `FieldValues`.
- **Always handle both error channels.** `applyApiErrors` returns `false` when the error was not a
  `422`; that is the signal to set a form-level `root` error. Dropping the fallback means a 500
  shows an untouched form and no explanation.
- Reset sensitive fields on failure — `resetField('password')` — so a retry starts clean.

---

## 5. State management hierarchy

Use the **least powerful tool** that solves the problem:

| Priority | Tool | When |
|---|---|---|
| 1 | TanStack Query cache | Anything server-derived — the default |
| 2 | URL search params (`useSearchParams` from `react-router`) | Filters, selected tab, anything shareable or refresh-surviving |
| 3 | `useState` | UI-only state: a dialog, a hover, an uncontrolled toggle |
| 4 | React Hook Form state | Form fields |

**Rules:**

- TanStack Query is the **single source of truth** for server state. Never mirror fetched data
  into `useState` — the copy goes stale the moment the cache refetches, and now two renders
  disagree.
- Prefer search params over component state for anything a user might reload, bookmark or share.
- `useSearchParams` here is **React Router's**, from `react-router`. It is not the Next.js hook of
  the same name, and there is no server render to coordinate with.
- There is **no global client-state library** in this project, by decision. If you believe a
  feature needs one, that is a PR discussion and a dependency approval, not a quiet `npm i`.

---

## 6. Domain modelling (no classes)

Model with **Zod schemas + inferred types + pure functions**, not classes. The schema carries the
validation rules, the type carries the shape, functions carry the behaviour.

```ts
// _domain/model.util.measure.ts
export function formatMeasure(ml: number, unit: TDisplayUnit): string { … }
```

**Rules:**

- Never use classes for domain modelling.
- Pure functions only: same input, same output, no side effects, no `Date.now()` read inside.
- Default/empty objects (`emptyIngredient`) live beside the types they belong to.
- **Measures are a trap, not an exercise.** The API stores canonical millilitres and tells the
  client what to display; `parts` is a ratio, not a volume. A formatting helper that turns a
  server-supplied number into a string is fine. Arithmetic that converts, scales or sums measures
  belongs on the server — see the root `CLAUDE.md` § *The API owns identity, units and ranking*.

---

## 7. The adapter as anti-corruption layer

```ts
// src/context.auth/data/user.adapter.ts — the whole pattern, in one plain function
export function userAdapter(user: TUserType): TUser {
    return {
        id: user.id,
        avatar: user.avatar ?? null,
        emailVerifiedAt: user.email_verified_at ? new Date(user.email_verified_at) : null,
        createdAt: new Date(user.created_at),
    };
}
```

**Rules:**

- An adapter is a plain exported function, `<thing>.adapter.ts`, beside the provider that uses it.
  There is no adapter factory in this project.
- It is the **only** module that knows the API sends snake_case keys and ISO date strings.
- No adapter is needed when the shapes already match — do not add an identity function for
  symmetry.
- **When the API changes, only the adapter and its schema change.** If an API rename forces edits
  in a component, the adapter was not doing its job.
- Adapters are pure and trivially testable — `user.adapter.test.ts` is the example. Test the
  nullable and date-parsing branches; they are where the bugs are.

---

## 8. Error handling

```
fetchApi throws ValidationError | UnauthenticatedError | ApiError
  └─ useQuery / useMutation surfaces it as `error`
       ├─ in a form:      applyApiErrors(error, setError), else setError('root', …)
       └─ in a view:      isPending → Spinner;  isError → AlertError;  else render
```

**Rules:**

- Never `try/catch` around a `useQuery`. Use `isPending` / `isError` / `error`.
- **Do** `try/catch` around an awaited `mutateAsync` in a submit handler — that is where form
  error mapping happens.
- Narrow errors with the type guards in `common/lib/api/errors.ts` (`isValidationError`,
  `isUnauthenticatedError`, `isApiError`), never by reading `error.status` off `unknown`.
- Use `sonner`'s `toast` for transient success/failure notices; use `AlertError` for an error the
  user must act on.
- A `401` surfacing anywhere other than `getUser` means a guard should have caught it — fix the
  routing tier, do not swallow it locally.

---

## 9. Testing per layer

Vitest + React Testing Library, `*.test.ts(x)` beside the code.

| Layer | Test | Needs |
|---|---|---|
| `_domain/` | Pure unit tests — schema `safeParse`, pure functions | nothing |
| `data/` | Adapter tests: nullable fields, date parsing, key renames | nothing |
| `hooks/` | Behaviour against a mocked provider | a `QueryClientProvider` wrapper |
| `components/` | RTL: what the user sees and does | providers + router wrapper |

```ts
// _domain/model.schemas.credentials.test.ts — the existing example
it('rejects a password shorter than the minimum', () => {
    expect(loginSchema.safeParse({ email: 'a@b.c', password: '' }).success).toBe(false);
});
```

**Rules:**

- Test user-visible behaviour, not implementation details.
- Query by role, label and text (`getByRole`, `getByLabelText`, `getByText`). This codebase uses a
  `data-test` attribute where nothing semantic exists — keep that rare.
- **Mock by full relative path, never a path alias.** Vitest's resolution can differ from Vite's,
  and a mock that fails to apply produces a passing test of the real implementation — the worst
  possible outcome, because it looks green.
- The `it('…')` string is the explanation. No comment above it.
- Prefer a `_domain/` test over a component test for anything that is really a rule. It is faster,
  it cannot flake, and it fails with a clearer message.

---

## 10. Anti-patterns

| Anti-pattern | Why it is wrong | Instead |
|---|---|---|
| `fetchApi` in a component | Couples the view to the network | Provider in `data/`, consumed through a hook |
| Bare `fetch` / `axios` anywhere | Skips CSRF, the 419 retry, error shaping and parsing | `fetchApi` |
| A provider with no `schema` | Unvalidated API data reaches the UI | Pass the Zod schema |
| Recomputing a match tier, score or ranking | The API owns interpretation | Render the tier you were given |
| Unit arithmetic on a measure | ml / oz / parts drift and `parts` is not a volume | Display what the server sent |
| A hardcoded ingredient or substitution list | Second source of truth; will drift from the database | Fetch it |
| Business logic in `useEffect` | Untestable, lifecycle-coupled | Pure function in `_domain/` |
| Fetched data copied into `useState` | Two sources of truth; goes stale on refetch | Read from the query cache |
| The same conditional in 3+ files | Shotgun surgery on every change | A `*_MAP` in `_domain/` |
| Inline Zod schema in a component | Duplicated, untestable | Define it in `_domain/` |
| A query key written as a literal twice | Invalidation silently matches nothing | Export the key const |
| God hook (`useBarActions`) | Bundles unrelated mutations and their failure modes | One mutation per hook |
| `interface TProps` | Inconsistent with the `type` convention | `type TProps = { … }` |
| `class IngredientService` | Not the modelling unit here | Schemas + types + pure functions |
| `any` | Defeats TypeScript | `unknown` + narrowing, or type it properly |
| Raw API shapes in a component | Couples the view to an external system | Adapt to the domain shape first |
| Hardcoded colour or `style={{}}` | Breaks theming and dark mode | Semantic theme tokens |
| Raw `<svg>` outside `components/ui/` | Bypasses sizing and a11y handling | `lucide-react` via the `Icon` component |
| `console.log` left in | Debug noise in production | Remove it |
| Prop spreading `{...props}` | Hidden dependencies, hard to trace | Pass props explicitly |

---

## 11. Checklist before completing a feature

- [ ] Schemas and types in `_domain/` as `model.schemas.*.ts`, types via `z.infer`
- [ ] API shape and domain shape distinguished (`TFooType` / `TFoo`) where they differ
- [ ] A provider per endpoint in `data/`, each passing a Zod schema and accepting `signal`
- [ ] Path added to `API_ENDPOINTS`, not written at the call site
- [ ] An adapter where shapes differ, with a test for its nullable and date branches
- [ ] One query or one mutation per hook, domain-friendly return names, query key exported
- [ ] Components take hooks and domain types only — no data-layer import, no inline rules
- [ ] No interpretation logic: no tier derivation, scoring, ranking or measure arithmetic
- [ ] Enum-dependent values come from `*_MAP` consts with `as const satisfies Record<…>`
- [ ] Forms use `zodResolver`, `applyApiErrors`, **and** a `root` fallback
- [ ] No `interface`, no `any`, no hardcoded colour, no `style={{}}`, no default export outside
      `app/pages/`
- [ ] Tests per layer: domain (pure), adapter, hook, component
- [ ] `npm run ci:check` passes, and you say what it said
