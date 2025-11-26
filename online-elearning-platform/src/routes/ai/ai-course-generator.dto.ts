import { createZodDto } from 'nestjs-zod'
import { SaveGeneratedCourseBodySchema, SaveGeneratedCourseResSchema } from './ai-course-generator.model'

export class SaveGeneratedCourseBodyDTO extends createZodDto(SaveGeneratedCourseBodySchema) {}
export class SaveGeneratedCourseResDTO extends createZodDto(SaveGeneratedCourseResSchema) {}
