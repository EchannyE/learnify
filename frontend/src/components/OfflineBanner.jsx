import useOnlineStatus from "../hooks/useOnlineStatus";
import { WifiOff } from "lucide-react";

export default function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-center gap-2 bg-yellow-50 border-b border-yellow-200 px-4 py-3 text-sm text-yellow-800"
    >
      <WifiOff size={16} className="text-yellow-700" />

      <span className="font-medium">
        You are offline.
      </span>

      <span className="text-yellow-700">
        You can still access saved notes, quizzes, and study plans.
      </span>
    </div>
  );
}