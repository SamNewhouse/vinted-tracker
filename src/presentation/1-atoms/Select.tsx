import { FC, memo, SelectHTMLAttributes } from "react";

interface Option {
  value: string;
  label: string;
}

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
  error?: string;
  hint?: string;
}

const Select: FC<Props> = ({ label, options, error, hint, id, className = "", ...rest }) => {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`
          rounded-lg border bg-white dark:bg-slate-900 text-sm
          text-slate-700 dark:text-slate-300 px-3 py-2
          focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white
          transition-all disabled:opacity-50 disabled:cursor-not-allowed
          ${
            error
              ? "border-red-400 dark:border-red-600"
              : "border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500"
          }
          ${className}
        `}
        {...rest}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint && !error && <span className="text-xs text-slate-400 dark:text-slate-500">{hint}</span>}
      {error && <span className="text-xs text-red-600 dark:text-red-400">{error}</span>}
    </div>
  );
};

export default memo(Select);
