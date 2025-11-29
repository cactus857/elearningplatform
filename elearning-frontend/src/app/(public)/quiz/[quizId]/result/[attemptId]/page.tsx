"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Target,
  ArrowLeft,
  Loader2,
  Trophy,
  History,
  Check,
  X,
  AlertCircle,
  Share2,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getAttemptDetail, IQuizAttemptDetail } from "@/services/quiz.service";

// Component hiển thị vòng tròn điểm số
const ScoreCircle = ({
  score,
  isPassed,
}: {
  score: number;
  isPassed: boolean;
}) => {
  const radius = 60;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="rotate-[-90deg] transition-all duration-1000 ease-out"
      >
        <circle
          stroke="currentColor"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="text-muted/20"
        />
        <circle
          stroke="currentColor"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + " " + circumference}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className={cn(
            "transition-all duration-1000 ease-out",
            isPassed ? "text-emerald-500" : "text-destructive"
          )}
        />
      </svg>
      <div className="absolute flex flex-col items-center text-center">
        <span
          className={cn(
            "text-3xl font-bold",
            isPassed
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-destructive"
          )}
        >
          {score.toFixed(0)}%
        </span>
      </div>
    </div>
  );
};

export default function QuizResultPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attemptId as string;

  const [attempt, setAttempt] = useState<IQuizAttemptDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadResult = async () => {
      try {
        setIsLoading(true);
        const data = await getAttemptDetail(attemptId);
        setAttempt(data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Không thể tải kết quả");
      } finally {
        setIsLoading(false);
      }
    };

    loadResult();
  }, [attemptId]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">
          Đang tổng hợp kết quả...
        </p>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border-destructive/20 shadow-lg">
          <CardContent className="flex flex-col items-center p-8 text-center">
            <div className="mb-4 rounded-full bg-destructive/10 p-3">
              <AlertCircle className="h-10 w-10 text-destructive" />
            </div>
            <h2 className="text-xl font-bold">Không tìm thấy kết quả</h2>
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

  const correctAnswers = attempt.answers.filter((a) => a.isCorrect).length;
  const totalQuestions = attempt.answers.length;
  const scorePercentage = attempt.score;
  const timeSpent = Math.floor(attempt.timeSpentSeconds / 60);
  const secondsSpent = attempt.timeSpentSeconds % 60;
  const isPassed = attempt.isPassed;

  return (
    <div className="min-h-screen bg-muted/30 pb-20 pt-8">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Top Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            className="group pl-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
            onClick={() => router.push("/quiz")}
          >
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Về danh sách
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Share2 className="mr-2 h-4 w-4" /> Chia sẻ
            </Button>
            <Button
              onClick={() => router.push(`/quiz/${attempt.quiz.id}`)}
              size="sm"
            >
              <RotateCcw className="mr-2 h-4 w-4" /> Làm lại
            </Button>
          </div>
        </div>

        {/* 1. HERO RESULT CARD */}
        <Card className="overflow-hidden border-none shadow-xl">
          <div
            className={cn(
              "h-2 w-full",
              isPassed
                ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
                : "bg-gradient-to-r from-red-400 to-red-600"
            )}
          />
          <CardContent className="p-0">
            <div className="grid gap-6 p-6 md:grid-cols-[1fr_200px] md:p-8">
              {/* Left: Text Info */}
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={isPassed ? "default" : "destructive"}
                      className={cn(
                        "px-3 py-1 text-sm font-medium uppercase tracking-wider",
                        isPassed ? "bg-emerald-600 hover:bg-emerald-700" : ""
                      )}
                    >
                      {isPassed ? "Đạt yêu cầu" : "Chưa đạt"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Ngày:{" "}
                      {attempt.submittedAt
                        ? new Date(attempt.submittedAt).toLocaleDateString(
                            "vi-VN"
                          )
                        : new Date().toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold leading-tight md:text-3xl">
                    {attempt.quiz.title}
                  </h1>
                  <p className="text-muted-foreground">
                    {isPassed
                      ? "Tuyệt vời! Bạn đã hoàn thành xuất sắc bài kiểm tra này."
                      : "Đừng nản lòng, hãy ôn tập lại kiến thức và thử lại nhé."}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 border-t pt-4">
                  <div className="space-y-1">
                    <p className="flex items-center text-xs font-medium text-muted-foreground">
                      <Target className="mr-1 h-3.5 w-3.5" /> Kết quả
                    </p>
                    <p className="text-xl font-bold">
                      {correctAnswers}
                      <span className="text-sm font-normal text-muted-foreground">
                        /{totalQuestions}
                      </span>
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="flex items-center text-xs font-medium text-muted-foreground">
                      <Clock className="mr-1 h-3.5 w-3.5" /> Thời gian
                    </p>
                    <p className="text-xl font-bold">
                      {timeSpent > 0 ? `${timeSpent}p` : ""}
                      {secondsSpent}s
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="flex items-center text-xs font-medium text-muted-foreground">
                      <Trophy className="mr-1 h-3.5 w-3.5" /> Điểm chuẩn
                    </p>
                    <p className="text-xl font-bold">
                      {attempt.quiz.passingScore}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Right: Score Visual */}
              <div className="flex items-center justify-center border-l-0 border-t pt-6 md:border-l md:border-t-0 md:pt-0">
                <div className="flex flex-col items-center gap-2">
                  <ScoreCircle score={scorePercentage} isPassed={isPassed} />
                  <span className="text-xs font-medium text-muted-foreground">
                    Tổng điểm
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. DETAILED ANSWERS */}
        {attempt.quiz.showCorrectAnswers && (
          <div className="mt-8 space-y-6">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Chi tiết bài làm</h2>
            </div>

            <div className="space-y-4">
              {attempt.quiz.questions.map((question, index) => {
                const answer = attempt.answers.find(
                  (a) => a.questionId === question.id
                );
                if (!answer) return null;

                const isCorrect = answer.isCorrect;

                return (
                  <Card
                    key={question.id}
                    className={cn(
                      "overflow-hidden border transition-all hover:shadow-md",
                      // Nếu đúng thì viền xanh nhẹ, sai thì viền đỏ nhẹ
                      isCorrect
                        ? "border-emerald-200 dark:border-emerald-900"
                        : "border-red-200 dark:border-red-900"
                    )}
                  >
                    <CardHeader
                      className={cn(
                        "flex flex-row items-start gap-4 space-y-0 px-6 py-4",
                        isCorrect
                          ? "bg-emerald-50/50 dark:bg-emerald-950/10"
                          : "bg-red-50/50 dark:bg-red-950/10"
                      )}
                    >
                      {/* Question Number Badge */}
                      <div
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-bold",
                          isCorrect
                            ? "border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900 dark:text-emerald-300"
                            : "border-red-200 bg-red-100 text-red-700 dark:border-red-800 dark:bg-red-900 dark:text-red-300"
                        )}
                      >
                        {index + 1}
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold leading-snug">
                            {question.text.replace(/<[^>]*>/g, "")}
                          </h3>

                          {/* Status Badge */}
                          {isCorrect ? (
                            <Badge
                              variant="outline"
                              className="shrink-0 border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900 dark:text-emerald-400"
                            >
                              <CheckCircle2 className="mr-1 h-3 w-3" /> Đúng
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="shrink-0 border-red-200 bg-red-100 text-red-700 dark:border-red-800 dark:bg-red-900 dark:text-red-400"
                            >
                              <XCircle className="mr-1 h-3 w-3" /> Sai
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-6">
                      <div className="grid gap-3">
                        {question.options.map((option, optionIndex) => {
                          const isSelected =
                            answer.selectedAnswerIndex === optionIndex;
                          const isCorrectAnswer =
                            question.correctAnswerIndex === optionIndex;

                          let optionStyle = "border-border bg-card";
                          let icon = (
                            <div className="h-4 w-4 rounded-full border border-muted-foreground/30" />
                          ); // Default circle

                          if (isCorrectAnswer) {
                            // Đáp án đúng (luôn hiển thị xanh)
                            optionStyle =
                              "border-emerald-500 bg-emerald-50 dark:border-emerald-500/50 dark:bg-emerald-950/30";
                            icon = (
                              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
                            );
                          }

                          if (isSelected && !isCorrectAnswer) {
                            // Đã chọn nhưng sai (hiển thị đỏ)
                            optionStyle =
                              "border-red-500 bg-red-50 dark:border-red-500/50 dark:bg-red-950/30";
                            icon = (
                              <XCircle className="h-5 w-5 text-red-600 dark:text-red-500" />
                            );
                          }

                          return (
                            <div
                              key={optionIndex}
                              className={cn(
                                "relative flex items-center gap-3 rounded-lg border p-3.5 text-sm transition-colors",
                                optionStyle
                              )}
                            >
                              <div className="shrink-0 pt-0.5">{icon}</div>
                              <div className="flex-1">
                                <span className="font-semibold text-muted-foreground mr-2">
                                  {String.fromCharCode(65 + optionIndex)}.
                                </span>
                                <span
                                  className={cn(
                                    isCorrectAnswer
                                      ? "font-medium text-emerald-700 dark:text-emerald-300"
                                      : isSelected && !isCorrectAnswer
                                      ? "font-medium text-red-700 dark:text-red-300"
                                      : ""
                                  )}
                                >
                                  {option.replace(/<[^>]*>/g, "")}
                                </span>
                              </div>

                              {/* Labels */}
                              {isSelected && (
                                <Badge
                                  variant="secondary"
                                  className="ml-2 bg-background/50 text-xs"
                                >
                                  Bạn chọn
                                </Badge>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
