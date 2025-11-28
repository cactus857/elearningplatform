"use client";

import { useEffect, useState } from "react";
import { Search, Filter, LayoutGrid, BookOpen, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
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

    if (searchQuery) {
      filtered = filtered.filter((quiz) =>
        quiz.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCourse !== "all") {
      filtered = filtered.filter((quiz) => quiz.courseId === selectedCourse);
    }

    setFilteredQuizzes(filtered);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCourse("all");
  };

  const courses = Array.from(
    new Map(
      quizzes.filter((q) => q.course).map((q) => [q.course!.id, q.course!])
    ).values()
  );

  const isFiltering = searchQuery !== "" || selectedCourse !== "all";

  // Tính toán thống kê nhanh
  const totalQuestions = quizzes.reduce(
    (acc, q) => acc + (q._count?.questions || 0),
    0
  );

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden transition-colors duration-300">
      {/* Background Decor (Grid Pattern) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 top-0 h-[500px] w-[500px] bg-primary/5 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-10 relative z-10 max-w-7xl">
        {/* 1. Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 text-secondary-foreground text-xs font-medium backdrop-blur-sm border border-border">
              <BookOpen className="h-3.5 w-3.5" />
              <span>Thư viện bài tập</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Khám phá bài kiểm tra
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Nâng cao kiến thức và đánh giá năng lực qua các bài trắc nghiệm từ
              cơ bản đến nâng cao.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-4 md:gap-8 p-4 rounded-xl bg-card border border-border/50 shadow-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {quizzes.length}
              </div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Bài tập
              </div>
            </div>
            <Separator orientation="vertical" className="h-10" />
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {courses.length}
              </div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Khóa học
              </div>
            </div>
            <Separator orientation="vertical" className="h-10" />
            <div className="text-center hidden sm:block">
              <div className="text-2xl font-bold text-primary">
                {totalQuestions}
              </div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Câu hỏi
              </div>
            </div>
          </div>
        </div>

        {/* 2. Toolbar (Search & Filter) */}
        <div className="sticky top-4 z-20 mb-8">
          <div className="rounded-xl border border-border bg-background/80 backdrop-blur-md shadow-sm p-2 md:p-3">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm bài kiểm tra..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-11 bg-background/50 border-transparent hover:border-border focus:border-primary transition-all"
                />
              </div>

              {/* Filter Dropdown */}
              <div className="flex items-center gap-2 min-w-[200px] md:max-w-xs">
                <Select
                  value={selectedCourse}
                  onValueChange={setSelectedCourse}
                >
                  <SelectTrigger className="h-11 bg-background/50 border-transparent hover:border-border focus:border-primary transition-all">
                    <div className="flex items-center gap-2 truncate">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Lọc theo khóa học" />
                    </div>
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

              {/* Clear Filter Button */}
              {isFiltering && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearFilters}
                  className="h-11 w-11 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  title="Xóa bộ lọc"
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* 3. Main Content Area */}
        <div className="space-y-6">
          {/* Result Count Info */}
          {!isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground px-1">
              <LayoutGrid className="h-4 w-4" />
              <span>Hiển thị {filteredQuizzes.length} bài kiểm tra</span>
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="flex flex-col space-y-4 rounded-xl border border-border bg-card p-4 h-[280px]"
                >
                  <Skeleton className="h-32 w-full rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <div className="mt-auto pt-4 flex gap-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredQuizzes.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-20 px-4 rounded-3xl border border-dashed border-border bg-card/30 text-center animate-in fade-in zoom-in duration-500">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6">
                <Search className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Không tìm thấy kết quả
              </h3>
              <p className="text-muted-foreground max-w-sm mb-6">
                {isFiltering
                  ? "Không có bài kiểm tra nào khớp với bộ lọc hiện tại."
                  : "Chưa có bài kiểm tra nào được tạo."}
              </p>
              {isFiltering && (
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="gap-2"
                >
                  <X className="h-4 w-4" /> Xóa bộ lọc
                </Button>
              )}
            </div>
          ) : (
            /* Quiz Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
              {filteredQuizzes.map((quiz) => (
                <div key={quiz.id} className="h-full">
                  <QuizCard quiz={quiz} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
