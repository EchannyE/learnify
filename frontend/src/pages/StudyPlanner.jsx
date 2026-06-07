import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import LoadingButton from "../components/LoadingButton";
import useOnlineStatus from "../hooks/useOnlineStatus";
import { getOfflineItems, saveOfflineItems } from "../utils/offlineDb";
import {
  downloadPdf,
  downloadDocx,
  formatStudyPlanForDownload
} from "../utils/downloadFile";

export default function StudyPlanner() {
  const [searchParams] = useSearchParams();
  const noteId = searchParams.get("noteId");

  const isOnline = useOnlineStatus();

  const [examDate, setExamDate] = useState("");
  const [availableHoursPerDay, setAvailableHoursPerDay] = useState(2);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPlans = async () => {
    try {
      if (!isOnline) {
        const offline = await getOfflineItems("studyPlans");
        setPlans(offline);
        return;
      }

      const res = await api.get("/study-plans");
      const server = res.data.data || [];

      setPlans(server);
      await saveOfflineItems("studyPlans", server);
    } catch {
      const offline = await getOfflineItems("studyPlans");
      setPlans(offline);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [isOnline]);

  const generateStudyPlan = async (e) => {
    e.preventDefault();

    if (!isOnline) return alert("Offline mode: cannot generate plan.");
    if (!noteId) return alert("Please scan a note first.");

    try {
      setLoading(true);

      await api.post("/study-plans/generate", {
        noteId,
        examDate,
        availableHoursPerDay
      });

      alert("Study plan generation started.");
      await fetchPlans();
    } catch (err) {
      alert(err?.response?.data?.message || "Study planner failed.");
    } finally {
      setLoading(false);
    }
  };

  const downloadStudyPlanPdf = (plan) => {
    downloadPdf({
      filename: `study-plan-${plan.examDate?.slice(0, 10) || "learnify"}`,
      title: "LEARNIFY STUDY PLAN",
      content: formatStudyPlanForDownload(plan),
      meta: {
        subject: plan.plan?.[0]?.subject,
        topic: plan.plan?.[0]?.topic,
        extra: `Exam: ${plan.examDate?.slice(0, 10) || "N/A"}`
      }
    });
  };

  const downloadStudyPlanDocx = (plan) => {
    downloadDocx({
      filename: `study-plan-${plan.examDate?.slice(0, 10) || "learnify"}`,
      title: "LEARNIFY STUDY PLAN",
      content: formatStudyPlanForDownload(plan),
      meta: {
        subject: plan.plan?.[0]?.subject,
        topic: plan.plan?.[0]?.topic
      }
    });
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-yellow-600 focus:ring-2 focus:ring-yellow-100";

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 space-y-8">

      {/* HEADER */}
      <section>
        <h1 className="text-3xl font-bold text-slate-900">
          Study Planner
        </h1>

        <p className="mt-2 text-slate-600 max-w-2xl">
          Generate structured revision schedules from your notes based on your exam date and available study time.
        </p>

        {!isOnline && (
          <div className="mt-4 rounded-xl bg-yellow-50 p-3 text-sm text-yellow-800">
            Offline mode enabled — viewing saved plans only.
          </div>
        )}
      </section>

      {/* GENERATOR CARD */}
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <form onSubmit={generateStudyPlan} className="grid gap-4 md:grid-cols-3">

          <input
            type="date"
            className={inputClass}
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            disabled={!isOnline}
            required
          />

          <input
            type="number"
            min="1"
            className={inputClass}
            value={availableHoursPerDay}
            onChange={(e) =>
              setAvailableHoursPerDay(Number(e.target.value))
            }
            disabled={!isOnline}
            required
          />

          <LoadingButton
            loading={loading}
            loadingText="Generating..."
            className="rounded-xl bg-yellow-600 py-3 text-white font-semibold hover:bg-yellow-700"
          >
            Generate Plan
          </LoadingButton>

        </form>
      </section>

      {/* PLANS LIST */}
      <section className="space-y-6">

        {plans.length === 0 ? (
          <div className="rounded-xl bg-white p-6 text-center text-slate-500 shadow-sm">
            No study plans available yet.
          </div>
        ) : (
          plans.map((plan) => (
            <div
              key={plan._id}
              className="rounded-2xl border bg-white p-6 shadow-sm"
            >

              {/* HEADER */}
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Study Plan
                  </h2>

                  <p className="text-sm text-slate-500">
                    Exam Date: {plan.examDate?.slice(0, 10)}
                  </p>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => downloadStudyPlanPdf(plan)}
                    className="rounded-xl bg-yellow-600 px-4 py-2 text-sm text-white hover:bg-yellow-700"
                  >
                    PDF
                  </button>

                  <button
                    onClick={() => downloadStudyPlanDocx(plan)}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700"
                  >
                    DOCX
                  </button>
                </div>
              </div>

              {/* TIMELINE GRID */}
              <div className="mt-6 grid gap-4 md:grid-cols-2">

                {plan.plan?.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-xl bg-yellow-50 p-4 border border-yellow-100"
                  >

                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-900">
                        {item.day}
                      </h3>

                      <span className="text-xs font-medium text-yellow-700">
                        {item.durationMinutes} min
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-700">
                      {item.subject} • {item.topic}
                    </p>

                    <p className="mt-2 text-sm text-slate-600">
                      {item.task}
                    </p>

                  </div>
                ))}

              </div>
            </div>
          ))
        )}
      </section>

    </main>
  );
}