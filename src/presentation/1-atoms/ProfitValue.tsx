import { FC, memo } from "react";
import { formatCurrency } from "../../utils/finance";

interface Props {
  value: number;
  size?: "sm" | "base" | "lg";
  showSign?: boolean;
}

const sizeMap = {
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
};

const ProfitValue: FC<Props> = ({ value, size = "sm", showSign = false }) => (
  <span
    className={`font-semibold tabular-nums ${sizeMap[size]} ${
      value > 0
        ? "text-emerald-600 dark:text-emerald-400"
        : value < 0
          ? "text-red-600 dark:text-red-400"
          : "text-slate-500 dark:text-slate-400"
    }`}
  >
    {showSign && value > 0 ? "+" : ""}
    {formatCurrency(value)}
  </span>
);

export default memo(ProfitValue);
