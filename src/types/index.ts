export type Data = {
  message?: string;
  error?: string;
};

export type ItemStatus = "unlisted" | "listed" | "sold" | "returned" | "unsellable";

/** Visual status variants for the Badge atom */
export type BundleStatus =
  | "success"
  | "warning"
  | "error"
  | "neutral"
  | "info"
  | "profit"
  | "loss";

/**
 * Temporary cost object used in the Add Bundle form before the bundle
 * has been created and assigned an ID. Converted to ExtraCost on submit.
 */
export interface DraftCost {
  tempId: string;       // local only — used as React key and for removal
  label: string;
  category: ExtraCostCategory;
  amount: number;
}

export type ExtraCostCategory =
  | "postage"
  | "packaging"
  | "car_boot_entry"
  | "platform_fee"
  | "repair"
  | "cleaning"
  | "other";

/** When the cost was incurred — purchase side or sale side */
export type ExtraCostTiming = "purchase" | "sale";

export interface ExtraCost {
  id: string;
  label: string;
  category: ExtraCostCategory;
  timing: ExtraCostTiming; // ← new: replaces SaleCosts entirely
  amount: number;
  /** If set, this cost is attributed to a specific item rather than split across all */
  itemId?: string;
}

export interface BundleItem {
  id: string;
  name: string;
  description?: string;
  allocatedCost: number;
  extraCostsShare: number;
  salePrice?: number;
  status: ItemStatus;
  listedAt?: string;
  soldAt?: string;
  notes?: string;
}

export interface Bundle {
  id: string;
  name: string;
  purchaseDate: string;
  purchaseCost: number;
  source: string;
  items: BundleItem[];
  extraCosts: ExtraCost[]; // holds ALL costs — purchase AND sale, split by timing
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BundleSummary {
  bundleId: string;
  totalPurchaseCosts: number; // purchaseCost + purchase-timed extraCosts
  totalSaleCosts: number; // sale-timed extraCosts
  totalInvested: number; // totalPurchaseCosts + totalSaleCosts
  totalRevenue: number; // sum of item salePrices
  totalProfit: number; // totalRevenue - totalInvested
  profitMargin: number;
  soldItemCount: number;
  unsoldItemCount: number;
  averageMinSalePrice: number;
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

export type ViewMode = "dashboard" | "bundles" | "bundle-detail" | "add-bundle" | "analytics";
export type SortField = "date" | "profit" | "spend" | "revenue" | "name";
export type SortDirection = "asc" | "desc";

export interface FilterState {
  search: string;
  status: ItemStatus | "all";
  sortField: SortField;
  sortDirection: SortDirection;
}
