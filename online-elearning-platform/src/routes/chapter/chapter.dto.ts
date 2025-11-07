import { createZodDto } from 'nestjs-zod'
import {
  CreateChapterBodySchema,
  CreateChapterResSchema,
  GetChapterDetailResSchema,
  GetChapterParamsSchema,
  GetChaptersQuerySchema,
  GetChaptersResSchema,
  ReorderChaptersBodySchema,
  UpdateChapterBodySchema,
  UpdateChapterResSchema,
} from './chapter.model'

export class GetChaptersQueryDTO extends createZodDto(GetChaptersQuerySchema) {}

export class GetChapterParamsDTO extends createZodDto(GetChapterParamsSchema) {}

export class CreateChapterBodyDTO extends createZodDto(CreateChapterBodySchema) {}

export class UpdateChapterBodyDTO extends createZodDto(UpdateChapterBodySchema) {}

export class ReorderChaptersBodyDTO extends createZodDto(ReorderChaptersBodySchema) {}

export class GetChaptersResDTO extends createZodDto(GetChaptersResSchema) {}

export class GetChapterDetailResDTO extends createZodDto(GetChapterDetailResSchema) {}

export class CreateChapterResDTO extends createZodDto(CreateChapterResSchema) {}

export class UpdateChapterResDTO extends createZodDto(UpdateChapterResSchema) {}
