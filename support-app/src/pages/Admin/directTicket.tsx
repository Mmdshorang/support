import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "@tanstack/react-router";
import SelectBox, { type Option } from "../../components/common/SelectBox";
import { ticketsApi } from "../../services/api/tickets";
import { customersApi } from "../../services/api/customers";

interface DirectTicketForm {
  customerId: string;
  problem: string;
  solution: string;
}

export default function DirectTicketPage() {
  const navigate = useNavigate();
  const [customerOptions, setCustomerOptions] = useState<Option[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Option | null>(null);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<DirectTicketForm>({
    customerId: "",
    problem: "",
    solution: "",
  });

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setIsLoadingCustomers(true);
        const response = await customersApi.getCustomers({
          limit: 200,
          sortBy: "name",
          sortOrder: "asc",
        });
        const options = response.data.map((customer) => ({
          value: customer.id,
          label: `${customer.name}${customer.phone ? ` - ${customer.phone}` : ""}`,
        }));
        setCustomerOptions(options);
      } catch (error) {
        console.error("Error fetching customers:", error);
        toast.error("خطا در دریافت لیست مشتریان");
      } finally {
        setIsLoadingCustomers(false);
      }
    };

    fetchCustomers();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedCustomer) {
      toast.error("لطفاً یک مشتری را انتخاب کنید");
      return;
    }

    if (!form.problem.trim()) {
      toast.error("لطفاً مشکل را وارد کنید");
      return;
    }

    if (!form.solution.trim()) {
      toast.error("لطفاً راه حل را وارد کنید");
      return;
    }

    try {
      setIsSubmitting(true);

      // Create ticket
      const createResponse = await ticketsApi.createTicket({
        subject: `تیکت مستقیم - ${selectedCustomer.label}`,
        description: form.problem,
        customer_id: selectedCustomer.value,
        support_type: "remote",
      });

      // Update ticket to closed status with solution
      if (createResponse.data && createResponse.data.id) {
        await ticketsApi.updateTicket(createResponse.data.id, {
          status: "بسته شده",
          solution: form.solution,
        });
      }

      toast.success("تیکت با موفقیت ثبت و بسته شد");

      // Reset form
      setForm({
        customerId: "",
        problem: "",
        solution: "",
      });
      setSelectedCustomer(null);

      // Navigate to status tickets page after 1 second
      setTimeout(() => {
        navigate({ to: "/statusTicket" });
      }, 1000);
    } catch (error) {
      console.error("Error creating direct ticket:", error);
      toast.error("خطا در ثبت تیکت");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <header className="space-y-2">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          ثبت تیکت مستقیم
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-300">
          ثبت تیکت بسته شده با مشتری، مشکل و راه حل
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 sm:space-y-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white/100 p-4 sm:p-6 shadow-sm transition dark:border-slate-800/60 dark:bg-slate-900/70"
      >
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200 w-full sm:w-auto min-w-[120px]">
              انتخاب مشتری:
            </label>
            {isLoadingCustomers ? (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
                در حال بارگذاری لیست مشتریان...
              </div>
            ) : (
              <div className="flex-1">
                <SelectBox
                  options={customerOptions}
                  value={selectedCustomer}
                  onChange={(value) => setSelectedCustomer(value as Option)}
                  placeholder="یک مشتری انتخاب کنید"
                  searchable
                  multiple={false}
                  creatable={false}
                />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              مشکل:
            </label>
            <textarea
              required
              minLength={10}
              value={form.problem}
              onChange={(e) => setForm({ ...form, problem: e.target.value })}
              className="min-h-[100px] sm:min-h-[120px] w-full rounded-xl sm:rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 shadow-sm transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              placeholder="مشکل را به صورت کامل توضیح دهید..."
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              راه حل:
            </label>
            <textarea
              required
              minLength={10}
              value={form.solution}
              onChange={(e) => setForm({ ...form, solution: e.target.value })}
              className="min-h-[100px] sm:min-h-[120px] w-full rounded-xl sm:rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 shadow-sm transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              placeholder="راه حل را به صورت کامل توضیح دهید..."
            />
          </div>
        </div>

        <div className="flex justify-center pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full sm:w-[50%] items-center justify-center gap-3 rounded-xl sm:rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                در حال ثبت...
              </>
            ) : (
              "ثبت تیکت بسته شده"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

