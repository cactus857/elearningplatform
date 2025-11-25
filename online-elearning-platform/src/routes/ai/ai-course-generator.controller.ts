import { Controller, Post, Body, Sse, Logger } from '@nestjs/common'
import { Observable } from 'rxjs'
import { AiCourseGeneratorService, StreamUpdate } from './ai-course-generator.service'

export class GenerateCourseDto {
  courseTopic: string
}

@Controller('ai/courses')
export class AiCourseGeneratorController {
  private readonly logger = new Logger(AiCourseGeneratorController.name)

  constructor(private aiCourseGeneratorService: AiCourseGeneratorService) {}

  @Post('generate')
  async generateCourse(@Body() dto: GenerateCourseDto) {
    this.logger.log(`Generating course for: ${dto.courseTopic}`)

    const result = await this.aiCourseGeneratorService.generateCourse(dto.courseTopic)

    return {
      success: true,
      data: result,
    }
  }
}
