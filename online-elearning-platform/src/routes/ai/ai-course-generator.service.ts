import { Injectable, Logger } from '@nestjs/common'
import { CourseGeneratorWorkflow, GeneratedCourse } from './workflows/course-generator.workflow'

export interface StreamUpdate {
  type: 'planning' | 'chapter' | 'thumbnail' | 'video' | 'complete' | 'error'
  message: string
  data?: any
}

@Injectable()
export class AiCourseGeneratorService {
  private readonly logger = new Logger(AiCourseGeneratorService.name)

  constructor(private courseGeneratorWorkflow: CourseGeneratorWorkflow) {}

  async generateCourse(courseTopic: string): Promise<GeneratedCourse> {
    try {
      const workflow = this.courseGeneratorWorkflow.createWorkflow()

      const result = await workflow.invoke(courseTopic)

      return result
    } catch (error) {
      this.logger.error(`Course generation failed: ${error.message}`)
      throw error
    }
  }
}
