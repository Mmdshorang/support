import { useState } from "react";

type Ticket = {
  id: number;
  name: string;
  phone: string;
  category: string;
  description: string;
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
        <div className="space-y-3 mb-4">
          <p className="text-gray-700 dark:text-gray-200">
            <span className="font-semibold">👤 نام:</span> {ticket.name}
          </p>

          <p className="text-gray-700 dark:text-gray-200">
            <span className="font-semibold">📞 شماره تماس:</span> {ticket.phone}
          </p>

          <p className="text-gray-700 dark:text-gray-200">
            <span className="font-semibold">📂 دسته‌بندی مشکل:</span>{" "}
            {ticket.category}
          </p>

          <div>
            <p className="font-semibold text-gray-700 dark:text-gray-200 mb-1">
              📝 توضیحات مشکل:
            </p>
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-gray-800 dark:text-gray-100">
              {ticket.description}
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
