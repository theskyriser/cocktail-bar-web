# Sections

This file defines all sections, their ordering, impact levels, and descriptions.
The section ID (in parentheses) is the filename prefix used to group rules.

Upstream's section 3, **Server-Side Performance (server)**, has been removed in this fork:
`cocktail-bar-web` is a client-rendered SPA with no server runtime. See `SKILL.md`.

---

## 1. Eliminating Waterfalls (async)

**Impact:** CRITICAL
**Description:** Waterfalls are the #1 performance killer. Each sequential await adds full network latency. Eliminating them yields the largest gains.

## 2. Bundle Size Optimization (bundle)

**Impact:** CRITICAL
**Description:** Reducing initial bundle size improves Time to Interactive and Largest Contentful Paint. In a client-rendered SPA this is the dominant cost: nothing renders until the entry chunk has downloaded, parsed and executed.

## 3. Client-Side Data Fetching (client)

**Impact:** MEDIUM-HIGH
**Description:** Automatic deduplication and efficient data fetching reduce redundant network requests. Here this means using TanStack Query's cache correctly — above all, getting the query key right.

## 4. Re-render Optimization (rerender)

**Impact:** MEDIUM
**Description:** Reducing unnecessary re-renders minimizes wasted computation and improves UI responsiveness.

## 5. Rendering Performance (rendering)

**Impact:** MEDIUM
**Description:** Optimizing the rendering process reduces the work the browser needs to do.

## 6. JavaScript Performance (js)

**Impact:** LOW-MEDIUM
**Description:** Micro-optimizations for hot paths can add up to meaningful improvements. Apply in a measured hot path, not on suspicion.

## 7. Advanced Patterns (advanced)

**Impact:** LOW
**Description:** Advanced patterns for specific cases that require careful implementation.
