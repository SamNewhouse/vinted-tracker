import { FC, memo, ReactNode } from "react";

interface Props {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

const SectionHeader: FC<Props> = ({ title, subtitle, action }) => (
  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
    <div>
      <h2 className="font-heading font-semibold text-slate-900 dark:text-white">{title}</h2>
      {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

export default memo(SectionHeader);
