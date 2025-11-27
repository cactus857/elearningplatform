import z from 'zod'
import { CourseLevel, CourseStatus } from 'src/shared/constants/course.constant'

export const SaveGeneratedCourseBodySchema = z
  .object({
    title: z.string(),
    description: z.string(),
    thumbnail: z.url().nullable().optional(),
    duration: z.number(),
    level: z.enum([CourseLevel.Beginner, CourseLevel.Intermediate, CourseLevel.Advanced]),
    status: z.enum([CourseStatus.Archived, CourseStatus.Draft, CourseStatus.Published]),
    category: z.string(),
    smallDescription: z.string(),
    requirements: z.array(z.string()),
    whatYouWillLearn: z.array(z.string()),
    chapters: z.array(
      z.object({
        title: z.string(),
        position: z.number(),
        lessons: z.array(
          z.object({
            title: z.string(),
            position: z.number(),
            videoUrl: z.string().nullable(),
            duration: z.number().nullable(),
            content: z.string(),
          }),
        ),
      }),
    ),
  })
  .strict()

export const SaveGeneratedCourseResSchema = z.object({
  courseId: z.string(),
  message: z.string(),
})

export type SaveGeneratedCourseBodyType = z.infer<typeof SaveGeneratedCourseBodySchema>
export type SaveGeneratedCourseResType = z.infer<typeof SaveGeneratedCourseResSchema>
