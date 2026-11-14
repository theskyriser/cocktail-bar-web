---
title: Use defer or async on Script Tags
impact: HIGH
impactDescription: eliminates render-blocking
tags: rendering, script, defer, async, performance
---

## Use defer or async on Script Tags

A classic `<script src>` with neither attribute blocks HTML parsing while it downloads and
executes, delaying First Contentful Paint.

- **`defer`** — downloads in parallel, executes after parsing, preserves order
- **`async`** — downloads in parallel, executes as soon as it is ready, no order guarantee
- **`type="module"` — deferred by default**, which is why `index.html`'s single bundle entry needs
  no attribute:

```html
<script type="module" src="/src/main.tsx"></script>
```

Use `defer` for scripts that need the DOM or depend on another script; `async` for independent
ones like analytics.

**Incorrect (blocks the parser):**

```html
<head>
    <script src="https://example.com/analytics.js"></script>
</head>
```

**Correct:**

```html
<head>
    <script src="https://example.com/analytics.js" async></script>
</head>
```

### The one deliberate exception in this project

`index.html` contains a small **blocking inline** script that reads the stored appearance and adds
`.dark` to `<html>`:

```html
<script>
    (function () {
        try {
            const appearance = localStorage.getItem('appearance') ?? 'system'
            // … adds 'dark' to documentElement
        } catch {}
    })()
</script>
```

This one **must** block, and must stay inline and in `<head>`. Defer it and the page paints in the
light theme before the class lands, producing exactly the flash the script exists to prevent — see
[rendering-hydration-no-flicker.md](rendering-hydration-no-flicker.md). It is a handful of
synchronous statements with no network access, so it costs microseconds, and the `try/catch`
covers browsers with storage blocked.

Reference: [MDN — script element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#defer)
