import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";
import useOnlineStatus from "../hooks/useOnlineStatus";

import {
  BookOpen,
  Brain,
  CalendarDays,
  LineChart,
  ScanLine,
  Trophy,
  Target,
  Sparkles,
  Clock,
  Wifi,
  WifiOff,
  Download,
  ArrowRight
} from "lucide-react";

export default function Dashboard() {
  const isOnline = useOnlineStatus();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(
    localStorage.getItem("learnify_user") || "{}"
  );

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get("/analytics");
      setAnalytics(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      title: "OCR Note Scanner",
      description:
        "Convert handwritten notes into digital learning resources.",
      icon: ScanLine,
      path: "/notes",
      color: "bg-blue-50 text-blue-700"
    },
    {
      title: "AI Tutor",
      description:
        "Ask questions and receive personalized explanations.",
      icon: Brain,
      path: "/tutor",
      color: "bg-green-50 text-green-700"
    },
    {
      title: "Quiz Generator",
      description:
        "Generate practice questions from your notes instantly.",
      icon: BookOpen,
      path: "/quiz",
      color: "bg-amber-50 text-amber-700"
    },
    {
      title: "Study Planner",
      description:
        "Create revision schedules based on exams and goals.",
      icon: CalendarDays,
      path: "/study-planner",
      color: "bg-purple-50 text-purple-700"
    },
    {
      title: "Analytics",
      description:
        "Track progress, strengths and weak learning areas.",
      icon: LineChart,
      path: "/analytics",
      color: "bg-slate-100 text-slate-700"
    }
  ];

  const progress =
    analytics?.totalQuizzes > 0
      ? Math.round(
          (analytics.completedQuizzes /
            analytics.totalQuizzes) *
            100
        )
      : 0;

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-10">
      {/* HERO */}
      <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 p-6 text-white shadow-xl md:p-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur">
              <Sparkles size={16} />
              AI-Powered Learning Companion
            </span>

            <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl md:text-6xl">
              Welcome back,
              <br />
              {user?.firstName || "Student"} 👋
            </h1>

            <p className="mt-4 max-w-2xl text-blue-100">
              Learnify transforms your notes into quizzes,
              AI tutoring sessions, study plans and learning
              analytics.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/notes"
                className="rounded-xl bg-white px-5 py-3 font-semibold text-blue-700 transition hover:scale-105"
              >
                Scan Notes
              </Link>

              <Link
                to="/analytics"
                className="rounded-xl border border-white/30 px-5 py-3 font-semibold text-white"
              >
                View Analytics
              </Link>
            </div>
          </div>

          <div className="rounded-3xl bg-white/10 p-6 backdrop-blur">
            <div className="flex items-center gap-3">
              {isOnline ? (
                <>
                  <Wifi className="text-green-300" />
                  <span>Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="text-yellow-300" />
                  <span>Offline Mode</span>
                </>
              )}
            </div>

            <p className="mt-3 text-sm text-blue-100">
              Access saved notes, quizzes and study plans
              even without internet.
            </p>
          </div>
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <section className="mt-8">
        <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">
          Quick Actions
        </h2>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <QuickAction
            icon={<ScanLine size={20} />}
            label="Scan Note"
            path="/notes"
          />

          <QuickAction
            icon={<BookOpen size={20} />}
            label="Generate Quiz"
            path="/quiz"
          />

          <QuickAction
            icon={<Brain size={20} />}
            label="AI Tutor"
            path="/tutor"
          />

          <QuickAction
            icon={<CalendarDays size={20} />}
            label="Study Plan"
            path="/study-planner"
          />
        </div>
      </section>

      {/* STATS */}
      <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          icon={<BookOpen size={22} />}
          title="Notes"
          value={analytics?.totalNotes || 0}
        />

        <StatCard
          icon={<Target size={22} />}
          title="Quizzes"
          value={analytics?.totalQuizzes || 0}
        />

        <StatCard
          icon={<Clock size={22} />}
          title="Completed"
          value={analytics?.completedQuizzes || 0}
        />

        <StatCard
          icon={<Trophy size={22} />}
          title="Progress"
          value={`${progress}%`}
        />

        <StatCard
          icon={
            isOnline ? (
              <Wifi size={22} />
            ) : (
              <WifiOff size={22} />
            )
          }
          title="Status"
          value={isOnline ? "Online" : "Offline"}
        />
      </section>

      {/* FEATURES */}
      <section className="mt-10">
        <h2 className="mb-5 text-2xl font-bold text-slate-900 dark:text-white">
          Learning Tools
        </h2>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <Link
                key={card.title}
                to={card.path}
                className="group rounded-3xl bg-white p-6 shadow-sm transition-all hover:-translate-y-2 hover:shadow-lg dark:bg-slate-800"
              >
                <div
                  className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${card.color}`}
                >
                  <Icon size={26} />
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {card.title}
                </h3>

                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  {card.description}
                </p>

                <div className="mt-4 flex items-center gap-2 text-blue-600 opacity-0 transition group-hover:opacity-100">
                  Open
                  <ArrowRight size={16} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* PROGRESS */}
      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-800">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Learning Progress
          </h3>

          <p className="mt-2 text-slate-600 dark:text-slate-300">
            Overall quiz completion progress.
          </p>

          <div className="mt-5 h-4 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="mt-3 text-sm font-semibold text-blue-700">
            {progress}% Complete
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-800">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            AI Recommendation
          </h3>

          <div className="mt-4 rounded-2xl bg-blue-50 p-4">
            <p className="text-slate-700">
              Focus on topics with lower quiz scores.
              Generate more quizzes and review your weak
              subjects regularly.
            </p>
          </div>
        </div>
      </section>

      {/* RECENT ACTIVITY */}
      <section className="mt-10 rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-800">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          Recent Activity
        </h3>

        <div className="mt-5">
          {loading ? (
            <p className="text-slate-500">
              Loading activity...
            </p>
          ) : (
            <div className="rounded-2xl border border-dashed p-8 text-center">
              <p className="text-slate-500">
                Activity tracking coming soon.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function StatCard({ icon, title, value }) {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-sm dark:from-slate-800 dark:to-slate-700">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-700">
        {icon}
      </div>

      <p className="text-sm text-slate-500">
        {title}
      </p>

      <h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
        {value}
      </h2>
    </div>
  );
}

function QuickAction({ icon, label, path }) {
  return (
    <Link
      to={path}
      className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md dark:bg-slate-800"
    >
      <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
        {icon}
      </div>

      <span className="
