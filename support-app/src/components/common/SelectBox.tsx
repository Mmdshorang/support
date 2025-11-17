import React, { useState, useRef, useEffect, type KeyboardEvent } from "react";

export type Option = { value: string; label: string };

type SimpleSelectProps = {
  options?: Option[];
  value?: Option | Option[] | null;
  onChange?: (v: Option | Option[] | null) => void;
  placeholder?: string;
  searchable?: boolean;
  multiple?: boolean;
  creatable?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
};

export default function SimpleSelect({
  options = [],
  value = null,
  onChange = () => {},
  placeholder = "انتخاب کنید",
  searchable = true,
  multiple = false,
  creatable = false,
  disabled = false,
  className = "",
  id,
}: SimpleSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<Option[]>(options);
  const [highlighted, setHighlighted] = useState(0);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => setItems(options), [options]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  const normalizedValue = Array.isArray(value) ? value : value ? [value] : [];

  const filtered = query
    ? items.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : items;

  function selectItem(item: Option) {
    if (disabled) return;
    if (multiple) {
      const exists = normalizedValue.find((v) => v.value === item.value);
      const newVal = exists
        ? normalizedValue.filter((v) => v.value !== item.value)
        : [...normalizedValue, item];
      onChange(newVal.length ? newVal : null);
    } else {
      onChange(item);
      setOpen(false);
    }
    setQuery("");
  }

  function handleCreate() {
    if (!creatable || !query.trim()) return;
    const newOption = { value: query.trim(), label: query.trim() };
    setItems((s) => [newOption, ...s]);
    selectItem(newOption);
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const item = filtered[highlighted];
      if (item) selectItem(item);
      else if (creatable) handleCreate();
      return;
    }
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (e.key === "Backspace" && multiple && !query && normalizedValue.length) {
      const newVal = normalizedValue.slice(0, -1);
      onChange(newVal.length ? newVal : null);
    }
  }

  function removeTag(v: Option) {
    if (disabled || !multiple) return;
    const newVal = normalizedValue.filter((x) => x.value !== v.value);
    onChange(newVal.length ? newVal : null);
  }

  return (
    <div
      ref={rootRef}
      className={`relative inline-block text-sm ${className}`}
      id={id}
    >
      <button
        type="button"
        onClick={() => !disabled && setOpen((s) => !s)}
        className={`w-full min-w-[260px] flex items-center justify-between p-2.5 rounded-xl dark:bg-gray-800 bg-gray-100  text-black dark:text-white transition-all
       
        `}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <div className="flex-1 flex flex-wrap gap-1 items-center">
          {normalizedValue.length ? (
            normalizedValue.map((v) => (
              <span
                key={v.value}
                className="flex items-center gap-1 dark:text-white text-black px-2 py-0.5"
              >
                <span className="truncate max-w-[120px] font-bold">
                  {v.label}
                </span>
                {multiple && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTag(v);
                    }}
                    aria-label={`remove ${v.label}`}
                    className="text-gray-500 hover:text-red-500 transition text-xs"
                  >
                    ✕
                  </button>
                )}
              </span>
            ))
          ) : (
            <span className="text-gray-400 truncate">{placeholder}</span>
          )}
        </div>

        <div className="ml-2 text-gray-500 text-xs">{open ? "▲" : "▼"}</div>
      </button>

      <div
        className={`absolute z-50 mt-1 w-full rounded-md shadow-md bg-gray-100 dark:bg-gray-800 border transition-all ${
          open
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        {searchable && (
          <div className="p-2 border-b">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setHighlighted(0);
              }}
              onKeyDown={onKeyDown}
              className="w-full p-2 rounded-md border text-sm focus:outline-none focus:border-gray-400 "
              placeholder="جستجو..."
              autoFocus
            />
          </div>
        )}

        <ul role="listbox" className="max-h-48 overflow-auto p-1 space-y-1">
          {filtered.length === 0 ? (
            <li className="p-3 text-sm dark:text-gray-200 text-center">
              هیچ موردی یافت نشد
            </li>
          ) : (
            filtered.map((o, i) => {
              const isSelected = !!normalizedValue.find(
                (v) => v.value === o.value
              );
              const isHighlighted = i === highlighted;
              return (
                <li
                  key={o.value}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setHighlighted(i)}
                  onClick={() => selectItem(o)}
                  className={`cursor-pointer select-none p-2 rounded-md flex items-center justify-between transition-all 
                  ${isHighlighted ? "bg-blue-500 dark:text-black" : "text-black dark:text-white"}
                  ${isSelected ? "text-black font-medium" : "dark:text-gray-100 text-gray-800"}
                `}
                >
                  <span className="truncate">{o.label}</span>
                  {isSelected && (
                    <span className="text-sm font-bold text-gray-600 dark:text-blue-500">
                      ✓
                    </span>
                  )}
                </li>
              );
            })
          )}
        </ul>

        {/* {creatable &&
          query.trim() &&
          !items.find((it) => it.label === query.trim()) && (
            <div className="p-2 border-t bg-gray-50">
              <button
                onClick={() => handleCreate()}
                className="w-full p-2 rounded-md border bg-white hover:bg-gray-100 transition text-sm"
              >
                ایجاد "{query.trim()}"
              </button>
            </div>
          )} */}
      </div>
    </div>
  );
}
