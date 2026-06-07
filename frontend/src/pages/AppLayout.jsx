import { NavLink, useNavigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import useOnlineStatus from "../hooks/useOnlineStatus";
import {
  Home,
  BookOpen,
  Brain,
  CalendarDays,
  LineChart,
  User,
  Moon,
  Sun,
  LogOut
} from "lucide-react";

export default function AppLayout() {
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("learnify_theme") || "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");

    try {
      localStorage.setItem("learnify_theme", theme);
    } catch {}
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const logout = () => {
    localStorage.removeItem("learnify_token");
    navigate("/login");
  };

  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/notes", icon: BookOpen, label: "Notes" },
    { to: "/quiz", icon: Brain, label: "Quiz" },
    { to: "/tutor", icon: User, label: "Tutor" },
    { to: "/study-planner", icon: CalendarDays, label: "Planner" },
    { to: "/analytics", icon: LineChart, label: "Stats" }
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">

      {/* ---------------- SIDEBAR (DESKTOP) ---------------- */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-white dark:bg-slate-900 dark:border-slate-800 p-4">

        <h1 className="text-xl font-bold text-blue-600 mb-6">
          Learnify
        </h1>

        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition
                  ${
                    isActive
                      ? "bg-blue-50 text-blue-600 font-semibold"
                      : "text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={toggleTheme}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <span className="flex items-center gap-2">
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </span>
          </button>

          <button
            onClick={logout}
            className="flex items-center justify-between rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <span className="flex items-center gap-2">
              <LogOut size={16} /> Logout
            </span>
          </button>
        </div>

        <div className="mt-auto text-xs text-slate-500">
          Status: {isOnline ? "Online" : "Offline"}
        </div>
      </aside>

      {/* ---------------- MAIN CONTENT ---------------- */}
      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* ---------------- MOBILE BOTTOM NAV ---------------- */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white dark:bg-slate-900 dark:border-slate-800 md:hidden">
        <div className="flex justify-around py-2">

          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 text-xs transition
                  ${
                    isActive
                      ? "text-blue-600"
                      : "text-slate-500"
                  }`
                }
              >
                <Icon size={20} />
                {item.label}
              </NavLink>
            );
          })}

        </div>
      </div>

    </div>
  );
}