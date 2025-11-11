import { Module } from '@nestjs/common'
import { QuizController } from './quizz.controller'
import { QuizService } from './quizz.service'
import { QuizRepository } from './quizz.repository'

import { CourseRepository } from '../course/course.repository'
import { EnrollmentRepository } from '../enrollment/enrollment.repository'

@Module({
  controllers: [QuizController],
  providers: [QuizService, QuizRepository, CourseRepository, EnrollmentRepository],
})
export class QuizzModule {}
