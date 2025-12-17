import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Search, Shield } from "lucide-react";
import { usersApi, type User, type UserRole } from "../../services/api/users";
import SelectBox, { type Option } from "../../components/common/SelectBox";

const roleOptions: Option[] = [
  { value: "user", label: "کاربر" },
  { value: "admin", label: "مدیر" },
  { value: "support", label: "پشتیبان" },
];

const roleBadges: Record<UserRole, string> = {
  user: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200",
  admin: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-200",
  support: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-200",
};

const roleLabels: Record<UserRole, string> = {
  user: "کاربر",
  admin: "مدیر",
  support: "پشتیبان",
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await usersApi.getUsers({
          page,
          limit: 10,
          search: searchQuery || undefined,
          sortBy: "created_at",
          sortOrder: "desc",
        });

        setUsers(response.data);
        setTotalPages(response.pagination?.totalPages ?? 1);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("خطا در دریافت لیست کاربران");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [page, searchQuery]);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      setUpdatingRole(userId);
      await usersApi.updateUserRole(userId, newRole);
      
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
      
      toast.success("نقش کاربر با موفقیت تغییر کرد");
    } catch (error: any) {
      console.error("Error updating user role:", error);
      toast.error(
        error?.response?.data?.message || "خطا در تغییر نقش کاربر"
      );
    } finally {
      setUpdatingRole(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page on search
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          مدیریت کاربران
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-300">
          مشاهده و مدیریت نقش کاربران سیستم
        </p>
      </header>

      {/* Search */}
      <div className="rounded-2xl sm:rounded-3xl border border-slate-200/70 bg-white/80 p-4 sm:p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو بر اساس نام، نام کاربری یا ایمیل..."
              className="w-full pr-10 pl-4 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 shadow-sm transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition"
          >
            جستجو
          </button>
        </form>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl sm:rounded-3xl border border-slate-200/70 bg-white/80 p-4 sm:p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-3 text-sm">
            <thead>
              <tr className="text-right text-xs font-semibold text-slate-500 dark:text-slate-300">
                <th className="rounded-r-xl bg-slate-100/70 px-3 py-2 dark:bg-slate-800/70">
                  نام
                </th>
                <th className="bg-slate-100/70 px-3 py-2 dark:bg-slate-800/70">
                  نام کاربری
                </th>
                <th className="bg-slate-100/70 px-3 py-2 dark:bg-slate-800/70">
                  ایمیل
                </th>
                <th className="bg-slate-100/70 px-3 py-2 dark:bg-slate-800/70">
                  نقش
                </th>
                <th className="bg-slate-100/70 px-3 py-2 dark:bg-slate-800/70">
                  مشتری
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
                    colSpan={7}
                    className="rounded-3xl bg-white/80 py-8 text-center text-sm font-medium text-slate-400 dark:bg-slate-900/70 dark:text-slate-300"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
                      در حال بارگذاری...
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="rounded-3xl bg-white/80 py-8 text-center text-sm font-medium text-slate-400 dark:bg-slate-900/70 dark:text-slate-300"
                  >
                    کاربری یافت نشد
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="rounded-3xl bg-white/80 text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-indigo-50 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:bg-slate-800/70"
                  >
                    <td className="rounded-r-3xl px-3 py-4">
                      <div className="space-y-1">
                        <p className="font-semibold text-slate-800 dark:text-white">
                          {user.name}
                        </p>
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <p className="text-xs font-mono text-slate-500 dark:text-slate-300">
                        {user.username}
                      </p>
                    </td>
                    <td className="px-3 py-4">
                      <p className="text-xs text-slate-500 dark:text-slate-300">
                        {user.email || "نامشخص"}
                      </p>
                    </td>
                    <td className="px-3 py-4">
                      <span
                        className={`inline-flex items-center gap-2 rounded-2xl px-3 py-1 text-xs font-semibold ${
                          roleBadges[user.role]
                        }`}
                      >
                        <Shield className="h-3 w-3" />
                        {roleLabels[user.role]}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <p className="text-xs text-slate-500 dark:text-slate-300">
                        {user.customer_name || "-"}
                      </p>
                    </td>
                    <td className="px-3 py-4 text-xs font-medium text-slate-500 dark:text-slate-300">
                      {new Date(user.created_at).toLocaleDateString("fa-IR")}
                    </td>
                    <td className="rounded-l-3xl px-3 py-4 text-center">
                      {updatingRole === user.id ? (
                        <div className="flex items-center justify-center">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
                        </div>
                      ) : (
                        <div className="flex justify-center">
                          <SelectBox
                            options={roleOptions}
                            value={roleOptions.find((opt) => opt.value === user.role) || null}
                            onChange={(value) => {
                              const selectedRole = value as Option;
                              if (selectedRole && selectedRole.value !== user.role) {
                                handleRoleChange(user.id, selectedRole.value as UserRole);
                              }
                            }}
                            placeholder="انتخاب نقش"
                            searchable={false}
                            multiple={false}
                            creatable={false}
                          />
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-500 dark:text-slate-300">
              صفحه {page} از {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                قبلی
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
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

