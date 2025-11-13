import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "@tanstack/react-router";
import SelectBox, { type Option } from "../../components/common/SelectBox";
import { ticketsApi } from "../../services/api/tickets";
import { categoriesApi } from "../../services/api/categories";

interface UserTicketForm {
  description: string;
  subject: string;
}

export default function UserSubmitTicketPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Option[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Option | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<UserTicketForm>({
    description: "",
    subject: "",
  });

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const response = await categoriesApi.getCategories();
        const categoryOptions: Option[] = response.data
          .filter(cat => cat.is_active)
          .map(cat => ({
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

  const handleChange = (field: keyof UserTicketForm) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedCategory) {
      toast.error("لطفا دسته‌بندی را انتخاب کنید");
      return;
    }

    try {
      setIsSubmitting(true);

      await ticketsApi.createTicket({
        subject: form.subject,
        description: form.description,
        category_id: selectedCategory.value,
        priority: "متوسط",
        channel: "وب",
      });

      toast.success("تیکت با موفقیت ثبت شد");

      // Reset form
      setForm({
        description: "",
        subject: "",
      });

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
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            عنوان تیکت
          </label>
          <input
            type="text"
            required
            value={form.subject}
            onChange={(e) =>
              handleChange("subject")(e.target.value)
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            placeholder="مثلاً: مشکل در ورود به سیستم"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            دسته‌بندی
          </label>
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
            disabled={isSubmitting}
            className="inline-flex w-[50%] items-center justify-center gap-3 rounded-2xl bg-gradient-to-l from-indigo-600 via-purple-600 to-rose-500 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
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
