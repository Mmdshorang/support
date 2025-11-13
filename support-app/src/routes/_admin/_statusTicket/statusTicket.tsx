import { createFileRoute } from "@tanstack/react-router";
import StatusTicketPage from "../../../pages/Admin/statusTicket";

export const Route = createFileRoute("/_admin/_statusTicket/statusTicket")({
	component: StatusTicketPage,
});
