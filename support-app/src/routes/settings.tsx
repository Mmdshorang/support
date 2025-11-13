import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "../lib/auth-guard";
import { Bell, Lock, Palette, User } from "lucide-react";

export const Route = createFileRoute("/settings")({
	component: SettingsPage,
	beforeLoad: () => {
		requireAuth();
	},
});

function SettingsPage() {
	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-2xl font-bold text-slate-900 dark:text-white">
					تنظیمات
				</h1>
				<p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
					مدیریت تنظیمات حساب کاربری و سیستم
				</p>
			</div>

			{/* Settings Sections */}
			<div className="grid gap-6">
				<div className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70">
					<div className="flex items-center gap-3 mb-4">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-300">
							<User className="h-5 w-5" />
						</div>
						<h2 className="text-lg font-semibold text-slate-900 dark:text-white">
							اطلاعات کاربری
						</h2>
					</div>
					<p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
						ویرایش اطلاعات حساب کاربری، نام، ایمیل و تصویر پروفایل
					</p>
					<button className="inline-flex items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-100 dark:border-indigo-400/40 dark:bg-indigo-500/20 dark:text-indigo-100 dark:hover:bg-indigo-500/40">
						ویرایش پروفایل
					</button>
				</div>

				<div className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70">
					<div className="flex items-center gap-3 mb-4">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
							<Lock className="h-5 w-5" />
						</div>
						<h2 className="text-lg font-semibold text-slate-900 dark:text-white">
							امنیت
						</h2>
					</div>
					<p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
						تغییر رمز عبور و مدیریت امنیت حساب کاربری
					</p>
					<button className="inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-100 dark:border-emerald-400/40 dark:bg-emerald-500/20 dark:text-emerald-100 dark:hover:bg-emerald-500/40">
						تغییر رمز عبور
					</button>
				</div>

				<div className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70">
					<div className="flex items-center gap-3 mb-4">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-300">
							<Bell className="h-5 w-5" />
						</div>
						<h2 className="text-lg font-semibold text-slate-900 dark:text-white">
							اعلان‌ها
						</h2>
					</div>
					<p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
						مدیریت اعلان‌های ایمیل و پوش برای تیکت‌ها
					</p>
					<div className="space-y-3">
						<label className="flex items-center gap-3">
							<input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
							<span className="text-sm text-slate-700 dark:text-slate-300">اعلان ایمیل برای پاسخ جدید</span>
						</label>
						<label className="flex items-center gap-3">
							<input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
							<span className="text-sm text-slate-700 dark:text-slate-300">اعلان برای تغییر وضعیت تیکت</span>
						</label>
					</div>
				</div>

				<div className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70">
					<div className="flex items-center gap-3 mb-4">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-300">
							<Palette className="h-5 w-5" />
						</div>
						<h2 className="text-lg font-semibold text-slate-900 dark:text-white">
							ظاهر
						</h2>
					</div>
					<p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
						انتخاب تم روشن یا تاریک
					</p>
					<div className="flex gap-3">
						<button className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
							روشن
						</button>
						<button className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
							تاریک
						</button>
						<button className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
							خودکار
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
