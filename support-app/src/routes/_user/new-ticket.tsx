import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Paperclip, Send, X } from "lucide-react";

type TicketPriority = "کم" | "متوسط" | "زیاد" | "بحرانی";
type TicketCategory =
	| "فنی"
	| "مالی"
	| "پشتیبانی"
	| "فروش"
	| "درخواست ویژگی"
	| "سایر";

export const Route = createFileRoute("/_user/new-ticket")({
	component: NewTicketPage,
});

function NewTicketPage() {
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		subject: "",
		category: "" as TicketCategory | "",
		priority: "" as TicketPriority | "",
		description: "",
	});
	const [attachments, setAttachments] = useState<File[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.subject || !formData.category || !formData.priority || !formData.description) {
			return;
		}

		setIsSubmitting(true);
		// اینجا باید تیکت را به سرور ارسال کنید
		await new Promise((resolve) => setTimeout(resolve, 1500));

		// بعد از ارسال موفق، به داشبورد برگردید
		navigate({ to: "/user-dashboard" });
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			setAttachments([...attachments, ...Array.from(e.target.files)]);
		}
	};

	const removeAttachment = (index: number) => {
		setAttachments(attachments.filter((_, i) => i !== index));
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center gap-4">
				<button
					onClick={() => navigate({ to: "/user-dashboard" })}
					className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400"
				>
					<ArrowRight className="h-4 w-4" />
					بازگشت به داشبورد
				</button>
			</div>

			{/* Form Card */}
			<div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70">
				<div className="mb-6">
					<h1 className="text-2xl font-bold text-slate-900 dark:text-white">
						ثبت تیکت جدید
					</h1>
					<p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
						مشکل یا درخواست خود را با جزئیات کامل برای ما شرح دهید
					</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Subject */}
					<div>
						<label
							htmlFor="subject"
							className="block text-sm font-medium text-slate-700 dark:text-slate-300"
						>
							موضوع تیکت <span className="text-rose-500">*</span>
						</label>
						<input
							id="subject"
							type="text"
							required
							value={formData.subject}
							onChange={(e) =>
								setFormData({ ...formData, subject: e.target.value })
							}
							className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
							placeholder="خلاصه‌ای از مشکل یا درخواست خود را بنویسید"
						/>
					</div>

					{/* Category and Priority */}
					<div className="grid gap-6 md:grid-cols-2">
						<div>
							<label
								htmlFor="category"
								className="block text-sm font-medium text-slate-700 dark:text-slate-300"
							>
								دسته‌بندی <span className="text-rose-500">*</span>
							</label>
							<select
								id="category"
								required
								value={formData.category}
								onChange={(e) =>
									setFormData({
										...formData,
										category: e.target.value as TicketCategory,
									})
								}
								className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
							>
								<option value="">انتخاب کنید</option>
								<option value="فنی">فنی</option>
								<option value="مالی">مالی</option>
								<option value="پشتیبانی">پشتیبانی</option>
								<option value="فروش">فروش</option>
								<option value="درخواست ویژگی">درخواست ویژگی</option>
								<option value="سایر">سایر</option>
							</select>
						</div>

						<div>
							<label
								htmlFor="priority"
								className="block text-sm font-medium text-slate-700 dark:text-slate-300"
							>
								اولویت <span className="text-rose-500">*</span>
							</label>
							<select
								id="priority"
								required
								value={formData.priority}
								onChange={(e) =>
									setFormData({
										...formData,
										priority: e.target.value as TicketPriority,
									})
								}
								className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
							>
								<option value="">انتخاب کنید</option>
								<option value="کم">کم</option>
								<option value="متوسط">متوسط</option>
								<option value="زیاد">زیاد</option>
								<option value="بحرانی">بحرانی</option>
							</select>
						</div>
					</div>

					{/* Description */}
					<div>
						<label
							htmlFor="description"
							className="block text-sm font-medium text-slate-700 dark:text-slate-300"
						>
							توضیحات کامل <span className="text-rose-500">*</span>
						</label>
						<textarea
							id="description"
							rows={6}
							required
							value={formData.description}
							onChange={(e) =>
								setFormData({ ...formData, description: e.target.value })
							}
							className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
							placeholder="لطفاً مشکل یا درخواست خود را با جزئیات کامل توضیح دهید..."
						/>
						<p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
							هرچه توضیحات دقیق‌تر باشد، سریع‌تر می‌توانیم به شما کمک کنیم
						</p>
					</div>

					{/* File Attachments */}
					<div>
						<label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
							پیوست‌ها (اختیاری)
						</label>
						<div className="mt-2">
							<label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
								<Paperclip className="h-4 w-4" />
								افزودن فایل
								<input
									type="file"
									multiple
									onChange={handleFileChange}
									className="hidden"
									accept="image/*,.pdf,.doc,.docx,.txt"
								/>
							</label>
							<p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
								حداکثر 5 فایل، هر کدام تا 10 مگابایت
							</p>
						</div>

						{/* Attachments List */}
						{attachments.length > 0 && (
							<div className="mt-4 space-y-2">
								{attachments.map((file, index) => (
									<div
										key={index}
										className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 dark:border-slate-700 dark:bg-slate-800"
									>
										<div className="flex items-center gap-2">
											<Paperclip className="h-4 w-4 text-slate-400" />
											<span className="text-sm text-slate-700 dark:text-slate-200">
												{file.name}
											</span>
											<span className="text-xs text-slate-400">
												({(file.size / 1024).toFixed(1)} KB)
											</span>
										</div>
										<button
											type="button"
											onClick={() => removeAttachment(index)}
											className="text-rose-500 transition hover:text-rose-600"
										>
											<X className="h-4 w-4" />
										</button>
									</div>
								))}
							</div>
						)}
					</div>

					{/* Submit Buttons */}
					<div className="flex flex-col gap-3 border-t border-slate-200 pt-6 dark:border-slate-800 sm:flex-row sm:justify-end">
						<button
							type="button"
							onClick={() => navigate({ to: "/user-dashboard" })}
							className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
						>
							انصراف
						</button>
						<button
							type="submit"
							disabled={isSubmitting}
							className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
						>
							<Send className="h-4 w-4" />
							{isSubmitting ? "در حال ارسال..." : "ثبت تیکت"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
