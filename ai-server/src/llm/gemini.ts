import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { env } from "process";

export const createLLM = () => {
  return new ChatGoogleGenerativeAI({
    apiKey: env.geminiApiKey,
    model: "gemini-2.5-flash",
    temperature: 0.0,
  });
};
