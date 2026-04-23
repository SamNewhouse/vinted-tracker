import { FC, memo, ReactNode } from "react";

interface Props {
  label: string;
  value: string;
  subtext?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: ReactNode;
  highlight?: boolean;
}

const StatCard: FC<Props> = ({ label, value, subtext, trend, trendValue, icon, highlight }) => {
  const trendColour =
    trend === "up"
      ? "text-emerald-600 dark:text-emerald-400"
      : trend === "down"
        ? "text-red-500 dark:text-red-400"
        : "text-slate-500";

  const trendArrow = trend === "up" ? "↑" : trend === "down" ? "↓" : "→";

  return (
    <div
      className={`rounded-xl p-5 border transition-all ${
        highlight
          ? "bg-slate-900 border-slate-700 text-white dark:bg-slate-800"
          : "bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <span
          className={`text-xs font-medium uppercase tracking-widest ${highlight ? "text-slate-400" : "text-slate-500 dark:text-slate-400"}`}
        >
          {label}
        </span>
        {icon && (
          <span className={`${highlight ? "text-slate-400" : "text-slate-400"}`}>{icon}</span>
        )}
      </div>
      <p
        className={`text-2xl font-bold font-heading tabular-nums ${highlight ? "text-white" : "text-slate-900 dark:text-white"}`}
      >
        {value}
      </p>
      {(subtext || trendValue) && (
        <div className="mt-1.5 flex items-center gap-2">
          {trendValue && (
            <span className={`text-xs font-semibold ${trendColour}`}>
              {trendArrow} {trendValue}
            </span>
          )}
          {subtext && (
            <span
              className={`text-xs ${highlight ? "text-slate-400" : "text-slate-500 dark:text-slate-500"}`}
            >
              {subtext}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default memo(StatCard);
