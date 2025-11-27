import { createZodDto } from 'nestjs-zod'
import {
  GenerateQuizFromCourseBodySchema,
  SaveGeneratedQuizBodySchema,
  GenerateQuizResSchema,
  SaveGeneratedQuizResSchema,
} from './ai-quiz-generator.model'

export class GenerateQuizFromCourseBodyDTO extends createZodDto(GenerateQuizFromCourseBodySchema) {}
export class SaveGeneratedQuizBodyDTO extends createZodDto(SaveGeneratedQuizBodySchema) {}
export class GenerateQuizResDTO extends createZodDto(GenerateQuizResSchema) {}
export class SaveGeneratedQuizResDTO extends createZodDto(SaveGeneratedQuizResSchema) {}
