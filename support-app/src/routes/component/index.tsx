import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/component/")({
	component: () => (
		<div className="p-4">
			<h1 className="text-2xl font-bold">Components</h1>
			<p>Component index page.</p>
		</div>
	),
});

