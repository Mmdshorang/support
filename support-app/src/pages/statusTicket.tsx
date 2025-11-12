import { useState } from "react";
import ToggleButton from "../components/common/ToggleButton";

interface Ticket {
  id: number;
  name: string;
  phone: string;
  problem: string;
  solution: string;
  typeSupport: "inPerson" | "absent";
  status: "open" | "close";
}

export const StatusTicket = () => {
  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: 1,
      name: "علی رضایی",
      phone: "09120000000",
      problem: "عدم اتصال به سرور",
      solution: "ری‌استارت مودم و سیستم",
      typeSupport: "absent",
      status: "open",
    },
    {
      id: 2,
      name: "زهرا محمدی",
      phone: "09350000000",
      problem: "مشکل در ورود به حساب",
      solution: "بازیابی رمز عبور",
      typeSupport: "inPerson",
      status: "close",
    },
  ]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [newType, setNewType] = useState<"inPerson" | "absent">("inPerson");

  const handleDelete = (id: number) => {
    setTickets(tickets.filter((ticket) => ticket.id !== id));
  };

  const handleEdit = (id: number, currentType: "inPerson" | "absent") => {
    setEditingId(id);
    setNewType(currentType);
  };

  const handleSave = (id: number) => {
    setTickets(
      tickets.map((ticket) =>
        ticket.id === id ? { ...ticket, typeSupport: newType } : ticket
      )
    );
    setEditingId(null);
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-200 min-h-screen flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl p-6 transition-all duration-300">
        <h2 className="text-2xl font-bold mb-6 text-gray-700 text-center border-b pb-3">
          وضعیت تیکت ها
        </h2>

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
                <th className="py-3 px-4 text-center">عملیات</th>
              </tr>
            </thead>

            <tbody>
              {tickets.map((ticket, index) => (
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
                    {editingId === ticket.id ? (
                      <select
                        value={newType}
                        onChange={(e) =>
                          setNewType(e.target.value as "inPerson" | "absent")
                        }
                        className="border rounded px-2 py-1 w-full focus:outline-none focus:ring focus:ring-blue-200"
                      >
                        <option value="inPerson">حضوری</option>
                        <option value="absent">غیرحضوری</option>
                      </select>
                    ) : ticket.typeSupport === "inPerson" ? (
                      <span className="text-blue-700 font-medium">حضوری</span>
                    ) : (
                      <span className="text-green-700 font-medium">
                        غیرحضوری
                      </span>
                    )}
                  </td>

                  <td className="py-2 px-4">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        value=""
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
                      {/* <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                        
                      </span> */}
                    </label>
                  </td>

                  <td className="py-2 px-4 text-center flex justify-center gap-2">
                    {editingId === ticket.id ? (
                      <button
                        onClick={() => handleSave(ticket.id)}
                        className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition"
                      >
                        ذخیره
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          handleEdit(ticket.id, ticket.typeSupport)
                        }
                        className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition"
                      >
                        ویرایش
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(ticket.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition"
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}

              {tickets.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-6 text-gray-500">
                    تیکتی وجود ندارد
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
