import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import {
  BarChart3,
  CalendarClock,
  Files,
  LayoutDashboard,
  LifeBuoy,
  MessageSquare,
  Plus,
  Settings,
  UsersRound,
  Home,
} from "lucide-react";
import Sidebar, { type NavItem } from "../ui/Sidebar";
import TopBar from "../ui/TopBar";
import { userAtom } from "../../stores/auth";

interface AppShellProps {
  children: ReactNode;
}

interface PageMeta {
  title: string;
  subtitle?: string;
}

const ADMIN_NAV_ITEMS: NavItem[] = [
  { isTitle: true, label: "اصلی" },
  { href: "/", label: "خانه", icon: Home },
  { href: "/submitTicket", label: "ثبت تیکت", icon: MessageSquare },
  { href: "/statusTicket", label: "وضعیت تیکت‌ها", icon: CalendarClock },
  { href: "/customers", label: "لیست مشتریان", icon: UsersRound },
  { href: "/customerRegistration", label: "ثبت مشتری", icon: Plus },
  { type: "divider", label: "divider" },
  { isTitle: true, label: "گزارشات" },
  { href: "/report", label: "تحلیل و گزارش", icon: BarChart3 },
  { href: "/submitTypesProblem", label: "دسته بندی مشکلات", icon: Files },
  { type: "divider", label: "divider2" },
  { isTitle: true, label: "پیکربندی" },
  { href: "/admin-settings", label: "تنظیمات", icon: Settings },
];

const USER_NAV_ITEMS: NavItem[] = [
  { isTitle: true, label: "منوی کاربری" },
  { href: "/dashboard", label: "داشبورد من", icon: LayoutDashboard },
  { href: "/new-ticket", label: "ثبت تیکت جدید", icon: Plus },
  { href: "/user-settings", label: "تنظیمات حساب", icon: Settings },
  { type: "divider", label: "divider" },
  { isTitle: true, label: "راهنما" },
  { href: "/help", label: "راهنمای استفاده", icon: LifeBuoy },
];

const AUTH_ROUTES = ["/login", "/signup", "/home"];

const METADATA: Array<{ pattern: RegExp; meta: PageMeta }> = [
  {
    pattern: /^\/$/,
    meta: {
      title: "خانه",
    },
  },
  {
    pattern: /^\/dashboard/,
    meta: {
      title: "داشبورد مدیریتی",
    },
  },
  {
    pattern: /^\/user-dashboard/,
    meta: {
      title: "داشبورد من",
    },
  },
  {
    pattern: /^\/new-ticket/,
    meta: {
      title: "ثبت تیکت جدید",
    },
  },
  {
    pattern: /^\/user\/tickets/,
    meta: {
      title: "جزئیات تیکت",
    },
  },
  {
    pattern: /^\/submitTicket/,
    meta: {
      title: "ثبت تیکت پشتیبانی",
    },
  },
  {
    pattern: /^\/statusTicket/,
    meta: {
      title: "وضعیت تیکت‌ها",
    },
  },
  {
    pattern: /^\/customers/,
    meta: {
      title: "لیست مشتریان",
      subtitle: "مدیریت اطلاعات مشتریان و تیکت‌های آنها",
    },
  },
  {
    pattern: /^\/customerRegistration/,
    meta: {
      title: "ثبت مشتری جدید",
    },
  },
  {
    pattern: /^\/report/,
    meta: {
      title: "گزارش‌های تحلیلی",
    },
  },
  {
    pattern: /^\/user-settings/,
    meta: {
      title: "تنظیمات",
      subtitle: "مدیریت پروفایل، امنیت و تنظیمات حساب کاربری",
    },
  },
  {
    pattern: /^\/admin-settings/,
    meta: {
      title: "تنظیمات مدیر",
      subtitle: "پیکربندی حساب و تیم برای مدیر سیستم",
    },
  },
];

const getPageMeta = (pathname: string): PageMeta => {
  for (const item of METADATA) {
    if (item.pattern.test(pathname)) {
      return item.meta;
    }
  }

  return {
    title: "پشتیبانی حسابان",
    subtitle: "مدیریت یکپارچه درخواست‌ها، مشتریان و تیم‌ها",
  };
};

export default function AppShell({ children }: AppShellProps) {
  const { location } = useRouterState();
  const pathname = location.pathname ?? "/";
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const user = useAtomValue(userAtom);

  const meta = useMemo(() => getPageMeta(pathname), [pathname]);

  const shouldHideShell = AUTH_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // تعیین navigation items بر اساس نقش کاربر
  const navItems = useMemo(() => {
    if (!user) return ADMIN_NAV_ITEMS; // پیش‌فرض admin است
    return user.role === "admin" ? ADMIN_NAV_ITEMS : USER_NAV_ITEMS;
  }, [user]);

  const filteredNavItems = useMemo(
    () =>
      navItems.filter((item) => {
        // Filter component library link - only for admins
        if (item.href === "/component") {
          return false; // Will be implemented later
        }
        return true;
      }),
    [navItems]
  );

  if (shouldHideShell) {
    return <>{children}</>;
  }

  const handleSidebarToggle = () => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 1024px)").matches
    ) {
      setSidebarOpen((prev) => !prev);
    } else {
      setMobileSidebarOpen((prev) => !prev);
    }
  };

  const effectiveSidebarOpen = mobileSidebarOpen || sidebarOpen;

  const handleSidebarState = (open: boolean) => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 1024px)").matches
    ) {
      setSidebarOpen(open);
    } else {
      setMobileSidebarOpen(open);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50/90 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      {mobileSidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
          aria-label="بستن منوی کناری"
        />
      )}
      <div
        className={`fixed inset-y-0 right-0 z-40 transform bg-white/95 shadow-xl backdrop-blur-sm transition-all duration-300 dark:bg-slate-900/95 lg:static lg:z-auto lg:flex lg:w-auto lg:translate-x-0 lg:bg-white/0 lg:shadow-none lg:backdrop-blur-0 dark:lg:bg-transparent ${
          mobileSidebarOpen
            ? "translate-x-0"
            : "translate-x-full lg:translate-x-0"
        }`}
      >
        <Sidebar
          sidebarOpen={effectiveSidebarOpen}
          setSidebarOpen={handleSidebarState}
          filteredNavItems={filteredNavItems}
          currentPath={pathname}
        />
      </div>
      <div className="flex flex-1 flex-col w-full">
        <TopBar
          sidebarOpen={effectiveSidebarOpen}
          onToggleSidebar={handleSidebarToggle}
          pageTitle={meta.title}
          subtitle={meta.subtitle}
        />
        <main className="flex-1 space-y-6 p-4 sm:p-6 lg:px-8 lg:py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
