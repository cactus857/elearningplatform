import { Annotation } from "@langchain/langgraph";
import { z } from "zod";

export const CourseStateSchema = z.object({
  title: z.string(),
  description: z.string(),
  chapterCount: z.number(),

  outline: z.array(z.string()).optional(),
  chapters: z
    .array(
      z.object({
        title: z.string(),
        content: z.string(),
      })
    )
    .optional(),
  summary: z.string().optional(),
});

export type CourseState = z.infer<typeof CourseStateSchema>;

export const CourseStateAnnotation = Annotation.Root({
  title: Annotation<string>,
  description: Annotation<string>,
  chapterCount: Annotation<number>,
  outline: Annotation<string[]>,
  chapters: Annotation<{ title: string; content: string }[]>,
  summary: Annotation<string>,
});

export type CourseStateAnnotationType = typeof CourseStateAnnotation.State;
