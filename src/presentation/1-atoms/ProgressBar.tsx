import { FC, memo } from "react";

interface Props {
  value: number; // 0–100
  colour?: "emerald" | "amber" | "red" | "blue";
  height?: "xs" | "sm";
  className?: string;
}

const colourMap = {
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
  blue: "bg-blue-500",
};

const heightMap = {
  xs: "h-1",
  sm: "h-1.5",
};

const ProgressBar: FC<Props> = ({ value, colour = "emerald", height = "sm", className }) => (
  <div
    className={`w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden ${heightMap[height]} ${className}`}
  >
    <div
      className={`h-full rounded-full transition-all duration-500 ${colourMap[colour]}`}
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    />
  </div>
);

export default memo(ProgressBar);
