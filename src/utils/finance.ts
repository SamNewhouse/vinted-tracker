import type { ItemSaleCost } from "../types";

export function calcPerItemCost(totalCost: number, itemCount: number): number {
  if (itemCount === 0) return 0;
  return totalCost / itemCount;
}

export function calcBreakEvenPrice(
  allocatedPurchaseCost: number,
  allocatedExtraCostShare: number,
): number {
  return allocatedPurchaseCost + allocatedExtraCostShare;
}

export function calcMinSalePrice(breakEvenPrice: number, targetMarginPercent: number = 15): number {
  return breakEvenPrice * (1 + targetMarginPercent / 100);
}

export function calcTotalSaleCosts(saleCosts: ItemSaleCost[]): number {
  return saleCosts.reduce((sum, c) => sum + c.amount, 0);
}

export function calcItemProfit(
  salePrice: number,
  allocatedPurchaseCost: number,
  allocatedExtraCostShare: number,
  saleCosts: ItemSaleCost[],
): number {
  return (
    salePrice - allocatedPurchaseCost - allocatedExtraCostShare - calcTotalSaleCosts(saleCosts)
  );
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
