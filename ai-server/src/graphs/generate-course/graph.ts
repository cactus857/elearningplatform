import { StateGraph } from "@langchain/langgraph";
import { CourseStateAnnotation } from "./state.js";
import {
  generateChaptersNode,
  generateOutlineNode,
  generateSummaryNode,
} from "./nodes.js";

export const courseGraph = new StateGraph(CourseStateAnnotation)
  .addNode("generate_outline", generateOutlineNode)
  .addNode("generate_chapters", generateChaptersNode)
  .addNode("generate_summary", generateSummaryNode)
  .addEdge("generate_outline", "generate_chapters")
  .addEdge("generate_chapters", "generate_summary")
  .addEdge("__start__", "generate_outline")
  .addEdge("generate_outline", "generate_chapters")
  .addEdge("generate_chapters", "generate_summary")
  .addEdge("generate_summary", "__end__")
  .compile();
