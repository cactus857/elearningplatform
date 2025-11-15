"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
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
import { QuizTimer } from "@/app/quiz/_components/QuizTimer";
import { QuestionCard } from "@/app/quiz/_components/QuestionCard";
import { QuizNavigation } from "@/app/quiz/_components/QuizNavigation";

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

  // Auto-submit when time is up
  const handleTimeUp = async () => {
    toast.warning("Hết giờ làm bài! Tự động nộp bài...");
    await handleSubmitQuiz(true);
  };

  const { timeRemaining, formatTime, isTimeUp } = useQuizTimer({
    timeLimitSeconds: quiz?.timeLimitMinutes
      ? quiz.timeLimitMinutes * 60
      : null,
    onTimeUp: handleTimeUp,
    startTime,
  });

  // Load quiz data from attemptId (already started from detail page)
  useEffect(() => {
    const loadQuiz = async () => {
      try {
        setIsLoading(true);

        // Get quiz data from localStorage (saved when start quiz)
        const quizDataStr = sessionStorage.getItem(`quiz_attempt_${attemptId}`);

        if (quizDataStr) {
          const quizData = JSON.parse(quizDataStr);
          setQuiz(quizData.quiz);
          setStartTime(quizData.startedAt);
        } else {
          // Fallback: get from detail page or redirect back
          setError(
            "Không tìm thấy thông tin bài kiểm tra. Vui lòng bắt đầu lại."
          );
          setTimeout(() => router.push(`/quiz/${quizId}`), 2000);
        }
      } catch (err: any) {
        setError("Không thể tải bài kiểm tra");
        toast.error("Không thể tải bài kiểm tra");
      } finally {
        setIsLoading(false);
      }
    };

    loadQuiz();
  }, [quizId, attemptId, router]);

  // Prevent leaving page
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
      newAnswers.set(questionId, answerIndex);
      return newAnswers;
    });
  };

  const handleNavigate = (questionIndex: number) => {
    setCurrentQuestion(questionIndex);
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (quiz && currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handleSubmitQuiz = async (autoSubmit = false) => {
    if (!quiz || (!autoSubmit && answers.size !== quiz.questions.length)) {
      toast.error("Vui lòng trả lời tất cả câu hỏi trước khi nộp bài");
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

      const result = await submitQuiz({
        quizId,
        attemptId,
        answers: answersArray,
      });

      // Clear sessionStorage after submit
      sessionStorage.removeItem(`quiz_attempt_${attemptId}`);

      toast.success("Nộp bài thành công!");
      router.push(`/quiz/${quizId}/result/${attemptId}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể nộp bài");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg text-muted-foreground">
            Đang tải bài kiểm tra...
          </p>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-4 text-xl font-semibold">Có lỗi xảy ra</h2>
            <p className="mt-2 text-muted-foreground">{error}</p>
            <Button className="mt-4" onClick={() => router.back()}>
              Quay lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestionData = quiz.questions[currentQuestion];

  return (
    <>
      <QuizTimer
        timeRemaining={timeRemaining}
        formatTime={formatTime}
        isTimeUp={isTimeUp}
      />

      <div className="container mx-auto max-w-5xl p-4 pb-20">
        {/* Header */}
        <div className="mb-6 rounded-lg border bg-card p-6">
          <h1 className="text-2xl font-bold">{quiz.title}</h1>
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span>Tổng số câu: {quiz.questions.length}</span>
            {quiz.timeLimitMinutes && (
              <span>Thời gian: {quiz.timeLimitMinutes} phút</span>
            )}
            <span>Điểm đạt: {quiz.passingScore}%</span>
          </div>
        </div>

        {/* Question */}
        <div className="mb-6">
          <QuestionCard
            question={currentQuestionData}
            questionNumber={currentQuestion + 1}
            totalQuestions={quiz.questions.length}
            selectedAnswer={answers.get(currentQuestionData.id) ?? null}
            onAnswerChange={(answerIndex) =>
              handleAnswerChange(currentQuestionData.id, answerIndex)
            }
          />
        </div>

        {/* Navigation */}
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

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận nộp bài</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn đã trả lời {answers.size}/{quiz.questions.length} câu hỏi.
              {answers.size === quiz.questions.length ? (
                <span className="mt-2 block font-medium text-green-600">
                  Bạn có chắc chắn muốn nộp bài?
                </span>
              ) : (
                <span className="mt-2 block font-medium text-yellow-600">
                  Bạn còn {quiz.questions.length - answers.size} câu chưa trả
                  lời. Bạn vẫn muốn nộp bài?
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleSubmitQuiz()}>
              Nộp bài
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
