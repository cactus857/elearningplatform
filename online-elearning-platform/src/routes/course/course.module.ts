import { Module } from '@nestjs/common'
import { CourseController } from './course.controller'
import { CourseRepository } from './course.repository'
import { CourseService } from './course.service'
import { BullModule } from '@nestjs/bullmq'
import { QUEUE_NAMES } from 'src/shared/constants/queue.constant'

@Module({
  imports: [BullModule.registerQueue({
    name: QUEUE_NAMES.ELASTICSEARCH,
  })],
  controllers: [CourseController],
  providers: [CourseService, CourseRepository],
})
export class CourseModule {}
