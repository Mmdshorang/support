import { useState } from "react";
import JalaliDatePicker from "../components/common/DatePicker";

interface FormState {
  customerName: string;
  customerNumber: string;
  companyName: string;
  contractFrom: string;
  contractTo: string;
  contractTier: "basic" | "standard" | "premium";
}

export default function CustomerRegistrationForm() {
  const [form, setForm] = useState<FormState>({
    customerName: "",
    customerNumber: "",
    companyName: "",
    contractFrom: "",
    contractTo: "",
    contractTier: "standard",
  });

  const handleChange = (field: keyof FormState) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.table(form);
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">ثبت مشتری جدید</h1>
        <p className="text-sm text-slate-500 dark:text-slate-300">
          مشخصات مشتری سازمانی را تکمیل کنید تا دسترسی به پورتال پشتیبانی و SLA مناسب فعال شود.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm transition dark:border-slate-800/60 dark:bg-slate-900/70"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-200">نام مشتری</label>
              <input
                required
                value={form.customerName}
                onChange={(event) => handleChange("customerName")(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/40"
                placeholder="مثلاً شرکت توسعه آبان"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-200">شماره تماس</label>
              <input
                required
                dir="ltr"
                value={form.customerNumber}
                onChange={(event) => handleChange("customerNumber")(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/40"
                placeholder="021-88887777"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-200">نام مجموعه/برند</label>
            <input
              required
              value={form.companyName}
              onChange={(event) => handleChange("companyName")(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/40"
              placeholder="گروه مالی حسابان"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 text-xs text-slate-500 dark:text-slate-300">
              <span className="font-semibold">تاریخ شروع قرارداد</span>
              <JalaliDatePicker value={form.contractFrom} onChange={(value) => handleChange("contractFrom")(value ?? "")} />
            </div>
            <div className="space-y-2 text-xs text-slate-500 dark:text-slate-300">
              <span className="font-semibold">تاریخ پایان قرارداد</span>
              <JalaliDatePicker value={form.contractTo} onChange={(value) => handleChange("contractTo")(value ?? "")} />
            </div>
          </div>

          <fieldset className="space-y-3 rounded-3xl border border-slate-200/70 bg-slate-50/60 p-5 text-sm dark:border-slate-700/70 dark:bg-slate-800/40">
            <legend className="px-2 text-xs font-semibold text-slate-500 dark:text-slate-300">سطح قرارداد پشتیبانی</legend>
            <label className="flex items-center justify-between gap-4 rounded-2xl bg-white/70 px-4 py-2 text-slate-700 transition hover:bg-indigo-50 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-indigo-500/10">
              <span>
                <span className="font-semibold">Basic</span> • پاسخگویی در ساعت اداری
              </span>
              <input
                type="radio"
                name="tier"
                checked={form.contractTier === "basic"}
                onChange={() => handleChange("contractTier")("basic")}
                className="h-4 w-4 text-indigo-500 focus:ring-indigo-500"
              />
            </label>
            <label className="flex items-center justify-between gap-4 rounded-2xl bg-white/70 px-4 py-2 text-slate-700 transition hover:bg-indigo-50 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-indigo-500/10">
              <span>
                <span className="font-semibold">Standard</span> • پشتیبانی 12 ساعته + گزارش ماهانه
              </span>
              <input
                type="radio"
                name="tier"
                checked={form.contractTier === "standard"}
                onChange={() => handleChange("contractTier")("standard")}
                className="h-4 w-4 text-indigo-500 focus:ring-indigo-500"
              />
            </label>
            <label className="flex items-center justify-between gap-4 rounded-2xl bg-white/70 px-4 py-2 text-slate-700 transition hover:bg-indigo-50 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-indigo-500/10">
              <span>
                <span className="font-semibold">Premium</span> • SLA اختصاصی، مانیتورینگ 24/7، تحلیل فصلی
              </span>
              <input
                type="radio"
                name="tier"
                checked={form.contractTier === "premium"}
                onChange={() => handleChange("contractTier")("premium")}
                className="h-4 w-4 text-indigo-500 focus:ring-indigo-500"
              />
            </label>
          </fieldset>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-emerald-500 via-teal-500 to-sky-500 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 dark:focus:ring-emerald-500/70 dark:focus:ring-offset-slate-900"
          >
            ثبت مشتری
          </button>
        </form>

        <aside className="space-y-4 rounded-3xl border border-emerald-200/60 bg-emerald-50/60 p-6 text-sm shadow-sm dark:border-emerald-500/20 dark:bg-emerald-500/15">
          <h2 className="text-base font-semibold text-emerald-700 dark:text-emerald-100">چک لیست قبل از ثبت</h2>
          <ul className="space-y-3 text-xs leading-5 text-emerald-700/90 dark:text-emerald-100/80">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
              اطمینان از قرارداد امضا شده و ارسال نسخه PDF توسط مشتری.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
              بررسی اینکه نام مجموعه در سامانه حسابداری موجود و همگام‌سازی شده باشد.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
              در صورت انتخاب سطح Premium، مدیر حساب مرتبط را به تیکت خوش‌آمدگویی اضافه کنید.
            </li>
          </ul>

          <div className="rounded-2xl border border-white/50 bg-white/60 p-4 text-xs text-slate-700 dark:border-slate-800/30 dark:bg-slate-900/60 dark:text-slate-200">
            <p>
              پس از ثبت مشتری، تیم پشتیبانی به صورت خودکار یک تیکت خوش‌آمدگویی و معرفی فرایند‌ها را ارسال می‌کند. اطلاعات در بخش «گزارش مشتریان» نیز به‌روزرسانی خواهد شد.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
