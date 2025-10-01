import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { TolgeeProvider } from "@tolgee/react";
import { useAtom } from "jotai/react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { router } from "./main";
import { baseUrlAtom } from "./store/base_api";
import { getTolgee, tolgeeLanguageEffect } from "./utils/tolgee";

import "./index.css";
import { ThemeProvider } from "./components";

const queryClient = new QueryClient();

export function App() {
	// useAtom(sentryLoginEffect); // TODO: Implement sentry side effect
	useAtom(tolgeeLanguageEffect);
	useAtom(baseUrlAtom); // Just to show in devtools

	return (
		<ThemeProvider>
			<QueryClientProvider client={queryClient}>
				<TolgeeProvider tolgee={getTolgee()} fallback="Loading...">
					<RouterProvider router={router} />
					<ToastContainer
						position="top-center"
						newestOnTop
						autoClose={5000}
						pauseOnHover
						closeOnClick
						rtl
					/>
				</TolgeeProvider>
			</QueryClientProvider>
		</ThemeProvider>
	);
}
