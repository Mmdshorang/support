import { useMemo, useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Search, MessageSquare, Clock, CheckCircle2 } from "lucide-react";

import { ticketsApi, type Ticket } from "../../services/api/tickets";

const STATUS_STYLES = {
  "در انتظار": "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200",
  "در حال پیگیری": "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200",
  "پاسخ داده شده": "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200",
  "بسته شده": "bg-slate-200 text-slate-700 dark:bg-slate-700/60 dark:text-slate-100",
};

export default function UserDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState({
    openTickets: 0,
    pendingTickets: 0,
    inProgressTickets: 0,
    answeredTickets: 0,
    closedTickets: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  // Fetch tickets (all user tickets)
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setIsLoading(true);
        const response = await ticketsApi.getTickets({
          sortBy: "updated_at",
          sortOrder: "desc",
        });
        setTickets(response.data);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTickets();
  }, []);

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
          pendingTickets: statsData.by_status.pending,
          inProgressTickets: statsData.by_status.in_progress,
          answeredTickets: statsData.by_status.answered,
          closedTickets: statsData.by_status.closed,
        });
      } catch { /* empty */ }
    };
    fetchStats();
  }, []);

  const filteredTickets = useMemo(() => {
    if (!searchQuery.trim()) return tickets;
    const q = searchQuery.toLowerCase();

    return tickets.filter(
      (t) =>
        t.subject.toLowerCase().includes(q) ||
        t.id.toString().includes(q)
    );
  }, [searchQuery, tickets]);

  const STATS = [
    {
      title: "تیکت‌های باز",
      value: stats.openTickets,
      icon: MessageSquare,
      variant: "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20",
    },
    {
      title: "در انتظار",
      value: stats.pendingTickets,
      icon: Clock,
      variant: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20",
    },
    {
      title: "در حال پیگیری",
      value: stats.inProgressTickets,
      icon: Clock,
      variant: "bg-sky-500/10 text-sky-600 dark:bg-sky-500/20",
    },
    {
      title: "پاسخ داده شده",
      value: stats.answeredTickets,
      icon: CheckCircle2,
      variant: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20",
    },
    {
      title: "بسته شده",
      value: stats.closedTickets,
      icon: CheckCircle2,
      variant: "bg-slate-500/10 text-slate-600 dark:bg-slate-700/30",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">داشبورد من</h1>
          <p className="text-sm text-slate-500 dark:text-slate-300">
            مدیریت و پیگیری تیکت‌های پشتیبانی خود
          </p>
        </div>

        <Link
          to="/new-ticket"
          className="bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white rounded-xl shadow hover:bg-indigo-700"
        >
          ثبت تیکت جدید
        </Link>
      </div>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-300">{stat.title}</p>
                  <h3 className="mt-2 text-2xl font-bold dark:text-white">
                    {stat.value}
                  </h3>
                </div>
                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${stat.variant}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Tickets List */}
      <section className="rounded-3xl border border-slate-200/70 bg-white p-6 dark:bg-slate-900 dark:border-slate-800 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold dark:text-white">تیکت‌های من</h2>
            <p className="text-sm text-slate-500">{filteredTickets.length} تیکت</p>
          </div>

          <div className="relative w-72">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input
              type="search"
              placeholder="جستجو..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-10 pl-4 text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-200"
            />
          </div>
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="text-center py-10">
            <div className="inline-block h-8 w-8 rounded-full border-4 border-indigo-500 border-r-transparent animate-spin"></div>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="py-10 text-center text-slate-500 dark:text-slate-300">
            <MessageSquare className="mx-auto h-12 w-12 text-slate-400" />
            <p className="mt-3">تیکتی یافت نشد</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTickets.map((ticket) => (
              <Link
                key={ticket.id}
                to="/tickets/$ticketId"
                params={{ ticketId: ticket.id.toString() }}
                className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md dark:bg-slate-900 dark:border-slate-600"
              >
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-400">#{ticket.id}</span>
                      <h3 className="text-base font-semibold dark:text-white">{ticket.subject}</h3>

                      {ticket.user_unread_count && ticket.user_unread_count > 0 && (
                        <span className="h-5 w-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                          {ticket.user_unread_count}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-slate-500 dark:text-slate-300">
                      {ticket.last_message || "بدون پیام"}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
                      <span>ایجاد: {new Date(ticket.created_at).toLocaleDateString("fa-IR")}</span>•
                      <span>آخرین بروزرسانی: {new Date(ticket.updated_at).toLocaleDateString("fa-IR")}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1.5 text-xs rounded-xl font-semibold ${STATUS_STYLES[ticket.status]}`}
                    >
                      {ticket.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
