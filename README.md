# cocktail-bar-web

React front end for the cocktail calculator. Tell it what you have on the shelf
and it shows you what you can pour.

It is a standalone SPA and talks to [`cocktail-bar-api`](https://github.com/theskyriser/cocktail-bar-api)
over REST, authenticating with Laravel Sanctum's stateful cookie flow.

## Stack

React 19 · TypeScript · React Router · TanStack Query · React Hook Form · Zod ·
Tailwind 4 · shadcn/Radix · vite-plus

## Getting started

```bash
npm install
cp .env.example .env
npm run dev
```

The app needs the API running on `http://localhost:8000`:

```bash
cd ../cocktail-bar-api && ./vendor/bin/sail up -d && composer run dev
```

Cookie auth works across ports on `localhost`, so no proxy is needed. The API's
`.env` needs `SESSION_DOMAIN=localhost` and
`SANCTUM_STATEFUL_DOMAINS=localhost:5173`.

## Scripts

| Command             | Does                                     |
| ------------------- | ---------------------------------------- |
| `npm run dev`       | Vite dev server on `:5173`               |
| `npm run build`     | Production build into `dist/`            |
| `npm run ci:check`  | Lint, typecheck and tests — what CI runs |
| `npm run check:fix` | Fix lint and formatting                  |
| `npm run test`      | Vitest in watch mode                     |

## Architecture

`src/app/` is the routing shell, `src/common/` is everything shared, and each
bounded context lives in `src/context.{domain}/` with its own `_domain/`,
`data/`, `hooks/` and `components/` layers.

See [CLAUDE.md](CLAUDE.md) for the full architecture, the API contract and the
conventions this repo holds itself to.
