import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CourseStateSchema } from "./graphs/generate-course/state.js";
import { generateCourseTool } from "./tools/course-tools.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new McpServer({
  name: "Course Generation Server",
  version: "1.0.0",
});

server.registerTool(
  "generate_course",

  CourseStateSchema,
  async (args: any) => {
    const result = await generateCourseTool.execute(args);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2), // chuyển result thành text
        } as const,
      ],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Server is running...");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
