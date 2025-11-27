import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { QuizGeneratorWorkflow, GenerateQuizInput } from '../workflows/quiz-generator.workflow'
import { AiQuizGeneratorRepository } from './ai-quiz-generator.repository'
import { GenerateQuizFromCourseBodyType, SaveGeneratedQuizBodyType } from './ai-quiz-generator.model'
import { RoleName } from 'src/shared/constants/role.constants'
import { AICompleteQuizType } from '../workflows/types/quiz-schema.types'

@Injectable()
export class AiQuizGeneratorService {
  private readonly logger = new Logger(AiQuizGeneratorService.name)

  constructor(
    private quizGeneratorWorkflow: QuizGeneratorWorkflow,
    private aiQuizGeneratorRepository: AiQuizGeneratorRepository,
  ) {}

  /**
   * Generate quiz from course content
   */
  async generateQuizFromCourse(
    data: GenerateQuizFromCourseBodyType,
    userId: string,
    userRoleName: string,
  ): Promise<AICompleteQuizType> {
    try {
      this.logger.log(`🎯 Generating quiz for course: ${data.courseId}`)

      // 1. Get course with content
      const course = await this.aiQuizGeneratorRepository.getCourseWithContent(data.courseId, data.chapterIds)

      if (!course) {
        throw new NotFoundException('Course not found')
      }

      // 2. Check permissions
      if (userRoleName === RoleName.Instructor && course.instructorId !== userId) {
        throw new ForbiddenException('You can only generate quizzes for your own courses')
      }

      // 3. Validate course has content
      if (!course.chapters || course.chapters.length === 0) {
        throw new ForbiddenException('Course has no chapters. Please add content first.')
      }

      const hasContent = course.chapters.some((ch) => ch.lessons && ch.lessons.length > 0)
      if (!hasContent) {
        throw new ForbiddenException('Course chapters have no lessons. Please add content first.')
      }

      // 4. Prepare input for workflow
      const workflowInput: GenerateQuizInput = {
        courseTitle: course.title,
        courseDescription: course.description || '',
        chapters: course.chapters.map((ch) => ({
          title: ch.title,
          lessons: ch.lessons.map((l) => ({
            title: l.title,
            content: l.content || '',
          })),
        })),
        numberOfQuestions: data.numberOfQuestions,
        difficulty: data.difficulty,
      }

      // 5. Generate quiz using workflow
      const workflow = this.quizGeneratorWorkflow.createWorkflow()
      const generatedQuiz = await workflow.invoke(workflowInput)

      this.logger.log(`✅ Quiz generated successfully: ${generatedQuiz.title}`)

      return generatedQuiz
    } catch (error) {
      this.logger.error(`❌ Quiz generation failed: ${error.message}`)
      throw error
    }
  }

  /**
   * Save generated quiz to database
   */
  async saveGeneratedQuiz(data: SaveGeneratedQuizBodyType, userId: string, userRoleName: string) {
    try {
      this.logger.log(`💾 Saving quiz: ${data.title}`)

      // 1. Check permissions
      if (userRoleName === RoleName.Instructor) {
        const isOwner = await this.aiQuizGeneratorRepository.checkCourseOwnership(data.courseId, userId)
        if (!isOwner) {
          throw new ForbiddenException('You can only create quizzes for your own courses')
        }
      }

      // 2. Save quiz
      const savedQuiz = await this.aiQuizGeneratorRepository.saveGeneratedQuiz(data, userId)

      this.logger.log(`✅ Quiz saved successfully: ${savedQuiz.id}`)

      return {
        quizId: savedQuiz.id,
        message: 'Quiz saved successfully',
      }
    } catch (error) {
      this.logger.error(`❌ Failed to save quiz: ${error.message}`)
      throw error
    }
  }
}
