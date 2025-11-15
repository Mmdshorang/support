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

const DEFAULT_QUICK_LINKS: QuickLink[] = [
	{ label: "ثبت تیکت جدید", href: "/submitTicket" },
	{ label: "گزارش گیری", href: "/report" },
];

export default function TopBar({
	sidebarOpen,
	onToggleSidebar,
	pageTitle,
	subtitle,
	quickLinks,
}: TopBarProps) {
	const links = useMemo(() => quickLinks ?? DEFAULT_QUICK_LINKS, [quickLinks]);
	const user = useAtomValue(userAtom);

	return (
		<header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/70 backdrop-blur-xl shadow-sm dark:border-slate-800/70 dark:bg-slate-900/80">
			<div className="flex items-center justify-between px-4 py-3">
				<div className="flex items-center gap-3">
					<button
						onClick={onToggleSidebar}
						className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:focus:ring-indigo-500"
						aria-label={sidebarOpen ? "بستن منوی کناری" : "باز کردن منوی کناری"}
					>
						<Menu className="h-5 w-5" />
					</button>
					<div>
						<h1 className="text-lg font-bold text-slate-900 dark:text-white">{pageTitle}</h1>
						{subtitle && <p className="text-sm text-slate-500 dark:text-slate-300">{subtitle}</p>}
					</div>
				</div>

				<div className="flex flex-1 items-center justify-end gap-4">
					<div className="relative hidden w-full max-w-md lg:block">
						<Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
						<input
							type="search"
							placeholder="جستجو در درخواست‌ها، کاربران یا اسناد..."
							className="w-full rounded-xl border border-transparent bg-slate-100/80 py-2 pr-10 pl-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:bg-slate-800/80 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:bg-slate-900"
						/>
					</div>

					<nav className="hidden items-center gap-2 xl:flex">
						{links.map((link) => (
							<Link
								key={link.href}
								to={link.href}
								className="rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-600 transition hover:bg-indigo-100 hover:text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/20 dark:text-indigo-100 dark:hover:bg-indigo-500/40"
							>
								{link.label}
							</Link>
						))}
					</nav>

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

					<Link
						to="/settings"
						className="flex items-center gap-2 rounded-xl border border-transparent bg-slate-100/70 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-white hover:text-indigo-600 dark:bg-slate-800/70 dark:text-slate-100 dark:hover:border-indigo-500/40 dark:hover:bg-slate-800"
					>
						<UserCircle2 className="h-6 w-6 text-indigo-500" />
						<span className="hidden sm:block">{user?.name || "کاربر"}</span>
					</Link>
				</div>
			</div>
			<div className="px-4 pb-3 lg:hidden">
				<div className="relative">
					<Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
					<input
						type="search"
						placeholder="جستجو..."
						className="w-full rounded-xl border border-transparent bg-slate-100/80 py-2 pr-10 pl-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:bg-slate-800/80 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:bg-slate-900"
					/>
				</div>
			</div>
		</header>
	);
}

