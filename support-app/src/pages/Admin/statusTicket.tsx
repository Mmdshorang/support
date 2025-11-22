import { useEffect, useMemo, useState } from "react";
import moment from "jalali-moment";
import { toast } from "react-toastify";
import { useNavigate } from "@tanstack/react-router";
import { ticketsApi } from "../../services/api/tickets";
import type { Ticket as ApiTicket } from "../../services/api/tickets";
import { Eye, Trash, CircleX } from "lucide-react";

interface Ticket {
  id: number;
  name: string;
  phone: string;
  problem: string;
  description: string;
  category: string;
  supportType: "inPerson" | "remote";
  status: "open" | "closed";
  statusText: string;
  createdAt: string;
  solution: string;
  supportLabel: string;
}

const statusBadge: Record<Ticket["status"], string> = {
  open: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200",
  closed:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200",
};

const typeBadge: Record<Ticket["supportType"], string> = {
  inPerson:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-100",
  remote: "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200",
};

export function StatusTicketPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const openTicketConversation = (ticketId: number) => {
    navigate({
      to: "/tickets/$ticketId",
      params: { ticketId: ticketId.toString() },
    });
  };

  const formatPhoneNumber = (value?: string | null) => {
    if (!value) return "نامشخص";
    const digits = value.replace(/[^\d+]/g, "");
    if (!digits) return "نامشخص";
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const supportTypeLabel = (type: Ticket["supportType"]) =>
    type === "inPerson" ? "حضوری" : "غیرحضوری";

  // Fetch tickets from API
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setIsLoading(true);
        const response = await ticketsApi.getTickets({
          sortBy: "updated_at",
          sortOrder: "desc",
        });

        // Map API tickets to StatusTicket interface
        const mappedTickets: Ticket[] = response.data.map(
          (ticket: ApiTicket) => {
            const supportType: Ticket["supportType"] =
              ticket.support_type === "inPerson" ? "inPerson" : "remote";
            const statusText = ticket.status || "نامشخص";
            return {
              id: ticket.id,
              name:
                ticket.customer ||
                ticket.customer_name ||
                ticket.owner ||
                ticket.user_name ||
                "نامشخص",
              phone: formatPhoneNumber(
                ticket.customer_phone || ticket.owner_phone || ticket.user_phone
              ),
              problem: ticket.subject || "نامشخص",
              description: ticket.description || "توضیحی ثبت نشده است",
              category: ticket.category_name || "نامشخص",
              supportType,
              status: ticket.status === "بسته شده" ? "closed" : "open",
              statusText,
              createdAt: moment(ticket.created_at || ticket.updated_at)
                .locale("fa")
                .format("jYYYY/jMM/jDD HH:mm"),
              solution: ticket.solution || "راه‌حلی ثبت نشده است",
              supportLabel: supportTypeLabel(supportType),
            };
          }
        );

        setTickets(mappedTickets);
      } catch (error) {
        console.error("Error fetching tickets:", error);
        toast.error("خطا در دریافت تیکت‌ها");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const stats = useMemo(() => {
    const open = tickets.filter((ticket) => ticket.status === "open").length;
    const closed = tickets.length - open;
    const inPerson = tickets.filter(
      (ticket) => ticket.supportType === "inPerson"
    ).length;
    return { total: tickets.length, open, closed, inPerson };
  }, [tickets]);

  const handleDelete = async (id: number) => {
    try {
      await ticketsApi.deleteTicket(id);
      setTickets((prev) => prev.filter((ticket) => ticket.id !== id));
      toast.success("تیکت با موفقیت حذف شد");
    } catch (error) {
      console.error("Error deleting ticket:", error);
      toast.error("خطا در حذف تیکت");
    }
  };

  const handleCloseTicket = async (id: number) => {
    try {
      await ticketsApi.updateStatus(id, "بسته شده");

      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === id
            ? {
                ...ticket,
                status: "closed",
                statusText: "بسته شده",
              }
            : ticket
        )
      );

      toast.success("تیکت با موفقیت بسته شد");
    } catch (error) {
      toast.error("خطا در بستن تیکت");
    }
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          وضعیت تیکت‌ها
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-300">
          پیگیری لحظه‌ای تیکت‌های فعال، تغییر نوع پشتیبانی و مدیریت وضعیت بر
          اساس SLA.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: "کل تیکت‌ها",
            value: stats.total,
            tone: "bg-slate-100 text-slate-700 dark:bg-slate-900/50 dark:text-slate-200",
          },
          {
            title: "تیکت‌های باز",
            value: stats.open,
            tone: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200",
          },
          {
            title: "تیکت‌های بسته",
            value: stats.closed,
            tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200",
          },
          {
            title: "نیازمند اعزام",
            value: stats.inPerson,
            tone: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200",
          },
        ].map((item) => (
          <div
            key={item.title}
            className={`rounded-3xl border border-transparent p-5 text-sm font-semibold shadow-sm backdrop-blur-xl ${item.tone}`}
          >
            <p>{item.title}</p>
            <p className="mt-3 text-2xl font-black">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              جدول تیکت‌ها
            </h2>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-3 text-sm">
            <thead>
              <tr className="text-right text-xs font-semibold text-slate-500 dark:text-slate-300">
                <th className="rounded-r-xl bg-slate-100/70 px-3 py-2 dark:bg-slate-800/70">
                  شناسه
                </th>
                <th className="bg-slate-100/70 px-3 py-2 dark:bg-slate-800/70">
                  نام
                </th>
                <th className="bg-slate-100/70 px-3 py-2 dark:bg-slate-800/70">
                  شماره تماس
                </th>
                <th className="bg-slate-100/70 px-3 py-2 dark:bg-slate-800/70">
                  مشکل
                </th>
                <th className="bg-slate-100/70 px-3 py-2 dark:bg-slate-800/70">
                  نوع پشتیبانی
                </th>
                <th className="bg-slate-100/70 px-3 py-2 dark:bg-slate-800/70">
                  راه‌حل
                </th>
                <th className="bg-slate-100/70 px-3 py-2 dark:bg-slate-800/70">
                  وضعیت
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
                    colSpan={9}
                    className="rounded-3xl bg-white/80 py-8 text-center text-sm font-medium text-slate-400 dark:bg-slate-900/70 dark:text-slate-300"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
                      در حال بارگذاری...
                    </div>
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    onClick={() => openTicketConversation(ticket.id)}
                    className="rounded-3xl bg-white/80 text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-indigo-50 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:bg-slate-800/70"
                  >
                    <td className="rounded-r-3xl px-3 py-4 font-semibold text-slate-500 dark:text-slate-300">
                      #{ticket.id}
                    </td>
                    <td className="px-3 py-4">
                      <div className="space-y-1">
                        <p className="font-semibold text-slate-800 dark:text-white">
                          {ticket.name}
                        </p>
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <p className="text-xs font-mono text-slate-500 dark:text-slate-300">
                        {ticket.phone}
                      </p>
                    </td>
                    <td className="px-3 py-4 text-xs leading-5 text-slate-600 dark:text-slate-200">
                      <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600 dark:bg-slate-800/70 dark:text-slate-300">
                        {ticket.category}
                      </span>
                      <p className="mt-1 text-slate-500 dark:text-slate-300 line-clamp-2">
                        {ticket.description}
                      </p>
                    </td>
                    <td className="px-3 py-4">
                      <span
                        className={`inline-flex items-center gap-2 rounded-2xl px-3 py-1 text-xs font-semibold ${
                          typeBadge[ticket.supportType]
                        }`}
                      >
                        {supportTypeLabel(ticket.supportType)}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-xs text-slate-600 dark:text-slate-200">
                      <p className="line-clamp-3">{ticket.solution}</p>
                    </td>
                    <td className="px-3 py-4">
                      <span
                        className={`inline-flex items-center gap-2 rounded-2xl px-3 py-1 text-xs font-semibold ${
                          statusBadge[ticket.status]
                        }`}
                      >
                        {ticket.statusText}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-xs font-medium text-slate-500 dark:text-slate-300">
                      {ticket.createdAt}
                    </td>
                    <td className="rounded-l-3xl px-3 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            handleCloseTicket(ticket.id);
                          }}
                        >
                          <CircleX className="text-yellow-500 cursor-pointer size-4.5" />
                        </button>
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            openTicketConversation(ticket.id);
                          }}
                        >
                          <Eye className="text-blue-500 cursor-pointer size-4.5" />
                        </button>
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDelete(ticket.id);
                          }}
                        >
                          <Trash className="text-red-500 cursor-pointer size-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}

              {tickets.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="rounded-3xl bg-white/80 py-8 text-center text-sm font-medium text-slate-400 dark:bg-slate-900/70 dark:text-slate-300"
                  >
                    همه‌چیز عالی است! هیچ تیکت بازی وجود ندارد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default StatusTicketPage;
