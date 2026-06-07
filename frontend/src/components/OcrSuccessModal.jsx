import { useEffect } from "react";
import { BookOpen, Brain, CalendarDays, X } from "lucide-react";
import ActionCard from "./ActionCard";

export default function OcrSuccessModal({ open, onClose, onSelect }) {
  if (!open) return null;

  const actions = [
    {
      id: "quiz",
      title: "Generate Quizzes",
      description: "Create MCQs or short questions from your note.",
      icon: BookOpen,
      color: "bg-blue-50 text-blue-700"
    },
    {
      id: "tutor",
      title: "AI Tutoring",
      description: "Ask questions and get simplified explanations.",
      icon: Brain,
      color: "bg-green-50 text-green-700"
    },
    {
      id: "planner",
      title: "Study Planner",
      description: "Turn your note into a structured revision plan.",
      icon: CalendarDays,
      color: "bg-yellow-50 text-yellow-700"
    }
  ];

  // ESC key support
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      {/* MODAL CARD */}
      <div
        className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >

        {/* HEADER */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
              ✓ OCR Completed
            </div>

            <h2 className="mt-3 text-2xl font-bold text-slate-900">
              What would you like to do next?
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Your note has been processed successfully. Choose a learning action below.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* ACTIONS */}
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {actions.map((action) => (
            <ActionCard
              key={action.id}
              title={action.title}
              description={action.description}
              icon={action.icon}
              color={action.color}
              onClick={() => onSelect(action.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}