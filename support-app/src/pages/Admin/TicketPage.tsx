import { useState } from "react";
import { type Option } from "../../components/common/SelectBox";

interface AdminTicketForm {
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

export default function AdminTicketPage() {
  // فرضاً این داده از سرور دریافت می‌شود
  const ticketData = {
    requesterName: "علی احمدی",
    requesterPhone: "09120000000",
    issue: ISSUE_OPTIONS[1],
    description: "کاربران نمی‌توانند وارد سیستم شوند.",
  };

  const [form, setForm] = useState<AdminTicketForm>({
    description: ticketData.description,
    solution: "",
    supportType: "remote",
    status: "open",
  });

  const handleChange = (field: keyof AdminTicketForm) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.table({
      ...form,
      requesterName: ticketData.requesterName,
      requesterPhone: ticketData.requesterPhone,
      issue: ticketData.issue.value,
    });
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          مدیریت تیکت پشتیبانی
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-300">
          ادمین می‌تواند جزئیات تیکت را بررسی کرده و پاسخ مناسب را ثبت کند.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70"
      >
        <div className="space-y-2">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            <strong>نام تماس‌گیرنده:</strong> {ticketData.requesterName}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            <strong>شماره تماس:</strong> {ticketData.requesterPhone}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            <strong>نوع مشکل:</strong> {ticketData.issue.label}
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            شرح مشکل
          </label>
          <textarea
            readOnly
            value={form.description}
            className="min-h-[100px] w-full rounded-2xl border border-slate-200 bg-slate-100 px-3 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            راه‌حل/اقدامات انجام‌شده
          </label>
          <textarea
            required
            value={form.solution}
            onChange={(e) => handleChange("solution")(e.target.value)}
            className="min-h-[80px] w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 shadow-sm transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            placeholder="راه‌حل را بنویسید..."
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <fieldset className="space-y-3 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 text-sm dark:border-slate-700/70 dark:bg-slate-800/40">
            <legend className="px-2 text-xs font-semibold text-slate-500 dark:text-slate-300">
              نوع پشتیبانی
            </legend>
            <label className="flex items-center justify-between gap-4 rounded-xl bg-white/70 px-3 py-2">
              <span>غیرحضوری (تلفن/سامانه)</span>
              <input
                type="radio"
                name="supportType"
                checked={form.supportType === "remote"}
                onChange={() => handleChange("supportType")("remote")}
              />
            </label>
            <label className="flex items-center justify-between gap-4 rounded-xl bg-white/70 px-3 py-2">
              <span>حضوری (اعزام کارشناس)</span>
              <input
                type="radio"
                name="supportType"
                checked={form.supportType === "inPerson"}
                onChange={() => handleChange("supportType")("inPerson")}
              />
            </label>
          </fieldset>

          <fieldset className="space-y-3 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 text-sm dark:border-slate-700/70 dark:bg-slate-800/40">
            <legend className="px-2 text-xs font-semibold text-slate-500 dark:text-slate-300">
              وضعیت تیکت
            </legend>
            <label className="flex items-center justify-between gap-4 rounded-xl bg-white/70 px-3 py-2">
              <span>باز و در انتظار پیگیری</span>
              <input
                type="radio"
                name="status"
                checked={form.status === "open"}
                onChange={() => handleChange("status")("open")}
              />
            </label>
            <label className="flex items-center justify-between gap-4 rounded-xl bg-white/70 px-3 py-2">
              <span>بسته و پایان‌یافته</span>
              <input
                type="radio"
                name="status"
                checked={form.status === "closed"}
                onChange={() => handleChange("status")("closed")}
              />
            </label>
          </fieldset>
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            className="inline-flex w-[50%] items-center justify-center gap-3 rounded-2xl bg-gradient-to-l from-indigo-600 via-purple-600 to-rose-500 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
          >
            ثبت تغییرات
          </button>
        </div>
      </form>
    </div>
  );
}
