import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	beforeLoad: () => {
		// Redirect root to login page
		throw redirect({ to: "/login" });
	},
});
