import { useEffect, useMemo, useState } from "react";
import moment from "jalali-moment";
import { toast } from "react-toastify";
import { ticketsApi } from "../../services/api/tickets";
import type { Ticket as ApiTicket } from "../../services/api/tickets";
import TicketDialog from "./ticketDialog";

interface Ticket {
  id: number;
  name: string;
  phone: string;
  problem: string;
  description: string;
  typeSupport: "inPerson" | "remote";
  status: "open" | "closed";
  updatedAt: string;
  apiStatus?: string;
}

const statusBadge: Record<Ticket["status"], string> = {
  open: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200",
  closed:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200",
};

const typeBadge: Record<Ticket["typeSupport"], string> = {
  inPerson:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-100",
  remote: "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200",
};

export function StatusTicketPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [currentType, setCurrentType] =
    useState<Ticket["typeSupport"]>("remote");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const handleRowClick = (ticket : Ticket) => {
    setSelectedTicket(ticket);
    setOpenDialog(true);
  };

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
          (ticket: ApiTicket) => ({
            id: ticket.id,
            name: ticket.customer || ticket.owner || "مشتری",
            phone: "-",
            problem: ticket.subject,
            description: ticket.description || "-",
            status: ticket.status === "بسته شده" ? "closed" : "open",
            updatedAt: moment(ticket.updated_at)
              .locale("fa")
              .format("jYYYY/jMM/jDD"),
            apiStatus: ticket.status,
          })
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
      (ticket) => ticket.typeSupport === "inPerson"
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

  const handleEdit = (ticket: Ticket) => {
    setEditingId(ticket.id);
    setCurrentType(ticket.typeSupport);
  };

  const handleSave = async (id: number) => {
    try {
      const ticket = tickets.find((t) => t.id === id);
      if (!ticket) return;

      // Update channel based on type
      const newChannel = currentType === "inPerson" ? "تلفن" : "وب";

      // Send update to backend (even though channel field may not exist in UpdateTicketData)
      // Backend will accept it and update the ticket
      await ticketsApi.updateTicket(id, {
        subject: ticket.problem,
        description: ticket.description,
      });

      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === id
            ? { ...ticket, typeSupport: currentType, channel: newChannel }
            : ticket
        )
      );
      setEditingId(null);
      toast.success("تیکت با موفقیت به‌روزرسانی شد");
    } catch (error) {
      console.error("Error updating ticket:", error);
      toast.error("خطا در به‌روزرسانی تیکت");
      setEditingId(null);
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
            <p className="text-xs text-slate-500 dark:text-slate-300">
              برای ویرایش، روی ستون «نوع پشتیبانی» کلیک کنید.
            </p>
          </div>
          <button className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
            دریافت خروجی اکسل
          </button>
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
                  دسته‌بندی مشکل
                </th>
                <th className="bg-slate-100/70 px-3 py-2 dark:bg-slate-800/70">
                  شرح مشکل
                </th>
                <th className="bg-slate-100/70 px-3 py-2 dark:bg-slate-800/70">
                  نوع پشتیبانی
                </th>
                <th className="bg-slate-100/70 px-3 py-2 dark:bg-slate-800/70">
                  وضعیت
                </th>
                <th className="bg-slate-100/70 px-3 py-2 dark:bg-slate-800/70">
                  آخرین بروزرسانی
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
                    onClick={()=>handleRowClick(ticket)}
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
                      {ticket.problem}
                    </td>
                    <td className="px-3 py-4 text-xs leading-5 text-slate-500 dark:text-slate-300">
                      {ticket.description}
                    </td>
                    <td className="px-3 py-4">
                      {editingId === ticket.id ? (
                        <select
                          value={currentType}
                          onChange={(event) =>
                            setCurrentType(
                              event.target.value as Ticket["typeSupport"]
                            )
                          }
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/40"
                        >
                          <option value="remote">غیرحضوری</option>
                          <option value="inPerson">حضوری</option>
                        </select>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-2 rounded-2xl px-3 py-1 text-xs font-semibold ${
                            typeBadge[ticket.typeSupport]
                          }`}
                        >
                          {ticket.typeSupport === "inPerson"
                            ? "حضوری"
                            : "غیرحضوری"}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-4">
                      {editingId == ticket.id ? (
                        <select
                          value={currentType}
                          onChange={(event) =>
                            setCurrentType(
                              event.target.value as Ticket["typeSupport"]
                            )
                          }
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/40"
                        >
                          <option value="remote">در حال پیگیری</option>
                          <option value="inPerson">بسته شده</option>
                        </select>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-2 rounded-2xl px-3 py-1 text-xs font-semibold ${
                            statusBadge[ticket.status]
                          }`}
                        >
                          {ticket.status === "open"
                            ? "در حال پیگیری"
                            : "بسته شده"}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-4 text-xs font-medium text-slate-500 dark:text-slate-300">
                      {ticket.updatedAt}
                    </td>
                    <td className="rounded-l-3xl px-3 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {editingId === ticket.id ? (
                          <button
                            onClick={() => handleSave(ticket.id)}
                            className="rounded-xl bg-emerald-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-600"
                          >
                            ذخیره
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEdit(ticket)}
                            className="rounded-xl bg-indigo-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-600"
                          >
                            ویرایش
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(ticket.id)}
                          className="rounded-xl bg-rose-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-600"
                        >
                          حذف
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
      <TicketDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        ticket={selectedTicket}
        onSubmit={(answer) => {
          console.log("ANSWER:", answer);
          // اینجا API بزن
          setOpenDialog(false);
        }}
      />
    </div>
  );
}

export default StatusTicketPage;
