import z from 'zod'

// Request: Generate quiz from course
export const GenerateQuizFromCourseBodySchema = z
  .object({
    courseId: z.string(),
    chapterIds: z.array(z.string()).optional(), // If empty, use all chapters
    numberOfQuestions: z.number().int().min(1).max(50).default(10),
    difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).default('INTERMEDIATE'),
  })
  .strict()

// Request: Save generated quiz
export const SaveGeneratedQuizBodySchema = z
  .object({
    title: z.string().min(1).max(200),
    courseId: z.string(),
    chapterId: z.string().nullable().optional(),
    timeLimitMinutes: z.number().int().min(1).max(300).nullable().optional(),
    passingScore: z.number().int().min(0).max(100).default(60),
    shuffleQuestions: z.boolean().default(true),
    shuffleOptions: z.boolean().default(true),
    showCorrectAnswers: z.boolean().default(true),
    availableFrom: z.coerce.date().nullable().optional(),
    availableTo: z.coerce.date().nullable().optional(),
    maxAttempts: z.number().int().min(1).max(10).nullable().optional(),
    questions: z
      .array(
        z.object({
          text: z.string().min(1),
          options: z.array(z.string()).min(2).max(6),
          correctAnswerIndex: z.number().int().min(0),
          explanation: z.string(),
        }),
      )
      .min(1),
  })
  .strict()

// Response: Generated quiz
export const GenerateQuizResSchema = z.object({
  title: z.string(),
  description: z.string(),
  timeLimitMinutes: z.number().nullable(),
  passingScore: z.number(),
  shuffleQuestions: z.boolean(),
  shuffleOptions: z.boolean(),
  showCorrectAnswers: z.boolean(),
  availableFrom: z.coerce.date().nullable().optional(),
  availableTo: z.coerce.date().nullable().optional(),
  maxAttempts: z.number().int().min(1).max(10).nullable().optional(),
  questions: z.array(
    z.object({
      text: z.string(),
      options: z.array(z.string()),
      correctAnswerIndex: z.number(),
      explanation: z.string(),
      difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
      topic: z.string(),
    }),
  ),
})

// Response: Save quiz
export const SaveGeneratedQuizResSchema = z.object({
  quizId: z.string(),
  message: z.string(),
})

// Types
export type GenerateQuizFromCourseBodyType = z.infer<typeof GenerateQuizFromCourseBodySchema>
export type SaveGeneratedQuizBodyType = z.infer<typeof SaveGeneratedQuizBodySchema>
export type GenerateQuizResType = z.infer<typeof GenerateQuizResSchema>
export type SaveGeneratedQuizResType = z.infer<typeof SaveGeneratedQuizResSchema>
