import api from "@/utils/api";
import { CourseLevel, CourseStatus } from "./course.service";
import { API_ENDPOINT } from "@/constants/endpoint";

export interface IAIChapter {
  title: string;
  position: number;
}
export interface IAICourseOutline {
  title: string;
  description: string;
  thumbnail: string;
  duration: number;
  level: CourseLevel;
  status: CourseStatus;
  category: string;
  smallDescription: string;
  requirements: string[];
  whatYouWillLearn: string[];
  chapter: IAIChapter;
}

export const aiGenerateCourse = async (
  courseTopic: string
): Promise<IAICourseOutline> => {
  const response = await api.post<IAICourseOutline>(
    API_ENDPOINT.AI_COURSE + "/generate",
    { courseTopic: courseTopic }
  );
  return response.data;
};
