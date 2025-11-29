import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Check, Hash } from "lucide-react";

interface QuestionCardProps {
  question: {
    id: string;
    text: string;
    options: string[];
  };
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: number | null;
  onAnswerChange: (answerIndex: number) => void;
}

export const QuestionCard = ({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswerChange,
}: QuestionCardProps) => {
  return (
    <div className="w-full space-y-6">
      {/* Question Header & Content - Tách khỏi Card để thoáng hơn */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Badge
            variant="secondary"
            className="px-3 py-1 text-sm font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            Câu {questionNumber}
          </Badge>
          <span className="text-sm font-medium text-muted-foreground">
            / {totalQuestions} câu hỏi
          </span>
        </div>

        <h3 className="text-2xl font-bold leading-relaxed tracking-tight text-foreground md:text-3xl">
          {question.text.replace(/<[^>]*>/g, "")}
        </h3>
      </div>

      {/* Options Area */}
      <div className="grid gap-4 md:grid-cols-1">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const label = String.fromCharCode(65 + index);

          return (
            <div
              key={index}
              onClick={() =>
                isSelected ? onAnswerChange(-1) : onAnswerChange(index)
              }
              className={cn(
                "group relative flex cursor-pointer items-center gap-5 rounded-2xl border p-5 transition-all duration-300 ease-in-out",
                // Hover State
                "hover:border-primary/50 hover:bg-muted/30 hover:shadow-md",
                // Selected State - Focus vào Visual Impact
                isSelected
                  ? "border-primary bg-primary/5 shadow-[0_0_0_2px_hsl(var(--primary))] dark:bg-primary/10"
                  : "border-border bg-card shadow-sm"
              )}
            >
              {/* Option Label / Checkbox */}
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 text-sm font-bold transition-all duration-300",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground scale-110"
                    : "border-muted-foreground/20 bg-background text-muted-foreground group-hover:border-primary/50 group-hover:text-primary"
                )}
              >
                {isSelected ? (
                  <Check className="h-5 w-5" strokeWidth={3} />
                ) : (
                  label
                )}
              </div>

              {/* Option Text */}
              <div className="flex-1">
                <p
                  className={cn(
                    "text-lg transition-colors duration-200",
                    isSelected
                      ? "font-semibold text-foreground"
                      : "font-medium text-muted-foreground group-hover:text-foreground"
                  )}
                >
                  {option.replace(/<[^>]*>/g, "")}
                </p>
              </div>

              {/* Decorative Active Indicator (Optional line on the right) */}
              {isSelected && (
                <div className="absolute right-0 top-1/2 h-1/2 w-1 -translate-y-1/2 rounded-l-full bg-primary" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
