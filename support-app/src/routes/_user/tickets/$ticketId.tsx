import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ArrowRight,
  Calendar,
  Clock,
  MessageCircle,
  Paperclip,
  RefreshCw,
  Send,
  Shield,
  User,
} from "lucide-react";
import { requireAuth } from "../../../lib/auth-guard";
import {
  ticketsApi,
  type Ticket,
  type TicketMessage,
  type SupportType,
} from "../../../services/api/tickets";
import { toast } from "react-toastify";
import { useAtomValue } from "jotai";
import { userAtom } from "../../../stores/auth";

type TicketStatus =
  | "در انتظار"
  | "در حال پیگیری"
  | "پاسخ داده شده"
  | "بسته شده";

const STATUS_STYLES: Record<TicketStatus, string> = {
  "در انتظار":
    "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200",
  "در حال پیگیری":
    "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200",
  "پاسخ داده شده":
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200",
  "بسته شده":
    "bg-slate-200 text-slate-700 dark:bg-slate-700/60 dark:text-slate-100",
};

const SUPPORT_LABELS: Record<SupportType, string> = {
  remote: "غیرحضوری",
  inPerson: "حضوری",
};

export const Route = createFileRoute("/_user/tickets/$ticketId")({
  component: TicketDetailPage,
  beforeLoad: () => {
    requireAuth();
  },
});

function TicketDetailPage() {
  const { ticketId } = Route.useParams();
  const user = useAtomValue(userAtom);
  const isStaffUser = user?.role === "admin" || user?.role === "support";
  const backLink = isStaffUser ? "/statusTicket" : "/user-dashboard";
  const backLabel = isStaffUser ? "بازگشت به تیکت‌ها" : "بازگشت به داشبورد";

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshingMessages, setIsRefreshingMessages] = useState(false);
  const [solutionText, setSolutionText] = useState("");
  const [savingSolution, setSavingSolution] = useState(false);

  const visibleMessages = useMemo(
    () => (isStaffUser ? messages : messages.filter((msg) => !msg.is_internal)),
    [messages, isStaffUser]
  );

  const fetchMessages = useCallback(
    async (showSpinner: boolean = true) => {
      try {
        if (showSpinner) setIsRefreshingMessages(true);
        const response = await ticketsApi.getMessages(Number(ticketId));
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast.error("خطا در دریافت پیام‌ها");
      } finally {
        if (showSpinner) setIsRefreshingMessages(false);
      }
    },
    [ticketId]
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const ticketRes = await ticketsApi.getTicket(Number(ticketId));
        setTicket(ticketRes.data);
        setSolutionText(ticketRes.data.solution || "");
        await fetchMessages(false);
      } catch (error) {
        console.error("Error fetching ticket:", error);
        toast.error("خطا در دریافت اطلاعات تیکت");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [ticketId, fetchMessages]);

  const handleSaveSolution = async () => {
    if (!solutionText.trim()) {
      toast.error("راه‌حل نمی‌تواند خالی باشد");
      return;
    }

    try {
      setSavingSolution(true);

      const res = await ticketsApi.updateTicket(Number(ticketId), {
        solution: solutionText.trim(),
      });

      setTicket((prev) =>
        prev ? { ...prev, solution: res.data.solution } : prev
      );

      toast.success("راه‌حل با موفقیت ثبت شد");
    } catch (error) {
      console.error(error);
      toast.error("خطا در ثبت راه‌حل");
    } finally {
      setSavingSolution(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSubmitting || !ticket) return;

    setIsSubmitting(true);
    try {
      const response = await ticketsApi.sendMessage(
        Number(ticketId),
        newMessage.trim(),
        isStaffUser ? isInternalNote : false
      );
      setMessages((prev) => [...prev, response.data]);
      setNewMessage("");
      if (isStaffUser) {
        setIsInternalNote(false);
      }
      toast.success("پیام ارسال شد");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("خطا در ارسال پیام");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-300">
            در حال بارگذاری...
          </p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 dark:text-slate-300">تیکت یافت نشد</p>
        <Link
          to={backLink}
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          <ArrowRight className="h-4 w-4" />
          {backLabel}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to={backLink}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400"
        >
          <ArrowRight className="h-4 w-4" />
          {backLabel}
        </Link>
      </div>

      {/* Ticket Info Card */}
      <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-bold text-slate-400 dark:text-slate-500">
                #{ticket.id}
              </span>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                {ticket.category_name || "نامشخص"}
              </h1>
            </div>
            <p className="text-xl font-bold leading-relaxed text-slate-600 dark:text-slate-300">
              {ticket.description}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  ایجاد:{" "}
                  {new Date(ticket.created_at).toLocaleDateString("fa-IR")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>
                  به‌روزرسانی:{" "}
                  {new Date(ticket.updated_at).toLocaleDateString("fa-IR")}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex items-center gap-1 rounded-xl px-4 py-2 text-sm font-semibold ${
                STATUS_STYLES[ticket.status]
              }`}
            >
              {ticket.status}
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200/70 bg-slate-50/60 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-200">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
              مشخصات مشتری
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>نام</span>
                <strong>
                  {ticket.customer_name || ticket.customer || "نامشخص"}
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span>شماره تماس</span>
                <strong>
                  {ticket.customer_phone || ticket.user_phone || "نامشخص"}
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span>نوع پشتیبانی</span>
                <strong>
                  {ticket.support_type
                    ? SUPPORT_LABELS[ticket.support_type as SupportType]
                    : "نامشخص"}
                </strong>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200/70 bg-slate-50/60 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-200">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
              مالک تیکت
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>کاربر</span>
                <strong>{ticket.user_name || ticket.owner || "نامشخص"}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>وضعیت فعلی</span>
                <strong>{ticket.status}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70">
        <div className="mb-6 flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            پیام‌ها
          </h2>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            ({visibleMessages.length})
          </span>
          <button
            type="button"
            onClick={() => fetchMessages()}
            disabled={isRefreshingMessages}
            className="ml-auto inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                isRefreshingMessages ? "animate-spin" : ""
              }`}
            />
            به‌روزرسانی
          </button>
        </div>

        <div className="space-y-4">
          {visibleMessages.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <p>هنوز پیامی ثبت نشده است</p>
            </div>
          ) : (
            visibleMessages.map((message) => {
              const isCurrentUserMessage = user?.id === message.sender_id;
              const isUserRoleMessage = message.sender_role === "user";
              return (
                <div
                  key={message.id}
                  className={`flex gap-4 ${
                    isCurrentUserMessage ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                      isCurrentUserMessage
                        ? "bg-indigo-500 text-white"
                        : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                    }`}
                  >
                    <User className="h-5 w-5" />
                  </div>
                  <div
                    className={`flex-1 space-y-2 ${
                      isCurrentUserMessage ? "text-right" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {message.sender_name || "کاربر"}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {new Date(message.created_at).toLocaleString("fa-IR")}
                      </span>
                      {message.is_internal && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-500/20 dark:text-amber-200">
                          <Shield className="h-3 w-3" />
                          داخلی
                        </span>
                      )}
                    </div>
                    <div
                      className={`rounded-2xl p-4 ${
                        isUserRoleMessage
                          ? "bg-indigo-50 text-slate-900 dark:bg-indigo-500/20 dark:text-white"
                          : "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">
                        {message.message}
                      </p>
                    </div>
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {message.attachments.map((attachment) => (
                          <div
                            key={attachment.id}
                            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800"
                          >
                            <Paperclip className="h-3 w-3" />
                            <span>{attachment.file_name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Reply Form */}
        {(ticket.status !== "بسته شده" || isStaffUser) && (
          <form
            onSubmit={handleSendMessage}
            className="mt-6 space-y-4 border-t border-slate-200 pt-6 dark:border-slate-800"
          >
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                پاسخ خود را بنویسید
              </label>
              <textarea
                id="message"
                rows={4}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                placeholder="پیام خود را اینجا بنویسید..."
              />
            </div>

            {/* {isStaffUser && (
              <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-slate-50/60 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-200">
                <div className="flex flex-col gap-1">
                  <span className="font-semibold">ثبت به عنوان یادداشت داخلی</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    یادداشت‌های داخلی برای کاربران نهایی نمایش داده نمی‌شوند.
                  </span>
                </div>
                <ToggleButton
                  size="sm"
                  checked={isInternalNote}
                  onChange={setIsInternalNote}
                  ariaLabel="یادداشت داخلی"
                />
              </div>
            )} */}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* <button
                type="button"
                disabled
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-400 transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500"
              >
                <Paperclip className="h-4 w-4" />
                افزودن فایل (به‌زودی)
              </button> */}
              <button
                type="submit"
                disabled={!newMessage.trim() || isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? "در حال ارسال..." : "ارسال پیام"}
              </button>
            </div>
          </form>
        )}

        {ticket.status === "بسته شده" && !isStaffUser && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-700 dark:bg-slate-800">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              این تیکت بسته شده است و امکان ارسال پیام جدید وجود ندارد.
            </p>
          </div>
        )}
      </div>
      {user?.role === "admin" ? (
        <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm dark:border-slate-800/60 dark:bg-blue-800">
          <div className="text-sm font-semibold text-white">راه‌حل</div>

          <textarea
            value={solutionText}
            onChange={(e) => setSolutionText(e.target.value)}
            className="mt-3 w-full rounded-xl bg-white/20 text-white p-3 text-sm focus:outline-none"
            placeholder="راه‌حل را اینجا بنویسید..."
            rows={4}
          />

          <button
            onClick={handleSaveSolution}
            disabled={savingSolution}
            className="mt-4 border-2 border-white text-white px-4 py-2 rounded-2xl hover:bg-white/20 transition"
          >
            {savingSolution ? "در حال ذخیره..." : "ثبت راه‌حل"}
          </button>
        </div>
      ) : (
        // <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm dark:border-slate-800/60 dark:bg-blue-800">
        //   <div className="text-sm font-semibold text-white">راه‌حل</div>
        //   <div className="mt-2 text-white/90">
        //     {ticket.solution || "راه‌حلی ثبت نشده است"}
        //   </div>
        // </div>
        <></>
      )}
    </div>
  );
}

export default TicketDetailPage;
