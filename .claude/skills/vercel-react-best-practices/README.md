# React Best Practices (SPA fork)

Performance rules for React, originally from Vercel Engineering, **pruned and retargeted for
`cocktail-bar-web`** — a client-rendered React SPA on Vite with no server runtime.

## Structure

- `SKILL.md` — entry point: categories, the full rule index, and what this fork changed
- `rules/` — one file per rule (58 of them)
  - `_sections.md` — section metadata (titles, impacts, descriptions)
  - `_template.md` — template for adding a rule
- `metadata.json` — version and provenance

## What changed from upstream

Upstream covers React *and* Next.js. This copy drops what cannot apply and rewrites what can:

- the `server-*` category (RSC, server actions, `React.cache`, `after()`), `async-api-routes` and
  `rendering-hydration-suppress-warning` are **deleted** — there is no server render here
- `next/dynamic` → `React.lazy`, SWR → TanStack Query, Next bundler notes → Vite/Rollup
- `client-swr-dedup` is renamed `client-query-dedup`
- the compiled `AGENTS.md` is **deleted**: it was generated output, its build script is not
  vendored here, so it could not be regenerated and would have drifted from `rules/`

`rules/` is therefore the single source. There is **no build step** in this fork — edit the rule
file and, if you add or remove one, update the index in `SKILL.md` and the count in
`metadata.json` by hand.

## Adding a rule

1. Copy `rules/_template.md` to `rules/<section-prefix>-<slug>.md`.
2. Fill in the frontmatter: `title`, `impact`, `impactDescription`, `tags`.
3. Give it an incorrect example, a correct example, and the concrete failure mode.
4. Add it to the Quick Reference in `SKILL.md` and bump the counts there and in `metadata.json`.

Keep examples in this project's idiom: 4-space indent, single quotes, `@/` alias, TanStack Query,
React Router. A rule illustrated in another stack's API is a rule nobody can apply.

## License

MIT, per upstream.
