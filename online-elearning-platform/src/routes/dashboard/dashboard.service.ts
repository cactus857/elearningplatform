import { Injectable } from '@nestjs/common'
import { DashboardRepository } from './dashboard.repository'
import {
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

  // HELPERS
  private calculateGrowth(current: number, previous: number): GrowthStatsType {
    const growthRate = previous === 0 ? (current > 0 ? 100 : 0) : ((current - previous) / previous) * 100

    return {
      current,
      previous,
      growthRate: Math.round(growthRate * 100) / 100,
      trend: growthRate > 0 ? 'up' : growthRate < 0 ? 'down' : 'stable',
    }
  }

  private getDateRanges() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)

    const twoWeeksAgo = new Date(today)
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

    const monthAgo = new Date(today)
    monthAgo.setMonth(monthAgo.getMonth() - 1)

    return { today, weekAgo, twoWeeksAgo, monthAgo }
  }

  // ADMIN OVERVIEW
  async getAdminOverview(): Promise<AdminOverviewResType> {
    const { today, weekAgo, twoWeeksAgo } = this.getDateRanges()

    const [totalUsers, totalCourses, totalEnrollments, totalQuizAttempts] = await Promise.all([
      this.dashboardRepository.countUsers(),
      this.dashboardRepository.countCourses(),
      this.dashboardRepository.countEnrollments(),
      this.dashboardRepository.countQuizAttempts(),
    ])

    const [newUsersToday, newEnrollmentsToday, newCoursesToday] = await Promise.all([
      this.dashboardRepository.countUsers({ createdAt: { gte: today } }),
      this.dashboardRepository.countEnrollments({ enrolledAt: { gte: today } }),
      this.dashboardRepository.countCourses({ createdAt: { gte: today } }),
    ])

    const [usersThisWeek, usersLastWeek, enrollmentsThisWeek, enrollmentsLastWeek, coursesThisWeek, coursesLastWeek] =
      await Promise.all([
        this.dashboardRepository.countUsers({ createdAt: { gte: weekAgo } }),
        this.dashboardRepository.countUsers({ createdAt: { gte: twoWeeksAgo, lt: weekAgo } }),
        this.dashboardRepository.countEnrollments({ enrolledAt: { gte: weekAgo } }),
        this.dashboardRepository.countEnrollments({ enrolledAt: { gte: twoWeeksAgo, lt: weekAgo } }),
        this.dashboardRepository.countCourses({ createdAt: { gte: weekAgo } }),
        this.dashboardRepository.countCourses({ createdAt: { gte: twoWeeksAgo, lt: weekAgo } }),
      ])

    return {
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalQuizAttempts,
      newUsersToday,
      newEnrollmentsToday,
      newCoursesToday,
      userGrowth: this.calculateGrowth(usersThisWeek, usersLastWeek),
      enrollmentGrowth: this.calculateGrowth(enrollmentsThisWeek, enrollmentsLastWeek),
      courseGrowth: this.calculateGrowth(coursesThisWeek, coursesLastWeek),
    }
  }

  // USER STATISTICS

  async getUserStatistics(): Promise<UserStatisticsResType> {
    const { today, weekAgo, twoWeeksAgo, monthAgo } = this.getDateRanges()

    const totalUsers = await this.dashboardRepository.countUsers()

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

    // By status (ACTIVE/INACTIVE from UserStatus enum)
    const [activeUsers, twoFactorUsers] = await Promise.all([
      this.dashboardRepository.countUsersByStatus('ACTIVE'),
      this.dashboardRepository.countTwoFactorUsers(),
    ])

    // New users
    const [newUsersToday, newUsersThisWeek, newUsersThisMonth] = await Promise.all([
      this.dashboardRepository.countUsers({ createdAt: { gte: today } }),
      this.dashboardRepository.countUsers({ createdAt: { gte: weekAgo } }),
      this.dashboardRepository.countUsers({ createdAt: { gte: monthAgo } }),
    ])

    // Growth
    const usersLastWeek = await this.dashboardRepository.countUsers({
      createdAt: { gte: twoWeeksAgo, lt: weekAgo },
    })

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
    const userTrend = await this.dashboardRepository.getUserTrend(30)

    return {
      totalUsers,
      byRole,
      byStatus: {
        active: activeUsers,
        inactive: totalUsers - activeUsers,
      },
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      userTrend,
      growth: this.calculateGrowth(newUsersThisWeek, usersLastWeek),
      topInstructors,
      twoFactorEnabled: twoFactorUsers,
      twoFactorPercentage: totalUsers > 0 ? Math.round((twoFactorUsers / totalUsers) * 10000) / 100 : 0,
    }
  }

  // COURSE STATISTICS

  async getCourseStatistics(): Promise<CourseStatisticsResType> {
    const { today, weekAgo, twoWeeksAgo, monthAgo } = this.getDateRanges()

    const totalCourses = await this.dashboardRepository.countCourses()

    // By status (DRAFT, PUBLISHED, ARCHIVED from CourseStatus enum)
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

    // By level (BEGINNER, INTERMEDIATE, ADVANCED from CourseLevel enum)
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

    // New courses
    const [newCoursesToday, newCoursesThisWeek, newCoursesThisMonth] = await Promise.all([
      this.dashboardRepository.countCourses({ createdAt: { gte: today } }),
      this.dashboardRepository.countCourses({ createdAt: { gte: weekAgo } }),
      this.dashboardRepository.countCourses({ createdAt: { gte: monthAgo } }),
    ])

    // Growth
    const coursesLastWeek = await this.dashboardRepository.countCourses({
      createdAt: { gte: twoWeeksAgo, lt: weekAgo },
    })

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
    const courseTrend = await this.dashboardRepository.getCourseTrend(30)

    return {
      totalCourses,
      publishedCourses,
      draftCourses,
      archivedCourses,
      byStatus,
      byLevel,
      newCoursesToday,
      newCoursesThisWeek,
      newCoursesThisMonth,
      courseTrend,
      growth: this.calculateGrowth(newCoursesThisWeek, coursesLastWeek),
      topCoursesByEnrollment,
      totalChapters,
      totalLessons,
      averageChaptersPerCourse: totalCourses > 0 ? Math.round((totalChapters / totalCourses) * 100) / 100 : 0,
      averageLessonsPerCourse: totalCourses > 0 ? Math.round((totalLessons / totalCourses) * 100) / 100 : 0,
    }
  }

  // ENROLLMENT STATISTICS
  async getEnrollmentStatistics(): Promise<EnrollmentStatisticsResType> {
    const { today, weekAgo, twoWeeksAgo, monthAgo } = this.getDateRanges()

    const totalEnrollments = await this.dashboardRepository.countEnrollments()

    // By status (ACTIVE, COMPLETED, DROPPED from EnrollmentStatus enum)
    const [active, completed, dropped] = await Promise.all([
      this.dashboardRepository.countEnrollmentsByStatus('ACTIVE'),
      this.dashboardRepository.countEnrollmentsByStatus('COMPLETED'),
      this.dashboardRepository.countEnrollmentsByStatus('DROPPED'),
    ])

    // New enrollments
    const [newEnrollmentsToday, newEnrollmentsThisWeek, newEnrollmentsThisMonth] = await Promise.all([
      this.dashboardRepository.countEnrollments({ enrolledAt: { gte: today } }),
      this.dashboardRepository.countEnrollments({ enrolledAt: { gte: weekAgo } }),
      this.dashboardRepository.countEnrollments({ enrolledAt: { gte: monthAgo } }),
    ])

    // Growth
    const enrollmentsLastWeek = await this.dashboardRepository.countEnrollments({
      enrolledAt: { gte: twoWeeksAgo, lt: weekAgo },
    })

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
    const [activeStudentIds, allStudentIds] = await Promise.all([
      this.dashboardRepository.getActiveStudentIds(weekAgo),
      this.dashboardRepository.getAllStudentIds(),
    ])

    const activeSet = new Set(activeStudentIds.map((s) => s.studentId))
    const churnedStudents = allStudentIds.filter((s) => !activeSet.has(s.studentId)).length

    // Trend
    const enrollmentTrend = await this.dashboardRepository.getEnrollmentTrend(30)

    return {
      totalEnrollments,
      byStatus: { active, completed, dropped },
      newEnrollmentsToday,
      newEnrollmentsThisWeek,
      newEnrollmentsThisMonth,
      enrollmentTrend,
      growth: this.calculateGrowth(newEnrollmentsThisWeek, enrollmentsLastWeek),
      overallCompletionRate,
      averageProgress: Math.round(avgProgress * 100) / 100,
      topCoursesByEnrollment,
      activeStudents: activeStudentIds.length,
      churnedStudents,
    }
  }

  // QUIZ STATISTICS
  async getQuizStatistics(): Promise<QuizStatisticsResType> {
    const { today, weekAgo, monthAgo } = this.getDateRanges()

    const [totalQuizzes, totalQuestions, totalAttempts] = await Promise.all([
      this.dashboardRepository.countQuizzes(),
      this.dashboardRepository.countQuestions(),
      this.dashboardRepository.countQuizAttempts(),
    ])

    // Performance
    const attempts = await this.dashboardRepository.getAllQuizAttempts()
    const passedAttempts = attempts.filter((a) => a.isPassed).length
    const totalScore = attempts.reduce((sum, a) => sum + a.score, 0)
    const averageScore = attempts.length > 0 ? Math.round((totalScore / attempts.length) * 100) / 100 : 0

    // New attempts (using startedAt)
    const [newAttemptsToday, newAttemptsThisWeek, newAttemptsThisMonth] = await Promise.all([
      this.dashboardRepository.countQuizAttempts({ startedAt: { gte: today } }),
      this.dashboardRepository.countQuizAttempts({ startedAt: { gte: weekAgo } }),
      this.dashboardRepository.countQuizAttempts({ startedAt: { gte: monthAgo } }),
    ])

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
    const attemptTrend = await this.dashboardRepository.getQuizAttemptTrend(30)

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
      newAttemptsToday,
      newAttemptsThisWeek,
      newAttemptsThisMonth,
      attemptTrend,
      quizzesByCourse,
      averageQuestionsPerQuiz: totalQuizzes > 0 ? Math.round((totalQuestions / totalQuizzes) * 100) / 100 : 0,
      averageAttemptsPerQuiz: totalQuizzes > 0 ? Math.round((totalAttempts / totalQuizzes) * 100) / 100 : 0,
    }
  }

  // SYSTEM STATISTICS
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