import { Injectable, Logger } from '@nestjs/common'
import { ChatOpenAI } from '@langchain/openai'
import { task } from '@langchain/langgraph'
import envConfig from 'src/shared/config'
import { AIQuizQuestionSchema, AIQuizQuestionType } from '../../workflows/types/quiz-schema.types'
import z from 'zod'

export interface TopicWithContent {
  topicName: string
  numberOfQuestions: number
  keyPoints: string[]
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  relatedContent: string // Content from lessons related to this topic
}

@Injectable()
export class QuestionGeneratorNode {
  private readonly logger = new Logger(QuestionGeneratorNode.name)
  private llm: ChatOpenAI

  constructor() {
    this.llm = new ChatOpenAI({
      apiKey: envConfig.OPENAI_API_KEY,
      model: 'gpt-4o-mini',
      temperature: 0.8, // Higher temperature for more variety
    })
  }

  createTask() {
    return task('questionGenerator', async (topicInput: TopicWithContent): Promise<AIQuizQuestionType[]> => {
      try {
        this.logger.log(`❓ Generating ${topicInput.numberOfQuestions} questions for: ${topicInput.topicName}`)

        // ✅ Fix: Wrap array in object - OpenAI requires object schema
        const QuestionsWrapperSchema = z.object({
          questions: AIQuizQuestionSchema.array().min(topicInput.numberOfQuestions),
        })

        const generator = this.llm.withStructuredOutput(QuestionsWrapperSchema)

        const result = await generator.invoke([
          {
            role: 'system',
            content: `You are an expert question writer. Create high-quality multiple-choice questions based on the given topic and content.

            Guidelines:
            - Questions should be clear, concise, and unambiguous
            - Each question should have 4 answer options (A, B, C, D)
            - Only ONE option should be correct
            - Distractors (wrong answers) should be plausible but clearly incorrect
            - Test understanding and application, not just memorization
            - Vary question difficulty: mix of EASY, MEDIUM, HARD
            - Include explanations for correct answers
            - Avoid trick questions or ambiguous wording
            - Questions should be based on the provided content

            Question Types to Use:
            - Conceptual understanding
            - Practical application
            - Problem-solving
            - Code analysis (if applicable)
            - Best practices`,
          },
          {
            role: 'user',
            content: `Create ${topicInput.numberOfQuestions} multiple-choice questions for this topic:

            Topic: ${topicInput.topicName}
            Difficulty Level: ${topicInput.difficulty}

            Key Points to Cover:
            ${topicInput.keyPoints.map((point, i) => `${i + 1}. ${point}`).join('\n')}

            Related Content:
            ${topicInput.relatedContent}

            Please generate exactly ${topicInput.numberOfQuestions} questions that test these key points.`,
          },
        ])

        // ✅ Extract questions from wrapper object
        const questions = result.questions

        // Add topic to each question
        const questionsWithTopic = questions.map((q) => ({
          ...q,
          topic: topicInput.topicName,
        }))

        this.logger.log(`✅ Generated ${questionsWithTopic.length} questions for "${topicInput.topicName}"`)

        return questionsWithTopic
      } catch (error) {
        this.logger.error(`❌ Question generation failed for topic "${topicInput.topicName}": ${error.message}`)
        throw error
      }
    })
  }
}
