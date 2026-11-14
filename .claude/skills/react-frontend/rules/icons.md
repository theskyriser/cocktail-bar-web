---
paths:
  - "**/*.{ts,tsx}"
---

# Icons

This project uses **`lucide-react`**. There is no SVG asset folder, no generated filename union
and no icon build step — the import *is* the type check, because a misspelled icon name is an
unresolved module.

## The pattern

Import the icon component from `lucide-react` and render it directly, or pass it to the shared
`Icon` wrapper when the icon is **data** rather than markup:

```tsx
import { Martini, ShoppingCart } from 'lucide-react';

<Martini className="size-4" />
```

`src/common/components/ui/icon.tsx` takes an **icon component**, not a string:

```tsx
export function Icon({ iconNode: IconComponent, className }: IconProps) {
    if (!IconComponent) return null;
    return <IconComponent className={className} />;
}
```

Use the wrapper when the icon arrives as a value — from a navigation config, or from an
enum-keyed map in a context's `_domain/`:

```tsx
// _domain/model.enum.match-tier.ts
export const MATCH_TIER_ICON_MAP = {
    [MATCH_TIER.MAKEABLE]: Check,
    [MATCH_TIER.SUBSTITUTION]: Replace,
    [MATCH_TIER.ONE_SHORT]: ShoppingCart,
} as const satisfies Record<TMatchTier, LucideIcon>;

// components/match-tier-badge.tsx
<Icon iconNode={MATCH_TIER_ICON_MAP[tier]} className="size-4" />
```

That map holds **component references, not strings** — typed `LucideIcon`, so a missing tier is a
compile error and there is no runtime lookup that can miss.

## Rules

- **Never inline a raw `<svg>`** outside `src/common/components/ui/`. It bypasses sizing and any
  shared accessibility handling, and it is the one thing this rule exists to prevent. The
  exceptions already in `ui/` (the logo, `placeholder-pattern.tsx`) are vendored or brand assets.
- **Size with Tailwind classes** — `size-4`, `size-5` — not `width` / `height` props. The icon
  inherits `currentColor`, so colour comes from a semantic text token on the icon or its parent,
  never a hardcoded fill.
- **Pick an existing icon before reaching for a new concept.** Lucide has close synonyms; two
  near-identical icons for the same meaning in different screens reads as a bug.
- **Do not add an icon library.** Lucide is the one, and dependency changes need approval.
- When an icon is purely decorative beside a text label, it needs no accessible name. When it is
  the *only* content of a control, the control needs an accessible label — `aria-label` on the
  button, or visually-hidden text.
