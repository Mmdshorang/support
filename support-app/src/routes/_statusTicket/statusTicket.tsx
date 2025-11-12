import { createFileRoute } from "@tanstack/react-router";
import { StatusTicket } from "../../pages/statusTicket";

export const Route = createFileRoute("/_statusTicket/statusTicket")({
  component: StatusTicket,
});
