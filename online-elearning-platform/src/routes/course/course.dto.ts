import { createZodDto } from 'nestjs-zod'
import {
  CreateCourseBodySchema,
  CreateCourseResSchema,
  GetCourseBySlugParamsSchema,
  GetCourseDetailResSchema,
  GetCourseParamsSchema,
  GetCoursesQuerySchema,
  GetCoursesResSchema,
  UpdateCourseBodySchema,
  UpdateCourseResSchema,
} from './course.model'

export class GetCoursesQueryDTO extends createZodDto(GetCoursesQuerySchema) {}

export class GetCourseParamsDTO extends createZodDto(GetCourseParamsSchema) {}

export class GetCourseBySlugParamsDTO extends createZodDto(GetCourseBySlugParamsSchema) {}

export class CreateCourseBodyDTO extends createZodDto(CreateCourseBodySchema) {}

export class CreateCourseResDTO extends createZodDto(CreateCourseResSchema) {}

export class UpdateCourseResDTO extends createZodDto(UpdateCourseResSchema) {}

export class UpdateCourseBodyDTO extends createZodDto(UpdateCourseBodySchema) {}

export class GetCoursesResDTO extends createZodDto(GetCoursesResSchema) {}

export class GetCourseDetailResDTO extends createZodDto(GetCourseDetailResSchema) {}
