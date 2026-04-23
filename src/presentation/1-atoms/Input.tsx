import { FC, memo, InputHTMLAttributes, forwardRef } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  prefix?: string;
  suffix?: string;
  hint?: string;
}

const Input: FC<Props> = forwardRef<HTMLInputElement, Props>(
  ({ label, error, prefix, suffix, hint, className = "", id, ...rest }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {prefix && (
            <span className="absolute left-3 text-sm text-slate-500 dark:text-slate-400 pointer-events-none select-none">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full rounded-lg border bg-white dark:bg-slate-900 text-sm
              text-slate-900 dark:text-white placeholder:text-slate-400
              transition-all duration-150
              focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:ring-offset-0
              disabled:opacity-50 disabled:cursor-not-allowed
              ${
                error
                  ? "border-red-400 dark:border-red-600"
                  : "border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500"
              }
              ${prefix ? "pl-7" : "px-3"} ${suffix ? "pr-10" : "px-3"} py-2
              ${className}
            `}
            {...rest}
          />
          {suffix && (
            <span className="absolute right-3 text-sm text-slate-500 dark:text-slate-400 pointer-events-none select-none">
              {suffix}
            </span>
          )}
        </div>
        {hint && !error && (
          <span className="text-xs text-slate-500 dark:text-slate-500">{hint}</span>
        )}
        {error && <span className="text-xs text-red-600 dark:text-red-400">{error}</span>}
      </div>
    );
  },
);

Input.displayName = "Input";
export default memo(Input);
