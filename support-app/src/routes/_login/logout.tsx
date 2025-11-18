import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { useSetAtom } from "jotai";
import { toast } from "react-toastify";
import { userAtom } from "../../stores/auth";
import { authApi } from "../../services/api/auth";

export const Route = createFileRoute("/_login/logout")({
  component: LogoutPage,
});

function LogoutPage() {
  const navigate = useNavigate();
  const setUser = useSetAtom(userAtom);
  const hasLoggedOut = useRef(false);

  useEffect(() => {
    // Prevent multiple executions
    if (hasLoggedOut.current) return;
    hasLoggedOut.current = true;

    // Clear user data
    authApi.logout();
    setUser(null);

    // Show message
    toast.info("خروج از سیستم انجام شد");

    // Redirect to login
    setTimeout(() => {
      navigate({ to: "/login" });
    }, 500);
  }, [navigate, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8">
        <div className="flex items-center gap-3 text-white">
          <div className="h-8 w-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          <span className="text-lg font-semibold">در حال خروج...</span>
        </div>
      </div>
    </div>
  );
}
