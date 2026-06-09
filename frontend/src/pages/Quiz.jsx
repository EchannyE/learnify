import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import LoadingButton from "../components/LoadingButton";
import useOnlineStatus from "../hooks/useOnlineStatus";
import { useToast } from "../context/ToastContext";
import { getOfflineItems, saveOfflineItems } from "../utils/offlineDb";
import { downloadPdf, formatQuizForDownload } from "../utils/downloadFile";

export default function Quiz() {
  const [searchParams] = useSearchParams();
  const noteId = searchParams.get("noteId");
  const isOnline = useOnlineStatus();
  const toast = useToast();

  const [questionType, setQuestionType] = useState("mcq");
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchQuizzes = async () => {
    try {
      if (!isOnline) {
        const offline = await getOfflineItems("quizzes");
        setQuizzes(offline);
        return;
      }
      const res = await api.get("/quizzes");
      const server = res.data.data || [];
      setQuizzes(server);
      await saveOfflineItems("quizzes", server);
    } catch {
      const offline = await getOfflineItems("quizzes");
      setQuizzes(offline);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, [isOnline]);

  const generateQuiz = async () => {
    if (!noteId) {
      return toast.error("Please open a note first — go to Notes and click Quiz on a saved note.");
    }
    if (!isOnline) {
      return toast.error("You're offline. Connect to the internet to generate a quiz.");
    }

    try {
      setLoading(true);
      await api.post("/quizzes/generate", { noteId, questionType, extractedText: "" });
      toast.success("Quiz generation started. Your quiz will appear below shortly.");
      await fetchQuizzes();
    } catch (err) {
      const msg = err?.response?.data?.message;
      toast.error(msg || "Failed to generate quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const downloadQuizPdf = (quiz) => {
    downloadPdf({
      filename: `${quiz.subject || "quiz"}-${quiz.topic || "learnify"}`,
      title: "LEARNIFY QUIZ",
      content: formatQuizForDownload(quiz),
      meta: { subject: quiz.subject, topic: quiz.topic, extra: `Type: ${quiz.questionType || "N/A"}` }
    });
  };

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 space-y-8">

      <section>
        <h1 className="text-3xl font-bold text-slate-900">Quiz Generator</h1>
        <p className="mt-2 text-slate-600 max-w-2xl">
          Generate AI-powered quizzes from your notes. Choose question style and instantly test your understanding.
        </p>
        {!isOnline && (
          <div className="mt-4 rounded-xl bg-yellow-50 p-3 text-sm text-yellow-800">
            Offline mode enabled — viewing saved quizzes only.
          </div>
        )}
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <label className="text-sm font-medium text-slate-600">Question Type</label>
            <select
              className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value)}
              disabled={!isOnline}
            >
              <option value="mcq">Multiple Choice</option>
              <option value="closed_ended">Closed-ended</option>
            </select>
          </div>

          <LoadingButton
            loading={loading}
            loadingText="Generating..."
            className="rounded-xl bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700"
            onClick={generateQuiz}
          >
            Generate Quiz
          </LoadingButton>
        </div>
      </section>

      <section className="space-y-6">
        {quizzes.length === 0 ? (
          <div className="rounded-xl bg-white p-6 text-center text-slate-500 shadow-sm">
            No quizzes generated yet.
          </div>
        ) : (
          quizzes.map((quiz) => (
            <div key={quiz._id} className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{quiz.subject} • {quiz.topic}</h2>
                  <p className="text-sm text-slate-500">Type: {quiz.questionType}</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
                    {quiz.questions?.length || 0} Questions
                  </span>
                  <button
                    onClick={() => downloadQuizPdf(quiz)}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Download PDF
                  </button>
                </div>
              </div>

              <div className="mt-6 space-y-5">
                {quiz.questions?.map((q, index) => (
                  <div key={index} className="rounded-xl bg-slate-50 p-5">
                    <p className="font-semibold text-slate-900">{index + 1}. {q.question}</p>
                    {q.options?.length > 0 && (
                      <div className="mt-3 grid gap-2">
                        {q.options.map((opt, i) => (
                          <div key={i} className="rounded-lg border bg-white px-3 py-2 text-sm text-slate-700">
                            {opt}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-4">
                      <p className="text-sm font-semibold text-green-700">Answer: {q.correctAnswer}</p>
                      {q.explanation && (
                        <p className="mt-2 text-sm text-slate-600">{q.explanation}</p>
                      )}
                    </div>
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
