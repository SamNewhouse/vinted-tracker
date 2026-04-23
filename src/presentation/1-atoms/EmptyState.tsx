import { FC, memo, ReactNode } from "react";

interface Props {
  icon: string;
  title: string;
  description: string;
  action?: ReactNode;
}

const EmptyState: FC<Props> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <span className="text-5xl mb-4">{icon}</span>
    <h3 className="font-heading font-semibold text-lg text-slate-900 dark:text-white mb-2">
      {title}
    </h3>
    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mb-6">{description}</p>
    {action && action}
  </div>
);

export default memo(EmptyState);
