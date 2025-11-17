import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  Search,
  MessageSquare,
  AlertTriangle,
  Clock3,
  CheckCircle2,
} from "lucide-react";

import { ticketsApi, type Ticket } from "../../services/api/tickets";

const PAGE_SIZE = 10;

const STATUS_STYLES = {
  "در انتظار":
    "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200",
  "در حال پیگیری":
    "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200",
  "پاسخ داده شده":
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200",
  "بسته شده":
    "bg-slate-200 text-slate-700 dark:bg-slate-700/60 dark:text-slate-100",
};

const TYPE_SUPPORT = {
  inPerson: "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200",
  remote:
    "bg-slate-200 text-slate-700 dark:bg-slate-700/60 dark:text-slate-100",
};


export default function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const [stats, setStats] = useState({
    openTickets: 0,
    closedTickets: 0,
  });

  // Fetch tickets
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setIsLoading(true);
        const response = await ticketsApi.getTickets({
          page,
          limit: PAGE_SIZE,
          sortBy: "updated_at",
          sortOrder: "desc",
        });

        setTickets(response.data);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
        }
      } catch {
        toast.error("خطا در دریافت تیکت‌ها");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTickets();
  }, [page]);

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await ticketsApi.getStats();
        const statsData = response.data;

        setStats({
          openTickets:
            statsData.by_status.pending +
            statsData.by_status.in_progress +
            statsData.by_status.answered,
          closedTickets: statsData.by_status.closed,
        });
      } catch {
        /* empty */
      }
    };
    fetchStats();
  }, []);

  const filteredTickets = useMemo(() => {
    if (!searchQuery.trim()) return tickets;

    const query = searchQuery.toLowerCase();
    return tickets.filter(
      (t) =>
        t.subject.toLowerCase().includes(query) ||
        t.id.toString().includes(query)
    );
  }, [tickets, searchQuery]);

  const STATS = [
    {
      title: "تیکت‌های باز",
      value: stats.openTickets.toString(),
      diff: "تیکت‌های فعال",
      icon: MessageSquare,
      variant:
        "bg-indigo-500/10 text-indigo-600 dark:text-indigo-200 dark:bg-indigo-500/20",
    },
    {
      title: "بسته شده",
      value: stats.closedTickets.toString(),
      diff: "تکمیل شده",
      icon: CheckCircle2,
      variant:
        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-200 dark:bg-emerald-500/20",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          خانه
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
          مرور سریع وضعیت تیکت‌ها و عملکرد تیم‌ها
        </p>
      </div>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {stat.title}
                  </p>
                  <h3 className="mt-2 text-2xl font-bold">{stat.value}</h3>
                  <p className="mt-3 text-xs text-slate-500">{stat.diff}</p>
                </div>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full ${stat.variant}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Main Table */}
      <section className="space-y-4 rounded-3xl border border-slate-200/70 bg-white/80 p-6 dark:border-slate-800/60 dark:bg-slate-900/70">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <h2 className="text-lg font-semibold">جدول تیکت ها</h2>

          <div className="relative w-full sm:w-auto">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              placeholder="جستجو در تیکت‌ها..."
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-10 pl-4 text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-200 sm:w-80"
            />
          </div>
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="text-center py-10">
            <div className="inline-block h-8 w-8 rounded-full border-4 border-indigo-500 border-r-transparent animate-spin"></div>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="py-10 text-center text-slate-500">
            <MessageSquare className="mx-auto h-12 w-12 text-slate-400" />
            <p className="mt-3">تیکتی یافت نشد</p>
          </div>
        ) : (
          <>
            <table className="min-w-full table-fixed border-separate border-spacing-y-3 text-sm">
              <thead>
                <tr className="text-right text-xs font-semibold text-slate-500">
                  <th className="rounded-r-xl bg-slate-100 px-3 py-2">تیکت</th>
                  <th className="bg-slate-100 px-3 py-2">مشتری</th>
                  <th className="bg-slate-100 px-3 py-2">شماره تماس</th>
                  <th className="bg-slate-100 px-3 py-2">مشکل</th>
                  <th className="bg-slate-100 px-3 py-2">نوع پشتیبانی</th>
                  <th className="bg-slate-100 px-3 py-2">راه‌حل</th>
                  <th className="bg-slate-100 px-3 py-2">وضعیت</th>

                  <th className="rounded-l-xl bg-slate-100 px-3 py-2">
                    تاریخ ثبت
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="rounded-2xl cursor-pointer bg-white hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-slate-700"
                  >
                    <td className="px-3 py-4 rounded-r-2xl">
                      <p className="font-semibold">#{ticket.id}</p>
                    </td>

                    <td className="px-3 py-4">
                      <p className="font-medium">
                        {ticket.customer || "نامشخص"}
                      </p>
                    </td>
                    <td className="px-3 py-4">
                      <p className="font-medium">
                        {ticket.phone || "نامشخص"}
                      </p>
                    </td>
                    <td className="px-1 py-4">
                      <p className="text-sm">{ticket.subject}</p>
                    </td>

                    <td className="px-1 py-4">
                      <span
                        className={`px-3 py-1 text-xs rounded-xl font-semibold ${
                          TYPE_SUPPORT[ticket.typeSupport]
                        }`}
                      >
                        {ticket.typeSupport || "نامشخص"}
                      </span>
                    </td>
                    <td className="px-1 py-4">
                      <p className="text-sm">{ticket.solution || "بدون جواب"}</p>
                    </td>
                    <td className="px-3 py-4">
                      <span
                        className={`px-3 py-1 text-xs rounded-xl font-semibold ${
                          STATUS_STYLES[ticket.status]
                        }`}
                      >
                        {ticket.status}
                      </span>
                    </td>

                    <td className="px-3 py-4 rounded-l-2xl text-xs">
                      {new Date(ticket.created_at).toLocaleDateString("fa-IR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <Pagination
                page={page}
                pageCount={totalPages}
                onChange={setPage}
              />
            )}
          </>
        )}
      </section>
    </div>
  );
}

function Pagination({ page, pageCount, onChange }) {
  const pages = useMemo(
    () => Array.from({ length: pageCount }, (_, i) => i + 1),
    [pageCount]
  );

  return (
    <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
      <span className="text-xs text-slate-500">
        صفحه {page} از {pageCount}
      </span>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="px-3 py-2 text-xs rounded-xl border bg-white dark:bg-slate-800 disabled:opacity-40"
        >
          قبلی
        </button>

        <div className="flex gap-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-xl">
          {pages.map((num) => (
            <button
              key={num}
              onClick={() => onChange(num)}
              className={`px-3 py-1 rounded-lg text-xs ${
                num === page
                  ? "bg-white dark:bg-slate-900 shadow text-indigo-600"
                  : "text-slate-600 dark:text-slate-300 hover:bg-white/70"
              }`}
            >
              {num}
            </button>
          ))}
        </div>

        <button
          onClick={() => onChange(page + 1)}
          disabled={page === pageCount}
          className="px-3 py-2 text-xs rounded-xl border bg-white dark:bg-slate-800 disabled:opacity-40"
        >
          بعدی
        </button>
      </div>
    </div>
  );
}
