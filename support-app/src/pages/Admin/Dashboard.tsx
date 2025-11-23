import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "react-toastify";
import { Search, MessageSquare, CheckCircle2 } from "lucide-react";

import {
  ticketsApi,
  type Ticket,
  type TicketMessage,
  type SupportType,
  type TicketStatus,
} from "../../services/api/tickets";

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

const SUPPORT_BADGES: Record<SupportType, string> = {
  inPerson: "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200",
  remote:
    "bg-slate-200 text-slate-700 dark:bg-slate-700/60 dark:text-slate-100",
};

const SUPPORT_LABELS: Record<SupportType, string> = {
  inPerson: "حضوری",
  remote: "غیرحضوری",
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

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [detailMessages, setDetailMessages] = useState<TicketMessage[]>([]);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isSavingChanges, setIsSavingChanges] = useState(false);
  const [detailForm, setDetailForm] = useState<{
    status: TicketStatus;
    supportType: SupportType;
    solution: string;
  }>({
    status: "در انتظار",
    supportType: "remote",
    solution: "",
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

  const loadTicketMessages = useCallback(async (ticketId: number) => {
    try {
      setIsDetailLoading(true);
      const response = await ticketsApi.getMessages(ticketId);
      setDetailMessages(response.data);
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === ticketId ? { ...ticket, admin_unread_count: 0 } : ticket
        )
      );
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("خطا در دریافت پیام‌های تیکت");
    } finally {
      setIsDetailLoading(false);
    }
  }, []);

  const handleSelectTicket = useCallback(
    async (ticket: Ticket) => {
      setSelectedTicket(ticket);
      setDetailForm({
        status: ticket.status,
        supportType: ticket.support_type === "inPerson" ? "inPerson" : "remote",
        solution: ticket.solution || "",
      });
      setDetailMessages([]);
      await loadTicketMessages(ticket.id);
    },
    [loadTicketMessages]
  );

  const handleCloseDetail = () => {
    setSelectedTicket(null);
    setDetailMessages([]);
  };

  const handleSaveChanges = async () => {
    if (!selectedTicket) return;
    try {
      setIsSavingChanges(true);
      await ticketsApi.updateTicket(selectedTicket.id, {
        status: detailForm.status,
        support_type: detailForm.supportType,
        solution: detailForm.solution,
      });

      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === selectedTicket.id
            ? {
                ...ticket,
                status: detailForm.status,
                support_type: detailForm.supportType,
                solution: detailForm.solution,
              }
            : ticket
        )
      );
      setSelectedTicket((prev) =>
        prev
          ? {
              ...prev,
              status: detailForm.status,
              support_type: detailForm.supportType,
              solution: detailForm.solution,
            }
          : prev
      );
      toast.success("تغییرات با موفقیت ذخیره شد");
    } catch (error) {
      console.error("Error updating ticket:", error);
      toast.error("خطا در ذخیره تغییرات تیکت");
    } finally {
      setIsSavingChanges(false);
    }
  };

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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          خانه
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-300">
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
      <section className="space-y-4 rounded-2xl sm:rounded-3xl border border-slate-200/70 bg-white/80 p-4 sm:p-6 dark:border-slate-800/60 dark:bg-slate-900/70">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <h2 className="text-base sm:text-lg font-semibold">جدول تیکت ها</h2>

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
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="min-w-full table-fixed border-separate border-spacing-y-3 text-sm">
                <thead>
                  <tr className="text-right text-xs font-semibold text-slate-500">
                    <th className="rounded-r-xl bg-slate-100 px-2 sm:px-3 py-2">تیکت</th>
                    <th className="bg-slate-100 px-2 sm:px-3 py-2 hidden sm:table-cell">مشتری</th>
                    <th className="bg-slate-100 px-2 sm:px-3 py-2 hidden md:table-cell">شماره تماس</th>
                    <th className="bg-slate-100 px-2 sm:px-3 py-2 hidden lg:table-cell">دسته بندی</th>
                    <th className="bg-slate-100 px-2 sm:px-3 py-2">مشکل</th>
                    <th className="bg-slate-100 px-2 sm:px-3 py-2 hidden lg:table-cell">نوع پشتیبانی</th>
                    <th className="bg-slate-100 px-2 sm:px-3 py-2 hidden xl:table-cell">راه‌حل</th>
                    <th className="bg-slate-100 px-2 sm:px-3 py-2">وضعیت</th>
                    <th className="rounded-l-xl bg-slate-100 px-2 sm:px-3 py-2 hidden md:table-cell">
                      تاریخ ثبت
                    </th>
                  </tr>
                </thead>

              <tbody>
                {filteredTickets.map((ticket) => {
                  const supportType: SupportType =
                    ticket.support_type === "inPerson" ? "inPerson" : "remote";
                  const hasUnread =
                    !!ticket.admin_unread_count &&
                    ticket.admin_unread_count > 0;
                  const isActive = selectedTicket?.id === ticket.id;

                  const customerName =
                    ticket.customer ||
                    ticket.customer_name ||
                    ticket.owner ||
                    ticket.user_name ||
                    "نامشخص";
                  const customerPhone =
                    ticket.customer_phone ||
                    ticket.owner_phone ||
                    ticket.user_phone ||
                    "نامشخص";

                  return (
                    <tr
                      key={ticket.id}
                      onClick={() => handleSelectTicket(ticket)}
                      className={`rounded-2xl cursor-pointer bg-white hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-slate-700 ${
                        isActive
                          ? "ring-2 ring-indigo-200 dark:ring-indigo-500"
                          : ""
                      }`}
                    >
                      <td className="px-2 sm:px-3 py-3 sm:py-4 rounded-r-2xl">
                        <div className="flex items-center gap-2 font-semibold text-xs sm:text-sm">
                          <span>#{ticket.id}</span>
                          {hasUnread && (
                            <span className="h-2 w-2 rounded-full bg-rose-500" />
                          )}
                        </div>
                      </td>

                      <td className="px-2 sm:px-3 py-3 sm:py-4 hidden sm:table-cell">
                        <p className="font-medium text-xs sm:text-sm">{customerName}</p>
                      </td>
                      <td className="px-2 sm:px-3 py-3 sm:py-4 hidden md:table-cell">
                        <p className="font-medium text-xs sm:text-sm">{customerPhone}</p>
                      </td>
                      <td className="px-1 sm:px-2 py-3 sm:py-4 hidden lg:table-cell">
                        <p className="text-xs sm:text-sm">{ticket.category_name}</p>
                      </td>
                      <td className="px-2 sm:px-3 py-3 sm:py-4">
                        <p className="text-xs sm:text-sm line-clamp-2">{ticket.description}</p>
                      </td>

                      <td className="px-1 sm:px-2 py-3 sm:py-4 hidden lg:table-cell">
                        <span
                          className={`px-2 sm:px-3 py-1 text-xs rounded-xl font-semibold ${SUPPORT_BADGES[supportType]}`}
                        >
                          {SUPPORT_LABELS[supportType]}
                        </span>
                      </td>
                      <td className="px-1 sm:px-2 py-3 sm:py-4 hidden xl:table-cell">
                        <p className="text-xs sm:text-sm line-clamp-2">
                          {ticket.solution || "بدون جواب"}
                        </p>
                      </td>
                      <td className="px-2 sm:px-3 py-3 sm:py-4">
                        <span
                          className={`px-2 sm:px-3 py-1 text-xs rounded-xl font-semibold ${
                            STATUS_STYLES[ticket.status]
                          }`}
                        >
                          {ticket.status}
                        </span>
                      </td>

                      <td className="px-2 sm:px-3 py-3 sm:py-4 rounded-l-2xl text-xs hidden md:table-cell">
                        {new Date(ticket.created_at).toLocaleDateString(
                          "fa-IR"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              </table>
            </div>

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

      {selectedTicket && (
        <section className="space-y-6 rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                تیکت #{selectedTicket.id}
              </p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {selectedTicket.subject}
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                {selectedTicket.description}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/tickets/$ticketId"
                params={{ ticketId: selectedTicket.id.toString() }}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200"
              >
                مشاهده مکالمه کامل
              </Link>
              <button
                onClick={handleCloseDetail}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
              >
                بستن
              </button>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-4 rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-200">
              <div className="flex items-center justify-between">
                <span>مشتری</span>
                <strong>
                  {selectedTicket.customer ||
                    selectedTicket.customer_name ||
                    selectedTicket.owner ||
                    selectedTicket.user_name ||
                    "نامشخص"}
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span>شماره تماس</span>
                <strong>
                  {selectedTicket.customer_phone ||
                    selectedTicket.owner_phone ||
                    selectedTicket.user_phone ||
                    "نامشخص"}
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span>وضعیت فعلی</span>
                <strong>{selectedTicket.status}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>نوع پشتیبانی</span>
                <strong>
                  {
                    SUPPORT_LABELS[
                      (selectedTicket.support_type === "inPerson"
                        ? "inPerson"
                        : "remote") as SupportType
                    ]
                  }
                </strong>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  وضعیت تیکت
                </label>
                <select
                  value={detailForm.status}
                  onChange={(event) =>
                    setDetailForm((prev) => ({
                      ...prev,
                      status: event.target.value as TicketStatus,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {[
                    "در انتظار",
                    "در حال پیگیری",
                    "پاسخ داده شده",
                    "بسته شده",
                  ].map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  نوع پشتیبانی
                </label>
                <div className="flex gap-3">
                  {(["remote", "inPerson"] as SupportType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() =>
                        setDetailForm((prev) => ({
                          ...prev,
                          supportType: type,
                        }))
                      }
                      className={`flex-1 rounded-2xl border px-3 py-2 text-sm font-semibold transition ${
                        detailForm.supportType === type
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-500/20 dark:text-indigo-100"
                          : "border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {SUPPORT_LABELS[type]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  راه‌حل / یادداشت
                </label>
                <textarea
                  rows={4}
                  value={detailForm.solution}
                  onChange={(event) =>
                    setDetailForm((prev) => ({
                      ...prev,
                      solution: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  placeholder="راه‌حل یا توضیحات تکمیلی را بنویسید..."
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveChanges}
                  disabled={isSavingChanges}
                  className="inline-flex items-center rounded-2xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isSavingChanges ? "در حال ذخیره..." : "ذخیره تغییرات"}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-200/70 p-4 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                پیام‌های اخیر
              </h4>
              <button
                onClick={() => loadTicketMessages(selectedTicket.id)}
                className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-300"
              >
                به‌روزرسانی
              </button>
            </div>
            {isDetailLoading ? (
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-300">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
                در حال بارگذاری پیام‌ها...
              </div>
            ) : detailMessages.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-300">
                پیامی برای نمایش وجود ندارد.
              </p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {detailMessages.map((message) => (
                  <div
                    key={message.id}
                    className="rounded-2xl border border-slate-200/80 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                      <span>{message.sender_name || "کاربر"}</span>
                      <span>
                        {new Date(message.created_at).toLocaleDateString(
                          "fa-IR"
                        )}
                      </span>
                    </div>
                    <p className="mt-2 text-slate-700 dark:text-slate-200">
                      {message.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

type PaginationProps = {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
};

function Pagination({ page, pageCount, onChange }: PaginationProps) {
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
