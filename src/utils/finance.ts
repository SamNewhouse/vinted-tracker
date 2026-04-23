import { SaleCosts } from "../types";

export function calcMinSalePrice(
  allocatedCost: number,
  extraCostsShare: number,
  targetMarginPercent: number = 15,
): number {
  const totalCost = allocatedCost + extraCostsShare;
  return totalCost * (1 + targetMarginPercent / 100);
}

export function calcBreakEvenPrice(allocatedCost: number, extraCostsShare: number): number {
  return allocatedCost + extraCostsShare;
}

export function calcTotalSaleCosts(saleCosts?: SaleCosts): number {
  if (!saleCosts) return 0;
  return saleCosts.postageOut + saleCosts.packaging + saleCosts.platformFee + saleCosts.otherCosts;
}

/**
 * Profit = sale price − allocated bundle cost − upfront extras share − all sale costs
 */
export function calcItemProfit(
  salePrice: number,
  allocatedCost: number,
  extraCostsShare: number,
  saleCosts?: SaleCosts,
): number {
  return salePrice - allocatedCost - extraCostsShare - calcTotalSaleCosts(saleCosts);
}

export function calcROI(profit: number, totalInvested: number): number {
  if (totalInvested === 0) return 0;
  return (profit / totalInvested) * 100;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercent(value: number, showSign = false): string {
  const formatted = `${Math.abs(value).toFixed(1)}%`;
  if (!showSign) return formatted;
  return value >= 0 ? `+${formatted}` : `-${formatted}`;
}

export function splitBundleCost(totalCost: number, itemCount: number): number {
  if (itemCount === 0) return 0;
  return totalCost / itemCount;
}
