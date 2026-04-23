/**
 * types/index.ts
 * Central TypeScript types for the Vinted Finance Tracker.
 */

export type Data = {
  message?: string;
  error?: string;
};

export type ItemStatus = "unlisted" | "listed" | "sold" | "returned" | "unsellable";

export type ExtraCostCategory =
  | "postage_in"
  | "postage_out"
  | "car_boot_entry"
  | "platform_fee"
  | "packaging"
  | "other";

export interface ExtraCost {
  id: string;
  label: string;
  category: ExtraCostCategory;
  amount: number; // in £
  bundleId?: string; // if attached to a specific bundle
}

export interface BundleItem {
  id: string;
  name: string;
  description?: string;
  allocatedCost: number;   // auto-calculated: bundle purchase cost / item count
  extraCostsShare: number; // auto-calculated: proportional share of bundle's extra costs
  salePrice?: number;      // actual sale price if sold
  status: ItemStatus;
  listedAt?: string;       // ISO date string
  soldAt?: string;         // ISO date string
  platformFee?: number;    // e.g. Vinted's 5% buyer protection (paid by buyer, but tracked)
  notes?: string;
}

export interface Bundle {
  id: string;
  name: string;
  purchaseDate: string;    // ISO date string
  purchaseCost: number;    // total paid for the bundle £
  source: string;          // e.g. "Car boot - Wigan", "Vinted", "Charity shop"
  items: BundleItem[];
  extraCosts: ExtraCost[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Derived/computed — never stored, always calculated
export interface BundleSummary {
  bundleId: string;
  totalInvested: number;   // purchaseCost + all extraCosts
  totalRevenue: number;    // sum of soldItems salePrice
  totalProfit: number;     // totalRevenue - totalInvested
  profitMargin: number;    // %
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
