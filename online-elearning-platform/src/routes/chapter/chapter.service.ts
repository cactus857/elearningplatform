import { ForbiddenException, Injectable } from '@nestjs/common'
import { ChapterRepository } from './chapter.repository'
import {
  ChapterType,
  CreateChapterBodyType,
  GetChaptersResType,
  ReorderChaptersBodyType,
  UpdateChapterBodyType,
} from './chapter.model'
import { isNotFoundPrismaError } from 'src/shared/helper'
import { NotFoundRecordException } from 'src/shared/error'
import { RoleName } from 'src/shared/constants/role.constants'
import { CourseRepository } from '../course/course.repository'
import { LessonRepository } from '../lesson/lesson.repository'

@Injectable()
export class ChapterService {
  constructor(
    private chapterRepository: ChapterRepository,
    private lessonRepository: LessonRepository,
    private courseRepository: CourseRepository,
  ) {}

  async list(courseId: string): Promise<GetChaptersResType> {
    // Kiểm tra course có tồn tại không
    const course = await this.courseRepository.findById(courseId)
    if (!course) throw NotFoundRecordException

    return this.chapterRepository.list(courseId)
  }

  async findById(id: string) {
    const chapter = await this.chapterRepository.findById(id)
    if (!chapter) throw NotFoundRecordException
    return chapter
  }

  async create({
    data,
    userId,
    userRoleName,
  }: {
    data: CreateChapterBodyType
    userId: string
    userRoleName: string
  }): Promise<ChapterType> {
    try {
      // Kiểm tra course có tồn tại không
      const course = await this.courseRepository.findById(data.courseId)
      if (!course) throw NotFoundRecordException

      // Kiểm tra quyền: Admin hoặc Instructor owner
      if (userRoleName === RoleName.Instructor && course.instructorId !== userId) {
        throw new ForbiddenException('You can only create chapters for your own courses')
      }

      // Nếu không có position, tự động tính
      let position = data.position
      if (!position) {
        const maxPosition = await this.chapterRepository.getMaxPosition(data.courseId)
        position = maxPosition + 1
      }

      return await this.chapterRepository.create({
        data: {
          ...data,
          position,
        },
      })
    } catch (error) {
      throw error
    }
  }

  async update({
    id,
    data,
    userId,
    userRoleName,
  }: {
    id: string
    data: UpdateChapterBodyType
    userId: string
    userRoleName: string
  }) {
    try {
      // Kiểm tra chapter có tồn tại không
      const chapter = await this.chapterRepository.findById(id)
      if (!chapter) throw NotFoundRecordException

      // Kiểm tra quyền: Admin hoặc Instructor owner
      if (userRoleName === RoleName.Instructor && chapter?.course?.instructorId !== userId) {
        throw new ForbiddenException('You can only update chapters of your own courses')
      }

      return await this.chapterRepository.update({ id, data })
    } catch (error) {
      if (isNotFoundPrismaError(error)) throw NotFoundRecordException
      throw error
    }
  }

  async delete({ id, userId, userRoleName }: { id: string; userId: string; userRoleName: string }) {
    try {
      // Kiểm tra chapter có tồn tại không
      const chapter = await this.chapterRepository.findById(id)
      if (!chapter) throw NotFoundRecordException

      // Kiểm tra quyền: Admin hoặc Instructor owner
      if (userRoleName === RoleName.Instructor && chapter?.course?.instructorId !== userId) {
        throw new ForbiddenException('You can only delete chapters of your own courses')
      }

      // Xoá tất cả lessons thuộc chapter này
      await this.lessonRepository.deleteByChapterId(id)

      await this.chapterRepository.delete({ id })
      return { message: 'Chapter deleted successfully' }
    } catch (error) {
      if (isNotFoundPrismaError(error)) throw NotFoundRecordException
      throw error
    }
  }

  async reorder({
    data,
    userId,
    userRoleName,
  }: {
    data: ReorderChaptersBodyType
    userId: string
    userRoleName: string
  }) {
    try {
      // Kiểm tra course có tồn tại không
      const course = await this.courseRepository.findById(data.courseId)
      if (!course) throw NotFoundRecordException

      // Kiểm tra quyền: Admin hoặc Instructor owner
      if (userRoleName === RoleName.Instructor && course.instructorId !== userId) {
        throw new ForbiddenException('You can only reorder chapters of your own courses')
      }

      // Kiểm tra tất cả chapters có thuộc về course này không
      for (const chapter of data.chapters) {
        const belongs = await this.chapterRepository.checkChapterBelongsToCourse(chapter.id, data.courseId)
        if (!belongs) {
          throw new ForbiddenException(`Chapter ${chapter.id} does not belong to this course`)
        }
      }

      // Update positions
      await this.chapterRepository.updateManyPositions(data.chapters)

      return { message: 'Chapters reordered successfully' }
    } catch (error) {
      throw error
    }
  }
}
