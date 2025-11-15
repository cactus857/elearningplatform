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
        "fixed right-4 top-4 z-50 flex items-center gap-3 rounded-2xl border-2 bg-card px-6 py-4 font-mono text-xl font-bold shadow-2xl backdrop-blur-sm transition-all",
        {
          "border-border": !isWarning && !isCritical,
          "animate-pulse border-yellow-500 dark:border-yellow-400": isWarning,
          "animate-pulse border-destructive": isCritical,
        }
      )}
    >
      {isCritical ? (
        <AlertCircle className="h-6 w-6 animate-pulse text-destructive" />
      ) : isWarning ? (
        <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
      ) : (
        <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
      )}
      <span
        className={cn(
          "min-w-[80px] text-center",
          isCritical && "text-destructive",
          isWarning && "text-yellow-600 dark:text-yellow-400",
          !isWarning && !isCritical && "text-green-600 dark:text-green-400"
        )}
      >
        {formatTime}
      </span>
    </div>
  );
};
