import React, { useState, useEffect, useRef } from "react";
import moment from "jalali-moment";
import { Calendar, X, ChevronLeft, ChevronRight } from "lucide-react";

moment.locale("fa");

type Props = {
  value?: string | null;
  onChange?: (jDate: string | null) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  format?: string;
  min?: string | null;
  max?: string | null;
  disabled?: boolean;
};

const DEFAULT_FORMAT = "jYYYY/jMM/jDD";

function parseJalali(input?: string | null, format = DEFAULT_FORMAT) {
  if (!input) return null;
  const m = moment(input, format, "fa");
  return m.isValid() ? m : null;
}

function formatJalali(m: moment.Moment | null, format = DEFAULT_FORMAT) {
  if (!m) return null;
  return m.format(format);
}

function generateMonthGrid(yearJ: number, monthJ: number) {
  const ref = moment().jYear(yearJ).jMonth(monthJ).jDate(1);
  const start = ref.clone().startOf("jMonth");
  const end = ref.clone().endOf("jMonth");
  const firstWeekday = start.day();
  const daysInMonth = end.jDate();

  const grid: Array<number | null> = [];
  for (let i = 0; i < firstWeekday; i++) grid.push(null);
  for (let d = 1; d <= daysInMonth; d++) grid.push(d);
  while (grid.length < 42) grid.push(null);
  return grid;
}

export default function JalaliDatePicker({
  value = null,
  onChange,
  placeholder = "تاریخ را انتخاب کنید...",
  className = "",
  inputClassName = "",
  format = DEFAULT_FORMAT,
  min = null,
  max = null,
  disabled = false,
}: Props) {
  const [input, setInput] = useState<string>(value ?? "");
  const [open, setOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState<moment.Moment>(() => {
    const initial = value ? parseJalali(value, format) : moment();
    return initial ?? moment();
  });
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const today = moment();

  // placement: 'bottom' (default) or 'top'
  const [placement, setPlacement] = useState<"bottom" | "top">("bottom");
  // inline style for popup positioning (top / bottom offset in px)
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    setInput(value ?? "");
    if (value) {
      const parsed = parseJalali(value, format);
      if (parsed) setCalendarMonth(parsed);
    }
  }, [value, format]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // compute and set placement & style based on available viewport space
  const computePlacement = () => {
    const root = rootRef.current;
    const popup = popupRef.current;
    if (!root || !popup) return;

    const rect = root.getBoundingClientRect();
    const popupHeight = popup.offsetHeight || 260; // fallback
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    // choose the side with more space if the default side doesn't fit
    let chosen: "bottom" | "top" = "bottom";
    if (spaceBelow < popupHeight && spaceAbove > spaceBelow) chosen = "top";
    else chosen = "bottom";

    setPlacement(chosen);

    // compute offset relative to the root (since root is position:relative)
    const offset = (root.offsetHeight ?? rect.height) + 8; // 8px gap
    if (chosen === "bottom") {
      setPopupStyle({ top: offset, bottom: undefined, right: 0 });
    } else {
      setPopupStyle({ bottom: offset, top: undefined, right: 0 });
    }
  };

  // whenever we open, compute placement
  useEffect(() => {
    if (open) {
      // compute after next paint so popupRef has actual height
      requestAnimationFrame(() => computePlacement());
    }
  }, [open, calendarMonth]);

  // recompute on resize / scroll to remain in viewport
  useEffect(() => {
    const handler = () => {
      if (open) computePlacement();
    };
    window.addEventListener("resize", handler);
    window.addEventListener("scroll", handler, true); // capture scroll in ancestors
    return () => {
      window.removeEventListener("resize", handler);
      window.removeEventListener("scroll", handler, true);
    };
  }, [open]);

  const commitInput = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) {
      setInput("");
      onChange?.(null);
      return;
    }
    const m = parseJalali(trimmed, format);
    if (m) {
      const minDate = min ? parseJalali(min, format) : null;
      const maxDate = max ? parseJalali(max, format) : null;
      if ((minDate && m.isBefore(minDate)) || (maxDate && m.isAfter(maxDate))) return;
      const formatted = formatJalali(m, format)!;
      setInput(formatted);
      onChange?.(formatted);
      setCalendarMonth(m);
    }
  };

  const selectDate = (day: number) => {
    const m = calendarMonth.clone().jDate(day);
    const formatted = formatJalali(m, format)!;
    setInput(formatted);
    onChange?.(formatted);
    setOpen(false);
  };

  const grid = generateMonthGrid(calendarMonth.jYear(), calendarMonth.jMonth());

  return (
    <div ref={rootRef} className={`relative inline-block ${className}`}>
      {/* Input & Buttons */}
      <div className="flex items-center gap-1">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            disabled={disabled}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onBlur={() => commitInput(input)}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className={`w-full border rounded-lg px-3 py-2 pr-9 text-right placeholder-gray-400 shadow-sm 
              focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-gray-100 ${inputClassName}`}
          />
          <div
            className="absolute left-2 top-2.5 w-5 h-5 text-gray-500 cursor-pointer hover:text-indigo-600 transition"
            onClick={() => {
              if (!open) {
                // sync calendar with input when opening
                const p = parseJalali(input, format);
                if (p) setCalendarMonth(p);
              }
              setOpen((o) => !o);
              inputRef.current?.focus();
            }}
            aria-hidden
          >
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        {input && (
          <button
            type="button"
            onClick={() => {
              setInput("");
              onChange?.(null);
            }}
            className="p-2 rounded-md border bg-white hover:bg-gray-50 transition"
            aria-label="پاک کردن"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        )}
      </div>

      {/* Calendar Popup */}
      {open && (
        <div
          ref={popupRef}
          className={`absolute z-50 w-80 bg-blue-100 dark:bg-gray-700 rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 p-2 transition-transform duration-150`}
          style={{
            position: "absolute",
            right: 0,
            // apply computed top/bottom offset
            ...popupStyle,
            transformOrigin: placement === "bottom" ? "top right" : "bottom right",
            // small translate for nicer animation
            transform: "translateY(0)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => setCalendarMonth((c) => c.clone().subtract(1, "jMonth"))}
              className="p-1 rounded-full hover:bg-blue-600 "
              aria-label="ماه قبلی"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="font-semibold text-gray-800 dark:text-amber-50 text-sm">
              {calendarMonth.format("jMMMM jYYYY")}
            </div>

            <button
              type="button"
              onClick={() => setCalendarMonth((c) => c.clone().add(1, "jMonth"))}
              className="p-1 rounded-full hover:bg-blue-600"
              aria-label="ماه بعدی"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 text-center text-xs text-gray-500 dark:text-indigo-300 mb-1">
            {["ش", "ی", "د", "س", "چ", "پ", "ج"].map((w) => (
              <div key={w} className="py-1 font-medium">
                {w}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1 text-sm">
            {grid.map((d, idx) => {
              const dayMoment = d ? calendarMonth.clone().jDate(d) : null;
              const isToday = dayMoment?.isSame(today, "day");
              const isSelected = input === formatJalali(dayMoment, format);
              const isDisabled =
                (min && dayMoment?.isBefore(parseJalali(min, format)!)) ||
                (max && dayMoment?.isAfter(parseJalali(max, format)!));

              return (
                <button
                  type="button"
                  key={idx}
                 
                  onClick={() => d && selectDate(d)}
                  className={`h-7 flex items-center justify-center rounded-full transition
                    ${!d ? "opacity-0 pointer-events-none" : ""}
                    ${isDisabled ? "text-gray-300 cursor-not-allowed" : "dark:hover:bg-blue-500 hover:bg-blue-300"}
                    ${isToday ? "ring-2 ring-indigo-300" : ""}
                    ${isSelected ? "bg-indigo-500 text-white hover:bg-indigo-600" : ""}
                  `}
                  aria-label={d ? `روز ${d}` : undefined}
                >
                  {d}
                </button>
              );
            })}
          </div>

          {/* Today Button */}
          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={() => {
                const m = today.clone();
                const formatted = formatJalali(m, format)!;
                setInput(formatted);
                onChange?.(formatted);
                setCalendarMonth(m);
                setOpen(false);
              }}
              className="text-xs text-indigo-600 dark:text-blue-500 font-bold hover:underline"
            >
              امروز
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
