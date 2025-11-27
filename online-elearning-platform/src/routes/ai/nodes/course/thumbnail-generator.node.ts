import { Injectable, Logger } from '@nestjs/common'
import { GuruLabService } from '../../integrations/gurulab.service'
import { task } from '@langchain/langgraph'

@Injectable()
export class ThumbnailGeneratorNode {
  private readonly logger = new Logger(ThumbnailGeneratorNode.name)

  constructor(private guruLabService: GuruLabService) {}
  createTask() {
    return task('thumbnailGenerator', async (thumbnailPrompt: string): Promise<string> => {
      try {
        this.logger.log(`🎨 Generating thumbnail...`)
        this.logger.log(`Prompt: ${thumbnailPrompt.substring(0, 100)}...`)

        const thumbnailUrl = await this.guruLabService.generateImage(thumbnailPrompt)

        if (!thumbnailUrl) {
          this.logger.warn(`⚠️ Thumbnail generation failed, using default`)
          return ''
        }

        this.logger.log(`✅ Thumbnail generated: ${thumbnailUrl}`)
        return thumbnailUrl
      } catch (error) {
        this.logger.error(`❌ Thumbnail generation error: ${error.message}`)
        return ''
      }
    })
  }
}
