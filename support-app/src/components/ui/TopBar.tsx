import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, Menu, Search, UserCircle2 } from "lucide-react";
import { useAtomValue } from "jotai";
import { userAtom } from "../../stores/auth";

interface QuickLink {
  label: string;
  href: string;
}

interface TopBarProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  pageTitle: string;
  subtitle?: string;
  quickLinks?: QuickLink[];
}

// const DEFAULT_QUICK_LINKS: QuickLink[] = [
//   { label: "ثبت تیکت جدید", href: "/submitTicket" },
//   { label: "گزارش گیری", href: "/report" },
// ];

export default function TopBar({
  sidebarOpen,
  onToggleSidebar,
  pageTitle,
  subtitle,
  quickLinks,
}: TopBarProps) {
  //const links = useMemo(() => quickLinks ?? DEFAULT_QUICK_LINKS, [quickLinks]);
  const user = useAtomValue(userAtom);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/70 backdrop-blur-xl shadow-sm dark:border-slate-800/70 dark:bg-slate-900/80">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
         
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              پشتیبانی حسابان
            </h1>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end gap-4">
          <button
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            aria-label="اعلان‌ها"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 left-1 inline-flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500" />
            </span>
          </button>

          <div className="flex items-center gap-2 rounded-xl border border-transparent bg-slate-100/70 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-white hover:text-indigo-600 dark:bg-slate-800/70 dark:text-slate-100 dark:hover:border-indigo-500/40 dark:hover:bg-slate-800">
            <UserCircle2 className="h-6 w-6 text-indigo-500" />
            <span className="hidden sm:block">{user?.name || "کاربر"}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
