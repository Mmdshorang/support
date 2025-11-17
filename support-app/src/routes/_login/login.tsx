import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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
  const [isLoading, setIsLoading] = useState(false);

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
      const errorMessage = error?.response?.data?.message || "خطا در ورود به سیستم";
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
          <p className="text-slate-500 dark:text-slate-300 mt-2 text-lg">ورود به سامانه</p>
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
        </form>

        {/* کاربران تست */}
        <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
          <p className="text-slate-700 dark:text-white text-sm font-semibold mb-2">
            کاربران تست:
          </p>
          <div className="space-y-2 text-xs text-slate-600 dark:text-slate-200">
            <div className="flex justify-between">
              <span>ادمین:</span>
              <button
                type="button"
                onClick={() => {
                  setUsername("admin");
                  setPassword("password123");
                }}
                className="text-indigo-600 dark:text-indigo-300 hover:text-indigo-400 underline"
              >
                admin
              </button>
            </div>
            <div className="flex justify-between">
              <span>کاربر:</span>
              <button
                type="button"
                onClick={() => {
                  setUsername("ali");
                  setPassword("password123");
                }}
                className="text-indigo-600 dark:text-indigo-300 hover:text-indigo-400 underline"
              >
                ali
              </button>
            </div>
            <p className="text-center mt-2 text-slate-500 dark:text-slate-300">
              رمز عبور: password123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
