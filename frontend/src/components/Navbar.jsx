import { Link, useLocation } from "react-router-dom";
import { BookOpenCheck, Sun, Moon } from "lucide-react";

export default function Navbar({ theme, toggleTheme, logout }) {
  const location = useLocation();

  const navLinkClass = (path) =>
    `transition hover:text-blue-600 ${
      location.pathname === path
        ? "text-blue-600 font-semibold"
        : "text-slate-600 dark:text-slate-300"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b bg-white/90 dark:bg-slate-900/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white">
            <BookOpenCheck size={22} />
          </div>

          <span className="text-xl font-bold text-slate-900 dark:text-white">
            Learnify
          </span>
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link className={navLinkClass("/notes")} to="/notes">Notes</Link>
          <Link className={navLinkClass("/quiz")} to="/quiz">Quiz</Link>
          <Link className={navLinkClass("/tutor")} to="/tutor">Tutor</Link>
          <Link className={navLinkClass("/study-planner")} to="/study-planner">Planner</Link>
          <Link className={navLinkClass("/analytics")} to="/analytics">Analytics</Link>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-3">
        </div>
      </nav>

    </header>
  );
}