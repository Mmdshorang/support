import { createFileRoute } from "@tanstack/react-router";
import StatusTicketPage from "../../../pages/Admin/statusTicket";
import { requireAdmin } from "../../../lib/auth-guard";

export const Route = createFileRoute("/_admin/_statusTicket/statusTicket")({
	component: StatusTicketPage,
	beforeLoad: () => {
		requireAdmin();
	},
});
