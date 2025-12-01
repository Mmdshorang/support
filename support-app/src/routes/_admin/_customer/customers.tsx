import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Search, UserPlus, Edit2, Trash2, X } from "lucide-react";
import { customersApi, type Customer } from "../../../services/api/customers";
import { requireAdmin } from "../../../lib/auth-guard";
import SelectBox, { type Option } from "../../../components/common/SelectBox";

export const Route = createFileRoute("/_admin/_customer/customers")({
  component: CustomerListPage,
  beforeLoad: () => {
    requireAdmin();
  },
});

const statusMap = {
  active: {
    label: "فعال",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200",
    text: "text-emerald-600 dark:text-emerald-300",
  },
  warning: {
    label: "نیاز به تمدید",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200",
    text: "text-amber-600 dark:text-amber-300",
  },
  expired: {
    label: "منقضی شده",
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200",
    text: "text-rose-600 dark:text-rose-300",
  },
  unknown: {
    label: "نامشخص",
    badge: "bg-slate-100 text-slate-600 dark:bg-slate-800/70 dark:text-slate-200",
    text: "text-slate-500 dark:text-slate-300",
  },
} as const;

const formatPhoneNumber = (phone?: string | null) => {
  if (!phone) return "-";
  const digits = phone.replace(/[^\d+]/g, "");
  if (digits.length <= 4) return digits;
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
};

const formatRemainingDays = (customer: Customer) => {
  if (!customer.contract_end_date) return "تاریخ قرارداد ثبت نشده";
  const days = customer.contract_days_remaining ?? Math.ceil(
    (new Date(customer.contract_end_date).getTime() - Date.now()) / (24 * 60 * 60 * 1000)
  );
  if (days > 0) return `${days} روز باقی مانده`;
  if (days === 0) return "امروز به پایان می‌رسد";
  return `${Math.abs(days)} روز از پایان گذشته`;
};

const formatContractEndDate = (value?: string | null) => {
  if (!value) return "نامشخص";
  return new Date(value).toLocaleDateString("fa-IR");
};

const roleOptions: Option[] = [
  { value: "user", label: "کاربر" },
  { value: "admin", label: "مدیر" },
  { value: "support", label: "پشتیبان" },
];


function CustomerListPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);

  // Fetch customers from API
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setIsLoading(true);
        const response = await customersApi.getCustomers({
          page,
          limit: 10,
          search: searchQuery || undefined,
          sortBy: "created_at",
          sortOrder: "desc",
        });

        setCustomers(response.data);
        setTotalPages(response.pagination?.totalPages ?? 1);
      } catch (error) {
        console.error("Error fetching customers:", error);
        toast.error("خطا در دریافت لیست مشتریان");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, [page, searchQuery]);

  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این مشتری اطمینان دارید؟")) return;

    try {
      await customersApi.deleteCustomer(id);
      setCustomers((prev) => prev.filter((customer) => customer.id !== id));
      toast.success("مشتری با موفقیت حذف شد");
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast.error("خطا در حذف مشتری");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page on search
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setEditForm({
      name: customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      company: customer.company || "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editingCustomer) return;

    try {
      setIsSaving(true);
      await customersApi.updateCustomer(editingCustomer.id, editForm);
      toast.success("اطلاعات مشتری با موفقیت به‌روزرسانی شد");
      setEditingCustomer(null);
      
      // Refresh customers list
      const response = await customersApi.getCustomers({
        page,
        limit: 10,
        search: searchQuery || undefined,
        sortBy: "created_at",
        sortOrder: "desc",
      });
      setCustomers(response.data);
    } catch (error) {
      console.error("Error updating customer:", error);
      toast.error("خطا در به‌روزرسانی اطلاعات مشتری");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRoleChange = async (customerId: string, newRole: "user" | "admin" | "support") => {
    try {
      setUpdatingRole(customerId);
      await customersApi.updateCustomerUserRole(customerId, newRole);
      
      setCustomers((prev) =>
        prev.map((customer) =>
          customer.id === customerId ? { ...customer, user_role: newRole } : customer
        )
      );
      
      toast.success("نقش کاربر با موفقیت تغییر کرد");
    } catch (error: unknown) {
      console.error("Error updating user role:", error);
      toast.error("خطا در تغییر نقش کاربر");
    } finally {
      setUpdatingRole(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            لیست مشتریان
          </h1>
        </div>
        <a
          href="/customerRegistration"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700 hover:shadow-lg dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          <UserPlus className="h-5 w-5" />
          ثبت مشتری جدید
        </a>
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="جستجو بر اساس نام، ایمیل یا شرکت..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-10 pl-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:bg-slate-900"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-indigo-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            جستجو
          </button>
        </form>
      </div>

      {/* Customers Table */}
      <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="min-w-full border-separate border-spacing-y-3 text-sm">
            <thead>
              <tr className="text-right text-xs font-semibold text-slate-500 dark:text-slate-300">
                <th className="rounded-r-xl bg-slate-100/70 px-3 py-2 dark:bg-slate-800/70">
                  نام
                </th>
                <th className="bg-slate-100/70 px-3 py-2 dark:bg-slate-800/70">
                  شماره تماس
                </th>
                <th className="bg-slate-100/70 px-3 py-2 dark:bg-slate-800/70">
                  شرکت/مجموعه
                </th>
                <th className="bg-slate-100/70 px-3 py-2 dark:bg-slate-800/70">
                  نقش
                </th>
                <th className="bg-slate-100/70 px-3 py-2 dark:bg-slate-800/70">
                  تاریخ ثبت
                </th>
                <th className="bg-slate-100/70 px-3 py-2 dark:bg-slate-800/70">
                  وضعیت قرارداد
                </th>
                <th className="rounded-l-xl bg-slate-100/70 px-3 py-2 text-center dark:bg-slate-800/70">
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="rounded-3xl bg-white/80 py-8 text-center text-sm font-medium text-slate-400 dark:bg-slate-900/70 dark:text-slate-300"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
                      در حال بارگذاری...
                    </div>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="rounded-3xl bg-white/80 py-8 text-center text-sm font-medium text-slate-400 dark:bg-slate-900/70 dark:text-slate-300"
                  >
                    {searchQuery
                      ? "مشتری‌ای یافت نشد"
                      : "هنوز مشتری‌ای ثبت نشده است"}
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="rounded-3xl bg-white/80 text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-indigo-50 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:bg-slate-800/70"
                  >
                    <td className="rounded-r-3xl px-3 py-4 font-semibold">
                      {customer.name}
                    </td>
                    <td
                      className="px-3 py-4 text-sm font-mono text-slate-600 dark:text-slate-200 text-left"
                      dir="ltr"
                    >
                      {formatPhoneNumber(customer.phone)}
                    </td>
                    <td className="px-3 py-4 text-sm">
                      {customer.company || "-"}
                    </td>
                    <td className="px-3 py-4">
                      {customer.user_role ? (
                        <div className="flex items-center gap-2">
                          {updatingRole === customer.id ? (
                            <div className="flex items-center justify-center">
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
                            </div>
                          ) : (
                            <SelectBox
                              options={roleOptions}
                              value={roleOptions.find((opt) => opt.value === customer.user_role) || null}
                              onChange={(value) => {
                                const selectedRole = value as Option;
                                if (selectedRole && selectedRole.value !== customer.user_role) {
                                  handleRoleChange(customer.id, selectedRole.value as "user" | "admin" | "support");
                                }
                              }}
                              placeholder="انتخاب نقش"
                              searchable={false}
                              multiple={false}
                              creatable={false}
                            />
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-slate-500">بدون کاربر</span>
                      )}
                    </td>
                    <td className="px-3 py-4 text-xs text-slate-500 dark:text-slate-300">
                      {new Date(customer.created_at).toLocaleDateString(
                        "fa-IR"
                      )}
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex flex-col gap-1 text-xs">
                        <span
                          className={`inline-flex items-center justify-center rounded-full px-3 py-1 font-bold ${statusMap[customer.contract_status ?? "unknown"].badge
                            }`}
                        >
                          {statusMap[customer.contract_status ?? "unknown"].label}
                        </span>
                        <span
                          className={`font-semibold ${statusMap[customer.contract_status ?? "unknown"].text
                            }`}
                        >
                          {formatRemainingDays(customer)}
                        </span>
                        <span className="text-[11px] text-slate-400 dark:text-slate-400">
                          پایان: {formatContractEndDate(customer.contract_end_date)}
                        </span>
                      </div>
                    </td>
                    <td className="rounded-l-3xl px-3 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(customer)}
                          className="rounded-xl bg-indigo-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-600"
                          title="ویرایش"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(customer.id)}
                          className="rounded-xl bg-rose-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-600"
                          title="حذف"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between border-t border-slate-200/70 pt-4 dark:border-slate-800/60">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-300">
              صفحه {page} از {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                قبلی
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                بعدی
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-md w-full mx-4 shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                ویرایش اطلاعات مشتری
              </h2>
              <button
                onClick={() => setEditingCustomer(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  نام
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>

              {/* <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  ایمیل
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div> */}

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  شماره تماس
                </label>
                <input
                  type="tel"
                  dir="ltr"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  شرکت/مجموعه
                </label>
                <input
                  type="text"
                  value={editForm.company}
                  onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingCustomer(null)}
                className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition"
              >
                انصراف
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "در حال ذخیره..." : "ذخیره"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
