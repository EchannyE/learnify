import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

export default function Analytics() {
  const toast = useToast();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get("/analytics");
      setAnalytics(res.data.data);
    } catch (err) {
      const msg = err?.response?.data?.message;
      toast.error(msg || "Failed to load analytics. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const completionRate = useMemo(() => {
    if (!analytics?.totalQuizzes) return 0;
    return Math.round((analytics.completedQuizzes / analytics.totalQuizzes) * 100);
  }, [analytics]);

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="space-y-4">
          <div className="h-10 w-64 animate-pulse rounded-xl bg-slate-200" />
          <div className="grid gap-5 md:grid-cols-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="h-40 animate-pulse rounded-3xl bg-slate-200" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (!analytics) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold">No analytics available yet</h2>
          <p className="mt-2 text-slate-600">
            Start scanning notes, generating quizzes and studying with Learnify to view performance analytics.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <section className="rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 p-8 text-white shadow-lg">
        <h1 className="text-4xl font-bold">Learning Analytics</h1>
        <p className="mt-3 max-w-2xl text-blue-100">
          Track your study habits, quiz performance, weak areas, and learning progress across all subjects.
        </p>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-4">
        <AnalyticsCard title="Total Notes" value={analytics.totalNotes || 0} color="blue" />
        <AnalyticsCard title="Total Quizzes" value={analytics.totalQuizzes || 0} color="green" />
        <AnalyticsCard title="Completed" value={analytics.completedQuizzes || 0} color="amber" />
        <AnalyticsCard title="Completion Rate" value={`${completionRate}%`} color="purple" />
      </section>

      <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Quiz Completion Progress</h2>
          <span className="font-semibold text-blue-700">{completionRate}%</span>
        </div>
        <div className="mt-4 h-4 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-blue-600 transition-all"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-red-600">Weak Topics</h2>
            <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-600">Needs Attention</span>
          </div>
          <div className="mt-5 space-y-3">
            {analytics.weakTopics?.length ? (
              analytics.weakTopics.map((item) => (
                <div key={item._id} className="rounded-2xl border border-red-100 bg-red-50 p-4">
                  <h3 className="font-semibold text-slate-900">{item.subject}</h3>
                  <p className="text-sm text-slate-600">{item.topic}</p>
                </div>
              ))
            ) : (
              <p className="text-slate-500">No weak topics detected.</p>
            )}
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-green-600">Mastered Topics</h2>
            <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-600">Excellent</span>
          </div>
          <div className="mt-5 space-y-3">
            {analytics.masteredTopics?.length ? (
              analytics.masteredTopics.map((item) => (
                <div key={item._id} className="rounded-2xl border border-green-100 bg-green-50 p-4">
                  <h3 className="font-semibold text-slate-900">{item.subject}</h3>
                  <p className="text-sm text-slate-600">{item.topic}</p>
                </div>
              ))
            ) : (
              <p className="text-slate-500">No mastered topics yet.</p>
            )}
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-blue-100 bg-blue-50 p-6">
        <h2 className="text-xl font-bold text-blue-700">AI Learning Recommendation</h2>
        <p className="mt-3 text-slate-700">
          Focus on topics listed under weak areas. Generate more quizzes, schedule revision sessions
          in Study Planner, and use AI Tutor for personalized explanations.
        </p>
      </section>
    </main>
  );
}

function AnalyticsCard({ title, value, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    amber: "bg-amber-50 text-amber-700",
    purple: "bg-purple-50 text-purple-700"
  };
  return (
    <div className={`rounded-3xl p-6 shadow-sm ${colors[color]}`}>
      <p className="text-sm font-medium">{title}</p>
      <h2 className="mt-3 text-4xl font-bold">{value}</h2>
    </div>
  );
}
