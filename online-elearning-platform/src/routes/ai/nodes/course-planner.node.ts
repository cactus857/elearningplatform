import { Injectable, Logger } from '@nestjs/common'
import { ChatOpenAI } from '@langchain/openai'
import { task } from '@langchain/langgraph'

import envConfig from 'src/shared/config'
import { AICourseOutlineSchema, AICourseOutlineType } from '../workflows/types/schema.types'

@Injectable()
export class CoursePlannerNode {
  private readonly logger = new Logger(CoursePlannerNode.name)
  private llm: ChatOpenAI

  constructor() {
    this.llm = new ChatOpenAI({
      apiKey: envConfig.OPENAI_API_KEY,
      model: 'gpt-4o-mini',
      temperature: 0.7,
    })
  }

  createTask() {
    return task('coursePlanner', async (courseTopic: string): Promise<AICourseOutlineType> => {
      try {
        this.logger.log(`Planning course for topic: ${courseTopic}`)

        const planner = this.llm.withStructuredOutput(AICourseOutlineSchema)
        const courseOutline = await planner.invoke([
          {
            role: 'system',
            content: `You are an expert course designer. Create a comprehensive, well-structured course outline.
            
            Guidelines:
            - Create 4-6 chapters that build upon each other progressively
            - Ensure logical flow from beginner to advanced concepts
            - Make the thumbnail prompt vivid and specific for AI image generation (describe visual elements, colors, style, mood)
            - Consider modern teaching methodologies
            - Focus on practical, hands-on learning`,
          },
          {
            role: 'user',
            content: `Create a detailed course outline for: "${courseTopic}"`,
          },
        ])

        this.logger.log(`✅ Course outline generated: ${courseOutline.title}`)
        this.logger.log(`📚 Chapters: ${courseOutline.chapters.length}`)

        return courseOutline
      } catch (error) {
        this.logger.error(`❌ Course planning failed: ${error.message}`)
        throw error
      }
    })
  }
}
