import { createFileRoute } from "@tanstack/react-router";
import SubmitTicketPage from "../../pages/Users/submitTicket";
import { requireAuth } from "../../lib/auth-guard";

export const Route = createFileRoute("/_user/new-ticket")({
  component: SubmitTicketPage,
  beforeLoad: () => {
    requireAuth();
  },
});
