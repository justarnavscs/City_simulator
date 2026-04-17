export async function runGeminiAnalysis({ apiKey, model, analysisInput }) {
  if (!apiKey) {
    throw new Error("Gemini API key is missing.");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const prompt = `You are a city resilience expert.\nCreate a concise city action brief in JSON with keys: summary, topActions (array of 5), warnings (array), confidenceNotes (array).\nInput data: ${JSON.stringify(analysisInput)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json"
      }
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${body}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      summary: text,
      topActions: [],
      warnings: ["Gemini output was not valid JSON; raw content included in summary."],
      confidenceNotes: []
    };
  }
}
