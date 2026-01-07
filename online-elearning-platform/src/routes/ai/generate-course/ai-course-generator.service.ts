import { ForbiddenException, Injectable, Logger } from '@nestjs/common'
import { AiCourseGeneratorRepository } from './ai-course-generator.repository'
import { SaveGeneratedCourseBodyType } from './ai-course-generator.model'
import { RoleName } from 'src/shared/constants/role.constants'
import { CourseGeneratorWorkflow, GeneratedCourse } from '../workflows/course-generator.workflow'
import { RedisService } from 'src/shared/services/redis.service'
import { ChatOpenAI } from '@langchain/openai'
import envConfig from 'src/shared/config'

export interface StreamUpdate {
  type: 'planning' | 'chapter' | 'thumbnail' | 'video' | 'complete' | 'error'
  message: string
  data?: any
}

@Injectable()
export class AiCourseGeneratorService {
  private readonly logger = new Logger(AiCourseGeneratorService.name)
  private llm: ChatOpenAI

  constructor(
    private courseGeneratorWorkflow: CourseGeneratorWorkflow,
    private aiCourseGeneratorRepository: AiCourseGeneratorRepository,
    private redisService: RedisService,
  ) {
    this.llm = new ChatOpenAI({
      apiKey: envConfig.OPENAI_API_KEY,
      model: 'gpt-4o-mini',
      temperature: 0.7,
    })
  }

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

  async refineCourse(currentCourse: GeneratedCourse, refinementPrompt: string): Promise<GeneratedCourse> {
    try {
      this.logger.log(`Refining course: ${currentCourse.title}`)
      this.logger.log(`Refinement prompt: ${refinementPrompt}`)

      const response = await this.llm.invoke([
        {
          role: 'system',
          content: `You are an expert course designer. The user has a generated course and wants to modify it.
          
Your task is to apply the user's requested changes to the course structure.
You MUST return the complete modified course in the exact same JSON structure.

IMPORTANT RULES:
1. Preserve all existing data unless explicitly asked to change it
2. Maintain proper chapter/lesson positions (1-indexed, sequential)
3. Keep the same JSON structure
4. Apply the changes thoughtfully and professionally
5. Return ONLY valid JSON, no markdown formatting or code blocks

The course structure MUST include:
- title (string)
- description (string)  
- thumbnail (string URL)
- duration (number in minutes)
- level ("BEGINNER" | "INTERMEDIATE" | "ADVANCED")
- status ("DRAFT" | "PUBLISHED" | "ARCHIVED")
- category (string)
- smallDescription (string)
- requirements (string array)
- whatYouWillLearn (string array)
- chapters (array with title, position, lessons array)
- Each lesson needs: title, position, videoUrl (string|null), duration (number|null), content (string)`
        },
        {
          role: 'user',
          content: `Here is the current course:
\`\`\`json
${JSON.stringify(currentCourse, null, 2)}
\`\`\`

Please apply this change: "${refinementPrompt}"

Return the complete modified course as valid JSON.`
        }
      ])

      const responseText = typeof response.content === 'string'
        ? response.content
        : JSON.stringify(response.content)

      // Parse the JSON from the response (handle potential markdown code blocks)
      let jsonString = responseText.trim()
      if (jsonString.startsWith('```json')) {
        jsonString = jsonString.slice(7)
      }
      if (jsonString.startsWith('```')) {
        jsonString = jsonString.slice(3)
      }
      if (jsonString.endsWith('```')) {
        jsonString = jsonString.slice(0, -3)
      }
      jsonString = jsonString.trim()

      const refinedCourse = JSON.parse(jsonString) as GeneratedCourse

      this.logger.log(`✅ Course refined successfully: ${refinedCourse.title}`)

      return refinedCourse
    } catch (error) {
      this.logger.error(`Course refinement failed: ${error.message}`)
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
