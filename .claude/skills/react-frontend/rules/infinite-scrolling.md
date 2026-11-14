---
paths:
  - "**/*.{ts,tsx}"
---

# Infinite Scrolling & Pagination

**Nothing in this project paginates yet.** Read this before adding the first paginated list, and
update it to match what you actually built.

Applies when `cocktail-bar-api` returns a Laravel paginator envelope and this app consumes it with
TanStack Query's `useInfiniteQuery`. There is no `fetchPaginationApi` wrapper and no provider
registry here — a paginated endpoint is an ordinary provider in a context's `data/` folder that
happens to take a page argument.

## 1. Define the envelope once

Laravel returns the same meta for every paginated endpoint, so declare it once in a shared place
(`src/common/lib/api/pagination.ts` when the first one lands) and compose it per resource:

```ts
export type TPaginationMeta = {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

export type TPaginated<T> = { data: T[]; meta: TPaginationMeta };

export function parsePaginated<T>(
    parseItem: (input: unknown) => T,
): (input: unknown) => TPaginated<T>;
```

Re-declaring the meta per feature is duplication that drifts the moment Laravel's shape changes.
Note the keys stay **snake_case** here, because this type describes the API shape; the adapter is
what renames them. `parsePaginated` is a higher-order parser — it takes the item parser and
returns one for the envelope, which is how parsers compose without a schema library.

## 2. The provider takes a page

```ts
// src/context.recipe/data/getRecipes.ts
export async function getRecipes(opts: {
    data: { page: number; search?: string };
    signal?: AbortSignal;
}): Promise<TRecipePage> {
    const params = new URLSearchParams({ page: String(opts.data.page) });

    if (opts.data.search) {
        params.set('search', opts.data.search);
    }

    const response = await fetchApi(`${API_ENDPOINTS.recipes}?${params}`, {
        parse: parsePaginated(parseRecipe),
        signal: opts.signal,
    });

    return recipePageAdapter(response);
}
```

## 3. One hook, `useInfiniteQuery`

```ts
// src/context.recipe/hooks/use-recipes.ts
export const RECIPES_QUERY_KEY = (search?: string) =>
    ['recipes', { search: search ?? '' }] as const;

export function useRecipes({ search }: { search?: string } = {}) {
    const query = useInfiniteQuery({
        queryKey: RECIPES_QUERY_KEY(search),
        queryFn: ({ pageParam, signal }) =>
            getRecipes({ data: { page: pageParam, search }, signal }),
        initialPageParam: 1,
        getNextPageParam: (last) =>
            last.meta.currentPage < last.meta.lastPage
                ? last.meta.currentPage + 1
                : undefined,
    });

    return {
        recipes: query.data?.pages.flatMap((page) => page.data) ?? [],
        isLoadingRecipes: query.isPending,
        isLoadingMoreRecipes: query.isFetchingNextPage,
        hasMoreRecipes: query.hasNextPage,
        loadMoreRecipes: query.fetchNextPage,
    };
}
```

Three things earn their place:

- **`getNextPageParam` returning `undefined` is how pagination ends.** Returning the same page
  number instead loops forever, fetching the last page on every scroll.
- **Flatten in the hook, not the component.** The view wants a list; `pages` is a cache detail.
- **Filters belong in the query key.** `RECIPES_QUERY_KEY(search)` means two searches are two
  cache entries. Leave the filter out and the first search's results are served for the second —
  with no refetch, because the key matched.

## 4. Driving the fetch from the viewport

Observe a sentinel after the last row with `IntersectionObserver` and fetch when it appears:

```tsx
const sentinelRef = useRef<HTMLDivElement>(null);

useEffect(() => {
    const node = sentinelRef.current;

    if (!node || !hasMoreRecipes || isLoadingMoreRecipes) {
        return;
    }

    const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
            void loadMoreRecipes();
        }
    });

    observer.observe(node);

    return () => observer.disconnect();
}, [hasMoreRecipes, isLoadingMoreRecipes, loadMoreRecipes]);
```

**Always return the disconnect function.** An observer left attached after unmount holds a
reference to the node and fires into a dead component — and under `StrictMode`'s double-invoked
effects you get two observers, so the bug shows up as pages being fetched twice.

**Two distinct loading states, and they are not interchangeable:** the initial load replaces the
list with a skeleton; loading a further page appends a spinner *below* rows already on screen and
must not unmount them. Rendering one spinner for both is what makes a list flicker back to empty
on every scroll.

## 5. Virtualise only when it hurts

For lists long enough to drop frames, render only the rows near the viewport with TanStack Virtual
— and then drive pagination from the virtualiser's own item range rather than a sentinel, because
a sentinel far off screen is never rendered to be observed:

```tsx
const virtualizer = useVirtualizer({
    count: hasMoreRecipes ? recipes.length + 1 : recipes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 5,
});
```

The extra trailing index when `hasMoreRecipes` **is** the loader row — that is what an
`isLoaderRow = index > recipes.length - 1` check renders. Adding a virtualiser means a new
dependency, so it needs approval; do not reach for it before a list is actually slow.

## Rules

- A paginated provider is a normal provider: `fetchApi`, a `parse`, a `signal`, an adapter.
- Every filter that changes the result set goes in the query key.
- Flatten pages in the hook; return domain-friendly names.
- `getNextPageParam` must return `undefined` at the end.
- Disconnect observers on unmount.
- Server-side ordering is the server's: **sorting a column the API already ordered is fine,
  re-ranking by match tier in the browser is not.**
