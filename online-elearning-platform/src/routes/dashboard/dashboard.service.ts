import { Injectable } from '@nestjs/common'
import { DashboardRepository, DateRange } from './dashboard.repository'
import {
  DashboardQueryType,
  AdminOverviewResType,
  UserStatisticsResType,
  CourseStatisticsResType,
  EnrollmentStatisticsResType,
  QuizStatisticsResType,
  SystemStatisticsResType,
  GrowthStatsType,
  TopInstructorType,
  TopCourseType,
  QuizByCourseType,
} from './dashboard.model'

@Injectable()
export class DashboardService {
  constructor(private dashboardRepository: DashboardRepository) {}

  // =============================================
  // HELPERS
  // =============================================

  private calculateGrowth(current: number, previous: number): GrowthStatsType {
    const growthRate = previous === 0 ? (current > 0 ? 100 : 0) : ((current - previous) / previous) * 100

    return {
      current,
      previous,
      growthRate: Math.round(growthRate * 100) / 100,
      trend: growthRate > 0 ? 'up' : growthRate < 0 ? 'down' : 'stable',
    }
  }

  private getDateRange(query: DashboardQueryType): DateRange {
    const to = query.toDate ? new Date(query.toDate) : new Date()
    to.setHours(23, 59, 59, 999)

    const from = query.fromDate ? new Date(query.fromDate) : new Date(to)
    if (!query.fromDate) {
      from.setDate(from.getDate() - 30) // Default 30 ngày
    }
    from.setHours(0, 0, 0, 0)

    return { from, to }
  }

  private getPreviousDateRange(dateRange: DateRange): DateRange {
    const diffTime = dateRange.to.getTime() - dateRange.from.getTime()

    const previousTo = new Date(dateRange.from)
    previousTo.setMilliseconds(previousTo.getMilliseconds() - 1)

    const previousFrom = new Date(previousTo.getTime() - diffTime)

    return { from: previousFrom, to: previousTo }
  }

  // =============================================
  // ADMIN OVERVIEW
  // =============================================

  async getAdminOverview(query: DashboardQueryType): Promise<AdminOverviewResType> {
    const dateRange = this.getDateRange(query)
    const previousRange = this.getPreviousDateRange(dateRange)

    // Totals (all time)
    const [totalUsers, totalCourses, totalEnrollments, totalQuizAttempts] = await Promise.all([
      this.dashboardRepository.countAllUsers(),
      this.dashboardRepository.countAllCourses(),
      this.dashboardRepository.countAllEnrollments(),
      this.dashboardRepository.countAllQuizAttempts(),
    ])

    // In range
    const [newUsersInRange, newEnrollmentsInRange, newCoursesInRange] = await Promise.all([
      this.dashboardRepository.countUsers(dateRange),
      this.dashboardRepository.countEnrollments(dateRange),
      this.dashboardRepository.countCourses({ dateRange }),
    ])

    // Previous range (for growth)
    const [usersPrevious, enrollmentsPrevious, coursesPrevious] = await Promise.all([
      this.dashboardRepository.countUsers(previousRange),
      this.dashboardRepository.countEnrollments(previousRange),
      this.dashboardRepository.countCourses({ dateRange: previousRange }),
    ])

    return {
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalQuizAttempts,
      newUsersInRange,
      newEnrollmentsInRange,
      newCoursesInRange,
      userGrowth: this.calculateGrowth(newUsersInRange, usersPrevious),
      enrollmentGrowth: this.calculateGrowth(newEnrollmentsInRange, enrollmentsPrevious),
      courseGrowth: this.calculateGrowth(newCoursesInRange, coursesPrevious),
      dateRange: {
        from: dateRange.from,
        to: dateRange.to,
      },
    }
  }

  // =============================================
  // USER STATISTICS
  // =============================================

  async getUserStatistics(query: DashboardQueryType): Promise<UserStatisticsResType> {
    const dateRange = this.getDateRange(query)
    const previousRange = this.getPreviousDateRange(dateRange)

    const totalUsers = await this.dashboardRepository.countAllUsers()

    // By role
    const usersWithRoles = await this.dashboardRepository.getUsersWithRoles()
    const roleCount: Record<string, number> = {}
    usersWithRoles.forEach((user) => {
      const roleName = user.role?.name || 'Unknown'
      roleCount[roleName] = (roleCount[roleName] || 0) + 1
    })

    const byRole = Object.entries(roleCount).map(([role, count]) => ({
      role,
      count,
      percentage: totalUsers > 0 ? Math.round((count / totalUsers) * 10000) / 100 : 0,
    }))

    // By status
    const [activeUsers, twoFactorUsers] = await Promise.all([
      this.dashboardRepository.countUsersByStatus('ACTIVE'),
      this.dashboardRepository.countTwoFactorUsers(),
    ])

    // In range
    const newUsersInRange = await this.dashboardRepository.countUsers(dateRange)

    // Previous range (for growth)
    const usersPrevious = await this.dashboardRepository.countUsers(previousRange)

    // Top instructors
    const instructorRole = await this.dashboardRepository.getRoleByName('INSTRUCTOR')
    let topInstructors: TopInstructorType[] = []

    if (instructorRole) {
      const instructors = await this.dashboardRepository.getInstructorsWithCourses(instructorRole.id)
      topInstructors = instructors
        .map((instructor) => ({
          id: instructor.id,
          fullName: instructor.fullName,
          email: instructor.email,
          avatar: instructor.avatar,
          totalCourses: instructor.coursesAsInstructor.length,
          totalStudents: instructor.coursesAsInstructor.reduce((sum, course) => sum + course.enrollments.length, 0),
        }))
        .sort((a, b) => b.totalStudents - a.totalStudents)
        .slice(0, 5)
    }

    // Trend
    const userTrend = await this.dashboardRepository.getUserTrend(dateRange)

    return {
      totalUsers,
      byRole,
      byStatus: {
        active: activeUsers,
        inactive: totalUsers - activeUsers,
      },
      newUsersInRange,
      userTrend,
      growth: this.calculateGrowth(newUsersInRange, usersPrevious),
      topInstructors,
      twoFactorEnabled: twoFactorUsers,
      twoFactorPercentage: totalUsers > 0 ? Math.round((twoFactorUsers / totalUsers) * 10000) / 100 : 0,
      dateRange: {
        from: dateRange.from,
        to: dateRange.to,
      },
    }
  }

  // =============================================
  // COURSE STATISTICS
  // =============================================

  async getCourseStatistics(query: DashboardQueryType): Promise<CourseStatisticsResType> {
    const dateRange = this.getDateRange(query)
    const previousRange = this.getPreviousDateRange(dateRange)

    const totalCourses = await this.dashboardRepository.countAllCourses()

    // By status
    const [publishedCourses, draftCourses, archivedCourses] = await Promise.all([
      this.dashboardRepository.countCourses({ status: 'PUBLISHED' }),
      this.dashboardRepository.countCourses({ status: 'DRAFT' }),
      this.dashboardRepository.countCourses({ status: 'ARCHIVED' }),
    ])

    const byStatus = [
      { status: 'PUBLISHED', count: publishedCourses, percentage: totalCourses > 0 ? (publishedCourses / totalCourses) * 100 : 0 },
      { status: 'DRAFT', count: draftCourses, percentage: totalCourses > 0 ? (draftCourses / totalCourses) * 100 : 0 },
      { status: 'ARCHIVED', count: archivedCourses, percentage: totalCourses > 0 ? (archivedCourses / totalCourses) * 100 : 0 },
    ]

    // By level
    const [beginnerCourses, intermediateCourses, advancedCourses] = await Promise.all([
      this.dashboardRepository.countCourses({ level: 'BEGINNER' }),
      this.dashboardRepository.countCourses({ level: 'INTERMEDIATE' }),
      this.dashboardRepository.countCourses({ level: 'ADVANCED' }),
    ])

    const byLevel = [
      { level: 'BEGINNER', count: beginnerCourses, percentage: totalCourses > 0 ? (beginnerCourses / totalCourses) * 100 : 0 },
      { level: 'INTERMEDIATE', count: intermediateCourses, percentage: totalCourses > 0 ? (intermediateCourses / totalCourses) * 100 : 0 },
      { level: 'ADVANCED', count: advancedCourses, percentage: totalCourses > 0 ? (advancedCourses / totalCourses) * 100 : 0 },
    ]

    // In range
    const newCoursesInRange = await this.dashboardRepository.countCourses({ dateRange })

    // Previous range (for growth)
    const coursesPrevious = await this.dashboardRepository.countCourses({ dateRange: previousRange })

    // Top courses by enrollment
    const coursesWithEnrollments = await this.dashboardRepository.getCoursesWithEnrollments()
    const topCoursesByEnrollment: TopCourseType[] = coursesWithEnrollments
      .map((course) => ({
        id: course.id,
        title: course.title,
        thumbnail: course.thumbnail,
        instructorId: course.instructor?.id || '',
        instructorName: course.instructor?.fullName || 'Unknown',
        totalEnrollments: course.enrollments.length,
        level: course.level,
      }))
      .sort((a, b) => b.totalEnrollments - a.totalEnrollments)
      .slice(0, 10)

    // Content stats
    const [totalChapters, totalLessons] = await Promise.all([
      this.dashboardRepository.countChapters(),
      this.dashboardRepository.countLessons(),
    ])

    // Trend
    const courseTrend = await this.dashboardRepository.getCourseTrend(dateRange)

    return {
      totalCourses,
      publishedCourses,
      draftCourses,
      archivedCourses,
      byStatus,
      byLevel,
      newCoursesInRange,
      courseTrend,
      growth: this.calculateGrowth(newCoursesInRange, coursesPrevious),
      topCoursesByEnrollment,
      totalChapters,
      totalLessons,
      averageChaptersPerCourse: totalCourses > 0 ? Math.round((totalChapters / totalCourses) * 100) / 100 : 0,
      averageLessonsPerCourse: totalCourses > 0 ? Math.round((totalLessons / totalCourses) * 100) / 100 : 0,
      dateRange: {
        from: dateRange.from,
        to: dateRange.to,
      },
    }
  }

  // =============================================
  // ENROLLMENT STATISTICS
  // =============================================

  async getEnrollmentStatistics(query: DashboardQueryType): Promise<EnrollmentStatisticsResType> {
    const dateRange = this.getDateRange(query)
    const previousRange = this.getPreviousDateRange(dateRange)

    const totalEnrollments = await this.dashboardRepository.countAllEnrollments()

    // By status
    const [active, completed, dropped] = await Promise.all([
      this.dashboardRepository.countEnrollmentsByStatus('ACTIVE'),
      this.dashboardRepository.countEnrollmentsByStatus('COMPLETED'),
      this.dashboardRepository.countEnrollmentsByStatus('DROPPED'),
    ])

    // In range
    const newEnrollmentsInRange = await this.dashboardRepository.countEnrollments(dateRange)

    // Previous range (for growth)
    const enrollmentsPrevious = await this.dashboardRepository.countEnrollments(previousRange)

    // Completion rate & average progress
    const overallCompletionRate = totalEnrollments > 0 ? Math.round((completed / totalEnrollments) * 10000) / 100 : 0

    const enrollments = await this.dashboardRepository.getAllEnrollments()
    const avgProgress = enrollments.length > 0 ? enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length : 0

    // Top courses by enrollment
    const coursesWithEnrollments = await this.dashboardRepository.getCoursesWithEnrollmentCount()
    const topCoursesByEnrollment = coursesWithEnrollments
      .map((course) => ({
        courseId: course.id,
        courseTitle: course.title,
        enrollmentCount: course.enrollments.length,
      }))
      .sort((a, b) => b.enrollmentCount - a.enrollmentCount)
      .slice(0, 10)

    // Active & churned students
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const [activeStudentIds, allStudentIds] = await Promise.all([
      this.dashboardRepository.getActiveStudentIds(weekAgo),
      this.dashboardRepository.getAllStudentIds(),
    ])

    const activeSet = new Set(activeStudentIds.map((s) => s.studentId))
    const churnedStudents = allStudentIds.filter((s) => !activeSet.has(s.studentId)).length

    // Trend
    const enrollmentTrend = await this.dashboardRepository.getEnrollmentTrend(dateRange)

    return {
      totalEnrollments,
      byStatus: { active, completed, dropped },
      newEnrollmentsInRange,
      enrollmentTrend,
      growth: this.calculateGrowth(newEnrollmentsInRange, enrollmentsPrevious),
      overallCompletionRate,
      averageProgress: Math.round(avgProgress * 100) / 100,
      topCoursesByEnrollment,
      activeStudents: activeStudentIds.length,
      churnedStudents,
      dateRange: {
        from: dateRange.from,
        to: dateRange.to,
      },
    }
  }

  // =============================================
  // QUIZ STATISTICS
  // =============================================

  async getQuizStatistics(query: DashboardQueryType): Promise<QuizStatisticsResType> {
    const dateRange = this.getDateRange(query)

    const [totalQuizzes, totalQuestions, totalAttempts] = await Promise.all([
      this.dashboardRepository.countQuizzes(),
      this.dashboardRepository.countQuestions(),
      this.dashboardRepository.countAllQuizAttempts(),
    ])

    // Performance
    const attempts = await this.dashboardRepository.getAllQuizAttempts()
    const passedAttempts = attempts.filter((a) => a.isPassed).length
    const totalScore = attempts.reduce((sum, a) => sum + a.score, 0)
    const averageScore = attempts.length > 0 ? Math.round((totalScore / attempts.length) * 100) / 100 : 0

    // In range
    const newAttemptsInRange = await this.dashboardRepository.countQuizAttempts(dateRange)

    // By course
    const quizzesWithAttempts = await this.dashboardRepository.getQuizzesWithAttempts()
    const courseQuizMap = new Map<
      string,
      { courseId: string; courseTitle: string; quizCount: number; totalAttempts: number; totalScore: number }
    >()

    quizzesWithAttempts.forEach((quiz) => {
      const courseId = quiz.courseId
      const existing = courseQuizMap.get(courseId)

      if (existing) {
        existing.quizCount++
        existing.totalAttempts += quiz.attempts.length
        existing.totalScore += quiz.attempts.reduce((sum, a) => sum + a.score, 0)
      } else {
        courseQuizMap.set(courseId, {
          courseId,
          courseTitle: quiz.course?.title || 'Unknown',
          quizCount: 1,
          totalAttempts: quiz.attempts.length,
          totalScore: quiz.attempts.reduce((sum, a) => sum + a.score, 0),
        })
      }
    })

    const quizzesByCourse: QuizByCourseType[] = Array.from(courseQuizMap.values())
      .map((c) => ({
        courseId: c.courseId,
        courseTitle: c.courseTitle,
        quizCount: c.quizCount,
        totalAttempts: c.totalAttempts,
        averageScore: c.totalAttempts > 0 ? Math.round((c.totalScore / c.totalAttempts) * 100) / 100 : 0,
      }))
      .sort((a, b) => b.totalAttempts - a.totalAttempts)
      .slice(0, 10)

    // Trend
    const attemptTrend = await this.dashboardRepository.getQuizAttemptTrend(dateRange)

    return {
      totalQuizzes,
      totalQuestions,
      totalAttempts,
      performance: {
        totalAttempts,
        passedAttempts,
        failedAttempts: totalAttempts - passedAttempts,
        passRate: totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 10000) / 100 : 0,
        averageScore,
      },
      newAttemptsInRange,
      attemptTrend,
      quizzesByCourse,
      averageQuestionsPerQuiz: totalQuizzes > 0 ? Math.round((totalQuestions / totalQuizzes) * 100) / 100 : 0,
      averageAttemptsPerQuiz: totalQuizzes > 0 ? Math.round((totalAttempts / totalQuizzes) * 100) / 100 : 0,
      dateRange: {
        from: dateRange.from,
        to: dateRange.to,
      },
    }
  }

  // =============================================
  // SYSTEM STATISTICS
  // =============================================

  async getSystemStatistics(): Promise<SystemStatisticsResType> {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const [totalDevices, activeDevices, refreshTokensCount, pendingVerifications] = await Promise.all([
      this.dashboardRepository.countDevices(),
      this.dashboardRepository.countActiveDevices(yesterday),
      this.dashboardRepository.countActiveRefreshTokens(),
      this.dashboardRepository.countPendingVerifications(),
    ])

    // Device types
    const devices = await this.dashboardRepository.getAllDevices()
    const deviceTypeCount: Record<string, number> = {
      Desktop: 0,
      Mobile: 0,
      Tablet: 0,
      Other: 0,
    }

    devices.forEach((d) => {
      const ua = d.userAgent?.toLowerCase() || ''
      if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
        deviceTypeCount.Mobile++
      } else if (ua.includes('tablet') || ua.includes('ipad')) {
        deviceTypeCount.Tablet++
      } else if (ua.includes('windows') || ua.includes('macintosh') || ua.includes('linux')) {
        deviceTypeCount.Desktop++
      } else {
        deviceTypeCount.Other++
      }
    })

    return {
      devices: {
        totalDevices,
        activeDevices,
        deviceTypes: Object.entries(deviceTypeCount).map(([type, count]) => ({ type, count })),
      },
      refreshTokensCount,
      pendingVerifications,
    }
  }
}