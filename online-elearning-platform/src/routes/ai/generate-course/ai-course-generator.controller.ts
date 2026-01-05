import { Controller, Post, Body, Sse, Logger } from '@nestjs/common'
import { Observable } from 'rxjs'
import { AiCourseGeneratorService, StreamUpdate } from './ai-course-generator.service'
import { ZodSerializerDto } from 'nestjs-zod'
import { SaveGeneratedCourseBodyDTO, SaveGeneratedCourseResDTO } from './ai-course-generator.dto'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { ActiveRolePermissions } from 'src/shared/decorators/active-role-permissions.decorator'

export class GenerateCourseDto {
  courseTopic: string
}

export class RefineCourseDto {
  currentCourse: any
  refinementPrompt: string
}

@Controller('ai/courses')
export class AiCourseGeneratorController {
  private readonly logger = new Logger(AiCourseGeneratorController.name)

  constructor(private aiCourseGeneratorService: AiCourseGeneratorService) { }

  @Post('generate')
  async generateCourse(@Body() dto: GenerateCourseDto) {
    this.logger.log(`Generating course for: ${dto.courseTopic}`)

    const result = await this.aiCourseGeneratorService.generateCourse(dto.courseTopic)

    return {
      success: true,
      data: result,
    }
  }

  @Post('refine')
  async refineCourse(@Body() dto: RefineCourseDto) {
    this.logger.log(`Refining course with prompt: ${dto.refinementPrompt}`)

    const result = await this.aiCourseGeneratorService.refineCourse(
      dto.currentCourse,
      dto.refinementPrompt
    )

    return {
      success: true,
      data: result,
    }
  }

  @Post('save')
  @ZodSerializerDto(SaveGeneratedCourseResDTO)
  async saveCourse(
    @Body() body: SaveGeneratedCourseBodyDTO,
    @ActiveUser('userId') userId: string,
    @ActiveRolePermissions('name') roleName: string,
  ) {
    this.logger.log(`Saving generated course: ${body.title}`)
    return this.aiCourseGeneratorService.saveGeneratedCourse(body, userId, roleName)
  }
}