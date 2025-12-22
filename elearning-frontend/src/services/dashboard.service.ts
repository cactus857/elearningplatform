import { API_ENDPOINT } from "@/constants/endpoint";
import api from "@/utils/api";

// ENUMS & TYPES

export type DashboardPeriod = 'today' | '7days' | '30days' | '90days' | 'year' | 'all';

export type GrowthTrend = 'up' | 'down' | 'stable';

export interface TrendPoint {
  date: string;
  count: number;
}

export interface GrowthStats {
  current: number;
  previous: number;
  growthRate: number;
  trend: GrowthTrend;
}



// --- User Stats ---
export interface UserByRole {
  role: string;
  count: number;
  percentage: number;
}

export interface TopInstructor {
  id: string;
  fullName: string;
  email: string;
  avatar: string | null;
  totalCourses: number;
  totalStudents: number;
}

export interface UserStatistics {
  totalUsers: number;
  byRole: UserByRole[];
  byStatus: {
    active: number;
    inactive: number;
  };
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  userTrend: TrendPoint[];
  growth: GrowthStats;
  topInstructors: TopInstructor[];
  twoFactorEnabled: number;
  twoFactorPercentage: number;
}

// --- Course Stats ---
export interface CourseByStatus {
  status: string;
  count: number;
  percentage: number;
}

export interface CourseByLevel {
  level: string;
  count: number;
  percentage: number;
}

export interface TopCourse {
  id: string;
  title: string;
  thumbnail: string | null;
  instructorId: string;
  instructorName: string;
  totalEnrollments: number;
  level: string;
}

export interface CourseStatistics {
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  archivedCourses: number;
  byStatus: CourseByStatus[];
  byLevel: CourseByLevel[];
  newCoursesToday: number;
  newCoursesThisWeek: number;
  newCoursesThisMonth: number;
  courseTrend: TrendPoint[];
  growth: GrowthStats;
  topCoursesByEnrollment: TopCourse[];
  totalChapters: number;
  totalLessons: number;
  averageChaptersPerCourse: number;
  averageLessonsPerCourse: number;
}

// --- Enrollment Stats ---
export interface EnrollmentByCourse {
  courseId: string;
  courseTitle: string;
  enrollmentCount: string; // Note: Backend sometimes returns numbers as strings in agg queries, check actual response
}

export interface EnrollmentStatistics {
  totalEnrollments: number;
  byStatus: {
    active: number;
    completed: number;
    dropped: number;
  };
  newEnrollmentsToday: number;
  newEnrollmentsThisWeek: number;
  newEnrollmentsThisMonth: number;
  enrollmentTrend: TrendPoint[];
  growth: GrowthStats;
  overallCompletionRate: number;
  averageProgress: number;
  topCoursesByEnrollment: {
    courseId: string;
    courseTitle: string;
    enrollmentCount: number;
  }[];
  activeStudents: number;
  churnedStudents: number;
}

// --- Quiz Stats ---
export interface QuizByCourse {
  courseId: string;
  courseTitle: string;
  quizCount: number;
  totalAttempts: number;
  averageScore: number;
}

export interface QuizStatistics {
  totalQuizzes: number;
  totalQuestions: number;
  totalAttempts: number;
  performance: {
    totalAttempts: number;
    passedAttempts: number;
    failedAttempts: number;
    passRate: number;
    averageScore: number;
  };
  newAttemptsToday: number;
  newAttemptsThisWeek: number;
  newAttemptsThisMonth: number;
  attemptTrend: TrendPoint[];
  quizzesByCourse: QuizByCourse[];
  averageQuestionsPerQuiz: number;
  averageAttemptsPerQuiz: number;
}

// --- System Stats ---
export interface DeviceType {
  type: string;
  count: number;
}

export interface SystemStatistics {
  devices: {
    totalDevices: number;
    activeDevices: number;
    deviceTypes: DeviceType[];
  };
  refreshTokensCount: number;
  pendingVerifications: number;
}

// --- Overview (Summary) ---
export interface AdminOverview {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalQuizAttempts: number;
  newUsersToday: number;
  newEnrollmentsToday: number;
  newCoursesToday: number;
  userGrowth: GrowthStats;
  enrollmentGrowth: GrowthStats;
  courseGrowth: GrowthStats;
}

// MAIN RESPONSE INTERFACE

export interface FullAdminDashboardResponse {
  overview: AdminOverview;
  users: UserStatistics;
  courses: CourseStatistics;
  enrollments: EnrollmentStatistics;
  quizzes: QuizStatistics;
  system: SystemStatistics;
  generatedAt: string; // ISO String
}

// API CALLS

/**
 * Get full admin dashboard data
 * Endpoint: /dashboard/admin/full
 */
export const getAdminDashboardFull = async (
  period: DashboardPeriod = '30days'
): Promise<FullAdminDashboardResponse> => {
  const response = await api.get<FullAdminDashboardResponse>(
    `${API_ENDPOINT.DASHBOARD}/full`,
    { params: { period } }
  );
  return response.data;
};

/**
 * Get only overview stats (lighter payload)
 * Endpoint: /dashboard/admin/overview
 */
export const getAdminDashboardOverview = async (
  period: DashboardPeriod = '30days'
): Promise<AdminOverview> => {
  const response = await api.get<AdminOverview>(
    `${API_ENDPOINT.DASHBOARD}/overview`,
    { params: { period } }
  );
  return response.data;
};

/**
 * Get only user statistics
 * Endpoint: /dashboard/admin/users
 */
export const getAdminDashboardUsers = async (
  period: DashboardPeriod = '30days'
): Promise<UserStatistics> => {
  const response = await api.get<UserStatistics>(
    `${API_ENDPOINT.DASHBOARD}/users`,
    { params: { period } }
  );
  return response.data;
};

/**
 * Get only course statistics
 * Endpoint: /dashboard/admin/courses
 */
export const getAdminDashboardCourses = async (
  period: DashboardPeriod = '30days'
): Promise<CourseStatistics> => {
  const response = await api.get<CourseStatistics>(
    `${API_ENDPOINT.DASHBOARD}/courses`,
    { params: { period } }
  );
  return response.data;
};

/**
 * Get only enrollment statistics
 * Endpoint: /dashboard/admin/enrollments
 */
export const getAdminDashboardEnrollments = async (
  period: DashboardPeriod = '30days'
): Promise<EnrollmentStatistics> => {
  const response = await api.get<EnrollmentStatistics>(
    `${API_ENDPOINT.DASHBOARD}/enrollments`,
    { params: { period } }
  );
  return response.data;
};

/**
 * Get only quiz statistics
 * Endpoint: /dashboard/admin/quizzes
 */
export const getAdminDashboardQuizzes = async (
  period: DashboardPeriod = '30days'
): Promise<QuizStatistics> => {
  const response = await api.get<QuizStatistics>(
    `${API_ENDPOINT.DASHBOARD}/quizzes`,
    { params: { period } }
  );
  return response.data;
};

/**
 * Get system statistics
 * Endpoint: /dashboard/admin/system
 */
export const getAdminDashboardSystem = async (): Promise<SystemStatistics> => {
  const response = await api.get<SystemStatistics>(
    `${API_ENDPOINT.DASHBOARD}/system`
  );
  return response.data;
};