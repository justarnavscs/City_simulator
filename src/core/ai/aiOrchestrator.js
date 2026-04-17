import { runGeminiAnalysis } from "./geminiClient.js";
import { runLocalAnalysis } from "./localAiClient.js";

export async function generateAiBrief({ settings, analysisInput }) {
  const mode = settings.aiMode || "gemini";

  if (mode === "local") {
    return {
      provider: "local",
      result: runLocalAnalysis({ analysisInput })
    };
  }

  try {
    const result = await runGeminiAnalysis({
      apiKey: settings.geminiApiKey,
      model: settings.model || "gemini-1.5-flash",
      analysisInput
    });

    return { provider: "gemini", result };
  } catch (error) {
    return {
      provider: "local-fallback",
      fallbackReason: error.message,
      result: runLocalAnalysis({ analysisInput })
    };
  }
}
