---
title: Let TanStack Query Deduplicate Requests
impact: MEDIUM-HIGH
impactDescription: one request shared by every consumer
tags: client, tanstack-query, deduplication, data-fetching
---

## Let TanStack Query Deduplicate Requests

TanStack Query is the only cache in this app. Two components asking for the same thing under the
same **query key** share one in-flight request and one cached result — so the fix for duplicate
requests is almost never a new fetch strategy, it is the key.

(Upstream this rule recommends SWR. This project uses TanStack Query v5; the principle is
identical, the API is not, and SWR is not a dependency here.)

**Incorrect (every instance fetches, nothing is shared or cached):**

```tsx
function UserBadge() {
    const [user, setUser] = useState<TUser | null>(null)

    useEffect(() => {
        void getUser().then(setUser)
    }, [])
}
```

Two of these on screen means two requests, two copies of the state, and no invalidation path when
the user changes.

**Correct (one hook, one key, shared by every caller):**

```tsx
export const AUTH_QUERY_KEY = ['auth', 'user'] as const

export function useAuth(): UseAuthReturn {
    const { data, isPending } = useQuery({
        queryKey: AUTH_QUERY_KEY,
        queryFn: ({ signal }) => getUser({ signal }),
        staleTime: 5 * 60_000,
    })
    …
}
```

`RequireAuth`, `GuestOnly` and `nav-user` all call `useAuth()` on the same render and produce
**one** `/api/user` request. That is the mechanism, not a coincidence.

**Rules:**

- **The query key is the identity of the data.** Everything that changes the result belongs in it
  (`['recipes', { search }]`); anything that does not, stays out. A key missing its filter serves
  the wrong cached rows with no refetch; a key with a new object literal every render refetches
  forever.
- **Export the key from the hook that owns it** and import it to invalidate. A key written twice
  is an invalidation that silently matches nothing.
- **Tune `staleTime`, don't add a second cache.** Config that never changes in a session gets
  `Infinity` (`useAuthConfig`); session identity gets minutes (`useAuth`); the default is 30s in
  `createQueryClient`.
- **Pass `signal` through to `fetchApi`** so an unmount aborts the request in flight.
- Never mirror query data into `useState`, and never add a second data library. Both create a copy
  that goes stale.
