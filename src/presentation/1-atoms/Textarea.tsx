import { FC, memo, TextareaHTMLAttributes } from "react";

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea: FC<Props> = ({ label, error, hint, id, className = "", ...rest }) => {
  const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={textareaId}
          className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`
          w-full rounded-lg border bg-white dark:bg-slate-900 text-sm
          text-slate-900 dark:text-white placeholder:text-slate-400
          px-3 py-2 min-h-[80px] resize-none
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
      />
      {hint && !error && <span className="text-xs text-slate-400 dark:text-slate-500">{hint}</span>}
      {error && <span className="text-xs text-red-600 dark:text-red-400">{error}</span>}
    </div>
  );
};

export default memo(Textarea);
