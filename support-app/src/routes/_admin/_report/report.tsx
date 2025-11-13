import { createFileRoute } from "@tanstack/react-router";
import Report from "../../../pages/Admin/Report";

export const Route = createFileRoute("/_admin/_report/report")({
  component: Report,
});
