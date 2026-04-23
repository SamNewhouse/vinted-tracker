import { FC, memo } from "react";

interface Props {
  value: string;
  direction: "up" | "down" | "neutral";
}

const directionMap = {
  up: { arrow: "↑", colour: "text-emerald-600 dark:text-emerald-400" },
  down: { arrow: "↓", colour: "text-red-500 dark:text-red-400" },
  neutral: { arrow: "→", colour: "text-slate-500 dark:text-slate-400" },
};

const TrendBadge: FC<Props> = ({ value, direction }) => {
  const { arrow, colour } = directionMap[direction];
  return (
    <span className={`text-xs font-semibold ${colour}`}>
      {arrow} {value}
    </span>
  );
};

export default memo(TrendBadge);
