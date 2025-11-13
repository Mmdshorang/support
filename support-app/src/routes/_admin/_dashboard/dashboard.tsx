import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
	AlertTriangle,
	CheckCircle2,
	Clock3,
	MessageSquare,
} from "lucide-react";

type TicketStatus = "در انتظار" | "در حال پیگیری" | "پاسخ داده شده" | "بسته شده";
type TicketPriority = "کم" | "متوسط" | "زیاد" | "بحرانی";

interface Ticket {
	id: number;
	subject: string;
	customer: string;
	priority: TicketPriority;
	status: TicketStatus;
	createdAt: string;
	updatedAt: string;
	owner: string;
	channel: "وب" | "تلفن" | "ایمیل" | "واتساپ";
}

const TICKETS: Ticket[] = [
	{
		id: 6589,
		subject: "عدم امکان چاپ گزارش مالی ماهانه",
		customer: "شرکت فناوری سپهر",
		priority: "بحرانی",
		status: "در حال پیگیری",
		createdAt: "1403/08/19",
		updatedAt: "1403/08/20",
		owner: "مهدی صادقی",
		channel: "وب",
	},
	{
		id: 6588,
		subject: "خطای ورود کاربران جدید",
		customer: "بانک توسعه شرق",
		priority: "زیاد",
		status: "در انتظار",
		createdAt: "1403/08/18",
		updatedAt: "1403/08/18",
		owner: "زهرا فتحی",
		channel: "ایمیل",
	},
	{
		id: 6587,
		subject: "نیاز به گزارش سفارشی فروش",
		customer: "گروه صنعتی کیان",
		priority: "متوسط",
		status: "پاسخ داده شده",
		createdAt: "1403/08/17",
		updatedAt: "1403/08/19",
		owner: "محمد جهانگیری",
		channel: "تلفن",
	},
	{
		id: 6586,
		subject: "انتقال داده از نسخه قدیمی",
		customer: "هولدینگ آریانا",
		priority: "زیاد",
		status: "در حال پیگیری",
		createdAt: "1403/08/16",
		updatedAt: "1403/08/18",
		owner: "سارا زمانی",
		channel: "وب",
	},
	{
		id: 6585,
		subject: "عدم ارسال اعلان ایمیلی",
		customer: "آکادمی حسابان",
		priority: "متوسط",
		status: "در انتظار",
		createdAt: "1403/08/15",
		updatedAt: "1403/08/17",
		owner: "مونا رضایی",
		channel: "واتساپ",
	},
	{
		id: 6584,
		subject: "سفارشی سازی گردش تایید",
		customer: "شرکت سرمایه‌گذاری پارس",
		priority: "زیاد",
		status: "پاسخ داده شده",
		createdAt: "1403/08/14",
		updatedAt: "1403/08/18",
		owner: "آرین نادری",
		channel: "وب",
	},
	{
		id: 6583,
		subject: "آموزش تیم پشتیبانی داخلی",
		customer: "گروه آیسان",
		priority: "کم",
		status: "بسته شده",
		createdAt: "1403/08/12",
		updatedAt: "1403/08/16",
		owner: "نگار کریمی",
		channel: "ایمیل",
	},
	{
		id: 6582,
		subject: "اختلال سرویس پرداخت آنلاین",
		customer: "فروشگاه اینترنتی ماهور",
		priority: "بحرانی",
		status: "در حال پیگیری",
		createdAt: "1403/08/12",
		updatedAt: "1403/08/12",
		owner: "میلاد معیری",
		channel: "وب",
	},
];

const PAGE_SIZE = 4;

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

const KPI_CARDS = [
	{
		title: "تیکت‌های باز",
		value: "48",
		diff: "+12% نسبت به هفته قبل",
		icon: MessageSquare,
		variant: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-200 dark:bg-indigo-500/20",
	},
	{
		title: "زمان پاسخ اولیه",
		value: "۱۱ دقیقه",
		diff: "-3 دقیقه سریع‌تر",
		icon: Clock3,
		variant: "bg-sky-500/10 text-sky-600 dark:text-sky-200 dark:bg-sky-500/20",
	},
	{
		title: "درخواست‌های بحرانی",
		value: "6",
		diff: "۴ مورد جدید",
		icon: AlertTriangle,
		variant: "bg-rose-500/10 text-rose-600 dark:text-rose-200 dark:bg-rose-500/20",
	},
	{
		title: "رضایت مشتری",
		value: "۹۲٪",
		diff: "+۲٪ رشد داشته",
		icon: CheckCircle2,
		variant: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-200 dark:bg-emerald-500/20",
	},
];

// const ACTIVITY_TIMELINE = [
// 	{ time: "۵ دقیقه پیش", description: "تیکت #6589 به «در حال پیگیری» تغییر وضعیت داد.", type: "update" },
// 	{ time: "۲۲ دقیقه پیش", description: "پیام جدید از «بانک توسعه شرق» در تیکت #6588 ثبت شد.", type: "message" },
// 	{ time: "۱ ساعت پیش", description: "گزارش هفتگی عملکرد تیم پشتیبانی منتشر شد.", type: "report" },
// 	{ time: "دیروز", description: "تیکت بحرانی #6582 به تیم زیرساخت ارجاع شد.", type: "critical" },
// ];

// const TICKET_HEALTH = [
// 	{ label: "در انتظار", value: 18, trend: 6 },
// 	{ label: "در حال پیگیری", value: 22, trend: -4 },
// 	{ label: "پاسخ داده شده", value: 46, trend: 8 },
// 	{ label: "بسته شده", value: 31, trend: -2 },
// ];

export const Route = createFileRoute("/_admin/_dashboard/dashboard")({
	component: DashboardPage,
});

function DashboardPage() {
	const [page, setPage] = useState(1);
	const pageCount = Math.ceil(TICKETS.length / PAGE_SIZE);

	const paginatedTickets = useMemo(() => {
		const start = (page - 1) * PAGE_SIZE;
		return TICKETS.slice(start, start + PAGE_SIZE);
	}, [page]);

	const handleChangePage = (nextPage: number) => {
		if (nextPage < 1 || nextPage > pageCount) return;
		setPage(nextPage);
	}

	return (
		<div className="space-y-6">
			<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				{KPI_CARDS.map((item) => {
					const Icon = item.icon;
					return (
						<div
							key={item.title}
							className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800/60 dark:bg-slate-900/70"
						>
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-slate-500 dark:text-slate-300">{item.title}</p>
									<h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{item.value}</h3>
									<p className="mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">{item.diff}</p>
								</div>
								<div className={`flex h-12 w-12 items-center justify-center rounded-full ${item.variant}`}>
									<Icon className="h-6 w-6" />
								</div>
							</div>
							<div className="absolute -bottom-16 inset-x-4 h-24 rounded-full bg-gradient-to-br from-indigo-100 via-purple-100 to-transparent opacity-70 blur-3xl dark:from-indigo-500/30 dark:via-purple-500/20" />
						</div>
					)
				})}
			</section>

			<section className="grid grid-cols-1 gap-6 ">
				<div className="xl:col-span-2 space-y-4 rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70">
					<header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<h2 className="text-lg font-semibold text-slate-900 dark:text-white">داشبورد درخواست‌ها</h2>
							<p className="text-sm text-slate-500 dark:text-slate-300">مرور سریع وضعیت تیکت‌ها و عملکرد تیم‌ها</p>
						</div>
						<button className="inline-flex items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-100 hover:text-indigo-700 dark:border-indigo-400/40 dark:bg-indigo-500/20 dark:text-indigo-100 dark:hover:bg-indigo-500/40">
							گزارش سفارشی
						</button>
					</header>

					<div className="overflow-x-auto">
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
								{paginatedTickets.map((ticket) => (
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
												<p className="font-medium">{ticket.customer}</p>
												<p className="text-xs text-slate-400 dark:text-slate-300">ایجاد {ticket.createdAt}</p>
											</div>
										</td>
										<td className={`px-3 py-4 text-sm font-bold ${PRIORITY_STYLES[ticket.priority]}`}>{ticket.priority}</td>
										<td className="px-3 py-4">
											<span className={`inline-flex items-center gap-1 rounded-xl px-3 py-1 text-xs font-semibold ${STATUS_STYLES[ticket.status]}`}>
												{ticket.status}
											</span>
										</td>
										<td className="hidden px-3 py-4 md:table-cell">
											<p className="text-sm font-medium">{ticket.owner}</p>
											<p className="text-xs text-slate-400 dark:text-slate-300">واحد پشتیبانی</p>
										</td>
										<td className="hidden px-3 py-4 text-xs font-medium text-slate-500 lg:table-cell dark:text-slate-300">
											{ticket.channel}
										</td>
										<td className="rounded-l-2xl px-3 py-4 text-xs font-medium text-slate-500 dark:text-slate-300">
											{ticket.updatedAt}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					<Pagination page={page} pageCount={pageCount} onChange={handleChangePage} />
				</div>

				{/* <aside className="space-y-6 rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70">
					<div className="space-y-4">
						<h3 className="text-base font-semibold text-slate-900 dark:text-white">نمای کلی سلامت تیکت‌ها</h3>
						<ul className="space-y-3">
							{TICKET_HEALTH.map((item) => (
								<li key={item.label} className="rounded-2xl border border-slate-200/60 p-4 dark:border-slate-800/60">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{item.label}</p>
											<p className="text-xs text-slate-400 dark:text-slate-300">در ۷ روز گذشته</p>
										</div>
										<div className="text-left">
											<p className="text-xl font-bold text-slate-900 dark:text-white">{item.value}</p>
											<span className={`inline-flex items-center gap-1 text-xs font-semibold ${item.trend >= 0 ? "text-emerald-500" : "text-rose-500"
												}`}>
												{item.trend >= 0 ? (
													<ArrowUpRight className="h-3.5 w-3.5" />
												) : (
													<ArrowDownLeft className="h-3.5 w-3.5" />
												)}
												{Math.abs(item.trend)}%
											</span>
										</div>
									</div>
									<div className="mt-4 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800/50">
										<div
											className={`h-full rounded-full bg-gradient-to-l ${item.trend >= 0 ? "from-emerald-400 via-emerald-500 to-emerald-600" : "from-rose-400 via-rose-500 to-rose-600"
												}`}
											style={{ width: `${Math.min(100, item.value)}%` }}
										/>
									</div>
								</li>
							))}
						</ul>
					</div>

					<div className="space-y-4">
						<h3 className="text-base font-semibold text-slate-900 dark:text-white">آخرین فعالیت‌ها</h3>
						<ul className="space-y-4">
							{ACTIVITY_TIMELINE.map((activity) => (
								<li key={activity.description} className="relative pl-4">
									<span className="absolute right-0 top-2.5 h-2 w-2 rounded-full bg-indigo-500" />
									<p className="text-xs font-semibold text-slate-400 dark:text-slate-300">{activity.time}</p>
									<p className="text-sm text-slate-700 dark:text-slate-200">{activity.description}</p>
								</li>
							))}
						</ul>
					</div>
				</aside> */}
			</section>
		</div>
	)
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
				نمایش {PAGE_SIZE} مورد در هر صفحه • صفحه {page} از {pageCount}
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
							className={`min-w-[38px] rounded-lg px-2 py-1 text-xs font-semibold transition ${pageNumber === page
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
	)
}
