import { createRouter } from "@tanstack/react-router";
import { getDefaultStore } from "jotai";
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
// import { ErrorPage } from "./components/auth/auth";
// import { BackgroundContainer } from "./components/base";
import { routeTree } from "./routeTree.gen";
import { routerAtom } from "./router";

export const router = createRouter({
	routeTree: routeTree,
	// defaultPendingComponent: () => <BackgroundContainer />,
	// defaultErrorComponent: ErrorPage,
	// defaultNotFoundComponent: NotFoundPage,
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}
getDefaultStore().set(routerAtom, router); // HMR Hack

console.info("Main rendered");
const rootElement = document.getElementById("app")!;
if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<React.StrictMode>
			<App />
		</React.StrictMode>,
	);
}
