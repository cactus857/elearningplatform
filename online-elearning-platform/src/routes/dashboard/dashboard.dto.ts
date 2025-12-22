import { createZodDto } from 'nestjs-zod'
import {
  DashboardQuerySchema,
  AdminOverviewResSchema,
  UserStatisticsResSchema,
  CourseStatisticsResSchema,
  EnrollmentStatisticsResSchema,
  QuizStatisticsResSchema,
  SystemStatisticsResSchema,
  FullAdminDashboardResSchema,
} from './dashboard.model'

export class DashboardQueryDTO extends createZodDto(DashboardQuerySchema) {}

export class AdminOverviewResDTO extends createZodDto(AdminOverviewResSchema) {}

export class UserStatisticsResDTO extends createZodDto(UserStatisticsResSchema) {}

export class CourseStatisticsResDTO extends createZodDto(CourseStatisticsResSchema) {}

export class EnrollmentStatisticsResDTO extends createZodDto(EnrollmentStatisticsResSchema) {}

export class QuizStatisticsResDTO extends createZodDto(QuizStatisticsResSchema) {}

export class SystemStatisticsResDTO extends createZodDto(SystemStatisticsResSchema) {}

export class FullAdminDashboardResDTO extends createZodDto(FullAdminDashboardResSchema) {}