import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight, Send, LayoutDashboard } from "lucide-react";
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

  return (
    <Card className="border-none shadow-lg ring-1 ring-border/50">
      <CardHeader className="pb-3 pt-5">
        <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
          <LayoutDashboard className="h-4 w-4" />
          Điều hướng
        </CardTitle>
      </CardHeader>

      <Separator className="bg-border/50" />

      <CardContent className="space-y-6 pt-6">
        {/* Question Grid */}
        <ScrollArea className="max-h-[300px] pr-2 lg:max-h-none">
          <div className="grid grid-cols-5 gap-2.5">
            {questions.map((question, index) => {
              const isAnswered = answers.has(question.id);
              const isCurrent = index === currentQuestion;

              return (
                <button
                  key={question.id}
                  onClick={() => onNavigate(index)}
                  className={cn(
                    "flex aspect-square items-center justify-center rounded-md text-sm font-semibold transition-all duration-200",
                    // Focus ring for accessibility
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",

                    // Logic màu sắc Semantic
                    isCurrent
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-background z-10"
                      : "ring-0",

                    isAnswered
                      ? isCurrent
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-primary/20 text-primary dark:bg-primary/30" // Đã làm
                      : isCurrent
                      ? "bg-muted text-foreground"
                      : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground" // Chưa làm
                  )}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </ScrollArea>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-primary/20 ring-1 ring-primary/50" />
            <span>Đã làm</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-muted/50 ring-1 ring-border" />
            <span>Chưa làm</span>
          </div>
          <div className="flex items-center gap-2 col-span-2">
            <div className="h-2.5 w-2.5 rounded-full ring-2 ring-primary ring-offset-1" />
            <span>Đang chọn</span>
          </div>
        </div>

        <Separator className="bg-border/50" />

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={onPrevious}
              disabled={currentQuestion === 0}
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Trước
            </Button>

            {!isLastQuestion && (
              <Button variant="secondary" className="flex-1" onClick={onNext}>
                Sau <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>

          <Button
            size="lg"
            onClick={onSubmit}
            disabled={isSubmitting}
            className={cn(
              "w-full font-bold shadow-lg transition-all hover:scale-[1.02]",
              answeredCount === totalQuestions
                ? // Khi đã làm hết: Dùng màu xanh lá (nếu có biến) hoặc Primary
                  "bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600"
                : "bg-primary hover:bg-primary/90"
            )}
          >
            {isSubmitting ? (
              "Đang nộp bài..."
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                {isLastQuestion ? "Nộp bài thi" : "Nộp bài ngay"}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
