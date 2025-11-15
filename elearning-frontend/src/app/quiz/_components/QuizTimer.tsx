import { Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizTimerProps {
  timeRemaining: number | null;
  formatTime: string | null;
  isTimeUp: boolean;
}

export const QuizTimer = ({
  timeRemaining,
  formatTime,
  isTimeUp,
}: QuizTimerProps) => {
  if (timeRemaining === null) return null;

  const isWarning = timeRemaining <= 300 && timeRemaining > 60; // Last 5 minutes
  const isCritical = timeRemaining <= 60; // Last minute

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg border px-4 py-3 font-mono text-lg font-semibold shadow-lg transition-all",
        {
          "border-green-300 bg-green-50 text-green-700":
            !isWarning && !isCritical,
          "border-yellow-300 bg-yellow-50 text-yellow-700 animate-pulse":
            isWarning,
          "border-red-300 bg-red-50 text-red-700 animate-pulse": isCritical,
        }
      )}
    >
      {isCritical ? (
        <AlertCircle className="h-5 w-5" />
      ) : (
        <Clock className="h-5 w-5" />
      )}
      <span>{formatTime}</span>
    </div>
  );
};
