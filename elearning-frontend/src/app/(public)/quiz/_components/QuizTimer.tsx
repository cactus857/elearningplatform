import { Clock, Timer, Flame } from "lucide-react";
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

  const isWarning = timeRemaining <= 300 && timeRemaining > 60;
  const isCritical = timeRemaining <= 60;

  return (
    <div
      className={cn(
        "relative flex items-center gap-3 rounded-full border px-5 py-2 text-sm font-semibold shadow-sm transition-all duration-500 hover:shadow-md",
        "bg-background/80 backdrop-blur-md", // Glass effect
        !isWarning && !isCritical && "border-border text-foreground",
        isWarning &&
          "border-orange-500/30 bg-orange-500/5 text-orange-600 dark:text-orange-400",
        isCritical && "border-destructive/30 bg-destructive/5 text-destructive"
      )}
    >
      {/* Animated Pulse Dot */}
      <span className="relative flex h-2.5 w-2.5">
        <span
          className={cn(
            "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
            isCritical
              ? "bg-destructive"
              : isWarning
              ? "bg-orange-500"
              : "bg-emerald-500"
          )}
        ></span>
        <span
          className={cn(
            "relative inline-flex h-2.5 w-2.5 rounded-full",
            isCritical
              ? "bg-destructive"
              : isWarning
              ? "bg-orange-500"
              : "bg-emerald-500"
          )}
        ></span>
      </span>

      <span className="tabular-nums font-mono text-base tracking-wider">
        {formatTime}
      </span>

      {isCritical && <Flame className="h-4 w-4 animate-pulse" />}
    </div>
  );
};
