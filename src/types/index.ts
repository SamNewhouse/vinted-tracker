// ─── Primitives ───────────────────────────────────────────────────────────────

export type Data = {
  message?: string;
  error?: string;
};

export type ItemStatus = "unlisted" | "listed" | "sold" | "returned" | "unsellable";

export type ExtraCostCategory = "postage" | "car_boot_entry" | "other";

export type ViewMode = "dashboard" | "bundles" | "bundle-detail" | "add-bundle" | "analytics";

export type SortField = "date" | "profit" | "spend" | "revenue" | "name";
export type SortDirection = "asc" | "desc";

// ─── Cost structures ──────────────────────────────────────────────────────────

export interface ExtraCost {
  id: string;
  label: string;
  category: ExtraCostCategory;
  amount: number;
  bundleId?: string;
}

/**
 * Costs incurred at the point of sale for a single item.
 * These are NOT split across the bundle — they belong to the item only.
 */
export interface SaleCosts {
  postageOut: number; // shipping label cost
  packaging: number; // box, bag, bubble wrap etc.
  platformFee: number; // Vinted / eBay / Depop fee
  otherCosts: number; // anything else at point of sale
}

// ─── Core domain ──────────────────────────────────────────────────────────────

export interface BundleItem {
  id: string;
  name: string;
  description?: string;
  /** purchaseCost / itemCount — auto-calculated, never manually set */
  allocatedCost: number;
  /** bundle extraCosts total / itemCount — auto-calculated, never manually set */
  extraCostsShare: number;
  /** Actual price the buyer paid */
  salePrice?: number;
  /** Costs incurred when selling this specific item */
  saleCosts?: SaleCosts;
  status: ItemStatus;
  listedAt?: string; // ISO date string
  soldAt?: string; // ISO date string
  notes?: string;
}

export interface Bundle {
  id: string;
  name: string;
  purchaseDate: string; // ISO date string
  purchaseCost: number; // total paid for the whole bundle £
  source: string; // e.g. "Car boot – Wigan", "Vinted", "Charity shop"
  items: BundleItem[];
  /** Upfront costs split equally across all items (postage in, entry fees etc.) */
  extraCosts: ExtraCost[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type BundleStatus = "success" | "warning" | "error" | "neutral" | "info" | "profit" | "loss";

// ─── Derived / computed (never stored in Redux) ───────────────────────────────

export interface BundleSummary {
  bundleId: string;
  totalInvested: number; // purchaseCost + all extraCosts
  totalRevenue: number; // sum of sold items' salePrices
  totalProfit: number; // totalRevenue - totalInvested - all saleCosts
  profitMargin: number; // %
  soldItemCount: number;
  unsoldItemCount: number;
  averageMinSalePrice: number; // per-item cost * 1.15
  isBreakEven: boolean;
  isProfitable: boolean;
}

export interface DashboardStats {
  totalSpend: number;
  totalRevenue: number;
  totalProfit: number;
  overallProfitMargin: number;
  totalBundles: number;
  totalItems: number;
  soldItems: number;
  activeListings: number;
  unlistedItems: number;
  bestPerformingBundle?: string;
  worstPerformingBundle?: string;
}

// ─── UI state ─────────────────────────────────────────────────────────────────

export interface FilterState {
  search: string;
  status: ItemStatus | "all";
  sortField: SortField;
  sortDirection: SortDirection;
}

/**
 * Local draft used only inside AddBundleForm before the bundle exists in Redux.
 * Not persisted anywhere.
 */
export interface DraftCost {
  tempId: string;
  label: string;
  category: ExtraCostCategory;
  amount: string; // string while in the input, converted to number on submit
}

/**
 * Shape of a single category option used in cost dropdowns.
 */
export interface CostCategoryOption {
  value: ExtraCostCategory;
  label: string;
  hint: string;
}
