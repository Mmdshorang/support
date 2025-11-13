import { useState } from "react";
import SelectBox, { type Option } from "../../components/common/SelectBox";

interface UserTicketForm {
  requesterName: string;
  requesterPhone: string;
  description: string;
}

const ISSUE_OPTIONS: Option[] = [
  { value: "connection", label: "عدم اتصال به سرور" },
  { value: "login", label: "مشکل ورود کاربران" },
  { value: "reporting", label: "مشکل گزارش‌گیری" },
  { value: "other", label: "سایر موارد" },
];

export default function UserSubmitTicketPage() {
  const [issue, setIssue] = useState<Option | null>(ISSUE_OPTIONS[0]);
  const [form, setForm] = useState<UserTicketForm>({
    requesterName: "",
    requesterPhone: "",
    description: "",
  });

  const handleChange = (field: keyof UserTicketForm) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

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
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          ثبت تیکت پشتیبانی
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-300">
          لطفاً اطلاعات مورد نیاز را وارد کنید تا تیم پشتیبانی بررسی کند.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm transition dark:border-slate-800/60 dark:bg-slate-900/70"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              نام تماس‌گیرنده
            </label>
            <input
              type="text"
              required
              value={form.requesterName}
              onChange={(e) =>
                handleChange("requesterName")(e.target.value)
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              placeholder="مثلاً علی احمدی"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              شماره تماس
            </label>
            <input
              type="tel"
              required
              dir="ltr"
              value={form.requesterPhone}
              onChange={(e) =>
                handleChange("requesterPhone")(e.target.value)
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              placeholder="09120000000"
            />
          </div>
        </div>

        <div className="space-y-2 flex gap-3">
          <label className="text-sm mt-2 font-medium text-slate-700 dark:text-slate-200">
            نوع مشکل
          </label>
          <SelectBox
            options={ISSUE_OPTIONS}
            value={issue}
            onChange={(value: Option) => setIssue(value as Option)}
            placeholder="یک مورد انتخاب کنید"
            searchable
            multiple={false}
            creatable
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            شرح مشکل
          </label>
          <textarea
            required
            minLength={10}
            value={form.description}
            onChange={(e) =>
              handleChange("description")(e.target.value)
            }
            className="min-h-[110px] w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 shadow-sm transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            placeholder="به صورت خلاصه توضیح دهید چه اتفاقی رخ داده است..."
          />
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            className="inline-flex w-[50%] items-center justify-center gap-3 rounded-2xl bg-gradient-to-l from-indigo-600 via-purple-600 to-rose-500 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
          >
            ارسال تیکت
          </button>
        </div>
      </form>
    </div>
  );
}
