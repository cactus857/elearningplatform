"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Send,
  CheckCircle2,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { IQuizForStudent, submitQuiz } from "@/services/quiz.service";
import { useQuizTimer } from "@/hooks/use-quiz-timer";
import { QuizTimer } from "../../../_components/QuizTimer";
import { QuestionCard } from "../../../_components/QuestionCard";
import { QuizNavigation } from "../../../_components/QuizNavigation";

export default function DoQuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.quizId as string;
  const attemptId = params.attemptId as string;

  const [quiz, setQuiz] = useState<IQuizForStudent | null>(null);
  const [startTime, setStartTime] = useState<string>("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Map<string, number>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTimeUp = async () => {
    toast.warning("Hết giờ làm bài! Hệ thống đang tự động nộp bài...");
    await handleSubmitQuiz(true);
  };

  const { timeRemaining, formatTime, isTimeUp } = useQuizTimer({
    timeLimitSeconds: quiz?.timeLimitMinutes
      ? quiz.timeLimitMinutes * 60
      : null,
    onTimeUp: handleTimeUp,
    startTime,
  });

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        setIsLoading(true);
        const quizDataStr = sessionStorage.getItem(`quiz_attempt_${attemptId}`);

        if (quizDataStr) {
          const quizData = JSON.parse(quizDataStr);
          setQuiz(quizData.quiz);
          setStartTime(quizData.startedAt);
        } else {
          setError("Không tìm thấy dữ liệu bài thi.");
          setTimeout(() => router.push(`/quiz/${quizId}`), 2000);
        }
      } catch (err: any) {
        setError("Lỗi tải bài kiểm tra.");
      } finally {
        setIsLoading(false);
      }
    };
    loadQuiz();
  }, [quizId, attemptId, router]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const handleAnswerChange = (questionId: string, answerIndex: number) => {
    setAnswers((prev) => {
      const newAnswers = new Map(prev);
      if (answerIndex === -1) newAnswers.delete(questionId);
      else newAnswers.set(questionId, answerIndex);
      return newAnswers;
    });
  };

  const handleNavigate = (questionIndex: number) => {
    setCurrentQuestion(questionIndex);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) setCurrentQuestion((prev) => prev - 1);
  };

  const handleNext = () => {
    if (quiz && currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handleSubmitQuiz = async (autoSubmit = false) => {
    if (!quiz || (!autoSubmit && answers.size !== quiz.questions.length)) {
      toast.error("Vui lòng hoàn thành tất cả câu hỏi trước khi nộp!");
      return;
    }

    try {
      setIsSubmitting(true);
      const answersArray = Array.from(answers.entries()).map(
        ([questionId, selectedAnswerIndex]) => ({
          questionId,
          selectedAnswerIndex,
        })
      );

      await submitQuiz({ quizId, attemptId, answers: answersArray });
      sessionStorage.removeItem(`quiz_attempt_${attemptId}`);
      toast.success("Nộp bài thành công!");
      router.push(`/quiz/${quizId}/result/${attemptId}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi nộp bài");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg font-medium text-muted-foreground animate-pulse">
          Đang chuẩn bị không gian làm bài...
        </p>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border-destructive/20 shadow-2xl">
          <CardContent className="flex flex-col items-center p-8 text-center">
            <div className="mb-4 rounded-full bg-destructive/10 p-3">
              <AlertCircle className="h-10 w-10 text-destructive" />
            </div>
            <h2 className="text-xl font-bold">Lỗi Truy Cập</h2>
            <p className="mt-2 text-muted-foreground">{error}</p>
            <Button
              className="mt-6"
              variant="outline"
              onClick={() => router.back()}
            >
              Quay lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestionData = quiz.questions[currentQuestion];
  const progressPercent = (answers.size / quiz.questions.length) * 100;

  return (
    <div className="relative min-h-screen bg-background pb-20 selection:bg-primary/20 selection:text-primary">
      {/* BACKGROUND TEXTURE (Dot Pattern) */}
      <div className="fixed inset-0 z-0 h-full w-full bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* 1. ULTRA STICKY HEADER */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/70 px-4 py-3 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40">
        <div className="container mx-auto max-w-[1400px]">
          <div className="flex items-center justify-between gap-6">
            {/* Left: Info */}
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <h1 className="truncate text-base font-bold text-foreground sm:text-lg">
                {quiz.title}
              </h1>
              <div className="flex items-center gap-3">
                {/* Custom Gradient Progress Bar */}
                <div className="h-2 w-24 overflow-hidden rounded-full bg-secondary sm:w-48">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-muted-foreground">
                  {Math.round(progressPercent)}%
                </span>
              </div>
            </div>

            {/* Right: Timer & Primary Action */}
            <div className="flex items-center gap-4">
              <QuizTimer
                timeRemaining={timeRemaining}
                formatTime={formatTime}
                isTimeUp={isTimeUp}
              />
              <Button
                onClick={() => setShowSubmitDialog(true)}
                size="sm"
                className={cn(
                  "hidden rounded-full px-6 font-bold shadow-lg transition-all hover:-translate-y-0.5 sm:flex",
                  answers.size === quiz.questions.length
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-500/20"
                    : "bg-primary text-primary-foreground shadow-primary/20"
                )}
              >
                Nộp bài
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. CONTENT AREA */}
      <main className="relative z-10 container mx-auto mt-8 max-w-[1400px] px-4 md:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px]">
          {/* LEFT: Question Content (No Card wrapper for cleaner look) */}
          <div className="min-w-0 space-y-8">
            <QuestionCard
              question={currentQuestionData}
              questionNumber={currentQuestion + 1}
              totalQuestions={quiz.questions.length}
              selectedAnswer={answers.get(currentQuestionData.id) ?? null}
              onAnswerChange={(answerIndex) =>
                handleAnswerChange(currentQuestionData.id, answerIndex)
              }
            />

            {/* Mobile Navigation (Floating Bottom Bar) */}
            <div className="fixed bottom-6 left-4 right-4 z-50 flex items-center gap-3 rounded-2xl border bg-background/80 p-2 shadow-2xl backdrop-blur-lg lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="rounded-xl"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>

              <div className="flex-1 text-center text-sm font-medium text-muted-foreground">
                Câu {currentQuestion + 1} / {quiz.questions.length}
              </div>

              {currentQuestion === quiz.questions.length - 1 ? (
                <Button
                  onClick={() => setShowSubmitDialog(true)}
                  className="rounded-xl bg-primary px-4 font-bold"
                >
                  Nộp <Send className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNext}
                  className="rounded-xl"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              )}
            </div>

            {/* Desktop Navigation Helper (Just buttons) */}
            <div className="hidden items-center justify-between pt-4 lg:flex">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="rounded-full border-2 px-6 hover:bg-muted"
              >
                <ChevronLeft className="mr-2 h-4 w-4" /> Câu trước
              </Button>

              <Button
                onClick={
                  currentQuestion === quiz.questions.length - 1
                    ? () => setShowSubmitDialog(true)
                    : handleNext
                }
                className={cn(
                  "rounded-full px-8 font-bold transition-all hover:scale-105",
                  currentQuestion === quiz.questions.length - 1
                    ? "bg-gradient-to-r from-primary to-primary/80"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                {currentQuestion === quiz.questions.length - 1 ? (
                  <>
                    Nộp bài <Send className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Câu sau <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* RIGHT: Sidebar Navigation */}
          <div className="hidden lg:block">
            <div className="sticky top-28">
              <QuizNavigation
                currentQuestion={currentQuestion}
                totalQuestions={quiz.questions.length}
                answers={answers}
                questions={quiz.questions}
                onNavigate={handleNavigate}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onSubmit={() => setShowSubmitDialog(true)}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        </div>
      </main>

      {/* 3. CONFIRMATION DIALOG */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent className="max-w-md border-none bg-background/90 p-8 shadow-2xl backdrop-blur-xl">
          <AlertDialogHeader className="items-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 ring-4 ring-primary/10">
              <Trophy className="h-10 w-10 text-primary" />
            </div>
            <AlertDialogTitle className="text-2xl font-bold tracking-tight">
              Hoàn thành bài thi?
            </AlertDialogTitle>

            <AlertDialogDescription asChild className="text-center">
              <div className="mt-2 text-muted-foreground">
                <p>Kiểm tra lại lần cuối trước khi gửi kết quả.</p>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-muted/50 p-4 text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {quiz.questions.length}
                    </div>
                    <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Tổng câu
                    </div>
                  </div>
                  <div
                    className={cn(
                      "rounded-2xl p-4 text-center",
                      answers.size === quiz.questions.length
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-orange-500/10 text-orange-600"
                    )}
                  >
                    <div className="text-2xl font-bold">{answers.size}</div>
                    <div className="text-xs font-medium uppercase tracking-wider opacity-80">
                      Đã làm
                    </div>
                  </div>
                </div>

                {answers.size !== quiz.questions.length && (
                  <p className="mt-6 text-sm font-medium text-orange-600 dark:text-orange-400">
                    Vẫn còn {quiz.questions.length - answers.size} câu chưa hoàn
                    thành!
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-6 gap-3 sm:justify-center">
            <AlertDialogCancel className="w-full rounded-full border-2 sm:w-auto px-8">
              Xem lại
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleSubmitQuiz()}
              className="w-full rounded-full bg-gradient-to-r from-primary to-primary/80 px-8 font-bold shadow-lg hover:shadow-xl sm:w-auto"
            >
              Nộp bài thi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
