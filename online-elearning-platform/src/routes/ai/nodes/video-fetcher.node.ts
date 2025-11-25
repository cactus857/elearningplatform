import { Injectable, Logger } from '@nestjs/common'
import { task } from '@langchain/langgraph'
import { YouTubeService } from '../integrations/youtube.service'
import { AILessonType } from '../workflows/types/schema.types'

@Injectable()
export class VideoFetcherNode {
  private readonly logger = new Logger(VideoFetcherNode.name)

  constructor(private youtubeService: YouTubeService) {}

  createTask() {
    return task('videoFetcher', async (lesson: AILessonType): Promise<AILessonType> => {
      try {
        this.logger.log(`🎥 Fetching video for lesson: ${lesson.title}`)

        const searchQuery = `${lesson.title} tutorial`

        const videoUrls = await this.youtubeService.searchVideos(searchQuery, 1)

        if (videoUrls.length > 0) {
          this.logger.log(`✅ Video found: ${videoUrls[0]}`)
          return {
            ...lesson,
            videoUrl: videoUrls[0],
          }
        } else {
          this.logger.warn(`⚠️ No video found for: ${lesson.title}`)
          return lesson // Return lesson without video
        }
      } catch (error) {
        this.logger.error(`❌ Video fetch error: ${error.message}`)
        return lesson
      }
    })
  }
}
