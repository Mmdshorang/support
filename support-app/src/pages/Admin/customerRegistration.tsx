import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "@tanstack/react-router";
import JalaliDatePicker from "../../components/common/DatePicker";
import { customersApi } from "../../services/api/customers";

interface FormState {
  customerName: string;
  customerNumber: string;
  companyName: string;
  contractFrom: string;
  contractTo: string;
  contractTier: "basic" | "standard" | "premium";
}

export default function CustomerRegistrationForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({
    customerName: "",
    customerNumber: "",
    companyName: "",
    contractFrom: "",
    contractTo: "",
    contractTier: "standard",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof FormState) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);

      await customersApi.createCustomer({
        name: form.customerName.trim(),
        email: `${form.companyName
          .toLowerCase()
          .replace(/\s+/g, "")}@customer.com`,
        phone: form.customerNumber,
        company: form.companyName,
      });

      toast.success("مشتری با موفقیت ثبت شد");

      // Reset form
      setForm({
        customerName: "",
        customerNumber: "",
        companyName: "",
        contractFrom: "",
        contractTo: "",
        contractTier: "standard",
      });

      // Navigate back to dashboard or customers list after 1 second
      setTimeout(() => {
        navigate({ to: "/dashboard" });
      }, 1000);
    } catch (error) {
      console.error("Error creating customer:", error);
      toast.error("خطا در ثبت مشتری");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          ثبت مشتری جدید
        </h1>
      </header>

      <div className="grid gap-6 lg:grid-cols-1">
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm transition dark:border-slate-800/60 dark:bg-slate-900/70"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-200">
                نام مشتری
              </label>
              <input
                required
                value={form.customerName}
                onChange={(event) =>
                  handleChange("customerName")(event.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/40"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-200">
                شماره تماس
              </label>
              <input
                required
                dir="ltr"
                value={form.customerNumber}
                onChange={(event) =>
                  handleChange("customerNumber")(event.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/40"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-200">
              نام مجموعه/برند
            </label>
            <input
              required
              value={form.companyName}
              onChange={(event) =>
                handleChange("companyName")(event.target.value)
              }
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/40"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex gap-2 space-y-2 text-xs text-slate-500 dark:text-slate-300">
              <span className="font-semibold mt-2">تاریخ شروع قرارداد</span>
              <JalaliDatePicker
                value={form.contractFrom}
                onChange={(value) => handleChange("contractFrom")(value ?? "")}
              />
            </div>
            <div className="flex gap-2 space-y-2 text-xs text-slate-500 dark:text-slate-300">
              <span className="font-semibold mt-2">تاریخ پایان قرارداد</span>
              <JalaliDatePicker
                value={form.contractTo}
                onChange={(value) => handleChange("contractTo")(value ?? "")}
              />
            </div>
          </div>
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-[50%] items-center justify-center gap-2 rounded-2xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-emerald-500/70 dark:focus:ring-offset-slate-900"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  در حال ثبت...
                </>
              ) : (
                "ثبت مشتری"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
