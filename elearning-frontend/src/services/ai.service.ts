// services/ai.service.ts
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
