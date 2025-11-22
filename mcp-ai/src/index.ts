import OAuthProvider from "@cloudflare/workers-oauth-provider";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import { Octokit } from "octokit";
import { z } from "zod";
import { GitHubHandler } from "./github-handler";

// Context from the auth process, encrypted & stored in the auth token
// and provided to the DurableMCP as this.props
type Props = {
  login: string;
  name: string;
  email: string;
  accessToken: string;
};

const ALLOWED_USERNAMES = new Set<string>([
  // Add GitHub usernames of users who should have access to the image generation tool
  // For example: 'yourusername', 'coworkerusername'
  "lhoangasync",
]);

export class MyMCP extends McpAgent<Env, Record<string, never>, Props> {
  server = new McpServer({
    name: "Elearning AI MCP",
    version: "1.0.0",
  });

  async init() {
    if (ALLOWED_USERNAMES.has(this.props!.login)) {
      //   this.server.tool(
      //     "generateImage",
      //     "Generate an image using the `flux-1-schnell` model. Works best with 8 steps.",
      //     {
      //       prompt: z.string().describe("A text description of the image you want to generate."),
      //       steps: z
      //         .number()
      //         .min(4)
      //         .max(8)
      //         .default(4)
      //         .describe(
      //           "The number of diffusion steps; higher values can improve quality but take longer. Must be between 4 and 8, inclusive.",
      //         ),
      //     },
      //     async ({ prompt, steps }) => {
      //       const response = await this.env.AI.run("@cf/black-forest-labs/flux-1-schnell", {
      //         prompt,
      //         steps,
      //       });
      //       return {
      //         content: [{ data: response.image!, mimeType: "image/jpeg", type: "image" }],
      //       };
      //     },
      //   );
    }
  }
}

export default new OAuthProvider({
  // NOTE - during the summer 2025, the SSE protocol was deprecated and replaced by the Streamable-HTTP protocol
  // https://developers.cloudflare.com/agents/model-context-protocol/transport/#mcp-server-with-authentication
  apiHandlers: {
    "/sse": MyMCP.serveSSE("/sse"), // deprecated SSE protocol - use /mcp instead
    "/mcp": MyMCP.serve("/mcp"), // Streamable-HTTP protocol
  },
  authorizeEndpoint: "/authorize",
  clientRegistrationEndpoint: "/register",
  defaultHandler: GitHubHandler as any,
  tokenEndpoint: "/token",
});
