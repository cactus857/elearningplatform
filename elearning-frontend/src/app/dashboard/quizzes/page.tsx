"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  Hourglass,
  Trophy,
  RefreshCw,
  BrainCircuit,
  Users,
  MoreHorizontal,
  BarChart2,
  Trash2,
  Sparkles,
  Filter,
  X,
  Plus,
  Eye,
  Zap,
  CalendarDays,
  Layers,
  GraduationCap,
  LayoutDashboard,
  ArrowUpRight,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useDebounce } from "use-debounce";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import {
  getAllQuizzesManage,
  deleteQuiz,
  type IQuiz,
} from "@/services/quiz.service";

// --- TYPES ---
type QuizWithCount = IQuiz & {
  _count?: { questions: number; attempts: number };
  course?: {
    id: string;
    title: string;
    chapters: { id: string; title: string }[];
    instructor: { id: string; fullName: string };
  };
};

interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

// --- NEW COMPONENT: Premium Stat Card ---
const PremiumStatCard = ({
  title,
  value,
  icon: Icon,
  description,
  colorTheme,
}: {
  title: string;
  value: string | number;
  icon: any;
  description: string;
  colorTheme: "blue" | "violet" | "emerald" | "amber";
}) => {
  const themes = {
    blue: {
      bg: "bg-blue-50/50 dark:bg-blue-900/10",
      border: "border-blue-100 dark:border-blue-800",
      iconBg: "bg-blue-500",
      text: "text-blue-600 dark:text-blue-400",
      ring: "ring-blue-500/20",
    },
    violet: {
      bg: "bg-violet-50/50 dark:bg-violet-900/10",
      border: "border-violet-100 dark:border-violet-800",
      iconBg: "bg-violet-500",
      text: "text-violet-600 dark:text-violet-400",
      ring: "ring-violet-500/20",
    },
    emerald: {
      bg: "bg-emerald-50/50 dark:bg-emerald-900/10",
      border: "border-emerald-100 dark:border-emerald-800",
      iconBg: "bg-emerald-500",
      text: "text-emerald-600 dark:text-emerald-400",
      ring: "ring-emerald-500/20",
    },
    amber: {
      bg: "bg-amber-50/50 dark:bg-amber-900/10",
      border: "border-amber-100 dark:border-amber-800",
      iconBg: "bg-amber-500",
      text: "text-amber-600 dark:text-amber-400",
      ring: "ring-amber-500/20",
    },
  };

  const theme = themes[colorTheme];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        theme.bg,
        theme.border
      )}
    >
      {/* Decorative Background Blob */}
      <div
        className={cn(
          "absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-20 blur-2xl",
          theme.iconBg
        )}
      />

      <div className="relative z-10 flex flex-col justify-between h-full gap-4">
        <div className="flex items-start justify-between">
          <div
            className={cn("p-3 rounded-xl shadow-md text-white", theme.iconBg)}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-white/50 dark:bg-black/20",
              theme.text
            )}
          >
            <ArrowUpRight className="h-3 w-3" />
            <span>Stats</span>
          </div>
        </div>

        <div>
          <h3 className="text-3xl font-bold tracking-tight text-foreground">
            {value}
          </h3>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
        </div>

        <div className="h-1 w-full bg-muted/50 rounded-full overflow-hidden">
          <div
            className={cn("h-full w-2/3 rounded-full opacity-60", theme.iconBg)}
          />
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

// 2. Modern Loading Skeleton
function QuizListSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-2xl border bg-card/50 p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2 w-full">
              <Skeleton className="h-4 w-24 rounded-full" />
              <Skeleton className="h-7 w-3/4 rounded-lg" />
            </div>
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
          <div className="grid grid-cols-3 gap-4 pt-2">
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="pt-2 flex justify-between items-center">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function QuizzesPage() {
  const router = useRouter();
  const { user } = useAuth();

  const isAdmin = user?.role.name === "ADMIN";

  // State
  const [quizzes, setQuizzes] = useState<QuizWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);
  const [filterCourse, setFilterCourse] = useState("all");
  const [filterInstructor, setFilterInstructor] = useState("all");

  // Pagination
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 4,
  });
  const [totalItems, setTotalItems] = useState(0);

  // Dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<QuizWithCount | null>(null);

  const filterChangedRef = useRef(false);

  // Derived Data
  const uniqueCourses = Array.from(
    new Map(quizzes.map((q) => [q.course?.id, q.course])).values()
  ).filter(Boolean);

  const uniqueInstructors = Array.from(
    new Map(
      quizzes.map((q) => [q.course?.instructor?.id, q.course?.instructor])
    ).values()
  ).filter(Boolean);

  // --- API HANDLERS ---
  const fetchQuizzes = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
      };

      if (debouncedSearchQuery) params.search = debouncedSearchQuery;
      if (filterCourse && filterCourse !== "all")
        params.courseId = filterCourse;
      if (isAdmin && filterInstructor && filterInstructor !== "all") {
        params.instructorId = filterInstructor;
      }

      const response = await getAllQuizzesManage(params);

      setQuizzes(response.data || []);
      setTotalItems(response.totalItems);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      toast.error("Failed to load quizzes");
      setQuizzes([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    debouncedSearchQuery,
    filterCourse,
    filterInstructor,
    isAdmin,
  ]);

  useEffect(() => {
    filterChangedRef.current = true;
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [debouncedSearchQuery, filterCourse, filterInstructor]);

  useEffect(() => {
    if (filterChangedRef.current && pagination.pageIndex !== 0) return;
    fetchQuizzes();
    filterChangedRef.current = false;
  }, [fetchQuizzes, pagination.pageIndex]);

  // --- HELPERS ---
  const clearFilters = () => {
    setFilterCourse("all");
    setFilterInstructor("all");
    setSearchQuery("");
  };

  const hasActiveFilters =
    filterCourse !== "all" || filterInstructor !== "all" || searchQuery;
  const pageCount = Math.ceil(totalItems / pagination.pageSize);
  const startItem = pagination.pageIndex * pagination.pageSize + 1;
  const endItem = Math.min(
    (pagination.pageIndex + 1) * pagination.pageSize,
    totalItems
  );

  const handleConfirmDelete = async () => {
    if (!quizToDelete) return;
    try {
      await deleteQuiz(quizToDelete.id);
      toast.success("Quiz deleted successfully");
      setDeleteDialogOpen(false);
      setQuizToDelete(null);
      if (quizzes.length === 1 && pagination.pageIndex > 0) {
        setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex - 1 }));
      } else {
        fetchQuizzes();
      }
    } catch (error) {
      console.error("Error deleting quiz:", error);
      toast.error("Failed to delete quiz");
    }
  };

  const getQuizStatus = (quiz: QuizWithCount) => {
    const now = new Date();
    const availableFrom = quiz.availableFrom
      ? new Date(quiz.availableFrom)
      : null;
    const availableTo = quiz.availableTo ? new Date(quiz.availableTo) : null;

    if (!availableFrom && !availableTo)
      return {
        label: "Active",
        color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      };
    if (availableFrom && now < availableFrom)
      return {
        label: "Scheduled",
        color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      };
    if (availableTo && now > availableTo)
      return {
        label: "Closed",
        color: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
      };
    return {
      label: "Active",
      color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    };
  };

  // --- RENDER ---
  return (
    <div className="space-y-8 pb-10">
      {/* 1. HERO HEADER SECTION */}
      <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-8 py-12 shadow-2xl">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-[300px] w-[300px] rounded-full bg-indigo-500/20 blur-[80px]" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-[200px] w-[200px] rounded-full bg-blue-500/20 blur-[60px]" />

        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur-md border border-white/10">
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>Assessment Console</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
              Quiz Manager
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground font-light">
              Create engaging assessments, track learner progress, and analyze
              performance metrics in one central hub.
            </p>
          </div>
          <Link href="/dashboard/quizzes/create">
            <Button
              size="lg"
              className="h-14 px-8 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all shadow-xl font-semibold text-base"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create New Quiz
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. STATS OVERVIEW (Premium Cards) */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <PremiumStatCard
          title="Total Quizzes"
          value={totalItems}
          icon={Layers}
          description="Active & Archived"
          colorTheme="blue"
        />
        <PremiumStatCard
          title="Questions Bank"
          value={quizzes.reduce(
            (sum, q) => sum + (q._count?.questions || 0),
            0
          )}
          icon={BrainCircuit}
          description="Total questions created"
          colorTheme="violet"
        />
        <PremiumStatCard
          title="Student Attempts"
          value={quizzes.reduce((sum, q) => sum + (q._count?.attempts || 0), 0)}
          icon={Users}
          description="Across all courses"
          colorTheme="emerald"
        />
        <PremiumStatCard
          title="Success Rate"
          value="84%"
          icon={Activity}
          description="Average passing score"
          colorTheme="amber"
        />
      </div>

      {/* 3. TOOLBAR */}
      <div className="space-y-4">
        {/* Row 1: Search (Full Width) */}
        <div className="relative w-full group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          </div>
          <Input
            placeholder="Search for quizzes by title, keyword..."
            className="pl-12 h-14 w-full rounded-2xl border-muted-foreground/20 bg-background shadow-sm hover:shadow-md focus-visible:ring-primary/20 focus-visible:border-primary text-base transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Row 2: Filters & Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card/40 p-2 rounded-2xl border border-dashed border-border/60">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg text-sm font-medium text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </div>

            <Select value={filterCourse} onValueChange={setFilterCourse}>
              <SelectTrigger className="w-full sm:w-[220px] h-10 rounded-xl border-border/50 bg-background/50 hover:bg-background transition-colors">
                <SelectValue placeholder="Filter by Course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {uniqueCourses.map((c) => (
                  <SelectItem key={c?.id} value={c?.id || ""}>
                    {c?.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {isAdmin && (
              <Select
                value={filterInstructor}
                onValueChange={setFilterInstructor}
              >
                <SelectTrigger className="w-full sm:w-[200px] h-10 rounded-xl border-border/50 bg-background/50 hover:bg-background transition-colors">
                  <SelectValue placeholder="All Instructors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Instructors</SelectItem>
                  {uniqueInstructors.map((i) => (
                    <SelectItem key={i?.id} value={i?.id || ""}>
                      {i?.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
              >
                Reset
              </Button>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchQuizzes}
            className="rounded-xl border-border/50 bg-background/50 hover:bg-background"
          >
            <RefreshCw
              className={cn("h-4 w-4 mr-2", loading && "animate-spin")}
            />
            Refresh List
          </Button>
        </div>
      </div>

      {/* 4. QUIZ GRID */}
      {loading && quizzes.length === 0 ? (
        <QuizListSkeleton />
      ) : quizzes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed rounded-3xl bg-muted/5">
          <div className="h-24 w-24 bg-muted/50 rounded-full flex items-center justify-center mb-6 shadow-sm">
            <Search className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h3 className="text-2xl font-bold text-foreground">
            No quizzes found
          </h3>
          <p className="text-muted-foreground max-w-md mt-2 mb-8">
            {hasActiveFilters
              ? "Try adjusting your filters or search terms."
              : "Get started by creating your first assessment for students."}
          </p>
          {hasActiveFilters ? (
            <Button
              onClick={clearFilters}
              variant="outline"
              size="lg"
              className="rounded-full px-8"
            >
              Clear Filters
            </Button>
          ) : (
            <Link href="/dashboard/quizzes/create">
              <Button size="lg" className="rounded-full px-8">
                Create Quiz
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {quizzes.map((quiz) => {
            const status = getQuizStatus(quiz);
            return (
              <div
                key={quiz.id}
                className="group relative flex flex-col bg-card hover:bg-gradient-to-br hover:from-card hover:to-primary/5 border border-border/60 hover:border-primary/30 rounded-3xl p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
              >
                {/* Top: Header & Status */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-xs font-medium text-primary uppercase tracking-wider">
                      <GraduationCap className="h-3.5 w-3.5" />
                      <span className="truncate max-w-[200px]">
                        {quiz.course?.title}
                      </span>
                    </div>
                    <Link
                      href={`/dashboard/quizzes/${quiz.id}/edit`}
                      className="group-hover:underline decoration-primary decoration-2 underline-offset-4 transition-all"
                    >
                      <h3 className="text-xl font-bold text-foreground line-clamp-2 leading-tight">
                        {quiz.title}
                      </h3>
                    </Link>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-full px-3 py-0.5 font-semibold border backdrop-blur-md shadow-sm",
                        status.color
                      )}
                    >
                      {status.label}
                    </Badge>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-48 rounded-xl"
                      >
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/dashboard/quizzes/${quiz.id}`)
                          }
                        >
                          <Eye className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/dashboard/quizzes/${quiz.id}/edit`)
                          }
                        >
                          <Zap className="mr-2 h-4 w-4" /> Edit Quiz
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/dashboard/quizzes/${quiz.id}/results`)
                          }
                        >
                          <BarChart2 className="mr-2 h-4 w-4" /> Analytics
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            setQuizToDelete(quiz);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Middle: Info Pills */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-medium">
                    <Hourglass className="h-3.5 w-3.5" />
                    {quiz.timeLimitMinutes || "∞"} mins
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-500/10 text-violet-700 dark:text-violet-300 rounded-lg text-xs font-medium">
                    <BrainCircuit className="h-3.5 w-3.5" />
                    {quiz._count?.questions || 0} Questions
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-700 dark:text-amber-300 rounded-lg text-xs font-medium">
                    <Trophy className="h-3.5 w-3.5" />
                    Pass: {quiz.passingScore}%
                  </div>
                </div>

                {/* Bottom: Meta & Actions */}
                <div className="mt-auto pt-4 border-t border-dashed border-border/50 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div
                      className="flex items-center gap-1.5"
                      title="Total Attempts"
                    >
                      <Users className="h-4 w-4" />
                      <span>{quiz._count?.attempts || 0}</span>
                    </div>
                    <div className="h-1 w-1 rounded-full bg-border" />
                    <div
                      className="flex items-center gap-1.5"
                      title="Created Date"
                    >
                      <CalendarDays className="h-4 w-4" />
                      <span>
                        {new Date(quiz.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 rounded-lg hover:bg-primary/10 hover:text-primary"
                      onClick={() =>
                        router.push(`/dashboard/quizzes/${quiz.id}/results`)
                      }
                    >
                      <BarChart2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      className="h-8 rounded-lg bg-primary/90 hover:bg-primary shadow-sm"
                      onClick={() =>
                        router.push(`/dashboard/quizzes/${quiz.id}`)
                      }
                    >
                      Details <Eye className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. FOOTER PAGINATION */}
      {totalItems > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t mt-6 gap-4">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">
              {startItem}-{endItem}
            </span>{" "}
            of <span className="font-medium text-foreground">{totalItems}</span>
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPagination((p) => ({ ...p, pageIndex: p.pageIndex - 1 }))
              }
              disabled={pagination.pageIndex === 0}
              className="rounded-xl"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPagination((p) => ({ ...p, pageIndex: p.pageIndex + 1 }))
              }
              disabled={pagination.pageIndex >= pageCount - 1}
              className="rounded-xl"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* DELETE DIALOG */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Quiz?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-semibold text-foreground">
                {quizToDelete?.title}
              </span>{" "}
              and all student attempts. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setQuizToDelete(null)}
              className="rounded-xl"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90 rounded-xl"
            >
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
