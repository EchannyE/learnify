export default function LoadingButton({
  loading,
  children,
  loadingText,
  className = "",
  ...props
}) {
  return (
    <button
      disabled={loading}
      aria-disabled={loading}
      aria-busy={loading}
      className={`relative inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold text-white transition
        disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.99] ${className}`}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      )}

      {loading ? loadingText : children}
    </button>
  );
}