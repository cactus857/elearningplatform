import { Injectable, Logger } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'

import envConfig from 'src/shared/config'
import { firstValueFrom } from 'rxjs'

@Injectable()
export class GuruLabService {
  private readonly logger = new Logger(GuruLabService.name)
  private readonly apiUrl: string
  private readonly apiKey: string

  constructor(private readonly httpService: HttpService) {
    this.apiUrl = envConfig.AIGURU_API_URL + '/api/generate-image'
    this.apiKey = envConfig.AIGURU_API_KEY
  }

  async generateImage(prompt: string): Promise<string | null> {
    try {
      this.logger.log(`Generating image with prompt: ${prompt.substring(0, 50)}...`)

      const response = await firstValueFrom(
        this.httpService.post(
          this.apiUrl,
          {
            width: 1024,
            height: 1024,
            input: prompt,
            model: 'flux',
            aspectRatio: '16:9',
          },
          {
            headers: {
              'x-api-key': this.apiKey,
              'Content-Type': 'application/json',
            },
          },
        ),
      )

      const imageUrl = response.data.image
      this.logger.log(`Image generated successfully: ${imageUrl}`)
      return imageUrl
    } catch (error) {
      this.logger.error(`Guru Lab Tech API error: ${error.message}`)
      return null
    }
  }
}
