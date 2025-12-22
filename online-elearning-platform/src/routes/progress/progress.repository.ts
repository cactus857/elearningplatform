import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import { LessonProgressType } from './progress.model'

@Injectable()
export class LessonProgressRepository {
  constructor(private prismaService: PrismaService) {}
  // LESSON PROGRESS CRUD
  async findByStudentAndLesson(studentId: string, lessonId: string) {
    return this.prismaService.lessonProgress.findUnique({
      where: {
        studentId_lessonId: {
          studentId,
          lessonId,
        },
      },
    })
  }

  async findByStudentAndLessonWithLesson(studentId: string, lessonId: string) {
    return this.prismaService.lessonProgress.findUnique({
      where: {
        studentId_lessonId: {
          studentId,
          lessonId,
        },
      },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            position: true,
          },
        },
      },
    })
  }

  async findByEnrollment(enrollmentId: string) {
    return this.prismaService.lessonProgress.findMany({
      where: { enrollmentId },
    })
  }

  async markComplete(data: {
    lessonId: string
    studentId: string
    enrollmentId: string
  }): Promise<LessonProgressType> {
    return this.prismaService.lessonProgress.upsert({
      where: {
        studentId_lessonId: {
          studentId: data.studentId,
          lessonId: data.lessonId,
        },
      },
      create: {
        lessonId: data.lessonId,
        studentId: data.studentId,
        enrollmentId: data.enrollmentId,
        isCompleted: true,
        completedAt: new Date(),
      },
      update: {
        isCompleted: true,
        completedAt: new Date(),
      },
    })
  }

  async markUncomplete(studentId: string, lessonId: string): Promise<LessonProgressType> {
    return this.prismaService.lessonProgress.update({
      where: {
        studentId_lessonId: {
          studentId,
          lessonId,
        },
      },
      data: {
        isCompleted: false,
        completedAt: null,
      },
    })
  }

  async countCompletedLessons(enrollmentId: string): Promise<number> {
    return this.prismaService.lessonProgress.count({
      where: {
        enrollmentId,
        isCompleted: true,
      },
    })
  }
  // LESSON QUERIES
  async findLessonById(lessonId: string) {
    return this.prismaService.lesson.findUnique({
      where: { id: lessonId, deletedAt: null },
      include: {
        chapter: {
          select: {
            id: true,
            title: true,
            courseId: true,
          },
        },
      },
    })
  }

  async countLessonsInCourse(courseId: string): Promise<number> {
    return this.prismaService.lesson.count({
      where: {
        deletedAt: null,
        chapter: {
          courseId,
          deletedAt: null,
        },
      },
    })
  }
  // ENROLLMENT QUERIES
  async findEnrollment(studentId: string, courseId: string) {
    return this.prismaService.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
    })
  }

  async findEnrollmentsByStudent(studentId: string) {
    return this.prismaService.enrollment.findMany({
      where: { studentId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            chapters: {
              where: { deletedAt: null },
              select: {
                lessons: {
                  where: { deletedAt: null },
                  select: { id: true },
                },
              },
            },
          },
        },
        lessonProgress: {
          where: { isCompleted: true },
          select: { id: true },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    })
  }

  async updateEnrollmentProgress(
    enrollmentId: string,
    data: {
      progress: number
      status?: 'ACTIVE' | 'COMPLETED' | 'DROPPED'
      completedAt?: Date | null
    },
  ) {
    return this.prismaService.enrollment.update({
      where: { id: enrollmentId },
      data: {
        progress: data.progress,
        status: data.status,
        completedAt: data.completedAt,
      },
    })
  }
  // COURSE QUERIES
  async getCourseWithChaptersAndLessons(courseId: string) {
    return this.prismaService.course.findUnique({
      where: { id: courseId, deletedAt: null },
      include: {
        chapters: {
          where: { deletedAt: null },
          orderBy: { position: 'asc' },
          include: {
            lessons: {
              where: { deletedAt: null },
              orderBy: { position: 'asc' },
              select: {
                id: true,
                title: true,
                position: true,
              },
            },
          },
        },
      },
    })
  }
}