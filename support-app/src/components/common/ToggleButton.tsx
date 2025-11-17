import  { useState, useEffect } from "react";

type ToggleButtonProps = {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  size?: "sm" | "md" | "lg";
  label?: string;
  ariaLabel?: string;
  showText?: boolean;
};

const SIZES: Record<
  NonNullable<ToggleButtonProps["size"]>,
  { track: string; knob: string; text: string }
> = {
  sm: { track: "w-10 h-6", knob: "w-4 h-4", text: "text-xs" },
  md: { track: "w-14 h-8", knob: "w-6 h-6", text: "text-sm" },
  lg: { track: "w-16 h-9", knob: "w-7 h-7", text: "text-base" },
};

export default function ToggleButton({
  checked: controlledChecked,
  defaultChecked = false,
  onChange,
  size = "md",
  label,
  ariaLabel,
  showText = false,
}: ToggleButtonProps) {
  const isControlled = controlledChecked !== undefined;
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const checked = isControlled ? controlledChecked! : internalChecked;

  useEffect(() => {
    if (isControlled) return;
  }, []);

  function toggle() {
    const next = !checked;
    if (!isControlled) setInternalChecked(next);
    onChange?.(next);
  }

  const sz = SIZES[size];

  return (
    <div className="inline-flex items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel ?? label ?? (checked ? "باز" : "بسته")}
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle();
          }
        }}
        className={`relative inline-flex items-center ${sz.track} rounded-full p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500`}
      >
        <span
          aria-hidden
          className={`absolute inset-0 rounded-full transition-colors duration-150 ${
            checked ? "bg-indigo-600" : "bg-gray-300 dark:bg-gray-600"
          }`}
        />

        <span
          aria-hidden
          className={`relative inline-block ${
            sz.knob
          } rounded-full bg-white shadow transform transition-transform duration-150 ${
            checked ? "translate-x-[calc(100%_+_4px)]" : "translate-x-0"
          }`}
          style={{
            marginLeft: checked ? 0 : 0,
          }}
        />

        {showText && (
          <span
            className={`pointer-events-none absolute left-0 right-0 text-center ${sz.text} font-medium select-none`}
          >
            {checked ? "باز" : "بسته"}
          </span>
        )}
      </button>

      {label && (
        <button
          type="button"
          onClick={toggle}
          className="-ml-1 text-sm font-medium select-none"
        >
          {label}
        </button>
      )}
    </div>
  );
}
