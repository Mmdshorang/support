import { createFileRoute } from "@tanstack/react-router";
import {
	ArrowLeft,
	CheckCircle2,
	Headset,
	LineChart,
	ShieldCheck,
	Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/")({
	component: HomePage,
});

const FEATURE_ITEMS = [
	{
		title: "پشتیبانی یکپارچه",
		description: "مدیریت درخواست‌های مشتری از تمام کانال‌ها در یک داشبورد پیشرفته.",
		icon: Headset,
	},
	{
		title: "اتوماسیون جریان کار",
		description: "تعریف SLA، ارجاع هوشمند و تریگرهای خودکار برای تسریع پاسخ‌گویی.",
		icon: Sparkles,
	},
	{
		title: "امنیت سازمانی",
		description: "کنترل دسترسی مبتنی بر نقش، لاگینگ کامل و انطباق با استانداردهای مالی.",
		icon: ShieldCheck,
	},
	{
		title: "گزارش‌های حرفه‌ای",
		description: "تحلیل عملکرد تیم‌ها، روند رضایت مشتری و شاخص‌های SLA به صورت زنده.",
		icon: LineChart,
	},
];

const METRICS = [
	{ label: "درخواست‌های مدیریت‌شده", value: "۱۲,۴۵۰+" },
	{ label: "میانگین رضایت مشتری", value: "۹۲٪" },
	{ label: "زمان پاسخ اولیه", value: "۱۰ دقیقه" },
];

function HomePage() {
	return (
		<div className="space-y-16">
			<section className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-gradient-to-br from-indigo-500/90 via-purple-500/80 to-rose-400/70 p-8 text-white shadow-xl dark:from-indigo-600/70 dark:via-purple-700/60 dark:to-slate-900/60">
				<div className="absolute inset-0 opacity-20 mix-blend-screen">
					<div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-white/30 blur-3xl" />
					<div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-white/40 blur-3xl" />
				</div>
				<div className="relative flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
					<div className="max-w-2xl space-y-6">
						<span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
							<CheckCircle2 className="h-4 w-4" />
							راهکار رسمی مدیریت پشتیبانی حسابان
						</span>
						<h1 className="text-3xl font-black leading-tight sm:text-4xl">
							مدیریت هوشمند تجربه مشتری با پلتفرم پشتیبانی حسابان
						</h1>
						<p className="text-base leading-7 text-white/80">
							همه درخواست‌های مشتریان، فرایندهای داخلی و گزارش‌های راهبردی را در یک فضای یکپارچه مدیریت کنید.
							داشبوردهای لحظه‌ای، اتوماسیون هوشمند و تقویم عملیاتی به شما کمک می‌کند در جلسات بعدی همیشه پاسخ‌های دقیق در دست داشته باشید.
						</p>
						<div className="flex flex-wrap items-center gap-3">
							<a
								className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-indigo-600 transition hover:bg-slate-100"
								href="/dashboard"
							>
								رفتن به داشبورد
								<ArrowLeft className="h-4 w-4" />
							</a>
							<a
								className="inline-flex items-center gap-2 rounded-2xl border border-white/50 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
								href="/submitTicket"
							>
								ثبت درخواست جدید
							</a>
						</div>
					</div>
					<div className="grid w-full max-w-md grid-cols-1 gap-4 rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-2xl">
						{METRICS.map((metric) => (
							<div key={metric.label} className="rounded-2xl bg-white/20 p-4 text-center shadow-sm backdrop-blur-xl">
								<p className="text-sm font-semibold text-white/70">{metric.label}</p>
								<p className="mt-2 text-3xl font-black">{metric.value}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			<section className="space-y-8">
				<header className="flex flex-col gap-2">
					<h2 className="text-2xl font-bold text-slate-900 dark:text-white">چرا تیم‌های پشتیبانی حسابان را انتخاب می‌کنند؟</h2>
					<p className="text-sm text-slate-500 dark:text-slate-300">
						تمام ابزارهای لازم برای عملیات پشتیبانی متمرکز، مدیریت پروژه‌ها و گزارش‌دهی مدیریتی در زیرساختی امن و پایدار.
					</p>
				</header>
				<div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
					{FEATURE_ITEMS.map((feature) => {
						const Icon = feature.icon;
						return (
							<div
								key={feature.title}
								className="group relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800/60 dark:bg-slate-900/70"
							>
								<span className="absolute inset-x-0 bottom-0 h-24 translate-y-12 rounded-full bg-gradient-to-t from-indigo-200/40 via-transparent to-transparent opacity-0 transition-all duration-300 group-hover:translate-y-4 group-hover:opacity-100 dark:from-indigo-500/20" />
								<div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-500 group-hover:text-white dark:bg-indigo-500/10 dark:text-indigo-200 dark:group-hover:bg-indigo-500">
									<Icon className="h-6 w-6" />
								</div>
								<h3 className="relative mt-6 text-lg font-bold text-slate-900 dark:text-white">{feature.title}</h3>
								<p className="relative mt-3 text-sm leading-6 text-slate-500 dark:text-slate-300">{feature.description}</p>
							</div>
						);
					})}
				</div>
			</section>

			<section className="grid gap-6 rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70 lg:grid-cols-5">
				<div className="lg:col-span-2 space-y-4">
					<span className="inline-flex rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-200">
						هماهنگی تیم‌ها
					</span>
					<h3 className="text-xl font-bold text-slate-900 dark:text-white">همیشه آماده جلسه بعدی باشید</h3>
					<p className="text-sm leading-6 text-slate-500 dark:text-slate-300">
						با برنامه‌ زمان‌بندی تیمی، تقویم ارجاعات و یادآوری‌های هوشمند، همه افراد تیم با آخرین وضعیت درخواست‌ها وارد جلسه می‌شوند.
						گزارش‌های لحظه‌ای و قالب‌های آماده ارائه به مدیران، زمان جمع‌آوری اطلاعات را به حداقل می‌رساند.
					</p>
					<ul className="space-y-2 text-sm text-slate-600 dark:text-slate-200">
						<li className="flex items-center gap-2">
							<CheckCircle2 className="h-4 w-4 text-emerald-500" />
							هماهنگی بی‌نقص بین تیم‌های مالی، فنی و مشتری‌مداری
						</li>
						<li className="flex items-center gap-2">
							<CheckCircle2 className="h-4 w-4 text-emerald-500" />
							تحلیل خودکار KPI و وضعیت SLA برای جلسات تحلیلی
						</li>
						<li className="flex items-center gap-2">
							<CheckCircle2 className="h-4 w-4 text-emerald-500" />
							دسترسی موبایل برای تیم‌های عملیاتی در حال حرکت
						</li>
					</ul>
				</div>
				<div className="lg:col-span-3 grid gap-4 md:grid-cols-2">
					<div className="rounded-3xl border border-indigo-100 bg-indigo-50/80 p-6 text-indigo-700 shadow-md dark:border-indigo-500/30 dark:bg-indigo-500/15 dark:text-indigo-100">
						<p className="text-xs font-semibold uppercase tracking-widest text-indigo-500/80">SLA</p>
						<p className="mt-4 text-3xl font-black">۹۵٪</p>
						<p className="mt-2 text-sm text-indigo-600/80 dark:text-indigo-200/80">درصد تعهد انجام‌شده در ۷ روز گذشته</p>
					</div>
					<div className="rounded-3xl border border-slate-200 p-6 text-slate-700 shadow-sm dark:border-slate-700 dark:text-slate-100">
						<p className="text-xs font-semibold uppercase tracking-widest text-slate-400">جلسات امروز</p>
						<p className="mt-4 text-3xl font-black text-slate-900 dark:text-white">۳ جلسه</p>
						<p className="mt-2 text-sm text-slate-500 dark:text-slate-300">کنترل بودجه، برنامه‌ریزی فنی و ارزیابی کیفیت</p>
					</div>
					<div className="md:col-span-2 rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-700 shadow-sm dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-100">
						<p className="text-xs font-semibold uppercase tracking-widest text-emerald-500/80">Success Stories</p>
						<p className="mt-3 text-sm leading-6">
							«بعد از استقرار سامانه پشتیبانی حسابان، تیم ما در جلسات هفتگی تنها با چند کلیک گزارش‌های مدیریتی را آماده می‌کند و تمرکز کامل روی حل مسائل واقعی مشتریان داریم.»
						</p>
						<p className="mt-3 text-xs font-semibold uppercase text-emerald-500/70">مدیر عملیات - گروه صنعتی کیان</p>
					</div>
				</div>
			</section>
		</div>
	);
}
