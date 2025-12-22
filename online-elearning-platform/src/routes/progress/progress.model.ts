import z from 'zod'
// LESSON PROGRESS SCHEMA
export const LessonProgressSchema = z.object({
  id: z.string(),
  lessonId: z.string(),
  studentId: z.string(),
  enrollmentId: z.string(),
  isCompleted: z.boolean(),
  completedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
// PARAMS SCHEMAS
export const LessonProgressParamsSchema = z
  .object({
    lessonId: z.string(),
  })
  .strict()

export const CourseProgressParamsSchema = z
  .object({
    courseId: z.string(),
  })
  .strict()
// RESPONSE SCHEMAS
export const LessonProgressResSchema = z.object({
  lessonId: z.string(),
  studentId: z.string(),
  enrollmentId: z.string(),
  isCompleted: z.boolean(),
  completedAt: z.date().nullable(),
  lesson: z.object({
    id: z.string(),
    title: z.string(),
    position: z.number(),
  }),
})

export const LessonItemProgressSchema = z.object({
  lessonId: z.string(),
  lessonTitle: z.string(),
  lessonPosition: z.number(),
  isCompleted: z.boolean(),
  completedAt: z.date().nullable(),
})

export const ChapterProgressSchema = z.object({
  chapterId: z.string(),
  chapterTitle: z.string(),
  chapterPosition: z.number(),
  totalLessons: z.number(),
  completedLessons: z.number(),
  isCompleted: z.boolean(),
  lessons: z.array(LessonItemProgressSchema),
})

export const CourseProgressResSchema = z.object({
  courseId: z.string(),
  courseTitle: z.string(),
  enrollmentId: z.string(),
  enrollmentStatus: z.string(),
  totalLessons: z.number(),
  completedLessons: z.number(),
  progressPercentage: z.number(),
  isCompleted: z.boolean(),
  completedAt: z.date().nullable(),
  chapters: z.array(ChapterProgressSchema),
})

export const ProgressSummarySchema = z.object({
  enrollmentId: z.string(),
  courseId: z.string(),
  courseTitle: z.string(),
  totalLessons: z.number(),
  completedLessons: z.number(),
  progressPercentage: z.number(),
  isCompleted: z.boolean(),
  completedAt: z.date().nullable(),
})

export const MyCoursesProgressResSchema = z.object({
  data: z.array(ProgressSummarySchema),
  totalItems: z.number(),
})

export const ToggleLessonResSchema = z.object({
  lessonProgress: LessonProgressSchema,
  enrollmentProgress: z.number(),
  isEnrollmentCompleted: z.boolean(),
  message: z.string(),
})
// TYPES
export type LessonProgressType = z.infer<typeof LessonProgressSchema>
export type LessonProgressParamsType = z.infer<typeof LessonProgressParamsSchema>
export type CourseProgressParamsType = z.infer<typeof CourseProgressParamsSchema>
export type LessonProgressResType = z.infer<typeof LessonProgressResSchema>
export type LessonItemProgressType = z.infer<typeof LessonItemProgressSchema>
export type ChapterProgressType = z.infer<typeof ChapterProgressSchema>
export type CourseProgressResType = z.infer<typeof CourseProgressResSchema>
export type ProgressSummaryType = z.infer<typeof ProgressSummarySchema>
export type MyCoursesProgressResType = z.infer<typeof MyCoursesProgressResSchema>
export type ToggleLessonResType = z.infer<typeof ToggleLessonResSchema>