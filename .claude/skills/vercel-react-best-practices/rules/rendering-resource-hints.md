---
title: Use Resource Hints for Critical Resources
impact: HIGH
impactDescription: removes a round trip from the critical path
tags: rendering, preload, preconnect, prefetch, resource-hints
---

## Use Resource Hints for Critical Resources

A hint tells the browser to start work it would otherwise only begin once it discovered the need.
In a static-HTML SPA the earliest and cheapest place to put one is `index.html`, because it is
parsed before the bundle exists.

| Hint | Use for |
|---|---|
| `<link rel="preconnect">` | A third-party origin you will fetch from immediately (DNS + TCP + TLS up front) |
| `<link rel="dns-prefetch">` | An origin you will probably use later — cheaper, weaker |
| `<link rel="preload">` | A specific critical file (font, hero image) the parser would find late |

### What this project already does

```html
<link rel="preconnect" href="https://fonts.bunny.net" />
<link href="https://fonts.bunny.net/css?family=cormorant-garamond:400,600|lora:400,500"
      rel="stylesheet" />
```

The stylesheet is on another origin, so without the `preconnect` the browser pays DNS + TLS before
it can even start downloading it — and webfonts are on the critical path for text rendering.

**A hint worth adding** when the API is on its own subdomain in production, since the first
`/api/user` fires the moment the bundle runs:

```html
<link rel="preconnect" href="https://api.example.com" crossorigin />
```

`crossorigin` is required for a connection that will carry credentialed requests — this app sends
cookies, and a preconnect opened without it is not reused.

### Preloading a lazy route on intent

React Router's `lazy()` chunks are fetched on navigation. Warming one on hover makes the
transition feel instant, and it is just the same `import()` — the module cache dedupes it:

```tsx
const preloadDashboard = () => void import('@/app/pages/dashboard')

<Link to={ROUTES.dashboard} onMouseEnter={preloadDashboard}>Dashboard</Link>
```

**Rules:**

- Hint only what you are confident is needed. Every preload competes for bandwidth with what the
  page genuinely needs now; a wrong guess makes things slower, not neutral.
- `preconnect` to a handful of origins at most — each one holds an open connection.
- Prefer a `<link>` in `index.html` over calling `react-dom`'s `preconnect`/`preload` from a
  component: the HTML hint lands before the bundle is even parsed, and the react-dom APIs exist
  mainly to let a server render emit these during streaming, which this app does not do.
- Self-host a font instead of hinting a third party if first paint really matters; a `preconnect`
  mitigates a cross-origin round trip, it does not remove it.

Reference: [MDN — rel=preconnect](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/preconnect)
