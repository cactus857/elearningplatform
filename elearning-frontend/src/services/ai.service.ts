import api from "@/utils/api";
import { CourseLevel, CourseStatus } from "./course.service";
import { API_ENDPOINT } from "@/constants/endpoint";

export interface IAILesson {
  title: string;
  position: number;
  videoUrl: string | null;
  duration: number | null;
  content: string;
}

export interface IAIChapter {
  title: string;
  position: number;
  lessons: IAILesson[];
}

export interface IAICourseOutline {
  title: string;
  description: string;
  thumbnail?: string | null;
  duration: number;
  level: CourseLevel;
  status: CourseStatus;
  category: string;
  smallDescription: string;
  requirements: string[];
  whatYouWillLearn: string[];
  chapters: IAIChapter[];
}

export interface IAISaveCourseResponse {
  courseId: string;
  message: string;
}

export const aiGenerateCourse = async (
  courseTopic: string
): Promise<{ success: boolean; data: IAICourseOutline }> => {
  const response = await api.post<{ success: boolean; data: IAICourseOutline }>(
    API_ENDPOINT.AI_COURSE + "/generate",
    { courseTopic: courseTopic }
  );
  return response.data;
};

export const aiSaveCourse = async (
  courseData: IAICourseOutline
): Promise<IAISaveCourseResponse> => {
  const response = await api.post<IAISaveCourseResponse>(
    API_ENDPOINT.AI_COURSE + "/save",
    courseData
  );
  return response.data;
};

export const aiRefineCourse = async (
  currentCourse: IAICourseOutline,
  refinementPrompt: string
): Promise<{ success: boolean; data: IAICourseOutline }> => {
  const response = await api.post<{ success: boolean; data: IAICourseOutline }>(
    API_ENDPOINT.AI_COURSE + "/refine",
    { currentCourse, refinementPrompt }
  );
  return response.data;
};

// ==================== AI GENERATE QUIZ ====================

export type QuizDifficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type QuestionDifficulty = "EASY" | "MEDIUM" | "HARD";

export interface IGenerateQuizFromCourseBody {
  courseId: string;
  chapterIds?: string[]; // If empty, use all chapters
  numberOfQuestions: number; // 1-50
  difficulty: QuizDifficulty;
}

export interface IQuizQuestion {
  text: string;
  options: string[]; // 2-6 options
  correctAnswerIndex: number;
  explanation?: string;
  difficulty: QuestionDifficulty;
  topic: string;
}

export interface IGeneratedQuiz {
  title: string;
  description: string;
  timeLimitMinutes: number | null;
  passingScore: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showCorrectAnswers: boolean;
  questions: IQuizQuestion[];
}

export interface ISaveQuizBody {
  title: string;
  courseId: string;
  chapterId?: string | null;
  timeLimitMinutes?: number | null;
  passingScore: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showCorrectAnswers: boolean;
  availableFrom?: string | null;
  availableTo?: string | null;
  maxAttempts?: number | null;
  questions: Array<{
    text: string;
    options: string[];
    correctAnswerIndex: number;
    explanation?: string;
  }>;
}

export interface ISaveQuizResponse {
  quizId: string;
  message: string;
}

/**
 * Generate quiz from course content using AI
 * @param data - Course ID, chapters, number of questions, difficulty
 * @returns Generated quiz with questions
 */
export const aiGenerateQuizFromCourse = async (
  data: IGenerateQuizFromCourseBody
): Promise<IGeneratedQuiz> => {
  const response = await api.post<IGeneratedQuiz>(
    API_ENDPOINT.AI_QUIZ + "/generate-from-course",
    data
  );
  return response.data;
};

/**
 * Save generated quiz to database
 * @param data - Quiz data with questions
 * @returns Quiz ID and success message
 */
export const aiSaveQuiz = async (
  data: ISaveQuizBody
): Promise<ISaveQuizResponse> => {
  const response = await api.post<ISaveQuizResponse>(
    API_ENDPOINT.AI_QUIZ + "/save",
    data
  );
  return response.data;
};
