
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./theme-provider";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme((current) => (current === "light" ? "dark" : "light"));
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
      title="تغییر تم"
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5 text-gray-600" />
      ) : (
        <Sun className="h-5 w-5 text-yellow-400" />
      )}
    </button>
  );
}
