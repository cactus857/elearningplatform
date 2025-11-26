import { task } from '@langchain/langgraph'
import { ChatOpenAI } from '@langchain/openai'
import { Injectable, Logger } from '@nestjs/common'
import envConfig from 'src/shared/config'
import { AIChapterSchema, AIChapterType } from '../workflows/types/schema.types'

@Injectable()
export class ChapterGeneratorNode {
  private readonly logger = new Logger(ChapterGeneratorNode.name)
  private llm: ChatOpenAI

  constructor() {
    this.llm = new ChatOpenAI({
      apiKey: envConfig.OPENAI_API_KEY,
      model: 'gpt-4o-mini',
      temperature: 0.7,
    })
  }

  createTask() {
    return task(
      'chapterGenerator',
      async (chapterOutline: { title: string; position: number }): Promise<AIChapterType> => {
        try {
          this.logger.log(`📖 Generating chapter ${chapterOutline.position}: ${chapterOutline.title}`)

          const chapterGenerator = this.llm.withStructuredOutput(AIChapterSchema)
          const chapter = await chapterGenerator.invoke([
            {
              role: 'system',
              content: `You are an expert instructional designer. Create detailed chapter content with comprehensive lessons.

                Guidelines:
                - Create 3-5 lessons per chapter
                - Each lesson should be 10-30 minutes
                - The lesson "content" field MUST be valid HTML, not markdown
                - Use semantic HTML tags: <h2>, <h3>, <p>, <ul>, <ol>, <li>, <code>, <pre>, <strong>, <em>, <blockquote>
                - Do NOT use markdown syntax (#, ##, **bold**, \`\`\`code\`\`\`, etc.)
                - Define clear learning objectives for each lesson (use a heading and bullet list)
                - Ensure lessons build upon each other in a logical progression
                - Include practical examples and exercises (you can use <h3>Example</h3>, <h3>Exercise</h3>)
                - Use clear, engaging language
                - Make content actionable and practical
                - Return clean HTML fragments without <html>, <head> or <body> tags`,
            },
            {
              role: 'user',
              content: `Create detailed lessons for this chapter:
              
              Title: ${chapterOutline.title}
              Position: ${chapterOutline.position}`,
            },
          ])

          this.logger.log(`✅ Chapter "${chapterOutline.title}" generated with ${chapter.lessons.length} lessons`)

          return chapter
        } catch (error) {
          this.logger.error(`❌ Chapter generation failed: ${error.message}`)
          throw error
        }
      },
    )
  }
}
