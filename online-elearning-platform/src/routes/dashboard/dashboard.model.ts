import z from 'zod'

// =============================================
// COMMON SCHEMAS
// =============================================

export const TrendPointSchema = z.object({
  date: z.string(),
  count: z.number(),
})

export const GrowthStatsSchema = z.object({
  current: z.number(),
  previous: z.number(),
  growthRate: z.number(),
  trend: z.enum(['up', 'down', 'stable']),
})

// =============================================
// QUERY SCHEMAS
// =============================================

export const DashboardQuerySchema = z
  .object({
    period: z.enum(['today', '7days', '30days', '90days', 'year', 'all']).optional().default('30days'),
  })
  .strict()

// =============================================
// ADMIN OVERVIEW
// =============================================

export const AdminOverviewResSchema = z.object({
  totalUsers: z.number(),
  totalCourses: z.number(),
  totalEnrollments: z.number(),
  totalQuizAttempts: z.number(),
  newUsersToday: z.number(),
  newEnrollmentsToday: z.number(),
  newCoursesToday: z.number(),
  userGrowth: GrowthStatsSchema,
  enrollmentGrowth: GrowthStatsSchema,
  courseGrowth: GrowthStatsSchema,
})

// =============================================
// USER STATISTICS
// =============================================

export const UserByRoleSchema = z.object({
  role: z.string(),
  count: z.number(),
  percentage: z.number(),
})

export const UserStatusStatsSchema = z.object({
  active: z.number(),
  inactive: z.number(),
})

export const TopInstructorSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.string(),
  avatar: z.string().nullable(),
  totalCourses: z.number(),
  totalStudents: z.number(),
})

export const UserStatisticsResSchema = z.object({
  totalUsers: z.number(),
  byRole: z.array(UserByRoleSchema),
  byStatus: UserStatusStatsSchema,
  newUsersToday: z.number(),
  newUsersThisWeek: z.number(),
  newUsersThisMonth: z.number(),
  userTrend: z.array(TrendPointSchema),
  growth: GrowthStatsSchema,
  topInstructors: z.array(TopInstructorSchema),
  twoFactorEnabled: z.number(),
  twoFactorPercentage: z.number(),
})

// =============================================
// COURSE STATISTICS
// =============================================

export const CourseByStatusSchema = z.object({
  status: z.string(),
  count: z.number(),
  percentage: z.number(),
})

export const CourseByLevelSchema = z.object({
  level: z.string(),
  count: z.number(),
  percentage: z.number(),
})

export const TopCourseSchema = z.object({
  id: z.string(),
  title: z.string(),
  thumbnail: z.string().nullable(),
  instructorId: z.string(),
  instructorName: z.string(),
  totalEnrollments: z.number(),
  level: z.string(),
})

export const CourseStatisticsResSchema = z.object({
  totalCourses: z.number(),
  publishedCourses: z.number(),
  draftCourses: z.number(),
  archivedCourses: z.number(),
  byStatus: z.array(CourseByStatusSchema),
  byLevel: z.array(CourseByLevelSchema),
  newCoursesToday: z.number(),
  newCoursesThisWeek: z.number(),
  newCoursesThisMonth: z.number(),
  courseTrend: z.array(TrendPointSchema),
  growth: GrowthStatsSchema,
  topCoursesByEnrollment: z.array(TopCourseSchema),
  totalChapters: z.number(),
  totalLessons: z.number(),
  averageChaptersPerCourse: z.number(),
  averageLessonsPerCourse: z.number(),
})

// =============================================
// ENROLLMENT STATISTICS
// =============================================

export const EnrollmentStatusStatsSchema = z.object({
  active: z.number(),
  completed: z.number(),
  dropped: z.number(),
})

export const EnrollmentByCourseSchema = z.object({
  courseId: z.string(),
  courseTitle: z.string(),
  enrollmentCount: z.number(),
})

export const EnrollmentStatisticsResSchema = z.object({
  totalEnrollments: z.number(),
  byStatus: EnrollmentStatusStatsSchema,
  newEnrollmentsToday: z.number(),
  newEnrollmentsThisWeek: z.number(),
  newEnrollmentsThisMonth: z.number(),
  enrollmentTrend: z.array(TrendPointSchema),
  growth: GrowthStatsSchema,
  overallCompletionRate: z.number(),
  averageProgress: z.number(),
  topCoursesByEnrollment: z.array(EnrollmentByCourseSchema),
  activeStudents: z.number(),
  churnedStudents: z.number(),
})

// =============================================
// QUIZ STATISTICS
// =============================================

export const QuizPerformanceSchema = z.object({
  totalAttempts: z.number(),
  passedAttempts: z.number(),
  failedAttempts: z.number(),
  passRate: z.number(),
  averageScore: z.number(),
})

export const QuizByCourseSchema = z.object({
  courseId: z.string(),
  courseTitle: z.string(),
  quizCount: z.number(),
  totalAttempts: z.number(),
  averageScore: z.number(),
})

export const QuizStatisticsResSchema = z.object({
  totalQuizzes: z.number(),
  totalQuestions: z.number(),
  totalAttempts: z.number(),
  performance: QuizPerformanceSchema,
  newAttemptsToday: z.number(),
  newAttemptsThisWeek: z.number(),
  newAttemptsThisMonth: z.number(),
  attemptTrend: z.array(TrendPointSchema),
  quizzesByCourse: z.array(QuizByCourseSchema),
  averageQuestionsPerQuiz: z.number(),
  averageAttemptsPerQuiz: z.number(),
})

// =============================================
// SYSTEM STATISTICS
// =============================================

export const DeviceTypeSchema = z.object({
  type: z.string(),
  count: z.number(),
})

export const DeviceStatsSchema = z.object({
  totalDevices: z.number(),
  activeDevices: z.number(),
  deviceTypes: z.array(DeviceTypeSchema),
})

export const SystemStatisticsResSchema = z.object({
  devices: DeviceStatsSchema,
  refreshTokensCount: z.number(),
  pendingVerifications: z.number(),
})

// =============================================
// FULL DASHBOARD
// =============================================

export const FullAdminDashboardResSchema = z.object({
  overview: AdminOverviewResSchema,
  users: UserStatisticsResSchema,
  courses: CourseStatisticsResSchema,
  enrollments: EnrollmentStatisticsResSchema,
  quizzes: QuizStatisticsResSchema,
  system: SystemStatisticsResSchema,
  generatedAt: z.date(),
})

// =============================================
// TYPES
// =============================================

export type TrendPointType = z.infer<typeof TrendPointSchema>
export type GrowthStatsType = z.infer<typeof GrowthStatsSchema>
export type DashboardQueryType = z.infer<typeof DashboardQuerySchema>
export type AdminOverviewResType = z.infer<typeof AdminOverviewResSchema>
export type UserStatisticsResType = z.infer<typeof UserStatisticsResSchema>
export type CourseStatisticsResType = z.infer<typeof CourseStatisticsResSchema>
export type EnrollmentStatisticsResType = z.infer<typeof EnrollmentStatisticsResSchema>
export type QuizStatisticsResType = z.infer<typeof QuizStatisticsResSchema>
export type SystemStatisticsResType = z.infer<typeof SystemStatisticsResSchema>
export type FullAdminDashboardResType = z.infer<typeof FullAdminDashboardResSchema>
export type TopInstructorType = z.infer<typeof TopInstructorSchema>
export type TopCourseType = z.infer<typeof TopCourseSchema>
export type EnrollmentByCourseType = z.infer<typeof EnrollmentByCourseSchema>
export type QuizByCourseType = z.infer<typeof QuizByCourseSchema>