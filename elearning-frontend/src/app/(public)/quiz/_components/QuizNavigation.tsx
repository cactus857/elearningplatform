import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  Send,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizNavigationProps {
  currentQuestion: number;
  totalQuestions: number;
  answers: Map<string, number>;
  questions: { id: string }[];
  onNavigate: (questionIndex: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const QuizNavigation = ({
  currentQuestion,
  totalQuestions,
  answers,
  questions,
  onNavigate,
  onPrevious,
  onNext,
  onSubmit,
  isSubmitting,
}: QuizNavigationProps) => {
  const answeredCount = answers.size;
  const isLastQuestion = currentQuestion === totalQuestions - 1;
  const allAnswered = answeredCount === totalQuestions;
  const unansweredCount = totalQuestions - answeredCount;

  return (
    <div className="space-y-3">
      {/* Question Grid */}
      <Card className="border-2 shadow-sm">
        <CardHeader className="pb-3 space-y-1">
          <CardTitle className="text-base font-semibold">
            Tổng quan câu hỏi
          </CardTitle>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="font-semibold text-green-600 dark:text-green-400">
              {answeredCount}
            </span>
            <span className="text-muted-foreground">/</span>
            <span className="font-semibold">{totalQuestions}</span>
            <span className="text-muted-foreground">đã trả lời</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            {questions.map((question, index) => {
              const isAnswered = answers.has(question.id);
              const isCurrent = index === currentQuestion;

              return (
                <button
                  key={question.id}
                  onClick={() => onNavigate(index)}
                  className={cn(
                    "relative aspect-square rounded-lg text-sm font-semibold transition-all",
                    "hover:scale-105 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    {
                      // Current & Answered
                      "bg-primary text-primary-foreground shadow-lg ring-2 ring-primary ring-offset-2 ring-offset-background":
                        isCurrent && isAnswered,
                      // Current & Not Answered
                      "bg-destructive/20 text-destructive ring-2 ring-destructive/50 ring-offset-2 ring-offset-background dark:bg-destructive/30":
                        isCurrent && !isAnswered,
                      // Not Current & Answered
                      "bg-green-500/20 text-green-700 dark:text-green-400 hover:bg-green-500/30":
                        !isCurrent && isAnswered,
                      // Not Current & Not Answered
                      "bg-muted text-muted-foreground hover:bg-muted/80":
                        !isCurrent && !isAnswered,
                    }
                  )}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-2.5 border-t pt-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="h-3.5 w-3.5 rounded bg-primary" />
              <span className="text-muted-foreground">Hiện tại</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3.5 w-3.5 rounded bg-green-500/20 dark:bg-green-500/30" />
              <span className="text-muted-foreground">Đã trả lời</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3.5 w-3.5 rounded bg-muted" />
              <span className="text-muted-foreground">Chưa trả lời</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Buttons - Desktop Only */}
      <div className="hidden lg:flex items-center gap-2">
        <Button
          variant="outline"
          size="default"
          onClick={onPrevious}
          disabled={currentQuestion === 0}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="text-sm">Trước</span>
        </Button>

        {isLastQuestion ? (
          <Button
            size="default"
            onClick={onSubmit}
            disabled={isSubmitting}
            variant={allAnswered ? "default" : "destructive"}
            className="gap-2"
          >
            {isSubmitting ? (
              <span className="text-sm">Đang nộp...</span>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span className="text-sm">Nộp bài</span>
              </>
            )}
          </Button>
        ) : (
          <Button size="default" onClick={onNext} className="gap-2 flex-1">
            <span className="text-sm">Sau</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Warning if not all answered */}
      {!allAnswered && (
        <Card className="border-2 border-destructive/50 bg-destructive/5 dark:bg-destructive/10">
          <CardContent className="p-3">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-destructive" />
              <p className="text-xs font-medium">
                Còn{" "}
                <span className="font-bold text-destructive">
                  {unansweredCount}
                </span>{" "}
                câu chưa trả lời
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
