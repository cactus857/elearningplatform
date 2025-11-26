"use client";

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
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
  Clock,
  Edit,
  Eye,
  Filter,
  MoreVertical,
  Plus,
  Search,
  Trash2,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";

const LEVEL_COLORS = {
  BEGINNER: "bg-green-500 text-white border-green-600",
  INTERMEDIATE: "bg-blue-500 text-white border-blue-600",
  ADVANCED: "bg-purple-500 text-white border-purple-600",
};

const STATUS_COLORS = {
  DRAFT: "bg-yellow-500 text-white border-yellow-600",
  PUBLISHED: "bg-green-500 text-white border-green-600",
  ARCHIVED: "bg-red-500 text-white border-red-600",
};

interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

function CoursesPage() {
  const router = useRouter();

  // Data & Loading
  const [data, setData] = useState<ICourseRes[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Pagination
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 8,
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);
  const [levelFilter, setLevelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<ICourse | null>(null);

  // Ref để chặn fetch sai trang khi vừa đổi filter
  const filterChangedRef = useRef(false);

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAllCoursesBaseRole(
        pagination.pageIndex + 1,
        pagination.pageSize,
        levelFilter !== "all" ? levelFilter : undefined,
        statusFilter !== "all" ? statusFilter : undefined,
        debouncedSearchQuery || undefined
      );

      setData(response.data);
      setTotalItems(response.totalItems);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to fetch courses", {
        description: getErrorMessage(error),
      });
      setData([]);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    debouncedSearchQuery,
    levelFilter,
    statusFilter,
  ]);

  // Khi search hoặc filter đổi → reset page về đầu
  useEffect(() => {
    filterChangedRef.current = true;
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [debouncedSearchQuery, levelFilter, statusFilter]);

  // Khi pagination hoặc filter đổi → fetch dữ liệu
  useEffect(() => {
    if (filterChangedRef.current && pagination.pageIndex !== 0) {
      return; // chặn fetch sai trang khi vừa đổi filter
    }

    fetchCourses();
    filterChangedRef.current = false;
  }, [fetchCourses, pagination.pageIndex]);

  const pageCount = Math.ceil(totalItems / pagination.pageSize);

  const handlePrevPage = () => {
    setPagination((prev) => ({
      ...prev,
      pageIndex: Math.max(0, prev.pageIndex - 1),
    }));
  };

  const handleNextPage = () => {
    setPagination((prev) => ({
      ...prev,
      pageIndex: Math.min(pageCount - 1, prev.pageIndex + 1),
    }));
  };

  const handlePageSize = (size: number) => {
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
      pageSize: size,
    }));
  };

  const clearFilters = () => {
    setLevelFilter("all");
    setStatusFilter("all");
    setSearchQuery("");
  };

  const hasActiveFilters =
    levelFilter !== "all" || statusFilter !== "all" || searchQuery;

  const startItem = pagination.pageIndex * pagination.pageSize + 1;
  const endItem = Math.min(
    (pagination.pageIndex + 1) * pagination.pageSize,
    totalItems
  );

  const handleConfirmDelete = async () => {
    if (!courseToDelete) return;

    try {
      await deleteCourse(courseToDelete.id);
      toast.success(`Deleted course: ${courseToDelete.title}`);

      // Đóng dialog
      setDeleteDialogOpen(false);
      setCourseToDelete(null);

      // Reload danh sách
      fetchCourses();
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      toast.error(errorMsg);
    }
  };
  return (
    <>
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Courses</h1>
          <p className="text-muted-foreground mt-1">
            Manage and organize your courses
          </p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <Link href="/dashboard/courses/create" className={buttonVariants()}>
            <Plus className="h-4 w-4" />
            Create Course
          </Link>
        </div>
      </div>

      {/* Filters & Search Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search courses by title..."
                className="pl-9 pr-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="h-4 w-4" />
                <span>Filters:</span>
              </div>

              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="BEGINNER">Beginner</SelectItem>
                  <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                  <SelectItem value="ADVANCED">Advanced</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear all
                </Button>
              )}
            </div>

            {/* Pagination Info */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  Courses per page
                </span>
                <Select
                  value={pagination.pageSize.toString()}
                  onValueChange={(value) => handlePageSize(Number(value))}
                >
                  <SelectTrigger className="w-fit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[4, 8, 12, 16].map((pageSize) => (
                      <SelectItem key={pageSize} value={pageSize.toString()}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="text-sm text-muted-foreground">
                {totalItems > 0 ? (
                  <p aria-live="polite">
                    <span className="text-foreground font-medium">
                      {startItem}-{endItem}
                    </span>{" "}
                    of{" "}
                    <span className="text-foreground font-medium">
                      {totalItems}
                    </span>
                  </p>
                ) : (
                  <p>No items to display</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.length} on this page
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.filter((c) => c.status === "PUBLISHED").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Live on platform
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.filter((c) => c.status === "DRAFT").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">In preparation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.reduce((sum, c) => sum + (c._count?.enrollments || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across current page
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Courses Grid */}
      {isLoading && data.length === 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card
              key={i}
              className="group relative overflow-hidden transition-all duration-500 border-border/50 bg-card/50 backdrop-blur-sm"
            >
              {/* Gradient border */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 opacity-40 blur-xl" />
              <div className="absolute inset-[1px] bg-card rounded-[inherit] z-[1]" />

              <div className="relative z-[2]">
                {/* Thumbnail Skeleton */}
                <div className="relative block aspect-[21/9] overflow-hidden bg-muted/20">
                  <Skeleton className="absolute inset-0 w-full h-full" />

                  {/* Fake Badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Skeleton className="h-5 w-16 rounded-full bg-white/20" />
                    <Skeleton className="h-5 w-16 rounded-full bg-white/20" />
                  </div>

                  {/* Fake Quick Actions */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Skeleton className="h-9 w-9 rounded-full bg-white/20" />
                    <Skeleton className="h-9 w-9 rounded-full bg-white/20" />
                  </div>

                  {/* Bottom info bar */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/30 to-transparent">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-24 bg-white/30" />
                      <Skeleton className="h-4 w-20 bg-white/30" />
                    </div>
                  </div>
                </div>

                {/* Body content */}
                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>

                  {/* Instructor */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>

                  {/* Button */}
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : data.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No courses found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {hasActiveFilters
                ? "Try adjusting your filters or search query"
                : "Get started by creating your first course"}
            </p>
            {hasActiveFilters ? (
              <Button className="mt-4" variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            ) : (
              <Button
                className="mt-4"
                onClick={() => router.push("/dashboard/courses/create")}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Course
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            {data.map((course) => (
              <Card
                key={course.id}
                className="group relative overflow-hidden transition-all duration-500 hover:shadow-2xl border-border/50 bg-card/50 backdrop-blur-sm"
              >
                {/* Animated gradient border on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl" />
                <div className="absolute inset-[1px] bg-card rounded-[inherit] z-[1]" />

                {/* Content wrapper */}
                <div className="relative z-[2]">
                  {/* Course Thumbnail */}
                  <Link
                    href={`/course/${course.id}`}
                    className="relative block aspect-[21/9] overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-background"
                  >
                    {course.thumbnail ? (
                      <>
                        <Image
                          src={course.thumbnail}
                          alt={course.title}
                          fill
                          className="object-cover transition-all duration-700 group-hover:scale-110"
                        />
                        {/* Animated shine effect */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        </div>
                      </>
                    ) : (
                      <div className="flex h-full items-center justify-center relative overflow-hidden">
                        {/* Animated background particles */}
                        <div className="absolute inset-0">
                          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse" />
                          <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-primary/5 rounded-full blur-3xl animate-pulse delay-700" />
                        </div>
                        <BookOpen className="relative h-20 w-20 text-primary/40 group-hover:text-primary/60 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12" />
                      </div>
                    )}

                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Badges with stagger animation */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <Badge
                        className={cn(
                          "text-xs font-semibold shadow-lg backdrop-blur-md border-0 transition-all duration-500",
                          "group-hover:scale-110 group-hover:shadow-xl",
                          STATUS_COLORS[course.status]
                        )}
                      >
                        {course.status}
                      </Badge>
                      <Badge
                        className={cn(
                          "text-xs font-semibold shadow-lg backdrop-blur-md border-0 transition-all duration-500 delay-75",
                          "group-hover:scale-110 group-hover:shadow-xl",
                          LEVEL_COLORS[course.level]
                        )}
                      >
                        {course.level}
                      </Badge>
                    </div>

                    {/* Quick actions with slide-in animation */}
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-9 w-9 bg-background/95 backdrop-blur-md shadow-xl hover:bg-background hover:scale-110 transition-all duration-300"
                        onClick={(e) => {
                          e.preventDefault();
                          router.push(`/dashboard/courses/${course.id}/edit`);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          asChild
                          onClick={(e) => e.preventDefault()}
                        >
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-9 w-9 bg-background/95 backdrop-blur-md shadow-xl hover:bg-background hover:scale-110 transition-all duration-300"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => router.push(`/course/${course.id}`)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(
                                `/dashboard/courses/${course.id}/edit`
                              )
                            }
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setCourseToDelete(course);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Bottom info bar slide up on hover */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-black/90 to-transparent">
                      <div className="flex items-center justify-between text-white/90">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              {course.duration}h
                            </span>
                          </div>
                          <div className="w-px h-4 bg-white/20" />
                          <div className="flex items-center gap-1.5">
                            <Users className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              {course._count?.enrollments || 0}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full">
                          Click to view
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* Course Content */}
                  <div className="p-6 space-y-4">
                    {/* Title & Description */}
                    <div className="space-y-2">
                      <Link
                        href={`/course/${course.id}`}
                        className="block group/title"
                      >
                        <h3 className="font-bold text-xl line-clamp-2 min-h-[3.5rem] group-hover/title:text-primary transition-colors duration-300">
                          {course.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                        {course.smallDescription ||
                          "Discover what this course has to offer"}
                      </p>
                    </div>

                    {/* Instructor with hover effect */}
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 group-hover:bg-muted/60 transition-all duration-300">
                      <Avatar className="h-10 w-10 ring-2 ring-background shadow-md transition-all duration-300 group-hover:ring-primary/50 group-hover:shadow-lg">
                        <AvatarImage
                          src={course.instructor.avatar || undefined}
                        />
                        <AvatarFallback className="text-sm font-bold bg-primary/10 text-primary">
                          {course.instructor.fullName
                            .substring(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {course.instructor.fullName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Course Instructor
                        </p>
                      </div>
                    </div>

                    {/* Action Button with gradient hover */}
                    <Button
                      className="w-full font-semibold shadow-md group-hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/dashboard/courses/${course.id}/edit`);
                      }}
                    >
                      <span className="relative z-10 flex items-center justify-center">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Course
                      </span>
                      {/* Animated gradient background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between gap-4 mt-8">
            <div />

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handlePrevPage}
                disabled={pagination.pageIndex === 0}
              >
                Previous
              </Button>
              <div className="text-sm text-muted-foreground min-w-fit px-2">
                Page {pagination.pageIndex + 1} of {pageCount || 1}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleNextPage}
                disabled={
                  pagination.pageIndex === pageCount - 1 || pageCount === 0
                }
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the course{" "}
              <strong>{courseToDelete?.title}</strong> and all its chapters and
              lessons. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default CoursesPage;
