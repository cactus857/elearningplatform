// src/routes/ai/nodes/quiz-planner.node.ts
import { Injectable, Logger } from '@nestjs/common'
import { ChatOpenAI } from '@langchain/openai'
import { task } from '@langchain/langgraph'
import envConfig from 'src/shared/config'
import { AIQuizOutlineSchema, AIQuizOutlineType } from '../../workflows/types/quiz-schema.types'

export interface CourseContentInput {
  courseTitle: string
  courseDescription: string
  chapters: Array<{
    title: string
    lessons: Array<{
      title: string
      content: string
    }>
  }>
  numberOfQuestions: number
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
}

@Injectable()
export class QuizPlannerNode {
  private readonly logger = new Logger(QuizPlannerNode.name)
  private llm: ChatOpenAI

  constructor() {
    this.llm = new ChatOpenAI({
      apiKey: envConfig.OPENAI_API_KEY,
      model: 'gpt-4o-mini',
      temperature: 0.7,
    })
  }

  createTask() {
    return task('quizPlanner', async (input: CourseContentInput): Promise<AIQuizOutlineType> => {
      try {
        this.logger.log(`📋 Planning quiz for course: ${input.courseTitle}`)
        this.logger.log(`🎯 Target: ${input.numberOfQuestions} questions at ${input.difficulty} level`)

        const planner = this.llm.withStructuredOutput(AIQuizOutlineSchema)

        // Prepare course content summary
        const contentSummary = this.prepareContentSummary(input)

        const quizOutline = await planner.invoke([
          {
            role: 'system',
            content: `You are an expert quiz designer. Create a comprehensive quiz plan based on the provided course content.

            Guidelines:
            - Analyze the course content to identify key topics and concepts
            - Distribute questions evenly across important topics
            - Ensure questions test understanding, not just memorization
            - Adapt difficulty to the specified level (${input.difficulty})
            - Create a balanced mix of foundational and advanced concepts
            - Set appropriate time limits based on question count (roughly 1-2 minutes per question)
            - Passing score should be reasonable (60-70% for BEGINNER, 70-80% for INTERMEDIATE, 80-90% for ADVANCED)`,
          },
          {
            role: 'user',
            content: `Create a quiz plan for this course:

            Course: ${input.courseTitle}
            Description: ${input.courseDescription}

            Content Summary:
            ${contentSummary}

            Requirements:
            - Total questions: ${input.numberOfQuestions}
            - Difficulty level: ${input.difficulty}

            Please create a detailed quiz outline with topics to cover and key points to test.`,
          },
        ])

        this.logger.log(`✅ Quiz outline created: ${quizOutline.title}`)
        this.logger.log(`📚 Topics to cover: ${quizOutline.topics.length}`)

        return {
          title: quizOutline.title,
          description: quizOutline.description,
          timeLimitMinutes: quizOutline.timeLimitMinutes ?? null,
          passingScore: quizOutline.passingScore ?? 70,
          shuffleQuestions: quizOutline.shuffleQuestions ?? false,
          shuffleOptions: quizOutline.shuffleOptions ?? false,
          showCorrectAnswers: quizOutline.showCorrectAnswers ?? false,
          topics: quizOutline.topics,
        }
      } catch (error) {
        this.logger.error(`❌ Quiz planning failed: ${error.message}`)
        throw error
      }
    })
  }

  private prepareContentSummary(input: CourseContentInput): string {
    const summary = input.chapters
      .map((chapter, index) => {
        const lessons = chapter.lessons
          .map((lesson) => {
            // Truncate content to avoid token limits
            const content = lesson.content.substring(0, 500)
            return `  - ${lesson.title}: ${content}...`
          })
          .join('\n')

        return `Chapter ${index + 1}: ${chapter.title}\n${lessons}`
      })
      .join('\n\n')

    return summary
  }
}
