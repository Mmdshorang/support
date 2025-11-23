import { createFileRoute } from "@tanstack/react-router";
import UsersPage from "../../../pages/Admin/users";
import { requireAdmin } from "../../../lib/auth-guard";

export const Route = createFileRoute("/_admin/_users/users")({
  component: UsersPage,
  beforeLoad: () => {
    requireAdmin();
  },
});

