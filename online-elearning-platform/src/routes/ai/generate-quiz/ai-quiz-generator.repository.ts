import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import { SaveGeneratedQuizBodyType } from './ai-quiz-generator.model'

@Injectable()
export class AiQuizGeneratorRepository {
  constructor(private prismaService: PrismaService) {}

  /**
   * Get course with chapters and lessons content
   */
  async getCourseWithContent(courseId: string, chapterIds?: string[]) {
    return this.prismaService.course.findUnique({
      where: {
        id: courseId,
        deletedAt: null,
      },
      include: {
        chapters: {
          where: {
            deletedAt: null,
            ...(chapterIds && chapterIds.length > 0 ? { id: { in: chapterIds } } : {}),
          },
          orderBy: {
            position: 'asc',
          },
          include: {
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
                content: true,
              },
            },
          },
        },
      },
    })
  }

  /**
   * Save generated quiz to database
   */
  async saveGeneratedQuiz(data: SaveGeneratedQuizBodyType, createdById: string) {
    return this.prismaService.$transaction(async (tx) => {
      // 1. Create quiz
      const quiz = await tx.quiz.create({
        data: {
          title: data.title,
          courseId: data.courseId,
          chapterId: data.chapterId || null,
          timeLimitMinutes: data.timeLimitMinutes || null,
          passingScore: data.passingScore,
          shuffleQuestions: data.shuffleQuestions,
          shuffleOptions: data.shuffleOptions,
          showCorrectAnswers: data.showCorrectAnswers,
          deletedAt: null,
        },
      })

      // 2. Create questions
      await tx.question.createMany({
        data: data.questions.map((q) => ({
          quizId: quiz.id,
          text: q.text,
          options: q.options,
          correctAnswerIndex: q.correctAnswerIndex,
        })),
      })

      return quiz
    })
  }

  /**
   * Check if user has permission to create quiz for this course
   */
  async checkCourseOwnership(courseId: string, userId: string): Promise<boolean> {
    const course = await this.prismaService.course.findFirst({
      where: {
        id: courseId,
        instructorId: userId,
        deletedAt: null,
      },
    })

    return !!course
  }
}
