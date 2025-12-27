"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IconLoader } from "@tabler/icons-react";
import { DateRange } from "react-day-picker";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  GraduationCap,
  PlayCircle,
  Target,
  TrendingUp,
  Trophy,
} from "lucide-react";

import {
  DashboardPeriod,
  FullAdminDashboardResponse,
  getAdminDashboardFull,
} from "@/services/dashboard.service";
import {
  getMyCoursesProgress,
  IProgressSummary,
} from "@/services/progress.service";
import { useAuth } from "@/hooks/use-auth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionCards } from "@/components/dashboard/section-cards";
import { OverviewChart } from "@/components/dashboard/overview-chart";
import { TopStatsTables } from "@/components/dashboard/top-stats-tables";
import { DistributionCharts } from "@/components/dashboard/distribution-charts";
import { SystemDeviceChart } from "@/components/dashboard/system-device-chart";
import { CalendarDateRangePicker } from "@/components/shared/date-range-picker";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { cn } from "@/lib/utils";

// Student Dashboard Component
function StudentDashboard() {
  const router = useRouter();
  const [progress, setProgress] = useState<IProgressSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      setIsLoading(true);
      const response = await getMyCoursesProgress();
      setProgress(response.data);
    } catch (err) {
      console.error("Error loading progress:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate stats
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

  // Get courses in progress (not completed, sorted by progress)
  const coursesInProgress = progress
    .filter((p) => !p.isCompleted)
    .sort((a, b) => b.progressPercentage - a.progressPercentage)
    .slice(0, 3);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back! 👋
          </h1>
          <p className="text-muted-foreground">
            Continue your learning journey
          </p>
        </div>
        <Link href="/course">
          <Button>
            <BookOpen className="mr-2 h-4 w-4" />
            Browse Courses
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
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
              {inProgressCourses} in progress
            </p>
          </CardContent>
        </Card>

        {/* Lessons Completed */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Lessons Done
                </p>
                <p className="text-3xl font-bold mt-1">{completedLessons}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              of {totalLessons} total lessons
            </p>
          </CardContent>
        </Card>

        {/* Courses Completed */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Completed
                </p>
                <p className="text-3xl font-bold mt-1">{completedCourses}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              courses completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Continue Learning Section */}
      {coursesInProgress.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Continue Learning</CardTitle>
            <Link href="/dashboard/my-learning">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {coursesInProgress.map((course) => (
              <div
                key={course.enrollmentId}
                className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer group"
                onClick={() =>
                  router.push(`/dashboard/learning/${course.enrollmentId}`)
                }
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate group-hover:text-primary transition-colors">
                    {course.courseTitle}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress
                      value={course.progressPercentage}
                      className="h-2 flex-1"
                    />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {course.progressPercentage}%
                    </span>
                  </div>
                </div>
                <Button size="sm" className="shrink-0">
                  <PlayCircle className="h-4 w-4 mr-1" />
                  Continue
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {totalCourses === 0 && (
        <Card className="p-12 text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
            <GraduationCap className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Start Your Journey</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            You haven&apos;t enrolled in any courses yet. Explore our catalog
            and start learning today!
          </p>
          <Link href="/course">
            <Button size="lg">
              <BookOpen className="mr-2 h-5 w-5" />
              Browse Courses
            </Button>
          </Link>
        </Card>
      )}

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/dashboard/my-learning">
          <Card className="hover:shadow-md transition-all cursor-pointer group h-full">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold group-hover:text-primary transition-colors">
                  My Learning
                </h3>
                <p className="text-sm text-muted-foreground">
                  View all your enrolled courses
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/my-progress">
          <Card className="hover:shadow-md transition-all cursor-pointer group h-full">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                <Target className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold group-hover:text-primary transition-colors">
                  My Progress
                </h3>
                <p className="text-sm text-muted-foreground">
                  Track your learning progress
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

// Admin/Instructor Dashboard Component
function AdminDashboard() {
  const [data, setData] = useState<FullAdminDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<DashboardPeriod>("30days");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getAdminDashboardFull(period, dateRange);
        setData(response);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period, dateRange]);

  const handlePeriodChange = (val: DashboardPeriod) => {
    setPeriod(val);
    setDateRange(undefined);
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
  };

  if (loading && !data) {
    return <DashboardSkeleton />;
  }

  if (!data) return null;

  return (
    <div className="flex flex-col gap-4 p-4 lg:gap-6 lg:p-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground">
            System performance and growth analytics.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
          <CalendarDateRangePicker
            date={dateRange}
            setDate={handleDateRangeChange}
            className="w-full sm:w-auto"
          />

          <Select
            value={dateRange ? "" : period}
            onValueChange={(val) => handlePeriodChange(val as DashboardPeriod)}
          >
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Quick Filter" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 3 Months</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div
        className={`space-y-4 transition-opacity duration-300 ${loading ? "opacity-60 pointer-events-none" : "opacity-100"
          }`}
      >
        <SectionCards data={data} />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 flex flex-col gap-4">
            <OverviewChart data={data} />
            <SystemDeviceChart data={data} />
          </div>
          <div className="lg:col-span-1">
            <DistributionCharts data={data} />
          </div>
        </div>

        <div className="grid grid-cols-1">
          <TopStatsTables data={data} />
        </div>
      </div>
    </div>
  );
}

// Main Dashboard Page - Role-aware
export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const userRole = user?.role?.name;

  // Show student dashboard for students
  if (userRole === "STUDENT") {
    return <StudentDashboard />;
  }

  // Show admin dashboard for Admin and Instructor
  return <AdminDashboard />;
}