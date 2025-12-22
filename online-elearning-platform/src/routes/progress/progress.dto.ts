import { createZodDto } from 'nestjs-zod'
import {
  LessonProgressParamsSchema,
  CourseProgressParamsSchema,
  LessonProgressResSchema,
  CourseProgressResSchema,
  MyCoursesProgressResSchema,
  ToggleLessonResSchema,
} from './progress.model'

// Params
export class LessonProgressParamsDTO extends createZodDto(LessonProgressParamsSchema) {}

export class CourseProgressParamsDTO extends createZodDto(CourseProgressParamsSchema) {}

// Response
export class LessonProgressResDTO extends createZodDto(LessonProgressResSchema) {}

export class CourseProgressResDTO extends createZodDto(CourseProgressResSchema) {}

export class MyCoursesProgressResDTO extends createZodDto(MyCoursesProgressResSchema) {}

export class ToggleLessonResDTO extends createZodDto(ToggleLessonResSchema) {}