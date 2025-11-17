import { useState } from "react";

type Ticket = {
  id: number;
  name: string;
  phone: string;
  category: string;
  problem: string;
  description: string;
  solution: string;
  statusText: string;
  createdAt: string;
  supportLabel: string;
};

type TicketDialogProps = {
  open: boolean;
  onClose: () => void;
  ticket: Ticket | null;
  onSubmit: (answer: string) => void;
};

export default function TicketDialog({
  open,
  onClose,
  ticket,
  onSubmit,
}: TicketDialogProps) {
  const [answer, setAnswer] = useState("");

  if (!open || !ticket) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg p-6 animate-fadeIn">
        {/* Title */}
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">
          مشخصات تیکت
        </h2>

        {/* Content */}
        <div className="space-y-4 mb-4 text-sm text-gray-700 dark:text-gray-200">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <p>
              <span className="font-semibold">👤 نام مشتری:</span> {ticket.name}
            </p>
            <p dir="ltr">
              <span className="font-semibold">📞 شماره تماس:</span>{" "}
              {ticket.phone}
            </p>
            <p>
              <span className="font-semibold">📂 دسته‌بندی مشکل:</span>{" "}
              {ticket.category}
            </p>
            <p>
              <span className="font-semibold">📅 تاریخ ثبت:</span>{" "}
              {ticket.createdAt}
            </p>
            <p>
              <span className="font-semibold">🎯 وضعیت:</span>{" "}
              {ticket.statusText}
            </p>
            <p>
              <span className="font-semibold">🛠 نوع پشتیبانی:</span>{" "}
              {ticket.supportLabel}
            </p>
          </div>

          <div>
            <p className="font-semibold mb-1">📝 موضوع/شرح مشکل:</p>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700">
              <p className="font-semibold mb-1">{ticket.problem}</p>
              <p className="text-gray-600 dark:text-gray-200">
                {ticket.description}
              </p>
            </div>
          </div>

          <div>
            <p className="font-semibold mb-1">✅ راه‌حل ثبت‌شده:</p>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-900 dark:border-emerald-600/60 dark:bg-emerald-900/40 dark:text-emerald-100">
              {ticket.solution}
            </div>
          </div>

          {/* Answer Input */}
          <div>
            <label className="font-semibold text-gray-700 dark:text-gray-200">
              پاسخ / راه‌حل
            </label>
            <textarea
              className="w-full mt-1 p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none min-h-[120px]"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end space-x-3 space-x-reverse">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-500"
          >
            بستن
          </button>

          <button
            onClick={() => onSubmit(answer)}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            ثبت پاسخ
          </button>
        </div>
      </div>
    </div>
  );
}
