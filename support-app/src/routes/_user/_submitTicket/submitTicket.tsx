import { createFileRoute } from "@tanstack/react-router";
import SubmitTicketPage from "../../../pages/Users/submitTicket";

export const Route = createFileRoute("/_user/_submitTicket/submitTicket")({
  component: SubmitTicketPage,
});
