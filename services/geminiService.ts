import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key not found. AI features will be disabled.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const polishText = async (text: string): Promise<string> => {
  const client = getClient();
  if (!client) throw new Error("API Key missing");

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Please act as a professional editor. Format the following text to be suitable for a "Zen/Minimalist" reading card. 
      
      Rules:
      1. Correct typos and basic grammar.
      2. Add proper paragraph breaks for better readability on mobile screens.
      3. Do not change the core meaning or tone of the author.
      4. If the text is very short/one line, just return it as is (maybe fix punctuation).
      5. Return ONLY the formatted text, no explanations.
      
      Text to format:
      ${text}`,
    });

    return response.text || text;
  } catch (error) {
    console.error("Error polishing text:", error);
    throw error;
  }
};

export const summarizeToTitle = async (text: string): Promise<string> => {
  const client = getClient();
  if (!client) return "未命名笔记";

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a very short, poetic, 4-6 character Chinese title for this text. Return ONLY the title. Text: ${text.substring(0, 500)}`,
    });
    return response.text?.trim() || "随笔";
  } catch (error) {
    return "随笔";
  }
};