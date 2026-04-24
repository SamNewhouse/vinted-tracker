# AI Context - VintedTracker

## What this is
A Next.js + Redux Toolkit app for tracking Vinted resale bundles and items. Single-page app with Redux view routing (not Next.js file routing).

## Key concepts

**Bundle** - A purchase batch (e.g. a car boot haul). Has a `purchaseCost` and optional `extraCosts[]` (travel, parking, etc.). Cost is split evenly across all items.

**Item** - An individual piece of clothing in a bundle. Stores `allocatedPurchaseCost` and `allocatedExtraCostShare` (denormalised at creation, recalculated when bundle costs change). Has a `status`: `unlisted | listed | sold | returned | unsellable`.

**Pricing** - `breakEvenPrice = allocatedPurchaseCost + allocatedExtraCostShare`. `minSalePrice = breakEvenPrice * (1 + targetMarginPercent / 100)`.

## State shape (`state.tracker`)
```ts
{
  bundles: Bundle[]
  items: Item[]
  activeBundleId: string | null
  view: ViewMode
  filters: FilterState
}
```

## Navigation
Views are switched via `dispatch(setView(view))`. Active bundle set via `dispatch(setActiveBundleId(id))`. No URL routing.

## Component structure
Atomic design: `1-atoms` → `2-molecules` → `3-organisms` → `4-layouts` → `5-pages`.

## Persistence
redux-persist to localStorage. SSR-safe storage (noop on server, localStorage on client).

## Key files
- `src/store/trackerSlice.ts` - all actions and reducers
- `src/store/selectors.ts` - `selectFilteredItems`, `selectFilteredBundles`, `selectBundleSummary`, `selectDashboardStats`
- `src/types/index.ts` - all domain types
- `src/utils/finance.ts` - `calcItemProfit`, `formatCurrency`
- `src/presentation/5-pages/HomePage.tsx` - view router switch statement

## Conventions
- All monetary values stored in pounds (£), displayed via `formatCurrency()`
- Dates stored as ISO strings (`YYYY-MM-DD`)
- IDs generated with `crypto.randomUUID()`
- `"use client"` on all interactive components (Next.js App Router)
- Tailwind for all styling, dark mode via `dark:` prefix
