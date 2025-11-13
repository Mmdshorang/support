import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
	ArrowRight,
	Calendar,
	Clock,
	MessageCircle,
	Paperclip,
	Send,
	User,
} from "lucide-react";
import { requireAuth } from "../../../lib/auth-guard";
import { ticketsApi, type Ticket, type TicketMessage } from "../../../services/api/tickets";
import { toast } from "react-toastify";

type TicketStatus = "در انتظار" | "در حال پیگیری" | "پاسخ داده شده" | "بسته شده";
type TicketPriority = "کم" | "متوسط" | "زیاد" | "بحرانی";

interface Message {
	id: number;
	sender: "user" | "support";
	senderName: string;
	message: string;
	timestamp: string;
	attachments?: string[];
}

interface TicketDetail {
	id: number;
	subject: string;
	priority: TicketPriority;
	status: TicketStatus;
	createdAt: string;
	updatedAt: string;
	description: string;
	messages: Message[];
}

const MOCK_TICKET: TicketDetail = {
	id: 1234,
	subject: "مشکل در ورود به سیستم",
	priority: "زیاد",
	status: "در حال پیگیری",
	createdAt: "1403/08/20 - 14:30",
	updatedAt: "1403/08/20 - 16:45",
	description:
		"سلام، از دیروز نمی‌توانم وارد حساب کاربری خود شوم. هر بار که رمز عبور را وارد می‌کنم، پیام خطا دریافت می‌کنم.",
	messages: [
		{
			id: 1,
			sender: "user",
			senderName: "شما",
			message:
				"سلام، از دیروز نمی‌توانم وارد حساب کاربری خود شوم. هر بار که رمز عبور را وارد می‌کنم، پیام خطا دریافت می‌کنم.",
			timestamp: "1403/08/20 - 14:30",
		},
		{
			id: 2,
			sender: "support",
			senderName: "تیم پشتیبانی",
			message:
				"سلام و وقت بخیر. ممنون که با ما در تماس هستید. لطفاً پیام خطای دقیق را برای ما ارسال کنید تا بتوانیم بهتر کمکتان کنیم.",
			timestamp: "1403/08/20 - 15:00",
		},
		{
			id: 3,
			sender: "user",
			senderName: "شما",
			message:
				'پیام خطا این است: "نام کاربری یا رمز عبور اشتباه است". ولی من مطمئنم که رمز عبور درست است.',
			timestamp: "1403/08/20 - 15:15",
		},
		{
			id: 4,
			sender: "support",
			senderName: "تیم پشتیبانی",
			message:
				"متشکرم. در حال بررسی حساب شما هستیم. ممکن است نیاز به بازنشانی رمز عبور باشد. لینک بازنشانی را برای شما ایمیل می‌کنیم.",
			timestamp: "1403/08/20 - 16:45",
		},
	],
};

const STATUS_STYLES: Record<TicketStatus, string> = {
	"در انتظار": "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200",
	"در حال پیگیری": "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200",
	"پاسخ داده شده":
		"bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200",
	"بسته شده": "bg-slate-200 text-slate-700 dark:bg-slate-700/60 dark:text-slate-100",
};

const PRIORITY_STYLES: Record<TicketPriority, string> = {
	کم: "bg-slate-100 text-slate-700 dark:bg-slate-700/60 dark:text-slate-200",
	متوسط: "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200",
	زیاد: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200",
	بحرانی: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200",
};

export const Route = createFileRoute("/_user/tickets/$ticketId")({
	component: TicketDetailPage,
	beforeLoad: () => {
		requireAuth();
	},
});

function TicketDetailPage() {
	const { ticketId } = Route.useParams();
	const [ticket, setTicket] = useState<Ticket | null>(null);
	const [messages, setMessages] = useState<TicketMessage[]>([]);
	const [newMessage, setNewMessage] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	// Fetch ticket and messages
	useEffect(() => {
		const fetchData = async () => {
			try {
				setIsLoading(true);
				const [ticketRes, messagesRes] = await Promise.all([
					ticketsApi.getTicket(Number(ticketId)),
					ticketsApi.getMessages(Number(ticketId)),
				]);

				setTicket(ticketRes.data);
				setMessages(messagesRes.data);
			} catch (error) {
				console.error('Error fetching ticket:', error);
				toast.error('خطا در دریافت اطلاعات تیکت');
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, [ticketId]);

	const handleSendMessage = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newMessage.trim() || isSubmitting || !ticket) return;

		setIsSubmitting(true);
		try {
			const response = await ticketsApi.sendMessage(Number(ticketId), newMessage.trim());
			setMessages([...messages, response.data]);
			setNewMessage("");
			toast.success('پیام ارسال شد');
		} catch (error) {
			console.error('Error sending message:', error);
			toast.error('خطا در ارسال پیام');
		} finally {
			setIsSubmitting(false);
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="text-center">
					<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
					<p className="mt-3 text-sm text-slate-500 dark:text-slate-300">در حال بارگذاری...</p>
				</div>
			</div>
		);
	}

	if (!ticket) {
		return (
			<div className="text-center py-12">
				<p className="text-slate-500 dark:text-slate-300">تیکت یافت نشد</p>
				<Link
					to="/user-dashboard"
					className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
				>
					<ArrowRight className="h-4 w-4" />
					بازگشت به داشبورد
				</Link>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Link
					to="/user-dashboard"
					className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400"
				>
					<ArrowRight className="h-4 w-4" />
					بازگشت به داشبورد
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
								{ticket.subject}
							</h1>
						</div>
						<p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
							{ticket.description}
						</p>
						<div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
							<div className="flex items-center gap-2">
								<Calendar className="h-4 w-4" />
								<span>ایجاد: {new Date(ticket.created_at).toLocaleDateString('fa-IR')}</span>
							</div>
							<div className="flex items-center gap-2">
								<Clock className="h-4 w-4" />
								<span>به‌روزرسانی: {new Date(ticket.updated_at).toLocaleDateString('fa-IR')}</span>
							</div>
						</div>
					</div>
					<div className="flex flex-wrap items-center gap-3">
						<span
							className={`inline-flex items-center gap-1 rounded-xl px-4 py-2 text-sm font-semibold ${PRIORITY_STYLES[ticket.priority]}`}
						>
							اولویت: {ticket.priority}
						</span>
						<span
							className={`inline-flex items-center gap-1 rounded-xl px-4 py-2 text-sm font-semibold ${STATUS_STYLES[ticket.status]}`}
						>
							{ticket.status}
						</span>
					</div>
				</div>
			</div>

			{/* Messages Section */}
			<div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70">
				<div className="mb-6 flex items-center gap-2">
					<MessageCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
					<h2 className="text-lg font-semibold text-slate-900 dark:text-white">
						پیام‌ها
					</h2>
					<span className="text-sm text-slate-500 dark:text-slate-400">
						({messages.length})
					</span>
				</div>

				<div className="space-y-4">
					{messages.length === 0 ? (
						<div className="text-center py-8 text-slate-500 dark:text-slate-400">
							<p>هنوز پیامی ثبت نشده است</p>
						</div>
					) : (
						messages.map((message) => {
							const isUserMessage = message.sender_role === "user";
							return (
								<div
									key={message.id}
									className={`flex gap-4 ${isUserMessage ? "flex-row-reverse" : ""}`}
								>
									<div
										className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
											isUserMessage
												? "bg-indigo-500 text-white"
												: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
										}`}
									>
										<User className="h-5 w-5" />
									</div>
									<div
										className={`flex-1 space-y-2 ${isUserMessage ? "text-right" : ""}`}
									>
										<div className="flex items-center gap-2">
											<span className="text-sm font-semibold text-slate-900 dark:text-white">
												{message.sender_name || 'کاربر'}
											</span>
											<span className="text-xs text-slate-400 dark:text-slate-500">
												{new Date(message.created_at).toLocaleString('fa-IR')}
											</span>
										</div>
										<div
											className={`rounded-2xl p-4 ${
												isUserMessage
													? "bg-indigo-50 text-slate-900 dark:bg-indigo-500/20 dark:text-white"
													: "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
											}`}
										>
											<p className="text-sm leading-relaxed">{message.message}</p>
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
				{ticket.status !== "بسته شده" && (
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
						<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<button
								type="button"
								className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
							>
								<Paperclip className="h-4 w-4" />
								افزودن فایل
							</button>
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

				{ticket.status === "بسته شده" && (
					<div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-700 dark:bg-slate-800">
						<p className="text-sm text-slate-600 dark:text-slate-300">
							این تیکت بسته شده است و امکان ارسال پیام جدید وجود ندارد.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
