import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: () => (
		<div className="p-4">
			<h1 className="text-2xl font-bold">Welcome</h1>
			<p>This is the home page.</p>
		</div>
	),
});

