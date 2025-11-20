import { z } from "zod";
import { courseGraph } from "../graphs/generate-course/graph.js";

// Input schema để MCP validate
export const GenerateCourseInputSchema = z.object({
  title: z.string(),
  description: z.string(),
  chapterCount: z.number(),
});

// Hàm thực thi tool
export const generateCourseTool = {
  name: "generate_course",
  description: "Tạo khóa học tự động bằng LangGraph",
  inputSchema: GenerateCourseInputSchema,
  execute: async (input: unknown) => {
    const parsed = GenerateCourseInputSchema.parse(input);
    const result = await courseGraph.invoke(parsed);
    return result;
  },
};
