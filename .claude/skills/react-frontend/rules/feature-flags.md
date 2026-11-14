---
paths:
  - "**/*.{ts,tsx}"
---

# Feature Flags

**There are no feature flags in this project yet.** Read this before adding the first one.

Flags let a feature be turned on or off without a deploy. When the backend is Laravel they are
**defined server-side** (typically with [Pennant](https://laravel.com/docs/pennant)) and exposed
over a single endpoint. This app is a consumer: it never defines the set of flags, it reads them.

## The pattern already exists here

`useAuthConfig` is the same problem solved once already, and a flags hook should look like it:

```ts
export function useAuthConfig(): { authConfig: TAuthConfig } {
    const { data } = useQuery({
        queryKey: AUTH_CONFIG_QUERY_KEY,
        queryFn: ({ signal }) => getAuthConfig({ signal }),
        staleTime: Infinity,
    });

    return { authConfig: data ?? fallbackAuthConfig };
}
```

Three properties to copy:

1. **A provider in `data/`** with a parser, like any other endpoint.
2. **`staleTime: Infinity`** — configuration does not change mid-session, so refetching it is
   noise. A flag flipped server-side reaches the user on their next load, which is the normal
   expectation for a deploy-free toggle.
3. **A hardcoded fallback object**, so the screens still render when the endpoint is missing or
   down. `data ?? fallbackAuthConfig` is the whole mechanism.

## Rules

- **Always define the fallback set, and default risky flags to off.** A flag service outage must
  degrade to a known-safe state, not crash the app and not leave a flag `undefined` — which is
  falsy, and therefore an accidental "off" you did not reason about.
- **One provider reads the endpoint; everything else consumes the hook.** Never fetch flags ad hoc
  from a component.
- **Reference flag keys through a shared const or union**, never a scattered string literal. A
  typo in a flag name reads as "feature off" and fails completely silently — there is no error to
  see, which makes it one of the worst bugs on this list.
- **A flag is temporary scaffolding.** When a feature is fully rolled out, delete the flag *and*
  the dead branch. A permanently-true flag is a conditional everyone has to read and nobody can
  remove with confidence.
- **Do not add a flag for something a policy already gates.** If the API refuses the action for
  unauthorised users, that refusal is the gate; a second one is just a thing to forget.
- **A flag is not an authorisation check.** Hiding a button in the client hides a button. If the
  feature must be unavailable, the API has to refuse it — this app's hard rule is that the server
  owns decisions, and access is one.
- Prefer a hook returning a typed object (`const { flags } = useFeatureFlags()`) over a wrapper
  component. This project has no `<FeatureFlag>` component, and a plain ternary against a typed
  flag is clearer than another layer of indirection.
