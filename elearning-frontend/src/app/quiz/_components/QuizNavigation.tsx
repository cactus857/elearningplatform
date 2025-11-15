import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Send } from "lucide-react";
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

  return (
    <div className="space-y-4">
      {/* Question Grid */}
      <Card>
        <CardContent className="p-4">
          <div className="mb-3 text-sm font-medium text-muted-foreground">
            Tổng quan câu hỏi ({answeredCount}/{totalQuestions})
          </div>
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10">
            {questions.map((question, index) => {
              const isAnswered = answers.has(question.id);
              const isCurrent = index === currentQuestion;

              return (
                <button
                  key={question.id}
                  onClick={() => onNavigate(index)}
                  className={cn(
                    "aspect-square rounded-md text-sm font-medium transition-all hover:scale-105",
                    {
                      "bg-primary text-primary-foreground":
                        isCurrent && isAnswered,
                      "bg-primary/20 text-primary border-2 border-primary":
                        isCurrent && !isAnswered,
                      "bg-green-100 text-green-700": !isCurrent && isAnswered,
                      "bg-muted text-muted-foreground":
                        !isCurrent && !isAnswered,
                    }
                  )}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={currentQuestion === 0}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Câu trước
        </Button>

        <div className="text-sm text-muted-foreground">
          {answeredCount}/{totalQuestions} câu đã trả lời
        </div>

        {isLastQuestion ? (
          <Button
            onClick={onSubmit}
            disabled={isSubmitting || !allAnswered}
            className="gap-2"
          >
            {isSubmitting ? (
              <>Đang nộp bài...</>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Nộp bài
              </>
            )}
          </Button>
        ) : (
          <Button onClick={onNext} className="gap-2">
            Câu sau
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {!allAnswered && (
        <div className="rounded-lg bg-yellow-50 p-3 text-center text-sm text-yellow-800">
          ⚠️ Bạn còn {totalQuestions - answeredCount} câu chưa trả lời
        </div>
      )}
    </div>
  );
};
