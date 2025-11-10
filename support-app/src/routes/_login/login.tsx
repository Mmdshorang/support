import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_login/login")({
	component: () => (
		<div className="p-4">
			<h1 className="text-2xl font-bold">Login</h1>
			<p>Login page.</p>
		</div>
	),
});

