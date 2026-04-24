import { FC, ReactNode } from "react";

interface Props {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

const PageHeader: FC<Props> = ({ title, subtitle, actions }) => (
  <div className="flex items-center justify-between gap-4">
    <div>
      <h1 className="font-heading font-bold text-2xl text-slate-900 dark:text-white">{title}</h1>
      {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
    {actions && <div className="flex gap-2 shrink-0">{actions}</div>}
  </div>
);

export default PageHeader;
