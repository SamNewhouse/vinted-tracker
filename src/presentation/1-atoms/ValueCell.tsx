import { FC, memo, ReactNode } from "react";

interface Props {
  label?: string;   // <-- now optional
  value: string;
  colour?: "default" | "profit" | "loss" | "warning" | "muted";
}

const colourMap = {
  default: "text-slate-900 dark:text-white",
  profit: "text-emerald-600 dark:text-emerald-400",
  loss: "text-red-600 dark:text-red-400",
  warning: "text-amber-600 dark:text-amber-400",
  muted: "text-slate-500 dark:text-slate-400",
};

const ValueCell: FC<Props> = ({ label, value, colour = "default" }) => (
  <div>
    {label && (
      <p className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">{label}</p>
    )}
    <p className={`text-sm font-semibold tabular-nums ${colourMap[colour]}`}>{value}</p>
  </div>
);

export default memo(ValueCell);
