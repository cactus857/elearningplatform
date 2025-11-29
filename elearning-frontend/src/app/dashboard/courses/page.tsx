"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  deleteCourse,
  getAllCoursesBaseRole,
  ICourse,
  ICourseRes,
} from "@/services/course.service";
import { getErrorMessage } from "@/utils/error-message";
import {
  BookOpen,
  Filter,
  Globe,
  LayoutDashboard,
  MoreHorizontal,
  PenTool,
  Plus,
  Search,
  Trash2,
  Users,
  FileText,
  Clock,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";

// --- CONFIGURATION ---
const LEVEL_STYLES = {
  BEGINNER:
    "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  INTERMEDIATE:
    "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  ADVANCED:
    "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20",
};

const STATUS_TABS = [
  { value: "all", label: "All Courses" },
  { value: "PUBLISHED", label: "Published" },
  { value: "DRAFT", label: "Drafts" },
  { value: "ARCHIVED", label: "Archived" },
];

interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

// --- COMPONENTS ---

const ProStatCard = ({
  title,
  value,
  icon: Icon,
  description,
  colorClass,
  borderClass,
}: any) => (
  <div
    className={cn(
      "relative overflow-hidden rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md",
      borderClass
    )}
  >
    <div className="flex items-center justify-between">
      <div className="relative z-10">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight text-foreground">
            {value}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground font-medium">
          {description}
        </p>
      </div>
      <div
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-lg shadow-sm",
          colorClass
        )}
      >
        <Icon className="h-6 w-6" />
      </div>
    </div>
    <Icon className="absolute -right-4 -bottom-4 h-24 w-24 opacity-5 text-foreground rotate-12" />
  </div>
);

// 2. Main Page
export default function CoursesPage() {
  const router = useRouter();

  // Logic States
  const [data, setData] = useState<ICourseRes[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 9,
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);
  const [statusTab, setStatusTab] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");

  // Dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<ICourse | null>(null);

  const filterChangedRef = useRef(false);

  // --- API ---
  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const statusParam = statusTab !== "all" ? statusTab : undefined;
      const response = await getAllCoursesBaseRole(
        pagination.pageIndex + 1,
        pagination.pageSize,
        levelFilter !== "all" ? levelFilter : undefined,
        statusParam,
        debouncedSearchQuery || undefined
      );
      setData(response.data);
      setTotalItems(response.totalItems);
    } catch (error) {
      toast.error(getErrorMessage(error));
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [pagination, debouncedSearchQuery, levelFilter, statusTab]);

  useEffect(() => {
    filterChangedRef.current = true;
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [debouncedSearchQuery, levelFilter, statusTab]);

  useEffect(() => {
    if (filterChangedRef.current && pagination.pageIndex !== 0) return;
    fetchCourses();
    filterChangedRef.current = false;
  }, [fetchCourses, pagination.pageIndex]);

  // Helpers
  const handleConfirmDelete = async () => {
    if (!courseToDelete) return;
    try {
      await deleteCourse(courseToDelete.id);
      toast.success("Course deleted successfully");
      setDeleteDialogOpen(false);
      fetchCourses();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const pageCount = Math.ceil(totalItems / pagination.pageSize);

  const totalStudents = data.reduce(
    (acc, c) => acc + (c._count?.enrollments || 0),
    0
  );
  const publishedCount = data.filter((c) => c.status === "PUBLISHED").length;

  return (
    <div className="space-y-8 pb-10">
      {/* 1. HERO HEADER */}
      <div className="relative overflow-hidden rounded-xl bg-slate-900 px-8 py-10 shadow-xl sm:px-10 sm:py-12">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="space-y-2">
            <div className="flex items-center gap-2 rounded-md bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300 backdrop-blur-sm border border-indigo-500/30 w-fit">
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>Instructor Console</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              Course Management
            </h1>
            <p className="max-w-xl text-slate-400">
              Oversee your curriculum, track enrollment analytics, and manage
              student progress.
            </p>
          </div>

          <Link href="/dashboard/courses/create">
            <Button
              size="lg"
              className="h-12 rounded-md bg-white text-slate-900 hover:bg-slate-100 font-semibold px-6 shadow-lg shadow-black/20 border-0"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create New Course
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. STATS GRID */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <ProStatCard
          title="Total Courses"
          value={totalItems}
          description="Active in library"
          icon={BookOpen}
          colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
          borderClass="border-l-4 border-l-blue-500"
        />
        <ProStatCard
          title="Total Students"
          value={totalStudents}
          description="Enrolled globally"
          icon={Users}
          colorClass="bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400"
          borderClass="border-l-4 border-l-violet-500"
        />
        <ProStatCard
          title="Published"
          value={publishedCount}
          description="Live courses"
          icon={Globe}
          colorClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
          borderClass="border-l-4 border-l-emerald-500"
        />
        <ProStatCard
          title="Drafts"
          value={data.length - publishedCount}
          description="Pending review"
          icon={PenTool}
          colorClass="bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400"
          borderClass="border-l-4 border-l-amber-500"
        />
      </div>

      {/* 3. TOOLBAR */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col justify-between gap-4 border-b border-border/60 pb-1 md:flex-row md:items-center">
          <Tabs
            value={statusTab}
            onValueChange={setStatusTab}
            className="w-full md:w-auto"
          >
            <TabsList className="h-12 w-full justify-start rounded-none bg-transparent p-0 md:w-auto gap-2">
              {STATUS_TABS.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="
                    relative h-12 rounded-none bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground 
                    transition-all 
                    hover:text-foreground
                    data-[state=active]:bg-transparent 
                    data-[state=active]:shadow-none 
                    data-[state=active]:text-primary 
                    after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:scale-x-0 after:bg-primary after:transition-transform data-[state=active]:after:scale-x-100
                  "
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Controls */}
          <div className="flex flex-1 items-center gap-3 md:max-w-md ml-auto pb-2">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-colors" />
              <Input
                placeholder="Search by title..."
                className="h-10 w-full pl-9 rounded-md bg-background border-input focus-visible:ring-1"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="h-10 w-[160px] rounded-md border-input bg-background px-3">
                <div className="flex items-center gap-2">
                  <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {levelFilter === "all"
                      ? "All Levels"
                      : LEVEL_STYLES[levelFilter as keyof typeof LEVEL_STYLES]
                      ? levelFilter
                      : "Level"}
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent align="end" className="rounded-md">
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="BEGINNER">Beginner</SelectItem>
                <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                <SelectItem value="ADVANCED">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 4. COURSE GRID (3 COLUMNS) */}
      {/* GRID FIX: Changed to lg:grid-cols-3 for wider cards */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-4 space-y-4">
              <Skeleton className="h-48 w-full rounded-md" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted bg-muted/20 p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-background border shadow-sm mb-4">
            <Search className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold text-foreground">
            No courses match your criteria
          </h3>
          <p className="text-muted-foreground mt-1 max-w-sm mb-6">
            Try changing your filters or create a new course to get started.
          </p>
          <Button
            onClick={() => {
              setStatusTab("all");
              setLevelFilter("all");
              setSearchQuery("");
            }}
            className="rounded-md px-6"
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {data.map((course) => (
            <div
              key={course.id}
              className="group flex flex-col overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300"
            >
              {/* Image Area */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted border-b">
                <Link href={`/dashboard/courses/${course.id}/edit`}>
                  {course.thumbnail ? (
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                      <div className="text-center">
                        <LayoutDashboard className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
                      </div>
                    </div>
                  )}
                  {/* Subtle Dark Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
                </Link>

                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                  {course.status === "PUBLISHED" ? (
                    <Badge className="rounded-md bg-background/90 text-emerald-600 dark:text-emerald-400 backdrop-blur-sm shadow-sm font-semibold hover:bg-background border-0">
                      Published
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="rounded-md bg-background/90 text-muted-foreground backdrop-blur-sm shadow-sm font-semibold hover:bg-background border border-border/50"
                    >
                      Draft
                    </Badge>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="flex flex-1 flex-col p-6">
                <div className="mb-3 flex items-center justify-between">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border",
                      LEVEL_STYLES[course.level]
                    )}
                  >
                    {course.level}
                  </span>
                </div>

                <Link
                  href={`/dashboard/courses/${course.id}/edit`}
                  className="block group-hover:text-primary transition-colors"
                >
                  <h3 className="line-clamp-2 font-bold leading-snug tracking-tight text-xl min-h-[3.5rem] text-foreground">
                    {course.title}
                  </h3>
                </Link>

                {/* Small Description */}
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground min-h-[2.5rem] leading-relaxed">
                  {course.smallDescription || "No description provided."}
                </p>

                {/* Metrics */}
                <div className="mt-5 flex items-center justify-between text-xs font-medium text-muted-foreground py-4 border-y border-dashed">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    <span>{course._count?.enrollments || 0} students</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileText className="h-4 w-4" />
                    <span>{course._count.chapters} chapters</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration || 0}h</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 border shadow-sm">
                      <AvatarImage
                        src={course.instructor.avatar || undefined}
                      />
                      <AvatarFallback className="text-[10px] font-bold bg-muted text-muted-foreground">
                        {course.instructor.fullName.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground font-medium uppercase">
                        Instructor
                      </span>
                      <span className="text-xs font-semibold text-foreground truncate max-w-[120px]">
                        {course.instructor.fullName}
                      </span>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-md hover:bg-muted"
                      >
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="rounded-md w-48 shadow-lg border-border"
                    >
                      <DropdownMenuItem
                        onClick={() => router.push(`/course/${course.id}`)}
                        className="cursor-pointer font-medium"
                      >
                        <Globe className="mr-2 h-4 w-4 text-blue-500" /> View
                        Public Page
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(`/dashboard/courses/${course.id}/edit`)
                        }
                        className="cursor-pointer font-medium"
                      >
                        <PenTool className="mr-2 h-4 w-4 text-muted-foreground" />{" "}
                        Manage Content
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          setCourseToDelete(course);
                          setDeleteDialogOpen(true);
                        }}
                        className="text-destructive focus:text-destructive cursor-pointer font-medium"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Course
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. PAGINATION */}
      {totalItems > 0 && (
        <div className="flex items-center justify-between border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">
              {Math.min(
                pagination.pageIndex * pagination.pageSize + 1,
                totalItems
              )}
            </span>{" "}
            to{" "}
            <span className="font-medium text-foreground">
              {Math.min(
                (pagination.pageIndex + 1) * pagination.pageSize,
                totalItems
              )}
            </span>{" "}
            of <span className="font-medium text-foreground">{totalItems}</span>{" "}
            results
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-md px-3"
              onClick={() =>
                setPagination((p) => ({ ...p, pageIndex: p.pageIndex - 1 }))
              }
              disabled={pagination.pageIndex === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-md px-3"
              onClick={() =>
                setPagination((p) => ({ ...p, pageIndex: p.pageIndex + 1 }))
              }
              disabled={pagination.pageIndex >= pageCount - 1}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* 6. DELETE DIALOG */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-lg border bg-background shadow-lg">
          <div className="flex flex-col items-center gap-2 text-center p-4">
            <div className="rounded-full bg-destructive/10 p-3 text-destructive mb-2">
              <Trash2 className="h-6 w-6" />
            </div>
            <AlertDialogTitle className="text-xl">
              Delete Course?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                {courseToDelete?.title}
              </span>
              ?
              <br />
              This action cannot be undone and all data will be lost.
            </AlertDialogDescription>
          </div>
          <AlertDialogFooter className="p-4 bg-muted/30">
            <AlertDialogCancel className="rounded-md h-10 border-input bg-background">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90 rounded-md h-10"
            >
              Delete Course
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
