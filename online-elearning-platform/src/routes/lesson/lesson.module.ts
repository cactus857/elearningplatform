import { Module } from '@nestjs/common'
import { LessonController } from './lesson.controller'
import { LessonService } from './lesson.service'
import { LessonRepository } from './lesson.repository'
import { ChapterRepository } from '../chapter/chapter.repository'

@Module({
  controllers: [LessonController],
  providers: [LessonService, LessonRepository, ChapterRepository],
})
export class LessonModule {}
