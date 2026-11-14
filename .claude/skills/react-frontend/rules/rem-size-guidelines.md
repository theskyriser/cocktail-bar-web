---
paths:
  - "**/*.{ts,tsx,css}"
---

# Sizing and the Type Scale

## What this project actually does

- **The root font size is the browser default** — `src/common/styles/app.css` does not override
  `html { font-size }`. So `1rem` is `16px` for a visitor who has not changed their browser
  settings, and something else for one who has. There is no breakpoint-dependent root size and no
  rem→px conversion utility in this project.
- **`body` is set to `15px` with `line-height: 1.55`** for the Classical theme's body copy.

Those two facts together are the trap: **`rem` resolves against the root, not against `body`.**
`text-sm` is `0.875rem` → `14px`, not 87.5% of the body's 15px. Nesting does not compound it
either. If you want a size relative to the *element's own* font size — an icon that should track
its label, say — that is `em`, and `em` does compound through nesting.

## Rules

- **Use Tailwind's scale by default** (`text-sm`, `p-4`, `size-4`, `gap-6`). It is rem-based, so
  it scales with a visitor's own font-size preference. That is an accessibility property, not a
  nicety: hardcoding px opts the user out of it.
- **Do not override the root font size** to make a design fit. It rescales every rem in the app
  at once, including the vendored shadcn primitives, and the regression surfaces on screens
  nobody re-checked.
- **px is acceptable in three cases**, and should be obvious when used: a deliberate hairline or
  micro-label (`text-[10px]`, as the `kicker` utility does), a value a third-party component only
  accepts as a number, and a border width. Everything else goes through the scale.
- **Prefer `size-*` to separate `w-*`/`h-*`** for anything square — icons especially. One class
  cannot drift from the other.
- **Spacing is the scale too.** An arbitrary `mt-[13px]` is almost always a sign something above
  it has the wrong padding; fix the cause rather than nudging the symptom.
- Define sizes once, in the theme, when a value repeats. `app.css` is Tailwind 4's **CSS-first**
  theme — there is no `tailwind.config.ts` in this project, so a new token is a `@theme` entry,
  not a JS config edit.
- **Check a UI change at narrow width before calling it done.** The sidebar layout collapses, and
  `useIsMobile` switches behaviour; a layout verified only at desktop width is verified in one of
  the two states it actually has.

## Editor preview

Tailwind IntelliSense converts rem to px using a single configured base (16px by default), which
matches this project's root. It does **not** know about the 15px `body` rule, so a tooltip for
`text-base` reads 16px while body text around it renders at 15px. Trust the browser, not the
tooltip.
