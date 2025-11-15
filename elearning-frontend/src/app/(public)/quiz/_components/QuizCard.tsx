import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, FileQuestion, Calendar, Award } from "lucide-react";
import { useRouter } from "next/navigation";
import { IQuiz } from "@/services/quiz.service";

interface QuizCardProps {
  quiz: IQuiz & {
    _count?: { questions: number; attempts: number };
    course?: {
      id: string;
      title: string;
    };
  };
}

export const QuizCard = ({ quiz }: QuizCardProps) => {
  const router = useRouter();

  const isAvailable = () => {
    const now = new Date();
    if (quiz.availableFrom && new Date(quiz.availableFrom) > now) {
      return false;
    }
    if (quiz.availableTo && new Date(quiz.availableTo) < now) {
      return false;
    }
    return true;
  };

  const getAvailabilityText = () => {
    const now = new Date();
    if (quiz.availableFrom && new Date(quiz.availableFrom) > now) {
      return `Bắt đầu: ${new Date(quiz.availableFrom).toLocaleDateString(
        "vi-VN"
      )}`;
    }
    if (quiz.availableTo && new Date(quiz.availableTo) < now) {
      return "Đã kết thúc";
    }
    if (quiz.availableTo) {
      return `Kết thúc: ${new Date(quiz.availableTo).toLocaleDateString(
        "vi-VN"
      )}`;
    }
    return "Có sẵn";
  };

  const available = isAvailable();

  return (
    <Card className="flex h-full flex-col transition-all hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-lg font-semibold leading-tight">
            {quiz.title}
          </h3>
          <Badge variant={available ? "default" : "secondary"}>
            {available ? "Có sẵn" : "Chưa mở"}
          </Badge>
        </div>
        {quiz.course && (
          <p className="text-sm text-muted-foreground">{quiz.course.title}</p>
        )}
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileQuestion className="h-4 w-4" />
          <span>{quiz._count?.questions || 0} câu hỏi</span>
        </div>

        {quiz.timeLimitMinutes && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{quiz.timeLimitMinutes} phút</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Award className="h-4 w-4" />
          <span>Điểm đạt: {quiz.passingScore}%</span>
        </div>

        {(quiz.availableFrom || quiz.availableTo) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{getAvailabilityText()}</span>
          </div>
        )}

        {quiz.maxAttempts && (
          <div className="text-sm text-muted-foreground">
            Số lần làm tối đa: {quiz.maxAttempts}
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          onClick={() => router.push(`/quiz/${quiz.id}`)}
          disabled={!available}
        >
          {available ? "Xem chi tiết" : "Chưa mở"}
        </Button>
      </CardFooter>
    </Card>
  );
};
