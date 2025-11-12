import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useSetAtom } from "jotai";
import { toast } from "react-toastify";
import { Eye, EyeOff, LogIn } from "lucide-react";
import logo from "../../assets/logo.svg";
import { authApi } from "../../services/api/auth";
import { userAtom } from "../../stores/auth";

export const Route = createFileRoute("/_login/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const setUser = useSetAtom(userAtom);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("لطفاً ایمیل و رمز عبور را وارد کنید");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.login({ email, password });

      if (response.success && response.data) {
        // Save user in store
        setUser(response.data.user);

        // Show success message
        toast.success(response.message || "ورود با موفقیت انجام شد");

        // Redirect based on role
        setTimeout(() => {
          if (response.data.user.role === "admin" || response.data.user.role === "support") {
            navigate({ to: "/dashboard" });
          } else {
            navigate({ to: "/user-dashboard" });
          }
        }, 500);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.message || "خطا در ورود به سیستم. لطفاً دوباره تلاش کنید";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4 py-12">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 max-w-md w-full space-y-8 border border-white/20">
        <div className="flex flex-col items-center">
          <img
            src={logo}
            alt="Logo"
            className="w-20 h-20 mb-3 shadow-md border border-white/30 rounded-full"
          />
          <h1 className="text-3xl font-extrabold text-white drop-shadow-md">
            پشتیبانی حسابان
          </h1>
          <p className="text-white/80 mt-2 text-lg">ورود به سامانه</p>
        </div>

        <form className="space-y-6 mt-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-white/90 mb-2"
            >
              ایمیل
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/60 focus:bg-white/30 transition"
              placeholder="example@email.com"
              disabled={isLoading}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-white/90 mb-2"
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
                className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/60 focus:bg-white/30 transition pr-12"
                placeholder="رمز عبور خود را وارد کنید"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition"
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
            className="w-full py-3 px-4 text-white bg-indigo-600 hover:bg-indigo-700 font-semibold rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-white/70 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
        <div className="mt-6 p-4 bg-white/10 rounded-lg border border-white/20">
          <p className="text-white/90 text-sm font-semibold mb-2">
            کاربران تست:
          </p>
          <div className="space-y-2 text-xs text-white/70">
            <div className="flex justify-between">
              <span>ادمین:</span>
              <button
                type="button"
                onClick={() => {
                  setEmail("admin@hesaban.com");
                  setPassword("password123");
                }}
                className="text-yellow-300 hover:text-yellow-200 underline"
              >
                admin@hesaban.com
              </button>
            </div>
            <div className="flex justify-between">
              <span>کاربر:</span>
              <button
                type="button"
                onClick={() => {
                  setEmail("ali@example.com");
                  setPassword("password123");
                }}
                className="text-yellow-300 hover:text-yellow-200 underline"
              >
                ali@example.com
              </button>
            </div>
            <p className="text-center mt-2 text-white/60">
              رمز عبور: password123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
