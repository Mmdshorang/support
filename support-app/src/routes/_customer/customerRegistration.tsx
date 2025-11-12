import { createFileRoute } from "@tanstack/react-router";
import CustomerRegistrationForm from "../../pages/customerRegistration";

export const Route = createFileRoute("/_customer/customerRegistration")({
  component: CustomerRegistrationForm,
});
