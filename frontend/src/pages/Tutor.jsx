import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import LoadingButton from "../components/LoadingButton";

const SUBJECTS = [
  "Mathematics", "English",  "Physics",
  "Chemistry",   "Biology",  "Economics", "Government",
];

// ── Parse whatever shape the backend returns ──────────────────────────────────
const parseAnswer = (data) => {
  if (!data) return { text: "No response generated.", ragChunksFound: 0 };

  // New shape: { answer, ragChunksFound, ... }
  if (data.answer) return { text: data.answer, ragChunksFound: data.ragChunksFound ?? 0 };

  // Plain string
  if (typeof data === "string") return { text: data, ragChunksFound: 0 };

  // Fallbacks
  const text = data.text || data.response || "No response generated.";
  return { text, ragChunksFound: data.ragChunksFound ?? 0 };
};

// ── Message bubble ─────────────────────────────────────────────────────────────
const Bubble = ({ msg }) => {
  const isUser  = msg.role === "user";
  const isError = msg.role === "error";

  return (
    <div
      className={`max-w-[80%] rounded-2xl p-4 text-sm whitespace-pre-wrap leading-relaxed ${
        isUser
          ? "ml-auto bg-blue-600 text-white"
          : isError
          ? "bg-red-50 border border-red-200 text-red-800"
          : "bg-slate-100 text-slate-800"
      }`}
    >
      {!isUser && !isError && (
        <p className="mb-1 text-xs font-semibold text-green-600 uppercase tracking-wide">
          Learnify Tutor
        </p>
      )}

      <div>{msg.text}</div>

      {/* RAG source indicator — only shown on AI messages */}
      {msg.role === "ai" && (
        <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
          <span className={msg.ragChunksFound > 0 ? "text-green-500" : ""}>
            {msg.ragChunksFound > 0 ? "✅" : "⚠️"}
          </span>
          <span>
            {msg.ragChunksFound > 0
              ? `${msg.ragChunksFound} curriculum source${msg.ragChunksFound > 1 ? "s" : ""} used`
              : "No curriculum context found — answer from general knowledge"}
          </span>
        </div>
      )}
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────────
export default function Tutor() {
  const [searchParams] = useSearchParams();
  const noteId = searchParams.get("noteId");

  const [subject,  setSubject]  = useState("Mathematics");
  const [topic,    setTopic]    = useState("");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading,  setLoading]  = useState(false);

  const chatEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const askTutor = async (e) => {
    e.preventDefault();
    const userText = question.trim();
    if (!userText) return;

    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setQuestion("");
    setLoading(true);

    try {
      const res = await api.post("/tutor/ask", {
        subject,
        topic:          topic         || undefined,
        question:       userText,
        noteId:         noteId        || undefined,
        curriculumType: "WAEC",       // fixed: was "curriculum"
      });

      const { text, ragChunksFound } = parseAnswer(res?.data?.data);

      setMessages((prev) => [
        ...prev,
        { role: "ai", text, ragChunksFound },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "error",
          text:
            err?.response?.data?.message ||
            "Unable to get a tutor response. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 space-y-6">

      {/* Header */}
      <section>
        <h1 className="text-3xl font-bold text-slate-900">AI Tutor</h1>
        <p className="mt-2 text-slate-600 max-w-2xl">
          Ask questions based on your notes and get step-by-step,
          curriculum-aligned explanations.
        </p>
        {noteId && (
          <p className="mt-2 text-xs text-blue-600 font-medium">
            📄 Answering with note context + WAEC curriculum RAG
          </p>
        )}
      </section>

      {/* Chat */}
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="h-[420px] overflow-y-auto space-y-4 p-2">

          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 gap-2">
              <span className="text-4xl">🎓</span>
              <p className="text-sm">Start by asking a question below</p>
            </div>
          )}

          {messages.map((msg, i) => <Bubble key={i} msg={msg} />)}

          {loading && (
            <div className="bg-slate-100 text-slate-500 rounded-2xl p-4 text-sm w-fit animate-pulse">
              Thinking…
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={askTutor} className="mt-4 flex flex-col gap-3 border-t pt-4">
          <div className="flex flex-col md:flex-row gap-3">
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-100"
            >
              {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
            </select>

            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full md:w-48 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-100"
              placeholder="Topic (optional)"
            />

            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-100"
              placeholder="Ask your question…"
            />
          </div>

          <div className="flex justify-end">
            <LoadingButton
              loading={loading}
              loadingText="Thinking…"
              className="rounded-xl bg-green-600 px-6 py-3 text-white font-semibold hover:bg-green-700"
              type="submit"
            >
              Ask Tutor
            </LoadingButton>
          </div>
        </form>
      </section>
    </main>
  );
}
