import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useSetAtom } from "jotai";
import { toast } from "react-toastify";
import { Eye, EyeOff, LogIn } from "lucide-react";
import logo from "../../assets/logo.svg";
import { authApi } from "../../services/api/auth";
import { userAtom } from "../../stores/auth";
import { redirectIfAuthenticated } from "../../lib/auth-guard";

export const Route = createFileRoute("/_login/login")({
  component: LoginPage,
  beforeLoad: () => {
    redirectIfAuthenticated();
  },
});

function LoginPage() {
  const setUser = useSetAtom(userAtom);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load saved credentials on mount
  useEffect(() => {
    const savedUsername = localStorage.getItem("remembered-username");
    const savedPassword = localStorage.getItem("remembered-password");
    const wasRemembered = localStorage.getItem("remember-me") === "true";

    if (wasRemembered && savedUsername && savedPassword) {
      setUsername(savedUsername);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error("لطفاً نام کاربری و رمز عبور را وارد کنید");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.login({ username, password });

      if (response.success && response.data) {
        setUser(response.data.user);

        // Handle remember me
        if (rememberMe) {
          localStorage.setItem("remembered-username", username);
          localStorage.setItem("remembered-password", password);
          localStorage.setItem("remember-me", "true");
        } else {
          localStorage.removeItem("remembered-username");
          localStorage.removeItem("remembered-password");
          localStorage.removeItem("remember-me");
        }

        // Show success message
        toast.success(response.message || "ورود با موفقیت انجام شد");

        // Small delay to ensure state is updated
        setTimeout(() => {
          // Force page reload to ensure all state is fresh
          window.location.href = "/dashboard";
        }, 300);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage =
        error?.response?.data?.message || "خطا در ورود به سیستم";
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 px-4 py-12">
      <div className="bg-white/95 dark:bg-slate-900/90 rounded-3xl shadow-2xl p-8 max-w-md w-full space-y-8 border border-white/40 dark:border-slate-800/60 backdrop-blur">
        <div className="flex flex-col items-center">
          <img
            src={logo}
            alt="Logo"
            className="w-20 h-20 mb-3 shadow-md border border-slate-200 rounded-2xl bg-white/90 p-3"
          />
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            پشتیبانی حسابان
          </h1>
          <p className="text-slate-500 dark:text-slate-300 mt-2 text-lg">
            ورود به سامانه
          </p>
        </div>

        <form className="space-y-6 mt-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2"
            >
              نام کاربری
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 text-slate-900 placeholder-slate-400 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition dark:bg-slate-800 dark:text-white dark:border-slate-700"
              placeholder="نام کاربری خود را وارد کنید"
              disabled={isLoading}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2"
            >
              رمز عبور
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 text-slate-900 placeholder-slate-400 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition pr-12 dark:bg-slate-800 dark:text-white dark:border-slate-700"
                placeholder="رمز عبور خود را وارد کنید"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-300 hover:text-indigo-500 dark:hover:text-indigo-300 transition"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setRememberMe(checked);
                  // Clear saved credentials if unchecked
                  if (!checked) {
                    localStorage.removeItem("remembered-username");
                    localStorage.removeItem("remembered-password");
                    localStorage.removeItem("remember-me");
                  }
                }}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer dark:border-slate-600 dark:bg-slate-800"
                disabled={isLoading}
              />
              <label
                htmlFor="remember-me"
                className="mr-2 block text-sm text-slate-700 dark:text-slate-300 cursor-pointer select-none"
              >
                مرا به خاطر بسپار
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 text-white bg-gradient-to-r from-indigo-600 via-sky-500 to-cyan-400 hover:from-indigo-500 hover:via-sky-400 hover:to-cyan-300 font-semibold rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                در حال ورود...
              </>
            ) : (
              <>
                <LogIn className="h-5 w-5" />
                ورود به سیستم
              </>
            )}
          </button>
          <div className="text-white text-center text-sm shadow-2xl rounded-2xl p-3 bg-gray-800">
            شماره تماس پشتیبانی:{" "}
            <span className="font-bold text-green-400">06142226578</span>
            <span className="text-gray-300 mx-2">{" "} | {" "}</span>
            <span className="font-bold text-green-400">09166429176</span>
          </div>
        </form>
      </div>
    </div>
  );
}
