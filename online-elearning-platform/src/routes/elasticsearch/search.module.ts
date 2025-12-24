import { Module } from '@nestjs/common'
import { SearchController } from './search.controller'
import { BullModule } from '@nestjs/bullmq'
import { QUEUE_NAMES } from 'src/shared/constants/queue.constant'

@Module({imports: [
    BullModule.registerQueue({
      name: QUEUE_NAMES.ELASTICSEARCH,
    }),
  ],
  controllers: [SearchController],
})
export class SearchModule {}