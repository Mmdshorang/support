import { createFileRoute, Link } from "@tanstack/react-router"

import { useMemo, useState, useEffect } from "react";
import {
	AlertTriangle,
	CheckCircle2,
	Clock,
	MessageSquare,
	Plus,
	Search,
} from "lucide-react";
import { requireUser } from "../../lib/auth-guard";
import { ticketsApi, type Ticket } from "../../services/api/tickets";
import { toast } from "react-toastify";

type TicketStatus = "در انتظار" | "در حال پیگیری" | "پاسخ داده شده" | "بسته شده";
type TicketPriority = "کم" | "متوسط" | "زیاد" | "بحرانی";

const STATUS_STYLES: Record<TicketStatus, string> = {
	"در انتظار": "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200",
	"در حال پیگیری": "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200",
	"پاسخ داده شده":
		"bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200",
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
	pendingTickets: number;
	answeredTickets: number;
	criticalTickets: number;
}

export const Route = createFileRoute("/_user/user-dashboard")({
	component: UserDashboardPage,
	beforeLoad: () => {
		requireUser();
	},
});

function UserDashboardPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [tickets, setTickets] = useState<Ticket[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [stats, setStats] = useState<StatsData>({
		openTickets: 0,
		pendingTickets: 0,
		answeredTickets: 0,
		criticalTickets: 0,
	});

	// Fetch user tickets
	useEffect(() => {
		const fetchTickets = async () => {
			try {
				setIsLoading(true);
				const response = await ticketsApi.getTickets({
					sortBy: 'updated_at',
					sortOrder: 'desc',
				})

				setTickets(response.data);
			} catch (error) {
				console.error('Error fetching tickets:', error);
				toast.error('خطا در دریافت تیکت‌ها');
			} finally {
				setIsLoading(false);
			}
		}

		fetchTickets();
	}, []);

	// Fetch stats
	useEffect(() => {
		const fetchStats = async () => {
			try {
				const response = await ticketsApi.getStats();
				const statsData = response.data;

				setStats({
					openTickets: statsData.by_status.pending + statsData.by_status.in_progress + statsData.by_status.answered,
					pendingTickets: statsData.by_status.pending,
					answeredTickets: statsData.by_status.answered,
					criticalTickets: statsData.by_priority.critical,
				})
			} catch (error) {
				console.error('Error fetching stats:', error);
			}
		}

		fetchStats();
	}, []);

	const filteredTickets = useMemo(() => {
		if (!searchQuery.trim()) return tickets;
		const query = searchQuery.toLowerCase();
		return tickets.filter(
			(ticket) =>
				ticket.subject.toLowerCase().includes(query) ||
				ticket.id.toString().includes(query),
		)
	}, [searchQuery, tickets]);

	const STATS = [
		{
			title: "تیکت‌های باز",
			value: stats.openTickets.toString(),
			icon: MessageSquare,
			color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-200",
		},
		{
			title: "در انتظار پاسخ",
			value: stats.pendingTickets.toString(),
			icon: Clock,
			color: "bg-amber-500/10 text-amber-600 dark:text-amber-200",
		},
		{
			title: "پاسخ داده شده",
			value: stats.answeredTickets.toString(),
			icon: CheckCircle2,
			color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-200",
		},
		{
			title: "بحرانی",
			value: stats.criticalTickets.toString(),
			icon: AlertTriangle,
			color: "bg-rose-500/10 text-rose-600 dark:text-rose-200",
		},
	]

	return (
		<div className="space-y-6">
			{/* Header Section */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold text-slate-900 dark:text-white">
						داشبورد من
					</h1>
					<p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
						مدیریت و پیگیری تیکت‌های پشتیبانی خود
					</p>
				</div>
				<Link
					to="/user/new-ticket"
					className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700 hover:shadow-lg dark:bg-indigo-500 dark:hover:bg-indigo-600"
				>
					<Plus className="h-5 w-5" />
					تیکت جدید
				</Link>
			</div>

			{/* Stats Cards */}
			<section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{STATS.map((stat) => {
					const Icon = stat.icon;
					return (
						<div
							key={stat.title}
							className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm transition hover:shadow-md dark:border-slate-800/60 dark:bg-slate-900/70"
						>
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-slate-500 dark:text-slate-300">
										{stat.title}
									</p>
									<h3 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
										{stat.value}
									</h3>
								</div>
								<div
									className={`flex h-12 w-12 items-center justify-center rounded-full ${stat.color}`}
								>
									<Icon className="h-6 w-6" />
								</div>
							</div>
						</div>
					)
				})}
			</section>

			{/* Tickets Section */}
			<section className="space-y-4 rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h2 className="text-lg font-semibold text-slate-900 dark:text-white">
							تیکت‌های من
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

				<div className="space-y-3">
					{filteredTickets.length === 0 ? (
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
							{!searchQuery && (
								<Link
									to="/user/new-ticket"
									className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
								>
									<Plus className="h-4 w-4" />
									ثبت تیکت جدید
								</Link>
							)}
						</div>
					) : (
						filteredTickets.map((ticket) => (
							<Link
								key={ticket.id}
								to="/user/tickets/$ticketId"
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
										<span
											className={`text-sm font-bold ${PRIORITY_STYLES[ticket.priority]}`}
										>
											{ticket.priority}
										</span>
										<span
											className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold ${STATUS_STYLES[ticket.status]}`}
										>
											{ticket.status}
										</span>
									</div>
								</div>
							</Link>
						))
					)}
				</div>
			</section>
		</div>
	)
}
