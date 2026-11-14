---
title: Apply Client-Only Visual State Before First Paint
impact: MEDIUM
impactDescription: avoids a visible flash of the wrong theme
tags: rendering, localStorage, flicker, theme, first-paint
---

## Apply Client-Only Visual State Before First Paint

**There is no SSR and no hydration in this app**, so hydration *mismatch* cannot happen. The other
half of the problem does: anything read from `localStorage` is unavailable until the JS bundle
runs, so a theme, a saved layout or a collapsed-sidebar preference applied in React paints the
default first and the real value a moment later — a visible flash.

**Incorrect (flashes the default):**

```tsx
function ThemeWrapper({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState('light')

    useEffect(() => {
        setTheme(localStorage.getItem('appearance') ?? 'light')   // after paint
    }, [])

    return <div className={theme}>{children}</div>
}
```

The first paint is `light`, then it jumps. Moving the read into `useState`'s initialiser paints
correctly but still waits for the whole bundle to parse and execute first.

**Correct (what this project does):** a tiny synchronous script in `index.html`, before the
bundle, that puts the class on `<html>`:

```html
<script>
    (function () {
        try {
            const appearance = localStorage.getItem('appearance') ?? 'system'
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

            if (appearance === 'dark' || (appearance === 'system' && prefersDark)) {
                document.documentElement.classList.add('dark')
            }
        } catch {}
    })()
</script>

<style>
    html { background-color: #f3f2f2; }
    html.dark { background-color: #2d2b2b; }
</style>
```

Both halves matter. The script decides the theme before anything renders; the inline `<style>`
gives the page its background **before `app.css` has loaded**, so there is no white flash on a
slow connection either. These are the only hardcoded colours sanctioned in the project, because
at that moment no token exists yet.

`initializeTheme()` in `main.tsx` then normalises the stored value and attaches the
`prefers-color-scheme` listener; `useAppearance` exposes it to React through
`useSyncExternalStore`. The inline script is not a duplicate of that work — it is the part that
has to happen before React exists.

**Rules:**

- Visual state that comes from browser storage is applied in `index.html`, not in an effect.
- Keep that script tiny, dependency-free and wrapped in `try/catch` — storage can throw in private
  mode or with site data blocked.
- Read the same storage key in both places. A rename in `use-appearance.tsx` that misses
  `index.html` reintroduces the flash silently, and nothing fails to compile.
- Do not extend this pattern to non-visual state. Anything that can wait for React should.
