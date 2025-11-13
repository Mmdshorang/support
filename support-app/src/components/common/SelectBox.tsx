import React, { useState, useRef, useEffect, type KeyboardEvent } from 'react';

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
  placeholder = 'انتخاب کنید',
  searchable = true,
  multiple = false,
  creatable = false,
  disabled = false,
  className = '',
  id,
}: SimpleSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
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
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
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
        ? (normalizedValue.filter((v) => v.value !== item.value) as Option[])
        : ([...normalizedValue, item] as Option[]);
      onChange(newVal.length ? newVal : null);
    } else {
      onChange(item);
      setOpen(false);
    }
    setQuery('');
  }

  function handleCreate() {
    if (!creatable || !query.trim()) return;
    const newOption = { value: query.trim(), label: query.trim() };
    setItems((s) => [newOption, ...s]);
    selectItem(newOption);
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      const item = filtered[highlighted];
      if (item) selectItem(item);
      else if (creatable) handleCreate();
      return;
    }
    if (e.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (e.key === 'Backspace' && multiple && !query && normalizedValue.length) {
      // remove last
      const newVal = normalizedValue.slice(0, normalizedValue.length - 1);
      onChange(newVal.length ? newVal : null);
    }
  }

  function removeTag(v: Option) {
    if (disabled) return;
    if (!multiple) return;
    const newVal = normalizedValue.filter((x) => x.value !== v.value);
    onChange(newVal.length ? newVal : null);
  }

  return (
    <div ref={rootRef} className={`relative inline-block text-sm ${className}`} id={id}>
      <button
        type="button"
        onClick={() => !disabled && setOpen((s) => !s)}
        className={`w-full min-w-[300px] flex items-center gap-2 p-2 rounded-md border ${
          disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray'
        }`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <div className="flex-1 flex flex-wrap gap-1 items-center">
          {normalizedValue.length ? (
            normalizedValue.map((v) => (
              <span
                key={v.value}
                className="flex items-center gap-1 text-xs px-2 py-1"
              >
                <span className="truncate max-w-[120px]">{v.label}</span>
                {multiple && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTag(v);
                    }}
                    aria-label={`remove ${v.label}`}
                    className="text-xs"
                  >
                    ✕
                  </button>
                )}
              </span>
            ))
          ) : (
            <span className="text-gray-500 truncate">{placeholder}</span>
          )}
        </div>

        <div className="ml-2">{open ? '▲' : '▼'}</div>
      </button>

      <div
        className={`absolute z-50 mt-1 w-full rounded-md shadow-lg bg-gray border ${
          open ? 'block' : 'hidden'
        }`}
      >
        {searchable && (
          <div className="p-2">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setHighlighted(0);
              }}
              onKeyDown={onKeyDown}
              className="w-full p-2 rounded-md border focus:outline-none"
              placeholder="جستجو..."
              autoFocus
            />
          </div>
        )}

        <ul
          role="listbox"
          aria-label="select-options"
          className="max-h-44 overflow-auto p-1 space-y-1"
        >
          {filtered.length === 0 ? (
            <li className="p-2 text-sm text-gray-500">هیچ موردی یافت نشد</li>
          ) : (
            filtered.map((o, i) => {
              const isSelected = !!normalizedValue.find((v) => v.value === o.value);
              const isHighlighted = i === highlighted;
              return (
                <li
                  key={o.value}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setHighlighted(i)}
                  onClick={() => selectItem(o)}
                  className={`cursor-pointer select-none p-2 rounded-md flex items-center justify-between hover:bg-gray-500 ${
                    isHighlighted ? 'bg-gray-600' : ''
                  }`}
                >
                  <span className={`truncate ${isSelected ? 'font-semibold' : ''}`}>{o.label}</span>
                  {isSelected && <span className="text-xs">✓</span>}
                </li>
              );
            })
          )}
        </ul>

        {creatable && query.trim() && !items.find((it) => it.label === query.trim()) && (
          <div className="p-2 border-t">
            <button
              onClick={() => handleCreate()}
              className="w-full p-2 rounded-md border"
            >
              ایجاد "{query.trim()}"
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
