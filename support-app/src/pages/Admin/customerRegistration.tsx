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
  const [showCredentials, setShowCredentials] = useState(false);
  const [userCredentials, setUserCredentials] = useState<{username: string, password: string} | null>(null);

  const handleChange = (field: keyof FormState) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);

      const response = await customersApi.createCustomer({
        name: form.customerName.trim(),
        email: `${form.companyName
          .toLowerCase()
          .replace(/\s+/g, "")}@customer.com`,
        phone: form.customerNumber,
        company: form.companyName,
      });

      toast.success("مشتری با موفقیت ثبت شد");

      // Show credentials if available
      if (response.data.userCredentials) {
        setUserCredentials(response.data.userCredentials);
        setShowCredentials(true);
      } else {
        // Reset form and navigate if no credentials to show
        setForm({
          customerName: "",
          customerNumber: "",
          companyName: "",
          contractFrom: "",
          contractTo: "",
          contractTier: "standard",
        });

        setTimeout(() => {
          navigate({ to: "/dashboard" });
        }, 1000);
      }
    } catch (error) {
      console.error("Error creating customer:", error);
      toast.error("خطا در ثبت مشتری");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle closing credentials modal
  const handleCloseCredentials = () => {
    setShowCredentials(false);
    setUserCredentials(null);

    // Reset form
    setForm({
      customerName: "",
      customerNumber: "",
      companyName: "",
      contractFrom: "",
      contractTo: "",
      contractTier: "standard",
    });

    // Navigate to dashboard
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="space-y-8">
      {/* Credentials Modal */}
      {showCredentials && userCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl border border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              اطلاعات ورود مشتری
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              لطفاً این اطلاعات را به مشتری تحویل دهید:
            </p>

            <div className="space-y-4 bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 mb-6">
              <div>
                <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  نام کاربری
                </label>
                <p className="text-lg font-bold text-slate-900 dark:text-white mt-1 font-mono">
                  {userCredentials.username}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  رمز عبور
                </label>
                <p className="text-lg font-bold text-slate-900 dark:text-white mt-1 font-mono">
                  {userCredentials.password}
                </p>
              </div>
            </div>

            <button
              onClick={handleCloseCredentials}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition"
            >
              متوجه شدم
            </button>
          </div>
        </div>
      )}

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
