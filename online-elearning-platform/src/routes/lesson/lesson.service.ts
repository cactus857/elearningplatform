import { ForbiddenException, Injectable } from '@nestjs/common'
import { LessonRepository } from './lesson.repository'
import { CreateLessonBodyType, ReorderLessonsBodyType, UpdateLessonBodyType } from './lesson.model'
import { isNotFoundPrismaError } from 'src/shared/helper'
import { NotFoundRecordException } from 'src/shared/error'
import { RoleName } from 'src/shared/constants/role.constants'
import { ChapterRepository } from '../chapter/chapter.repository'

@Injectable()
export class LessonService {
  constructor(
    private lessonRepository: LessonRepository,
    private chapterRepository: ChapterRepository,
  ) {}

  async list(chapterId: string) {
    // Kiểm tra chapter có tồn tại không
    const chapter = await this.chapterRepository.findById(chapterId)
    if (!chapter) throw NotFoundRecordException

    return this.lessonRepository.list(chapterId)
  }

  async findById(id: string) {
    const lesson = await this.lessonRepository.findById(id)
    if (!lesson) throw NotFoundRecordException
    return lesson
  }

  async create({ data, userId, userRoleName }: { data: CreateLessonBodyType; userId: string; userRoleName: string }) {
    try {
      // Kiểm tra chapter có tồn tại không
      const chapter = await this.chapterRepository.findById(data.chapterId)
      if (!chapter) throw NotFoundRecordException

      // Kiểm tra quyền: Admin hoặc Instructor owner
      if (userRoleName === RoleName.Instructor && chapter?.course?.instructorId !== userId) {
        throw new ForbiddenException('You can only create lessons for your own courses')
      }

      // Nếu không có position, tự động tính
      let position = data.position
      if (!position) {
        const maxPosition = await this.lessonRepository.getMaxPosition(data.chapterId)
        position = maxPosition + 1
      }

      return await this.lessonRepository.create({
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
    data: UpdateLessonBodyType
    userId: string
    userRoleName: string
  }) {
    try {
      // Kiểm tra lesson có tồn tại không
      const lesson = await this.lessonRepository.findById(id)
      if (!lesson) throw NotFoundRecordException

      // Kiểm tra quyền: Admin hoặc Instructor owner
      if (userRoleName === RoleName.Instructor && lesson.chapter?.course?.instructorId !== userId) {
        throw new ForbiddenException('You can only update lessons of your own courses')
      }

      return await this.lessonRepository.update({ id, data })
    } catch (error) {
      if (isNotFoundPrismaError(error)) throw NotFoundRecordException
      throw error
    }
  }

  async delete({ id, userId, userRoleName }: { id: string; userId: string; userRoleName: string }) {
    try {
      // Kiểm tra lesson có tồn tại không
      const lesson = await this.lessonRepository.findById(id)
      if (!lesson) throw NotFoundRecordException

      // Kiểm tra quyền: Admin hoặc Instructor owner
      if (userRoleName === RoleName.Instructor && lesson.chapter?.course?.instructorId !== userId) {
        throw new ForbiddenException('You can only delete lessons of your own courses')
      }

      await this.lessonRepository.delete({ id })
      return { message: 'Lesson deleted successfully' }
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
    data: ReorderLessonsBodyType
    userId: string
    userRoleName: string
  }) {
    try {
      // Kiểm tra chapter có tồn tại không
      const chapter = await this.chapterRepository.findById(data.chapterId)
      if (!chapter) throw NotFoundRecordException

      // Kiểm tra quyền: Admin hoặc Instructor owner
      if (userRoleName === RoleName.Instructor && chapter?.course?.instructorId !== userId) {
        throw new ForbiddenException('You can only reorder lessons of your own courses')
      }

      // Kiểm tra tất cả lessons có thuộc về chapter này không
      for (const lesson of data.lessons) {
        const belongs = await this.lessonRepository.checkLessonBelongsToChapter(lesson.id, data.chapterId)
        if (!belongs) {
          throw new ForbiddenException(`Lesson ${lesson.id} does not belong to this chapter`)
        }
      }

      // Update positions
      await this.lessonRepository.updateManyPositions(data.lessons)

      return { message: 'Lessons reordered successfully' }
    } catch (error) {
      throw error
    }
  }
}
