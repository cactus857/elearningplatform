import { Controller, Get, Query } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { DashboardService } from './dashboard.service'
import {
  DashboardQueryDTO,
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
  getAdminOverview(@Query() query: DashboardQueryDTO) {
    return this.dashboardService.getAdminOverview(query)
  }

  @Get('admin/users')
  @ZodSerializerDto(UserStatisticsResDTO)
  getUserStatistics(@Query() query: DashboardQueryDTO) {
    return this.dashboardService.getUserStatistics(query)
  }

  @Get('admin/courses')
  @ZodSerializerDto(CourseStatisticsResDTO)
  getCourseStatistics(@Query() query: DashboardQueryDTO) {
    return this.dashboardService.getCourseStatistics(query)
  }

  @Get('admin/enrollments')
  @ZodSerializerDto(EnrollmentStatisticsResDTO)
  getEnrollmentStatistics(@Query() query: DashboardQueryDTO) {
    return this.dashboardService.getEnrollmentStatistics(query)
  }

  @Get('admin/quizzes')
  @ZodSerializerDto(QuizStatisticsResDTO)
  getQuizStatistics(@Query() query: DashboardQueryDTO) {
    return this.dashboardService.getQuizStatistics(query)
  }

  @Get('admin/system')
  @ZodSerializerDto(SystemStatisticsResDTO)
  getSystemStatistics() {
    return this.dashboardService.getSystemStatistics()
  }

  @Get('admin/full')
  @ZodSerializerDto(FullAdminDashboardResDTO)
  async getFullAdminDashboard(@Query() query: DashboardQueryDTO) {
    const [overview, users, courses, enrollments, quizzes, system] = await Promise.all([
      this.dashboardService.getAdminOverview(query),
      this.dashboardService.getUserStatistics(query),
      this.dashboardService.getCourseStatistics(query),
      this.dashboardService.getEnrollmentStatistics(query),
      this.dashboardService.getQuizStatistics(query),
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