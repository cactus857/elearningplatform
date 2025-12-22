import { API_ENDPOINT } from "@/constants/endpoint";
import api from "@/utils/api";
import type { DateRange } from "react-day-picker"; 
export type DashboardPeriod = 'today' | '7days' | '30days' | '90days' | 'year' | 'all';

export interface DashboardApiParams {
  fromDate?: string; // ISO String
  toDate?: string;   // ISO String
}

function getApiParams(period: DashboardPeriod, customRange?: DateRange): DashboardApiParams {
  
  if (customRange?.from && customRange?.to) {
    return {
      fromDate: customRange.from.toISOString(),
      toDate: customRange.to.toISOString(),
    };
  }

  const now = new Date();
  const from = new Date();
  
  const toDate = now.toISOString();

  switch (period) {
    case 'today':
      from.setHours(0, 0, 0, 0); 
      break;
    case '7days':
      from.setDate(now.getDate() - 7);
      break;
    case '30days':
      from.setDate(now.getDate() - 30);
      break;
    case '90days':
      from.setDate(now.getDate() - 90);
      break;
    case 'year':
      from.setFullYear(now.getFullYear() - 1);
      break;
    case 'all':
      return {}; 
    default:
      from.setDate(now.getDate() - 30);
  }

  return {
    fromDate: from.toISOString(),
    toDate: toDate
  };
}
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

export interface DateRangeResponse {
  from: string;
  to: string;
}

// --- Sub-Interfaces ---

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
  byStatus: { active: number; inactive: number };
  newUsersInRange: number;
  userTrend: TrendPoint[];
  growth: GrowthStats;
  topInstructors: TopInstructor[];
  twoFactorEnabled: number;
  twoFactorPercentage: number;
  dateRange: DateRangeResponse;
}

export interface CourseStatistics {
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  archivedCourses: number;
  byStatus: Array<{ status: string; count: number; percentage: number }>;
  byLevel: Array<{ level: string; count: number; percentage: number }>;
  newCoursesInRange: number;
  courseTrend: TrendPoint[];
  growth: GrowthStats;
  topCoursesByEnrollment: Array<{
    id: string;
    title: string;
    thumbnail: string | null;
    instructorId: string;
    instructorName: string;
    totalEnrollments: number;
    level: string;
  }>;
  totalChapters: number;
  totalLessons: number;
  averageChaptersPerCourse: number;
  averageLessonsPerCourse: number;
  dateRange: DateRangeResponse;
}

export interface EnrollmentStatistics {
  totalEnrollments: number;
  byStatus: { active: number; completed: number; dropped: number };
  newEnrollmentsInRange: number;
  enrollmentTrend: TrendPoint[];
  growth: GrowthStats;
  overallCompletionRate: number;
  averageProgress: number;
  topCoursesByEnrollment: Array<{
    courseId: string;
    courseTitle: string;
    enrollmentCount: number;
  }>;
  activeStudents: number;
  churnedStudents: number;
  dateRange: DateRangeResponse;
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
  newAttemptsInRange: number;
  attemptTrend: TrendPoint[];
  quizzesByCourse: Array<{
    courseId: string;
    courseTitle: string;
    quizCount: number;
    totalAttempts: number;
    averageScore: number;
  }>;
  averageQuestionsPerQuiz: number;
  averageAttemptsPerQuiz: number;
  dateRange: DateRangeResponse;
}

export interface SystemStatistics {
  devices: {
    totalDevices: number;
    activeDevices: number;
    deviceTypes: Array<{ type: string; count: number }>;
  };
  refreshTokensCount: number;
  pendingVerifications: number;
}

export interface AdminOverview {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalQuizAttempts: number;
  newUsersInRange: number;
  newEnrollmentsInRange: number;
  newCoursesInRange: number;
  userGrowth: GrowthStats;
  enrollmentGrowth: GrowthStats;
  courseGrowth: GrowthStats;
  dateRange: DateRangeResponse;
}

// --- Main Full Response ---
export interface FullAdminDashboardResponse {
  overview: AdminOverview;
  users: UserStatistics;
  courses: CourseStatistics;
  enrollments: EnrollmentStatistics;
  quizzes: QuizStatistics;
  system: SystemStatistics;
  generatedAt: string;
}

// 4. API CALLS
/**
 * Get full admin dashboard data
 * Endpoint: /dashboard/admin/full
 */
export const getAdminDashboardFull = async (
  period: DashboardPeriod = '30days',
  customRange?: DateRange 
): Promise<FullAdminDashboardResponse> => {
  
  const params = getApiParams(period, customRange);

  const response = await api.get<FullAdminDashboardResponse>(
    `${API_ENDPOINT.DASHBOARD}/full`,
    { params } 
  );
  return response.data;
};

// --- Các hàm lẻ (Optional usage) ---
export const getAdminDashboardOverview = async (period: DashboardPeriod = '30days', customRange?: DateRange): Promise<AdminOverview> => {
  const params = getApiParams(period, customRange);
  const response = await api.get<AdminOverview>(`${API_ENDPOINT.DASHBOARD}/overview`, { params });
  return response.data;
};

export const getAdminDashboardUsers = async (period: DashboardPeriod = '30days', customRange?: DateRange): Promise<UserStatistics> => {
  const params = getApiParams(period, customRange);
  const response = await api.get<UserStatistics>(`${API_ENDPOINT.DASHBOARD}/users`, { params });
  return response.data;
};

export const getAdminDashboardCourses = async (period: DashboardPeriod = '30days', customRange?: DateRange): Promise<CourseStatistics> => {
  const params = getApiParams(period, customRange);
  const response = await api.get<CourseStatistics>(`${API_ENDPOINT.DASHBOARD}/courses`, { params });
  return response.data;
};

export const getAdminDashboardEnrollments = async (period: DashboardPeriod = '30days', customRange?: DateRange): Promise<EnrollmentStatistics> => {
  const params = getApiParams(period, customRange);
  const response = await api.get<EnrollmentStatistics>(`${API_ENDPOINT.DASHBOARD}/enrollments`, { params });
  return response.data;
};

export const getAdminDashboardQuizzes = async (period: DashboardPeriod = '30days', customRange?: DateRange): Promise<QuizStatistics> => {
  const params = getApiParams(period, customRange);
  const response = await api.get<QuizStatistics>(`${API_ENDPOINT.DASHBOARD}/quizzes`, { params });
  return response.data;
};

export const getAdminDashboardSystem = async (): Promise<SystemStatistics> => {
  const response = await api.get<SystemStatistics>(`${API_ENDPOINT.DASHBOARD}/system`);
  return response.data;
};