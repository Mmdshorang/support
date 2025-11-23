import { UserCircle2 } from "lucide-react";
import { useAtomValue } from "jotai";
import { userAtom } from "../../stores/auth";

interface TopBarProps {
  pageTitle: string;
  subtitle?: string;
}

export default function TopBar({
  pageTitle,
  subtitle,
}: TopBarProps) {
  const user = useAtomValue(userAtom);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/70 backdrop-blur-xl shadow-sm dark:border-slate-800/70 dark:bg-slate-900/80">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {/* <button
            type="button"
            onClick={onToggleSidebar}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            aria-label={sidebarOpen ? "بستن منو" : "باز کردن منو"}
          >
            <Menu className="h-5 w-5" />
          </button> */}
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              {pageTitle}
            </h1>
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end gap-4">
          <div className="flex items-center gap-2 rounded-xl border border-transparent bg-slate-100/70 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-white hover:text-indigo-600 dark:bg-slate-800/70 dark:text-slate-100 dark:hover:border-indigo-500/40 dark:hover:bg-slate-800">
            <UserCircle2 className="h-6 w-6 text-indigo-500" />
            <span className="hidden sm:block">{user?.name || "کاربر"}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
