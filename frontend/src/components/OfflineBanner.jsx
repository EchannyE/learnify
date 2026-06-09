import useOnlineStatus from "../hooks/useOnlineStatus";
import { WifiOff } from "lucide-react";

export default function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center gap-1 bg-yellow-50 border-b border-yellow-200 px-4 py-3 text-sm text-yellow-800
                 sm:flex-row sm:justify-center sm:gap-2 sm:py-2"
    >
      <span className="flex items-center gap-1.5 font-semibold">
        <WifiOff size={15} className="shrink-0 text-yellow-700" />
        You are offline.
      </span>

      <span className="text-center text-yellow-700 sm:text-left">
        You can still access saved notes, quizzes, and study plans.
      </span>
    </div>
  );
}
