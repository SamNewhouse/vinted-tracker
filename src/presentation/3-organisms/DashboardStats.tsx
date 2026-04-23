"use client";
import { FC, memo } from "react";
import { useAppSelector } from "../../store/hooks";
import { selectDashboardStats } from "../../store/selectors";
import { formatCurrency, formatPercent } from "../../utils/finance";
import StatCard from "../1-atoms/StatCard";

const DashboardStatsOrganism: FC = () => {
  const stats = useAppSelector(selectDashboardStats);

  const profitDirection = stats.totalProfit > 0 ? "up" : stats.totalProfit < 0 ? "down" : "neutral";

  const revenueDirection = stats.totalRevenue > 0 ? "up" : "neutral";

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Total Spend"
        value={formatCurrency(stats.totalSpend)}
        subtext={`${stats.totalBundles} bundle${stats.totalBundles !== 1 ? "s" : ""}`}
        icon={<span className="text-base">💸</span>}
      />
      <StatCard
        label="Total Revenue"
        value={formatCurrency(stats.totalRevenue)}
        subtext={`${stats.soldItems} item${stats.soldItems !== 1 ? "s" : ""} sold`}
        icon={<span className="text-base">💰</span>}
        trend={revenueDirection}
        trendValue={stats.totalRevenue > 0 ? formatCurrency(stats.totalRevenue) : undefined}
      />
      <StatCard
        label="Net Profit / Loss"
        value={formatCurrency(stats.totalProfit)}
        subtext={
          stats.totalSpend > 0
            ? `${formatPercent(stats.overallProfitMargin, true)} overall margin`
            : undefined
        }
        trend={profitDirection}
        trendValue={
          stats.totalSpend > 0 ? formatPercent(stats.overallProfitMargin, true) : undefined
        }
        icon={<span className="text-base">📈</span>}
        highlight
      />
      <StatCard
        label="Active Listings"
        value={String(stats.activeListings)}
        subtext={`${stats.unlistedItems} unlisted · ${stats.totalItems} total`}
        icon={<span className="text-base">🏷️</span>}
      />
    </div>
  );
};

export default memo(DashboardStatsOrganism);
