import { ForbiddenException, NotFoundException } from '@nestjs/common'

export const QuizNotAccessibleException = new ForbiddenException('You must enroll in this course to access the quiz')

export const QuizNotAvailableException = (reason: string) => new ForbiddenException(reason)

export const AttemptNotFoundException = new NotFoundException('Attempt not found')

export const AttemptExpiredException = new ForbiddenException(
  'Your attempt has expired. The time limit has been exceeded.',
)
