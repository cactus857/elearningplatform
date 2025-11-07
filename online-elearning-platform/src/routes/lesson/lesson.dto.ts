import { createZodDto } from 'nestjs-zod'
import {
  CreateLessonBodySchema,
  CreateLessonResSchema,
  GetLessonDetailResSchema,
  GetLessonParamsSchema,
  GetLessonsQuerySchema,
  GetLessonsResSchema,
  ReorderLessonsBodySchema,
  UpdateLessonBodySchema,
  UpdateLessonResSchema,
} from './lesson.model'

export class GetLessonsQueryDTO extends createZodDto(GetLessonsQuerySchema) {}

export class GetLessonParamsDTO extends createZodDto(GetLessonParamsSchema) {}

export class CreateLessonBodyDTO extends createZodDto(CreateLessonBodySchema) {}

export class UpdateLessonBodyDTO extends createZodDto(UpdateLessonBodySchema) {}

export class ReorderLessonsBodyDTO extends createZodDto(ReorderLessonsBodySchema) {}

export class GetLessonsResDTO extends createZodDto(GetLessonsResSchema) {}

export class GetLessonDetailResDTO extends createZodDto(GetLessonDetailResSchema) {}

export class CreateLessonResDTO extends createZodDto(CreateLessonResSchema) {}

export class UpdateLessonResDTO extends createZodDto(UpdateLessonResSchema) {}
