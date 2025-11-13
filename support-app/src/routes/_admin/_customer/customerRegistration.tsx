import { createFileRoute } from "@tanstack/react-router";
import CustomerRegistrationForm from "../../../pages/Admin/customerRegistration";

export const Route = createFileRoute("/_admin/_customer/customerRegistration")({
  component: CustomerRegistrationForm,
});
