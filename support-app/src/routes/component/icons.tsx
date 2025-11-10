import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/component/icons")({
	component: () => (
		<div className="p-4">
			<h1 className="text-2xl font-bold">Icons</h1>
			<p>Icons component page.</p>
		</div>
	),
});

