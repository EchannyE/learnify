import useOnlineStatus from "../hooks/useOnlineStatus";
import { WifiOff } from "lucide-react";

export default function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="
        border-b border-yellow-200
        bg-yellow-50
        px-4 py-3
        text-yellow-800
      "
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-2 text-center text-sm">
        <WifiOff
          size={16}
          className="shrink-0 text-yellow-700"
        />

        <span className="font-semibold">
          You're offline.
        </span>

        <span>
          Saved notes, quizzes and study plans remain available.
        </span>
      </div>
    </div>
  );
}
