import { Module } from '@nestjs/common'
import { ChapterController } from './chapter.controller'
import { ChapterService } from './chapter.service'
import { ChapterRepository } from './chapter.repository'
import { CourseRepository } from '../course/course.repository'
import { LessonRepository } from '../lesson/lesson.repository'

@Module({
  controllers: [ChapterController],
  providers: [ChapterService, ChapterRepository, CourseRepository, LessonRepository],
})
export class ChapterModule {}
