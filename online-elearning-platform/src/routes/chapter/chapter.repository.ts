import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
  ChapterType,
  CreateChapterBodyType,
  GetChapterDetailResType,
  GetChaptersResType,
  UpdateChapterBodyType,
} from './chapter.model'

@Injectable()
export class ChapterRepository {
  constructor(private prismaService: PrismaService) {}

  async list(courseId: string): Promise<GetChaptersResType> {
    const data = await this.prismaService.chapter.findMany({
      where: {
        courseId,
        deletedAt: null,
      },
      orderBy: {
        position: 'asc',
      },
      include: {
        _count: {
          select: {
            lessons: true,
          },
        },
      },
    })

    return { data }
  }

  async findById(id: string): Promise<GetChapterDetailResType | null> {
    return this.prismaService.chapter.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            thumbnail: true,
            instructorId: true,
          },
        },
        lessons: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            position: 'asc',
          },
          select: {
            id: true,
            title: true,
            position: true,
            videoUrl: true,
            documentUrl: true,
            duration: true,
          },
        },
      },
    })
  }

  async create({ data }: { data: CreateChapterBodyType & { position: number } }): Promise<ChapterType> {
    return this.prismaService.chapter.create({
      data: {
        ...data,
        deletedAt: null,
      },
    })
  }

  async update({ id, data }: { id: string; data: UpdateChapterBodyType }): Promise<ChapterType> {
    return this.prismaService.chapter.update({
      where: {
        id,
        deletedAt: null,
      },
      data,
    })
  }

  async delete({ id }: { id: string }): Promise<ChapterType> {
    return this.prismaService.chapter.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    })
  }

  async getMaxPosition(courseId: string): Promise<number> {
    const result = await this.prismaService.chapter.findFirst({
      where: {
        courseId,
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
        this.prismaService.chapter.update({
          where: { id: update.id },
          data: { position: update.position },
        }),
      ),
    )
  }

  async checkChapterBelongsToCourse(chapterId: string, courseId: string): Promise<boolean> {
    const chapter = await this.prismaService.chapter.findFirst({
      where: {
        id: chapterId,
        courseId,
        deletedAt: null,
      },
    })
    return !!chapter
  }
}
