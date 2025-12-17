import { createFileRoute } from "@tanstack/react-router";
import DirectTicketPage from "../../../pages/Admin/directTicket";
import { requireAdmin } from "../../../lib/auth-guard";

export const Route = createFileRoute("/_admin/_directTicket/directTicket")({
  component: DirectTicketPage,
  beforeLoad: () => {
    requireAdmin();
  },
});
