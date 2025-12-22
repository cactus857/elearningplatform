import { Module } from '@nestjs/common'
import { LessonProgressController } from './progress.controller'
import { LessonProgressService } from './progress.service'
import { LessonProgressRepository } from './progress.repository'

@Module({
  controllers: [LessonProgressController],
  providers: [LessonProgressService, LessonProgressRepository],
  exports: [LessonProgressService],
})
export class ProgressModule {}