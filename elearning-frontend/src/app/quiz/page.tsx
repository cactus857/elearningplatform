"use client";

import { useEffect, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Search, BookOpen } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QuizCard } from "./_components/QuizCard";
import { getAllQuizzes, IQuiz } from "@/services/quiz.service";

type QuizWithCourse = IQuiz & {
  _count?: { questions: number; attempts: number };
  course?: {
    id: string;
    title: string;
    chapters: { id: string; title: string }[];
  };
};

export default function QuizListPage() {
  const [quizzes, setQuizzes] = useState<QuizWithCourse[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<QuizWithCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");

  useEffect(() => {
    loadQuizzes();
  }, []);

  useEffect(() => {
    filterQuizzes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedCourse, quizzes]);

  const loadQuizzes = async () => {
    try {
      setIsLoading(true);
      const response = await getAllQuizzes();
      setQuizzes(response.data);
    } catch (error) {
      console.error("Failed to load quizzes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterQuizzes = () => {
    let filtered = [...quizzes];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((quiz) =>
        quiz.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by course
    if (selectedCourse !== "all") {
      filtered = filtered.filter((quiz) => quiz.courseId === selectedCourse);
    }

    setFilteredQuizzes(filtered);
  };

  const courses = Array.from(
    new Map(
      quizzes.filter((q) => q.course).map((q) => [q.course!.id, q.course!])
    ).values()
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg text-muted-foreground">
            Đang tải danh sách bài kiểm tra...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl p-4 pb-20">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Bài kiểm tra</h1>
        <p className="mt-2 text-muted-foreground">
          Danh sách các bài kiểm tra của bạn
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm bài kiểm tra..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="w-full sm:w-[250px]">
            <SelectValue placeholder="Chọn khóa học" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả khóa học</SelectItem>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Quiz List */}
      {filteredQuizzes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <BookOpen className="h-16 w-16 text-muted-foreground" />
            <h3 className="mt-4 text-xl font-semibold">
              Không tìm thấy bài kiểm tra
            </h3>
            <p className="mt-2 text-muted-foreground">
              {searchQuery || selectedCourse !== "all"
                ? "Thử thay đổi bộ lọc của bạn"
                : "Chưa có bài kiểm tra nào được tạo"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredQuizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>
      )}
    </div>
  );
}
