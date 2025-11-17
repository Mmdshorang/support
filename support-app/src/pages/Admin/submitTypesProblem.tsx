import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { categoriesApi } from "../../services/api/categories";
import type { Category } from "../../services/api/categories";

interface Issue {
	id: string;
	type: string;
	category: "زیرساخت" | "کاربری" | "گزارش" | "سایر";
	activeTickets: number;
	description?: string;
	is_active: boolean;
}

export default function IssuesList() {
	const [issues, setIssues] = useState<Issue[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [draftValue, setDraftValue] = useState("");
	const [newIssue, setNewIssue] = useState("");
	const [newCategory] = useState<Issue["category"]>("کاربری");

	// Fetch categories from API
	useEffect(() => {
		const fetchCategories = async () => {
			try {
				setIsLoading(true);
				const response = await categoriesApi.getCategories();

				// Map API categories to Issue interface
				const mappedIssues: Issue[] = response.data.map((cat: Category) => ({
					id: cat.id,
					type: cat.name,
					category:"سایر",
					activeTickets: 0, 
					description: cat.description,
					is_active: cat.is_active,
				}));

				setIssues(mappedIssues);
			} catch (error) {
				console.error("Error fetching categories:", error);
				toast.error("خطا در دریافت دسته‌بندی‌ها");
			} finally {
				setIsLoading(false);
			}
		};

		fetchCategories();
	}, []);


	const stats = useMemo(() => {
		const total = issues.length;
		const totalTickets = issues.reduce((sum, issue) => sum + issue.activeTickets, 0);
		const highDemand = issues.filter((issue) => issue.activeTickets >= 5).length;
		return { total, totalTickets, highDemand };
	}, [issues]);

	const startEditing = (issue: Issue) => {
		setEditingId(issue.id);
		setDraftValue(issue.type);
	};

	const cancelEditing = () => {
		setEditingId(null);
		setDraftValue("");
	};

	const saveEditing = async (id: string) => {
		if (!draftValue.trim()) return;

		try {
			await categoriesApi.updateCategory(id, {
				name: draftValue.trim(),
			});

			setIssues((prev) => prev.map((issue) => (issue.id === id ? { ...issue, type: draftValue.trim() } : issue)));
			cancelEditing();
			toast.success("دسته‌بندی با موفقیت به‌روزرسانی شد");
		} catch (error) {
			console.error("Error updating category:", error);
			toast.error("خطا در به‌روزرسانی دسته‌بندی");
		}
	};

	const removeIssue = async (id: string) => {
		try {
			await categoriesApi.deleteCategory(id);
			setIssues((prev) => prev.filter((issue) => issue.id !== id));
			toast.success("دسته‌بندی با موفقیت حذف شد");
		} catch (error) {
			console.error("Error deleting category:", error);
			toast.error("خطا در حذف دسته‌بندی");
		}
	};

	const handleAddIssue = async () => {
		if (!newIssue.trim()) return;

		try {
			const response = await categoriesApi.createCategory({
				name: newIssue.trim(),
				description: `دسته‌بندی ${newCategory}`,
				icon: "folder",
			});

			const newIssueData: Issue = {
				id: response.data.id,
				type: response.data.name,
				category: newCategory,
				activeTickets: 0,
				description: response.data.description,
				is_active: response.data.is_active,
			};

			setIssues((prev) => [...prev, newIssueData]);
			setNewIssue("");
			toast.success("دسته‌بندی جدید با موفقیت اضافه شد");
		} catch (error) {
			console.error("Error creating category:", error);
			toast.error("خطا در ایجاد دسته‌بندی");
		}
	};

	return (
		<div className="space-y-8">
			<header className="space-y-2">
				<h1 className="text-2xl font-bold text-slate-900 dark:text-white">دسته‌بندی مشکلات سامانه</h1>
				<p className="text-sm text-slate-500 dark:text-slate-300">
					مدیریت متمرکز عناوین مشکلات به تیم پشتیبانی کمک می‌کند درخواست‌ها سریع‌تر ارجاع داده شوند و گزارش‌ها ساختار یکسانی داشته باشند.
				</p>
			</header>

			<section className="grid gap-4 sm:grid-cols-3">
				<div className="rounded-3xl border border-slate-200/70 bg-white/80 p-5 text-sm shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70">
					<p className="text-xs font-semibold text-slate-500 dark:text-slate-300">کل دسته‌ها</p>
					<p className="mt-3 text-3xl font-black text-slate-700 dark:text-white">{stats.total}</p>
					<p className="mt-1 text-xs text-slate-400 dark:text-slate-400">سازماندهی شده برای پشتیبانی</p>
				</div>
				<div className="rounded-3xl border border-indigo-200/70 bg-indigo-50/60 p-5 text-sm shadow-sm dark:border-indigo-500/20 dark:bg-indigo-500/15">
					<p className="text-xs font-semibold text-indigo-600 dark:text-indigo-100">تیکت‌های فعال</p>
					<p className="mt-3 text-3xl font-black text-indigo-600 dark:text-indigo-100">{stats.totalTickets}</p>
					<p className="mt-1 text-xs text-indigo-500/80 dark:text-indigo-100/80">در انتظار بررسی یا اقدام</p>
				</div>
				<div className="rounded-3xl border border-rose-200/70 bg-rose-50/60 p-5 text-sm shadow-sm dark:border-rose-500/20 dark:bg-rose-500/15">
					<p className="text-xs font-semibold text-rose-600 dark:text-rose-100">اولویت بالا</p>
					<p className="mt-3 text-3xl font-black text-rose-600 dark:text-rose-100">{stats.highDemand}</p>
					<p className="mt-1 text-xs text-rose-500/80 dark:text-rose-100/80">نیازمند بازنگری فوری</p>
				</div>
			</section>

			<section className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70">
				<header className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="space-y-1">
						<h2 className="text-lg font-semibold text-slate-900 dark:text-white">افزودن دسته جدید</h2>
						<p className="text-xs text-slate-500 dark:text-slate-300">دسته‌های واضح باعث می‌شوند تحلیل گزارش‌ها سریع‌تر انجام شود.</p>
					</div>
				</header>

				<div className="grid gap-3 sm:grid-cols-[2fr_1fr_auto]">
					<input
						type="text"
						value={newIssue}
						onChange={(event) => setNewIssue(event.target.value)}
						className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/40"
						placeholder="مثال: خطای همگام‌سازی حسابداری"
					/>
					<button
						onClick={handleAddIssue}
						className="rounded-2xl bg-gradient-to-l from-indigo-600 via-purple-600 to-rose-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-500/70"
					>
						افزودن دسته
					</button>
				</div>
			</section>

			<section className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70">
				<header className="flex flex-col gap-2 pb-4">
					<h2 className="text-lg font-semibold text-slate-900 dark:text-white">لیست دسته‌ها</h2>
					<p className="text-xs text-slate-500 dark:text-slate-300">برای ویرایش عنوان روی آیتم کلیک کنید.</p>
				</header>

				<div className="overflow-x-auto">
					<table className="min-w-full border-separate border-spacing-y-3 text-sm">
						<thead>
							<tr className="text-right text-xs font-semibold text-slate-500 dark:text-slate-300">
								<th className="rounded-r-xl bg-slate-100/70 px-3 py-2 dark:bg-slate-800/70">ردیف</th>
								<th className="bg-slate-100/70 px-3 py-2 dark:bg-slate-800/70">عنوان مشکل</th>
								<th className="bg-slate-100/70 px-3 py-2 dark:bg-slate-800/70">تیکت‌های فعال</th>
								<th className="rounded-l-xl bg-slate-100/70 px-3 py-2 text-center dark:bg-slate-800/70">عملیات</th>
							</tr>
						</thead>
						<tbody>
							{isLoading ? (
								<tr>
									<td
										colSpan={5}
										className="rounded-3xl bg-white/80 py-8 text-center text-sm font-medium text-slate-400 dark:bg-slate-900/70 dark:text-slate-300"
									>
										<div className="flex items-center justify-center gap-2">
											<div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
											در حال بارگذاری...
										</div>
									</td>
								</tr>
							) : issues.map((issue) => (
								<tr
									key={issue.id}
									className="rounded-3xl bg-white/80 text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-indigo-50 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:bg-slate-800/70"
								>
									<td className="rounded-r-3xl px-3 py-4 text-sm font-semibold text-slate-500 dark:text-slate-300">#{issue.id}</td>
									<td className="px-3 py-4">
										{editingId === issue.id ? (
											<input
												value={draftValue}
												onChange={(event) => setDraftValue(event.target.value)}
												className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/40"
											/>
										) : (
											<span className="text-sm font-semibold text-slate-800 dark:text-white">{issue.type}</span>
										)}
									</td>
									<td className="px-3 py-4 text-xs font-semibold text-slate-500 dark:text-slate-300">{issue.activeTickets}</td>
									<td className="rounded-l-3xl px-3 py-4">
										<div className="flex items-center justify-center gap-2">
											{editingId === issue.id ? (
												<>
													<button
														onClick={() => saveEditing(issue.id)}
														className="rounded-xl bg-emerald-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-600"
													>
														ذخیره
													</button>
													<button
														onClick={cancelEditing}
														className="rounded-xl bg-slate-400 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-500"
													>
														انصراف
													</button>
												</>
											) : (
												<button
													onClick={() => startEditing(issue)}
													className="rounded-xl bg-indigo-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-600"
												>
													ویرایش
												</button>
											)}
											<button
												onClick={() => removeIssue(issue.id)}
												className="rounded-xl bg-rose-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-600"
											>
												حذف
											</button>
										</div>
									</td>
								</tr>
							))}

							{issues.length === 0 && (
								<tr>
									<td
										colSpan={5}
										className="rounded-3xl bg-white/80 py-8 text-center text-sm font-medium text-slate-400 dark:bg-slate-900/70 dark:text-slate-300"
									>
										هنوز هیچ دسته‌ای ثبت نشده است.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</section>
		</div>
	);
}
