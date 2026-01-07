import { API_ENDPOINT } from "@/constants/endpoint";
import api from "@/utils/api";

// Types
export interface ILessonProgress {
    lessonId: string;
    lessonTitle: string;
    lessonPosition: number;
    isCompleted: boolean;
    completedAt: string | null;
}

export interface IChapterProgress {
    chapterId: string;
    chapterTitle: string;
    chapterPosition: number;
    totalLessons: number;
    completedLessons: number;
    isCompleted: boolean;
    lessons: ILessonProgress[];
}

export interface ICourseProgress {
    courseId: string;
    courseTitle: string;
    enrollmentId: string;
    enrollmentStatus: string;
    totalLessons: number;
    completedLessons: number;
    progressPercentage: number;
    isCompleted: boolean;
    completedAt: string | null;
    chapters: IChapterProgress[];
}

export interface IProgressSummary {
    enrollmentId: string;
    courseId: string;
    courseTitle: string;
    totalLessons: number;
    completedLessons: number;
    progressPercentage: number;
    isCompleted: boolean;
    completedAt: string | null;
}

export interface IMyCoursesProgress {
    data: IProgressSummary[];
    totalItems: number;
}

export interface IToggleLessonResponse {
    lessonProgress: {
        id: string;
        lessonId: string;
        studentId: string;
        enrollmentId: string;
        isCompleted: boolean;
        completedAt: string | null;
    };
    enrollmentProgress: number;
    isEnrollmentCompleted: boolean;
    message: string;
}

// API Calls

/**
 * Get progress for all enrolled courses
 */
export const getMyCoursesProgress = async (): Promise<IMyCoursesProgress> => {
    const response = await api.get<IMyCoursesProgress>(
        `${API_ENDPOINT.LESSON_PROGRESS}/my-courses`
    );
    return response.data;
};

/**
 * Get detailed progress for a specific course
 */
export const getCourseProgress = async (
    courseId: string
): Promise<ICourseProgress> => {
    const response = await api.get<ICourseProgress>(
        `${API_ENDPOINT.LESSON_PROGRESS}/course/${courseId}`
    );
    return response.data;
};

/**
 * Get progress for a specific lesson
 */
export const getLessonProgress = async (
    lessonId: string
): Promise<{
    lessonId: string;
    studentId: string;
    enrollmentId: string;
    isCompleted: boolean;
    completedAt: string | null;
    lesson: {
        id: string;
        title: string;
        position: number;
    };
}> => {
    const response = await api.get(
        `${API_ENDPOINT.LESSON_PROGRESS}/${lessonId}`
    );
    return response.data;
};

/**
 * Mark a lesson as completed
 */
export const completeLesson = async (
    lessonId: string
): Promise<IToggleLessonResponse> => {
    const response = await api.post<IToggleLessonResponse>(
        `${API_ENDPOINT.LESSON_PROGRESS}/${lessonId}/complete`
    );
    return response.data;
};

/**
 * Unmark a lesson (uncomplete)
 */
export const uncompleteLesson = async (
    lessonId: string
): Promise<IToggleLessonResponse> => {
    const response = await api.post<IToggleLessonResponse>(
        `${API_ENDPOINT.LESSON_PROGRESS}/${lessonId}/uncomplete`
    );
    return response.data;
};
