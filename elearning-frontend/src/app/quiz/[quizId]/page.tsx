"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import {
  Clock,
  FileQuestion,
  Award,
  Calendar,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Loader2,
  AlertCircle,
  RotateCcw,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import {
  getQuizAttempts,
  getQuizById,
  IQuizDetail,
  startQuiz,
} from "@/services/quiz.service";

export default function QuizDetailPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.quizId as string;

  const [quiz, setQuiz] = useState<IQuizDetail | null>(null);
  const [myAttempts, setMyAttempts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadQuizData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId]);

  const loadQuizData = async () => {
    try {
      setIsLoading(true);
      const [quizData, attemptsData] = await Promise.all([
        getQuizById(quizId),
        getQuizAttempts({
          quizId,
          limit: 100,
          page: 1,
        }),
      ]);
      setQuiz(quizData);
      setMyAttempts(attemptsData.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Không thể tải thông tin bài kiểm tra"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartQuiz = async () => {
    try {
      setIsStarting(true);
      const response = await startQuiz({ quizId });

      // Save quiz data to sessionStorage for do quiz page
      sessionStorage.setItem(
        `quiz_attempt_${response.attemptId}`,
        JSON.stringify({
          quiz: response.quiz,
          startedAt: response.startedAt,
          expiresAt: response.expiresAt,
          timeLimitSeconds: response.timeLimitSeconds,
        })
      );

      toast.success("Bắt đầu làm bài!");
      router.push(`/quiz/${quizId}/attempt/${response.attemptId}`);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Không thể bắt đầu bài kiểm tra"
      );
      setIsStarting(false);
      setShowStartDialog(false);
    }
  };

  const canStartQuiz = () => {
    if (!quiz) return { can: false, reason: "Đang tải..." };

    const now = new Date();

    // Check availability time
    if (quiz.availableFrom && new Date(quiz.availableFrom) > now) {
      return {
        can: false,
        reason: `Bài kiểm tra sẽ mở vào ${new Date(
          quiz.availableFrom
        ).toLocaleString("vi-VN")}`,
      };
    }

    if (quiz.availableTo && new Date(quiz.availableTo) < now) {
      return { can: false, reason: "Bài kiểm tra đã kết thúc" };
    }

    // Check max attempts
    if (quiz.maxAttempts) {
      const completedAttempts = myAttempts.filter((a) => a.submittedAt).length;
      if (completedAttempts >= quiz.maxAttempts) {
        return {
          can: false,
          reason: `Bạn đã hết số lần làm bài (${completedAttempts}/${quiz.maxAttempts})`,
        };
      }
    }

    // Check if has ongoing attempt
    const ongoingAttempt = myAttempts.find((a) => !a.submittedAt);
    if (ongoingAttempt) {
      return {
        can: false,
        reason: "Bạn có một lần làm bài chưa hoàn thành",
        continueAttemptId: ongoingAttempt.id,
      };
    }

    return { can: true, reason: null };
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg text-muted-foreground">Đang tải...</p>
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

  const { can, reason, continueAttemptId } = canStartQuiz();
  const completedAttempts = myAttempts.filter((a) => a.submittedAt);
  const bestScore =
    completedAttempts.length > 0
      ? Math.max(...completedAttempts.map((a) => a.score))
      : null;
  const passedAttempts = completedAttempts.filter((a) => a.isPassed).length;

  return (
    <>
      <div className="container mx-auto max-w-4xl p-4 pb-20">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => router.push("/quiz")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại danh sách
        </Button>

        {/* Quiz Info */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-2xl">{quiz.title}</CardTitle>
                <p className="mt-2 text-muted-foreground">
                  {quiz.course.title}
                  {quiz.chapter && ` • ${quiz.chapter.title}`}
                </p>
              </div>
              {bestScore !== null && (
                <Badge
                  variant={
                    bestScore >= quiz.passingScore ? "default" : "destructive"
                  }
                  className="text-lg"
                >
                  {bestScore}%
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Details Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-3">
                  <FileQuestion className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Số câu hỏi</p>
                  <p className="font-semibold">{quiz.questions.length} câu</p>
                </div>
              </div>

              {quiz.timeLimitMinutes && (
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-3">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Thời gian</p>
                    <p className="font-semibold">
                      {quiz.timeLimitMinutes} phút
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-3">
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Điểm đạt</p>
                  <p className="font-semibold">{quiz.passingScore}%</p>
                </div>
              </div>

              {quiz.maxAttempts && (
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-3">
                    <RotateCcw className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Số lần làm</p>
                    <p className="font-semibold">
                      {completedAttempts.length}/{quiz.maxAttempts}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Settings */}
            <div className="space-y-2 text-sm">
              <h4 className="font-semibold">Cài đặt:</h4>
              <ul className="space-y-1 text-muted-foreground">
                {quiz.shuffleQuestions && <li>• Câu hỏi được xáo trộn</li>}
                {quiz.shuffleOptions && <li>• Đáp án được xáo trộn</li>}
                {quiz.showCorrectAnswers && (
                  <li>• Hiển thị đáp án đúng sau khi nộp</li>
                )}
                {(quiz.availableFrom || quiz.availableTo) && (
                  <li className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {quiz.availableFrom &&
                      `Từ ${new Date(quiz.availableFrom).toLocaleString(
                        "vi-VN"
                      )}`}
                    {quiz.availableTo &&
                      ` đến ${new Date(quiz.availableTo).toLocaleString(
                        "vi-VN"
                      )}`}
                  </li>
                )}
              </ul>
            </div>

            {/* Start Button */}
            <div className="flex flex-col gap-3">
              {continueAttemptId ? (
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() =>
                    router.push(`/quiz/${quizId}/attempt/${continueAttemptId}`)
                  }
                >
                  Tiếp tục làm bài
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => setShowStartDialog(true)}
                  disabled={!can}
                >
                  {can ? "Bắt đầu làm bài" : reason}
                </Button>
              )}

              {!can && reason && (
                <div className="rounded-lg bg-yellow-50 p-3 text-center text-sm text-yellow-800">
                  {reason}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Previous Attempts */}
        {completedAttempts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Lịch sử làm bài ({completedAttempts.length} lần)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {completedAttempts.map((attempt, index) => (
                  <div
                    key={attempt.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                        #{completedAttempts.length - index}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            {attempt.score}%
                          </span>
                          {attempt.isPassed ? (
                            <Badge variant="default" className="bg-green-500">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Đạt
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <XCircle className="mr-1 h-3 w-3" />
                              Chưa đạt
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(attempt.submittedAt).toLocaleString(
                            "vi-VN"
                          )}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(`/quiz/${quizId}/result/${attempt.id}`)
                      }
                    >
                      Xem chi tiết
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Start Confirmation Dialog */}
      <AlertDialog open={showStartDialog} onOpenChange={setShowStartDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bắt đầu làm bài kiểm tra</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>Trước khi bắt đầu, hãy lưu ý:</p>
                <ul className="list-inside list-disc space-y-1 text-sm">
                  <li>Bạn có {quiz.questions.length} câu hỏi</li>
                  {quiz.timeLimitMinutes && (
                    <li>Thời gian làm bài: {quiz.timeLimitMinutes} phút</li>
                  )}
                  {quiz.maxAttempts && (
                    <li>
                      Số lần làm còn lại:{" "}
                      {quiz.maxAttempts - completedAttempts.length}
                    </li>
                  )}
                  <li>Không thể thoát ra khi đang làm bài</li>
                  {quiz.timeLimitMinutes && (
                    <li>Tự động nộp bài khi hết giờ</li>
                  )}
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isStarting}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleStartQuiz} disabled={isStarting}>
              {isStarting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang bắt đầu...
                </>
              ) : (
                "Bắt đầu ngay"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
