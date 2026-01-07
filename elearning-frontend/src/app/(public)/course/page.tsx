"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  BookOpen,
  Users,
  Clock,
  LayoutGrid,
  List as ListIcon,
  ChevronRight,
  GraduationCap,
  Filter,
  ArrowRight,
  Sparkles,
  BarChart,
  X,
  PlayCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { getAllCourses, type ICourseRes } from "@/services/course.service";
import { searchCourses } from "@/services/search.service";
import { toast } from "sonner";
import { getInitials } from "@/utils/get-initial";
import { useDebounce } from "use-debounce";
import { cn } from "@/lib/utils";

// --- TYPES & CONSTANTS ---
interface CourseWithQuizzes extends ICourseRes {
  quizCount?: number;
}

interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

const COURSE_CATEGORIES = [
  "Development",
  "Business",
  "Finance & Accounting",
  "IT & Software",
  "Office Productivity",
  "Personal Development",
  "Design",
  "Marketing",
  "Lifestyle",
  "Photography & Video",
  "Health & Fitness",
  "Music",
  "Teaching & Academics",
] as const;

const LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;
const SORT_OPTIONS = [
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "Newest First" },
  { value: "chapters", label: "Content Rich" },
  { value: "title", label: "A-Z" },
] as const;

// --- UTILS ---
function getLevelColor(level: string): string {
  switch (level) {
    case "BEGINNER":
      return "bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800";
    case "INTERMEDIATE":
      return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800";
    case "ADVANCED":
      return "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800";
    default:
      return "bg-slate-500/10 text-slate-700 dark:text-slate-400";
  }
}

function getLevelLabel(level: string) {
  return level.charAt(0) + level.slice(1).toLowerCase();
}

// --- COMPONENTS ---

// 1. Hero Section
const HeroSection = ({ totalItems }: { totalItems: number }) => (
  <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-2xl mb-10 group">
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-600/30 via-purple-600/30 to-transparent blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-1000" />

    <div className="relative z-10 px-8 py-16 md:py-24 text-center max-w-4xl mx-auto space-y-6">
      <Badge
        variant="secondary"
        className="bg-white/10 hover:bg-white/20 text-white border-0 px-4 py-1.5 backdrop-blur-md mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700"
      >
        <Sparkles className="w-3.5 h-3.5 mr-2 text-yellow-400" />
        Explore our learning catalog
      </Badge>
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100">
        Unlock Your Potential
      </h1>
      <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
        Access <span className="font-semibold text-white">{totalItems}+</span>{" "}
        premium courses taught by industry experts. Start your learning journey
        today.
      </p>
    </div>
  </div>
);

// 2. Course Card (Grid)
function CourseCardGrid({ course }: { course: CourseWithQuizzes }) {
  const router = useRouter();

  return (
    <div
      className="group relative bg-card rounded-2xl border border-border/50 overflow-hidden hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col h-full cursor-pointer hover:-translate-y-1"
      onClick={() => router.push(`/course/${course.slug}`)}
    >
      {/* Image Area */}
      <div className="relative aspect-video overflow-hidden bg-muted">
        {course.thumbnail ? (
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <GraduationCap className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}

        {/* Overlay Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className="bg-white/90 dark:bg-black/80 text-foreground backdrop-blur-md shadow-sm border-0 hover:bg-white text-[10px] font-bold px-2.5 py-1">
            {course.category || "General"}
          </Badge>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex justify-between items-start mb-2">
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] font-bold px-2 py-0.5 border",
              getLevelColor(course.level)
            )}
          >
            {getLevelLabel(course.level)}
          </Badge>
        </div>

        <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-2 group-hover:text-primary transition-colors min-h-[3.5rem]">
          {course.title}
        </h3>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
          {course.smallDescription || "No description provided."}
        </p>

        {/* Instructor & Stats */}
        <div className="pt-4 mt-auto border-t border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 border border-border">
              <AvatarImage src={course.instructor?.avatar} />
              <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                {getInitials(course.instructor?.fullName || "Un")}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                Instructor
              </span>
              <span className="text-xs font-semibold line-clamp-1 max-w-[100px]">
                {course.instructor?.fullName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
            <div className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-md">
              <BookOpen className="h-3 w-3" />
              <span>{course._count?.chapters || 0}</span>
            </div>
            <div className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-md">
              <Users className="h-3 w-3" />
              <span>{course._count?.enrollments || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 3. Course Card (List)
function CourseCardList({ course }: { course: CourseWithQuizzes }) {
  const router = useRouter();
  return (
    <div
      onClick={() => router.push(`/course/${course.slug}`)}
      className="group flex flex-col md:flex-row bg-card border border-border/60 rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-indigo-500/5 hover:border-primary/20 transition-all duration-300 cursor-pointer p-1"
    >
      <div className="relative w-full md:w-72 aspect-video md:aspect-auto shrink-0 rounded-xl overflow-hidden">
        {course.thumbnail ? (
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center">
            <GraduationCap className="h-10 w-10 text-muted-foreground/50" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <Badge
            variant="secondary"
            className="backdrop-blur-md bg-white/90 dark:bg-black/80 shadow-sm border-0 font-bold text-[10px]"
          >
            {course.level}
          </Badge>
        </div>
      </div>

      <div className="flex-1 p-4 md:p-6 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <Badge
              variant="outline"
              className="text-[10px] mb-2 border-primary/20 text-primary bg-primary/5"
            >
              {course.category || "General"}
            </Badge>
            {course.duration && (
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> {course.duration}h
              </div>
            )}
          </div>
          <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
            {course.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 max-w-3xl leading-relaxed">
            {course.smallDescription || course.description}
          </p>
        </div>

        <div className="flex items-center justify-between mt-2 pt-4 border-t border-dashed border-border/60">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 border border-border">
              <AvatarImage src={course.instructor?.avatar} />
              <AvatarFallback className="text-[10px] font-bold bg-secondary">
                {getInitials(course.instructor?.fullName || "I")}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase font-bold">
                Created by
              </div>
              <div className="text-xs font-semibold">
                {course.instructor?.fullName}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4" /> {course._count?.enrollments || 0}{" "}
                students
              </div>
              <div className="flex items-center gap-1.5">
                <PlayCircle className="h-4 w-4" />{" "}
                {course._count?.chapters || 0} chapters
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:flex gap-2 rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-all"
            >
              View Details <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 4. Skeleton Loaders
function CoursesGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-border bg-card overflow-hidden h-[380px] flex flex-col"
        >
          <Skeleton className="h-48 w-full rounded-none" />
          <div className="p-5 space-y-3 flex-1">
            <div className="flex gap-2">
              <Skeleton className="h-4 w-16 rounded-full" />
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="mt-auto pt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-2 w-12" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// --- MAIN PAGE ---
export default function CoursesPage() {
  const router = useRouter();

  // State
  const [data, setData] = useState<CourseWithQuizzes[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 12,
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filterChangedRef = useRef(false);

  // Sorting function
  const applySorting = (courses: CourseWithQuizzes[], sortBy: string) => {
    const sorted = [...courses];
    sorted.sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return (b._count?.enrollments || 0) - (a._count?.enrollments || 0);
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "chapters":
          return (b._count?.chapters || 0) - (a._count?.chapters || 0);
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
    return sorted;
  };

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      // Use Elasticsearch for search queries (better full-text search with fuzzy matching)
      if (debouncedSearchQuery) {
        const esResponse = await searchCourses({
          keyword: debouncedSearchQuery,
          level: selectedLevel !== "all" ? selectedLevel : undefined,
          category: selectedCategory !== "all" ? selectedCategory : undefined,
          status: "PUBLISHED",
          page: pagination.pageIndex + 1,
          limit: pagination.pageSize,
        });

        // Map Elasticsearch results to match ICourseRes format
        const mappedData = esResponse.data.map((course) => ({
          id: course.id,
          title: course.title,
          slug: course.slug,
          description: course.description,
          smallDescription: course.smallDescription,
          thumbnail: course.thumbnail,
          level: course.level as any,
          category: course.category,
          status: course.status as any,
          createdAt: course.createdAt,
          instructor: course.instructor,
          _count: {
            chapters: 0,
            enrollments: course.enrollmentCount || 0,
          },
          _highlight: course.highlight, // Keep highlight for potential use
        }));

        const filteredData = applySorting(mappedData as any, sortBy);
        setData(filteredData);
        setTotalItems(esResponse.totalItems);
      } else {
        // Use regular API for browsing without search
        const response = await getAllCourses(
          pagination.pageIndex + 1,
          pagination.pageSize,
          "PUBLISHED",
          selectedLevel !== "all" ? selectedLevel : undefined,
          undefined
        );

        let filteredData = response.data;
        if (selectedCategory !== "all") {
          filteredData = filteredData.filter(
            (course) => course.category === selectedCategory
          );
        }

        filteredData = applySorting(filteredData, sortBy);

        setData(filteredData);
        setTotalItems(response.totalItems);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to load courses");
      setData([]);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    selectedLevel,
    debouncedSearchQuery,
    selectedCategory,
    sortBy,
  ]);

  useEffect(() => {
    filterChangedRef.current = true;
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [debouncedSearchQuery, selectedCategory, selectedLevel, sortBy]);

  useEffect(() => {
    if (filterChangedRef.current && pagination.pageIndex !== 0) return;
    fetchCourses();
    filterChangedRef.current = false;
  }, [fetchCourses, pagination.pageIndex]);

  // Pagination Handlers
  const pageCount = Math.ceil(totalItems / pagination.pageSize);
  const startItem = pagination.pageIndex * pagination.pageSize + 1;
  const endItem = Math.min(
    (pagination.pageIndex + 1) * pagination.pageSize,
    totalItems
  );

  // Clear Filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedLevel("all");
    setSortBy("popular");
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== "all" ||
    selectedLevel !== "all" ||
    sortBy !== "popular";

  // Handle category pills
  const handleCategorySelect = (cat: string) => {
    if (selectedCategory === cat) setSelectedCategory("all");
    else setSelectedCategory(cat);
  };

  return (
    <div className="min-h-screen bg-slate-50/30 dark:bg-black p-4 md:p-8 font-sans pb-20">
      {/* 1. HERO SECTION */}
      <HeroSection totalItems={totalItems} />

      <div className="max-w-7xl mx-auto space-y-8">
        {/* 2. FILTER & CONTROL BAR */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm">
            {/* Search & Filters Group */}
            <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto flex-1">
              <div className="relative w-full lg:w-96 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Search courses, topics, or instructors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 bg-secondary/30 border-border/60 focus:bg-background transition-colors rounded-xl"
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="h-10 w-[160px] rounded-lg border-border/50 bg-background">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Filter className="w-3.5 h-3.5" />{" "}
                      <SelectValue placeholder="Category" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {COURSE_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger className="h-10 w-[140px] rounded-lg border-border/50 bg-background">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <BarChart className="w-3.5 h-3.5" />{" "}
                      <SelectValue placeholder="Level" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    {LEVELS.map((l) => (
                      <SelectItem key={l} value={l}>
                        {getLevelLabel(l)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Sort & View Toggles */}
            <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
              <div className="flex items-center gap-2 flex-1 md:flex-none">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-10 w-[160px] rounded-xl bg-secondary/20 border-border/60">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="truncate text-muted-foreground">
                        Sort:{" "}
                        <span className="font-semibold text-foreground">
                          {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
                        </span>
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent align="end">
                    {SORT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="h-8 w-[1px] bg-border mx-2 hidden md:block"></div>

              <div className="bg-muted p-1 rounded-lg flex items-center shrink-0">
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={cn(
                      "h-8 w-8 p-0 rounded-md",
                      viewMode === "grid"
                        ? "bg-background shadow-sm text-foreground"
                        : "text-muted-foreground hover:bg-background/50"
                    )}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "h-8 w-8 p-0 rounded-md",
                      viewMode === "list"
                        ? "bg-background shadow-sm text-foreground"
                        : "text-muted-foreground hover:bg-background/50"
                    )}
                  >
                    <ListIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <span className="text-xs font-semibold text-muted-foreground mr-2">
                Active Filters:
              </span>
              {selectedCategory !== "all" && (
                <Badge
                  variant="secondary"
                  className="gap-1 pl-2 pr-1 py-1 hover:bg-secondary cursor-pointer"
                  onClick={() => setSelectedCategory("all")}
                >
                  Category: {selectedCategory}{" "}
                  <X className="w-3 h-3 hover:text-destructive" />
                </Badge>
              )}
              {selectedLevel !== "all" && (
                <Badge
                  variant="secondary"
                  className="gap-1 pl-2 pr-1 py-1 hover:bg-secondary cursor-pointer"
                  onClick={() => setSelectedLevel("all")}
                >
                  Level: {getLevelLabel(selectedLevel)}{" "}
                  <X className="w-3 h-3 hover:text-destructive" />
                </Badge>
              )}
              {searchQuery && (
                <Badge
                  variant="secondary"
                  className="gap-1 pl-2 pr-1 py-1 hover:bg-secondary cursor-pointer"
                  onClick={() => setSearchQuery("")}
                >
                  Search: {searchQuery}{" "}
                  <X className="w-3 h-3 hover:text-destructive" />
                </Badge>
              )}
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs text-destructive hover:text-destructive/80 ml-2"
                onClick={clearFilters}
              >
                Clear all
              </Button>
            </div>
          )}

          {/* Quick Category Pills */}
          <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex items-center gap-2">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                className="rounded-full h-8 text-xs whitespace-nowrap border-primary/20"
                onClick={() => setSelectedCategory("all")}
              >
                All Categories
              </Button>
              {COURSE_CATEGORIES.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "rounded-full h-8 text-xs whitespace-nowrap border border-transparent",
                    selectedCategory === cat
                      ? ""
                      : "bg-secondary/30 hover:bg-secondary/60 border-border/30 hover:border-border"
                  )}
                  onClick={() => handleCategorySelect(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. CONTENT GRID */}
        {isLoading ? (
          viewMode === "grid" ? (
            <CoursesGridSkeleton />
          ) : (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-48 w-full bg-muted rounded-2xl animate-pulse"
                />
              ))}
            </div>
          )
        ) : data.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center bg-card border border-dashed border-border rounded-3xl p-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mb-6">
              <Search className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-foreground">
              No Courses Found
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              We could not find any courses matching your current filters. Try
              adjusting your search keywords or categories.
            </p>
            <Button
              variant="link"
              onClick={clearFilters}
              className="mt-4 text-primary font-semibold"
            >
              Clear all filters
            </Button>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
                {data.map((course) => (
                  <CourseCardGrid key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <div className="space-y-4 max-w-5xl mx-auto pb-10">
                {data.map((course) => (
                  <CourseCardList key={course.id} course={course} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. PAGINATION */}
        {!isLoading && data.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-8 border-t border-border mt-8">
            <div className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-medium text-foreground">
                {startItem}-{endItem}
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground">{totalItems}</span>{" "}
              courses
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <span className="text-sm text-muted-foreground mr-2">
                  Per page:
                </span>
                <Select
                  value={pagination.pageSize.toString()}
                  onValueChange={(v) => {
                    setPagination({
                      ...pagination,
                      pageSize: Number(v),
                      pageIndex: 0,
                    });
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  <SelectTrigger className="h-8 w-[70px] bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[8, 12, 24, 48].map((s) => (
                      <SelectItem key={s} value={s.toString()}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPagination((p) => ({
                      ...p,
                      pageIndex: p.pageIndex - 1,
                    }));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  disabled={pagination.pageIndex === 0}
                  className="h-8 px-3"
                >
                  Previous
                </Button>
                <div className="text-sm font-medium px-2 min-w-[3rem] text-center">
                  {pagination.pageIndex + 1} / {pageCount}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPagination((p) => ({
                      ...p,
                      pageIndex: p.pageIndex + 1,
                    }));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  disabled={pagination.pageIndex >= pageCount - 1}
                  className="h-8 px-3"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
