import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { router } from "./main";
import "./index.css";
import { ThemeProvider } from "./components/ui/theme-provider";

const queryClient = new QueryClient();

export function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <ToastContainer
          position="top-center"
          newestOnTop
          autoClose={5000}
          pauseOnHover
          closeOnClick
          rtl
        />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
