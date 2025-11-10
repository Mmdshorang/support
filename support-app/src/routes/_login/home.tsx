import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_login/home")({
	component: () => (
		<div className="p-4">
			<h1 className="text-2xl font-bold">Home</h1>
			<p>Home page.</p>
		</div>
	),
});

