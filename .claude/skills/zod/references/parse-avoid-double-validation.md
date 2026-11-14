---
title: Avoid Double Validation
impact: HIGH
impactDescription: re-parsing data already validated wastes work and hides where the real boundary is
tags: parse, performance, optimization, architecture
---

## Avoid Double Validation

Once data has been parsed at the boundary, **trust it**. Re-validating the same object in a hook
or a component costs CPU on every render and, worse, blurs the question of which layer actually
owns the contract.

**Incorrect (parsed at every layer):**

```ts
// data/ — parsed here, correctly
export async function getRecipes(opts: { signal?: AbortSignal }) {
    return await fetchApi(API_ENDPOINTS.recipes, { schema: recipeListSchema, signal: opts.signal });
}

// hooks/ — parsed again
export function useRecipes() {
    const { data } = useQuery({ queryKey: RECIPES_QUERY_KEY, queryFn: getRecipes });

    return { recipes: recipeListSchema.parse(data) };   // ✗ redundant, and runs every render
}

// components/ — parsed a third time
function RecipeList({ recipes }: { recipes: unknown }) {
    const parsed = recipeListSchema.parse(recipes);     // ✗ wasteful
}
```

Beyond the wasted work, the third parse means the component declares its prop as `unknown` — so it
has thrown away the type the boundary already established, and every consumer now has to guess.

**Correct (parse once, pass typed data):**

```ts
// data/ — the single boundary
export async function getRecipes(opts: { signal?: AbortSignal }): Promise<TRecipe[]> {
    const response = await fetchApi(API_ENDPOINTS.recipes, {
        schema: recipeListSchema,
        signal: opts.signal,
    });

    return recipeListAdapter(response);
}

// hooks/ — receives TRecipe[], no re-validation
export function useRecipes() {
    const { data, isPending } = useQuery({ queryKey: RECIPES_QUERY_KEY, queryFn: getRecipes });

    return { recipes: data ?? [], isLoadingRecipes: isPending };
}

// components/ — a typed prop is the guarantee
function RecipeList({ recipes }: { recipes: TRecipe[] }) { … }
```

### The legitimate case: two schemas, two shapes

Validating twice is right when the **shapes genuinely differ** — which in this app means the API
shape and the domain shape, and the adapter between them:

```ts
export const userSchema = z.object({            // what the API sends
    email_verified_at: z.string().nullable(),
    created_at: z.string(),
});

export const userResourceSchema = z.object({    // what the app works with
    emailVerifiedAt: z.date().nullable(),
    createdAt: z.date(),
});
```

`userSchema` parses the response; `userAdapter` converts; `userResourceSchema` exists to derive
`TUser` and to be asserted against in the adapter's own test. That is not double validation of the
same data — it is one check per distinct contract.

**Rules:**

- One parse per inbound boundary, in `data/`.
- Hooks and components take typed props and domain types, never `unknown`.
- A schema in a component is a sign the boundary is in the wrong place.
- Two schemas are right when there are two shapes; they are wrong as a belt-and-braces re-check
  of one shape.

Reference: [Zod performance](https://zod.dev/v4#performance)
