import { createFileRoute } from "@tanstack/react-router";
import logo from "../../assets/logo.svg";

export const Route = createFileRoute("/_login/login")({
  component: () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4 py-12">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 max-w-md w-full space-y-8 border border-white/20">
        <div className="flex flex-col items-center">
          <img
            src={logo}
            alt="Logo"
            className="w-20 h-20 mb-3 shadow-md border border-white/30"
          />
          <h1 className="text-3xl font-extrabold text-white drop-shadow-md">
            پشتیبانی حسابان
          </h1>
          <p className="text-white/80 mt-2 text-xl">ورود به سامانه</p>
        </div>

        <form className="space-y-6 mt-6" onSubmit={() => {}}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-white/90 mb-1"
            >
              نام کاربری
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={""}
              onChange={() => {}}
              className="w-full px-4 py-2 rounded-md bg-white/20 text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/60 focus:bg-white/30 transition"
              placeholder="نام کاربری خود را وارد کنید"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-white/90 mb-1"
            >
              رمز عبور
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={""}
              onChange={() => {}}
              className="w-full px-4 py-2 rounded-md bg-white/20 text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/60 focus:bg-white/30 transition"
              placeholder="رمز عبور خود را وارد کنید"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 text-white bg-indigo-600 hover:bg-indigo-700 font-semibold rounded-md shadow-lg focus:outline-none focus:ring-2 focus:ring-white/70 transition disabled:opacity-70"
          >
            {"ورود"}
          </button>
        </form>

        {/* لینک ثبت‌نام */}
        <p className="text-center text-sm text-white/80 mt-4">
          حساب ندارید؟{" "}
          <a
            href="/register"
            className="font-semibold text-white hover:text-yellow-300 transition"
          >
            ثبت‌نام کنید
          </a>
        </p>
      </div>
    </div>
  ),
});
