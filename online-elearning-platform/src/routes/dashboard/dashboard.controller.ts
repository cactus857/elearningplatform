import { Controller, Get } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { DashboardService } from './dashboard.service'
import {
  AdminOverviewResDTO,
  UserStatisticsResDTO,
  CourseStatisticsResDTO,
  EnrollmentStatisticsResDTO,
  QuizStatisticsResDTO,
  SystemStatisticsResDTO,
  FullAdminDashboardResDTO,
} from './dashboard.dto'

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  // =============================================
  // ADMIN ENDPOINTS
  // =============================================

  @Get('admin/overview')
  @ZodSerializerDto(AdminOverviewResDTO)
  getAdminOverview() {
    return this.dashboardService.getAdminOverview()
  }

  @Get('admin/users')
  @ZodSerializerDto(UserStatisticsResDTO)
  getUserStatistics() {
    return this.dashboardService.getUserStatistics()
  }

  @Get('admin/courses')
  @ZodSerializerDto(CourseStatisticsResDTO)
  getCourseStatistics() {
    return this.dashboardService.getCourseStatistics()
  }

  @Get('admin/enrollments')
  @ZodSerializerDto(EnrollmentStatisticsResDTO)
  getEnrollmentStatistics() {
    return this.dashboardService.getEnrollmentStatistics()
  }

  @Get('admin/quizzes')
  @ZodSerializerDto(QuizStatisticsResDTO)
  getQuizStatistics() {
    return this.dashboardService.getQuizStatistics()
  }

  @Get('admin/system')
  @ZodSerializerDto(SystemStatisticsResDTO)
  getSystemStatistics() {
    return this.dashboardService.getSystemStatistics()
  }

  @Get('admin/full')
  @ZodSerializerDto(FullAdminDashboardResDTO)
  async getFullAdminDashboard() {
    const [overview, users, courses, enrollments, quizzes, system] = await Promise.all([
      this.dashboardService.getAdminOverview(),
      this.dashboardService.getUserStatistics(),
      this.dashboardService.getCourseStatistics(),
      this.dashboardService.getEnrollmentStatistics(),
      this.dashboardService.getQuizStatistics(),
      this.dashboardService.getSystemStatistics(),
    ])

    return {
      overview,
      users,
      courses,
      enrollments,
      quizzes,
      system,
      generatedAt: new Date(),
    }
  }
}