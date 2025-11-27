import { Controller, Post, Body, Logger } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  GenerateQuizFromCourseBodyDTO,
  SaveGeneratedQuizBodyDTO,
  GenerateQuizResDTO,
  SaveGeneratedQuizResDTO,
} from './ai-quiz-generator.dto'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { ActiveRolePermissions } from 'src/shared/decorators/active-role-permissions.decorator'
import { AiQuizGeneratorService } from './ai-quiz-generator.service'

@Controller('ai/quizzes')
export class AiQuizGeneratorController {
  private readonly logger = new Logger(AiQuizGeneratorController.name)

  constructor(private aiQuizGeneratorService: AiQuizGeneratorService) {}

  /**
   * Generate quiz from course content
   * POST /ai/quizzes/generate-from-course
   */
  @Post('generate-from-course')
  @ZodSerializerDto(GenerateQuizResDTO)
  async generateFromCourse(
    @Body() body: GenerateQuizFromCourseBodyDTO,
    @ActiveUser('userId') userId: string,
    @ActiveRolePermissions('name') roleName: string,
  ) {
    this.logger.log(`📝 Generating quiz for course: ${body.courseId}`)
    this.logger.log(`   Questions: ${body.numberOfQuestions}`)
    this.logger.log(`   Difficulty: ${body.difficulty}`)
    this.logger.log(`   Chapters: ${body.chapterIds?.length || 'All'}`)

    const result = await this.aiQuizGeneratorService.generateQuizFromCourse(body, userId, roleName)

    return result
  }

  /**
   * Save generated quiz to database
   * POST /ai/quizzes/save
   */
  @Post('save')
  @ZodSerializerDto(SaveGeneratedQuizResDTO)
  async saveQuiz(
    @Body() body: SaveGeneratedQuizBodyDTO,
    @ActiveUser('userId') userId: string,
    @ActiveRolePermissions('name') roleName: string,
  ) {
    this.logger.log(`💾 Saving quiz: ${body.title}`)

    return this.aiQuizGeneratorService.saveGeneratedQuiz(body, userId, roleName)
  }
}
