import { Link } from "react-router-dom";
import {
  BookOpen,
  Brain,
  CalendarDays,
  LineChart,
  ScanLine,
  Trophy,
  Target,
  Sparkles,
  Clock
} from "lucide-react";

export default function Dashboard() {
  const cards = [
    {
      title: "OCR Note Scanner",
      description: "Scan notes and convert them into smart study materials.",
      icon: ScanLine,
      path: "/notes",
      color: "bg-blue-50 text-blue-700"
    },
    {
      title: "AI Tutor",
      description: "Get personalized explanations powered by AI.",
      icon: Brain,
      path: "/tutor",
      color: "bg-green-50 text-green-700"
    },
    {
      title: "Quiz Generator",
      description: "Create quizzes instantly from scanned notes.",
      icon: BookOpen,
      path: "/quiz",
      color: "bg-amber-50 text-amber-700"
    },
    {
      title: "Study Planner",
      description: "Build smart revision schedules and exam plans.",
      icon: CalendarDays,
      path: "/study-planner",
      color: "bg-purple-50 text-purple-700"
    },
    {
      title: "Analytics",
      description: "Track performance, strengths and weak topics.",
      icon: LineChart,
      path: "/analytics",
      color: "bg-slate-100 text-slate-700"
    }
  ];

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      {/* Hero */}
      <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 p-8 text-white shadow-xl">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur">
          <Sparkles size={16} />
          AI-Powered Learning Companion
        </span>

        <h1 className="mt-6 max-w-4xl text-4xl font-bold leading-tight md:text-6xl">
          Learn Smarter.
          <br />
          Achieve More.
        </h1>

        <p className="mt-5 max-w-2xl text-lg text-blue-100">
          Transform handwritten notes into quizzes, AI tutoring
          sessions, personalized study plans and learning analytics.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            to="/notes"
            className="rounded-xl bg-white px-6 py-3 font-semibold text-blue-700 transition hover:scale-105"
          >
            Scan Notes
          </Link>

          <Link
            to="/analytics"
            className="rounded-xl border border-white/30 px-6 py-3 font-semibold text-white backdrop-blur"
          >
            View Analytics
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="mt-8 grid gap-5 md:grid-cols-4">
        <StatCard
          icon={<BookOpen size={22} />}
          title="Notes Scanned"
          value="24"
        />

        <StatCard
          icon={<Target size={22} />}
          title="Quizzes Completed"
          value="18"
        />

        <StatCard
          icon={<Clock size={22} />}
          title="Study Hours"
          value="32h"
        />

        <StatCard
          icon={<Trophy size={22} />}
          title="Learning Score"
          value="89%"
        />
      </section>

      {/* Main Features */}
      <section className="mt-10">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">
            Learning Tools
          </h2>

          <span className="text-sm text-slate-500">
            Everything you need to study effectively
          </span>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <Link
                key={card.title}
                to={card.path}
                className="group rounded-3xl bg-white p-6 shadow-sm transition-all hover:-translate-y-2 hover:shadow-lg"
              >
                <div
                  className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${card.color}`}
                >
                  <Icon size={26} />
                </div>

                <h3 className="text-lg font-bold text-slate-900">
                  {card.title}
                </h3>

                <p className="mt-2 text-sm text-slate-600">
                  {card.description}
                </p>

                <span className="mt-4 inline-block text-sm font-semibold text-blue-600 opacity-0 transition group-hover:opacity-100">
                  Open →
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Learning Progress */}
      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900">
            Weekly Goal Progress
          </h3>

          <p className="mt-2 text-slate-600">
            7 of 10 study sessions completed this week.
          </p>

          <div className="mt-5 h-4 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-blue-600"
              style={{ width: "70%" }}
            />
          </div>

          <p className="mt-3 text-sm font-medium text-blue-700">
            70% Completed
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900">
            AI Recommendation
          </h3>

          <div className="mt-4 rounded-2xl bg-blue-50 p-4">
            <p className="text-slate-700">
              Your weakest topic appears to be
              <span className="font-semibold text-blue-700">
                {" "}
                Linear Equations
              </span>
              . Generate another quiz and schedule a revision session.
            </p>
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="mt-10 rounded-3xl bg-white p-6 shadow-sm">
        <h3 className="text-xl font-bold text-slate-900">
          Recent Activity
        </h3>

        <div className="mt-5 space-y-4">
          <ActivityItem
            title="Algebra Notes Scanned"
            time="2 hours ago"
          />

          <ActivityItem
            title="Completed Biology Quiz"
            time="Yesterday"
          />

          <ActivityItem
            title="Generated Study Plan"
            time="2 days ago"
          />
        </div>
      </section>
    </main>
  );
}

function StatCard({ icon, title, value }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
        {icon}
      </div>

      <p className="text-sm text-slate-500">{title}</p>

      <h2 className="mt-2 text-3xl font-bold text-slate-900">
        {value}
      </h2>
    </div>
  );
}

function ActivityItem({ title, time }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border p-4">
      <div>
        <h4 className="font-semibold text-slate-900">
          {title}
        </h4>

        <p className="text-sm text-slate-500">
          {time}
        </p>
      </div>
    </div>
  );
}