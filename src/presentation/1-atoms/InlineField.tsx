import { FC, memo, useState, useRef, useEffect } from "react";

export interface InlineFieldProps {
  label: string;
  displayValue: string;
  editValue: string;
  onSave: (val: string) => void;
  type?: "text" | "number";
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  valueClassName?: string;
  disabled?: boolean;
}

const InlineField: FC<InlineFieldProps> = ({
  label,
  displayValue,
  editValue,
  onSave,
  type = "text",
  prefix,
  suffix,
  min,
  max,
  step,
  valueClassName = "text-slate-900 dark:text-white",
  disabled = false,
}) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(editValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setValue(editValue);
      setTimeout(() => inputRef.current?.select(), 0);
    }
  }, [editing, editValue]);

  const commit = () => {
    setEditing(false);
    if (value !== editValue) onSave(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") commit();
    if (e.key === "Escape") setEditing(false);
  };

  if (disabled) {
    return (
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">{label}</p>
        <p className={`text-sm font-semibold tabular-nums ${valueClassName}`}>{displayValue}</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">
        {label}
        {!editing && (
          <span className="ml-1 text-slate-300 dark:text-slate-600 text-xs">✎</span>
        )}
      </p>
      {editing ? (
        <div className="flex items-center gap-1">
          {prefix && <span className="text-xs text-slate-400">{prefix}</span>}
          <input
            ref={inputRef}
            type={type}
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(e) => setValue(e.target.value)}
            onBlur={commit}
            onKeyDown={handleKeyDown}
            className="w-20 text-sm font-semibold text-white tabular-nums bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-1.5 py-0.5 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
          />
          {suffix && <span className="text-xs text-slate-400">{suffix}</span>}
        </div>
      ) : (
        <p
          className={`text-sm font-semibold tabular-nums cursor-pointer hover:opacity-70 transition-opacity ${valueClassName}`}
          onDoubleClick={() => setEditing(true)}
          title="Double-click to edit"
        >
          {displayValue}
        </p>
      )}
    </div>
  );
};

export default memo(InlineField);
