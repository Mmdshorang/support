import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import SelectBox, { type Option } from "../../components/common/SelectBox";
import { ticketsApi } from "../../services/api/tickets";
import { categoriesApi } from "../../services/api/categories";
import { customersApi } from "../../services/api/customers";
import { userAtom } from "../../stores/auth";

interface UserTicketForm {
  description: string;
}

export default function UserSubmitTicketPage() {
  const navigate = useNavigate();
  const user = useAtomValue(userAtom);
  const isRegularUser = user?.role === "user";
  const isStaffUser = user?.role === "admin" || user?.role === "support";
  const [categories, setCategories] = useState<Option[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Option | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<UserTicketForm>({
    description: "",
  });
  const [customerOptions, setCustomerOptions] = useState<Option[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Option | null>(null);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const response = await categoriesApi.getCategories();
        const categoryOptions: Option[] = response.data
          .filter((cat) => cat.is_active)
          .map((cat) => ({
            value: cat.id,
            label: cat.name,
          }));
        setCategories(categoryOptions);
        if (categoryOptions.length > 0) {
          setSelectedCategory(categoryOptions[0]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("خطا در دریافت دسته‌بندی‌ها");
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch customers for admin/support users
  useEffect(() => {
    if (!isStaffUser) return;

    let isMounted = true;

    const fetchCustomers = async () => {
      try {
        setIsLoadingCustomers(true);
        const response = await customersApi.getCustomers({
          limit: 200,
          sortBy: "name",
          sortOrder: "asc",
        });
        if (!isMounted) return;
        const options = response.data.map((customer) => ({
          value: customer.id,
          label: `${customer.name}${
            customer.phone ? ` - ${customer.phone}` : ""
          }`,
        }));
        setCustomerOptions(options);
      } catch (error) {
        if (isMounted) {
          console.error("Error fetching customers:", error);
          toast.error("خطا در دریافت لیست مشتریان");
        }
      } finally {
        if (isMounted) {
          setIsLoadingCustomers(false);
        }
      }
    };

    fetchCustomers();

    return () => {
      isMounted = false;
    };
  }, [isStaffUser]);

  const handleDescriptionChange = (value: string) =>
    setForm((prev) => ({ ...prev, description: value }));

  const buildSubject = () => {
    const base =
      (isStaffUser && selectedCustomer?.label) ||
      user?.name ||
      user?.username ||
      "تیکت جدید";
    return selectedCategory ? `${selectedCategory.label} - ${base}` : base;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      toast.error("ابتدا وارد حساب کاربری خود شوید");
      return;
    }

    if (!selectedCategory) {
      toast.error("لطفا دسته‌بندی را انتخاب کنید");
      return;
    }

    if (isStaffUser && !selectedCustomer) {
      toast.error("لطفاً یک مشتری را انتخاب کنید");
      return;
    }

    if (!form.description.trim()) {
      toast.error("شرح مشکل نمی‌تواند خالی باشد");
      return;
    }

    try {
      setIsSubmitting(true);

      await ticketsApi.createTicket({
        subject: buildSubject(),
        description: form.description,
        category_id: selectedCategory.value,
        customer_id: isStaffUser ? selectedCustomer?.value : undefined,
      });

      toast.success("تیکت با موفقیت ثبت شد");

      // Reset form
      setForm({
        description: "",
      });
      if (isStaffUser) {
        setSelectedCustomer(null);
      }

      // Navigate to dashboard after 1 second
      setTimeout(() => {
        navigate({ to: "/dashboard" });
      }, 1000);
    } catch (error) {
      console.error("Error creating ticket:", error);
      toast.error("خطا در ثبت تیکت");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          ثبت مشکل
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-300">
          لطفاً اطلاعات مورد نیاز را وارد کنید تا تیم پشتیبانی بررسی کند.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-3xl border border-slate-200/80 bg-white/100 p-6 shadow-sm transition dark:border-slate-800/60 dark:bg-slate-900/70"
      >
        <div className="flex gap-5">
          {isStaffUser && (
            <div className="flex gap-3 space-y-2">
              <label className="text-sm font-medium mt-2 text-slate-700 dark:text-slate-200">
                انتخاب مشتری :
              </label>
              {isLoadingCustomers ? (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
                  در حال بارگذاری لیست مشتریان...
                </div>
              ) : (
                <SelectBox
                  options={customerOptions}
                  value={selectedCustomer}
                  onChange={(value) => setSelectedCustomer(value as Option)}
                  placeholder="یک مشتری انتخاب کنید"
                  searchable
                  multiple={false}
                  creatable={false}
                />
              )}
            </div>
          )}

          {isRegularUser && user && (
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-200">
              اطلاعات پروفایل شما ({user.name || user.username || "کاربر"}{" "}
              {user.phone ? `- ${user.phone}` : ""}) به صورت خودکار به تیکت
              اضافه می‌شود.
            </div>
          )}

          <div className="flex gap-3 space-y-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200 mt-2">
              دسته‌بندی مشکل :
            </span>
            {isLoadingCategories ? (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
                در حال بارگذاری دسته‌بندی‌ها...
              </div>
            ) : (
              <SelectBox
                options={categories}
                value={selectedCategory}
                onChange={(value) => setSelectedCategory(value as Option)}
                placeholder="یک دسته انتخاب کنید"
                searchable
                multiple={false}
                creatable={false}
              />
            )}
          </div>
        </div>

        <div className="lg:flex  gap-3 space-y-2">
          <label className="w-[9%] text-sm font-medium text-slate-700 dark:text-slate-200">
            شرح مشکل :
          </label>
          <textarea
            required
            minLength={10}
            value={form.description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            className="min-h-[110px] w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 shadow-sm transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            placeholder="به صورت خلاصه توضیح دهید چه اتفاقی رخ داده است..."
          />
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-[50%] items-center justify-center gap-3 rounded-2xl bg-indigo-600  px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                در حال ارسال...
              </>
            ) : (
              "ارسال تیکت"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
