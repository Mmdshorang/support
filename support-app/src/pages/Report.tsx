import { useState } from "react";
import moment from "jalali-moment";
import DatePicker from "../components/common/DatePicker";

interface Ticket {
  id: number;
  name: string;
  phone: string;
  problem: string;
  solution: string;
  typeSupport: "inPerson" | "absent";
  status: "open" | "close";
  date: string;
}

export default function TicketReport() {
  const [tickets] = useState<Ticket[]>([
    {
      id: 1,
      name: "علی رضایی",
      phone: "09120000000",
      problem: "عدم اتصال به سرور",
      solution: "ری‌استارت مودم و سیستم",
      typeSupport: "absent",
      status: "open",
      date: "1403/08/01",
    },
    {
      id: 2,
      name: "زهرا محمدی",
      phone: "09350000000",
      problem: "مشکل در ورود به حساب",
      solution: "بازیابی رمز عبور",
      typeSupport: "inPerson",
      status: "close",
      date: "1403/08/03",
    },
    {
      id: 3,
      name: "محمد کاظمی",
      phone: "09220000000",
      problem: "کندی سیستم",
      solution: "بهینه‌سازی پایگاه داده",
      typeSupport: "inPerson",
      status: "open",
      date: "1403/08/05",
    },
  ]);

  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const filterTickets = tickets.filter((t) => {
    const ticketDate = moment(t.date, "jYYYY/jMM/jDD");
    const from = fromDate ? moment(fromDate, "jYYYY/jMM/jDD") : null;
    const to = toDate ? moment(toDate, "jYYYY/jMM/jDD") : null;

    const matchesSearch = t.name.includes(search) || t.phone.includes(search);

    const matchesDate =
      (!from || ticketDate.isSameOrAfter(from)) &&
      (!to || ticketDate.isSameOrBefore(to));

    return matchesSearch && matchesDate;
  });

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex flex-col items-center p-6">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl p-6 transition-all duration-300">
        <h2 className="text-2xl font-bold mb-6 text-gray-700 text-center border-b pb-3">
          گزارش تیکت‌ها
        </h2>

        {/* فیلترها */}
        <div className="flex flex-wrap gap-4 items-center justify-center mb-6">
          <input
            type="text"
            placeholder="جستجو بر اساس نام یا شماره موبایل..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 w-72 focus:ring-2 focus:ring-blue-300 outline-none"
          />

          <div>
            <label>ازتاریخ : </label>
            <DatePicker />
          </div>
          <div>
            <label>تاتاریخ : </label>
            <DatePicker />
          </div>
        </div>

        {/* جدول گزارش */}
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-right border-collapse">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="py-3 px-4">شماره</th>
                <th className="py-3 px-4">نام</th>
                <th className="py-3 px-4">شماره تماس</th>
                <th className="py-3 px-4">مشکل</th>
                <th className="py-3 px-4">راه حل</th>
                <th className="py-3 px-4">نوع پشتیبانی</th>
                <th className="py-3 px-4">وضعیت</th>
                <th className="py-3 px-4">تاریخ</th>
              </tr>
            </thead>

            <tbody>
              {filterTickets.length > 0 ? (
                filterTickets.map((ticket, index) => (
                  <tr
                    key={ticket.id}
                    className={`border-t hover:bg-blue-50 transition-all duration-200 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="py-2 px-4">{ticket.id}</td>
                    <td className="py-2 px-4">{ticket.name}</td>
                    <td className="py-2 px-4">{ticket.phone}</td>
                    <td className="py-2 px-4">{ticket.problem}</td>
                    <td className="py-2 px-4">{ticket.solution}</td>
                    <td className="py-2 px-4">
                      {ticket.typeSupport === "inPerson" ? (
                        <span className="text-blue-700 font-medium">حضوری</span>
                      ) : (
                        <span className="text-green-700 font-medium">
                          غیرحضوری
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-4">
                      {ticket.status === "open" ? (
                        <span className="text-yellow-600 font-semibold">
                          باز
                        </span>
                      ) : (
                        <span className="text-gray-600 font-semibold">
                          بسته
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-4">{ticket.date}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-6 text-gray-500 font-medium"
                  >
                    موردی یافت نشد
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
