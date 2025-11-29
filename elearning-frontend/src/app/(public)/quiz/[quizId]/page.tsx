"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Trophy,
  AlertTriangle,
  ChevronRight,
  Timer,
  PlayCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  getQuizAttempts,
  getQuizById,
  IQuizDetail,
  startQuiz,
} from "@/services/quiz.service";
import { cn } from "@/lib/utils";

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

    if (quiz.availableFrom && new Date(quiz.availableFrom) > now) {
      return {
        can: false,
        reason: `Mở vào: ${new Date(quiz.availableFrom).toLocaleString(
          "vi-VN"
        )}`,
      };
    }

    if (quiz.availableTo && new Date(quiz.availableTo) < now) {
      return { can: false, reason: "Bài kiểm tra đã kết thúc" };
    }

    if (quiz.maxAttempts) {
      const completedAttempts = myAttempts.filter((a) => a.submittedAt).length;
      if (completedAttempts >= quiz.maxAttempts) {
        return {
          can: false,
          reason: `Đã hết lượt làm bài`,
        };
      }
    }

    const ongoingAttempt = myAttempts.find((a) => !a.submittedAt);
    if (ongoingAttempt) {
      return {
        can: false,
        reason: "Bạn chưa hoàn thành bài trước đó",
        continueAttemptId: ongoingAttempt.id,
      };
    }

    return { can: true, reason: null };
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4 bg-background">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <p className="text-lg font-medium text-muted-foreground animate-pulse">
          Đang tải dữ liệu bài thi...
        </p>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border-destructive/50 bg-destructive/5 shadow-lg">
          <CardContent className="flex flex-col items-center p-8 text-center">
            <div className="mb-4 rounded-full bg-destructive/10 p-4">
              <AlertCircle className="h-10 w-10 text-destructive" />
            </div>
            <h2 className="text-xl font-bold text-destructive">
              Không thể tải bài thi
            </h2>
            <p className="mt-2 text-muted-foreground">{error}</p>
            <Button
              variant="outline"
              className="mt-6 border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
              onClick={() => router.back()}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
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
  const attemptsLeft = quiz.maxAttempts
    ? quiz.maxAttempts - completedAttempts.length
    : null;

  return (
    <div className="min-h-screen bg-background pb-20 pt-8">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Navigation */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="group pl-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
            onClick={() => router.push("/quiz")}
          >
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Quay lại danh sách
          </Button>
        </div>

        {/* Header Section */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="secondary"
                className="text-primary hover:bg-secondary/80"
              >
                {quiz.course.title}
              </Badge>
              {quiz.chapter && (
                <>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                  <span className="text-sm font-medium text-muted-foreground">
                    {quiz.chapter.title}
                  </span>
                </>
              )}
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {quiz.title}
            </h1>
          </div>

          {bestScore !== null && (
            <div className="flex items-center gap-3 rounded-xl border bg-card p-3 shadow-sm">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full",
                  bestScore >= quiz.passingScore
                    ? "bg-green-500/15 text-green-600 dark:text-green-400"
                    : "bg-destructive/15 text-destructive"
                )}
              >
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Điểm cao nhất
                </p>
                <p
                  className={cn(
                    "text-xl font-bold",
                    bestScore >= quiz.passingScore
                      ? "text-green-600 dark:text-green-400"
                      : "text-destructive"
                  )}
                >
                  {bestScore}%
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content Column */}
          <div className="space-y-8 lg:col-span-2">
            {/* Description & Rules */}
            <Card className="overflow-hidden border-none shadow-md ring-1 ring-border">
              <div className="h-1.5 w-full bg-primary/20">
                <div className="h-full w-1/3 bg-primary" />
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Thông tin bài kiểm tra
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  {/* Cấu hình */}
                  <div className="rounded-lg bg-muted/40 p-5">
                    <h4 className="mb-3 font-semibold text-foreground">
                      Cấu hình bài thi
                    </h4>
                    <ul className="space-y-3 text-sm text-muted-foreground">
                      <li className="flex items-center gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-background ring-1 ring-border">
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                        </div>
                        {quiz.questions.length} câu hỏi trắc nghiệm
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-background ring-1 ring-border">
                          {quiz.shuffleQuestions ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </div>
                        Xáo trộn câu hỏi
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-background ring-1 ring-border">
                          {quiz.shuffleOptions ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </div>
                        Xáo trộn đáp án
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-background ring-1 ring-border">
                          {quiz.showCorrectAnswers ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </div>
                        Xem đáp án sau khi nộp
                      </li>
                    </ul>
                  </div>

                  {/* Thời gian */}
                  <div className="rounded-lg bg-muted/40 p-5">
                    <h4 className="mb-3 font-semibold text-foreground">
                      Thời gian khả dụng
                    </h4>
                    {!quiz.availableFrom && !quiz.availableTo ? (
                      <p className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                        Bài kiểm tra tự do, luôn mở.
                      </p>
                    ) : (
                      <ul className="space-y-3 text-sm text-muted-foreground">
                        {quiz.availableFrom && (
                          <li className="flex items-start gap-3">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-background ring-1 ring-border">
                              <Calendar className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <div>
                              <span className="block font-medium text-foreground">
                                Mở từ:
                              </span>
                              {new Date(quiz.availableFrom).toLocaleString(
                                "vi-VN"
                              )}
                            </div>
                          </li>
                        )}
                        {quiz.availableTo && (
                          <li className="flex items-start gap-3">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-background ring-1 ring-border">
                              <Calendar className="h-3.5 w-3.5 text-destructive" />
                            </div>
                            <div>
                              <span className="block font-medium text-foreground">
                                Đóng vào:
                              </span>
                              {new Date(quiz.availableTo).toLocaleString(
                                "vi-VN"
                              )}
                            </div>
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Previous Attempts History */}
            {completedAttempts.length > 0 && (
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                  <RotateCcw className="h-5 w-5 text-primary" />
                  Lịch sử làm bài
                </h3>
                <div className="grid gap-3">
                  {completedAttempts.map((attempt, index) => {
                    const isPassed = attempt.isPassed;
                    const attemptNumber = completedAttempts.length - index;

                    return (
                      <div
                        key={attempt.id}
                        className={cn(
                          "group relative flex flex-col gap-4 overflow-hidden rounded-xl border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between",
                          isPassed
                            ? "border-l-4 border-l-green-500"
                            : "border-l-4 border-l-destructive"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-muted font-bold text-muted-foreground">
                            #{attemptNumber}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "text-lg font-bold",
                                  isPassed
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-destructive"
                                )}
                              >
                                {attempt.score}%
                              </span>
                              <Badge
                                variant={isPassed ? "outline" : "destructive"}
                                className={cn(
                                  "h-5 px-1.5 text-[10px]",
                                  isPassed &&
                                    "border-green-500 bg-green-500/10 text-green-600 dark:border-green-400 dark:text-green-400"
                                )}
                              >
                                {isPassed ? "ĐẠT" : "CHƯA ĐẠT"}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span>
                                {new Date(
                                  attempt.submittedAt
                                ).toLocaleDateString("vi-VN")}
                              </span>
                              <span>•</span>
                              <span>
                                {new Date(
                                  attempt.submittedAt
                                ).toLocaleTimeString("vi-VN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-between sm:w-auto"
                          onClick={() =>
                            router.push(`/quiz/${quizId}/result/${attempt.id}`)
                          }
                        >
                          Xem chi tiết
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Column (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
                {/* Time Limit */}
                <Card className="border shadow-none bg-card">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Thời gian</p>
                      <p className="font-bold text-foreground">
                        {quiz.timeLimitMinutes
                          ? `${quiz.timeLimitMinutes} phút`
                          : "Không giới hạn"}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Question Count */}
                <Card className="border shadow-none bg-card">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
                      <FileQuestion className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Số câu hỏi
                      </p>
                      <p className="font-bold text-foreground">
                        {quiz.questions.length} câu
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Passing Score */}
                <Card className="border shadow-none bg-card">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
                      <Award className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Điểm đạt</p>
                      <p className="font-bold text-foreground">
                        {quiz.passingScore}%
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Max Attempts */}
                {quiz.maxAttempts && (
                  <Card className="border shadow-none bg-card">
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <RotateCcw className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Số lần làm còn lại
                        </p>
                        <p
                          className={cn(
                            "font-bold",
                            attemptsLeft! <= 0
                              ? "text-destructive"
                              : "text-foreground"
                          )}
                        >
                          {attemptsLeft}/{quiz.maxAttempts}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Action Card */}
              <Card className="border-primary/20 shadow-lg ring-1 ring-primary/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Bắt đầu ngay?</CardTitle>
                  <CardDescription>
                    {continueAttemptId
                      ? "Bạn đang có bài làm dở dang"
                      : "Hãy đảm bảo đường truyền mạng ổn định"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pb-4">
                  {!can && reason && (
                    <div className="flex items-start gap-2 rounded-md bg-yellow-500/10 p-3 text-sm text-yellow-600 dark:text-yellow-500">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{reason}</span>
                    </div>
                  )}

                  {continueAttemptId ? (
                    <Button
                      className="w-full font-semibold bg-orange-500 hover:bg-orange-600 text-white"
                      size="lg"
                      onClick={() =>
                        router.push(
                          `/quiz/${quizId}/attempt/${continueAttemptId}`
                        )
                      }
                    >
                      <Timer className="mr-2 h-4 w-4" />
                      Tiếp tục làm bài
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      className="w-full font-semibold shadow-md"
                      onClick={() => setShowStartDialog(true)}
                      disabled={!can}
                    >
                      <PlayCircle className="mr-2 h-4 w-4" /> Bắt đầu làm bài
                    </Button>
                  )}
                </CardContent>
                <CardFooter className="justify-center border-t bg-muted/30 p-3 text-xs text-muted-foreground">
                  Chúc bạn đạt kết quả tốt nhất!
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showStartDialog} onOpenChange={setShowStartDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <FileQuestion className="h-6 w-6 text-primary" />
            </div>
            <AlertDialogTitle className="text-center text-xl">
              Xác nhận bắt đầu
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Thời gian sẽ bắt đầu tính ngay khi bạn nhấn nút.
            </AlertDialogDescription>

            <div className="mt-4 rounded-lg bg-muted/50 p-4">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-border/50 pb-2 last:border-0 last:pb-0">
                  <span className="text-muted-foreground">
                    Số lượng câu hỏi
                  </span>
                  <span className="font-medium text-foreground">
                    {quiz.questions.length} câu
                  </span>
                </div>
                {quiz.timeLimitMinutes && (
                  <div className="flex justify-between border-b border-border/50 pb-2 last:border-0 last:pb-0">
                    <span className="text-muted-foreground">
                      Thời gian làm bài
                    </span>
                    <span className="font-medium text-foreground">
                      {quiz.timeLimitMinutes} phút
                    </span>
                  </div>
                )}
                {quiz.maxAttempts && (
                  <div className="flex justify-between border-b border-border/50 pb-2 last:border-0 last:pb-0">
                    <span className="text-muted-foreground">
                      Lần làm còn lại
                    </span>
                    <span className="font-medium text-foreground">
                      {quiz.maxAttempts - completedAttempts.length}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center">
            <AlertDialogCancel
              disabled={isStarting}
              className="w-full sm:w-auto"
            >
              Hủy bỏ
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStartQuiz}
              disabled={isStarting}
              className="w-full sm:w-auto min-w-[120px]"
            >
              {isStarting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Bắt đầu ngay"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
