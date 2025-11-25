import { Injectable, Logger } from '@nestjs/common'
import { google } from 'googleapis'
import envConfig from 'src/shared/config'

@Injectable()
export class YouTubeService {
  private readonly logger = new Logger(YouTubeService.name)
  private youtube
  constructor() {
    this.youtube = google.youtube({
      version: 'v3',
      auth: envConfig.YOUTUBE_API_KEY,
    })
  }

  async searchVideos(query: string, maxResults: number = 3): Promise<string[]> {
    try {
      this.logger.log(`Searching for videos with query: ${query}`)

      const response = await this.youtube.search.list({
        part: ['snippet'],
        q: query,
        maxResults,
        type: 'video',
        videoEmbeddable: 'true',
      })

      const videoIds = response.data.items?.map((item) => `https://www.youtube.com/watch?v=${item.id?.videoId}`) || []

      this.logger.log(`Found ${videoIds.length} videos`)
      return videoIds
    } catch (error) {
      this.logger.error(`YouTube API error: ${error.message}`)
      return []
    }
  }

  async getVideoDetails(videoId: string) {
    try {
      const response = await this.youtube.videos.list({
        part: ['snippet', 'contentDetails', 'statistics'],
        id: videoId,
      })

      return response.data.items?.[0] || null
    } catch (error) {
      this.logger.error(`YouTube API error: ${error.message}`)
      return null
    }
  }
}
