"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    BookOpen,
    CheckCircle2,
    Clock,
    GraduationCap,
    Loader2,
    PlayCircle,
    Target,
    Trophy,
    TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
    getMyCoursesProgress,
    IProgressSummary,
} from "@/services/progress.service";
import { cn } from "@/lib/utils";

// Helper function to get progress bar color based on percentage
const getProgressColor = (percentage: number, isCompleted: boolean): string => {
    if (isCompleted) return "[&>div]:bg-emerald-500";
    if (percentage < 50) return "[&>div]:bg-red-500";
    if (percentage < 70) return "[&>div]:bg-orange-500";
    return "[&>div]:bg-emerald-500";
};

// Helper function to get progress text color
const getProgressTextColor = (percentage: number, isCompleted: boolean): string => {
    if (isCompleted) return "text-emerald-600 dark:text-emerald-400";
    if (percentage < 50) return "text-red-600 dark:text-red-400";
    if (percentage < 70) return "text-orange-600 dark:text-orange-400";
    return "text-emerald-600 dark:text-emerald-400";
};

// Helper function to get border color
const getProgressBorderColor = (percentage: number, isCompleted: boolean): string => {
    if (isCompleted) return "border-emerald-500/50";
    if (percentage < 50) return "border-red-500/30";
    if (percentage < 70) return "border-orange-500/30";
    return "border-emerald-500/30";
};

export default function MyProgressPage() {
    const router = useRouter();
    const [progress, setProgress] = useState<IProgressSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadProgress();
    }, []);

    const loadProgress = async () => {
        try {
            setIsLoading(true);
            const response = await getMyCoursesProgress();
            setProgress(response.data);
        } catch (err: any) {
            console.error("Error loading progress:", err);
            setError(err.response?.data?.message || "Failed to load progress");
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate overall stats
    const totalCourses = progress.length;
    const completedCourses = progress.filter((p) => p.isCompleted).length;
    const inProgressCourses = totalCourses - completedCourses;
    const totalLessons = progress.reduce((acc, p) => acc + p.totalLessons, 0);
    const completedLessons = progress.reduce(
        (acc, p) => acc + p.completedLessons,
        0
    );
    const overallProgress =
        totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-32 rounded-2xl" />
                    ))}
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-64 rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={loadProgress}>Try Again</Button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Progress</h1>
                <p className="text-muted-foreground mt-1">
                    Track your learning journey across all enrolled courses
                </p>
            </div>

            {/* Overall Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Overall Progress */}
                <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Overall Progress
                                </p>
                                <p className="text-3xl font-bold mt-1">{overallProgress}%</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <TrendingUp className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                        <Progress value={overallProgress} className="mt-4 h-2" />
                    </CardContent>
                </Card>

                {/* Enrolled Courses */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Enrolled Courses
                                </p>
                                <p className="text-3xl font-bold mt-1">{totalCourses}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4">
                            {inProgressCourses} in progress, {completedCourses} completed
                        </p>
                    </CardContent>
                </Card>

                {/* Completed Lessons */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Lessons Completed
                                </p>
                                <p className="text-3xl font-bold mt-1">
                                    {completedLessons}/{totalLessons}
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                        </div>
                        <Progress
                            value={totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0}
                            className="mt-4 h-2"
                        />
                    </CardContent>
                </Card>

                {/* Completed Courses */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Courses Completed
                                </p>
                                <p className="text-3xl font-bold mt-1">{completedCourses}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                                <Trophy className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4">
                            {totalCourses > 0
                                ? `${Math.round((completedCourses / totalCourses) * 100)}% completion rate`
                                : "No courses enrolled yet"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Course Progress List */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Course Progress</h2>
                {progress.length === 0 ? (
                    <Card className="p-12 text-center">
                        <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                            <GraduationCap className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No Courses Enrolled</h3>
                        <p className="text-muted-foreground mb-4">
                            Start your learning journey by enrolling in a course
                        </p>
                        <Link href="/course">
                            <Button>Browse Courses</Button>
                        </Link>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {progress.map((course) => (
                            <Card
                                key={course.enrollmentId}
                                className={cn(
                                    "overflow-hidden transition-all hover:shadow-lg cursor-pointer group",
                                    getProgressBorderColor(course.progressPercentage, course.isCompleted)
                                )}
                                onClick={() =>
                                    router.push(`/dashboard/learning/${course.enrollmentId}`)
                                }
                            >
                                {/* Color indicator bar at top */}
                                <div className={cn(
                                    "h-1",
                                    course.isCompleted ? "bg-gradient-to-r from-emerald-400 to-emerald-600" :
                                        course.progressPercentage < 50 ? "bg-gradient-to-r from-red-400 to-red-600" :
                                            course.progressPercentage < 70 ? "bg-gradient-to-r from-orange-400 to-orange-600" :
                                                "bg-gradient-to-r from-emerald-400 to-emerald-600"
                                )} />
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                                            {course.courseTitle}
                                        </CardTitle>
                                        {course.isCompleted ? (
                                            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 shrink-0">
                                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                                Completed
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="shrink-0">
                                                In Progress
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Progress Bar */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Progress</span>
                                            <span className={cn(
                                                "font-semibold",
                                                getProgressTextColor(course.progressPercentage, course.isCompleted)
                                            )}>
                                                {Math.round(course.progressPercentage)}%
                                            </span>
                                        </div>
                                        <Progress
                                            value={course.progressPercentage}
                                            className={cn(
                                                "h-2",
                                                getProgressColor(course.progressPercentage, course.isCompleted)
                                            )}
                                        />
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <PlayCircle className="h-4 w-4" />
                                            <span>
                                                {course.completedLessons}/{course.totalLessons} lessons
                                            </span>
                                        </div>
                                        {course.isCompleted && course.completedAt && (
                                            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                                <Trophy className="h-4 w-4" />
                                                <span>
                                                    {new Date(course.completedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Continue Button */}
                                    <Button
                                        className="w-full"
                                        variant={course.isCompleted ? "outline" : "default"}
                                    >
                                        {course.isCompleted ? "Review Course" : "Continue Learning"}
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
