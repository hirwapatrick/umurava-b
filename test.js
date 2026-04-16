import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: "AIzaSyA1o6eOss99tMJyxXECV3HnhOJ480cuyDc",
});

async function run() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "what is computer?",
  });

  console.log(response.text);
}

run();