import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
  CreateLessonBodyType,
  GetLessonDetailResType,
  GetLessonsResType,
  LessonType,
  UpdateLessonBodyType,
} from './lesson.model'

@Injectable()
export class LessonRepository {
  constructor(private prismaService: PrismaService) {}

  async list(chapterId: string): Promise<GetLessonsResType> {
    const data = await this.prismaService.lesson.findMany({
      where: {
        chapterId,
        deletedAt: null,
      },
      orderBy: {
        position: 'asc',
      },
    })

    return { data }
  }

  async findById(id: string): Promise<GetLessonDetailResType | null> {
    return this.prismaService.lesson.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        chapter: {
          select: {
            id: true,
            title: true,
            courseId: true,
            course: {
              select: {
                id: true,
                title: true,
                instructorId: true,
              },
            },
          },
        },
      },
    })
  }

  async create({ data }: { data: CreateLessonBodyType & { position: number } }): Promise<LessonType> {
    return this.prismaService.lesson.create({
      data: {
        ...data,
        deletedAt: null,
      },
    })
  }

  async update({ id, data }: { id: string; data: UpdateLessonBodyType }): Promise<LessonType> {
    return this.prismaService.lesson.update({
      where: {
        id,
        deletedAt: null,
      },
      data,
    })
  }

  async delete({ id }: { id: string }): Promise<LessonType> {
    return this.prismaService.lesson.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    })
  }

  async getMaxPosition(chapterId: string): Promise<number> {
    const result = await this.prismaService.lesson.findFirst({
      where: {
        chapterId,
        deletedAt: null,
      },
      orderBy: {
        position: 'desc',
      },
      select: {
        position: true,
      },
    })

    return result?.position ?? 0
  }

  async updateManyPositions(updates: Array<{ id: string; position: number }>): Promise<void> {
    await this.prismaService.$transaction(
      updates.map((update) =>
        this.prismaService.lesson.update({
          where: { id: update.id },
          data: { position: update.position },
        }),
      ),
    )
  }

  async checkLessonBelongsToChapter(lessonId: string, chapterId: string): Promise<boolean> {
    const lesson = await this.prismaService.lesson.findFirst({
      where: {
        id: lessonId,
        chapterId,
        deletedAt: null,
      },
    })
    return !!lesson
  }
}
