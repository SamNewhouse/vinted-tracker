// ─────────────────────────────────────────────────────────────
// Core domain types — Vinted Finance Tracker
// ─────────────────────────────────────────────────────────────

// ── Enums / Unions ────────────────────────────────────────────

/** Lifecycle of a single item from acquisition to sold/written-off. */
export type ItemStatus =
  | "unlisted"    // owned, not yet listed for sale
  | "listed"      // actively listed on a platform
  | "sold"        // sale completed, salePrice recorded
  | "returned"    // buyer returned it
  | "unsellable"  // damaged, lost, decided to keep, etc.

/** Extra costs that attach to a Bundle and split across its Items. */
export type CostCategory =
  | "car_boot_entry"  // entry fee paid to attend
  | "postage"      // cost to receive the parcel
  | "fuel"            // travel to source
  | "parking"         // parking at car boot / collection
  | "packaging"  // bubble wrap, boxes bought in bulk for the haul
  | "other_purchase"  // catch-all


// ── Extra Costs ───────────────────────────────────────────────

/** A cost incurred when purchasing/sourcing a bundle.
 *  Split equally across all Items in the bundle. */
export interface BundleExtraCost {
  id: string
  label: string                   // e.g. "Car boot entry – Wigan"
  category: CostCategory
  amount: number                  // £
}

/** A cost incurred when selling a specific item.
 *  Stored on the Item, subtracted from its profit calculation. */
export interface ItemSaleCost {
  id: string
  label: string                   // e.g. "Royal Mail 2nd class"
  category: CostCategory
  amount: number                  // £
}

// ── Item ──────────────────────────────────────────────────────

/** The primary entity. Represents a single physical item being resold. */
export interface Item {
  id: string
  bundleId: string

  // ── Bundle context (denormalised at creation) ──
  bundleName: string
  bundleSource: string
  purchaseDate: string            // inherited from bundle at creation

  // ── Identity ──
  name: string
  description?: string
  notes?: string

  // ── Acquisition cost (recalculated when bundle costs change) ──
  allocatedPurchaseCost: number   // bundlePurchaseCost / itemCount
  allocatedExtraCostShare: number // totalBundleExtraCosts / itemCount

  // ── Target margin (per-item, defaults to 15) ──
  targetMarginPercent: number     // stored so it can be overridden per item

  // ── Sale-side costs (added when marking sold) ──
  saleCosts: ItemSaleCost[]

  // ── Sale ──
  status: ItemStatus
  listedAt?: string               // ISO date
  listedPrice?: number            // what it's listed for
  soldAt?: string                 // ISO date
  salePrice?: number              // what it actually sold for

  createdAt: string
  updatedAt: string
}

// ── Bundle ────────────────────────────────────────────────────

/** A purchase event. Groups Items bought together and splits costs.
 *  Items are stored separately in state.items — linked via item.bundleId. */
export interface Bundle {
  id: string
  name: string                    // e.g. "Car boot – Wigan, 12 Apr"
  source: string                  // e.g. "Car boot – Wigan", "Vinted seller: john99"
  purchaseDate: string            // ISO date
  purchaseCost: number            // total £ paid for the whole bundle
  extraCosts: BundleExtraCost[]   // purchase-side costs split across all items
  notes?: string
  createdAt: string
  updatedAt: string
}

// ── Draft types (form state only, never persisted) ────────────

/** Item being defined in AddBundleForm before dispatch — no IDs yet. */
export interface DraftItem {
  tempId: string                  // client-side uuid for list keying
  name: string
  description?: string
  notes?: string
}

/** Extra cost being defined in a form before dispatch — no IDs yet. */
export interface DraftCost {
  tempId: string
  label: string
  category: CostCategory
  amount: number
}

// ── Computed / View types (never persisted) ───────────────────

/** Rolled-up numbers for a single Bundle. Derived by selector. */
export interface BundleSummary {
  bundleId: string
  itemCount: number
  totalInvested: number           // purchaseCost + all BundleExtraCosts
  perItemCost: number             // totalInvested / itemCount
  totalRevenue: number            // sum of sold items' salePrices
  totalSaleCosts: number          // sum of all items' saleCosts
  totalProfit: number             // totalRevenue - totalInvested - totalSaleCosts
  profitMargin: number            // %
  soldItemCount: number
  listedItemCount: number
  unlistedItemCount: number
  returnedItemCount: number
  unsellableItemCount: number
  isProfitable: boolean
  isBreakEven: boolean
}

/** Top-level dashboard KPIs across all bundles and items. */
export interface DashboardStats {
  totalSpend: number              // all bundle purchase costs + bundle extra costs
  totalSaleCosts: number          // all item-level sale costs
  totalRevenue: number            // all sold item sale prices
  totalProfit: number             // revenue - spend - sale costs
  overallROI: number              // %
  totalBundles: number
  totalItems: number
  soldItems: number
  listedItems: number
  unlistedItems: number
  returnedItems: number
  unsellableItems: number
  avgProfitPerItem: number        // across sold items only
}

// ── UI State ──────────────────────────────────────────────────

export type ViewMode =
  | "dashboard"
  | "items"
  | "bundles"
  | "bundle-detail"
  | "add-bundle"
  | "analytics"

export type SortField = "date" | "profit" | "spend" | "revenue" | "name" | "roi"
export type SortDirection = "asc" | "desc"

export interface FilterState {
  search: string
  status: ItemStatus | "all"
  bundleId: string | "all"        // filter items by a specific bundle
  sortField: SortField
  sortDirection: SortDirection
}
