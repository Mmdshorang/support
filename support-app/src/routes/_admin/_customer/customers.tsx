import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Search, UserPlus, Edit2, Trash2 } from "lucide-react";
import { customersApi, type Customer } from "../../../services/api/customers";
import { requireAdmin } from "../../../lib/auth-guard";

export const Route = createFileRoute("/_admin/_customer/customers")({
  component: CustomerListPage,
  beforeLoad: () => {
    requireAdmin();
  },
});

function CustomerListPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
        }
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
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-3 text-sm">
            <thead>
              <tr className="text-right text-xs font-semibold text-slate-500 dark:text-slate-300">
                <th className="rounded-r-xl bg-slate-100/70 px-3 py-2 dark:bg-slate-800/70">
                  نام
                </th>
                <th className="bg-slate-100/70 px-3 py-2 dark:bg-slate-800/70">
                  تلفن
                </th>
                <th className="bg-slate-100/70 px-3 py-2 dark:bg-slate-800/70">
                  شرکت/مجموعه
                </th>
                <th className="bg-slate-100/70 px-3 py-2 dark:bg-slate-800/70">
                  تاریخ ثبت
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
                    colSpan={6}
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
                    colSpan={6}
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
                    <td className="px-3 py-4 text-sm font-mono text-slate-500 dark:text-slate-300">
                      {customer.phone || "-"}
                    </td>
                    <td className="px-3 py-4 text-sm">
                      {customer.company || "-"}
                    </td>
                    <td className="px-3 py-4 text-xs text-slate-500 dark:text-slate-300">
                      {new Date(customer.created_at).toLocaleDateString(
                        "fa-IR"
                      )}
                    </td>
                    <td className="rounded-l-3xl px-3 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() =>
                            alert("ویرایش مشتری - به زودی اضافه می‌شود")
                          }
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
    </div>
  );
}
