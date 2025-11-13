import { createFileRoute } from "@tanstack/react-router";
import CustomerRegistrationForm from "../../../pages/Admin/customerRegistration";
import { requireAdmin } from "../../../lib/auth-guard";

export const Route = createFileRoute("/_admin/_customer/customerRegistration")({
  component: CustomerRegistrationForm,
  beforeLoad: () => {
    requireAdmin();
  },
});
