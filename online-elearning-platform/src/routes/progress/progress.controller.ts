import { Controller, Get, Param, Post } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { LessonProgressService } from './progress.service'
import {
  LessonProgressParamsDTO,
  CourseProgressParamsDTO,
  LessonProgressResDTO,
  CourseProgressResDTO,
  MyCoursesProgressResDTO,
  ToggleLessonResDTO,
} from './progress.dto'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'

@Controller('lesson-progress')
export class LessonProgressController {
  constructor(private readonly lessonProgressService: LessonProgressService) {}

  // GET MY COURSES PROGRESS
  // GET /lesson-progress/my-courses
  @Get('my-courses')
  @ZodSerializerDto(MyCoursesProgressResDTO)
  getMyCoursesProgress(@ActiveUser('userId') studentId: string) {
    return this.lessonProgressService.getMyCoursesProgress(studentId)
  }

  // GET COURSE PROGRESS 
  // GET /lesson-progress/course/:courseId
  @Get('course/:courseId')
  @ZodSerializerDto(CourseProgressResDTO)
  getCourseProgress(
    @Param() params: CourseProgressParamsDTO,
    @ActiveUser('userId') studentId: string,
  ) {
    return this.lessonProgressService.getCourseProgress(params.courseId, studentId)
  }

  // GET LESSON PROGRESS
  // GET /lesson-progress/:lessonId
  @Get(':lessonId')
  @ZodSerializerDto(LessonProgressResDTO)
  getLessonProgress(
    @Param() params: LessonProgressParamsDTO,
    @ActiveUser('userId') studentId: string,
  ) {
    return this.lessonProgressService.getLessonProgress(params.lessonId, studentId)
  }

  // MARK LESSON AS COMPLETED
  // POST /lesson-progress/:lessonId/complete
  @Post(':lessonId/complete')
  @ZodSerializerDto(ToggleLessonResDTO)
  completeLesson(
    @Param() params: LessonProgressParamsDTO,
    @ActiveUser('userId') studentId: string,
  ) {
    return this.lessonProgressService.completeLesson(params.lessonId, studentId)
  }
  
  // UNMARK LESSON (UNCOMPLETE)
  // POST /lesson-progress/:lessonId/uncomplete
  @Post(':lessonId/uncomplete')
  @ZodSerializerDto(ToggleLessonResDTO)
  uncompleteLesson(
    @Param() params: LessonProgressParamsDTO,
    @ActiveUser('userId') studentId: string,
  ) {
    return this.lessonProgressService.uncompleteLesson(params.lessonId, studentId)
  }
}