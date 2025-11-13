import { useMemo, useState } from "react";
import moment from "jalali-moment";
import DatePicker from "../../components/common/DatePicker";

interface Ticket {
  id: number;
  name: string;
  phone: string;
  problem: string;
  solution: string;
  typeSupport: "inPerson" | "remote";
  status: "open" | "closed";
  date: string;
}

const STATUS_LABELS: Record<
  Ticket["status"],
  { label: string; badge: string }
> = {
  open: {
    label: "باز",
    badge:
      "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200",
  },
  closed: {
    label: "بسته",
    badge:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200",
  },
};

const TYPE_LABELS: Record<
  Ticket["typeSupport"],
  { label: string; badge: string }
> = {
  inPerson: {
    label: "حضوری",
    badge:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-100",
  },
  remote: {
    label: "غیرحضوری",
    badge: "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200",
  },
};

const MOCK_TICKETS: Ticket[] = [
  {
    id: 6589,
    name: "شرکت راهکاران",
    phone: "02188990011",
    problem: "اختلال در همگام‌سازی اسناد فروش",
    solution: "بازسازی صف پیام و همگام سازی دستی",
    typeSupport: "remote",
    status: "open",
    date: "1403/08/19",
  },
  {
    id: 6590,
    name: "علی رضایی",
    phone: "09120000000",
    problem: "کندی داشبورد مدیریت",
    solution: "بهینه‌سازی ایندکس‌های پایگاه داده",
    typeSupport: "inPerson",
    status: "closed",
    date: "1403/08/18",
  },
  {
    id: 6591,
    name: "بانک توسعه شرق",
    phone: "02122223344",
    problem: "عدم ارسال اعلان موبایل",
    solution: "بازنشانی گواهی Push و تست داخلی",
    typeSupport: "remote",
    status: "open",
    date: "1403/08/17",
  },
];

export default function TicketReport() {
  const [tickets] = useState<Ticket[]>(MOCK_TICKETS);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const ticketDate = moment(ticket.date, "jYYYY/jMM/jDD");
      const from = fromDate ? moment(fromDate, "jYYYY/jMM/jDD") : null;
      const to = toDate ? moment(toDate, "jYYYY/jMM/jDD") : null;

      const matchesSearch =
        ticket.name.includes(search) ||
        ticket.phone.includes(search) ||
        ticket.problem.includes(search);

      const matchesDate =
        (!from || ticketDate.isSameOrAfter(from, "day")) &&
        (!to || ticketDate.isSameOrBefore(to, "day"));

      return matchesSearch && matchesDate;
    });
  }, [tickets, search, fromDate, toDate]);

  const totalOpen = filteredTickets.filter(
    (ticket) => ticket.status === "open"
  ).length;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          گزارش تحلیلی تیکت‌ها
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-300">
          بازبینی روند درخواست‌ها، مقایسه کانال‌های پشتیبانی و استخراج شاخص‌های
          کلیدی عملکرد برای جلسات مدیریتی.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-300">
            تیکت‌های باز
          </p>
          <p className="mt-3 text-3xl font-black text-amber-500">{totalOpen}</p>
          <p className="mt-2 text-xs text-slate-400 dark:text-slate-400">
            در بازه انتخاب‌شده
          </p>
        </div>
        <div className="rounded-3xl border border-emerald-200/70 bg-emerald-50/60 p-5 shadow-sm dark:border-emerald-500/20 dark:bg-emerald-500/15">
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-200">
            میانگین زمان رسیدگی
          </p>
          <p className="mt-3 text-3xl font-black text-emerald-600 dark:text-emerald-200">
            ۲ ساعت
          </p>
          <p className="mt-2 text-xs text-emerald-500/80 dark:text-emerald-200/80">
            ۴۰٪ سریع‌تر از هفته قبل
          </p>
        </div>
        <div className="rounded-3xl border border-indigo-200/60 bg-indigo-50/60 p-5 shadow-sm dark:border-indigo-500/20 dark:bg-indigo-500/15">
          <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-200">
            کانال غالب
          </p>
          <p className="mt-3 text-3xl font-black text-indigo-600 dark:text-indigo-100">
            پرتال وب
          </p>
          <p className="mt-2 text-xs text-indigo-500/80 dark:text-indigo-200/80">
            ۶۵٪ درخواست‌ها
          </p>
        </div>
      </section>

      <section className="space-y-5 rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              فیلتر نتایج
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-300">
              با ترکیب تاریخ و جستجو، گزارش دقیق‌تری مشاهده کنید.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
              دانلود PDF
            </button>
            <button className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-100 dark:border-indigo-500/30 dark:bg-indigo-500/20 dark:text-indigo-100">
              اشتراک‌گذاری
            </button>
          </div>
        </header>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <input
            type="search"
            placeholder="جستجو بر اساس مشتری، شماره یا توضیحات"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/40"
          />
          <div className="flex flex-col gap-2 text-xs text-slate-500 dark:text-slate-300">
            <span className="font-semibold">از تاریخ</span>
            <DatePicker onChange={setFromDate} value={fromDate} />
          </div>
          <div className="flex flex-col gap-2 text-xs text-slate-500 dark:text-slate-300">
            <span className="font-semibold">تا تاریخ</span>
            <DatePicker onChange={setToDate} value={toDate} />
          </div>
          <button
            onClick={() => {
              setSearch("");
              setFromDate("");
              setToDate("");
            }}
            className="self-end rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            بازنشانی فیلترها
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-3 text-sm">
            <thead>
              <tr className="text-right text-xs font-semibold text-slate-500 dark:text-slate-300">
                <th className="rounded-r-xl bg-slate-100/70 px-3 py-2 dark:bg-slate-800/70">
                  شناسه
                </th>
                <th className="bg-slate-100/70 px-3 py-2 dark:bg-slate-800/70">
                  مشتری
                </th>
                <th className="bg-slate-100/70 px-3 py-2 dark:bg-slate-800/70">
                  شماره تماس
                </th>
                <th className="bg-slate-100/70 px-3 py-2 dark:bg-slate-800/70">
                  مشکل
                </th>
                <th className="bg-slate-100/70 px-3 py-2 dark:bg-slate-800/70">
                  راه‌حل
                </th>
                <th className="bg-slate-100/70 px-3 py-2 dark:bg-slate-800/70">
                  نوع پشتیبانی
                </th>
                <th className="bg-slate-100/70 px-3 py-2 dark:bg-slate-800/70">
                  وضعیت
                </th>
                <th className="rounded-l-xl bg-slate-100/70 px-3 py-2 dark:bg-slate-800/70">
                  تاریخ
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.length > 0 ? (
                filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="rounded-3xl bg-white/80 text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-indigo-50 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:bg-slate-800/70"
                  >
                    <td className="rounded-r-3xl px-3 py-4 text-sm font-semibold text-slate-500 dark:text-slate-300">
                      #{ticket.id}
                    </td>
                    <td className="px-3 py-4">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-800 dark:text-white">
                          {ticket.name}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-300">
                          ارزش بالا
                        </p>
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <p className="font-mono text-xs text-slate-500 dark:text-slate-300">
                        {ticket.phone}
                      </p>
                    </td>
                    <td className="px-3 py-4 text-xs leading-5 text-slate-600 dark:text-slate-200">
                      {ticket.problem}
                    </td>
                    <td className="px-3 py-4 text-xs leading-5 text-slate-500 dark:text-slate-300">
                      {ticket.solution}
                    </td>
                    <td className="px-3 py-4">
                      <span
                        className={`inline-flex items-center gap-2 rounded-2xl px-3 py-1 text-xs font-semibold ${
                          TYPE_LABELS[ticket.typeSupport].badge
                        }`}
                      >
                        {TYPE_LABELS[ticket.typeSupport].label}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <span
                        className={`inline-flex items-center gap-2 rounded-2xl px-3 py-1 text-xs font-semibold ${
                          STATUS_LABELS[ticket.status].badge
                        }`}
                      >
                        {STATUS_LABELS[ticket.status].label}
                      </span>
                    </td>
                    <td className="rounded-l-3xl px-3 py-4 text-xs font-semibold text-slate-500 dark:text-slate-300">
                      {ticket.date}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="rounded-3xl bg-white/80 py-8 text-center text-sm font-medium text-slate-400 dark:bg-slate-900/70 dark:text-slate-300"
                  >
                    موردی مطابق با فیلترهای شما پیدا نشد.
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
