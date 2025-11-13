import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import {
	AlertTriangle,
	CheckCircle2,
	Clock,
	Clock3,
	MessageSquare,
	Plus,
	Search,
} from "lucide-react";
import { useAtomValue } from "jotai";
import { userAtom } from "../stores/auth";
import { requireAuth } from "../lib/auth-guard";
import { ticketsApi, type Ticket } from "../services/api/tickets";
import { toast } from "react-toastify";

type TicketStatus = "در انتظار" | "در حال پیگیری" | "پاسخ داده شده" | "بسته شده";
type TicketPriority = "کم" | "متوسط" | "زیاد" | "بحرانی";

const PAGE_SIZE = 10;

const STATUS_STYLES: Record<TicketStatus, string> = {
	"در انتظار": "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200",
	"در حال پیگیری": "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200",
	"پاسخ داده شده": "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200",
	"بسته شده": "bg-slate-200 text-slate-700 dark:bg-slate-700/60 dark:text-slate-100",
};

const PRIORITY_STYLES: Record<TicketPriority, string> = {
	کم: "text-slate-500",
	متوسط: "text-sky-500",
	زیاد: "text-amber-500",
	بحرانی: "text-rose-500",
};

interface StatsData {
	openTickets: number;
	criticalTickets: number;
	pendingTickets: number;
	closedTickets: number;
}

export const Route = createFileRoute("/dashboard")({
	component: DashboardPage,
	beforeLoad: () => {
		requireAuth();
	},
});

function DashboardPage() {
	const user = useAtomValue(userAtom);
	const isAdmin = user?.role === "admin" || user?.role === "support";

	const [searchQuery, setSearchQuery] = useState("");
	const [page, setPage] = useState(1);
	const [tickets, setTickets] = useState<Ticket[]>([]);
	const [totalPages, setTotalPages] = useState(1);
	const [isLoading, setIsLoading] = useState(true);
	const [stats, setStats] = useState<StatsData>({
		openTickets: 0,
		criticalTickets: 0,
		pendingTickets: 0,
		closedTickets: 0,
	});

	// Fetch tickets
	useEffect(() => {
		const fetchTickets = async () => {
			try {
				setIsLoading(true);
				const response = await ticketsApi.getTickets({
					page: isAdmin ? page : undefined,
					limit: isAdmin ? PAGE_SIZE : undefined,
					sortBy: 'updated_at',
					sortOrder: 'desc',
				});

				setTickets(response.data);
				if (isAdmin && response.pagination) {
					setTotalPages(response.pagination.totalPages);
				}
			} catch (error) {
				console.error('Error fetching tickets:', error);
				toast.error('خطا در دریافت تیکت‌ها');
			} finally {
				setIsLoading(false);
			}
		};

		fetchTickets();
	}, [page, isAdmin]);

	// Fetch stats
	useEffect(() => {
		const fetchStats = async () => {
			try {
				const response = await ticketsApi.getStats();
				const statsData = response.data;

				setStats({
					openTickets: statsData.by_status.pending + statsData.by_status.in_progress + statsData.by_status.answered,
					criticalTickets: statsData.by_priority.critical,
					pendingTickets: statsData.by_status.pending,
					closedTickets: statsData.by_status.closed,
				});
			} catch (error) {
				console.error('Error fetching stats:', error);
			}
		};

		fetchStats();
	}, []);

	const filteredTickets = useMemo(() => {
		if (!searchQuery.trim()) return tickets;
		const query = searchQuery.toLowerCase();
		return tickets.filter(
			(ticket) =>
				ticket.subject.toLowerCase().includes(query) ||
				ticket.id.toString().includes(query),
		);
	}, [searchQuery, tickets]);

	const handleChangePage = (nextPage: number) => {
		if (nextPage < 1 || nextPage > totalPages) return;
		setPage(nextPage);
	};

	const STATS = [
		{
			title: "تیکت‌های باز",
			value: stats.openTickets.toString(),
			diff: isAdmin ? "تیکت‌های فعال" : "",
			icon: MessageSquare,
			variant: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-200 dark:bg-indigo-500/20",
		},
		{
			title: "در انتظار",
			value: stats.pendingTickets.toString(),
			diff: isAdmin ? "نیاز به رسیدگی" : "در انتظار پاسخ",
			icon: isAdmin ? Clock3 : Clock,
			variant: "bg-amber-500/10 text-amber-600 dark:text-amber-200 dark:bg-amber-500/20",
		},
		{
			title: isAdmin ? "درخواست‌های بحرانی" : "بحرانی",
			value: stats.criticalTickets.toString(),
			diff: isAdmin ? "فوری و مهم" : "",
			icon: AlertTriangle,
			variant: "bg-rose-500/10 text-rose-600 dark:text-rose-200 dark:bg-rose-500/20",
		},
		{
			title: "بسته شده",
			value: stats.closedTickets.toString(),
			diff: isAdmin ? "تکمیل شده" : "",
			icon: CheckCircle2,
			variant: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-200 dark:bg-emerald-500/20",
		},
	];

	return (
		<div className="space-y-6">
			{/* Header Section */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold text-slate-900 dark:text-white">
						{isAdmin ? "داشبورد مدیریت" : "داشبورد من"}
					</h1>
					<p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
						{isAdmin
							? "مرور سریع وضعیت تیکت‌ها و عملکرد تیم‌ها"
							: "مدیریت و پیگیری تیکت‌های پشتیبانی خود"
						}
					</p>
				</div>
				{!isAdmin && (
					<Link
						to="/new-ticket"
						className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700 hover:shadow-lg dark:bg-indigo-500 dark:hover:bg-indigo-600"
					>
						<Plus className="h-5 w-5" />
						تیکت جدید
					</Link>
				)}
			</div>

			{/* Stats Cards */}
			<section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{STATS.map((stat) => {
					const Icon = stat.icon;
					return (
						<div
							key={stat.title}
							className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800/60 dark:bg-slate-900/70"
						>
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-slate-500 dark:text-slate-300">{stat.title}</p>
									<h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{stat.value}</h3>
									{stat.diff && <p className="mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">{stat.diff}</p>}
								</div>
								<div className={`flex h-12 w-12 items-center justify-center rounded-full ${stat.variant}`}>
									<Icon className="h-6 w-6" />
								</div>
							</div>
							<div className="absolute -bottom-16 inset-x-4 h-24 rounded-full bg-gradient-to-br from-indigo-100 via-purple-100 to-transparent opacity-70 blur-3xl dark:from-indigo-500/30 dark:via-purple-500/20" />
						</div>
					);
				})}
			</section>

			{/* Tickets Section */}
			<section className="space-y-4 rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h2 className="text-lg font-semibold text-slate-900 dark:text-white">
							{isAdmin ? "داشبورد درخواست‌ها" : "تیکت‌های من"}
						</h2>
						<p className="text-sm text-slate-500 dark:text-slate-300">
							{filteredTickets.length} تیکت
						</p>
					</div>
					<div className="relative w-full sm:w-auto">
						<Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
						<input
							type="search"
							placeholder="جستجو در تیکت‌ها..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-10 pl-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:bg-slate-900 sm:w-80"
						/>
					</div>
				</div>

				<div className="overflow-x-auto">
					{isLoading ? (
						<div className="flex items-center justify-center py-12">
							<div className="text-center">
								<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
								<p className="mt-3 text-sm text-slate-500 dark:text-slate-300">در حال بارگذاری...</p>
							</div>
						</div>
					) : filteredTickets.length === 0 ? (
						<div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 py-12 text-center dark:border-slate-700 dark:bg-slate-800/50">
							<MessageSquare className="mx-auto h-12 w-12 text-slate-400" />
							<h3 className="mt-3 text-sm font-medium text-slate-900 dark:text-white">
								تیکتی یافت نشد
							</h3>
							<p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
								{searchQuery
									? "جستجوی دیگری امتحان کنید"
									: "شما هنوز تیکتی ثبت نکرده‌اید"}
							</p>
							{!searchQuery && !isAdmin && (
								<Link
									to="/new-ticket"
									className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
								>
									<Plus className="h-4 w-4" />
									ثبت تیکت جدید
								</Link>
							)}
						</div>
					) : isAdmin ? (
						// Admin table view
						<>
							<table className="min-w-full table-fixed border-separate border-spacing-y-3 text-sm">
								<thead>
									<tr className="text-right text-xs font-semibold text-slate-500 dark:text-slate-300">
										<th className="rounded-r-xl bg-slate-100/70 px-3 py-2 dark:bg-slate-800/70">تیکت</th>
										<th className="bg-slate-100/70 px-3 py-2 dark:bg-slate-800/70">مشتری</th>
										<th className="bg-slate-100/70 px-3 py-2 dark:bg-slate-800/70">اولویت</th>
										<th className="bg-slate-100/70 px-3 py-2 dark:bg-slate-800/70">وضعیت</th>
										<th className="hidden bg-slate-100/70 px-3 py-2 md:table-cell dark:bg-slate-800/70">مسئول</th>
										<th className="hidden bg-slate-100/70 px-3 py-2 lg:table-cell dark:bg-slate-800/70">کانال</th>
										<th className="rounded-l-xl bg-slate-100/70 px-3 py-2 dark:bg-slate-800/70">به‌روزرسانی</th>
									</tr>
								</thead>
								<tbody>
									{filteredTickets.map((ticket) => (
										<tr
											key={ticket.id}
											className="cursor-pointer rounded-2xl bg-white/80 text-slate-700 transition hover:-translate-y-0.5 hover:bg-indigo-50 hover:text-indigo-700 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:bg-slate-800/70 dark:hover:text-white"
										>
											<td className="rounded-r-2xl px-3 py-4">
												<div className="space-y-1">
													<p className="font-semibold">#{ticket.id}</p>
													<p className="text-xs text-slate-500 dark:text-slate-300">{ticket.subject}</p>
												</div>
											</td>
											<td className="px-3 py-4">
												<div className="space-y-1">
													<p className="font-medium">{ticket.customer || 'نامشخص'}</p>
													<p className="text-xs text-slate-400 dark:text-slate-300">ایجاد {new Date(ticket.created_at).toLocaleDateString('fa-IR')}</p>
												</div>
											</td>
											<td className={`px-3 py-4 text-sm font-bold ${PRIORITY_STYLES[ticket.priority]}`}>{ticket.priority}</td>
											<td className="px-3 py-4">
												<span className={`inline-flex items-center gap-1 rounded-xl px-3 py-1 text-xs font-semibold ${STATUS_STYLES[ticket.status]}`}>
													{ticket.status}
												</span>
											</td>
											<td className="hidden px-3 py-4 md:table-cell">
												<p className="text-sm font-medium">{ticket.assigned_to_name || 'تخصیص نیافته'}</p>
												<p className="text-xs text-slate-400 dark:text-slate-300">واحد پشتیبانی</p>
											</td>
											<td className="hidden px-3 py-4 text-xs font-medium text-slate-500 lg:table-cell dark:text-slate-300">
												{ticket.channel}
											</td>
											<td className="rounded-l-2xl px-3 py-4 text-xs font-medium text-slate-500 dark:text-slate-300">
												{new Date(ticket.updated_at).toLocaleDateString('fa-IR')}
											</td>
										</tr>
									))}
								</tbody>
							</table>
							{totalPages > 1 && (
								<Pagination page={page} pageCount={totalPages} onChange={handleChangePage} />
							)}
						</>
					) : (
						// User card view
						<div className="space-y-3">
							{filteredTickets.map((ticket) => (
								<Link
									key={ticket.id}
									to="/tickets/$ticketId"
									params={{ ticketId: ticket.id.toString() }}
									className="block rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-800/60 dark:bg-slate-900/80"
								>
									<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
										<div className="flex-1 space-y-2">
											<div className="flex items-center gap-3">
												<span className="text-sm font-bold text-slate-400 dark:text-slate-500">
													#{ticket.id}
												</span>
												<h3 className="text-base font-semibold text-slate-900 dark:text-white">
													{ticket.subject}
												</h3>
												{ticket.unread_count && ticket.unread_count > 0 && (
													<span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white">
														{ticket.unread_count}
													</span>
												)}
											</div>
											<p className="text-sm text-slate-500 dark:text-slate-300">
												{ticket.last_message || ticket.description || 'بدون پیام'}
											</p>
											<div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
												<span>ایجاد: {new Date(ticket.created_at).toLocaleDateString('fa-IR')}</span>
												<span>•</span>
												<span>آخرین به‌روزرسانی: {new Date(ticket.updated_at).toLocaleDateString('fa-IR')}</span>
											</div>
										</div>
										<div className="flex items-center gap-3">
											<span className={`text-sm font-bold ${PRIORITY_STYLES[ticket.priority]}`}>
												{ticket.priority}
											</span>
											<span className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold ${STATUS_STYLES[ticket.status]}`}>
												{ticket.status}
											</span>
										</div>
									</div>
								</Link>
							))}
						</div>
					)}
				</div>
			</section>
		</div>
	);
}

interface PaginationProps {
	page: number;
	pageCount: number;
	onChange: (page: number) => void;
}

function Pagination({ page, pageCount, onChange }: PaginationProps) {
	const pages = useMemo(() => {
		return Array.from({ length: pageCount }, (_, index) => index + 1);
	}, [pageCount]);

	return (
		<div className="flex flex-col gap-3 border-t border-slate-200/70 pt-4 dark:border-slate-800/60 sm:flex-row sm:items-center sm:justify-between">
			<span className="text-xs font-medium text-slate-500 dark:text-slate-300">
				صفحه {page} از {pageCount}
			</span>
			<div className="flex items-center gap-2">
				<button
					onClick={() => onChange(page - 1)}
					disabled={page === 1}
					className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
				>
					قبلی
				</button>
				<div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100/70 p-1 dark:border-slate-700 dark:bg-slate-800/60">
					{pages.map((pageNumber) => (
						<button
							key={pageNumber}
							onClick={() => onChange(pageNumber)}
							className={`min-w-[38px] rounded-lg px-2 py-1 text-xs font-semibold transition ${
								pageNumber === page
									? "bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-300"
									: "text-slate-600 hover:bg-white/70 dark:text-slate-300 dark:hover:bg-slate-900/60"
							}`}
						>
							{pageNumber}
						</button>
					))}
				</div>
				<button
					onClick={() => onChange(page + 1)}
					disabled={page === pageCount}
					className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
				>
					بعدی
				</button>
			</div>
		</div>
	);
}
