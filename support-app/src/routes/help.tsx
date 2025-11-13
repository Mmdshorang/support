import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "../lib/auth-guard";
import { BookOpen, CheckCircle2, HelpCircle, MessageCircle, Phone } from "lucide-react";

export const Route = createFileRoute("/help")({
	component: HelpPage,
	beforeLoad: () => {
		requireAuth();
	},
});

function HelpPage() {
	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-2xl font-bold text-slate-900 dark:text-white">
					راهنمای استفاده
				</h1>
				<p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
					راهنما و پرسش‌های متداول سیستم پشتیبانی
				</p>
			</div>

			{/* FAQ Section */}
			<div className="grid gap-6 md:grid-cols-2">
				<div className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70">
					<div className="flex items-center gap-3 mb-4">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-300">
							<HelpCircle className="h-5 w-5" />
						</div>
						<h2 className="text-lg font-semibold text-slate-900 dark:text-white">
							چگونه تیکت ثبت کنم؟
						</h2>
					</div>
					<p className="text-sm text-slate-600 dark:text-slate-300">
						برای ثبت تیکت جدید، از منوی سمت راست گزینه "ثبت تیکت جدید" را انتخاب کنید،
						موضوع و توضیحات خود را وارد کنید و روی دکمه ارسال کلیک کنید.
					</p>
				</div>

				<div className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70">
					<div className="flex items-center gap-3 mb-4">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
							<CheckCircle2 className="h-5 w-5" />
						</div>
						<h2 className="text-lg font-semibold text-slate-900 dark:text-white">
							چگونه وضعیت تیکت را چک کنم؟
						</h2>
					</div>
					<p className="text-sm text-slate-600 dark:text-slate-300">
						در داشبورد اصلی، لیست تمام تیکت‌های شما نمایش داده می‌شود.
						با کلیک بر روی هر تیکت می‌توانید جزئیات و پیام‌های آن را مشاهده کنید.
					</p>
				</div>

				<div className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70">
					<div className="flex items-center gap-3 mb-4">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-300">
							<MessageCircle className="h-5 w-5" />
						</div>
						<h2 className="text-lg font-semibold text-slate-900 dark:text-white">
							چگونه پاسخ بدهم؟
						</h2>
					</div>
					<p className="text-sm text-slate-600 dark:text-slate-300">
						با ورود به جزئیات تیکت، می‌توانید در قسمت پایین صفحه پیام خود را تایپ کرده
						و ارسال کنید. تیم پشتیبانی به زودی به شما پاسخ خواهد داد.
					</p>
				</div>

				<div className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70">
					<div className="flex items-center gap-3 mb-4">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-300">
							<Phone className="h-5 w-5" />
						</div>
						<h2 className="text-lg font-semibold text-slate-900 dark:text-white">
							تماس با پشتیبانی
						</h2>
					</div>
					<p className="text-sm text-slate-600 dark:text-slate-300">
						در صورت نیاز به تماس مستقیم، می‌توانید با شماره 021-12345678 تماس بگیرید
						یا به آدرس ایمیل support@example.com پیام ارسال کنید.
					</p>
				</div>
			</div>

			{/* Additional Info */}
			<div className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70">
				<div className="flex items-center gap-3 mb-4">
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-300">
						<BookOpen className="h-5 w-5" />
					</div>
					<h2 className="text-lg font-semibold text-slate-900 dark:text-white">
						اطلاعات بیشتر
					</h2>
				</div>
				<div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
					<p>• تیکت‌های شما به صورت خودکار ذخیره می‌شوند</p>
					<p>• می‌توانید فایل‌های ضمیمه به تیکت‌های خود اضافه کنید</p>
					<p>• زمان پاسخ‌دهی معمولاً کمتر از 24 ساعت است</p>
					<p>• تیکت‌های بحرانی در اولویت قرار می‌گیرند</p>
				</div>
			</div>
		</div>
	);
}
