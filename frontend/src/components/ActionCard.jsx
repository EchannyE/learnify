export default function ActionCard({
  title,
  description,
  icon: Icon,
  color = "bg-slate-100 text-slate-700",
  onClick,
  disabled = false
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      role="button"
      aria-label={title}
      className={`group rounded-2xl border border-slate-200 bg-white p-5 text-left transition
        hover:-translate-y-1 hover:shadow-md
        active:scale-[0.98]
        focus:outline-none focus:ring-2 focus:ring-blue-100
        disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {/* ICON */}
      <div
        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition ${color} group-hover:scale-105`}
      >
        <Icon size={24} />
      </div>

      {/* TITLE */}
      <h3 className="font-semibold text-slate-900">
        {title}
      </h3>

      {/* DESCRIPTION */}
      <p className="mt-2 text-sm text-slate-600 leading-relaxed">
        {description}
      </p>
    </button>
  );
}