import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import { SaveGeneratedCourseBodyType } from './ai-course-generator.model'

@Injectable()
export class AiCourseGeneratorRepository {
  constructor(private prismaService: PrismaService) {}

  async saveGeneratedCourse(data: SaveGeneratedCourseBodyType, instructorId: string, createdById: string) {
    return this.prismaService.$transaction(async (tx) => {
      // 1. Tạo course
      const course = await tx.course.create({
        data: {
          title: data.title,
          description: data.description,
          thumbnail: data.thumbnail,
          duration: data.duration,
          level: data.level,
          status: data.status,
          category: data.category,
          smallDescription: data.smallDescription,
          requirements: data.requirements,
          whatYouWillLearn: data.whatYouWillLearn,
          instructorId: instructorId,
          createdById: createdById,
          slug: this.generateSlug(data.title),
          deletedAt: null,
        },
      })

      // 2. Tạo chapters và lessons
      for (const chapterData of data.chapters) {
        const chapter = await tx.chapter.create({
          data: {
            title: chapterData.title,
            position: chapterData.position,
            courseId: course.id,
            deletedAt: null,
          },
        })

        // 3. Tạo lessons cho mỗi chapter
        for (const lessonData of chapterData.lessons) {
          await tx.lesson.create({
            data: {
              title: lessonData.title,
              position: lessonData.position,
              videoUrl: lessonData.videoUrl,
              duration: lessonData.duration,
              content: lessonData.content,
              chapterId: chapter.id,
              deletedAt: null,
            },
          })
        }
      }

      return course
    })
  }

  private generateSlug(title: string): string {
    const timestamp = Date.now()
    const slug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    return `${slug}-${timestamp}`
  }
}
