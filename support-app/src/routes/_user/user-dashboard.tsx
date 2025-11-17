import { createFileRoute } from "@tanstack/react-router"
import { requireUser } from "../../lib/auth-guard";
import UserDashboard from "../../pages/Users/Dashboard";


export const Route = createFileRoute("/_user/user-dashboard")({
	component: UserDashboard,
	beforeLoad: () => {
		requireUser();
	},
});
