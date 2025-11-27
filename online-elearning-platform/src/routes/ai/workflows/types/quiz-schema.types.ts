import * as z from 'zod'

// AI Quiz Outline
export const AIQuizOutlineSchema = z.object({
  title: z.string().describe('Quiz title'),
  description: z.string().describe('Quiz description'),
  timeLimitMinutes: z.number().nullable().describe('Time limit in minutes (null = no limit)'),
  passingScore: z.number().min(0).max(100).default(60).describe('Passing score percentage'),
  shuffleQuestions: z.boolean().default(true),
  shuffleOptions: z.boolean().default(true),
  showCorrectAnswers: z.boolean().default(true),
  topics: z
    .array(
      z.object({
        name: z.string().describe('Topic name'),
        numberOfQuestions: z.number().describe('Number of questions for this topic'),
        keyPoints: z.array(z.string()).describe('Key points to test'),
      }),
    )
    .describe('List of topics to cover in the quiz'),
})

// AI Question
export const AIQuizQuestionSchema = z.object({
  text: z.string().describe('Question text'),
  options: z.array(z.string()).min(2).max(6).describe('Answer options'),
  correctAnswerIndex: z.number().min(0).describe('Index of correct answer'),
  explanation: z.string().describe('Explanation for the correct answer'),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).describe('Question difficulty'),
  topic: z.string().describe('Topic this question belongs to'),
})

// AI Complete Quiz
export const AICompleteQuizSchema = AIQuizOutlineSchema.extend({
  questions: z.array(AIQuizQuestionSchema).min(1).describe('List of generated questions'),
})

// Types
export type AIQuizOutlineType = z.infer<typeof AIQuizOutlineSchema>
export type AIQuizQuestionType = z.infer<typeof AIQuizQuestionSchema>
export type AICompleteQuizType = z.infer<typeof AICompleteQuizSchema>
