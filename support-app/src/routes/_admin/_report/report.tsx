import { createFileRoute } from "@tanstack/react-router";
import Report from "../../../pages/Admin/Report";
import { requireAdmin } from "../../../lib/auth-guard";

export const Route = createFileRoute("/_admin/_report/report")({
  component: Report,
  beforeLoad: () => {
    requireAdmin();
  },
});
