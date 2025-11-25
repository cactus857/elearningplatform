import { CourseLevel, CourseStatus } from 'src/shared/constants/course.constant'
import * as z from 'zod'

export const AILessonSchema = z.object({
  title: z.string().describe('Lesson title'),
  position: z.number().describe('Lesson position'),
  videoUrl: z.string().describe('Lesson video URL'),
  duration: z.number().describe('Lesson duration'),
  content: z.string().describe('Lesson content'),
})

export const AIChapterSchema = z.object({
  title: z.string().describe('Chapter title'),
  position: z.number().describe('Chapter position'),
  lessons: z.array(AILessonSchema).describe('Lessons in the chapter'),
})

export const AICourseOutlineSchema = z.object({
  title: z.string().describe('Course title'),
  description: z.string().describe('Course description'),
  thumbnail: z.string().describe('Detailed prompt for AI image generation - describe the course visually'),
  duration: z.number().describe('Course duration'),
  level: z.enum([CourseLevel.Beginner, CourseLevel.Intermediate, CourseLevel.Advanced]),
  status: z.enum([CourseStatus.Archived, CourseStatus.Draft, CourseStatus.Published]),
  category: z.string().describe('Course category'),
  smallDescription: z.string().describe('Course small description'),
  requirements: z.array(z.string()).describe('Course requirements'),
  whatYouWillLearn: z.array(z.string()).describe('Course what you will learn'),
  chapters: z
    .array(
      z.object({
        title: z.string().describe('Chapter title'),
        position: z.number().describe('Chapter position'),
      }),
    )
    .describe('List of chapters with basic info'),
})

export type AICourseOutlineType = z.infer<typeof AICourseOutlineSchema>
export type AIChapterType = z.infer<typeof AIChapterSchema>
export type AILessonType = z.infer<typeof AILessonSchema>
