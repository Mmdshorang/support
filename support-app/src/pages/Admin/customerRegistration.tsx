import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "@tanstack/react-router";
import moment from "jalali-moment";
import JalaliDatePicker from "../../components/common/DatePicker";
import SelectBox, { type Option } from "../../components/common/SelectBox";
import { customersApi, type Customer } from "../../services/api/customers";

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
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerOptions, setCustomerOptions] = useState<Option[]>([]);
  const [customerResults, setCustomerResults] = useState<Customer[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [selectedExistingCustomer, setSelectedExistingCustomer] =
    useState<Option | null>(null);
  const [showCredentials, setShowCredentials] = useState(false);
  const [userCredentials, setUserCredentials] = useState<{ username: string, password: string } | null>(null);

  const handleChange = (field: keyof FormState) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    let isActive = true;
    const fetchCustomers = async () => {
      try {
        setIsLoadingCustomers(true);
        const response = await customersApi.getCustomers({
          search: customerSearch || undefined,
          limit: 10,
        });
        if (!isActive) return;
        setCustomerResults(response.data);
        setCustomerOptions(
          response.data.map((customer) => ({
            value: customer.id,
            label: `${customer.name}${customer.phone ? ` - ${customer.phone}` : ""
              }`,
          }))
        );
      } catch (error) {
        if (isActive) {
          console.error("Error fetching customers:", error);
          toast.error("خطا در دریافت لیست مشتریان");
        }
      } finally {
        if (isActive) {
          setIsLoadingCustomers(false);
        }
      }
    };

    const timeoutId = setTimeout(() => {
      fetchCustomers();
    }, 300);

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
    };
  }, [customerSearch]);

  const handleSelectExistingCustomer = (option: Option | null) => {
    setSelectedExistingCustomer(option);
    if (!option) return;
    const customer = customerResults.find((c) => c.id === option.value);
    if (!customer) return;

    setForm((prev) => ({
      ...prev,
      customerName: customer.name || prev.customerName,
      customerNumber: customer.phone || prev.customerNumber,
      companyName: customer.company || prev.companyName,
      contractFrom: customer.contract_start_date
        ? moment(customer.contract_start_date).locale("fa").format("jYYYY/jMM/jDD")
        : prev.contractFrom,
      contractTo: customer.contract_end_date
        ? moment(customer.contract_end_date).locale("fa").format("jYYYY/jMM/jDD")
        : prev.contractTo,
      contractTier: (customer.contract_tier as FormState["contractTier"]) || prev.contractTier,
    }));

    toast.info("مشخصات مشتری موجود بارگذاری شد");
  };

  const jalaliToISODate = (value: string) => {
    if (!value) return null;
    const date = moment(value, "jYYYY/jMM/jDD").locale("fa");
    if (!date.isValid()) {
      return null;
    }
    return date.locale("en").format("YYYY-MM-DD");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);

      const contractStartISO = jalaliToISODate(form.contractFrom);
      const contractEndISO = jalaliToISODate(form.contractTo);

      if (!contractStartISO || !contractEndISO) {
        toast.error("لطفاً تاریخ شروع و پایان قرارداد را به درستی انتخاب کنید");
        setIsSubmitting(false);
        return;
      }

      if (new Date(contractEndISO) < new Date(contractStartISO)) {
        toast.error("تاریخ پایان قرارداد باید بعد از تاریخ شروع باشد");
        setIsSubmitting(false);
        return;
      }

      const response = await customersApi.createCustomer({
        name: form.customerName.trim(),
        email: `${form.companyName
          .toLowerCase()
          .replace(/\s+/g, "")}@customer.com`,
        phone: form.customerNumber,
        company: form.companyName,
        contract_start_date: contractStartISO,
        contract_end_date: contractEndISO,
        contract_tier: form.contractTier,
      });

      toast.success(response.message || "مشتری با موفقیت ثبت شد");

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

      <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-100">
              جستجوی مشتری‌های ثبت‌شده
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              برای جلوگیری از ثبت تکراری، ابتدا نام یا شماره مشتری را جستجو کنید.
            </p>
          </div>
          <div className="flex flex-col gap-2 md:w-2/3">
            <input
              type="search"
              value={customerSearch}
              onChange={(event) => setCustomerSearch(event.target.value)}
              placeholder="مثلاً: علی احمدی یا 0912..."
              className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/40"
            />
            <SelectBox
              options={customerOptions}
              value={selectedExistingCustomer}
              onChange={(value) => handleSelectExistingCustomer(value as Option | null)}
              placeholder={
                isLoadingCustomers
                  ? "در حال بارگذاری..."
                  : customerOptions.length
                    ? "یک مشتری موجود را انتخاب کنید"
                    : "مشتری یافت نشد"
              }
              searchable={false}
              multiple={false}
              creatable={false}
              disabled={isLoadingCustomers || customerOptions.length === 0}
            />
            {selectedExistingCustomer && (
              <button
                type="button"
                onClick={() => handleSelectExistingCustomer(null)}
                className="self-start text-xs font-semibold text-indigo-600 hover:text-indigo-500"
              >
                حذف انتخاب و ثبت مشتری جدید
              </button>
            )}
          </div>
        </div>
      </div>

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
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-200">
              پلن قرارداد
            </label>
            <select
              value={form.contractTier}
              onChange={(event) => handleChange("contractTier")(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/40"
            >
              <option value="basic">پایه</option>
              <option value="standard">استاندارد</option>
              <option value="premium">پریمیوم</option>
            </select>
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
