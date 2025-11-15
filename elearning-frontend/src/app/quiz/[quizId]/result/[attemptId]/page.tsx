"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getAttemptDetail, IQuizAttemptDetail } from "@/services/quiz.service";

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
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg text-muted-foreground">
            Đang tải kết quả...
          </p>
        </div>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <XCircle className="mx-auto h-12 w-12 text-red-500" />
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

  const correctAnswers = attempt.answers.filter((a) => a.isCorrect).length;
  const totalQuestions = attempt.answers.length;
  const scorePercentage = attempt.score;
  const timeSpent = Math.floor(attempt.timeSpentSeconds / 60);
  const isPassed = attempt.isPassed;

  return (
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

      {/* Result Summary */}
      <Card className="mb-6">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {isPassed ? (
              <div className="rounded-full bg-green-100 p-6">
                <CheckCircle2 className="h-16 w-16 text-green-600" />
              </div>
            ) : (
              <div className="rounded-full bg-red-100 p-6">
                <XCircle className="h-16 w-16 text-red-600" />
              </div>
            )}
          </div>
          <CardTitle className="text-3xl">
            {isPassed ? "Chúc mừng! Bạn đã đạt" : "Chưa đạt yêu cầu"}
          </CardTitle>
          <p className="text-lg text-muted-foreground">{attempt.quiz.title}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score */}
          <div className="text-center">
            <div className="text-6xl font-bold text-primary">
              {scorePercentage.toFixed(1)}%
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Điểm của bạn</p>
          </div>

          <Progress value={scorePercentage} className="h-3" />

          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border bg-card p-4 text-center">
              <Award className="mx-auto mb-2 h-8 w-8 text-primary" />
              <div className="text-2xl font-bold">
                {correctAnswers}/{totalQuestions}
              </div>
              <p className="text-sm text-muted-foreground">Câu đúng</p>
            </div>

            <div className="rounded-lg border bg-card p-4 text-center">
              <Clock className="mx-auto mb-2 h-8 w-8 text-primary" />
              <div className="text-2xl font-bold">{timeSpent} phút</div>
              <p className="text-sm text-muted-foreground">Thời gian</p>
            </div>

            <div className="rounded-lg border bg-card p-4 text-center">
              <Badge
                variant={isPassed ? "default" : "destructive"}
                className="mb-2 text-base"
              >
                {isPassed ? "ĐẠT" : "KHÔNG ĐẠT"}
              </Badge>
              <div className="text-sm text-muted-foreground">
                Yêu cầu: {attempt.quiz.passingScore}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results */}
      {attempt.quiz.showCorrectAnswers && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Chi tiết câu trả lời</h2>
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
                  "border-l-4",
                  isCorrect ? "border-l-green-500" : "border-l-red-500"
                )}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">Câu {index + 1}</CardTitle>
                    {isCorrect ? (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Đúng
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="mr-1 h-3 w-3" />
                        Sai
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="font-medium">{question.text}</p>

                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => {
                      const isSelected =
                        answer.selectedAnswerIndex === optionIndex;
                      const isCorrectAnswer =
                        question.correctAnswerIndex === optionIndex;

                      return (
                        <div
                          key={optionIndex}
                          className={cn(
                            "rounded-lg border p-3",
                            isSelected &&
                              isCorrect &&
                              "border-green-500 bg-green-50",
                            isSelected &&
                              !isCorrect &&
                              "border-red-500 bg-red-50",
                            !isSelected &&
                              isCorrectAnswer &&
                              "border-green-500 bg-green-50"
                          )}
                        >
                          <div className="flex items-start gap-2">
                            <span className="font-semibold">
                              {String.fromCharCode(65 + optionIndex)}.
                            </span>
                            <span className="flex-1">{option}</span>
                            {isSelected && (
                              <Badge variant="outline" className="text-xs">
                                Bạn chọn
                              </Badge>
                            )}
                            {isCorrectAnswer && (
                              <Badge
                                variant="outline"
                                className="bg-green-100 text-xs"
                              >
                                Đáp án đúng
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
