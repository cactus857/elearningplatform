import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

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
    <Card className="border-2 shadow-md">
      <CardHeader className="space-y-4 pb-6">
        <div className="flex items-center justify-between">
          <Badge
            variant="secondary"
            className="px-4 py-2 text-base font-semibold"
          >
            Câu {questionNumber} / {totalQuestions}
          </Badge>
          {selectedAnswer !== null && (
            <div className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>Đã trả lời</span>
            </div>
          )}
        </div>

        {/* Question Text - Strip HTML tags */}
        <h3 className="text-xl font-bold leading-relaxed">
          {question.text.replace(/<[^>]*>/g, "")}
        </h3>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const label = String.fromCharCode(65 + index);

            return (
              <button
                key={index}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    onAnswerChange(-1);
                  } else {
                    onAnswerChange(index);
                  }
                }}
                className={cn(
                  "group relative w-full rounded-xl border-2 p-5 text-left transition-all cursor-pointer",
                  isSelected
                    ? "border-primary bg-primary/10 shadow-md hover:bg-primary/15"
                    : "border-border bg-card hover:border-primary/50 hover:bg-accent hover:shadow-sm"
                )}
              >
                <div className="flex items-start gap-4">
                  {/* Custom Radio Button */}
                  <div
                    className={cn(
                      "mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all",
                      isSelected
                        ? "border-primary bg-primary shadow-sm"
                        : "border-muted-foreground/30 bg-background group-hover:border-primary/50"
                    )}
                  >
                    {isSelected && (
                      <div className="h-3.5 w-3.5 rounded-full bg-primary-foreground" />
                    )}
                  </div>

                  {/* Option Content */}
                  <div className="flex-1">
                    <div className="flex items-baseline gap-3">
                      <span
                        className={cn(
                          "text-base font-bold",
                          isSelected ? "text-primary" : "text-muted-foreground"
                        )}
                      >
                        {label}.
                      </span>
                      <span
                        className={cn(
                          "text-base leading-relaxed",
                          isSelected && "font-medium"
                        )}
                      >
                        {option.replace(/<[^>]*>/g, "")}
                      </span>
                    </div>
                  </div>

                  {/* Checkmark for selected */}
                  {isSelected && (
                    <div className="flex flex-col items-end flex-shrink-0">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span className="mt-1 text-xs text-muted-foreground">
                        Click để bỏ
                      </span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
