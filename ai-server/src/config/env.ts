import "dotenv/config";

export const env = {
  geminiApiKey: process.env.GOOGLE_GEMINI_API_KEY || "",
};

if (!env.geminiApiKey) {
  throw new Error("GOOGLE_GEMINI_API_KEY is not set in environment variables");
}
