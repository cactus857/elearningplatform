"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Filter,
  LayoutGrid,
  BookOpen,
  X,
  Sparkles,
  GraduationCap,
  Layers,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { QuizCard } from "./_components/QuizCard";
import { getAllQuizzes, IQuiz } from "@/services/quiz.service";
import { cn } from "@/lib/utils";

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

  // Tính toán thống kê
  const totalQuestions = quizzes.reduce(
    (acc, q) => acc + (q._count?.questions || 0),
    0
  );

  return (
    <div className="relative min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* 1. Ambient Background Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-[10%] -top-[10%] h-[600px] w-[600px] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute -bottom-[10%] -right-[10%] h-[600px] w-[600px] rounded-full bg-secondary/20 blur-[100px]" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03]" />
      </div>

      <div className="relative z-10 container mx-auto max-w-[1400px] px-4 py-12 md:px-6">
        {/* 2. Modern Hero Section */}
        <div className="mb-16 flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary shadow-sm backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Thư viện trắc nghiệm</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              Khám phá{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                Kiến thức
              </span>
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed">
              Hệ thống bài kiểm tra đa dạng giúp bạn ôn tập, đánh giá năng lực
              và chinh phục các mục tiêu học tập một cách hiệu quả nhất.
            </p>
          </div>

          {/* Glass Stats Cards */}
          <div className="grid grid-cols-3 gap-4 lg:min-w-[400px]">
            <StatCard
              icon={<BookOpen className="h-5 w-5" />}
              value={quizzes.length}
              label="Bài tập"
            />
            <StatCard
              icon={<GraduationCap className="h-5 w-5" />}
              value={courses.length}
              label="Khóa học"
            />
            <StatCard
              icon={<Layers className="h-5 w-5" />}
              value={totalQuestions}
              label="Câu hỏi"
            />
          </div>
        </div>

        {/* 3. Floating Toolbar */}
        <div className="sticky top-6 z-30 mb-10">
          <div className="rounded-2xl border border-border/40 bg-background/70 p-2 shadow-lg backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
            <div className="flex flex-col gap-2 md:flex-row">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm bài kiểm tra..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 w-full border-transparent bg-muted/40 pl-10 text-base transition-all hover:bg-muted/60 focus:border-primary/20 focus:bg-background focus:ring-0 rounded-xl"
                />
              </div>

              {/* Filter Select */}
              <div className="md:w-[280px]">
                <Select
                  value={selectedCourse}
                  onValueChange={setSelectedCourse}
                >
                  <SelectTrigger className="h-12 w-full border-transparent bg-muted/40 px-4 text-base transition-all hover:bg-muted/60 focus:border-primary/20 focus:bg-background focus:ring-0 rounded-xl">
                    <div className="flex items-center gap-2 truncate text-muted-foreground">
                      <Filter className="h-4 w-4" />
                      <span
                        className={cn(
                          "truncate",
                          selectedCourse !== "all" &&
                            "text-foreground font-medium"
                        )}
                      >
                        {selectedCourse === "all"
                          ? "Lọc theo khóa học"
                          : courses.find((c) => c.id === selectedCourse)?.title}
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="font-medium">
                      Tất cả khóa học
                    </SelectItem>
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
                  className="h-12 w-12 shrink-0 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  title="Xóa bộ lọc"
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* 4. Content Grid */}
        <div className="space-y-6">
          {!isLoading && (
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <LayoutGrid className="h-4 w-4" />
                <span>Tìm thấy {filteredQuizzes.length} kết quả</span>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="flex flex-col space-y-4 rounded-3xl border border-border bg-card p-6 shadow-sm"
                >
                  <Skeleton className="h-40 w-full rounded-2xl" />
                  <div className="space-y-3">
                    <Skeleton className="h-5 w-3/4 rounded-lg" />
                    <Skeleton className="h-4 w-1/2 rounded-lg" />
                  </div>
                  <div className="mt-auto pt-4 flex gap-2">
                    <Skeleton className="h-10 w-full rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredQuizzes.length === 0 ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed bg-card/50 px-4 text-center animate-in fade-in zoom-in duration-500">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted/50 ring-8 ring-muted/20">
                <Search className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold">Không tìm thấy kết quả</h3>
              <p className="mt-2 max-w-sm text-muted-foreground">
                {isFiltering
                  ? "Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc khóa học."
                  : "Hệ thống chưa có bài kiểm tra nào."}
              </p>
              {isFiltering && (
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="mt-8 rounded-full px-8"
                >
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-20">
              {filteredQuizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="h-full transform transition-all duration-300 hover:-translate-y-1"
                >
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

// Sub-component for Stats to keep code clean
function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-4 transition-all hover:bg-card hover:shadow-md hover:border-border">
      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          {icon}
        </div>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
      </div>
    </div>
  );
}
