import { ForbiddenException, Injectable, Logger } from '@nestjs/common'
import { AiCourseGeneratorRepository } from './ai-course-generator.repository'
import { SaveGeneratedCourseBodyType } from './ai-course-generator.model'
import { RoleName } from 'src/shared/constants/role.constants'
import { CourseGeneratorWorkflow, GeneratedCourse } from '../workflows/course-generator.workflow'
import { RedisService } from 'src/shared/services/redis.service'

export interface StreamUpdate {
  type: 'planning' | 'chapter' | 'thumbnail' | 'video' | 'complete' | 'error'
  message: string
  data?: any
}

@Injectable()
export class AiCourseGeneratorService {
  private readonly logger = new Logger(AiCourseGeneratorService.name)

  constructor(
    private courseGeneratorWorkflow: CourseGeneratorWorkflow,
    private aiCourseGeneratorRepository: AiCourseGeneratorRepository,
    private redisService: RedisService,
  ) {}

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

  async saveGeneratedCourse(data: SaveGeneratedCourseBodyType, userId: string, userRoleName: string) {
    try {
      this.logger.log(`Saving generated course: ${data.title}`)

      // Xác định instructorId
      let instructorId: string

      if (userRoleName === RoleName.Admin) {
        // Admin có thể tự đặt mình là instructor hoặc để mặc định
        instructorId = userId
      } else if (userRoleName === RoleName.Instructor) {
        // Instructor tự động là người tạo
        instructorId = userId
      } else {
        throw new ForbiddenException('Only instructors and admins can save courses')
      }

      // Lưu course vào database
      const savedCourse = await this.aiCourseGeneratorRepository.saveGeneratedCourse(data, instructorId, userId)

      console.log('>> before save: Invalidating cache')
      await this.redisService.invalidateCourseList()
      console.log('>> after save: Invalidated cache')

      this.logger.log(`✅ Course saved successfully: ${savedCourse.id}`)

      return {
        courseId: savedCourse.id,
        message: 'Course saved successfully',
      }
    } catch (error) {
      this.logger.error(`Failed to save course: ${error.message}`)
      throw error
    }
  }
}
