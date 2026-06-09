import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import LoadingButton from "../components/LoadingButton";

export default function Tutor() {
  const [searchParams] = useSearchParams();
  const noteId = searchParams.get("noteId");

  const [subject, setSubject] = useState("Mathematics");
  const [topic, setTopic] = useState("");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);

  const askTutor = async (e) => {
    e.preventDefault();

    if (!question.trim()) return;

    const userText = question;

    // Add user message immediately
    setMessages((prev) => [
      ...prev,
      { role: "user", text: userText }
    ]);

    setQuestion("");

    try {
      setLoading(true);

      const res = await api.post("/tutor/ask", {
        subject,
        topic: topic || undefined,
        question: userText,
        noteId,
        curriculum: "WAEC"
      });

      const data = res?.data?.data;

      // SAFE RESPONSE PARSING (handles all backend shapes)
      let answerText = "";

      if (typeof data === "string") {
        answerText = data;
      } else if (data?.answer) {
        answerText = data.answer;
      } else if (data?.text) {
        answerText = data.text;
      } else if (data?.response) {
        answerText = data.response;
      } else {
        answerText = "No response generated.";
      }

      const aiMessage = {
        role: "ai",
        text: answerText,
        ragChunksFound: data?.ragChunksFound ?? 0
      };

      setMessages((prev) => [...prev, aiMessage]);

    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text:
            error?.response?.data?.message ||
            "Unable to get tutor response. Please try again."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 space-y-6">

      <section>
        <h1 className="text-3xl font-bold text-slate-900">AI Tutor</h1>
        <p className="mt-2 text-slate-600 max-w-2xl">
          Ask questions based on your notes and get step-by-step explanations.
        </p>
      </section>

      {/* CHAT BOX */}
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="h-[420px] overflow-y-auto space-y-4 p-2">
          {messages.length === 0 && (
            <div className="text-center text-slate-500 mt-20">
              Start by asking a question 👇
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`max-w-[80%] rounded-2xl p-4 text-sm whitespace-pre-wrap ${
                msg.role === "user"
                  ? "ml-auto bg-blue-600 text-white"
                  : msg.role === "error"
                  ? "bg-red-50 border border-red-200 text-red-800"
                  : "bg-slate-100 text-slate-800"
              }`}
            >
              <div>{msg.text}</div>

              {msg.role === "ai" && (
                <div className="mt-2 text-xs text-slate-500">
                  RAG sources used: {msg.ragChunksFound}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="bg-slate-100 text-slate-600 rounded-2xl p-4 text-sm w-fit">
              Thinking...
            </div>
          )}
        </div>

        {/* INPUT */}
        <form
          onSubmit={askTutor}
          className="mt-4 flex flex-col gap-3 border-t pt-4"
        >

          <div className="flex flex-col md:flex-row gap-3">
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm"
            >
              <option>Mathematics</option>
              <option>English</option>
              <option>Physics</option>
              <option>Chemistry</option>
              <option>Biology</option>
              <option>Economics</option>
              <option>Government</option>
            </select>

            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm"
              placeholder="Topic (optional)"
            />
          </div>

          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm"
            placeholder="Ask your question..."
          />

          <div className="flex justify-end">
            <LoadingButton
              loading={loading}
              loadingText="Thinking..."
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
