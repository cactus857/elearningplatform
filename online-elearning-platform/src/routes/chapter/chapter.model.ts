import z from 'zod'
import { CourseSchema } from '../course/course.model'

// Chapter Schema
export const ChapterSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200),
  position: z.number().int().positive(),
  courseId: z.string(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// DTOs
export const GetChaptersQuerySchema = z
  .object({
    courseId: z.string(),
  })
  .strict()

export const GetChapterParamsSchema = z
  .object({
    chapterId: z.string(),
  })
  .strict()

export const CreateChapterBodySchema = z
  .object({
    title: z.string().min(1).max(200),
    courseId: z.string(),
    position: z.number().int().positive().optional(),
  })
  .strict()

export const UpdateChapterBodySchema = z
  .object({
    title: z.string().min(1).max(200).optional(),
    position: z.number().int().positive().optional(),
  })
  .strict()

export const ReorderChaptersBodySchema = z
  .object({
    courseId: z.string(),
    chapters: z.array(
      z.object({
        id: z.string(),
        position: z.number().int().positive(),
      }),
    ),
  })
  .strict()

export const GetChaptersResSchema = z.object({
  data: z.array(
    ChapterSchema.extend({
      _count: z
        .object({
          lessons: z.number(),
        })
        .optional(),
    }),
  ),
})

export const GetChapterDetailResSchema = ChapterSchema.extend({
  course: CourseSchema.pick({
    id: true,
    title: true,
    description: true,
    thumbnail: true,
    instructorId: true,
  }).nullable(),
  lessons: z.array(
    z
      .object({
        id: z.string(),
        title: z.string(),
        position: z.number(),
        videoUrl: z.string().nullable(),
        documentUrl: z.string().nullable(),
        duration: z.number().nullable(),
      })
      .nullable(),
  ),
})

export const CreateChapterResSchema = ChapterSchema
export const UpdateChapterResSchema = ChapterSchema.partial().strict()

// Types
export type ChapterType = z.infer<typeof ChapterSchema>
export type CreateChapterResType = z.infer<typeof CreateChapterResSchema>
export type GetChaptersQueryType = z.infer<typeof GetChaptersQuerySchema>
export type GetChapterParamsType = z.infer<typeof GetChapterParamsSchema>
export type CreateChapterBodyType = z.infer<typeof CreateChapterBodySchema>
export type UpdateChapterBodyType = z.infer<typeof UpdateChapterBodySchema>
export type UpdateChapterResType = z.infer<typeof UpdateChapterResSchema>
export type ReorderChaptersBodyType = z.infer<typeof ReorderChaptersBodySchema>
export type GetChaptersResType = z.infer<typeof GetChaptersResSchema>
export type GetChapterDetailResType = z.infer<typeof GetChapterDetailResSchema>
