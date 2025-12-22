import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import { TrendPointType } from './dashboard.model'

@Injectable()
export class DashboardRepository {
  constructor(private prismaService: PrismaService) {}

  // =============================================
  // USER QUERIES
  // =============================================

  async countUsers(where?: { createdAt?: { gte?: Date; lt?: Date }; deletedAt?: null }) {
    return this.prismaService.user.count({ where: { deletedAt: null, ...where } })
  }

  async countUsersByStatus(status: 'ACTIVE' | 'INACTIVE') {
    return this.prismaService.user.count({
      where: { status, deletedAt: null },
    })
  }

  async countTwoFactorUsers() {
    return this.prismaService.user.count({
      where: { is2FAEnable: true, deletedAt: null },
    })
  }

  async getUsersWithRoles() {
    return this.prismaService.user.findMany({
      where: { deletedAt: null },
      include: { role: true },
    })
  }

  async getRoleByName(name: string) {
    return this.prismaService.role.findFirst({ where: { name } })
  }

  async getInstructorsWithCourses(roleId: string, limit: number = 10) {
    return this.prismaService.user.findMany({
      where: { roleId, deletedAt: null },
      include: {
        coursesAsInstructor: {
          where: { deletedAt: null },
          include: { enrollments: true },
        },
      },
      take: limit,
    })
  }

  // =============================================
  // COURSE QUERIES
  // =============================================

  async countCourses(where?: {
    createdAt?: { gte?: Date; lt?: Date }
    status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
    level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  }) {
    return this.prismaService.course.count({ where: { deletedAt: null, ...where } })
  }

  async getCoursesWithEnrollments(limit: number = 20) {
    return this.prismaService.course.findMany({
      where: { deletedAt: null },
      include: {
        instructor: { select: { id: true, fullName: true } },
        enrollments: true,
      },
      take: limit,
    })
  }

  async countChapters() {
    return this.prismaService.chapter.count({ where: { deletedAt: null } })
  }

  async countLessons() {
    return this.prismaService.lesson.count({ where: { deletedAt: null } })
  }

  // =============================================
  // ENROLLMENT QUERIES
  // =============================================

  async countEnrollments(where?: { enrolledAt?: { gte?: Date; lt?: Date } }) {
    return this.prismaService.enrollment.count({ where })
  }

  async getAllEnrollments() {
    return this.prismaService.enrollment.findMany({
      select: {
        progress: true,
        status: true,
        completedAt: true,
        enrolledAt: true,
      },
    })
  }

  async countEnrollmentsByStatus(status: 'ACTIVE' | 'COMPLETED' | 'DROPPED') {
    return this.prismaService.enrollment.count({
      where: { status },
    })
  }

  async getCoursesWithEnrollmentCount() {
    return this.prismaService.course.findMany({
      where: { deletedAt: null },
      include: { enrollments: true },
    })
  }

  async getActiveStudentIds(since: Date) {
    return this.prismaService.enrollment.groupBy({
      by: ['studentId'],
      where: {
        OR: [{ enrolledAt: { gte: since } }, { completedAt: { gte: since } }],
      },
    })
  }

  async getAllStudentIds() {
    return this.prismaService.enrollment.groupBy({
      by: ['studentId'],
    })
  }

  // =============================================
  // QUIZ QUERIES
  // =============================================

  async countQuizzes() {
    return this.prismaService.quiz.count({ where: { deletedAt: null } })
  }

  async countQuestions() {
    return this.prismaService.question.count()
  }

  async countQuizAttempts(where?: { startedAt?: { gte?: Date; lt?: Date } }) {
    return this.prismaService.studentQuizAttempt.count({ where })
  }

  async getAllQuizAttempts() {
    return this.prismaService.studentQuizAttempt.findMany({
      select: { score: true, isPassed: true },
    })
  }

  async getQuizzesWithAttempts() {
    return this.prismaService.quiz.findMany({
      where: { deletedAt: null },
      include: {
        course: { select: { id: true, title: true } },
        attempts: true,
      },
    })
  }

  // =============================================
  // SYSTEM QUERIES
  // =============================================

  async countDevices() {
    return this.prismaService.device.count()
  }

  async countActiveDevices(since: Date) {
    return this.prismaService.device.count({
      where: { lastActive: { gte: since } },
    })
  }

  async getAllDevices() {
    return this.prismaService.device.findMany({
      select: { userAgent: true },
    })
  }

  async countActiveRefreshTokens() {
    return this.prismaService.refreshToken.count({
      where: {
        expiresAt: { gt: new Date() },
      },
    })
  }

  async countPendingVerifications() {
    return this.prismaService.verificationCode.count({
      where: {
        expiresAt: { gt: new Date() },
      },
    })
  }

  // =============================================
  // TREND DATA
  // =============================================

  async getUserTrend(days: number): Promise<TrendPointType[]> {
    return this.getTrendData('user', days)
  }

  async getCourseTrend(days: number): Promise<TrendPointType[]> {
    return this.getTrendData('course', days)
  }

  async getEnrollmentTrend(days: number): Promise<TrendPointType[]> {
    return this.getTrendData('enrollment', days)
  }

  async getQuizAttemptTrend(days: number): Promise<TrendPointType[]> {
    return this.getTrendData('studentQuizAttempt', days)
  }

  private async getTrendData(
    model: 'user' | 'course' | 'enrollment' | 'studentQuizAttempt',
    days: number,
  ): Promise<TrendPointType[]> {
    const result: TrendPointType[] = []
    const today = new Date()

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      let count: number

      switch (model) {
        case 'user':
          count = await this.prismaService.user.count({
            where: { createdAt: { gte: date, lt: nextDate }, deletedAt: null },
          })
          break
        case 'course':
          count = await this.prismaService.course.count({
            where: { createdAt: { gte: date, lt: nextDate }, deletedAt: null },
          })
          break
        case 'enrollment':
          count = await this.prismaService.enrollment.count({
            where: { enrolledAt: { gte: date, lt: nextDate } },
          })
          break
        case 'studentQuizAttempt':
          count = await this.prismaService.studentQuizAttempt.count({
            where: { startedAt: { gte: date, lt: nextDate } },
          })
          break
      }

      result.push({
        date: date.toISOString().split('T')[0],
        count,
      })
    }

    return result
  }
}