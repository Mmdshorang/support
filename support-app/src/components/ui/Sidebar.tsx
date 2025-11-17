import type { ElementType } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, LogOut, Menu } from "lucide-react";
import ThemeSwitcher from "./ThemeSwitcher";

export interface NavItem {
  href?: string;
  label: string;
  icon?: ElementType;
  type?: "divider";
  isTitle?: boolean;
}

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  filteredNavItems: NavItem[];
  currentPath: string;
}

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  filteredNavItems,
  currentPath,
}: SidebarProps) {
  const isActive = (href?: string) => {
    if (!href) return false;
    if (href === "/") {
      return currentPath === "/";
    }
    return currentPath.startsWith(href);
  };

  return (
    <aside
      className={`bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm transition-all duration-300 ease-in-out border-l border-slate-200/60 dark:border-slate-700/60 ${
        sidebarOpen ? "w-64" : "w-20"
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 h-16 border-b border-gray-200/70 dark:border-slate-700/70">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex rounded-lg p-2 hover:bg-gray-200 transition-colors dark:hover:bg-slate-700"
              aria-label={
                sidebarOpen ? "بستن منوی کناری" : "باز کردن منوی کناری"
              }
            >
              <Menu className="h-6 w-6" />
            </button>
          )}
          <span
            className={`font-bold text-xl text-indigo-600 dark:text-indigo-400 transition-opacity duration-200 ${
              !sidebarOpen ? "opacity-0" : "opacity-100"
            }`}
          >
            پشتیبانی
          </span>
          <div className="flex items-center gap-x-2">
            <ThemeSwitcher />
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex rounded-lg p-2 hover:bg-gray-200 transition-colors dark:hover:bg-slate-700"
              aria-label={sidebarOpen ? "بستن منو" : "باز کردن منو"}
            >
              {sidebarOpen && <ChevronLeft /> }
            </button>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
          {filteredNavItems.map((item, index) => {
            if (item.type === "divider") {
              return (
                <hr
                  key={index}
                  className="my-3 border-gray-200 dark:border-slate-700"
                />
              );
            }

            if (item.isTitle) {
              return (
                <h3
                  key={index}
                  className={`px-3 pt-3 pb-1 text-[11px] tracking-wide font-bold text-gray-500 uppercase ${
                    !sidebarOpen ? "hidden" : ""
                  }`}
                >
                  {item.label}
                </h3>
              );
            }

            if (item.href && item.icon) {
              const IconComponent = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                    active
                      ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/30"
                      : "text-gray-600 dark:text-gray-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-slate-700/70 dark:hover:text-white"
                  }`}
                >
                  <IconComponent
                    className={`h-5 w-5 transition-transform duration-200 ${
                      active ? "scale-110" : "group-hover:scale-105"
                    }`}
                  />
                  {sidebarOpen && (
                    <span className="truncate">{item.label}</span>
                  )}
                </Link>
              );
            }

            return null;
          })}
        </nav>

        <div className="p-4 border-t border-gray-200/70 dark:border-slate-700/70">
          <Link
            to="/logout"
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/40 dark:hover:text-red-100 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className={!sidebarOpen ? "hidden" : "truncate"}>خروج</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
