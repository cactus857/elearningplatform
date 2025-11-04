import { UnprocessableEntityException } from '@nestjs/common'

export const CourseSlugExistsException = new UnprocessableEntityException([
  {
    message: 'Course with this title already exists',
    path: 'title',
  },
])
