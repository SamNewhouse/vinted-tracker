# VintedTracker

A personal finance tracker for Vinted resellers. Track bundles of clothing you buy, individual items within them, and monitor your profit & loss across everything.

## What it does

- **Bundles** — Log purchases (car boots, charity shops, etc.) with purchase cost and extra expenses (travel, parking, cleaning, postage, etc.)
- **Items** — Track each item in a bundle with auto-calculated break-even and minimum sale prices. Per-item margin overrides supported.
- **Items list** — Cross-bundle view of all items with filtering by status, bundle, and sort options
- **Mark as Sold** — Record sale price and per-sale costs (postage, packaging, etc.). Pre-filled from default sale costs if configured.
- **Dashboard** — Top-level stats: total spend, revenue, profit, ROI
- **Settings** — Configure default profit margin (applied to all non-overridden items) and default sale costs (pre-filled on every sale modal)
- **Analytics** — Coming soon

## Cost allocation model

Purchase cost and bundle extra costs are split equally across all **active** unsold items. When an item is sold, its allocation is frozen. The remaining unrecovered cost is redistributed across the remaining active items automatically.

- `breakEvenPrice` = `allocatedPurchaseCost` + `allocatedExtraCostShare`
- `minSalePrice` = `breakEvenPrice * (1 + targetMarginPercent / 100)`
- Sold items are frozen — their allocations are never recalculated
- Unsellable/returned items get zero allocation — their share moves to active items

## Margin behaviour

- All new items inherit `defaultMarginPercent` from config
- Changing the default margin only updates items that haven't had their margin manually overridden (`marginOverridden: false`)
- Per-item margin changes set `marginOverridden: true`, protecting them from future default changes

## Tech stack

- Next.js 15 (App Router)
- TypeScript
- Redux Toolkit + redux-persist (localStorage)
- Tailwind CSS
- Atomic design component structure (`1-atoms` → `5-pages`)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
src/
  config/
    constants.ts        # COST_CATEGORIES, SOURCES
  presentation/
    1-atoms/            # Button, Input, Badge, Modal, Select, ValueCell, ProfitValue
    2-molecules/        # ItemRow, ItemRowEditableFields, ItemRowPricingBreakdown, BundleCard
    3-organisms/        # Forms, modals, lists
    4-layouts/          # DashboardLayout (sidebar + mobile nav)
    5-pages/            # Dashboard, Bundles, Items, Settings, BundleDetail, AddBundle
  store/
    trackerSlice.ts     # All state, actions, reducers
    selectors.ts        # Memoised selectors
    store.ts            # Redux store + persist config
  types/
    index.ts            # All domain types
  utils/
    finance.ts          # calcItemProfit, calcROI, formatCurrency
```


## Navigation

Routing is Redux-based (`setView`), not Next.js file routing. All views render inside `HomePage.tsx` via a switch on `state.tracker.view`.

## Key types

| Type | Purpose |
| :-- | :-- |
| `Bundle` | A purchase batch with cost and extra expenses |
| `Item` | A single resellable item within a bundle |
| `ItemSaleCost` | A cost incurred at point of sale (postage, packaging, etc.) |
| `BundleExtraCost` | An upfront cost associated with acquiring the bundle |
| `AppConfig` | User preferences: default margin, default sale costs |
| `BundleSummary` | Computed view type — never persisted |
| `DashboardStats` | Computed view type — never persisted |
