import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAtomValue } from "jotai";
import { toast } from "react-toastify";
import { User, Lock } from "lucide-react";
import { userAtom } from "../../stores/auth";
import { authApi } from "../../services/api/auth";

type ApiErrorResponse = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

const getErrorMessage = (error: unknown) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as ApiErrorResponse).response === "object"
  ) {
    const apiError = error as ApiErrorResponse;
    const message = apiError.response?.data?.message;
    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }
  }
  return "خطای غیرمنتظره رخ داد";
};

export const Route = createFileRoute("/_user/settings")({
  component: UserSettingsPage,
});

function UserSettingsPage() {
  const user = useAtomValue(userAtom);
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsUpdatingProfile(true);
      await authApi.updateDetails(profileForm);
      toast.success("اطلاعات پروفایل با موفقیت بروزرسانی شد");
    } catch (error: unknown) {
      console.error("Error updating profile:", error);
      toast.error(getErrorMessage(error) || "خطا در بروزرسانی اطلاعات");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("رمز عبور جدید و تکرار آن یکسان نیستند");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("رمز عبور باید حداقل ۶ کاراکتر باشد");
      return;
    }

    try {
      setIsUpdatingPassword(true);
      await authApi.updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success("رمز عبور با موفقیت تغییر کرد");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: unknown) {
      console.error("Error updating password:", error);
      toast.error(getErrorMessage(error) || "خطا در تغییر رمز عبور");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const tabs = [
    { id: "profile" as const, label: "پروفایل", icon: User },
    { id: "password" as const, label: "تغییر رمز عبور", icon: Lock },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-slate-200 dark:border-slate-700">
          <nav className="flex gap-2 p-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-indigo-500 text-white shadow-md"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "profile" && (
            <div className="max-w-2xl">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                اطلاعات پروفایل
              </h2>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    نام کامل
                  </label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, name: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    نام کاربری
                  </label>
                  <input
                    type="text"
                    value={user?.username || ""}
                    disabled
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    نام کاربری قابل تغییر نیست
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    ایمیل
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, email: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    شماره تماس
                  </label>
                  <input
                    type="tel"
                    dir="ltr"
                    value={profileForm.phone}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, phone: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdatingProfile ? "در حال بروزرسانی..." : "ذخیره تغییرات"}
                </button>
              </form>
            </div>
          )}

          {activeTab === "password" && (
            <div className="max-w-2xl">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                تغییر رمز عبور
              </h2>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    رمز عبور فعلی
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        currentPassword: e.target.value,
                      })
                    }
                    required
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    رمز عبور جدید
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      })
                    }
                    required
                    minLength={6}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    تکرار رمز عبور جدید
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                    minLength={6}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdatingPassword
                    ? "در حال تغییر رمز عبور..."
                    : "تغییر رمز عبور"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
