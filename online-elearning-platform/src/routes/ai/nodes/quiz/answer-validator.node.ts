import { Injectable, Logger } from '@nestjs/common'
import { ChatOpenAI } from '@langchain/openai'
import { task } from '@langchain/langgraph'
import envConfig from 'src/shared/config'
import { AIQuizQuestionType } from '../../workflows/types/quiz-schema.types'
import * as z from 'zod'

const ValidationResultSchema = z.object({
  isValid: z.boolean().describe('Whether the question is valid and high quality'),
  issues: z.array(z.string()).describe('List of issues found (empty if valid)'),
  suggestions: z.array(z.string()).describe('Suggestions for improvement'),
  severity: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']).describe('Severity of issues'),
})

@Injectable()
export class AnswerValidatorNode {
  private readonly logger = new Logger(AnswerValidatorNode.name)
  private llm: ChatOpenAI

  constructor() {
    this.llm = new ChatOpenAI({
      apiKey: envConfig.OPENAI_API_KEY,
      model: 'gpt-4o-mini',
      temperature: 0.3,
    })
  }

  createTask() {
    return task('answerValidator', async (questions: AIQuizQuestionType[]): Promise<AIQuizQuestionType[]> => {
      try {
        this.logger.log(`🔍 Validating ${questions.length} questions...`)

        // Validate questions in parallel (batch of 5)
        const batchSize = 5
        const validatedQuestions: AIQuizQuestionType[] = []

        for (let i = 0; i < questions.length; i += batchSize) {
          const batch = questions.slice(i, i + batchSize)
          const results = await Promise.all(batch.map((q) => this.validateQuestion(q)))

          validatedQuestions.push(...results.filter((q) => q !== null))
        }

        this.logger.log(`✅ Validated ${validatedQuestions.length}/${questions.length} questions`)

        if (validatedQuestions.length < questions.length) {
          this.logger.warn(
            `⚠️ ${questions.length - validatedQuestions.length} questions were filtered out due to quality issues`,
          )
        }

        return validatedQuestions
      } catch (error) {
        this.logger.error(`❌ Validation failed: ${error.message}`)
        throw error
      }
    })
  }

  private async validateQuestion(question: AIQuizQuestionType): Promise<AIQuizQuestionType | null> {
    try {
      const validator = this.llm.withStructuredOutput(ValidationResultSchema)

      const validation = await validator.invoke([
        {
          role: 'system',
          content: `You are a quality assurance expert for educational quizzes. Validate questions for:

            1. Clarity: Is the question clear and unambiguous?
            2. Correctness: Is the correct answer actually correct?
            3. Distractors: Are wrong answers plausible but clearly incorrect?
            4. No ambiguity: Is there only ONE clearly correct answer?
            5. Grammar: Is the question grammatically correct?
            6. Relevance: Does the question test the stated topic?
            7. Difficulty: Is the difficulty level appropriate?

            Flag questions with HIGH severity issues for removal.`,
        },
        {
          role: 'user',
          content: `Validate this question:

            Question: ${question.text}
            Options:
            ${question.options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}

            Correct Answer: Option ${question.correctAnswerIndex + 1} - "${question.options[question.correctAnswerIndex]}"
            Explanation: ${question.explanation || 'No explanation provided'}
            Topic: ${question.topic}
            Difficulty: ${question.difficulty}`,
        },
      ])

      // Log validation results
      if (!validation.isValid) {
        this.logger.warn(`⚠️ Question validation failed:`)
        this.logger.warn(`   Question: "${question.text.substring(0, 50)}..."`)
        this.logger.warn(`   Issues: ${validation.issues.join(', ')}`)
        this.logger.warn(`   Severity: ${validation.severity}`)
      }

      // Filter out questions with HIGH severity issues
      if (validation.severity === 'HIGH') {
        this.logger.warn(`❌ Removing question due to HIGH severity issues`)
        return null
      }

      // Keep questions with no issues or low/medium severity
      return question
    } catch (error) {
      this.logger.error(`❌ Failed to validate question: ${error.message}`)
      // Keep question if validation fails (fail-open approach)
      return question
    }
  }
}
