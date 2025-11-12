import { createFileRoute } from "@tanstack/react-router";
import SubmitTicketPage from "../../pages/submitTicket";

export const Route = createFileRoute("/_submitTicket/submitTicket")({
	component: SubmitTicketPage,
});
