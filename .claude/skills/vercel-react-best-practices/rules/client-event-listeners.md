---
title: Deduplicate Global Event Listeners
impact: LOW
impactDescription: one listener for N components
tags: client, event-listeners, subscription, use-sync-external-store
---

## Deduplicate Global Event Listeners

A hook that attaches a `window` listener attaches **one per call site**. Ten components using it
means ten listeners doing the same work on every event.

(Upstream this rule uses `useSWRSubscription`. SWR is not a dependency here; the same job is done
by a module-level registry, which this codebase already uses in `use-appearance.tsx`.)

**Incorrect (N instances = N listeners):**

```tsx
function useKeyboardShortcut(key: string, callback: () => void) {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.metaKey && e.key === key) callback()
        }

        window.addEventListener('keydown', handler)

        return () => window.removeEventListener('keydown', handler)
    }, [key, callback])
}
```

**Correct (N instances = 1 listener):** keep the subscribers in a module-level registry and attach
the real listener only while the registry is non-empty.

```tsx
const callbacks = new Map<string, Set<() => void>>()
let attached: ((e: KeyboardEvent) => void) | null = null

function attach() {
    if (attached) return

    attached = (e: KeyboardEvent) => {
        if (!e.metaKey) return
        callbacks.get(e.key)?.forEach((cb) => cb())
    }

    window.addEventListener('keydown', attached)
}

function detach() {
    if (!attached || callbacks.size > 0) return

    window.removeEventListener('keydown', attached)
    attached = null
}

export function useKeyboardShortcut(key: string, callback: () => void) {
    useEffect(() => {
        const set = callbacks.get(key) ?? new Set()

        set.add(callback)
        callbacks.set(key, set)
        attach()

        return () => {
            set.delete(callback)

            if (set.size === 0) callbacks.delete(key)

            detach()
        }
    }, [key, callback])
}
```

### The same shape, for state rather than events

When the subscription produces a **value** components should render, use `useSyncExternalStore`
rather than copying it into `useState` — `src/common/hooks/use-appearance.tsx` is the worked
example in this codebase:

```tsx
const listeners = new Set<() => void>()
let currentAppearance: Appearance = 'system'

const subscribe = (cb: () => void) => {
    listeners.add(cb)
    return () => listeners.delete(cb)
}

export function useAppearance() {
    const appearance = useSyncExternalStore(subscribe, () => currentAppearance, () => 'system')
    …
}
```

`useSyncExternalStore` is the correct primitive for "React needs to re-render when something
outside React changes". An effect that mirrors the external value into `useState` tears under
concurrent rendering — two components can read different values in the same paint.

**Rules:**

- One global listener per event type, shared through a registry.
- **Always remove the listener when the last subscriber unmounts.** `StrictMode` double-invokes
  effects in development, so a missing cleanup shows up as handlers firing twice.
- Pass `{ passive: true }` for scroll and touch listeners — see
  [client-passive-event-listeners.md](client-passive-event-listeners.md).
- Keep the callback identity stable (`useCallback`, or a ref) or the effect re-subscribes on every
  render.
