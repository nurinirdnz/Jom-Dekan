import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="group relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#ECEBF7] text-slate-500 transition motion-safe:duration-150 hover:scale-105 hover:bg-slate-50 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 active:scale-95 dark:border-[#332C63] dark:text-slate-300 dark:hover:bg-[#231E4A] dark:hover:text-white"
    >
      <Sun
        className={`absolute h-5 w-5 transition-all motion-safe:duration-300 ${
          isDark ? "-rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
        }`}
        aria-hidden="true"
      />
      <Moon
        className={`absolute h-5 w-5 transition-all motion-safe:duration-300 ${
          isDark ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"
        }`}
        aria-hidden="true"
      />
    </button>
  );
}
