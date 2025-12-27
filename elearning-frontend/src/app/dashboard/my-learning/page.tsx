"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
    BookOpen,
    CheckCircle2,
    Clock,
    GraduationCap,
    PlayCircle,
    User,
} from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    getMyEnrollments,
    IMyCourseEnrollment,
} from "@/services/enrollment.service";
import {
    getMyCoursesProgress,
    IProgressSummary,
} from "@/services/progress.service";
import { getInitials } from "@/utils/get-initial";
import { cn } from "@/lib/utils";

export default function MyLearningPage() {
    const router = useRouter();
    const [enrollments, setEnrollments] = useState<IMyCourseEnrollment[]>([]);
    const [progressMap, setProgressMap] = useState<Map<string, IProgressSummary>>(
        new Map()
    );
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const [enrollmentRes, progressRes] = await Promise.all([
                getMyEnrollments({ page: 1, limit: 100 }),
                getMyCoursesProgress(),
            ]);

            setEnrollments(enrollmentRes.data);

            // Create a map of courseId -> progress for quick lookup
            const map = new Map<string, IProgressSummary>();
            progressRes.data.forEach((p) => {
                map.set(p.courseId, p);
            });
            setProgressMap(map);
        } catch (err: any) {
            console.error("Error loading data:", err);
            setError(err.response?.data?.message || "Failed to load enrolled courses");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="rounded-2xl border bg-card overflow-hidden">
                            <Skeleton className="h-40 w-full" />
                            <div className="p-4 space-y-3">
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                                <Skeleton className="h-2 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={loadData}>Try Again</Button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Learning</h1>
                    <p className="text-muted-foreground mt-1">
                        Continue where you left off or explore new courses
                    </p>
                </div>
                <Link href="/course">
                    <Button>
                        <BookOpen className="mr-2 h-4 w-4" />
                        Browse More Courses
                    </Button>
                </Link>
            </div>

            {/* Enrolled Courses */}
            {enrollments.length === 0 ? (
                <Card className="p-12 text-center">
                    <div className="mx-auto w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                        <GraduationCap className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No Courses Yet</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        You haven&apos;t enrolled in any courses yet. Start your learning
                        journey by exploring our course catalog.
                    </p>
                    <Link href="/course">
                        <Button size="lg">
                            <BookOpen className="mr-2 h-5 w-5" />
                            Explore Courses
                        </Button>
                    </Link>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {enrollments.map((enrollment) => {
                        const progress = progressMap.get(enrollment.course.id);
                        const progressPercent = progress?.progressPercentage || 0;
                        const isCompleted = progress?.isCompleted || false;

                        return (
                            <Card
                                key={enrollment.id}
                                className={cn(
                                    "overflow-hidden transition-all hover:shadow-lg group flex flex-col",
                                    isCompleted && "border-emerald-500/30"
                                )}
                            >
                                {/* Thumbnail */}
                                <div className="relative aspect-video bg-muted overflow-hidden">
                                    {enrollment.course.thumbnail ? (
                                        <Image
                                            src={enrollment.course.thumbnail}
                                            alt={enrollment.course.title}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                                            <GraduationCap className="h-12 w-12 text-primary/30" />
                                        </div>
                                    )}

                                    {/* Progress overlay */}
                                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/20">
                                        <div
                                            className={cn(
                                                "h-full transition-all",
                                                isCompleted ? "bg-emerald-500" : "bg-primary"
                                            )}
                                            style={{ width: `${progressPercent}%` }}
                                        />
                                    </div>

                                    {/* Status Badge */}
                                    <div className="absolute top-3 right-3">
                                        {isCompleted ? (
                                            <Badge className="bg-emerald-500 text-white border-0">
                                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                                Completed
                                            </Badge>
                                        ) : (
                                            <Badge
                                                variant="secondary"
                                                className="bg-background/80 backdrop-blur-sm"
                                            >
                                                {progressPercent}% Complete
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                <CardContent className="flex-1 p-4 space-y-3">
                                    {/* Level Badge */}
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "text-xs",
                                            enrollment.course.level === "BEGINNER" &&
                                            "border-teal-500/50 text-teal-600 dark:text-teal-400",
                                            enrollment.course.level === "INTERMEDIATE" &&
                                            "border-blue-500/50 text-blue-600 dark:text-blue-400",
                                            enrollment.course.level === "ADVANCED" &&
                                            "border-rose-500/50 text-rose-600 dark:text-rose-400"
                                        )}
                                    >
                                        {enrollment.course.level.charAt(0) +
                                            enrollment.course.level.slice(1).toLowerCase()}
                                    </Badge>

                                    {/* Title */}
                                    <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                                        {enrollment.course.title}
                                    </h3>

                                    {/* Instructor */}
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={enrollment.course.instructor?.avatar || ""} />
                                            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                                {getInitials(enrollment.course.instructor?.fullName || "?")}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm text-muted-foreground">
                                            {enrollment.course.instructor?.fullName}
                                        </span>
                                    </div>

                                    {/* Progress Info */}
                                    {progress && (
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <PlayCircle className="h-4 w-4" />
                                                <span>
                                                    {progress.completedLessons}/{progress.totalLessons}{" "}
                                                    lessons
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>

                                <CardFooter className="p-4 pt-0">
                                    <Button
                                        className="w-full"
                                        variant={isCompleted ? "outline" : "default"}
                                        onClick={() =>
                                            router.push(`/dashboard/learning/${enrollment.id}`)
                                        }
                                    >
                                        {isCompleted ? (
                                            <>
                                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                                Review Course
                                            </>
                                        ) : progressPercent > 0 ? (
                                            <>
                                                <PlayCircle className="mr-2 h-4 w-4" />
                                                Continue Learning
                                            </>
                                        ) : (
                                            <>
                                                <PlayCircle className="mr-2 h-4 w-4" />
                                                Start Learning
                                            </>
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
