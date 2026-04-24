# VintedTracker

A personal finance tracker for Vinted resellers. Track bundles of clothing you buy, individual items within them, and monitor your profit & loss across everything.

## What it does

- **Bundles** - Log purchases (car boots, charity shops, etc.) with costs and extra expenses (travel, parking, cleaning)
- **Items** - Track each item in a bundle, auto-calculated break-even and minimum sale prices
- **Items list** - Cross-bundle view of all items with filtering by status, bundle, and sort options
- **Dashboard** - Top-level stats: total spend, revenue, profit, ROI
- **Analytics** - Coming soon

## Tech stack

- Next.js 16 (App Router)
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
  presentation/
    1-atoms/        # Buttons, inputs, badges
    2-molecules/    # ItemRow, BundleCard
    3-organisms/    # Forms, modals, lists
    4-layouts/      # DashboardLayout (sidebar + mobile nav)
    5-pages/        # Page-level components (view-switched via Redux)
  store/
    trackerSlice.ts # All state, actions, reducers
    selectors.ts    # Memoised selectors
    store.ts        # Redux store + persist config
  types/
    index.ts        # All domain types
  utils/
    finance.ts      # calcItemProfit, formatCurrency
```

## Navigation

Routing is Redux-based (`setView`), not Next.js file routing. All views render inside `HomePage.tsx` via a switch on `state.tracker.view`.
