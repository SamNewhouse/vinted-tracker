import type { ExtraCostCategory } from "../types";

export const COST_CATEGORY_LABELS: Record<ExtraCostCategory, string> = {
  postage: "Postage",
  packaging: "Packaging",
  car_boot_entry: "Car Boot Entry",
  platform_fee: "Platform Fee",
  repair: "Repair / Alteration",
  cleaning: "Cleaning",
  other: "Other",
};

// ---------------------------------------------------------------------------
// PURCHASE-SIDE CALCULATIONS
// These run when items are added to a bundle and whenever the bundle's
// purchase cost or extra costs change. Results are stored on BundleItem
// as allocatedCost and extraCostsShare.
// ---------------------------------------------------------------------------

/**
 * Splits the bundle's total purchase cost evenly across all items.
 * Called by recalculateAllocations in the slice — not used directly in UI.
 *
 * e.g. £30 bundle ÷ 5 items = £6.00 per item
 */
export function calcPerItemCost(totalCost: number, itemCount: number): number {
  if (itemCount === 0) return 0;
  return totalCost / itemCount;
}

/**
 * The absolute floor — the lowest price you can sell an item for
 * without making a loss. Does not account for any profit target.
 *
 * breakEven = allocatedCost + extraCostsShare
 *
 * e.g. item cost £6 + £1.50 extras = break-even at £7.50
 */
export function calcBreakEvenPrice(allocatedCost: number, extraCostsShare: number): number {
  return allocatedCost + extraCostsShare;
}

/**
 * The recommended minimum sale price to hit a target profit margin.
 * Defaults to 15% above total item cost. Used to display the "Min. sale"
 * figure on item rows and the mark-sold modal.
 *
 * minSalePrice = (allocatedCost + extraCostsShare) × (1 + margin / 100)
 *
 * e.g. £7.50 total cost × 1.15 = £8.63 minimum at 15% margin
 */
export function calcMinSalePrice(
  allocatedCost: number,
  extraCostsShare: number,
  targetMarginPercent: number = 15,
): number {
  const totalCost = allocatedCost + extraCostsShare;
  return totalCost * (1 + targetMarginPercent / 100);
}

// ---------------------------------------------------------------------------
// SALE-SIDE CALCULATIONS
// These run when an item is marked as sold. Sale costs (postage out,
// platform fees, packaging etc.) are stored as ExtraCost entries on the
// bundle with timing: "sale" and itemId set to the sold item.
// ---------------------------------------------------------------------------

/**
 * Sums all additional costs for a sale (postage, packaging, platform fees).
 * Accepts any array with an amount field — works with full ExtraCost[]
 * or lightweight preview objects used in the mark-sold modal.
 *
 * e.g. £2.95 postage + £0.50 packaging = £3.45 total additional costs
 */
export function calcTotalAdditionalCosts(costs?: Array<{ amount: number }>): number {
  if (!costs?.length) return 0;
  return costs.reduce((sum, c) => sum + c.amount, 0);
}

/**
 * Net profit on a single sold item, after all costs are deducted.
 *
 * profit = salePrice − allocatedCost − extraCostsShare − additionalSaleCosts
 *
 * e.g. sold for £12.00 − £6.00 item cost − £1.50 extras − £3.45 sale costs = £1.05 profit
 */
export function calcItemProfit(
  salePrice: number,
  allocatedCost: number,
  extraCostsShare: number,
  additionalCosts?: Array<{ amount: number }>,
): number {
  return salePrice - allocatedCost - extraCostsShare - calcTotalAdditionalCosts(additionalCosts);
}

// ---------------------------------------------------------------------------
// BUNDLE-LEVEL CALCULATIONS
// These aggregate across all items in a bundle to produce the summary
// figures shown on BundleCards and the detail view.
// ---------------------------------------------------------------------------

/**
 * Return on investment as a percentage.
 * Used on bundle summaries and the analytics view.
 *
 * ROI = (profit / totalInvested) × 100
 *
 * e.g. £4.20 profit on £18.00 invested = 23.3% ROI
 */
export function calcROI(profit: number, totalInvested: number): number {
  if (totalInvested === 0) return 0;
  return (profit / totalInvested) * 100;
}

// ---------------------------------------------------------------------------
// FORMATTING UTILITIES
// Pure display helpers — no business logic.
// ---------------------------------------------------------------------------

/**
 * Formats a number as GBP currency.
 * e.g. 8.5 → "£8.50"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats a number as a percentage string with optional +/- sign.
 * e.g. formatPercent(23.3, true) → "+23.3%"
 *      formatPercent(-5.0, true) → "-5.0%"
 *      formatPercent(10.0)       → "10.0%"
 */
export function formatPercent(value: number, showSign = false): string {
  const formatted = `${Math.abs(value).toFixed(1)}%`;
  if (!showSign) return formatted;
  return value >= 0 ? `+${formatted}` : `-${formatted}`;
}
