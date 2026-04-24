// ─────────────────────────────────────────────────────────────
// Core domain types - Vinted Finance Tracker
// ─────────────────────────────────────────────────────────────

// ── Enums / Unions ────────────────────────────────────────────

export type ItemStatus = "unlisted" | "listed" | "sold" | "returned" | "unsellable";

/** Visual status variants for the Badge atom */
export type BundleStatus = "success" | "warning" | "error" | "neutral" | "info" | "profit" | "loss";

export type Source =
  | "vinted"
  | "car_boot"
  | "facebook_marketplace"
  | "charity_shop"
  | "ebay"
  | "depop"
  | "jumble_sale"
  | "gumtree"
  | "other";

export type CostCategory =
  | "postage"
  | "admission"
  | "travel"
  | "cleaning"
  | "parking"
  | "packaging"
  | "other_purchase";

// ── Costs ─────────────────────────────────────────────────────

export interface Cost {
  id: string;
  label: string;
  category: CostCategory;
  amount: number;
}

// ── Item ──────────────────────────────────────────────────────

export interface Item {
  id: string;
  bundleId?: string;
  source: Source;
  purchaseDate: string;
  purchaseCost: number; // direct cost for standalone; allocated share for bundle items
  name: string;
  description?: string;
  notes?: string;
  allocatedPurchaseCost: number;
  allocatedCostShare: number;
  breakEvenPrice: number;
  minSalePrice: number;
  targetMarginPercent: number;
  marginOverridden?: boolean;
  costs: Cost[];      // acquisition costs (standalone only); empty for bundle items
  saleCosts: Cost[];  // costs incurred when selling
  status: ItemStatus;
  listedAt?: string;
  listedPrice?: number;
  soldAt?: string;
  salePrice?: number;
  createdAt: string;
  updatedAt: string;
}

// ── Bundle ────────────────────────────────────────────────────

export interface Bundle {
  id: string;
  name: string;
  source: Source;
  purchaseDate: string;
  purchaseCost: number;
  costs: Cost[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Draft types (form state only, never persisted) ────────────

export interface DraftItem {
  id: string;
  name: string;
  description?: string;
  notes?: string;
}

// ── Computed / View types (never persisted) ───────────────────

export interface BundleSummary {
  bundleId: string;
  itemCount: number;
  totalInvested: number;
  perItemCost: number;
  totalRevenue: number;
  totalSaleCosts: number;
  totalProfit: number;
  profitMargin: number;
  soldItemCount: number;
  listedItemCount: number;
  unlistedItemCount: number;
  returnedItemCount: number;
  unsellableItemCount: number;
  isProfitable: boolean;
  isBreakEven: boolean;
}

export interface DashboardStats {
  totalSpend: number;
  totalSaleCosts: number;
  totalRevenue: number;
  totalProfit: number;
  overallROI: number;
  totalBundles: number;
  totalItems: number;
  soldItems: number;
  listedItems: number;
  unlistedItems: number;
  returnedItems: number;
  unsellableItems: number;
  avgProfitPerItem: number;
}

// ── UI State ──────────────────────────────────────────────────

export interface AppConfig {
  defaultMarginPercent: number;
  defaultSaleCosts: Cost[];
}

export type ViewMode =
  | "dashboard"
  | "items"
  | "add-item"
  | "bundles"
  | "add-bundle"
  | "bundle-detail"
  | "settings"
  | "analytics";

export type SortField = "date" | "profit" | "spend" | "revenue" | "name" | "roi";
export type SortDirection = "asc" | "desc";

export interface FilterState {
  search: string;
  status: ItemStatus | "all";
  bundleId: string | "all";
  sortField: SortField;
  sortDirection: SortDirection;
}
