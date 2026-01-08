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
import { Pie, PieChart } from "recharts";

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
import { getAllCoursesBaseRole } from "@/services/course.service";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

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

  // Pie chart data for student
  const studentPieData = [
    { name: "In Progress", value: inProgressCourses, fill: "#3b82f6" },
    { name: "Completed", value: completedCourses, fill: "#10b981" },
  ].filter(d => d.value > 0);

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

      {/* Charts Section */}
      {totalCourses > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Course Status</CardTitle>
              <p className="text-sm text-muted-foreground">Your enrolled courses</p>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  inProgress: { label: "In Progress", color: "#3b82f6" },
                  completed: { label: "Completed", color: "#10b981" },
                }}
                className="mx-auto aspect-square max-h-[250px]"
              >
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={studentPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    label={({ name, value }) => `${name}: ${value}`}
                  />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Progress by Course</CardTitle>
              <p className="text-sm text-muted-foreground">Your learning progress</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {progress.slice(0, 4).map((p) => (
                <div key={p.enrollmentId} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate max-w-[200px]">{p.courseTitle}</span>
                    <span className="text-muted-foreground">{p.progressPercentage}%</span>
                  </div>
                  <Progress value={p.progressPercentage} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Instructor Dashboard Component
function InstructorDashboard() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<string>("30days");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getAllCoursesBaseRole(1, 100);
        setCourses(response.data || []);
      } catch (error) {
        console.error("Failed to fetch courses", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter courses based on period or date range
  const filterByPeriod = (items: any[]) => {
    if (dateRange?.from) {
      const startDate = dateRange.from;
      const endDate = dateRange.to || new Date();
      return items.filter((item) => {
        const itemDate = new Date(item.createdAt);
        return itemDate >= startDate && itemDate <= endDate;
      });
    }
    if (period === "all") return items;
    const now = new Date();
    let startDate: Date;
    switch (period) {
      case "today":
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case "7days":
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30days":
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90days":
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "year":
        startDate = new Date(new Date().getFullYear(), 0, 1);
        break;
      default:
        return items;
    }
    return items.filter((item) => new Date(item.createdAt) >= startDate);
  };

  const filteredCourses = filterByPeriod(courses);
  const totalCourses = courses.length;
  const publishedCourses = courses.filter((c) => c.status === "PUBLISHED").length;
  const draftCourses = courses.filter((c) => c.status === "DRAFT").length;
  const totalStudents = courses.reduce((sum, c) => sum + (c._count?.enrollments || 0), 0);

  // Pie chart data for instructor
  const instructorPieData = [
    { name: "Published", value: publishedCourses, fill: "#10b981" },
    { name: "Draft", value: draftCourses, fill: "#f59e0b" },
  ].filter(d => d.value > 0);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex flex-col gap-4 p-4 lg:gap-6 lg:p-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Instructor Dashboard</h1>
          <p className="text-muted-foreground">Manage your courses and track student engagement.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
          <CalendarDateRangePicker
            date={dateRange}
            setDate={(range) => {
              setDateRange(range);
              if (range) setPeriod("");
            }}
            className="w-full sm:w-auto"
          />
          <Select
            value={dateRange ? "" : period}
            onValueChange={(val) => {
              setPeriod(val);
              setDateRange(undefined);
            }}
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

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCourses}</div>
            <p className="text-xs text-muted-foreground">Your created courses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
            <GraduationCap className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">Enrolled in your courses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Published</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{publishedCourses}</div>
            <p className="text-xs text-muted-foreground">Live and available</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Drafts</CardTitle>
            <Target className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{draftCourses}</div>
            <p className="text-xs text-muted-foreground">Work in progress</p>
          </CardContent>
        </Card>
        <Link href="/dashboard/quizzes">
          <Card className="hover:shadow-md transition-all cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Quizzes</CardTitle>
              <Trophy className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">→</div>
              <p className="text-xs text-muted-foreground">View all quizzes</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Charts Section */}
      {filteredCourses.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Course Status</CardTitle>
              <p className="text-sm text-muted-foreground">Distribution of your courses by status</p>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  published: { label: "Published", color: "#10b981" },
                  draft: { label: "Draft", color: "#f59e0b" },
                }}
                className="mx-auto aspect-square max-h-[250px]"
              >
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={instructorPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    label={({ name, value }) => `${name}: ${value}`}
                  />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Enrollments by Course</CardTitle>
              <p className="text-sm text-muted-foreground">Student enrollments per course</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredCourses.slice(0, 4).map((c) => (
                <div key={c.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate max-w-[200px]">{c.title}</span>
                    <span className="text-muted-foreground">{c._count?.enrollments || 0} students</span>
                  </div>
                  <Progress value={Math.min((c._count?.enrollments || 0) * 10, 100)} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Courses */}
      {filteredCourses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Courses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredCourses.slice(0, 5).map((course) => (
              <Link key={course.id} href={`/dashboard/courses/${course.id}`} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors group">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate group-hover:text-primary transition-colors">{course.title}</h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium", course.status === "PUBLISHED" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400")}>{course.status}</span>
                    <span>{course.level}</span>
                  </div>
                </div>
              </Link>
            ))}
            {filteredCourses.length > 5 && (
              <Link href="/dashboard/courses">
                <Button variant="outline" className="w-full">View all {filteredCourses.length} courses</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Admin Dashboard Component
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

  // Show instructor dashboard for instructors
  if (userRole === "INSTRUCTOR") {
    return <InstructorDashboard />;
  }

  // Show admin dashboard for Admin
  return <AdminDashboard />;
}