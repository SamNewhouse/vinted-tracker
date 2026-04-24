// ─────────────────────────────────────────────────────────────
// Core domain types - Vinted Finance Tracker
// ─────────────────────────────────────────────────────────────

// ── Enums / Unions ────────────────────────────────────────────

export type ItemStatus = "unlisted" | "listed" | "sold" | "returned" | "unsellable";

/** Visual status variants for the Badge atom */
export type BundleStatus = "success" | "warning" | "error" | "neutral" | "info" | "profit" | "loss";

export type BundleSource =
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

// ── Extra Costs ───────────────────────────────────────────────

export interface BundleExtraCost {
  id: string;
  label: string;
  category: CostCategory;
  amount: number;
}

export interface ItemSaleCost {
  id: string;
  label: string;
  category: CostCategory;
  amount: number;
}

// ── Item ──────────────────────────────────────────────────────

export interface Item {
  id: string;
  bundleId: string;

  // ── Bundle context (denormalised at creation) ──
  bundleName: string;
  bundleSource: BundleSource;
  purchaseDate: string;

  // ── Identity ──
  name: string;
  description?: string;
  notes?: string;

  // ── Acquisition cost (recalculated when bundle costs change) ──
  allocatedPurchaseCost: number;
  allocatedExtraCostShare: number;

  // ── Derived pricing (stored so components can read without recalculating) ──
  breakEvenPrice: number; // allocatedPurchaseCost + allocatedExtraCostShare
  minSalePrice: number; // breakEvenPrice * (1 + targetMarginPercent / 100)

  // ── Target margin ──
  targetMarginPercent: number;

  // ── Sale-side costs ──
  saleCosts: ItemSaleCost[];

  // ── Sale ──
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
  source: BundleSource;
  purchaseDate: string;
  purchaseCost: number;
  extraCosts: BundleExtraCost[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Draft types (form state only, never persisted) ────────────

export interface DraftItem {
  tempId: string;
  name: string;
  description?: string;
  notes?: string;
}

export interface DraftCost {
  tempId: string;
  label: string;
  category: CostCategory;
  amount: number;
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
  defaultSaleCosts: { category: CostCategory; amount: number }[];
}

export type ViewMode =
  | "dashboard"
  | "bundles"
  | "items"
  | "settings"
  | "bundle-detail"
  | "add-bundle"
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
