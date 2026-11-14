---
paths:
  - "**/*.{ts,tsx}"
---

# Frontend Coding Standards

## Null / Undefined Checks

- There is **no nil-check helper and no Ramda** in this project. Use the language: `??` for
  defaulting, `value == null` to catch both `null` and `undefined` in one comparison, and an
  explicit `!== undefined` when the distinction matters.
- Prefer `??` over `||` when defaulting. `||` also swallows `0` and `''`, which is wrong for a
  measure or a name field: `amountOnHand ?? 0` is right, `amountOnHand || 0` hides a real zero.
- Zod does the distinguishing at the boundary: `.nullable()` means the API sends `null`,
  `.optional()` means the key may be absent, `.nullish()` means either. Pick deliberately — the
  schema is the documentation of what the API actually does.

## API Fetch Typing

- **Do not pass an explicit generic to `fetchApi`.** It infers its return type from the `schema`
  argument, so `fetchApi<TUser>(…)` is both redundant and a lie waiting to happen — restating the
  inferred type silently rots when the schema changes.
- Type the *provider function's* return instead (`Promise<TUser | null>`). That is the contract
  hooks and components rely on, and it is checked against what the adapter returns.

## Boolean Coercion

- Use `!!value` to coerce existence of a string, number or object.
- For arrays use `!!value?.length` — an empty `[]` is truthy, so `!!items` is `true` for a list
  with nothing in it. This is the single most common version of this bug: an empty-state branch
  that never renders.

## Component Decomposition

- **Extract action groups into their own component.** When a view owns buttons, a dialog and the
  handlers that drive them, pull them into a dedicated `*-actions.tsx`. The parent renders
  `<BarActions barId={id} />` and nothing else about it.
- **One concern per component.** A view orchestrates layout and delegates behaviour. It should not
  own dialog state *and* a mutation *and* cache invalidation.
- **The signal to extract:** a component importing `Button`, `Dialog`, `useState` for the open
  flag, and a domain mutation hook, all together. That set belongs one level down.
- Dialog state is local `useState` plus a Radix `Dialog` from `components/ui/`. There is no shared
  modal-state hook in this project — do not build one for a single dialog, and do not lift dialog
  state into a query or the URL unless the dialog should survive a reload.

## Hook Design

- **One mutation per hook.** No god hook (`useBarActions`) bundling create, update, delete and a
  status check. Each action has its own success handler, error handling and invalidation; bundling
  them forces every caller to depend on all of it.
- **Colocate hooks with their consumers.** A hook used by exactly one component stays in the same
  context's `hooks/` folder, named after the action (`use-add-stock.ts`), not funnelled through a
  shared actions hook.
- Return domain-friendly names — `addStock`, `isAddingStock`, `addStockError` — not `mutate` /
  `isPending` / `error`. A component consuming two hooks would otherwise have to rename both.

## Test Alignment

- **Tests mirror the component tree.** When you extract `BarActions` from `BarView`, the parent
  test mocks `BarActions` and asserts only that it renders. The click, dialog and confirmation
  tests live in `bar-actions.test.tsx`.
- **Mock at the boundary you extracted** — `vi.mock` the child component, not the child's internal
  hooks. Mocking the hooks couples the parent's test to the child's implementation, which is
  exactly what extracting was meant to decouple.
- `vi.mock`, `vi.fn`, `vi.spyOn` — this project runs **Vitest**, not Jest. Mock paths are full
  relative paths, never the `@/` alias.
- Prefer `@testing-library/user-event` over `fireEvent` for interaction: it dispatches the full
  event sequence a real user produces, so it catches handlers that only listen for one half of it.
- **Remove stale mock return values.** When a hook stops returning a property, update the mock.
  Leftover properties mask coupling and keep dead code alive.
- **Remove unused mocks, variables and imports.** Dead mocks are noise, and `vp check` will fail
  on the unused import anyway.

## General Anti-Patterns

- **Wrapper functions that add nothing.** `const handleSubmit = () => { submit() }` is
  indirection without value. Pass `submit` directly.
- **Importing more than you orchestrate.** If a component imports a button, a dialog, the open
  flag and three hooks but only arranges layout, those imports belong in the child you have not
  extracted yet.
- **Several concerns in one file.** Dialog state + mutation + cache invalidation + rendering in
  one component is the smell. Separate *what action to perform* (a hook) from *how to present it*
  (a component).
- **`useEffect` as a data pipeline.** An effect that derives state from props or from query data
  is state that should have been computed during render. Effects are for synchronising with
  something outside React.
