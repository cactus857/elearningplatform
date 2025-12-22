import { ForbiddenException, NotFoundException } from '@nestjs/common'

export const LessonNotFoundException = new NotFoundException('Lesson not found')

export const EnrollmentNotFoundException = new NotFoundException(
  'Enrollment not found. You must enroll in this course first.',
)

export const CourseNotFoundException = new NotFoundException('Course not found')

export const NotEnrolledInCourseException = new ForbiddenException('You are not enrolled in this course')

export const LessonAlreadyCompletedException = new ForbiddenException('This lesson is already marked as completed')

export const LessonNotCompletedException = new ForbiddenException('This lesson is not completed yet')