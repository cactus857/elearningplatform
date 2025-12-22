import { Injectable } from '@nestjs/common'
import { LessonProgressRepository } from './progress.repository'
import {
  LessonProgressResType,
  CourseProgressResType,
  MyCoursesProgressResType,
  ToggleLessonResType,
  ChapterProgressType,
} from './progress.model'
import {
  LessonNotFoundException,
  EnrollmentNotFoundException,
  CourseNotFoundException,
  NotEnrolledInCourseException,
  LessonNotCompletedException,
} from './progress.error'

@Injectable()
export class LessonProgressService {
  constructor(private lessonProgressRepository: LessonProgressRepository) {}
  // MARK LESSON AS COMPLETED
  async completeLesson(lessonId: string, studentId: string): Promise<ToggleLessonResType> {
    // 1. Kiểm tra lesson tồn tại
    const lesson = await this.lessonProgressRepository.findLessonById(lessonId)
    if (!lesson) {
      throw LessonNotFoundException
    }

    // 2. Kiểm tra student đã enroll course chứa lesson này
    const courseId = lesson.chapter.courseId
    const enrollment = await this.lessonProgressRepository.findEnrollment(studentId, courseId)
    if (!enrollment) {
      throw EnrollmentNotFoundException
    }

    // 3. Mark complete
    const lessonProgress = await this.lessonProgressRepository.markComplete({
      lessonId,
      studentId,
      enrollmentId: enrollment.id,
    })

    // 4. Tính lại progress của enrollment
    const enrollmentProgress = await this.calculateEnrollmentProgress(enrollment.id, courseId)

    // 5. Check nếu hoàn thành 100% thì update enrollment status
    const isEnrollmentCompleted = enrollmentProgress >= 100

    await this.lessonProgressRepository.updateEnrollmentProgress(enrollment.id, {
      progress: enrollmentProgress,
      status: isEnrollmentCompleted ? 'COMPLETED' : 'ACTIVE',
      completedAt: isEnrollmentCompleted ? new Date() : null,
    })

    return {
      lessonProgress,
      enrollmentProgress,
      isEnrollmentCompleted,
      message: isEnrollmentCompleted
        ? 'Congratulations! You have completed the course!'
        : 'Lesson marked as completed',
    }
  }
  // UNMARK LESSON (UNCOMPLETE)
  async uncompleteLesson(lessonId: string, studentId: string): Promise<ToggleLessonResType> {
    // 1. Kiểm tra lesson tồn tại
    const lesson = await this.lessonProgressRepository.findLessonById(lessonId)
    if (!lesson) {
      throw LessonNotFoundException
    }

    // 2. Kiểm tra student đã enroll course chứa lesson này
    const courseId = lesson.chapter.courseId
    const enrollment = await this.lessonProgressRepository.findEnrollment(studentId, courseId)
    if (!enrollment) {
      throw EnrollmentNotFoundException
    }

    // 3. Kiểm tra đã có progress và đã completed chưa
    const existingProgress = await this.lessonProgressRepository.findByStudentAndLesson(studentId, lessonId)
    if (!existingProgress || !existingProgress.isCompleted) {
      throw LessonNotCompletedException
    }

    // 4. Mark uncomplete
    const lessonProgress = await this.lessonProgressRepository.markUncomplete(studentId, lessonId)

    // 5. Tính lại progress của enrollment
    const enrollmentProgress = await this.calculateEnrollmentProgress(enrollment.id, courseId)

    // 6. Update enrollment (nếu đang COMPLETED thì chuyển về ACTIVE)
    await this.lessonProgressRepository.updateEnrollmentProgress(enrollment.id, {
      progress: enrollmentProgress,
      status: 'ACTIVE',
      completedAt: null,
    })

    return {
      lessonProgress,
      enrollmentProgress,
      isEnrollmentCompleted: false,
      message: 'Lesson unmarked',
    }
  }
  // GET LESSON PROGRESS
  async getLessonProgress(lessonId: string, studentId: string): Promise<LessonProgressResType> {
    // 1. Kiểm tra lesson tồn tại
    const lesson = await this.lessonProgressRepository.findLessonById(lessonId)
    if (!lesson) {
      throw LessonNotFoundException
    }

    // 2. Kiểm tra student đã enroll
    const courseId = lesson.chapter.courseId
    const enrollment = await this.lessonProgressRepository.findEnrollment(studentId, courseId)
    if (!enrollment) {
      throw EnrollmentNotFoundException
    }

    // 3. Lấy progress
    const progress = await this.lessonProgressRepository.findByStudentAndLessonWithLesson(studentId, lessonId)

    // 4. Trả về (nếu chưa có progress thì trả default)
    return {
      lessonId,
      studentId,
      enrollmentId: enrollment.id,
      isCompleted: progress?.isCompleted ?? false,
      completedAt: progress?.completedAt ?? null,
      lesson: {
        id: lesson.id,
        title: lesson.title,
        position: lesson.position,
      },
    }
  }
  // GET COURSE PROGRESS (Chi tiết từng lesson)
  async getCourseProgress(courseId: string, studentId: string): Promise<CourseProgressResType> {
    // 1. Kiểm tra course tồn tại
    const course = await this.lessonProgressRepository.getCourseWithChaptersAndLessons(courseId)
    if (!course) {
      throw CourseNotFoundException
    }

    // 2. Kiểm tra student đã enroll
    const enrollment = await this.lessonProgressRepository.findEnrollment(studentId, courseId)
    if (!enrollment) {
      throw NotEnrolledInCourseException
    }

    // 3. Lấy tất cả lesson progress của enrollment
    const lessonProgressList = await this.lessonProgressRepository.findByEnrollment(enrollment.id)

    // 4. Tạo map để lookup nhanh
    const progressMap = new Map(lessonProgressList.map((lp) => [lp.lessonId, lp]))

    // 5. Build response với chapters và lessons
    let totalLessons = 0
    let completedLessons = 0

    const chapters: ChapterProgressType[] = course.chapters.map((chapter) => {
      const lessons = chapter.lessons.map((lesson) => {
        totalLessons++
        const progress = progressMap.get(lesson.id)
        const isCompleted = progress?.isCompleted ?? false

        if (isCompleted) completedLessons++

        return {
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          lessonPosition: lesson.position,
          isCompleted,
          completedAt: progress?.completedAt ?? null,
        }
      })

      const chapterCompletedLessons = lessons.filter((l) => l.isCompleted).length

      return {
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        chapterPosition: chapter.position,
        totalLessons: lessons.length,
        completedLessons: chapterCompletedLessons,
        isCompleted: lessons.length > 0 && chapterCompletedLessons === lessons.length,
        lessons,
      }
    })

    const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 10000) / 100 : 0

    return {
      courseId: course.id,
      courseTitle: course.title,
      enrollmentId: enrollment.id,
      enrollmentStatus: enrollment.status,
      totalLessons,
      completedLessons,
      progressPercentage,
      isCompleted: enrollment.status === 'COMPLETED',
      completedAt: enrollment.completedAt,
      chapters,
    }
  }
  // GET MY COURSES PROGRESS (Tất cả courses đã enroll)
  async getMyCoursesProgress(studentId: string): Promise<MyCoursesProgressResType> {
    const enrollments = await this.lessonProgressRepository.findEnrollmentsByStudent(studentId)

    const data = enrollments.map((enrollment) => {
      // Đếm tổng lessons trong course
      const totalLessons = enrollment.course.chapters.reduce(
        (sum, chapter) => sum + chapter.lessons.length,
        0,
      )

      // Đếm completed lessons
      const completedLessons = enrollment.lessonProgress.length

      const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 10000) / 100 : 0

      return {
        enrollmentId: enrollment.id,
        courseId: enrollment.courseId,
        courseTitle: enrollment.course.title,
        totalLessons,
        completedLessons,
        progressPercentage,
        isCompleted: enrollment.status === 'COMPLETED',
        completedAt: enrollment.completedAt,
      }
    })

    return {
      data,
      totalItems: data.length,
    }
  }
  // HELPER: Calculate Enrollment Progress
  private async calculateEnrollmentProgress(enrollmentId: string, courseId: string): Promise<number> {
    const [completedLessons, totalLessons] = await Promise.all([
      this.lessonProgressRepository.countCompletedLessons(enrollmentId),
      this.lessonProgressRepository.countLessonsInCourse(courseId),
    ])

    if (totalLessons === 0) return 0

    return Math.round((completedLessons / totalLessons) * 10000) / 100
  }
}