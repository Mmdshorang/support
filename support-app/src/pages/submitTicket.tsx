import { useMemo, useState } from "react";
import SelectBox, { type Option } from "../components/common/SelectBox";

interface TicketForm {
	requesterName: string;
	requesterPhone: string;
	description: string;
	solution: string;
	supportType: "remote" | "inPerson";
	status: "open" | "closed";
}

const ISSUE_OPTIONS: Option[] = [
	{ value: "connection", label: "عدم اتصال به سرور" },
	{ value: "login", label: "مشکل ورود کاربران" },
	{ value: "reporting", label: "مشکل گزارش‌گیری" },
	{ value: "other", label: "سایر موارد" },
];

const SUPPORT_TIPS = [
	"در صورت بحرانی بودن مشکل، از لینک «تیکت‌های بحرانی» استفاده کنید.",
	"برای تسریع رسیدگی، فایل‌های ضمیمه و اسکرین‌شات را داخل مکالمه تیکت قرار دهید.",
	"پیگیری وضعیت تیکت از منوی «وضعیت تیکت‌ها» امکان‌پذیر است.",
];

export function SubmitTicketPage() {
	const [issue, setIssue] = useState<Option | null>(ISSUE_OPTIONS[0]);
	const [form, setForm] = useState<TicketForm>({
		requesterName: "",
		requesterPhone: "",
		description: "",
		solution: "",
		supportType: "remote",
		status: "open",
	});

	const issueLabel = useMemo(() => issue?.label ?? "انتخاب نشده", [issue]);

	const handleChange = (field: keyof TicketForm) => (value: string) => {
		setForm((prev) => ({ ...prev, [field]: value }));
	};

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		console.table({
			...form,
			issue: issue?.value ?? "",
		});
	};

	return (
		<div className="space-y-8">
			<header className="space-y-2">
				<h1 className="text-2xl font-bold text-slate-900 dark:text-white">ثبت تیکت پشتیبانی</h1>
				<p className="text-sm text-slate-500 dark:text-slate-300">
					اطلاعات درخواست را با جزئیات کامل وارد کنید تا تیم پشتیبانی بتواند در کمترین زمان ممکن پیگیری کند.
				</p>
			</header>

			<div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
				<form
					onSubmit={handleSubmit}
					className="space-y-5 rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm transition dark:border-slate-800/60 dark:bg-slate-900/70"
				>
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<label className="text-sm font-medium text-slate-700 dark:text-slate-200">نام تماس‌گیرنده</label>
							<input
								type="text"
								required
								value={form.requesterName}
								onChange={(event) => handleChange("requesterName")(event.target.value)}
								className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/40"
								placeholder="مثلاً علی احمدی"
							/>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium text-slate-700 dark:text-slate-200">شماره تماس</label>
							<input
								type="tel"
								required
								dir="ltr"
								value={form.requesterPhone}
								onChange={(event) => handleChange("requesterPhone")(event.target.value)}
								className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/40"
								placeholder="09120000000"
							/>
						</div>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium text-slate-700 dark:text-slate-200">دسته‌بندی مشکل</label>
						<SelectBox
							options={ISSUE_OPTIONS}
							value={issue}
							onChange={(value) => setIssue(value as Option)}
							placeholder="یک مورد انتخاب کنید"
							searchable
							multiple={false}
							creatable
						/>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium text-slate-700 dark:text-slate-200">شرح مشکل</label>
						<textarea
							required
							minLength={10}
							value={form.description}
							onChange={(event) => handleChange("description")(event.target.value)}
							className="min-h-[110px] w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/40"
							placeholder="به صورت خلاصه توضیح دهید چه اتفاقی رخ داده است..."
						/>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium text-slate-700 dark:text-slate-200">راه‌حل/اقدامات انجام‌شده</label>
						<textarea
							value={form.solution}
							onChange={(event) => handleChange("solution")(event.target.value)}
							className="min-h-[80px] w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/40"
							placeholder="اگر اقدام اولیه‌ای انجام شده، اینجا ثبت کنید."
						/>
					</div>

					<div className="grid gap-4 md:grid-cols-2">
						<fieldset className="space-y-3 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 text-sm dark:border-slate-700/70 dark:bg-slate-800/40">
							<legend className="px-2 text-xs font-semibold text-slate-500 dark:text-slate-300">نوع پشتیبانی</legend>
							<label className="flex items-center justify-between gap-4 rounded-xl bg-white/70 px-3 py-2 text-slate-700 transition hover:bg-indigo-50 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-indigo-500/10">
								<span>غیرحضوری (تلفن/سامانه)</span>
								<input
									type="radio"
									name="supportType"
									checked={form.supportType === "remote"}
									onChange={() => handleChange("supportType")("remote")}
									className="h-4 w-4 text-indigo-500 focus:ring-indigo-500"
								/>
							</label>
							<label className="flex items-center justify-between gap-4 rounded-xl bg-white/70 px-3 py-2 text-slate-700 transition hover:bg-indigo-50 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-indigo-500/10">
								<span>حضوری (اعزام کارشناس)</span>
								<input
									type="radio"
									name="supportType"
									checked={form.supportType === "inPerson"}
									onChange={() => handleChange("supportType")("inPerson")}
									className="h-4 w-4 text-indigo-500 focus:ring-indigo-500"
								/>
							</label>
						</fieldset>

						<fieldset className="space-y-3 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 text-sm dark:border-slate-700/70 dark:bg-slate-800/40">
							<legend className="px-2 text-xs font-semibold text-slate-500 dark:text-slate-300">وضعیت تیکت</legend>
							<label className="flex items-center justify-between gap-4 rounded-xl bg-white/70 px-3 py-2 text-slate-700 transition hover:bg-emerald-50 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-emerald-500/10">
								<span>باز و در انتظار پیگیری</span>
								<input
									type="radio"
									name="ticketStatus"
									checked={form.status === "open"}
									onChange={() => handleChange("status")("open")}
									className="h-4 w-4 text-emerald-500 focus:ring-emerald-500"
								/>
							</label>
							<label className="flex items-center justify-between gap-4 rounded-xl bg-white/70 px-3 py-2 text-slate-700 transition hover:bg-emerald-50 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-emerald-500/10">
								<span>بسته و پایان‌یافته</span>
								<input
									type="radio"
									name="ticketStatus"
									checked={form.status === "closed"}
									onChange={() => handleChange("status")("closed")}
									className="h-4 w-4 text-emerald-500 focus:ring-emerald-500"
								/>
							</label>
						</fieldset>
					</div>

					<button
						type="submit"
						className="inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-l from-indigo-600 via-purple-600 to-rose-500 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 dark:focus:ring-indigo-500/70 dark:focus:ring-offset-slate-900"
					>
						ثبت تیکت جدید
					</button>
				</form>

				<aside className="space-y-4 rounded-3xl border border-indigo-200/60 bg-indigo-50/60 p-6 text-sm shadow-sm dark:border-indigo-500/20 dark:bg-indigo-500/15">
					<div>
						<h3 className="text-base font-semibold text-indigo-700 dark:text-indigo-100">جزئیات انتخاب شده</h3>
						<ul className="mt-3 space-y-2 text-indigo-700/90 dark:text-indigo-100/80">
							<li className="flex items-center justify-between rounded-2xl bg-white/70 px-3 py-2 text-xs font-semibold dark:bg-slate-900/40 dark:text-indigo-100">
								<span>موضوع</span>
								<span>{issueLabel}</span>
							</li>
							<li className="flex items-center justify-between rounded-2xl bg-white/70 px-3 py-2 text-xs font-semibold dark:bg-slate-900/40 dark:text-indigo-100">
								<span>نوع پشتیبانی</span>
								<span>{form.supportType === "remote" ? "غیرحضوری" : "حضوری"}</span>
							</li>
							<li className="flex items-center justify-between rounded-2xl bg-white/70 px-3 py-2 text-xs font-semibold dark:bg-slate-900/40 dark:text-indigo-100">
								<span>وضعیت تیکت</span>
								<span>{form.status === "open" ? "باز" : "بسته"}</span>
							</li>
						</ul>
					</div>

					<div className="space-y-3 rounded-3xl border border-white/40 bg-white/60 p-5 text-slate-700 shadow-sm dark:border-slate-800/40 dark:bg-slate-900/60 dark:text-slate-200">
						<h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">نکات مهم قبل از ارسال</h4>
						<ul className="space-y-2 text-xs leading-5">
							{SUPPORT_TIPS.map((tip) => (
								<li key={tip} className="flex items-center gap-2">
									<span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
									{tip}
								</li>
							))}
						</ul>
					</div>
				</aside>
			</div>
		</div>
	);
}

export default SubmitTicketPage;
