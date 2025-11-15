import { useState, useEffect, useRef } from "react";

interface UseQuizTimerProps {
  timeLimitSeconds: number | null;
  onTimeUp: () => void;
  startTime: string;
}

export const useQuizTimer = ({
  timeLimitSeconds,
  onTimeUp,
  startTime,
}: UseQuizTimerProps) => {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasCalledTimeUp = useRef(false);

  useEffect(() => {
    if (!timeLimitSeconds || !startTime) {
      setTimeRemaining(null);
      return;
    }

    const calculateTimeRemaining = () => {
      const started = new Date(startTime).getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - started) / 1000);
      const remaining = timeLimitSeconds - elapsed;

      if (remaining <= 0) {
        setTimeRemaining(0);
        setIsTimeUp(true);
        if (!hasCalledTimeUp.current) {
          hasCalledTimeUp.current = true;
          onTimeUp();
        }
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        return 0;
      }

      return remaining;
    };

    // Initial calculation
    const initial = calculateTimeRemaining();
    setTimeRemaining(initial);

    // Set up interval
    intervalRef.current = setInterval(() => {
      calculateTimeRemaining();
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 0) return 0;
        const newTime = prev - 1;
        if (newTime <= 0) {
          setIsTimeUp(true);
          if (!hasCalledTimeUp.current) {
            hasCalledTimeUp.current = true;
            onTimeUp();
          }
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        }
        return newTime;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timeLimitSeconds, onTimeUp, startTime]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  return {
    timeRemaining,
    isTimeUp,
    formatTime: timeRemaining !== null ? formatTime(timeRemaining) : null,
  };
};
